
import { Component, signal, inject } from '@angular/core';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <div class="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <div class="max-w-screen-4k mx-auto w-full">
        <header class="mb-8">
          <h2 class="text-3xl font-bold text-slate-800">Settings</h2>
          <p class="text-slate-500">Manage organization details and app preferences.</p>
        </header>

        <!-- Tabs -->
        <div class="flex gap-1 bg-slate-200 p-1 rounded-xl mb-6 shrink-0 w-full md:w-fit">
           <button (click)="activeTab.set('general')" [class.bg-white]="activeTab() === 'general'" [class.shadow]="activeTab() === 'general'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">General</button>
           <button (click)="activeTab.set('integrations')" [class.bg-white]="activeTab() === 'integrations'" [class.shadow]="activeTab() === 'integrations'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">Integrations</button>
           <button (click)="activeTab.set('preferences')" [class.bg-white]="activeTab() === 'preferences'" [class.shadow]="activeTab() === 'preferences'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">Preferences</button>
        </div>

        <div class="max-w-4xl">
          
          <!-- General Tab -->
          @if (activeTab() === 'general') {
            <div class="space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Organization Profile</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Church / Team Name</label>
                      <input type="text" [(ngModel)]="generalSettings.teamName" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">CCLI License #</label>
                      <input type="text" [(ngModel)]="generalSettings.ccli" placeholder="e.g. 123456" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                      <p class="text-[10px] text-slate-400 mt-1">Required for lyric projection.</p>
                   </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Defaults</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Service Time</label>
                      <input type="time" [(ngModel)]="generalSettings.serviceTime" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Currency Symbol</label>
                      <select [(ngModel)]="generalSettings.currency" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                         <option value="$">USD ($)</option>
                         <option value="€">EUR (€)</option>
                         <option value="£">GBP (£)</option>
                         <option value="₦">NGN (₦)</option>
                      </select>
                   </div>
                </div>
              </div>
            </div>
          }

          <!-- Integrations Tab -->
          @if (activeTab() === 'integrations') {
            <div class="space-y-6">
               <!-- LoopCommunity -->
               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">LC</div>
                     <div>
                        <h4 class="font-bold text-slate-800">LoopCommunity</h4>
                        <p class="text-sm text-slate-500">Sync purchased tracks and Prime Cloud.</p>
                     </div>
                  </div>
                  <button (click)="store.updateIntegrationStatus('loopCommunity', !store.integrations().loopCommunity)" 
                     [class.bg-red-600]="!store.integrations().loopCommunity"
                     [class.hover:bg-red-700]="!store.integrations().loopCommunity"
                     [class.text-white]="!store.integrations().loopCommunity"
                     [class.bg-white]="store.integrations().loopCommunity"
                     [class.text-red-600]="store.integrations().loopCommunity"
                     [class.border]="store.integrations().loopCommunity"
                     [class.border-red-600]="store.integrations().loopCommunity"
                     class="px-4 py-2 rounded-lg font-bold transition min-w-[100px]">
                     {{ store.integrations().loopCommunity ? 'Disconnect' : 'Connect' }}
                  </button>
               </div>

               <!-- MultiTracks -->
               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">MT</div>
                     <div>
                        <h4 class="font-bold text-slate-800">MultiTracks.com</h4>
                        <p class="text-sm text-slate-500">Access your RehearsalMix and Charts.</p>
                     </div>
                  </div>
                  <button (click)="store.updateIntegrationStatus('multiTracks', !store.integrations().multiTracks)" 
                     [class.bg-blue-600]="!store.integrations().multiTracks"
                     [class.hover:bg-blue-700]="!store.integrations().multiTracks"
                     [class.text-white]="!store.integrations().multiTracks"
                     [class.bg-white]="store.integrations().multiTracks"
                     [class.text-blue-600]="store.integrations().multiTracks"
                     [class.border]="store.integrations().multiTracks"
                     [class.border-blue-600]="store.integrations().multiTracks"
                     class="px-4 py-2 rounded-lg font-bold transition min-w-[100px]">
                     {{ store.integrations().multiTracks ? 'Disconnect' : 'Connect' }}
                  </button>
               </div>

               <!-- Planning Center -->
               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">PCO</div>
                     <div>
                        <h4 class="font-bold text-slate-800">Planning Center Online</h4>
                        <p class="text-sm text-slate-500">Sync services, people, and plans.</p>
                     </div>
                  </div>
                  <button class="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition">Connect</button>
               </div>

               <!-- WhatsApp -->
               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                     <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                     </div>
                     <div>
                        <h4 class="font-bold text-slate-800 flex items-center gap-2">
                           WhatsApp Community
                           @if(store.integrations().whatsapp) {
                              <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Active</span>
                           }
                        </h4>
                        @if(store.integrations().whatsapp) {
                           <p class="text-sm text-slate-500">Connected to <strong class="text-green-600">{{ store.integrations().whatsappGroupName }}</strong></p>
                        } @else {
                           <p class="text-sm text-slate-500">Link group chat for 'Team Chat' feature.</p>
                        }
                     </div>
                  </div>
                   <button (click)="openWhatsAppModal()" 
                      [class.bg-green-600]="!store.integrations().whatsapp"
                      [class.hover:bg-green-700]="!store.integrations().whatsapp"
                      [class.text-white]="!store.integrations().whatsapp"
                      [class.border-slate-300]="store.integrations().whatsapp"
                      [class.bg-white]="store.integrations().whatsapp"
                      [class.text-slate-600]="store.integrations().whatsapp"
                      [class.border]="store.integrations().whatsapp"
                      class="px-4 py-2 rounded-lg font-bold transition">
                      {{ store.integrations().whatsapp ? 'Configure' : 'Connect' }}
                   </button>
               </div>
            </div>
          }

          <!-- Preferences Tab -->
          @if (activeTab() === 'preferences') {
            <div class="space-y-6">
               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Appearance</h3>
                 
                 <div class="flex items-center justify-between mb-4">
                    <div>
                       <h4 class="font-medium text-slate-800">Dark Mode</h4>
                       <p class="text-xs text-slate-500">Switch between light and dark themes.</p>
                    </div>
                    <button class="w-12 h-6 bg-slate-200 rounded-full relative transition duration-200 ease-in-out">
                       <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition"></span>
                    </button>
                 </div>
                 
                 <div class="flex items-center justify-between">
                    <div>
                       <h4 class="font-medium text-slate-800">Compact Density</h4>
                       <p class="text-xs text-slate-500">Show more content on screen (good for setlists).</p>
                    </div>
                    <button class="w-12 h-6 bg-brand-600 rounded-full relative transition duration-200 ease-in-out">
                       <span class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition"></span>
                    </button>
                 </div>
               </div>

               <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 class="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Music Tools</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Default Transpose Key</label>
                       <select class="w-full border border-slate-300 rounded-lg p-2.5 bg-white">
                          <option>Original</option>
                          <option>C</option>
                          <option>G</option>
                       </select>
                    </div>
                     <div>
                       <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Instrument</label>
                       <select class="w-full border border-slate-300 rounded-lg p-2.5 bg-white">
                          <option>Piano</option>
                          <option>Guitar</option>
                          <option>Bass</option>
                          <option>Drums</option>
                       </select>
                       <p class="text-[10px] text-slate-400 mt-1">Used for AI transcription defaults.</p>
                    </div>
                 </div>
               </div>
            </div>
          }

          <!-- Save Button Area (Global) -->
          <div class="mt-8 flex justify-end">
             <button (click)="saveSettings()" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center">
                @if (isSaving()) {
                   <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Saving...
                } @else {
                   Save Changes
                }
             </button>
          </div>

        </div>
      </div>
    </div>

    <!-- WhatsApp Config Modal -->
    @if (isWhatsAppModalOpen()) {
       <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
             <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 class="text-lg font-bold text-slate-800 flex items-center">
                   <span class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                   </span>
                   WhatsApp Setup
                </h3>
                <button (click)="isWhatsAppModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
             </div>

             <div class="p-6">
                <!-- Step 1: Input -->
                @if (whatsappStep() === 'input') {
                   <p class="text-sm text-slate-600 mb-4">Enter your phone number to link your WhatsApp Business account or join the community.</p>
                   <div class="space-y-4">
                      <div>
                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Group / Community Name</label>
                         <input type="text" [(ngModel)]="whatsappForm.groupName" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500">
                         <p class="text-[10px] text-slate-400 mt-1">This is how it will appear in the app.</p>
                      </div>
                      <div>
                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                         <input type="tel" [(ngModel)]="whatsappForm.number" placeholder="+1 (555) 000-0000" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500">
                      </div>
                      <div class="text-center">
                         <span class="text-xs text-slate-400 uppercase font-bold">OR</span>
                      </div>
                      <div>
                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Group Invite Link</label>
                         <input type="text" [(ngModel)]="whatsappForm.link" placeholder="https://chat.whatsapp.com/..." class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500">
                      </div>
                   </div>
                   
                   <button (click)="goToScanStep()" [disabled]="!whatsappForm.groupName" class="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50">
                      Next: Scan QR Code
                   </button>
                }

                <!-- Step 2: Scan -->
                @if (whatsappStep() === 'scan') {
                   <div class="text-center">
                      <p class="text-sm text-slate-600 mb-4">Open WhatsApp on your phone and scan this code to link.</p>
                      
                      <div class="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200 relative overflow-hidden">
                         <!-- Simulated QR Code -->
                         <div class="grid grid-cols-6 gap-1 w-32 h-32 opacity-80">
                            @for (i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]; track i) {
                               <div class="bg-slate-900 rounded-sm" [class.invisible]="i % 3 === 0 || i % 7 === 0"></div>
                            }
                         </div>
                         @if (isSimulatingConnection()) {
                           <div class="absolute inset-0 bg-white/50 flex items-center justify-center">
                              <svg class="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                           </div>
                         }
                      </div>
                      
                      <p class="text-xs text-slate-400 mt-4">Simulating connection...</p>
                   </div>
                }

                <!-- Step 3: Success -->
                @if (whatsappStep() === 'success') {
                   <div class="text-center py-6">
                      <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                         </svg>
                      </div>
                      <h4 class="text-xl font-bold text-slate-800 mb-2">Connected!</h4>
                      <p class="text-sm text-slate-500"><strong>{{ whatsappForm.groupName }}</strong> is now linked to ChordFlow.</p>
                      
                      <button (click)="finishWhatsAppSetup()" class="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                         Done
                      </button>
                   </div>
                }
                
                @if (whatsappStep() === 'disconnect') {
                   <div class="text-center py-6">
                      <p class="text-slate-600 mb-6">Are you sure you want to disconnect WhatsApp integration? You will lose chat sync.</p>
                      <button (click)="confirmDisconnect()" class="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition mb-3">
                         Yes, Disconnect
                      </button>
                      <button (click)="isWhatsAppModalOpen.set(false)" class="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                         Cancel
                      </button>
                   </div>
                }
             </div>
          </div>
       </div>
    }
  `
})
export class SettingsComponent {
  store = inject(StoreService);
  activeTab = signal<'general' | 'integrations' | 'preferences'>('general');
  isSaving = signal(false);

  // WhatsApp State
  isWhatsAppModalOpen = signal(false);
  whatsappStep = signal<'input' | 'scan' | 'success' | 'disconnect'>('input');
  whatsappForm = { number: '', link: '', groupName: '' };
  isSimulatingConnection = signal(false);

  // Mock Settings State
  generalSettings = {
     teamName: 'Grace Community Choir',
     ccli: '1293849',
     serviceTime: '09:00',
     currency: '$'
  };

  saveSettings() {
    this.isSaving.set(true);
    // Simulate API call
    setTimeout(() => {
       this.store.updateChoirProfile(this.generalSettings.teamName);
       this.isSaving.set(false);
       alert('Settings saved successfully!');
    }, 1000);
  }

  // WhatsApp Logic
  openWhatsAppModal() {
     if (this.store.integrations().whatsapp) {
        this.whatsappStep.set('disconnect');
     } else {
        this.whatsappStep.set('input');
        // Default existing name if editing or default
        this.whatsappForm = { number: '', link: '', groupName: this.store.integrations().whatsappGroupName || 'Worship Team Main' };
     }
     this.isWhatsAppModalOpen.set(true);
  }

  goToScanStep() {
     this.whatsappStep.set('scan');
     // Simulate scanning delay
     setTimeout(() => {
        this.isSimulatingConnection.set(true);
        setTimeout(() => {
           this.isSimulatingConnection.set(false);
           this.whatsappStep.set('success');
        }, 2000);
     }, 1500);
  }

  finishWhatsAppSetup() {
     this.store.updateIntegrationStatus('whatsapp', true);
     if(this.whatsappForm.groupName) {
        this.store.updateWhatsAppGroupName(this.whatsappForm.groupName);
     }
     this.store.fetchWhatsAppHistory();
     this.isWhatsAppModalOpen.set(false);
  }

  confirmDisconnect() {
     this.store.updateIntegrationStatus('whatsapp', false);
     this.isWhatsAppModalOpen.set(false);
  }
}
