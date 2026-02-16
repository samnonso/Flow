
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { StoreService, UserProfile, UserRole } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-8 h-full overflow-y-auto">
      <div class="max-w-screen-4k mx-auto w-full h-full flex flex-col">
        <header class="mb-6 md:mb-8 shrink-0">
          <h2 class="text-2xl md:text-3xl font-bold text-slate-800">My Profile</h2>
          <p class="text-sm md:text-base text-slate-500">Manage your account settings and preferences.</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
          
          <!-- Left Column: Avatar & Basic Info -->
          <div class="lg:col-span-1 space-y-4 md:space-y-6">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              
              <div class="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-brand-100 flex items-center justify-center text-3xl md:text-4xl font-bold text-brand-600 border-4 border-white shadow-lg mb-4 overflow-hidden relative">
                @if (formState.avatarUrl) {
                  <img [src]="formState.avatarUrl" class="w-full h-full object-cover">
                } @else {
                  {{ formState.name.charAt(0) }}
                }
              </div>

              <h3 class="text-lg md:text-xl font-bold text-slate-800">{{ formState.name }}</h3>
              <div class="flex flex-col items-center gap-2 mb-4">
                 <span class="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold border border-brand-100">{{ formState.role }}</span>
                 @if (formState.isSystemAdmin) {
                    <span class="inline-block px-2 py-0.5 bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wider">System Admin</span>
                 }
              </div>
              
              <!-- File Input Hidden and Button Disabled/Hidden for Read-Only -->
              <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
              <button disabled class="w-full py-2 px-4 border border-slate-200 rounded-lg text-xs md:text-sm font-semibold text-slate-400 bg-slate-50 cursor-not-allowed">
                Avatar Change Disabled
              </button>
            </div>

            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 text-white">
              <h4 class="font-bold mb-2 text-sm md:text-base">Choir Status</h4>
              <div class="flex items-center justify-between mb-4">
                <span class="text-slate-300 text-xs md:text-sm">Attendance</span>
                <span class="font-bold text-green-400 text-sm md:text-base">92%</span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2 mb-6">
                <div class="bg-green-400 h-2 rounded-full" style="width: 92%"></div>
              </div>
              <div class="text-xs md:text-sm text-slate-400">
                <p>Member since: <strong>Sep 2021</strong></p>
                <p>Voice Part: <strong>{{ formState.role }}</strong></p>
              </div>
            </div>
          </div>

          <!-- Right Column: Forms -->
          <div class="lg:col-span-2 space-y-4 md:space-y-6">
            
            <!-- Contact Info -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
              <h3 class="text-base md:text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information (Read Only)
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" [(ngModel)]="formState.name" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Voice Part / Role</label>
                  <input type="text" [value]="formState.role" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input type="email" [(ngModel)]="formState.email" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input type="tel" [(ngModel)]="formState.phone" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                </div>
              </div>

              <!-- Admin Toggle (Disabled) -->
              <div class="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between opacity-75">
                 <div>
                    <h5 class="text-sm font-bold text-slate-700">System Admin Access</h5>
                    <p class="text-xs text-slate-500">Contact main admin to change permissions.</p>
                 </div>
                 <button 
                    disabled
                    [class.bg-slate-800]="formState.isSystemAdmin"
                    [class.bg-slate-300]="!formState.isSystemAdmin"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                    <span class="sr-only">Toggle Admin</span>
                    <span 
                      [class.translate-x-5]="formState.isSystemAdmin"
                      [class.translate-x-0]="!formState.isSystemAdmin"
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Birthday Month</label>
                    <input type="text" [value]="formState.birthdayMonth" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Day</label>
                    <input type="number" [(ngModel)]="formState.birthdayDay" readonly class="w-full p-2 border border-slate-300 rounded-lg outline-none text-sm bg-slate-100 text-slate-500 cursor-not-allowed">
                 </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Short Bio <span class="text-brand-600">(Editable)</span></label>
                <textarea [(ngModel)]="formState.bio" rows="3" class="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none text-sm"></textarea>
              </div>
            </div>

            <!-- Notification Settings -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
              <h3 class="text-base md:text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notification Preferences
              </h3>

              <div class="space-y-4 md:space-y-6">
                <!-- Email Toggle -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">Email Notifications</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Weekly summaries and major announcements.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.email = !formState.notifications.email"
                    [class.bg-brand-600]="formState.notifications.email"
                    [class.bg-slate-200]="!formState.notifications.email"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span class="sr-only">Use setting</span>
                    <span 
                      [class.translate-x-4]="formState.notifications.email"
                      [class.md:translate-x-5]="formState.notifications.email"
                      [class.translate-x-0]="!formState.notifications.email"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <!-- SMS Toggle -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-green-50 group-hover:text-green-600 transition flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">SMS Alerts</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Urgent schedule changes and ride requests.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.sms = !formState.notifications.sms"
                    [class.bg-brand-600]="formState.notifications.sms"
                    [class.bg-slate-200]="!formState.notifications.sms"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span 
                       [class.translate-x-4]="formState.notifications.sms"
                      [class.md:translate-x-5]="formState.notifications.sms"
                      [class.translate-x-0]="!formState.notifications.sms"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <!-- Push Toggle -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition flex items-center justify-center shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">Push Notifications</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Real-time alerts directly on your device.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.push = !formState.notifications.push"
                    [class.bg-brand-600]="formState.notifications.push"
                    [class.bg-slate-200]="!formState.notifications.push"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span 
                       [class.translate-x-4]="formState.notifications.push"
                      [class.md:translate-x-5]="formState.notifications.push"
                      [class.translate-x-0]="!formState.notifications.push"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>
                
                <!-- New Setlists Toggle -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">New Setlists</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Get notified when new songs are added.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.newSetlists = !formState.notifications.newSetlists"
                    [class.bg-brand-600]="formState.notifications.newSetlists"
                    [class.bg-slate-200]="!formState.notifications.newSetlists"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span 
                       [class.translate-x-4]="formState.notifications.newSetlists"
                      [class.md:translate-x-5]="formState.notifications.newSetlists"
                      [class.translate-x-0]="!formState.notifications.newSetlists"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                 <!-- Chat Mentions Toggle -->
                 <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">Chat Mentions</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Alerts when someone mentions you in chat.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.chatMentions = !formState.notifications.chatMentions"
                    [class.bg-brand-600]="formState.notifications.chatMentions"
                    [class.bg-slate-200]="!formState.notifications.chatMentions"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span 
                       [class.translate-x-4]="formState.notifications.chatMentions"
                      [class.md:translate-x-5]="formState.notifications.chatMentions"
                      [class.translate-x-0]="!formState.notifications.chatMentions"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

                <!-- Task Reminders Toggle -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3 md:gap-4">
                    <div class="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 transition flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-slate-800 text-sm md:text-base">Task Reminders</h5>
                      <p class="text-[10px] md:text-xs text-slate-500">Get notified 24h before a deadline.</p>
                    </div>
                  </div>
                  <button 
                    (click)="formState.notifications.taskReminders = !formState.notifications.taskReminders"
                    [class.bg-brand-600]="formState.notifications.taskReminders"
                    [class.bg-slate-200]="!formState.notifications.taskReminders"
                    class="relative inline-flex h-5 w-9 md:h-6 md:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                    <span 
                        [class.translate-x-4]="formState.notifications.taskReminders"
                      [class.md:translate-x-5]="formState.notifications.taskReminders"
                      [class.translate-x-0]="!formState.notifications.taskReminders"
                      class="pointer-events-none inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                </div>

              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end pt-4 pb-20 md:pb-0">
               <button (click)="saveProfile()" class="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center text-sm md:text-base">
                 @if (saved()) {
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                   </svg>
                   Saved!
                 } @else {
                   Save Changes
                 }
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  store = inject(StoreService);
  
  // Clone state for form handling to avoid direct mutation issues until save
  formState: UserProfile = JSON.parse(JSON.stringify(this.store.userProfile()));
  saved = signal(false);
  
  roles: string[] = ['Worship Pastor', 'Worship Leader', 'Musician', 'Soprano', 'Tenor', 'Alto', 'Ad-hoc', 'Choir Admin', 'Drummer', 'Keyboardist', 'Bassist', 'Guitarist'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  saveProfile() {
    this.store.updateProfile(this.formState);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store as base64 string
        this.formState.avatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
