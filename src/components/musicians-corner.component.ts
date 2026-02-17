
import { Component, inject, signal, computed, OnInit, OnDestroy, effect, ViewChild, ElementRef } from '@angular/core';
import { StoreService, Song } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgStyle, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';

// --- Types ---
interface StemTrack {
  id: string;
  name: string;
  color: string; // Tailwind color class for bg
  accentColor: string; // Hex for glow/border
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
  isPlaying: boolean;
  waveformData: number[]; // For visualizer
}

interface ChordEvent {
  time: number;
  chord: string;
  duration: number;
  originalChord?: string; // To track base for transposing
}

interface LyricEvent {
  time: number;
  text: string;
}

interface SequencerRow {
  name: string;
  color: string;
  steps: boolean[];
}

@Component({
  selector: 'app-musicians-corner',
  imports: [FormsModule, DatePipe, NgClass, NgStyle, DecimalPipe],
  template: `
    <div class="h-full flex flex-col bg-slate-950 text-slate-200 font-sans relative overflow-hidden transition-colors duration-500 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      <!-- Top Navigation / Transport Bar -->
      <div class="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30 shadow-2xl">
        <div class="flex items-center gap-4">
           @if (isStudioMode()) {
             <button (click)="exitStudio()" class="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
           }
           <div>
             <h1 class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 text-xl tracking-tight">
               Studio <span class="hidden md:inline font-mono text-xs text-slate-500 ml-2 tracking-widest uppercase">The Lab</span>
             </h1>
           </div>
        </div>

        @if (isStudioMode()) {
          <div class="flex items-center gap-6">
             <!-- Global Transport -->
             <div class="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                <button (click)="stopAll()" class="p-2 hover:text-white text-slate-400 transition" title="Stop">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                </button>
                <button (click)="toggleGlobalPlay()" 
                   [class.shadow-[0_0_15px_rgba(6,182,212,0.4)]]="isPlaying()"
                   class="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full flex items-center justify-center transition transform active:scale-95">
                   @if (isPlaying()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" /></svg>
                   } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                   }
                </button>
                <div class="px-3 text-xs font-mono text-cyan-400 min-w-[50px] text-center">
                   {{ formatTime(playbackTime) }}
                </div>
             </div>

             <!-- Tuner Toggle (Header) -->
             <button (click)="toggleTuner()" [class.bg-slate-800]="!isTunerOpen()" [class.bg-cyan-600]="isTunerOpen()" [class.text-white]="isTunerOpen()" class="p-2 rounded-lg text-slate-400 hover:text-white transition relative" title="Toggle Tuner">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                @if(isTunerOpen()) { <span class="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping"></span> }
             </button>
          </div>
        }
      </div>

      <!-- TUNER OVERLAY -->
      @if (isTunerOpen()) {
         <div class="absolute top-20 right-6 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div class="flex justify-between items-center mb-4">
               <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Chromatic Tuner</h3>
               <button (click)="toggleTuner()" class="text-slate-500 hover:text-white">✕</button>
            </div>
            
            @if (tunerError()) {
               <div class="text-center py-4">
                  <div class="text-red-500 text-3xl mb-2">🎤🚫</div>
                  <p class="text-xs text-red-300 font-medium">{{ tunerError() }}</p>
                  <button (click)="startTuner()" class="mt-3 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-700">Retry Permission</button>
               </div>
            } @else {
               <div class="flex flex-col items-center justify-center py-2">
                  <div class="text-5xl font-black text-white mb-1 transition-colors duration-200 min-h-[60px] flex items-center" [class.text-green-400]="isInTune()">
                     {{ tunerNote() }}
                  </div>
                  <div class="text-xs font-mono text-slate-500 mb-4">{{ tunerFrequency() | number:'1.1-1' }} Hz</div>
                  
                  <!-- Gauge -->
                  <div class="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                     <div class="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-100 ease-linear left-1/2 -translate-x-1/2 z-10"></div>
                     <!-- Needle -->
                     <div class="absolute top-0 bottom-0 w-2 h-4 bg-cyan-500 rounded-full transition-all duration-75 ease-out"
                          [style.left.%]="50 + (tunerCents() / 50) * 50"
                          [style.transform]="'translateX(-50%)'"
                          [class.bg-green-500]="isInTune()"
                          [class.shadow-[0_0_15px_#22c55e]]="isInTune()">
                     </div>
                  </div>
                  <div class="flex justify-between w-full text-[8px] text-slate-500 mt-1 px-1 font-mono">
                     <span>-50</span>
                     <span>0</span>
                     <span>+50</span>
                  </div>
               </div>
            }
         </div>
      }

      @if (!isStudioMode()) {
        <!-- LANDING / PROJECT SELECTION VIEW -->
        <div class="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
           <div class="max-w-5xl w-full">
              <div class="text-center py-12">
                 <div class="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                 </div>
                 <h2 class="text-4xl font-bold text-white mb-4">The Lab</h2>
                 <p class="text-slate-400 max-w-lg mx-auto mb-8">
                    All-in-one production suite. Import audio to separate stems, detect chords, and remix with the built-in sequencer.
                 </p>
                 <button (click)="openStudioMode()" class="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Enter Studio
                 </button>
              </div>

              <!-- Quick Load Projects (Setlist) -->
              <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Recent Projects (From Setlist)</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 @for (song of store.currentSetlist(); track song.id) {
                    <div (click)="loadSongInStudio(song)" class="bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800 transition group relative overflow-hidden">
                       <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                       <h4 class="font-bold text-white group-hover:text-cyan-400 transition">{{ song.title }}</h4>
                       <p class="text-sm text-slate-500">{{ song.artist }}</p>
                       <div class="mt-3 flex items-center gap-2 text-xs font-mono text-slate-600">
                          <span class="bg-slate-950 px-2 py-1 rounded">{{ song.bpm }} BPM</span>
                          <span class="bg-slate-950 px-2 py-1 rounded">Key: {{ song.key }}</span>
                       </div>
                    </div>
                 }
              </div>
           </div>
        </div>
      } @else {
        <!-- MAIN STUDIO VIEW (Single Page Flow) -->
        <div class="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
           <div class="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
              
              <!-- 1. IMPORT SECTION -->
              <section class="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                 <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-violet-600"></div>
                 
                 <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 text-sm font-mono border border-slate-700">01</span>
                    Source Audio
                 </h2>

                 <div class="grid md:grid-cols-2 gap-6">
                    <!-- URL Input -->
                    <div class="space-y-2">
                       <label class="text-xs font-bold text-slate-500 uppercase ml-1">YouTube / Audio URL</label>
                       <div class="relative group/input">
                          <input type="text" [(ngModel)]="studioUrlInput" placeholder="https://youtube.com/watch?v=..." 
                             class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner">
                          @if (studioUrlInput()) {
                             <button (click)="studioUrlInput.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
                          }
                       </div>
                    </div>

                    <!-- File Drop -->
                    <div class="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-950/30 flex flex-col items-center justify-center p-4 cursor-pointer transition relative overflow-hidden"
                         (dragover)="$event.preventDefault()" (drop)="handleDrop($event)">
                       <input type="file" (change)="handleFileSelect($event)" class="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                       <span class="text-sm font-bold text-slate-400">Drop Audio File</span>
                       <span class="text-[10px] text-slate-600">MP3, WAV, OGG (Max 100MB)</span>
                    </div>
                 </div>

                 <div class="mt-6">
                    <button (click)="analyzeDeeply()" [disabled]="isProcessing() || (!studioUrlInput() && !uploadedFile)" 
                       class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                       @if (isProcessing()) {
                          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Analyzing & Separating...
                       } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          Analyze & Separate Stems
                       }
                    </button>
                 </div>
              </section>

              <!-- 2. MIXER SECTION -->
              @if (stems().length > 0) {
                 <section class="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
                    <div class="flex justify-between items-end">
                       <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                          <span class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-violet-400 text-sm font-mono border border-slate-700">02</span>
                          Stem Mixer
                       </h2>
                       <button (click)="regenerateStems()" class="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Regenerate
                       </button>
                    </div>

                    <div class="grid gap-3">
                       @for (stem of stems(); track stem.id) {
                          <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-4 hover:border-slate-700 transition group shadow-sm relative overflow-hidden">
                             <!-- Glowing Border on Active -->
                             <div class="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300" 
                                  [style.background-color]="stem.isMuted ? '#475569' : stem.accentColor"
                                  [class.shadow-[0_0_15px_currentColor]]="stem.isPlaying && !stem.isMuted"></div>

                             <!-- Controls -->
                             <div class="flex flex-col gap-2 shrink-0 w-20">
                                <span class="text-xs font-bold uppercase tracking-wider truncate" [style.color]="stem.isMuted ? '#64748b' : stem.accentColor">{{ stem.name }}</span>
                                <div class="flex gap-1">
                                   <button (click)="toggleMute(stem.id)" [class.bg-red-500]="stem.isMuted" [class.text-white]="stem.isMuted" class="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 hover:bg-slate-700 transition">M</button>
                                   <button (click)="toggleSolo(stem.id)" [class.bg-yellow-500]="stem.isSolo" [class.text-black]="stem.isSolo" class="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 hover:bg-slate-700 transition">S</button>
                                </div>
                             </div>

                             <!-- Waveform Visualizer -->
                             <div class="flex-1 h-12 bg-slate-950 rounded relative overflow-hidden flex items-center gap-0.5 px-1">
                                @if (stem.isMuted) { <div class="absolute inset-0 bg-slate-900/80 z-10 backdrop-blur-[1px]"></div> }
                                @for (bar of stem.waveformData; track $index) {
                                   <div class="flex-1 rounded-full transition-all duration-200"
                                      [style.background-color]="stem.isMuted ? '#334155' : stem.accentColor"
                                      [style.height.%]="stem.isPlaying && !stem.isMuted ? (bar * 100 * (Math.random() * 0.5 + 0.5)) : (bar * 100)"
                                      [style.opacity]="stem.isMuted ? 0.3 : 0.8">
                                   </div>
                                }
                                <!-- Playhead -->
                                <div class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_white] z-20 transition-all duration-100 ease-linear"
                                     [style.left.%]="(playbackTime / 30) * 100"></div>
                             </div>

                             <!-- Individual Transport & Volume -->
                             <div class="flex items-center gap-3 w-32 shrink-0">
                                <button (click)="toggleStemPlay(stem.id)" class="text-slate-400 hover:text-white transition">
                                   @if(stem.isPlaying && !stem.isMuted && isPlaying()) {
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" /></svg>
                                   } @else {
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                   }
                                </button>
                                <input type="range" 
                                       [ngModel]="stem.volume" 
                                       (ngModelChange)="updateVolume(stem.id, $event)"
                                       min="0" max="100" 
                                       class="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full">
                             </div>
                          </div>
                       }
                    </div>
                 </section>
              }

              <!-- 3. CHORD LEARNER SECTION -->
              @if (chordData().chords.length > 0) {
                 <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-8 duration-700 delay-100 flex flex-col md:flex-row gap-8">
                    
                    <!-- Left: Controls & Current Chord -->
                    <div class="flex-1 flex flex-col">
                       <div class="flex justify-between items-start mb-6">
                          <div>
                             <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                                <span class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 text-sm font-mono border border-slate-700">03</span>
                                Chord Learner
                             </h2>
                             <p class="text-slate-500 text-sm ml-10">Detected Key: <span class="text-cyan-400 font-bold">{{ chordData().key }}</span></p>
                          </div>
                          
                          <button (click)="isEditingChords.set(!isEditingChords())" [class.text-cyan-400]="isEditingChords()" class="text-slate-500 hover:text-white transition">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                          </button>
                       </div>

                       <!-- Tools -->
                       <div class="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 mb-6 self-start">
                          <!-- Transpose -->
                          <div class="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                             <button (click)="transpose(-1)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 font-bold hover:text-cyan-400 transition">-</button>
                             <div class="w-16 text-center">
                                <span class="block text-[10px] text-slate-500 uppercase font-bold">Trans</span>
                                <span class="block font-bold text-white">{{ transposeStep > 0 ? '+' + transposeStep : transposeStep }}</span>
                             </div>
                             <button (click)="transpose(1)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded text-slate-300 font-bold hover:text-cyan-400 transition">+</button>
                          </div>
                          
                          <div class="w-px h-8 bg-slate-800"></div>

                          <!-- Instrument -->
                          <select [(ngModel)]="preferredInstrument" class="bg-slate-900 text-xs text-white border-none rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-cyan-500 cursor-pointer">
                             <option value="Guitar">Guitar</option>
                             <option value="Piano">Piano</option>
                             <option value="Ukulele">Ukulele</option>
                          </select>

                          <div class="w-px h-8 bg-slate-800"></div>

                          <!-- Tuner Button in Tools Area -->
                          <button (click)="toggleTuner()" [class.text-cyan-400]="isTunerOpen()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold transition border border-transparent hover:border-slate-700">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                             </svg>
                             Tuner
                          </button>
                       </div>

                       <!-- BIG CURRENT CHORD CARD -->
                       <div class="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                          <div class="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent"></div>
                          
                          @if (getCurrentChord(); as current) {
                             <span class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Current Chord</span>
                             <div class="text-7xl font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 transform scale-100">
                                {{ current.chord }}
                             </div>
                             
                             <!-- Visual Chord Diagram Generator -->
                             <div class="w-32 h-32 opacity-80">
                                <div [innerHTML]="renderChordDiagram(current.chord)"></div>
                             </div>
                             
                             @if (getNextChord(); as next) {
                                <div class="mt-6 flex items-center gap-2 text-slate-500 text-sm">
                                   <span>Next:</span>
                                   <span class="font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">{{ next.chord }}</span>
                                </div>
                             }
                          } @else {
                             <span class="text-slate-600">Waiting for chords...</span>
                          }
                       </div>
                    </div>

                    <!-- Right: Scrolling Lyrics & Chords Timeline -->
                    <div class="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[400px] relative">
                       <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none"></div>
                       <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none"></div>
                       
                       <!-- Header -->
                       <div class="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950 z-20">
                          <span class="text-xs font-bold text-slate-500 uppercase">Live Lyrics</span>
                          @if(isEditingChords()) {
                             <button (click)="saveEditedChords()" class="text-xs bg-green-600 text-white px-3 py-1 rounded font-bold hover:bg-green-500 transition">Save Changes</button>
                          }
                       </div>

                       <!-- Scroll Container -->
                       <div class="flex-1 overflow-y-auto p-6 relative scroll-smooth space-y-8" #lyricsContainer>
                          @for (lyricLine of chordData().lyrics; track $index) {
                             <div class="relative pl-4 border-l-2 transition-all duration-300 group"
                                  [class.border-cyan-500]="isCurrentLyricTime(lyricLine.time)"
                                  [class.border-slate-800]="!isCurrentLyricTime(lyricLine.time)"
                                  [class.opacity-40]="!isCurrentLyricTime(lyricLine.time) && !isEditingChords()"
                                  [class.opacity-100]="isCurrentLyricTime(lyricLine.time) || isEditingChords()">
                                
                                <!-- Chords Row -->
                                <div class="flex gap-4 mb-1 h-6 items-end">
                                   @for (chord of getChordsForLine(lyricLine.time); track $index) {
                                      @if (isEditingChords()) {
                                         <input [(ngModel)]="chord.chord" class="bg-slate-800 text-cyan-400 font-bold text-sm w-12 text-center rounded border border-slate-700 focus:border-cyan-500 focus:outline-none px-1">
                                      } @else {
                                         <span class="text-cyan-400 font-bold text-sm bg-slate-900/50 px-1.5 rounded cursor-pointer hover:bg-slate-800 transition"
                                               (click)="jumpToTime(chord.time)">
                                            {{ chord.chord }}
                                         </span>
                                      }
                                   }
                                </div>

                                <!-- Lyrics Row -->
                                @if (isEditingChords()) {
                                   <input [(ngModel)]="lyricLine.text" class="w-full bg-transparent text-lg text-white border-b border-dashed border-slate-700 focus:border-cyan-500 focus:outline-none pb-1">
                                } @else {
                                   <p class="text-lg text-slate-200 font-medium leading-relaxed">{{ lyricLine.text }}</p>
                                }
                             </div>
                          }
                          <!-- Padding for bottom scrolling -->
                          <div class="h-32"></div>
                       </div>
                    </div>
                 </section>
              }

              <!-- 4. SEQUENCER -->
              @if (stems().length > 0) {
                 <section class="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div class="flex justify-between items-end">
                       <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                          <span class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-fuchsia-400 text-sm font-mono border border-slate-700">04</span>
                          Beat Sequencer
                       </h2>
                       <div class="flex items-center bg-slate-900 rounded-lg p-1 px-3 border border-slate-800">
                          <span class="text-xs font-bold text-slate-500 mr-2">BPM</span>
                          <input type="number" [(ngModel)]="chordData().bpm" class="bg-transparent w-12 text-center text-white font-bold border-none p-0 focus:ring-0">
                       </div>
                    </div>

                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto custom-scrollbar">
                       <div class="min-w-[800px]">
                          <!-- Header -->
                          <div class="grid grid-cols-[100px_repeat(16,1fr)] gap-1 mb-2">
                             <div class="text-[10px] font-bold text-slate-500 uppercase flex items-end pb-1">Track</div>
                             @for (step of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]; track step) {
                                <div class="text-center text-[10px] pb-1 font-mono transition-colors" 
                                     [class.text-cyan-400]="activeBeatStep() === step - 1"
                                     [class.text-slate-600]="activeBeatStep() !== step - 1">
                                   {{ step }}
                                </div>
                             }
                          </div>

                          <!-- Rows -->
                          @for (row of sequencerGrid(); track row.name; let r = $index) {
                             <div class="grid grid-cols-[100px_repeat(16,1fr)] gap-1 mb-1 items-center group">
                                <div class="text-xs font-bold text-slate-400 group-hover:text-white transition">{{ row.name }}</div>
                                @for (step of row.steps; track $index; let c = $index) {
                                   <div (click)="toggleStep(r, c)"
                                        class="h-8 rounded-sm cursor-pointer transition-all duration-100 relative"
                                        [class.bg-slate-800]="!step"
                                        [class.hover:bg-slate-700]="!step"
                                        [class.border-l-2]="c % 4 === 0 && !step"
                                        [class.border-l-slate-700]="c % 4 === 0 && !step"
                                        [style.background-color]="step ? row.color : ''"
                                        [style.box-shadow]="step ? '0 0 10px ' + row.color : 'none'">
                                        
                                        <!-- Playhead indicator overlay -->
                                        @if (activeBeatStep() === c) {
                                           <div class="absolute inset-0 bg-white/20 pointer-events-none"></div>
                                        }
                                   </div>
                                }
                             </div>
                          }
                       </div>
                    </div>
                 </section>
              }

           </div>
        </div>
      }
    </div>
  `
})
export class MusiciansCornerComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  
  Math = Math; // For template math

  // Modes
  isStudioMode = signal(false);
  isAddingSong = signal(false);
  isEditingChords = signal(false);
  
  // Tuner State
  isTunerOpen = signal(false);
  tunerError = signal<string | null>(null);
  tunerNote = signal('--');
  tunerFrequency = signal(0);
  tunerCents = signal(0); // -50 to +50
  
  // Inputs
  studioUrlInput = signal('');
  uploadedFile: File | null = null;
  isProcessing = signal(false);

  // Core Data
  stems = signal<StemTrack[]>([]);
  
  chordData = signal<{ key: string, bpm: number, chords: ChordEvent[], lyrics: LyricEvent[] }>({
     key: 'C',
     bpm: 120,
     chords: [],
     lyrics: []
  });

  // Transport State
  isPlaying = signal(false);
  playbackTime = 0; // seconds
  playbackInterval: any;
  activeBeatStep = signal(0); // 0-15
  
  // Tools State
  transposeStep = 0;
  preferredInstrument = 'Guitar';
  
  // Audio Context Refs
  private audioCtx: AudioContext | null = null;
  private audioSources: Map<string, AudioBufferSourceNode> = new Map();
  private audioGains: Map<string, GainNode> = new Map();
  private stemBuffers: Map<string, AudioBuffer> = new Map();
  private masterGain: GainNode | null = null;
  
  // Tuner Refs
  private tunerCtx: AudioContext | null = null;
  private tunerAnalyser: AnalyserNode | null = null;
  private tunerStream: MediaStream | null = null;
  private tunerRafId: number | null = null;

  @ViewChild('lyricsContainer') private lyricsContainer!: ElementRef;
  
  // Sequencer Data
  sequencerGrid = signal<SequencerRow[]>([
     { name: 'Kick', color: '#ef4444', steps: Array(16).fill(false) }, // Red
     { name: 'Snare', color: '#eab308', steps: Array(16).fill(false) }, // Yellow
     { name: 'Hi-Hat', color: '#06b6d4', steps: Array(16).fill(false) }, // Cyan
     { name: 'Clap', color: '#d946ef', steps: Array(16).fill(false) },   // Fuchsia
  ]);

  ngOnInit() {
     // Init default sequencer pattern
     this.sequencerGrid.update(g => {
        const n = [...g];
        n[0].steps = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
        n[2].steps = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
        return n;
     });
  }

  ngOnDestroy() {
     this.stopAll();
     this.stopTuner();
     if (this.audioCtx) {
        this.audioCtx.close();
     }
  }

  openStudioMode() {
     this.isStudioMode.set(true);
     this.initAudioContext();
  }

  exitStudio() {
     this.stopAll();
     this.stopTuner();
     this.isStudioMode.set(false);
  }

  loadSongInStudio(song: Song) {
     this.studioUrlInput.set(song.url || '');
     this.isStudioMode.set(true);
     this.initAudioContext();
     if (song.url) this.analyzeDeeply();
  }

  // --- Audio Engine ---
  private initAudioContext() {
     if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.connect(this.audioCtx.destination);
     }
  }

  private async generateMockStemBuffers() {
     if (!this.audioCtx) return;
     const duration = 30; // 30 seconds loop
     const sr = this.audioCtx.sampleRate;
     
     // 1. Drums (Noise bursts)
     const drumBuffer = this.audioCtx.createBuffer(1, sr * duration, sr);
     const dData = drumBuffer.getChannelData(0);
     for (let i = 0; i < sr * duration; i++) {
        // Simple beat every 0.5s
        if (i % (sr / 2) < 2000) dData[i] = (Math.random() * 2 - 1) * 0.8;
     }
     this.stemBuffers.set('drums', drumBuffer);

     // 2. Bass (Sine Wave Low)
     const bassBuffer = this.audioCtx.createBuffer(1, sr * duration, sr);
     const bData = bassBuffer.getChannelData(0);
     for (let i = 0; i < sr * duration; i++) {
        bData[i] = Math.sin(i * 0.01) * 0.6; // Low freq sine
     }
     this.stemBuffers.set('bass', bassBuffer);

     // 3. Vocals (Sine Wave High - Melody)
     const voxBuffer = this.audioCtx.createBuffer(1, sr * duration, sr);
     const vData = voxBuffer.getChannelData(0);
     for (let i = 0; i < sr * duration; i++) {
        vData[i] = Math.sin(i * 0.05 + Math.sin(i * 0.001)*10) * 0.5; // FM-ish
     }
     this.stemBuffers.set('vocals', voxBuffer);

     // 4. Other (Random Tones)
     const otherBuffer = this.audioCtx.createBuffer(1, sr * duration, sr);
     const oData = otherBuffer.getChannelData(0);
     for (let i = 0; i < sr * duration; i++) {
        oData[i] = (Math.random() * 0.1) * Math.sin(i * 0.02);
     }
     this.stemBuffers.set('other', otherBuffer);
  }

  private startAudioEngine() {
     if (!this.audioCtx || !this.masterGain) return;
     
     // Resume context if suspended (browser policy)
     if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
     }

     // Stop existing sources
     this.audioSources.forEach(s => s.stop());
     this.audioSources.clear();
     this.audioGains.clear();

     const currentStems = this.stems();
     
     currentStems.forEach(stem => {
        const buffer = this.stemBuffers.get(stem.id);
        if (buffer) {
           const source = this.audioCtx!.createBufferSource();
           source.buffer = buffer;
           source.loop = true;
           
           const gain = this.audioCtx!.createGain();
           
           // Calculate effective volume based on mute/solo logic
           this.applyGain(gain, stem);

           source.connect(gain);
           gain.connect(this.masterGain!);
           
           source.start(0, this.playbackTime); // Sync start
           
           this.audioSources.set(stem.id, source);
           this.audioGains.set(stem.id, gain);
        }
     });
  }

  private applyGain(gainNode: GainNode, stem: StemTrack) {
     // If muted, 0. If solo is active globally and this isn't soloed, 0. Else volume.
     const anySolo = this.stems().some(s => s.isSolo);
     
     if (stem.isMuted) {
        gainNode.gain.value = 0;
     } else if (anySolo && !stem.isSolo) {
        gainNode.gain.value = 0;
     } else {
        gainNode.gain.value = stem.volume / 100;
     }
  }

  // --- Import & Analysis ---
  
  handleFileSelect(event: any) {
     const file = event.target.files[0];
     if (file) {
        this.uploadedFile = file;
        this.studioUrlInput.set(file.name); 
     }
  }

  handleDrop(event: DragEvent) {
     event.preventDefault();
     if (event.dataTransfer?.files[0]) {
        this.uploadedFile = event.dataTransfer.files[0];
        this.studioUrlInput.set(this.uploadedFile.name);
     }
  }

  async analyzeDeeply() {
     this.isProcessing.set(true);
     this.stems.set([]); 
     this.chordData.update(d => ({ ...d, chords: [] }));
     
     // Initialize Audio Context on user interaction
     this.initAudioContext();

     // Generate Synthetic Audio Buffers since we don't have a backend
     await this.generateMockStemBuffers();

     // Simulate Network Delay
     await new Promise(resolve => setTimeout(resolve, 2000));

     const data = await this.gemini.analyzeSongDeeply({ type: 'url', data: this.studioUrlInput() });

     this.stems.set([
        { id: 'vocals', name: 'Vocals', color: 'bg-yellow-500', accentColor: '#eab308', isMuted: false, isSolo: false, volume: 80, isPlaying: true, waveformData: this.genWaveform() },
        { id: 'drums', name: 'Drums', color: 'bg-red-500', accentColor: '#ef4444', isMuted: false, isSolo: false, volume: 90, isPlaying: true, waveformData: this.genWaveform() },
        { id: 'bass', name: 'Bass', color: 'bg-blue-500', accentColor: '#3b82f6', isMuted: false, isSolo: false, volume: 75, isPlaying: true, waveformData: this.genWaveform() },
        { id: 'other', name: 'Other', color: 'bg-green-500', accentColor: '#22c55e', isMuted: false, isSolo: false, volume: 60, isPlaying: true, waveformData: this.genWaveform() },
     ]);

     const chordsWithOriginals = (data.chords || []).map((c: any) => ({
        ...c,
        originalChord: c.chord
     }));

     this.chordData.set({
        key: data.key || 'C',
        bpm: data.bpm || 120,
        chords: chordsWithOriginals,
        lyrics: data.lyrics || []
     });

     this.isProcessing.set(false);
  }

  regenerateStems() {
     this.isProcessing.set(true);
     setTimeout(async () => {
        await this.generateMockStemBuffers();
        this.stems.update(s => s.map(stem => ({ ...stem, waveformData: this.genWaveform() })));
        this.isProcessing.set(false);
     }, 1500);
  }

  // --- Transport & Playback ---

  toggleGlobalPlay() {
     if (this.isPlaying()) this.stopAll();
     else this.playAll();
  }

  playAll() {
     this.isPlaying.set(true);
     this.startAudioEngine(); // Start Web Audio
     this.startTimer();       // Start UI Sync
  }

  stopAll() {
     this.isPlaying.set(false);
     clearInterval(this.playbackInterval);
     
     // Stop Web Audio
     this.audioSources.forEach(s => {
        try { s.stop(); } catch(e) {}
     });
     this.audioSources.clear();
  }

  toggleStemPlay(id: string) {
     // If nothing is playing, start everything
     if (!this.isPlaying()) {
        this.playAll();
        // Solo this track implicitly if stopped? 
        // Or just ensure it's not muted.
        this.stems.update(s => s.map(stem => {
           if (stem.id === id) return { ...stem, isMuted: false };
           return stem;
        }));
     } else {
        // Toggle Mute logic for "Pause" effect on single stem
        this.toggleMute(id);
     }
     this.updateAudioState();
  }

  startTimer() {
     clearInterval(this.playbackInterval);
     const bpm = this.chordData().bpm || 120;
     // Update UI roughly every 16th note, but audio timing is handled by Web Audio API
     const stepTime = (60 / bpm) * 1000 / 4; 

     this.playbackInterval = setInterval(() => {
        // Sync UI time with Audio Context time for precision
        if (this.audioCtx) {
           // We cheat a bit here for looping demo: wrap time around 30s
           // In real app, you'd calculate offset from start time
           this.playbackTime = (this.playbackTime + (stepTime / 1000));
           if (this.playbackTime > 30) this.playbackTime = 0; 
        }
        
        this.activeBeatStep.update(s => (s + 1) % 16);
        this.scrollLyricsToCurrent();
     }, stepTime);
  }

  jumpToTime(time: number) {
     this.playbackTime = time;
     if (this.isPlaying()) {
        // Restart audio from new position
        this.startAudioEngine();
     }
  }

  private scrollLyricsToCurrent() {
     if (!this.lyricsContainer) return;
     // Simple auto-scroll based on percentage of 30s loop
     // Ideally this finds the active DOM element
     const el = this.lyricsContainer.nativeElement;
     const scrollHeight = el.scrollHeight;
     const target = (this.playbackTime / 30) * scrollHeight;
     // Smooth catch up
     el.scrollTo({ top: target - 100, behavior: 'smooth' });
  }

  // --- Stem Logic (Updates Audio Graph Live) ---
  
  toggleMute(id: string) {
     this.stems.update(s => s.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t));
     this.updateAudioState();
  }

  toggleSolo(id: string) {
     this.stems.update(s => {
        const target = s.find(t => t.id === id);
        if (!target) return s;
        const newSolo = !target.isSolo;
        
        return s.map(t => {
           if (t.id === id) {
              return { ...t, isSolo: newSolo, isMuted: false };
           } else {
              return { ...t, isMuted: newSolo, isSolo: false }; 
           }
        });
     });
     this.updateAudioState();
  }

  updateVolume(id: string, newVol: number) {
     this.stems.update(s => s.map(t => t.id === id ? { ...t, volume: newVol } : t));
     this.updateAudioState();
  }

  private updateAudioState() {
     // Apply gain changes to running nodes without restarting
     this.stems().forEach(stem => {
        const gainNode = this.audioGains.get(stem.id);
        if (gainNode) {
           this.applyGain(gainNode, stem);
        }
     });
  }

  // --- Music Theory Logic (Transpose & Chords) ---
  transpose(delta: number) {
     const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
     this.transposeStep += delta;
     
     this.chordData.update(data => {
        const newChords = data.chords.map(c => {
           const rootRegex = /^([A-G][#b]?)(.*)$/;
           const match = (c.originalChord || c.chord).match(rootRegex);
           
           if (match) {
              let [_, root, suffix] = match;
              if (root.endsWith('b')) {
                 const flatMap: any = {'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#'};
                 root = flatMap[root] || root;
              }
              let idx = NOTES.indexOf(root);
              if (idx !== -1) {
                 let newIdx = (idx + this.transposeStep) % 12;
                 if (newIdx < 0) newIdx += 12;
                 return { ...c, chord: NOTES[newIdx] + suffix };
              }
           }
           return c;
        });
        return { ...data, chords: newChords };
     });
  }

  getCurrentChord() {
     const t = this.playbackTime;
     const chords = this.chordData().chords;
     // Find the chord that started most recently
     return chords.filter(c => c.time <= t).sort((a,b) => b.time - a.time)[0] || null;
  }

  getNextChord() {
     const t = this.playbackTime;
     const chords = this.chordData().chords;
     return chords.find(c => c.time > t) || null;
  }

  getChordsForLine(lineTime: number): ChordEvent[] {
     // Get chords that happen within a 4-second window of this line
     const chords = this.chordData().chords;
     return chords.filter(c => c.time >= lineTime && c.time < lineTime + 4);
  }

  isCurrentLyricTime(time: number): boolean {
     return this.playbackTime >= time && this.playbackTime < time + 4;
  }

  saveEditedChords() {
     this.isEditingChords.set(false);
     // In a real app, this would sync back to DB or local storage
  }

  renderChordDiagram(chordName: string): SafeHtml {
     // Simple SVG generator based on hashing the chord name to create consistent "patterns"
     // In a production app, use VexFlow or pre-rendered SVGs
     const cleanName = chordName.replace('#', 's').replace('/', '_');
     const seed = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     
     // Determine number of strings based on instrument
     const strings = this.preferredInstrument === 'Ukulele' ? 4 : 6;
     const frets = 4;
     const width = 100;
     const height = 120;
     const stringSpacing = width / (strings - 1);
     const fretSpacing = height / frets;

     let svg = `<svg viewBox="0 0 ${width + 20} ${height + 20}" xmlns="http://www.w3.org/2000/svg">`;
     
     // Nut
     svg += `<line x1="10" y1="10" x2="${width+10}" y2="10" stroke="white" stroke-width="4" />`;

     // Strings
     for (let i = 0; i < strings; i++) {
        svg += `<line x1="${10 + i * stringSpacing}" y1="10" x2="${10 + i * stringSpacing}" y2="${height+10}" stroke="#94a3b8" stroke-width="1" />`;
     }

     // Frets
     for (let i = 1; i <= frets; i++) {
        svg += `<line x1="10" y1="${10 + i * fretSpacing}" x2="${width+10}" y2="${10 + i * fretSpacing}" stroke="#475569" stroke-width="1" />`;
     }

     // Dots (Pseudo-random based on chord name for demo)
     // Generate 2-3 dots
     const numDots = (seed % 3) + 2; 
     for (let k = 0; k < numDots; k++) {
        const sIndex = (seed + k) % strings;
        const fIndex = (seed * k) % frets; // 0 means open string technically, but visually lets put it on fret 1-4
        const cx = 10 + sIndex * stringSpacing;
        const cy = 10 + (fIndex * fretSpacing) + (fretSpacing / 2);
        svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="#22d3ee" />`;
     }

     svg += `</svg>`;
     return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  // --- Tuner Logic ---
  async toggleTuner() {
     if (this.isTunerOpen()) {
        this.stopTuner();
     } else {
        await this.startTuner();
     }
  }

  async startTuner() {
     this.tunerError.set(null);
     try {
        this.tunerStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.tunerCtx = new AudioContext();
        const source = this.tunerCtx.createMediaStreamSource(this.tunerStream);
        this.tunerAnalyser = this.tunerCtx.createAnalyser();
        this.tunerAnalyser.fftSize = 2048;
        source.connect(this.tunerAnalyser);
        
        this.isTunerOpen.set(true);
        this.detectPitch();
     } catch (err) {
        console.error('Tuner access denied', err);
        this.tunerError.set('Microphone access denied. Please check settings.');
        this.isTunerOpen.set(true); // Open to show error
     }
  }

  stopTuner() {
     this.isTunerOpen.set(false);
     if (this.tunerRafId) cancelAnimationFrame(this.tunerRafId);
     this.tunerStream?.getTracks().forEach(t => t.stop());
     this.tunerCtx?.close();
     this.tunerCtx = null;
  }

  detectPitch() {
     if (!this.tunerAnalyser || !this.isTunerOpen()) return;

     const bufferLength = this.tunerAnalyser.fftSize;
     const buffer = new Float32Array(bufferLength);
     this.tunerAnalyser.getFloatTimeDomainData(buffer);

     // Basic Autocorrelation for pitch detection
     const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
        let size = buf.length;
        let rms = 0;
        for (let i = 0; i < size; i++) {
           const val = buf[i];
           rms += val * val;
        }
        rms = Math.sqrt(rms / size);
        if (rms < 0.01) return -1; // Signal too low

        let r1 = 0, r2 = size - 1, thres = 0.2;
        for (let i = 0; i < size / 2; i++) {
           if (Math.abs(buf[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < size / 2; i++) {
           if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
        }
        
        buf = buf.slice(r1, r2);
        size = buf.length;

        const c = new Array(size).fill(0);
        for (let i = 0; i < size; i++) {
           for (let j = 0; j < size - i; j++) {
              c[i] = c[i] + buf[j] * buf[j + i];
           }
        }
        
        let d = 0; 
        while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < size; i++) {
           if (c[i] > maxval) {
              maxval = c[i];
              maxpos = i;
           }
        }
        
        let T0 = maxpos;
        return sampleRate / T0;
     };

     const freq = autoCorrelate(buffer, this.tunerCtx!.sampleRate);
     
     if (freq !== -1 && freq > 50 && freq < 2000) {
        this.tunerFrequency.set(freq);
        const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const noteNum = 12 * (Math.log(freq / 440) / Math.log(2)) + 69;
        const note = Math.round(noteNum);
        const noteName = noteStrings[note % 12];
        const cents = Math.floor((noteNum - note) * 100);
        
        this.tunerNote.set(noteName);
        this.tunerCents.set(cents);
     }

     this.tunerRafId = requestAnimationFrame(() => this.detectPitch());
  }

  isInTune() {
     return Math.abs(this.tunerCents()) < 5 && this.tunerFrequency() > 0;
  }

  // --- Sequencer Logic ---
  toggleStep(row: number, col: number) {
     this.sequencerGrid.update(g => {
        const newGrid = JSON.parse(JSON.stringify(g));
        newGrid[row].steps[col] = !newGrid[row].steps[col];
        return newGrid;
     });
  }

  // --- Helpers ---
  getLyricForTime(time: number): string {
     const lyrics = this.chordData().lyrics;
     const current = lyrics.filter(l => l.time <= time).pop();
     return current ? current.text : '';
  }

  genWaveform(): number[] {
     return Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
  }

  formatTime(seconds: number): string {
     const m = Math.floor(seconds / 60);
     const s = Math.floor(seconds % 60);
     return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
