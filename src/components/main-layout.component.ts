
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AssistantComponent } from './assistant.component';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, AssistantComponent, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans flex-col md:flex-row">
      <!-- Desktop Sidebar (Hidden on Mobile) -->
      <app-sidebar class="hidden md:flex flex-shrink-0" />

      <!-- Main Content Area -->
      <main class="flex-1 overflow-hidden relative flex flex-col w-full">
        <div class="flex-1 overflow-hidden relative w-full">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Global Assistant Popup -->
        <app-assistant />

        <!-- Spacer for Mobile Bottom Nav to prevent content overlap -->
        <div class="h-[60px] md:hidden shrink-0"></div>
      </main>

      <!-- Mobile Bottom Navigation (Visible only on Mobile) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-slate-900 text-white flex justify-around items-center z-50 border-t border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <a routerLink="/app/musicians" routerLinkActive="text-brand-400" class="flex flex-col items-center justify-center w-full h-full text-[10px] text-slate-400 gap-1 active:bg-slate-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Lab
        </a>
        <a routerLink="/app/chat" routerLinkActive="text-brand-400" class="flex flex-col items-center justify-center w-full h-full text-[10px] text-slate-400 gap-1 active:bg-slate-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </a>
        <a routerLink="/app/dashboard" routerLinkActive="text-brand-400" class="flex flex-col items-center justify-center w-full h-full text-[10px] text-slate-400 gap-1 active:bg-slate-800 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Home
        </a>
        <a routerLink="/app/profile" routerLinkActive="text-brand-400" class="flex flex-col items-center justify-center w-full h-full text-[10px] text-slate-400 gap-1 active:bg-slate-800 transition">
          <div class="h-6 w-6 rounded-full overflow-hidden border border-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full bg-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </div>
          Profile
        </a>
        <button (click)="store.isAssistantOpen.set(true)" class="flex flex-col items-center justify-center w-full h-full text-[10px] text-slate-400 gap-1 active:bg-slate-800 transition" [class.text-brand-400]="store.isAssistantOpen()">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           Assist
        </button>
      </nav>
    </div>
  `
})
export class MainLayoutComponent {
  store = inject(StoreService);
}
