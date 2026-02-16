
import { Component, inject, signal, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core';
import { StoreService, Song, EventTask } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Chat } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass],
  template: `
    <!-- Styles for animations -->
    <style>
       @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
       @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
       @keyframes bounceSlow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
       
       .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
       .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
       .animate-bounce-slow { animation: bounceSlow 3s infinite ease-in-out; }
    </style>

    <!-- Assistant Popup Container (Resized & Z-Index Increased) -->
    <div class="fixed bottom-0 right-0 w-full h-[55vh] md:w-[340px] md:h-[480px] md:bottom-4 md:right-4 md:rounded-2xl shadow-2xl z-[100] flex flex-col bg-slate-50 border border-slate-200 transform transition-transform duration-300 origin-bottom-right"
         [class.translate-y-[120%]]="!store.isAssistantOpen()"
         [class.translate-y-0]="store.isAssistantOpen()">
         
      <!-- Header -->
      <header class="bg-white px-3 py-2 border-b border-slate-200 shadow-sm flex items-center justify-between z-10 shrink-0 rounded-t-none md:rounded-t-2xl">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-800 tracking-tight">Worship Assistant</h2>
            <p class="text-[10px] text-slate-500 font-medium leading-none">Your personal helper</p>
          </div>
        </div>
        <div class="flex gap-0.5">
           <button (click)="isAnalyzerOpen.set(true)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Analyze Chat Dump">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
           </button>
           <button (click)="clearChat()" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Clear Chat">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
           </button>
           <button (click)="store.isAssistantOpen.set(false)" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>
      </header>

      <!-- Chat Area -->
      <div #scrollContainer class="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth bg-slate-50">
        
        <!-- Welcome State -->
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center pb-6 opacity-0 animate-fade-in" style="animation-fill-mode: forwards;">
             <div class="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 text-2xl animate-bounce-slow">
                ✨
             </div>
             <h3 class="text-sm font-bold text-slate-800 mb-1">How can I help?</h3>
             <p class="text-slate-500 max-w-[200px] text-[10px] mb-4">I can help you plan services, suggest songs, or write announcements.</p>
             
             <div class="grid grid-cols-1 gap-2 w-full px-4">
                @for (prompt of suggestedPrompts; track prompt) {
                   <button (click)="sendMessage(prompt)" class="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left group">
                      <p class="font-bold text-slate-700 text-[10px] group-hover:text-indigo-600 transition-colors">{{ prompt }}</p>
                   </button>
                }
             </div>
          </div>
        }

        <!-- Messages -->
        @for (msg of messages(); track msg.id) {
          <div class="flex gap-2 animate-slide-up" [class.flex-row-reverse]="msg.role === 'user'">
             <!-- Avatar -->
             <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1" 
               [class.bg-indigo-600]="msg.role === 'assistant'" 
               [class.text-white]="msg.role === 'assistant'"
               [class.bg-slate-200]="msg.role === 'user'"
               [class.text-slate-600]="msg.role === 'user'">
               @if (msg.role === 'assistant') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                  </svg>
               } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
               }
             </div>

             <!-- Bubble -->
             <div class="p-2.5 rounded-2xl shadow-sm text-xs md:text-sm leading-relaxed whitespace-pre-wrap max-w-[85%]"
               [class.bg-white]="msg.role === 'assistant' && !msg.isError"
               [class.text-slate-800]="msg.role === 'assistant' && !msg.isError"
               [class.rounded-tl-none]="msg.role === 'assistant'"
               [class.bg-indigo-600]="msg.role === 'user'"
               [class.text-white]="msg.role === 'user'"
               [class.rounded-tr-none]="msg.role === 'user'"
               [class.bg-red-50]="msg.isError"
               [class.text-red-700]="msg.isError"
               [class.border]="msg.isError"
               [class.border-red-100]="msg.isError">
               {{ msg.text }}
             </div>
          </div>
        }

        <!-- Loading Indicator -->
        @if (isLoading()) {
           <div class="flex gap-2">
              <div class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                 </svg>
              </div>
              <div class="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                 <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                 <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                 <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
           </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-2 pb-4 md:pb-2 bg-white border-t border-slate-200 shrink-0 md:rounded-b-2xl">
         <div class="relative">
            <textarea 
               #inputField
               [(ngModel)]="userInput" 
               (keydown.enter)="onEnter($event)"
               placeholder="Ask anything..." 
               rows="1"
               class="w-full bg-slate-100 border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition resize-none max-h-20 text-base md:text-sm shadow-inner"
               style="min-height: 40px;"
            ></textarea>
            
            <button 
               (click)="sendMessage()" 
               [disabled]="!userInput().trim() || isLoading()"
               class="absolute right-1.5 bottom-1.5 p-1.5 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition hover:scale-105 active:scale-95">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
               </svg>
            </button>
         </div>
      </div>
    </div>

    <!-- Analyzer Modal (Full Screen Overlay on top of Assistant Popup) -->
    @if (isAnalyzerOpen()) {
       <div class="absolute inset-0 bg-white z-[60] flex flex-col md:rounded-2xl">
          <div class="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 md:rounded-t-2xl">
             <div>
                <h3 class="text-sm font-bold text-slate-800">Analyze Chat</h3>
                <p class="text-[10px] text-slate-500">Paste text from WhatsApp.</p>
             </div>
             <button (click)="closeAnalyzer()" class="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>
          
          <div class="flex-1 p-3 overflow-y-auto">
             @if (!analysisResult()) {
                <textarea 
                   [(ngModel)]="rawChatInput" 
                   class="w-full h-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none font-mono" 
                   placeholder="Paste unstructured text here..."></textarea>
             } @else {
                <!-- Results Preview -->
                <div class="space-y-3">
                   <!-- Songs Found -->
                   <div>
                      <h4 class="font-bold text-slate-800 mb-1 flex items-center text-xs">
                         <span class="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full mr-2">{{ analysisResult()!.songs.length }}</span>
                         Songs
                      </h4>
                      @if (analysisResult()!.songs.length > 0) {
                         <div class="space-y-1">
                            @for (song of analysisResult()!.songs; track $index) {
                               <div class="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-[10px]">
                                  <div>
                                     <p class="font-bold text-indigo-900">{{ song.title }}</p>
                                     <p class="text-indigo-600">{{ song.key }} • {{ song.bpm }} BPM</p>
                                  </div>
                               </div>
                            }
                         </div>
                      } @else {
                         <p class="text-[10px] text-slate-400 italic">No songs detected.</p>
                      }
                   </div>

                   <!-- Tasks Found -->
                   <div>
                      <h4 class="font-bold text-slate-800 mb-1 flex items-center text-xs">
                         <span class="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full mr-2">{{ analysisResult()!.tasks.length }}</span>
                         Tasks
                      </h4>
                      @if (analysisResult()!.tasks.length > 0) {
                         <div class="space-y-1">
                            @for (task of analysisResult()!.tasks; track $index) {
                               <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100 text-[10px]">
                                  <div>
                                     <p class="font-bold text-blue-900">{{ task.title }}</p>
                                     <p class="text-blue-600">Due: {{ task.deadline }}</p>
                                  </div>
                               </div>
                            }
                         </div>
                      } @else {
                         <p class="text-[10px] text-slate-400 italic">No tasks detected.</p>
                      }
                   </div>
                </div>
             }
          </div>

          <div class="p-3 border-t border-slate-100 flex justify-end gap-2 bg-white md:rounded-b-2xl">
             @if (!analysisResult()) {
                <button (click)="closeAnalyzer()" class="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-xs">Cancel</button>
                <button (click)="analyzeChat()" [disabled]="!rawChatInput() || isAnalyzing()" class="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow disabled:opacity-50 flex items-center text-xs">
                   @if(isAnalyzing()) { Processing... } @else { ✨ Analyze }
                </button>
             } @else {
                <button (click)="analysisResult.set(null)" class="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg text-xs">Back</button>
                <button (click)="applyAnalysis()" class="px-3 py-1.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow text-xs">Import</button>
             }
          </div>
       </div>
    }
  `
})
export class AssistantComponent implements OnInit, AfterViewChecked {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  
  messages = signal<Message[]>([]);
  userInput = signal('');
  isLoading = signal(false);
  
