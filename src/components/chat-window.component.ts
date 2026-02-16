
import { Component, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="flex h-full bg-slate-100">
      <!-- Chat List (Left Sidebar) -->
      <div class="w-80 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
           <h3 class="font-bold text-slate-700">DMs & GCs</h3>
           @if (store.integrations().whatsapp) {
             <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
               <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> WhatsApp Linked
             </span>
           }
        </div>
        <div class="overflow-y-auto flex-1">
           <div class="p-3 border-b border-slate-50 bg-blue-50 cursor-pointer border-l-4 border-l-brand-500">
             <div class="flex justify-between mb-1">
               <span class="font-semibold text-slate-800">{{ store.integrations().whatsappGroupName }}</span>
               <span class="text-xs text-slate-400">10:30 AM</span>
             </div>
             <p class="text-sm text-slate-500 truncate">Sarah: Setlist for Sunday is up.</p>
           </div>
           <div class="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition">
             <div class="flex justify-between mb-1">
               <span class="font-semibold text-slate-800">Sopranos</span>
               <span class="text-xs text-slate-400">Yesterday</span>
             </div>
             <p class="text-sm text-slate-500 truncate">Rehearsal moved to 7pm.</p>
           </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col h-full bg-[#efeae2]" style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 20px 20px;">
        <!-- Header -->
        <div class="bg-white p-4 border-b border-slate-200 shadow-sm flex items-center justify-between sticky top-0 z-10">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold mr-3 shrink-0">WT</div>
            <div class="hidden sm:block">
               <h3 class="font-bold text-slate-800">{{ store.integrations().whatsappGroupName }}</h3>
               <p class="text-xs text-slate-500">Includes WhatsApp history (180 days)</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             <!-- Search Bar -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Stalk history..." 
                class="bg-slate-100 text-sm rounded-full pl-9 pr-4 py-2 w-32 focus:w-48 sm:w-48 sm:focus:w-64 focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all duration-300 border border-transparent focus:bg-white focus:border-brand-200"
              >
            </div>

            <button class="text-slate-400 hover:text-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          @for (msg of filteredMessages(); track msg.id) {
            <div [class]="msg.isMe ? 'flex justify-end' : 'flex justify-start'">
              <div [class]="msg.isMe ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'" class="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm relative border border-black/5">
                @if (!msg.isMe) {
                  <p class="text-xs font-bold text-orange-800 mb-1 cursor-pointer hover:underline">{{msg.sender}}</p>
                }
                <p class="leading-relaxed whitespace-pre-wrap">{{msg.text}}</p>
                <div class="flex justify-end items-center mt-1 gap-1 select-none">
                  <span class="text-[10px] text-slate-400">{{msg.timestamp | date:'shortTime'}}</span>
                  @if (msg.isMe) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  }
                  @if (msg.platform === 'whatsapp') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                       <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  }
                </div>
              </div>
            </div>
          }
          
          @if (filteredMessages().length === 0 && searchQuery()) {
            <div class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p>Ghost town for "{{searchQuery()}}"</p>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="bg-white p-3 border-t border-slate-200 flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="newMessage" 
            (keyup.enter)="sendMessage()"
            placeholder="Spill the tea..." 
            class="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
          >
          <button (click)="sendMessage()" [disabled]="!newMessage().trim()" class="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition shadow-sm flex items-center justify-center w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform rotate-90 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatWindowComponent {
  store = inject(StoreService);
  newMessage = signal('');
  searchQuery = signal('');
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // Real-time scroll effect
    effect(() => {
      // Track messages length to trigger effect
      const count = this.store.messages().length;
      if (count > 0) {
        // Use timeout to allow DOM to update before scrolling
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  filteredMessages = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.store.messages();
    }
    return this.store.messages().filter(msg => 
      msg.text.toLowerCase().includes(query) || 
      msg.sender.toLowerCase().includes(query)
    );
  });

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;
    
    // Add My Message
    this.store.addMessage({
      id: Date.now().toString(),
      sender: 'Me',
      text: text,
      timestamp: new Date(),
      isMe: true,
      platform: 'internal'
    });
    
    this.newMessage.set('');
    
    // Simulate Reply for Real-time feel if specific keywords are used
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hey')) {
       setTimeout(() => {
          this.store.addMessage({
             id: Date.now().toString() + '_reply',
             sender: 'Sarah (Worship Ldr)',
             text: 'Hey! What\'s good?',
             timestamp: new Date(),
             isMe: false,
             platform: 'internal'
          });
       }, 2000);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { 
        console.error('Scroll error', err);
    }
  }
}
