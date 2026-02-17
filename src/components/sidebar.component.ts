
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="h-full flex flex-col bg-brand-900 text-white w-64 shadow-xl">
      <div class="p-6 border-b border-brand-800">
        <h1 class="text-2xl font-bold tracking-tight">ChordFlow</h1>
        <p class="text-xs text-brand-200 mt-1">{{ store.t().sidebar.squadSync }}</p>
      </div>
      
      <div class="flex-1 py-6 space-y-1 overflow-y-auto">
        <a routerLink="/app/dashboard" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {{ store.t().sidebar.hub }}
        </a>

        <a routerLink="/app/musicians" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          {{ store.t().sidebar.lab }}
        </a>

        <a routerLink="/app/tracks" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {{ store.t().sidebar.aux }}
        </a>

        <a routerLink="/app/chat" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {{ store.t().sidebar.gc }}
        </a>

        <a routerLink="/app/rides" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ store.t().sidebar.rides }}
        </a>

        <a routerLink="/app/events" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ store.t().sidebar.events }}
        </a>

        <!-- Assistant Trigger (Moved here) -->
        <button (click)="store.isAssistantOpen.set(true)" class="w-full flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors text-left" [class.bg-brand-800]="store.isAssistantOpen()">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           {{ store.t().sidebar.assistant }}
        </button>
        
        <a routerLink="/app/settings" routerLinkActive="bg-brand-800 border-r-4 border-brand-500" class="flex items-center px-6 py-3 text-sm font-medium hover:bg-brand-800 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
          {{ store.t().sidebar.settings }}
        </a>
      </div>

      <!-- Language Toggle -->
      <div class="px-6 py-2">
        <button (click)="store.toggleLang()" class="w-full bg-brand-800 hover:bg-brand-700 text-xs font-bold text-brand-100 py-2 rounded-lg transition border border-brand-700 uppercase flex items-center justify-center gap-2">
           <span>{{ store.lang() === 'en' ? '🇺🇸 EN' : '🇫🇷 FR' }}</span>
           <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
           </svg>
           <span>{{ store.lang() === 'en' ? 'FR' : 'EN' }}</span>
        </button>
      </div>

      <a routerLink="/app/profile" class="p-4 border-t border-brand-800 hover:bg-brand-800 transition cursor-pointer group">
        <div class="flex items-center">
          <div class="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-brand-300 transition overflow-hidden relative">
            @if (store.userProfile().avatarUrl) {
              <img [src]="store.userProfile().avatarUrl" class="w-full h-full object-cover">
            } @else {
              {{ store.userProfile().name.charAt(0) }}
            }
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">{{ store.userProfile().name }}</p>
            <p class="text-xs text-brand-300">{{ store.t().sidebar.profile }}</p>
          </div>
        </div>
      </a>
    </nav>
  `
})
export class SidebarComponent {
  store = inject(StoreService);
}