  // Analyzer State
  isAnalyzerOpen = signal(false);
  rawChatInput = signal('');
  isAnalyzing = signal(false);
  analysisResult = signal<{songs: any[], tasks: any[]} | null>(null);
  
  chatSession: Chat | null = null;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  suggestedPrompts = [
    "Plan a worship service for Thanksgiving",
    "Suggest songs for a 'Hope' theme",
    "Draft an announcement for choir rehearsal",
    "Find a scripture about gratitude"
  ];

  ngOnInit() {
    this.initChat();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  initChat() {
    const systemInstruction = `
      You are 'Flow', the friendly and capable AI assistant for the WorshipFlow app. 
      Your goal is to help worship leaders, musicians, and admins manage their tasks.
      
      The app has these main sections you should know about:
      - **Dashboard**: Overview of events, recent chats, and tasks.
      - **The Lab (Musicians)**: Setlist management, AI song suggestions, tools like Metronome and Tuner.
      - **The Aux (Tracks)**: Backing tracks management (LoopCommunity, MultiTracks).
      - **The GC (Chat)**: Team communication.
      - **Pull Up (Rides)**: Ride-sharing for the team.
      - **The Plot (Events)**: Event planning, kanban board, uniform schedules ("Drip Check"), singing rotas ("Mic Duty").
      - **Choir Manager**: Manage members and roles.
      
      When asked to do something available in the app (like adding a song or checking a schedule), guide the user on where to go, or provide a draft they can copy.
      Keep your tone encouraging, modern, and slightly informal (using terms like 'fam', 'blessings', 'vibe' occasionally if it fits, but keep it professional enough for church leadership).
      Be concise. Use bullet points for lists.
    `;
    
    try {
      this.chatSession = this.gemini.createChatSession(systemInstruction);
    } catch (e) {
      console.error("Failed to init chat session", e);
      this.messages.update(m => [...m, {
         id: Date.now().toString(),
         role: 'assistant',
         text: "I'm having trouble connecting to my brain (API Key issue). Please check your settings.",
         timestamp: new Date(),
         isError: true
      }]);
    }
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.sendMessage();
  }

  async sendMessage(text: string | null = null) {
    const content = text || this.userInput().trim();
    if (!content || this.isLoading()) return;

    // Add User Message
    this.messages.update(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: content,
      timestamp: new Date()
    }]);
    
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      if (!this.chatSession) throw new Error("Chat session not initialized");

