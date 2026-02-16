
import { Component, inject, signal, computed } from '@angular/core';
import { StoreService, Track } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-track-manager',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe, RouterLink],
  template: `
    <div class="p-8 h-full flex flex-col">
      <header class="mb-6 flex justify-between items-center">
        <div>
           <h2 class="text-3xl font-bold text-slate-800">Backing Tracks (The Sauce)</h2>
           <p class="text-slate-500">Integrations active: 
              @if(store.integrations().loopCommunity) { <span class="text-red-600 font-bold">LoopCommunity</span> }
              @if(store.integrations().loopCommunity && store.integrations().multiTracks) { , }
              @if(store.integrations().multiTracks) { <span class="text-blue-600 font-bold">MultiTracks</span> }
              @if(!store.integrations().loopCommunity && !store.integrations().multiTracks) { None }
           </p>
        </div>
        
        <button (click)="openImportModal()" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-indigo-700 transition font-bold flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
           </svg>
           Import from Cloud
        </button>
      </header>

      <div class="bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div class="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div class="col-span-4">Track Name</div>
          <div class="col-span-3">Source</div>
          <div class="col-span-1">Key</div>
          <div class="col-span-2 text-center">Current Mood</div>
          <div class="col-span-2 text-right">Actions</div>
        </div>

        <div class="overflow-y-auto flex-1">
          @for (track of store.tracks(); track track.id) {
            <div class="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition">
              <div class="col-span-4 font-medium text-slate-800">{{track.title}}</div>
              <div class="col-span-3">
                <span [class]="track.source === 'LoopCommunity' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-1 rounded-full text-xs font-semibold">
                  {{track.source}}
                </span>
              </div>
              <div class="col-span-1 font-mono text-slate-600">{{track.key}}</div>
              <div class="col-span-2 text-center">
                @if (track.downloaded) {
                  <span class="inline-flex items-center text-green-600 text-xs font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Valid
                  </span>
                } @else {
                  <span class="inline-flex items-center text-slate-400 text-xs font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Loading...
                  </span>
                }
              </div>
              <div class="col-span-2 text-right">
                <button class="text-slate-400 hover:text-brand-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
      
      <!-- Import Modal -->
      @if (isImporting()) {
         <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
               <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                  <h3 class="text-xl font-bold text-slate-800">Import from Cloud</h3>
                  <button (click)="isImporting.set(false)" class="text-slate-400 hover:text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
               
               <!-- Tabs -->
               <div class="flex border-b border-slate-100">
                  <button (click)="importTab.set('LoopCommunity')" 
                     [class.text-red-600]="importTab() === 'LoopCommunity'"
                     [class.border-red-600]="importTab() === 'LoopCommunity'"
                     class="flex-1 py-4 text-sm font-bold border-b-2 border-transparent transition hover:bg-slate-50">
                     LoopCommunity
                  </button>
                  <button (click)="importTab.set('MultiTracks')" 
                     [class.text-blue-600]="importTab() === 'MultiTracks'"
                     [class.border-blue-600]="importTab() === 'MultiTracks'"
                     class="flex-1 py-4 text-sm font-bold border-b-2 border-transparent transition hover:bg-slate-50">
                     MultiTracks
                  </button>
               </div>

               <div class="flex-1 overflow-y-auto p-6">
                  @if (isConnected(importTab())) {
                     <div class="mb-4 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search your purchased tracks..." class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2" [class.focus:ring-red-500]="importTab() === 'LoopCommunity'" [class.focus:ring-blue-500]="importTab() === 'MultiTracks'">
                     </div>

                     <div class="space-y-2">
                        @for (item of getMockCloudTracks(importTab()); track item.id) {
                           <div class="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition">
                              <div>
                                 <p class="font-bold text-slate-800">{{ item.title }}</p>
                                 <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs bg-slate-100 text-slate-600 px-1.5 rounded font-mono border border-slate-200">{{ item.key }}</span>
                                    <span class="text-xs text-slate-400">Purchased 2 days ago</span>
                                 </div>
                              </div>
                              <button (click)="importTrack(item)" class="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition">
                                 Download
                              </button>
                           </div>
                        }
                     </div>
                  } @else {
                     <div class="flex flex-col items-center justify-center h-full text-center">
                        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                           </svg>
                        </div>
                        <h4 class="font-bold text-slate-800 text-lg mb-2">Not Connected</h4>
                        <p class="text-slate-500 max-w-xs mb-6">You need to link your {{ importTab() }} account in Settings before you can import tracks.</p>
                        <a routerLink="/app/settings" (click)="isImporting.set(false)" class="text-indigo-600 font-bold hover:underline cursor-pointer">Go to Settings &rarr;</a>
                     </div>
                  }
               </div>
               
               <div class="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 rounded-b-2xl">
                  Fetching from {{ importTab() }} API...
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class TrackManagerComponent {
  store = inject(StoreService);
  
  isImporting = signal(false);
  importTab = signal<'LoopCommunity' | 'MultiTracks'>('LoopCommunity');

  openImportModal() {
     this.isImporting.set(true);
  }

  isConnected(source: 'LoopCommunity' | 'MultiTracks') {
     if (source === 'LoopCommunity') return this.store.integrations().loopCommunity;
     return this.store.integrations().multiTracks;
  }

  getMockCloudTracks(source: 'LoopCommunity' | 'MultiTracks') {
     if (source === 'LoopCommunity') {
        return [
           { id: 'lc1', title: 'Firm Foundation (He Won\'t)', key: 'Bb' },
           { id: 'lc2', title: 'Promises', key: 'A' },
           { id: 'lc3', title: 'Million Little Miracles', key: 'C' }
        ];
     } else {
        return [
           { id: 'mt1', title: 'Rest On Us', key: 'A' },
           { id: 'mt2', title: 'Same God', key: 'C' },
           { id: 'mt3', title: 'Gratitude', key: 'B' }
        ];
     }
  }

  importTrack(item: any) {
     this.store.addTrack({
        id: Date.now().toString(),
        title: item.title,
        source: this.importTab(),
        key: item.key,
        purchased: true,
        downloaded: true
     });
     this.isImporting.set(false);
  }
}
