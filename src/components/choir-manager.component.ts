
import { Component, inject, signal, computed } from '@angular/core';
import { StoreService, ChoirMember } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-choir-manager',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <div class="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <div class="max-w-screen-4k mx-auto w-full h-full flex flex-col">
        <!-- Header: Choir Profile -->
        <header class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative group">
          
          <!-- Logo Display -->
          <div class="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg relative overflow-hidden shrink-0">
            @if (store.choirGroup().logoUrl) {
              <img [src]="store.choirGroup().logoUrl" class="w-full h-full object-cover">
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            <!-- Edit Overlay (Admin Only) -->
            @if (store.userProfile().role === 'Admin') {
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer" (click)="openEditProfile()">
                 <span class="text-white text-sm font-bold">Change</span>
              </div>
            }
          </div>

          <!-- Info -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-slate-800 mb-1">{{ store.choirGroup().name }}</h2>
            <p class="text-slate-500 mb-4">Manage your team structure, roles, and membership.</p>
            
            <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
               <div class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                 {{ store.choirGroup().admins.length }} Admins
               </div>
               <div class="bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-medium">
                 {{ store.choirGroup().musicians.length }} Musicians
               </div>
               <div class="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">
                 {{ store.choirGroup().members.length }} Members
               </div>
            </div>
          </div>

          @if (store.userProfile().role === 'Admin') {
            <button (click)="openEditProfile()" class="absolute top-6 right-6 text-slate-400 hover:text-brand-600">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
          }
        </header>

        <!-- Tabs -->
        <div class="flex gap-1 bg-slate-200 p-1 rounded-xl mb-6 shrink-0 w-full md:w-fit self-center md:self-start">
           <button (click)="activeTab.set('admins')" [class.bg-white]="activeTab() === 'admins'" [class.shadow]="activeTab() === 'admins'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">Admins</button>
           <button (click)="activeTab.set('musicians')" [class.bg-white]="activeTab() === 'musicians'" [class.shadow]="activeTab() === 'musicians'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">Musicians</button>
           <button (click)="activeTab.set('members')" [class.bg-white]="activeTab() === 'members'" [class.shadow]="activeTab() === 'members'" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-slate-600 transition">Members</button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
           <!-- Toolbar -->
           <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 class="font-bold text-slate-700 capitalize">{{ activeTab() }} List</h3>
             @if (store.userProfile().role === 'Admin') {
               <div class="flex gap-2">
                 <button (click)="openBulkAdd()" class="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                   </svg>
                   Bulk Add
                 </button>
                 <button (click)="openAddMember()" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                   </svg>
                   Add {{ activeTab().slice(0, -1) }}
                 </button>
               </div>
             }
           </div>

           <!-- List -->
           <div class="flex-1 overflow-y-auto p-0">
              @for (person of currentList(); track person.id) {
                 <div class="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition group">
                    <div class="flex items-center gap-4">
                       <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                          @if(person.avatarUrl) {
                             <img [src]="person.avatarUrl" class="w-full h-full object-cover">
                          } @else {
                             {{ person.name.charAt(0) }}
                          }
                       </div>
                       <div>
                          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                             {{ person.name }}
                             @if (person.birthdayMonth && person.birthdayDay) {
                                <span class="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full flex items-center border border-pink-100">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fill-rule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v.665a3.276 3.276 0 002.736 3.289A3.29 3.29 0 009 13h2a3.29 3.29 0 003.264-3.046A3.276 3.276 0 0017 6.665V6a2 2 0 00-2-2v-1a1 1 0 00-2 0v1h-1V3a1 1 0 00-2 0v1H9V3a1 1 0 00-2 0v1H6V3a1 1 0 00-1-1zm5-1h-.995v-.005A1 1 0 0011 2h.01a1 1 0 000 2H11V3a1 1 0 00-1-1h-.01a1 1 0 000 2H11v1h-2V4a1 1 0 00-1-1h-.01a1 1 0 000 2H9v1h2v.005z" clip-rule="evenodd" />
                                   </svg>
                                   {{ person.birthdayMonth }} {{ person.birthdayDay }}
                                </span>
                             }
                          </h4>
                          <div class="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                             <span class="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{{ person.role }}</span>
                             @if(person.email) { <span>{{ person.email }}</span> }
                             @if(person.phone) { <span class="text-slate-400">• {{ person.phone }}</span> }
                          </div>
                       </div>
                    </div>
                    
                    @if (store.userProfile().role === 'Admin') {
                      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                         <button (click)="openEditMember(person)" class="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg" title="Edit Member">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                         </button>
                         <button (click)="deleteMember(person.id)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Remove Member">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                      </div>
                    }
                 </div>
              }
              @if (currentList().length === 0) {
                 <div class="flex flex-col items-center justify-center p-12 text-slate-400">
                    <p>No {{ activeTab() }} found.</p>
                 </div>
              }
           </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal (Choir) -->
    @if (isEditingProfile()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <h3 class="text-xl font-bold text-slate-800 mb-6">Edit Choir Profile</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Choir Name</label>
              <input type="text" [(ngModel)]="editProfileData.name" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Logo URL</label>
              <input type="text" [(ngModel)]="editProfileData.logoUrl" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button (click)="isEditingProfile.set(false)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
            <button (click)="saveChoirProfile()" class="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow">Save Changes</button>
          </div>
        </div>
      </div>
    }

    <!-- Add/Edit Member Modal -->
    @if (isAddingMember() || isEditingMember()) {
       <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
             <h3 class="text-xl font-bold text-slate-800 mb-6">{{ isEditingMember() ? 'Edit' : 'Add New' }} {{ activeTab().slice(0, -1) }}</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                   <input type="text" [(ngModel)]="memberForm.name" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                   <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Part</label>
                   <input type="text" [(ngModel)]="memberForm.role" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Tenor, Drummer, Admin">
                </div>
                <div class="grid grid-cols-2 gap-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                      <input type="email" [(ngModel)]="memberForm.email" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                      <input type="tel" [(ngModel)]="memberForm.phone" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                   </div>
                </div>
                 <div class="grid grid-cols-2 gap-4">
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Birthday Month</label>
                      <select [(ngModel)]="memberForm.birthdayMonth" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                         <option value="">None</option>
                         <option value="January">January</option>
                         <option value="February">February</option>
                         <option value="March">March</option>
                         <option value="April">April</option>
                         <option value="May">May</option>
                         <option value="June">June</option>
                         <option value="July">July</option>
                         <option value="August">August</option>
                         <option value="September">September</option>
                         <option value="October">October</option>
                         <option value="November">November</option>
                         <option value="December">December</option>
                      </select>
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Day</label>
                      <input type="number" min="1" max="31" [(ngModel)]="memberForm.birthdayDay" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                   </div>
                </div>
             </div>
             <div class="flex justify-end gap-3 mt-8">
                <button (click)="closeMemberModal()" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button (click)="saveMember()" class="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow">Save</button>
             </div>
          </div>
       </div>
    }

    <!-- Bulk Add Modal -->
    @if (isBulkAdding()) {
       <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
             <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800">Bulk Add {{ activeTab() }}</h3>
                <button (click)="isBulkAdding.set(false)" class="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
             </div>
             <div class="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div class="space-y-3">
                   <div class="grid grid-cols-12 gap-2 px-1 mb-1 hidden md:grid">
                      <div class="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Name</div>
                      <div class="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Role / Part</div>
                      <div class="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Email</div>
                      <div class="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Phone</div>
                   </div>
                   @for (entry of bulkEntries(); track $index) {
                      <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-3 md:p-2 rounded-lg border border-slate-200 shadow-sm relative group">
                         <div class="md:col-span-3">
                            <input type="text" [(ngModel)]="entry.name" placeholder="Name" class="w-full p-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-indigo-500">
                         </div>
                         <div class="md:col-span-3">
                            <input type="text" [(ngModel)]="entry.role" placeholder="Role" class="w-full p-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-indigo-500">
                         </div>
                         <div class="md:col-span-3">
                            <input type="email" [(ngModel)]="entry.email" placeholder="Email" class="w-full p-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-indigo-500">
                         </div>
                         <div class="md:col-span-2">
                            <input type="tel" [(ngModel)]="entry.phone" placeholder="Phone" class="w-full p-2 rounded border border-slate-300 text-sm focus:ring-1 focus:ring-indigo-500">
                         </div>
                         <div class="md:col-span-1 flex justify-end">
                            <button (click)="removeBulkRow($index)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                               </svg>
                            </button>
                         </div>
                      </div>
                   }
                   <button (click)="addBulkRow()" class="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                      Add Another Row
                   </button>
                </div>
             </div>
             <div class="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                <button (click)="isBulkAdding.set(false)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button (click)="saveBulkMembers()" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Save All</button>
             </div>
          </div>
       </div>
    }
  `
})
export class ChoirManagerComponent {
  store = inject(StoreService);
  activeTab = signal<'admins' | 'musicians' | 'members'>('members');
  
  // Modal States
  isEditingProfile = signal(false);
  isAddingMember = signal(false);
  isEditingMember = signal(false);
  isBulkAdding = signal(false);

  // Form Data
  editProfileData = { name: '', logoUrl: '' };
  memberForm: Partial<ChoirMember> = {};
  editingId: string | null = null;
  bulkEntries = signal<Partial<ChoirMember>[]>([]);

  currentList = computed(() => {
     return this.store.choirGroup()[this.activeTab()];
  });

  // Profile Edit
  openEditProfile() {
     const g = this.store.choirGroup();
     this.editProfileData = { name: g.name, logoUrl: g.logoUrl || '' };
     this.isEditingProfile.set(true);
  }

  saveChoirProfile() {
     this.store.updateChoirProfile(this.editProfileData.name, this.editProfileData.logoUrl || undefined);
     this.isEditingProfile.set(false);
  }

  // Member CRUD
  openAddMember() {
     this.memberForm = {};
     this.isAddingMember.set(true);
     this.isEditingMember.set(false);
  }

  openEditMember(person: ChoirMember) {
     this.memberForm = { ...person };
     this.editingId = person.id;
     this.isEditingMember.set(true);
     this.isAddingMember.set(false);
  }

  closeMemberModal() {
     this.isAddingMember.set(false);
     this.isEditingMember.set(false);
     this.editingId = null;
     this.memberForm = {};
  }

  saveMember() {
     if (this.isEditingMember() && this.editingId) {
        this.store.updateChoirMember(this.activeTab(), this.editingId, this.memberForm);
     } else {
        const newMember: ChoirMember = {
           id: Date.now().toString(),
           name: this.memberForm.name || 'New Member',
           role: this.memberForm.role || 'Member',
           email: this.memberForm.email || '',
           phone: this.memberForm.phone || '',
           birthdayMonth: this.memberForm.birthdayMonth,
           birthdayDay: this.memberForm.birthdayDay
        };
        this.store.addChoirMember(this.activeTab(), newMember);
     }
     this.closeMemberModal();
  }

  deleteMember(id: string) {
     if (confirm('Are you sure you want to remove this person?')) {
        this.store.removeChoirMember(this.activeTab(), id);
     }
  }

  // Bulk Add
  openBulkAdd() {
     this.bulkEntries.set([{ name: '', role: '', email: '', phone: '' }]);
     this.isBulkAdding.set(true);
  }

  addBulkRow() {
     this.bulkEntries.update(l => [...l, { name: '', role: '', email: '', phone: '' }]);
  }

  removeBulkRow(index: number) {
     this.bulkEntries.update(l => l.filter((_, i) => i !== index));
  }

  saveBulkMembers() {
     const newMembers = this.bulkEntries()
        .filter(e => e.name)
        .map(e => ({
           id: Date.now().toString() + Math.random(),
           name: e.name!,
           role: e.role || 'Member',
           email: e.email || '',
           phone: e.phone || ''
        })) as ChoirMember[];
     
     if (newMembers.length > 0) {
        this.store.addChoirMembers(this.activeTab(), newMembers);
     }
     this.isBulkAdding.set(false);
  }
}