      // Use streaming for better UX
      const result = await this.chatSession.sendMessageStream({ message: content });
      
      let responseText = '';
      const messageId = Date.now().toString() + '_ai';
      
      // Add empty assistant message placeholder
      this.messages.update(prev => [...prev, {
         id: messageId,
         role: 'assistant',
         text: '',
         timestamp: new Date()
      }]);

      for await (const chunk of result) {
         responseText += chunk.text;
         // Update the last message with accumulated text
         this.messages.update(prev => prev.map(m => 
            m.id === messageId ? { ...m, text: responseText } : m
         ));
      }

    } catch (error) {
      console.error("Chat Error:", error);
      this.messages.update(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "Sorry, I ran into a glitch. Try asking again? 🙏",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      this.isLoading.set(false);
      // Refocus input for speed
      setTimeout(() => this.inputField?.nativeElement?.focus(), 100);
    }
  }

  clearChat() {
    this.messages.set([]);
    this.initChat(); // Reset context
  }

  // --- Analyzer Logic ---
  closeAnalyzer() {
     this.isAnalyzerOpen.set(false);
     this.rawChatInput.set('');
     this.analysisResult.set(null);
  }

  async analyzeChat() {
     if(!this.rawChatInput().trim()) return;
     this.isAnalyzing.set(true);
     const data = await this.gemini.extractWorkflowData(this.rawChatInput());
     this.analysisResult.set(data);
     this.isAnalyzing.set(false);
  }

  applyAnalysis() {
     const result = this.analysisResult();
     if(result) {
        // Add Songs
        result.songs.forEach(s => {
           this.store.addSong({
              id: Date.now().toString() + Math.random(),
              title: s.title || 'Unknown Song',
              artist: s.artist || 'Unknown',
              key: s.key || 'C',
              bpm: s.bpm || 0,
              notes: s.notes || 'Imported via Flow AI',
              category: 'Other'
           });
        });

        // Add Tasks
        result.tasks.forEach(t => {
           this.store.addTask({
              id: Date.now().toString() + Math.random(),
              title: t.title || 'Imported Task',
              deadline: t.deadline || new Date().toISOString().split('T')[0],
              status: 'todo',
              assignee: t.assignee
           });
        });

        // Feedback in main chat
        const countSongs = result.songs.length;
        const countTasks = result.tasks.length;
        
        this.messages.update(prev => [...prev, {
           id: Date.now().toString(),
           role: 'assistant',
           text: `✅ Done! I've successfully imported **${countSongs} songs** to your setlist and **${countTasks} tasks** to your event planner.`,
           timestamp: new Date()
        }]);
     }
     this.closeAnalyzer();
  }

  private scrollToBottom() {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
