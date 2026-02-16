
import { Component, inject, computed, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, NgClass, NgStyle],
  template: `
    <!-- Animation Styles -->
    <style>
      .card-3d {
        transform-style: preserve-3d;
        perspective: 1000px;
      }
    </style>

    <div class="p-4 md:p-8 h-full overflow-y-auto">
      <div class="max-w-screen-4k mx-auto w-full">
        <!-- Welcome Section & Top Action -->
        <div class="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900">{{ store.t().dashboard.welcome }}, {{ store.userProfile().name.split(' ')[0] }} 👋</h1>
            <p class="text-sm md:text-base text-slate-500 mt-1">{{ store.t().dashboard.subtitle }}</p>
          </div>
        </div>

        <!-- Hero Card: Next Event -->
        <div class="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl shadow-lg p-5 md:p-6 text-white mb-6 md:mb-8 relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12 pointer-events-none"></div>
          <div class="relative z-30 flex justify-between items-end">
            <div>
              <div class="inline-block bg-white/20 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {{ store.t().dashboard.upNext }}
              </div>
              <h2 class="text-2xl md:text-3xl font-bold mb-1">{{ store.t().dashboard.eventTitle }}</h2>
              <p class="text-brand-100 mb-6 text-sm md:text-base">Oct 29, 2023 • 9:00 AM & 11:00 AM</p>
              
              <div class="flex gap-3 relative z-40">
                <a routerLink="/app/musicians" class="bg-white text-brand-700 px-4 py-2 rounded-lg text-xs md:text-sm font-bold shadow hover:bg-brand-50 transition cursor-pointer">
                  {{ store.t().dashboard.viewSetlist }}
                </a>
                <a routerLink="/app/events" class="bg-brand-700/50 hover:bg-brand-700/70 border border-white/30 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition cursor-pointer">
                  {{ store.t().dashboard.viewDeets }}
                </a>
              </div>
            </div>
            <div class="text-right hidden sm:block">
              <div class="text-5xl font-bold opacity-20">2</div>
              <div class="text-sm font-medium opacity-60 uppercase tracking-widest">{{ store.t().dashboard.daysLeft }}</div>
            </div>
          </div>
        </div>

        <!-- Widgets Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

          <!-- BIRTHDAY WIDGET -->
          @if (todaysBirthdays().length > 0) {
             <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden ring-2 ring-pink-100">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-orange-400"></div>
                <div class="flex justify-between items-center mb-4">
                   <h3 class="font-bold text-slate-800 flex items-center text-sm md:text-base">
                      <span class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mr-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v.665a3.276 3.276 0 002.736 3.289A3.29 3.29 0 009 13h2a3.29 3.29 0 003.264-3.046A3.276 3.276 0 0017 6.665V6a2 2 0 00-2-2v-1a1 1 0 00-2 0v1h-1V3a1 1 0 00-2 0v1H9V3a1 1 0 00-2 0v1H6V3a1 1 0 00-1-1zm5-1h-.995v-.005A1 1 0 0011 2h.01a1 1 0 000 2H11V3a1 1 0 00-1-1h-.01a1 1 0 000 2H11v1h-2V4a1 1 0 00-1-1h-.01a1 1 0 000 2H9v1h2v.005z" clip-rule="evenodd" />
                         </svg>
                      </span>
                      {{ store.t().dashboard.birthdays }}
                   </h3>
                   <span class="text-[10px] md:text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded border border-pink-100 font-bold">Today!</span>
                </div>
                
                <div class="flex-1 space-y-3">
                   <p class="text-sm text-slate-600">{{ store.t().dashboard.birthdaySub }}</p>
                   @for (person of todaysBirthdays(); track person.id) {
                      <div class="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                         <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm border border-pink-100 overflow-hidden">
                            @if(person.avatarUrl) {
                              <img [src]="person.avatarUrl" class="w-full h-full object-cover">
                            } @else {
                              🎉
                            }
                         </div>
                         <div>
                            <p class="font-bold text-slate-800 text-sm">{{ person.name }}</p>
                            <p class="text-xs text-pink-600 font-medium">HBD Bestie! Slay!</p>
                         </div>
                         <a routerLink="/app/chat" class="ml-auto text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                            Send Love
                         </a>
                      </div>
                   }
                </div>
             </div>
          }
          
          <!-- Setlist Preview -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-slate-800 flex items-center text-sm md:text-base">
                <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </span>
                {{ store.t().dashboard.setlistTitle }}
              </h3>
              <span class="text-[10px] md:text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{{ store.currentSetlist().length }} Songs</span>
            </div>
            <div class="space-y-3 flex-1">
              @for (song of store.currentSetlist().slice(0, 3); track song.id) {
                <div class="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition group border border-transparent hover:border-slate-100">
                  <div class="flex items-center flex-1 min-w-0">
                     <span class="text-xs font-bold text-slate-400 w-4 shrink-0">{{ $index + 1 }}</span>
                     <div class="ml-2 truncate">
                       <p class="text-sm font-semibold text-slate-800 truncate">{{ song.title }}</p>
                       <p class="text-xs text-slate-500">{{ song.key }} • {{ song.bpm }} BPM</p>
                     </div>
                  </div>
                  @if (song.url) {
                    <button (click)="openVideo(song.url)" class="ml-2 text-slate-400 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50" title="Play">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  }
                </div>
              }
              @if (store.currentSetlist().length > 3) {
                <p class="text-xs text-center text-slate-400 mt-2">+ {{ store.currentSetlist().length - 3 }} more songs</p>
              }
            </div>
          </div>

          <!-- Uniform of the Week -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col relative overflow-hidden">
            
            @if (upcomingUniform(); as uniform) {
              <!-- Header -->
              <div class="flex justify-between items-start mb-3 relative z-10">
                 <h3 class="font-bold text-slate-800 flex items-center text-sm md:text-base">
                  <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                  {{ store.t().dashboard.uniformTitle }}
                </h3>
                <div class="text-xs font-bold px-2 py-1 rounded border"
                     [style.background-color]="uniform.colorHex + '20'"
                     [style.color]="uniform.colorHex"
                     [style.border-color]="uniform.colorHex + '40'">
                  {{ uniform.date | date:'MMM d' }}
                </div>
              </div>

              <div class="flex-1 relative z-10 flex flex-col justify-center">
                
                @if (uniform.isFirstSunday) {
                   <!-- 1st Sunday / Thanksgiving Mode -->
                   <div class="flex gap-4 mb-2">
                      <div class="flex-1 flex flex-col items-center justify-center h-28 bg-orange-50 rounded-lg border border-orange-100 p-4 text-center">
                          <span class="text-3xl mb-1">🎉</span>
                          <h4 class="text-sm font-bold text-orange-800">{{ uniform.title }}</h4>
                          <p class="text-[10px] text-orange-600 mt-1 font-medium">Free Style!</p>
                      </div>
                       <!-- Inspiration Image Support for First Sunday too -->
                      @if (uniform.inspirationImg) {
                        <div (click)="openImage(uniform.inspirationImg)" class="w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer">
                           <img [src]="uniform.inspirationImg" class="w-full h-full object-cover transition transform group-hover:scale-110" alt="Inspiration">
                           <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span class="text-[10px] text-white font-bold">View</span>
                           </div>
                        </div>
                      }
                   </div>
                } @else {
                   <!-- Regular Uniform Mode with Split Fit Check -->
                   <div class="flex flex-col gap-3">
                      
                      <!-- Queens Section -->
                      <div class="flex gap-3 bg-pink-50/50 p-2.5 rounded-xl border border-pink-100 items-start">
                         @if (uniform.ladiesInspoImg) {
                            <div (click)="openImage(uniform.ladiesInspoImg)" class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-pink-200 shadow-sm relative group cursor-pointer hover:border-pink-400 transition bg-white">
                               <img [src]="uniform.ladiesInspoImg" class="w-full h-full object-cover">
                               <div class="absolute inset-0 bg-pink-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                               </div>
                            </div>
                         }
                         <div class="flex-1">
                            <span class="text-[10px] uppercase font-bold text-pink-500 block mb-0.5">Queens</span>
                            <p class="text-xs text-slate-700 leading-snug">{{ uniform.ladies || 'No specific instructions.' }}</p>
                         </div>
                      </div>

                      <!-- Kings Section -->
                      <div class="flex gap-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 items-start">
                         @if (uniform.guysInspoImg) {
                            <div (click)="openImage(uniform.guysInspoImg)" class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm relative group cursor-pointer hover:border-blue-400 transition bg-white">
                               <img [src]="uniform.guysInspoImg" class="w-full h-full object-cover">
                               <div class="absolute inset-0 bg-blue-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                               </div>
                            </div>
                         }
                         <div class="flex-1">
                            <span class="text-[10px] uppercase font-bold text-blue-500 block mb-0.5">Kings</span>
                            <p class="text-xs text-slate-700 leading-snug">{{ uniform.guys || 'No specific instructions.' }}</p>
                         </div>
                      </div>

                   </div>
                   @if (uniform.comments) {
                     <div class="bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                        <p class="text-[10px] text-slate-500 italic">{{ uniform.comments }}</p>
                     </div>
                   }
                }
              </div>
            } @else {
              <div class="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-8">
                 <p class="text-sm font-medium text-slate-500">No uniform schedule.</p>
              </div>
            }
          </div>

          <!-- PULL UP WIDGET (For Non-Admins) -->
          @if (store.userProfile().role !== 'Admin') {
            <a routerLink="/app/rides" class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm p-4 text-white flex items-center justify-between hover:shadow-md transition group cursor-pointer relative overflow-hidden">
               <div class="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12 pointer-events-none"></div>
               <div class="flex items-center relative z-10">
                  <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl mr-3 shadow-inner">
                     🚗
                  </div>
                  <div>
                     <h3 class="font-bold text-lg leading-tight">{{ store.t().dashboard.copRide }}</h3>
                     <p class="text-xs text-emerald-100 font-medium">{{ store.rideRequests().length }} active requests</p>
                  </div>
               </div>
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform group-hover:translate-x-1 transition relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
               </svg>
            </a>
          }

          <!-- Choir Manager Widget -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-slate-800 flex items-center text-sm md:text-base">
                <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </span>
                {{ store.t().dashboard.manageChoir }}
              </h3>
            </div>
            
            <div class="flex-1 flex flex-col justify-center space-y-4">
               <!-- Stats Row -->
               <div class="flex justify-around text-center">
                  <div>
                     <div class="text-2xl font-bold text-slate-800">{{ store.choirGroup().admins.length }}</div>
                     <div class="text-[10px] uppercase font-bold text-slate-400">Admins</div>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-slate-800">{{ store.choirGroup().musicians.length }}</div>
                     <div class="text-[10px] uppercase font-bold text-slate-400">Musicians</div>
                  </div>
                  <div>
                     <div class="text-2xl font-bold text-slate-800">{{ store.choirGroup().members.length }}</div>
                     <div class="text-[10px] uppercase font-bold text-slate-400">Members</div>
                  </div>
               </div>
               
               <!-- Total badge -->
               <div class="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                  <span class="text-sm text-slate-500">Total Squad Size: </span>
                  <span class="font-bold text-slate-800">{{ store.choirGroup().admins.length + store.choirGroup().musicians.length + store.choirGroup().members.length }}</span>
               </div>
            </div>

            <a routerLink="/app/choir-manager" class="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg text-center text-sm font-bold hover:bg-slate-800 transition cursor-pointer">
              View Roster
            </a>
          </div>

          <!-- PULL UP WIDGET (For Admins) -->
          @if (store.userProfile().role === 'Admin') {
            <a routerLink="/app/rides" class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm p-4 text-white flex items-center justify-between hover:shadow-md transition group cursor-pointer relative overflow-hidden">
               <div class="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12 pointer-events-none"></div>
               <div class="flex items-center relative z-10">
                  <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl mr-3 shadow-inner">
                     🚗
                  </div>
                  <div>
                     <h3 class="font-bold text-lg leading-tight">{{ store.t().dashboard.copRide }}</h3>
                     <p class="text-xs text-emerald-100 font-medium">{{ store.rideRequests().length }} active requests</p>
                  </div>
               </div>
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform group-hover:translate-x-1 transition relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
               </svg>
            </a>
          }

        </div>
      </div>
    </div>

    <!-- Video Modal -->
    @if (viewingVideo()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div class="bg-black rounded-2xl overflow-hidden w-full max-w-4xl aspect-video relative shadow-2xl">
            <button (click)="closeVideo()" class="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/50 rounded-full p-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
            <iframe [src]="viewingVideo()" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
    }

    <!-- Image Modal (Fit Check) -->
    @if (viewingImage()) {
      <div class="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4" (click)="closeImage()">
         <div class="relative max-w-full max-h-full">
            <img [src]="viewingImage()" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" (click)="$event.stopPropagation()">
            <button (click)="closeImage()" class="absolute -top-12 right-0 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
      </div>
    }
  `
})
export class DashboardComponent {
  store = inject(StoreService);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  viewingVideo = signal<SafeResourceUrl | null>(null);
  viewingImage = signal<string | null>(null);

  todaysBirthdays = computed(() => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const day = today.getDate();
    
    // Check choir members + admins + musicians
    const group = this.store.choirGroup();
    const all = [...group.admins, ...group.musicians, ...group.members];
    
    return all.filter(m => m.birthdayMonth === month && m.birthdayDay === day);
  });
  
  upcomingUniform = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const schedules = this.store.uniformSchedule();
    // Sort by date and find first one equal to or after today
    const sorted = [...schedules].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.find(u => u.date >= today) || null;
  });

  openImage(url: string | undefined) {
    if (url) this.viewingImage.set(url);
  }

  closeImage() {
    this.viewingImage.set(null);
  }

  openVideo(url: string | undefined) {
    if (!url) return;
    const videoId = this.extractVideoId(url);
    if (videoId) {
       const embedUrl = `https://www.youtube.com/embed/${videoId}`;
       this.viewingVideo.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
    } else {
       window.open(url, '_blank');
    }
  }

  closeVideo() {
    this.viewingVideo.set(null);
  }

  private extractVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : null;
  }
}
