
import { Component, inject, signal } from '@angular/core';
import { StoreService, RideRequest } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ride-share',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <div class="max-w-screen-4k mx-auto w-full h-full flex flex-col">
        <!-- Header -->
        <header class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div>
            <h2 class="text-3xl font-bold text-slate-800">{{ store.t().rides.title }}</h2>
            <p class="text-slate-500">{{ store.t().rides.subtitle }}</p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button (click)="showRequestForm.set(true)" class="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 font-semibold flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              {{ store.t().rides.needLift }}
            </button>
          </div>
        </header>

        <!-- Carpool Requests List (Moved to Top) -->
        <div id="request-list" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[300px]">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
             <h3 class="font-bold text-slate-700">{{ store.t().rides.carpool }}</h3>
             <span class="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{{ store.rideRequests().length }} Active</span>
          </div>
          
          <div class="overflow-y-auto flex-1 p-4 space-y-4">
             @for (req of store.rideRequests(); track req.id) {
               <div class="border border-slate-200 rounded-xl p-4 hover:shadow-md transition bg-white group relative overflow-hidden">
                  @if (req.status === 'accepted') {
                     <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                        {{ store.t().rides.secured }}
                     </div>
                  }
                  
                  <div class="flex items-start gap-4">
                     <div class="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg shrink-0">
                        {{ req.requester.charAt(0) }}
                     </div>
                     <div class="flex-1">
                        <div class="flex justify-between items-start">
                           <h4 class="font-bold text-slate-800">{{ req.requester }}</h4>
                           <span class="text-xs text-slate-400">{{ req.time }}</span>
                        </div>
                        
                        <div class="flex flex-col md:flex-row gap-2 md:gap-6 mt-2 text-sm text-slate-600">
                           <div class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                 <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                              </svg>
                              <span class="font-medium text-slate-400 text-xs uppercase">From:</span> {{ req.from }}
                           </div>
                           <div class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                 <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                              </svg>
                              <span class="font-medium text-slate-400 text-xs uppercase">To:</span> {{ req.to }}
                           </div>
                        </div>

                        @if (req.status === 'pending') {
                           <button (click)="acceptRequest(req.id)" class="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-brand-700 transition w-full md:w-auto">
                              {{ store.t().rides.gotchu }}
                           </button>
                        } @else {
                           <div class="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-lg border border-green-100 inline-block">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                              Driven by {{ req.driver }}
                           </div>
                        }
                     </div>
                  </div>
               </div>
             }
             @if (store.rideRequests().length === 0) {
                <div class="text-center py-10 text-slate-400">
                   <p>No ride requests yet. Everyone is mobile!</p>
                </div>
             }
          </div>
        </div>

        <!-- Other Transit Options (Moved to Bottom & Shrunk) -->
        <div class="mt-6 shrink-0">
           <div class="flex flex-col md:flex-row items-center justify-center gap-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ store.t().rides.otherOptions }}</span>
              <div class="flex gap-2">
                  <!-- Uber -->
                  <a href="https://m.uber.com/ul" target="_blank" class="px-5 py-2 bg-black text-white rounded-full text-sm font-bold shadow-sm hover:bg-slate-800 transition flex items-center gap-2">
                     <span class="text-[10px] w-4 h-4 rounded-full border border-white flex items-center justify-center">U</span>
                     Uber
                  </a>
                  <!-- Lyft -->
                  <a href="https://ride.lyft.com" target="_blank" class="px-5 py-2 bg-[#FF00BF] text-white rounded-full text-sm font-bold shadow-sm hover:opacity-90 transition flex items-center gap-2">
                     <span class="text-[10px] w-4 h-4 rounded-full border border-white flex items-center justify-center">L</span>
                     Lyft
                  </a>
                  <!-- Bus -->
                  <a href="https://www.google.com/maps/search/bus+station/" target="_blank" class="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-sm hover:bg-blue-700 transition flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                     </svg>
                     Bus / Transit
                  </a>
              </div>
           </div>
        </div>

      </div>

      <!-- Request Modal -->
      @if (showRequestForm()) {
         <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
               <h3 class="text-2xl font-bold text-slate-800 mb-4">Request a Ride</h3>
               <div class="space-y-4">
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1">From Location</label>
                     <input type="text" [(ngModel)]="newReq.from" placeholder="e.g. North Hills" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500">
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1">To Location</label>
                     <input type="text" [(ngModel)]="newReq.to" placeholder="e.g. Church Main Campus" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500">
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                     <input type="text" [(ngModel)]="newReq.time" placeholder="e.g. Sunday 8:00 AM" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500">
                  </div>
               </div>
               <div class="flex justify-end gap-3 mt-6">
                  <button (click)="showRequestForm.set(false)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">{{ store.t().common.cancel }}</button>
                  <button (click)="submitRequest()" class="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow">Post Request</button>
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class RideShareComponent {
  store = inject(StoreService);
  showRequestForm = signal(false);
  newReq: Partial<RideRequest> = {};

  submitRequest() {
    if (this.newReq.from && this.newReq.to && this.newReq.time) {
      this.store.requestRide({
        id: Date.now().toString(),
        requester: this.store.userProfile().name,
        from: this.newReq.from,
        to: this.newReq.to,
        time: this.newReq.time,
        status: 'pending'
      });
      this.showRequestForm.set(false);
      this.newReq = {};
    }
  }

  acceptRequest(id: string) {
    this.store.acceptRide(id, this.store.userProfile().name);
  }
}
