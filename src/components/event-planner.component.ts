
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { StoreService, EventTask, Uniform, SingingSchedule, SingingAssignment, ChoirMember } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-planner',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass],
  template: `
    <div class="p-4 md:p-8 h-full flex flex-col overflow-hidden relative">
      <div class="max-w-screen-4k mx-auto w-full h-full flex flex-col">
        <!-- Header -->
        <header class="mb-4 md:mb-6 flex flex-col gap-4 shrink-0">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 class="text-2xl md:text-3xl font-bold text-slate-800">{{ store.t().events.title }}</h2>
              <p class="text-xs md:text-base text-slate-500">{{ store.t().events.subtitle }}</p>
            </div>
            
             <!-- View Switcher -->
             <div class="bg-slate-100 p-1 rounded-lg flex self-start md:self-auto shrink-0 overflow-x-auto max-w-full">
               <button 
                 (click)="viewMode.set('board')"
                 [class.bg-white]="viewMode() === 'board'"
                 [class.shadow-sm]="viewMode() === 'board'"
                 [class.text-slate-800]="viewMode() === 'board'"
                 [class.text-slate-500]="viewMode() !== 'board'"
                 class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap"
               >{{ store.t().events.kanban }}</button>
               <button 
                 (click)="viewMode.set('calendar')"
                 [class.bg-white]="viewMode() === 'calendar'"
                 [class.shadow-sm]="viewMode() === 'calendar'"
                 [class.text-slate-800]="viewMode() === 'calendar'"
                 [class.text-slate-500]="viewMode() !== 'calendar'"
                 class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap"
               >{{ store.t().events.dates }}</button>
               
               @if (store.userProfile().role === 'Admin') {
                  <button 
                    (click)="viewMode.set('uniforms')"
                    [class.bg-white]="viewMode() === 'uniforms'"
                    [class.shadow-sm]="viewMode() === 'uniforms'"
                    [class.text-slate-800]="viewMode() === 'uniforms'"
                    [class.text-slate-500]="viewMode() !== 'uniforms'"
                    class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap"
                  >{{ store.t().events.dripCheck }}</button>
               }

               <button 
                 (click)="viewMode.set('singing')"
                 [class.bg-white]="viewMode() === 'singing'"
                 [class.shadow-sm]="viewMode() === 'singing'"
                 [class.text-slate-800]="viewMode() === 'singing'"
                 [class.text-slate-500]="viewMode() !== 'singing'"
                 class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap"
               >{{ store.t().events.micDuty }}</button>
            </div>
          </div>

          @if (viewMode() === 'board') {
            <!-- Generation & Bulk Controls -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
                <input type="text" [(ngModel)]="eventName" placeholder="Event Name" class="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <div class="flex gap-2">
                  <input type="date" [(ngModel)]="eventDate" class="flex-1 sm:flex-none bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  
                  <button (click)="openBulkAddTasks()" class="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 text-sm font-bold transition flex items-center justify-center whitespace-nowrap">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     {{ store.t().events.bulkAdd }}
                  </button>

                  <button (click)="generatePlan()" [disabled]="isGenerating()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold transition flex items-center justify-center whitespace-nowrap min-w-[100px]">
                     @if (isGenerating()) {
                       <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Generating...
                     } @else {
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                       {{ store.t().events.aiCook }}
                     }
                  </button>
                </div>
            </div>

            <!-- Filter & Sort Bar -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span class="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{{ store.t().events.vibeCheck }}</span>
                <div class="flex bg-slate-100 rounded-lg p-1 shrink-0">
                  <button 
                    (click)="filterStatus.set('all')"
                    [class.bg-white]="filterStatus() === 'all'"
                    [class.shadow-sm]="filterStatus() === 'all'"
                    [class.text-slate-800]="filterStatus() === 'all'"
                    [class.text-slate-500]="filterStatus() !== 'all'"
                    class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all"
                  >All</button>
                  <button 
                    (click)="filterStatus.set('todo')"
                    [class.bg-white]="filterStatus() === 'todo'"
                    [class.shadow-sm]="filterStatus() === 'todo'"
                    [class.text-slate-800]="filterStatus() === 'todo'"
                    [class.text-slate-500]="filterStatus() !== 'todo'"
                    class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all"
                  >{{ store.t().events.todo }}</button>
                  <button 
                    (click)="filterStatus.set('doing')"
                    [class.bg-white]="filterStatus() === 'doing'"
                    [class.shadow-sm]="filterStatus() === 'doing'"
                    [class.text-slate-800]="filterStatus() === 'doing'"
                    [class.text-slate-500]="filterStatus() !== 'doing'"
                    class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all"
                  >{{ store.t().events.doing }}</button>
                  <button 
                    (click)="filterStatus.set('done')"
                    [class.bg-white]="filterStatus() === 'done'"
                    [class.shadow-sm]="filterStatus() === 'done'"
                    [class.text-slate-800]="filterStatus() === 'done'"
                    [class.text-slate-500]="filterStatus() !== 'done'"
                    class="px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all"
                  >{{ store.t().events.done }}</button>
                </div>
              </div>

              <div class="hidden sm:block h-6 w-px bg-slate-200"></div>

              <div class="flex items-center gap-2">
                 <span class="text-xs font-bold text-slate-500 uppercase">Sort:</span>
                 <button 
                   (click)="toggleSort()"
                   class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-medium text-slate-700 transition"
                 >
                   @if (sortOrder() === 'asc') {
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                     </svg>
                     Earliest
                   } @else {
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                     </svg>
                     Latest
                   }
                 </button>
              </div>
              
              <div class="hidden sm:block h-6 w-px bg-slate-200"></div>
              
              <div class="flex items-center gap-2">
                 <span class="text-xs font-bold text-slate-500 uppercase">For:</span>
                 <select [(ngModel)]="filterAssignee" class="bg-slate-100 border-none rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="">Everyone</option>
                    @for (member of allMembers(); track member.id) {
                       <option [value]="member.name">{{ member.name }}</option>
                    }
                 </select>
              </div>
            </div>
          }
        </header>

          <!-- Main Content Area -->
          <div class="flex-1 overflow-hidden relative flex flex-col">
            <!-- ... (Keeping existing template content as is, just need to update the TS method signature for openImage) ... -->
            
            <!-- Kanban Board View -->
            @if (viewMode() === 'board') {
              <div class="absolute inset-0 overflow-y-auto md:overflow-hidden pb-20 md:pb-0">
                 <div class="grid gap-6 h-auto md:h-full min-w-full" 
                      [class.grid-cols-1]="true"
                      [class.md:grid-cols-3]="filterStatus() === 'all'"
                      [class.md:grid-cols-1]="filterStatus() !== 'all'">
                
                  <!-- To Do -->
                  @if (filterStatus() === 'all' || filterStatus() === 'todo') {
                    <div class="bg-slate-100 rounded-xl p-4 flex flex-col h-[500px] md:h-full border border-slate-200/60 shrink-0">
                      <h3 class="font-bold text-slate-700 mb-4 flex items-center justify-between shrink-0">
                        <span class="flex items-center">
                          <span class="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> {{ store.t().events.todo }}
                        </span>
                        <span class="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{{ todoTasks().length }}</span>
                      </h3>
                      <div class="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                         @for (task of todoTasks(); track task.id) {
                           <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition group relative">
                             <!-- Edit Button -->
                             <button (click)="openEditTask(task)" class="absolute top-2 right-2 text-slate-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition p-1 bg-white/80 rounded-full hover:bg-slate-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                             </button>
    
                             <p class="font-medium text-slate-800 pr-6 text-sm md:text-base">{{task.title}}</p>
                             
                             <div class="flex items-center justify-between mt-3">
                                <p class="text-xs text-red-500 font-mono flex items-center bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {{task.deadline | date:'MMM d, y'}}
                                </p>
                                
                                @if (task.assignee) {
                                   <div class="flex items-center text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200" title="Assigned to {{task.assignee}}">
                                      <span class="mr-1">👤</span> {{ task.assignee }}
                                   </div>
                                }
                             </div>
    
                             <div class="mt-3 flex gap-2">
                                <button (click)="moveTask(task, 'doing')" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition">Start →</button>
                             </div>
                           </div>
                         }
                         @if (todoTasks().length === 0) {
                           <div class="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                             No pending tasks
                           </div>
                         }
                      </div>
                    </div>
                  }
    
                  <!-- In Progress -->
                  @if (filterStatus() === 'all' || filterStatus() === 'doing') {
                    <div class="bg-blue-50/80 rounded-xl p-4 flex flex-col h-[500px] md:h-full border border-blue-100 shrink-0">
                      <h3 class="font-bold text-blue-800 mb-4 flex items-center justify-between shrink-0">
                        <span class="flex items-center">
                          <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> {{ store.t().events.doing }}
                        </span>
                        <span class="bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full">{{ doingTasks().length }}</span>
                      </h3>
                      <div class="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                         @for (task of doingTasks(); track task.id) {
                           <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition relative group">
                             <!-- Edit Button -->
                             <button (click)="openEditTask(task)" class="absolute top-2 right-2 text-slate-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition p-1 bg-white/80 rounded-full hover:bg-slate-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                             </button>
    
                             <p class="font-medium text-slate-800 text-sm md:text-base pr-6">{{task.title}}</p>
                             
                             <div class="flex items-center justify-between mt-2">
                                <p class="text-xs text-slate-400 font-mono flex items-center">
                                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                   Due: {{task.deadline | date:'MMM d, y'}}
                                </p>
                                @if (task.assignee) {
                                   <div class="flex items-center text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200" title="Assigned to {{task.assignee}}">
                                      <span class="mr-1">👤</span> {{ task.assignee }}
                                   </div>
                                }
                             </div>
    
                             <div class="mt-3 flex gap-2">
                                <button (click)="moveTask(task, 'todo')" class="text-xs text-slate-400 hover:text-slate-600">← Back</button>
                                <button (click)="moveTask(task, 'done')" class="text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition ml-auto">Complete ✓</button>
                             </div>
                           </div>
                         }
                         @if (doingTasks().length === 0) {
                           <div class="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-blue-200 rounded-lg">
                             Nothing in progress
                           </div>
                         }
                      </div>
                    </div>
                  }
    
                  <!-- Done -->
                  @if (filterStatus() === 'all' || filterStatus() === 'done') {
                    <div class="bg-green-50/80 rounded-xl p-4 flex flex-col h-[500px] md:h-full border border-green-100 shrink-0">
                      <h3 class="font-bold text-green-800 mb-4 flex items-center justify-between shrink-0">
                        <span class="flex items-center">
                          <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {{ store.t().events.done }}
                        </span>
                        <span class="bg-green-200 text-green-700 text-xs px-2 py-0.5 rounded-full">{{ doneTasks().length }}</span>
                      </h3>
                      <div class="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                         @for (task of doneTasks(); track task.id) {
                           <div class="bg-white p-4 rounded-lg shadow-sm opacity-70 hover:opacity-100 transition border border-slate-100 group relative">
                             <!-- Edit Button -->
                             <button (click)="openEditTask(task)" class="absolute top-2 right-2 text-slate-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition p-1 bg-white/80 rounded-full hover:bg-slate-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                             </button>
    
                             <div class="flex items-start justify-between">
                                <p class="font-medium text-slate-800 line-through decoration-slate-400 decoration-2 text-sm md:text-base pr-6">{{task.title}}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                             </div>
                             <p class="text-xs text-green-600 mt-2 font-bold flex items-center justify-between">
                               <span>Completed</span>
                               @if (task.assignee) {
                                  <span class="text-slate-400 font-normal ml-2">by {{ task.assignee }}</span>
                               }
                             </p>
                             <div class="mt-2 pt-2 border-t border-slate-50">
                                <button (click)="moveTask(task, 'doing')" class="text-xs text-slate-400 hover:text-blue-600">Reopen</button>
                             </div>
                           </div>
                         }
                         @if (doneTasks().length === 0) {
                           <div class="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-green-200 rounded-lg">
                             No completed tasks
                           </div>
                         }
                      </div>
                    </div>
                  }
                </div>
              </div>
              <!-- ... Bulk Add Tasks Modal ... -->
              @if(isBulkAddingTasks()) {
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                           <h3 class="text-2xl font-bold text-slate-800">Bulk Add Tasks</h3>
                           <button (click)="isBulkAddingTasks.set(false)" class="text-slate-400 hover:text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-3">
                           <div class="grid grid-cols-1 md:grid-cols-12 gap-2 px-2 mb-2 hidden md:grid">
                              <div class="md:col-span-4 text-[10px] font-bold text-slate-400 uppercase">Task Title</div>
                              <div class="md:col-span-3 text-[10px] font-bold text-slate-400 uppercase">Assignee</div>
                              <div class="md:col-span-3 text-[10px] font-bold text-slate-400 uppercase">Deadline</div>
                              <div class="md:col-span-2 text-[10px] font-bold text-slate-400 uppercase">Status</div>
                           </div>
                           @for (entry of bulkTasks(); track $index) {
                              <div class="bg-white p-4 md:p-2 rounded-xl border border-slate-200 shadow-sm relative group grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                 <button (click)="removeBulkTaskRow($index)" class="absolute top-2 right-2 md:-right-2 md:-top-2 bg-white rounded-full p-1 text-slate-300 hover:text-red-500 shadow-sm border border-slate-100 md:opacity-0 group-hover:opacity-100 transition z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                 </button>
                                 <div class="md:col-span-4">
                                    <label class="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                                    <input type="text" [(ngModel)]="entry.title" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="Task Description">
                                 </div>
                                 <div class="md:col-span-3">
                                    <label class="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Assignee</label>
                                    <select [(ngModel)]="entry.assignee" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white">
                                       <option value="">Unassigned</option>
                                       @for (member of allMembers(); track member.id) {
                                          <option [value]="member.name">{{ member.name }}</option>
                                       }
                                    </select>
                                 </div>
                                 <div class="md:col-span-3">
                                    <label class="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Deadline</label>
                                    <input type="date" [(ngModel)]="entry.deadline" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500">
                                 </div>
                                 <div class="md:col-span-2">
                                    <label class="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <select [(ngModel)]="entry.status" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white">
                                       <option value="todo">To Do</option>
                                       <option value="doing">In Progress</option>
                                       <option value="done">Done</option>
                                    </select>
                                 </div>
                              </div>
                           }
                           <button (click)="addBulkTaskRow()" class="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Another Task
                           </button>
                        </div>
                        <div class="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                           <button (click)="isBulkAddingTasks.set(false)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                           <button (click)="saveBulkTasks()" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Save Tasks</button>
                        </div>
                     </div>
                  </div>
               }
               <!-- ... Edit Modal ... -->
               @if(editingTask()) {
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col">
                        <h3 class="text-xl font-bold text-slate-800 mb-6">Edit Task</h3>
                        <div class="space-y-4">
                           <div>
                              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                              <input type="text" [(ngModel)]="editingTask()!.title" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500">
                           </div>
                           <div>
                              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Assign To</label>
                              <select [(ngModel)]="editingTask()!.assignee" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                                 <option value="">Unassigned</option>
                                 @for (member of allMembers(); track member.id) {
                                    <option [value]="member.name">{{ member.name }}</option>
                                 }
                              </select>
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                                 <input type="date" [(ngModel)]="editingTask()!.deadline" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500">
                              </div>
                              <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                 <select [(ngModel)]="editingTask()!.status" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                                    <option value="todo">To Do</option>
                                    <option value="doing">In Progress</option>
                                    <option value="done">Done</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-8">
                           <button (click)="editingTask.set(null)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                           <button (click)="saveEditedTask()" class="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow">Save Changes</button>
                        </div>
                     </div>
                  </div>
               }
            }
            
            <!-- Calendar View -->
            @if (viewMode() === 'calendar') {
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
                <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl shrink-0">
                   <button (click)="changeMonth(-1)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                     </svg>
                   </button>
                   <h3 class="text-lg font-bold text-slate-800">{{ currentCalendarDate() | date:'MMMM yyyy' }}</h3>
                   <button (click)="changeMonth(1)" class="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                     </svg>
                   </button>
                </div>
                <div class="flex-1 overflow-auto bg-slate-100 relative">
                   <div class="min-w-[700px] h-full flex flex-col">
                      <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                         @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
                           <div class="py-2 text-center text-xs font-bold text-slate-500 uppercase">{{day}}</div>
                         }
                      </div>
                      <div class="grid grid-cols-7 grid-rows-5 flex-1 gap-px border-b border-l border-slate-200">
                         @for (day of calendarDays(); track $index) {
                           <div class="bg-white relative min-h-[80px] p-2 flex flex-col hover:bg-slate-50 transition overflow-hidden">
                             @if (day) {
                                <span 
                                  [class.bg-brand-600]="isToday(day)"
                                  [class.text-white]="isToday(day)"
                                  [class.text-slate-400]="!isToday(day)"
                                  class="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 shrink-0"
                                >
                                  {{ day.getDate() }}
                                </span>
                                <div class="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                                  @for (task of getTasksForDate(day); track task.id) {
                                    <div class="text-[10px] px-1.5 py-1 rounded border-l-2 flex flex-col"
                                       [class.bg-red-50]="task.status === 'todo'"
                                       [class.border-red-400]="task.status === 'todo'"
                                       [class.text-red-700]="task.status === 'todo'"
                                       [class.bg-blue-50]="task.status === 'doing'"
                                       [class.border-blue-400]="task.status === 'doing'"
                                       [class.text-blue-700]="task.status === 'doing'"
                                       [class.bg-green-50]="task.status === 'done'"
                                       [class.border-green-400]="task.status === 'done'"
                                       [class.text-green-700]="task.status === 'done'"
                                       [class.line-through]="task.status === 'done'"
                                       [class.opacity-60]="task.status === 'done'"
                                    >
                                       <span class="truncate font-semibold">{{task.title}}</span>
                                       @if (task.assignee) {
                                          <span class="text-[8px] flex items-center gap-1 mt-0.5 opacity-80" [class.font-bold]="task.assignee === store.userProfile().name" [class.text-brand-700]="task.assignee === store.userProfile().name">
                                             @if(task.assignee === store.userProfile().name) {
                                                <span>★ You</span>
                                             } @else {
                                                <span>👤 {{ task.assignee.split(' ')[0] }}</span>
                                             }
                                          </span>
                                       }
                                    </div>
                                  }
                                </div>
                             }
                           </div>
                         }
                      </div>
                   </div>
                </div>
              </div>
            }
    
            <!-- Uniforms Admin View -->
            @if (viewMode() === 'uniforms' && store.userProfile().role === 'Admin') {
               <div class="flex-1 overflow-y-auto p-1">
                  <!-- Generator Card -->
                  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                     <h3 class="text-lg font-bold text-slate-800 mb-4">Quarterly Schedule Generator</h3>
                     <!-- ... (No changes here) ... -->
                     <div class="flex flex-col sm:flex-row gap-4 items-end">
                        <div class="flex-1">
                           <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                           <select [(ngModel)]="genYear" class="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50">
                              <option [value]="2023">2023</option>
                              <option [value]="2024">2024</option>
                              <option [value]="2025">2025</option>
                              <option [value]="2026">2026</option>
                           </select>
                        </div>
                        <div class="flex-1">
                           <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Quarter</label>
                           <select [(ngModel)]="genQuarter" class="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50">
                              <option [value]="1">Q1 (Jan - Mar)</option>
                              <option [value]="2">Q2 (Apr - Jun)</option>
                              <option [value]="3">Q3 (Jul - Sep)</option>
                              <option [value]="4">Q4 (Oct - Dec)</option>
                           </select>
                        </div>
                        <div class="flex gap-2">
                           <button (click)="generateQuarterSchedule()" class="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-800 transition shadow-lg">
                              Generate Draft
                           </button>
                           <button (click)="openBulkAdd()" class="bg-white text-slate-700 border border-slate-300 font-bold py-2.5 px-6 rounded-lg hover:bg-slate-50 transition shadow-sm">
                              Do it myself
                           </button>
                        </div>
                     </div>
                     <p class="text-xs text-slate-500 mt-2">Automatically sets 1st Sunday of each month as "Thanksgiving Vibe".</p>
                  </div>
    
                  <!-- Schedule List (Table Style) -->
                  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 border-b border-slate-200">
                           <tr>
                              <th class="p-4 font-bold text-slate-600">Date</th>
                              <th class="p-4 font-bold text-slate-600">Title / Type</th>
                              <th class="p-4 font-bold text-slate-600 hidden md:table-cell">The Fit & The Moodboard</th>
                              <th class="p-4 font-bold text-slate-600 text-right">Moves</th>
                           </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                           @for (u of sortedUniforms(); track u.id) {
                              <tr class="hover:bg-slate-50 group">
                                 <td class="p-4 font-medium text-slate-800 whitespace-nowrap align-top">
                                    {{ u.date | date:'MMM d, y' }}
                                    @if(u.isFirstSunday) {
                                       <span class="block text-[10px] text-orange-600 font-bold uppercase mt-1">Thanksgiving</span>
                                    }
                                 </td>
                                 <td class="p-4 align-top">
                                    <div class="font-bold text-slate-800">{{ u.title }}</div>
                                    <div class="md:hidden mt-2 text-xs text-slate-500">
                                       <p><span class="font-bold">Queens:</span> {{ u.ladies || '-' }}</p>
                                       <p><span class="font-bold">Kings:</span> {{ u.guys || '-' }}</p>
                                    </div>
                                 </td>
                                 <td class="p-4 hidden md:table-cell align-top">
                                    @if(!u.isFirstSunday) {
                                       <div class="grid grid-cols-2 gap-4">
                                          <div>
                                             <span class="text-[10px] uppercase font-bold text-pink-500 flex items-center gap-1 mb-1">
                                                <span>Queens</span>
                                                @if (u.ladiesInspoImg) {
                                                   <span class="text-xs text-brand-600" title="Has image">🖼️</span>
                                                }
                                             </span>
                                             <p class="text-xs text-slate-600 mb-2">{{ u.ladies || 'No instruction' }}</p>
                                             @if (u.ladiesInspoImg) {
                                                <div (click)="openImage(u.ladiesInspoImg)" class="h-20 w-16 rounded border border-slate-200 overflow-hidden relative group/img cursor-pointer shadow-sm hover:ring-2 hover:ring-pink-300 transition">
                                                   <img [src]="u.ladiesInspoImg" class="w-full h-full object-cover">
                                                </div>
                                             }
                                          </div>
                                          <div>
                                             <span class="text-[10px] uppercase font-bold text-blue-500 flex items-center gap-1 mb-1">
                                                <span>Kings</span>
                                                @if (u.guysInspoImg) {
                                                   <span class="text-xs text-brand-600" title="Has image">🖼️</span>
                                                }
                                             </span>
                                             <p class="text-xs text-slate-600 mb-2">{{ u.guys || 'No instruction' }}</p>
                                             @if (u.guysInspoImg) {
                                                <div (click)="openImage(u.guysInspoImg)" class="h-20 w-16 rounded border border-slate-200 overflow-hidden relative group/img cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-300 transition">
                                                   <img [src]="u.guysInspoImg" class="w-full h-full object-cover">
                                                </div>
                                             }
                                          </div>
                                       </div>
                                       @if(u.comments) {
                                          <div class="mt-2 text-xs italic text-slate-500 bg-yellow-50 p-1 rounded inline-block">Note: {{u.comments}}</div>
                                       }
                                    } @else {
                                       <span class="text-slate-400 italic">No uniform required</span>
                                    }
                                 </td>
                                 <td class="p-4 text-right align-top">
                                    <button (click)="editUniform(u)" class="text-brand-600 font-bold hover:underline text-xs mr-3">Edit</button>
                                    <button (click)="deleteUniform(u.id)" class="text-red-500 font-bold hover:underline text-xs">Delete</button>
                                 </td>
                              </tr>
                           }
                        </tbody>
                     </table>
                     @if (sortedUniforms().length === 0) {
                        <div class="p-8 text-center text-slate-400">No uniform schedule found. Generate one above.</div>
                     }
                  </div>
               </div>
    
               <!-- Edit Modal -->
               @if(editingUniform()) {
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h3 class="text-2xl font-bold text-slate-800 mb-6">Edit Uniform: {{ editingUniform()!.date | date:'mediumDate' }}</h3>
                        
                        <div class="space-y-4">
                           <!-- Title & Type -->
                           <div class="flex gap-4">
                              <div class="flex-1">
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                 <input type="text" [(ngModel)]="editingUniform()!.title" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                              </div>
                              <div class="flex items-end pb-3">
                                 <label class="flex items-center cursor-pointer">
                                    <input type="checkbox" [(ngModel)]="editingUniform()!.isFirstSunday" class="form-checkbox h-5 w-5 text-brand-600 rounded">
                                    <span class="ml-2 text-sm text-slate-700">Is Thanksgiving / 1st Sunday?</span>
                                 </label>
                              </div>
                           </div>
    
                           @if(!editingUniform()!.isFirstSunday) {
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <!-- Ladies Column -->
                                 <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <label class="block text-xs font-bold text-pink-500 uppercase mb-2">For the Queens</label>
                                    <textarea [(ngModel)]="editingUniform()!.ladies" rows="3" class="w-full border border-slate-300 rounded-lg p-2.5 resize-none outline-none focus:ring-2 focus:ring-pink-500 mb-2 text-sm" placeholder="What's the fit?"></textarea>
                                    
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Inspo Pic</label>
                                    <div class="flex gap-2 items-start">
                                       @if(editingUniform()!.ladiesInspoImg) {
                                          <div class="h-20 w-16 rounded border border-slate-300 overflow-hidden relative group">
                                             <img [src]="editingUniform()!.ladiesInspoImg" class="w-full h-full object-cover">
                                             <button (click)="editingUniform()!.ladiesInspoImg = ''" class="absolute top-0 right-0 bg-black/50 text-white p-1 opacity-0 group-hover:opacity-100">
                                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                             </button>
                                          </div>
                                       }
                                       <div class="flex-1">
                                          <input #ladiesFile type="file" accept="image/*" class="hidden" (change)="handleInspoUpload($event, 'edit', 'ladies')">
                                          <button (click)="ladiesFile.click()" class="w-full bg-white border border-slate-300 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition">Upload Image</button>
                                          <input type="text" [(ngModel)]="editingUniform()!.ladiesInspoImg" placeholder="Or paste URL" class="w-full mt-1 border-b border-slate-300 bg-transparent text-[10px] p-1 focus:border-pink-500 outline-none">
                                       </div>
                                    </div>
                                 </div>
    
                                 <!-- Guys Column -->
                                 <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <label class="block text-xs font-bold text-blue-500 uppercase mb-2">For the Kings</label>
                                    <textarea [(ngModel)]="editingUniform()!.guys" rows="3" class="w-full border border-slate-300 rounded-lg p-2.5 resize-none outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-sm" placeholder="What's the fit?"></textarea>
                                    
                                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Inspo Pic</label>
                                    <div class="flex gap-2 items-start">
                                       @if(editingUniform()!.guysInspoImg) {
                                          <div class="h-20 w-16 rounded border border-slate-300 overflow-hidden relative group">
                                             <img [src]="editingUniform()!.guysInspoImg" class="w-full h-full object-cover">
                                             <button (click)="editingUniform()!.guysInspoImg = ''" class="absolute top-0 right-0 bg-black/50 text-white p-1 opacity-0 group-hover:opacity-100">
                                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                             </button>
                                          </div>
                                       }
                                       <div class="flex-1">
                                          <input #guysFile type="file" accept="image/*" class="hidden" (change)="handleInspoUpload($event, 'edit', 'guys')">
                                          <button (click)="guysFile.click()" class="w-full bg-white border border-slate-300 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition">Upload Image</button>
                                          <input type="text" [(ngModel)]="editingUniform()!.guysInspoImg" placeholder="Or paste URL" class="w-full mt-1 border-b border-slate-300 bg-transparent text-[10px] p-1 focus:border-blue-500 outline-none">
                                       </div>
                                    </div>
                                 </div>
                              </div>
    
                              <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Comments / Notes</label>
                                 <input type="text" [(ngModel)]="editingUniform()!.comments" class="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500">
                              </div>
                              
                              <div>
                                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Color Theme (Hex)</label>
                                 <div class="flex items-center gap-2">
                                    <input type="color" [(ngModel)]="editingUniform()!.colorHex" class="h-10 w-10 border-0 p-0 rounded cursor-pointer">
                                    <input type="text" [(ngModel)]="editingUniform()!.colorHex" class="border border-slate-300 rounded-lg p-2.5 w-32 uppercase outline-none focus:ring-2 focus:ring-brand-500">
                                 </div>
                              </div>
                           }
                        </div>
    
                        <div class="flex justify-end gap-3 mt-8">
                           <button (click)="editingUniform.set(null)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                           <button (click)="saveEditedUniform()" class="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow">Save Changes</button>
                        </div>
                     </div>
                  </div>
               }
    
               <!-- Bulk Add Uniforms Modal -->
               @if(isBulkAdding()) {
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                           <h3 class="text-2xl font-bold text-slate-800">Bulk Add Uniforms</h3>
                           <button (click)="isBulkAdding.set(false)" class="text-slate-400 hover:text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                            <p class="text-sm text-slate-500 mb-4">Note: Detailed inspiration images can be added via the 'Edit' button after creating the schedule.</p>
                           @for (entry of bulkEntries(); track $index) {
                              <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                 <button (click)="removeBulkRow($index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                 </button>
                                 <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div class="md:col-span-3 space-y-3">
                                       <div>
                                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                          <input type="date" [(ngModel)]="entry.date" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                                       </div>
                                       <div class="flex items-center">
                                          <input type="checkbox" [(ngModel)]="entry.isFirstSunday" class="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500">
                                          <span class="ml-2 text-xs font-medium text-slate-700">Thanksgiving / 1st Sun</span>
                                       </div>
                                    </div>
                                    <div class="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div class="md:col-span-2">
                                          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                          <input type="text" [(ngModel)]="entry.title" class="w-full border border-slate-300 rounded-lg p-2 text-sm" placeholder="e.g. Navy Blue Sunday">
                                       </div>
                                       @if(!entry.isFirstSunday) {
                                          <div>
                                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Ladies</label>
                                             <textarea [(ngModel)]="entry.ladies" rows="2" class="w-full border border-slate-300 rounded-lg p-2 text-sm resize-none" placeholder="Attire instructions..."></textarea>
                                          </div>
                                          <div>
                                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Guys</label>
                                             <textarea [(ngModel)]="entry.guys" rows="2" class="w-full border border-slate-300 rounded-lg p-2 text-sm resize-none" placeholder="Attire instructions..."></textarea>
                                          </div>
                                          <div class="md:col-span-2">
                                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Comments</label>
                                             <input type="text" [(ngModel)]="entry.comments" class="w-full border border-slate-300 rounded-lg p-2 text-sm" placeholder="Extra notes...">
                                          </div>
                                       }
                                    </div>
                                 </div>
                              </div>
                           }
                           <button (click)="addBulkRow()" class="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Another Row
                           </button>
                        </div>
                        <div class="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                           <button (click)="isBulkAdding.set(false)" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                           <button (click)="saveBulkEntries()" class="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow">Save All Entries</button>
                        </div>
                     </div>
                  </div>
               }
            }
            
            <!-- Singing Schedule View -->
            @if (viewMode() === 'singing') {
               <div class="flex-1 overflow-y-auto p-1">
                 <div class="flex justify-between items-center mb-6">
                   <h3 class="text-xl font-bold text-slate-800">Singing Schedules</h3>
                   @if (store.userProfile().role === 'Admin') {
                     <button (click)="openSingingBulkAdd()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold text-sm transition flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Import Text Schedule
                     </button>
                   }
                 </div>
                 @if (sortedSingingSchedules().length === 0) {
                   <div class="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <p class="text-lg font-medium">No singing schedules found.</p>
                   </div>
                 }
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   @for (schedule of sortedSingingSchedules(); track schedule.id) {
                     <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                       <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                         <h4 class="font-bold text-slate-800">{{ schedule.date | date:'fullDate' }}</h4>
                         @if (store.userProfile().role === 'Admin') {
                           <button (click)="deleteSingingSchedule(schedule.id)" class="text-red-500 hover:text-red-700 p-1">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                             </svg>
                           </button>
                         }
                       </div>
                       <div class="divide-y divide-slate-100">
                         @for (assign of schedule.assignments; track $index) {
                           <div class="p-4">
                             <div class="flex items-start justify-between mb-2">
                               <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ assign.role }}</span>
                               <span class="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-bold">{{ assign.lead }}</span>
                             </div>
                             @if (assign.backups && assign.backups.length > 0) {
                                <div class="text-sm text-slate-600 pl-2 border-l-2 border-slate-200">
                                   <span class="text-xs text-slate-400 mr-1">Backups:</span>
                                   {{ assign.backups.join(', ') }}
                                </div>
                             }
                           </div>
                         }
                       </div>
                     </div>
                   }
                 </div>
               </div>
    
               <!-- Singing Import Modal -->
               @if (isSingingImporting()) {
                  <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                     <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                           <h3 class="text-2xl font-bold text-slate-800">Import Singing Schedule</h3>
                           <button (click)="isSingingImporting.set(false)" class="text-slate-400 hover:text-slate-600">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                        <div class="flex-1 p-6 overflow-y-auto">
                          <p class="text-sm text-slate-500 mb-4">Paste the raw schedule text below.</p>
                          <textarea [(ngModel)]="singingImportText" class="w-full h-64 p-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm resize-none mb-4" placeholder="e.g. 1st Feb- Leads: Call to Worship: Sis Lami..."></textarea>
                          @if (parsedSingingPreview().length > 0) {
                            <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                               <h4 class="font-bold text-indigo-800 mb-2">Preview ({{parsedSingingPreview().length}} dates found)</h4>
                               <div class="space-y-2 max-h-40 overflow-y-auto text-xs text-indigo-700">
                                  @for(item of parsedSingingPreview(); track $index) {
                                     <div>
                                        <span class="font-bold">{{item.date}}:</span>
                                        {{ item.assignments.length }} assignments
                                     </div>
                                  }
                               </div>
                            </div>
                          }
                        </div>
                        <div class="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                           <button (click)="analyzeSchedule()" [disabled]="isAnalyzing()" class="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">
                              @if(isAnalyzing()) { Parsing... } @else { AI Analyze }
                           </button>
                           <button (click)="saveSingingImport()" [disabled]="parsedSingingPreview().length === 0" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow disabled:opacity-50">Save Schedule</button>
                        </div>
                     </div>
                  </div>
               }
            }
          </div>
      </div>

      <!-- Image Viewer Modal (Full Screen) -->
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
    </div>
  `
})
export class EventPlannerComponent implements OnInit {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  viewMode = signal<'board' | 'calendar' | 'uniforms' | 'singing'>('board');
  
  // Kanban State
  eventName = '';
  eventDate = '';
  isGenerating = signal(false);
  filterStatus = signal<'all' | 'todo' | 'doing' | 'done'>('all');
  sortOrder = signal<'asc' | 'desc'>('asc');
  filterAssignee = signal(''); // Added Assignee Filter
  
  todoTasks = computed(() => this.filterAndSortTasks('todo'));
  doingTasks = computed(() => this.filterAndSortTasks('doing'));
  doneTasks = computed(() => this.filterAndSortTasks('done'));

  // Bulk Add State (Tasks)
  isBulkAddingTasks = signal(false);
  bulkTasks = signal<Partial<EventTask>[]>([]);

  // Editing State (Tasks)
  editingTask = signal<EventTask | null>(null);

  // Calendar State
  currentCalendarDate = signal(new Date());
  calendarDays = computed(() => {
    const year = this.currentCalendarDate().getFullYear();
    const month = this.currentCalendarDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    // Fill empty slots for previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Fill days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  });

  // Uniforms State
  genYear = new Date().getFullYear();
  genQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  sortedUniforms = computed(() => {
     return this.store.uniformSchedule().slice().sort((a, b) => a.date.localeCompare(b.date));
  });
  
  editingUniform = signal<Uniform | null>(null);
  viewingImage = signal<string | null>(null); // State for image popup
  
  // Bulk Add Uniforms State
  isBulkAdding = signal(false);
  bulkEntries = signal<Partial<Uniform>[]>([]);

  // Singing Schedule State
  sortedSingingSchedules = computed(() => {
    return this.store.singingSchedule().slice().sort((a, b) => b.date.localeCompare(a.date)); // Descending usually better for lists
  });
  isSingingImporting = signal(false);
  singingImportText = '';
  parsedSingingPreview = signal<SingingSchedule[]>([]);
  isAnalyzing = signal(false);

  // Helper for assignment dropdowns
  allMembers = computed(() => {
     const group = this.store.choirGroup();
     return [...group.admins, ...group.musicians, ...group.members];
  });


  ngOnInit() {
     // Check query params
     this.route.queryParams.subscribe(params => {
        if (params['view'] && ['board', 'calendar', 'uniforms', 'singing'].includes(params['view'])) {
           this.viewMode.set(params['view']);
        }
     });

     // Check for reminders
     this.store.checkTaskReminders();
  }

  // --- Image Popup Logic ---
  openImage(url: string | undefined) { // Updated to allow undefined check
    if(url) this.viewingImage.set(url);
  }

  closeImage() {
    this.viewingImage.set(null);
  }

  // --- Kanban Logic ---

  async generatePlan() {
    if (!this.eventName || !this.eventDate) {
      alert('Please enter an event name and date.');
      return;
    }
    
    this.isGenerating.set(true);
    const result = await this.gemini.generateEventPlan(this.eventName, this.eventDate);
    try {
      const tasks: any[] = JSON.parse(result);
      if (Array.isArray(tasks)) {
         tasks.forEach((t, i) => {
           this.store.addTask({
             id: Date.now().toString() + i,
             title: t.task,
             deadline: t.deadline || this.eventDate,
             status: 'todo'
           });
         });
         this.eventName = '';
         this.eventDate = '';
      }
    } catch (e) {
      console.error('Failed to parse plan', e);
      alert('AI failed to generate a valid plan. Try again.');
    }
    this.isGenerating.set(false);
  }

  toggleSort() {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
  }

  moveTask(task: EventTask, status: 'todo' | 'doing' | 'done') {
    this.store.updateTask(task.id, { status });
  }

  // Edit Task
  openEditTask(task: EventTask) {
     // Clone to avoid direct mutation
     this.editingTask.set({ ...task });
  }

  saveEditedTask() {
     const t = this.editingTask();
     if (t) {
        this.store.updateTask(t.id, t);
        this.editingTask.set(null);
     }
  }

  // Bulk Add Tasks
  openBulkAddTasks() {
     this.bulkTasks.set([
        { id: Date.now().toString(), title: '', status: 'todo', deadline: this.eventDate || new Date().toISOString().split('T')[0] }
     ]);
     this.isBulkAddingTasks.set(true);
  }

  addBulkTaskRow() {
     this.bulkTasks.update(rows => [
        ...rows,
        { id: Date.now().toString() + Math.random(), title: '', status: 'todo', deadline: this.eventDate || new Date().toISOString().split('T')[0] }
     ]);
  }

  removeBulkTaskRow(index: number) {
     this.bulkTasks.update(rows => rows.filter((_, i) => i !== index));
  }

  saveBulkTasks() {
     const valid = this.bulkTasks().filter(t => t.title?.trim()).map(t => ({
        id: t.id || Date.now().toString() + Math.random(),
        title: t.title!,
        deadline: t.deadline!,
        status: t.status as any,
        assignee: t.assignee
     })) as EventTask[];

     if(valid.length > 0) {
        valid.forEach(t => this.store.addTask(t));
        this.isBulkAddingTasks.set(false);
     }
  }


  private filterAndSortTasks(status: string) {
    let tasks = this.store.eventTasks().filter(t => t.status === status);
    
    // Apply assignee filter
    const assignee = this.filterAssignee();
    if (assignee) {
       tasks = tasks.filter(t => t.assignee === assignee);
    }

    return tasks.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return this.sortOrder() === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  // --- Calendar Logic ---

  changeMonth(delta: number) {
    const newDate = new Date(this.currentCalendarDate());
    newDate.setMonth(newDate.getMonth() + delta);
    this.currentCalendarDate.set(newDate);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getTasksForDate(date: Date): EventTask[] {
    const dateStr = date.toISOString().split('T')[0]; // Simple comparison, might need timezone adjustment in real app
    // Actually, store dates are strings YYYY-MM-DD.
    // Let's format the input date correctly ensuring local time mapping
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset*60*1000));
    const localIso = localDate.toISOString().split('T')[0];
    
    return this.store.eventTasks().filter(t => t.deadline === localIso);
  }

  // --- Uniforms Logic ---

  generateQuarterSchedule() {
     const year = Number(this.genYear);
     const quarter = Number(this.genQuarter);
     
     // Calculate start and end months (0-indexed)
     const startMonth = (quarter - 1) * 3; // Q1=0, Q2=3...
     const endMonth = startMonth + 2;
     
     const newUniforms: Uniform[] = [];
     
     // Loop through Sundays in the quarter
     for (let m = startMonth; m <= endMonth; m++) {
        const date = new Date(year, m, 1);
        
        // Find first Sunday
        while (date.getDay() !== 0) {
           date.setDate(date.getDate() + 1);
        }
        
        // Iterate Sundays of the month
        let sundayCount = 0;
        while (date.getMonth() === m) {
           sundayCount++;
           const isFirst = sundayCount === 1;
           
           newUniforms.push({
              id: Date.now().toString() + Math.random(),
              date: date.toISOString().split('T')[0], // YYYY-MM-DD
              title: isFirst ? 'Thanksgiving Sunday' : 'Regular Sunday Service',
              isFirstSunday: isFirst,
              ladies: isFirst ? '' : 'TBD',
              guys: isFirst ? '' : 'TBD',
              colorHex: isFirst ? '#f97316' : '#64748b', // Orange or Slate
              comments: ''
           });
           
           date.setDate(date.getDate() + 7);
        }
     }
     
     // Set to bulk add mode to review
     this.bulkEntries.set(newUniforms);
     this.isBulkAdding.set(true);
  }
  
  editUniform(u: Uniform) {
     this.editingUniform.set({ ...u });
  }
  
  saveEditedUniform() {
     const u = this.editingUniform();
     if (u) {
        this.store.updateUniform(u.id, u);
        this.editingUniform.set(null);
     }
  }

  deleteUniform(id: string) {
     if(confirm('Delete this uniform entry?')) {
        this.store.deleteUniform(id);
     }
  }
  
  handleInspoUpload(event: any, mode: 'edit', type: 'ladies' | 'guys') {
     const file = event.target.files[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (e) => {
        const result = e.target?.result as string;
        if (mode === 'edit' && this.editingUniform()) {
           if (type === 'ladies') this.editingUniform()!.ladiesInspoImg = result;
           else this.editingUniform()!.guysInspoImg = result;
        }
     };
     reader.readAsDataURL(file);
  }

  // Bulk Uniforms
  openBulkAdd() {
     this.bulkEntries.set([
        { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], title: '', isFirstSunday: false }
     ]);
     this.isBulkAdding.set(true);
  }

  addBulkRow() {
     this.bulkEntries.update(list => [
        ...list,
        { id: Date.now().toString() + Math.random(), date: '', title: '', isFirstSunday: false }
     ]);
  }

  removeBulkRow(index: number) {
     this.bulkEntries.update(list => list.filter((_, i) => i !== index));
  }

  saveBulkEntries() {
     const valid = this.bulkEntries()
        .filter(u => u.date && u.title)
        .map(u => ({
           id: u.id || Date.now().toString() + Math.random(),
           date: u.date!,
           title: u.title!,
           isFirstSunday: !!u.isFirstSunday,
           ladies: u.ladies,
           guys: u.guys,
           comments: u.comments,
           colorHex: u.colorHex || '#64748b'
        })) as Uniform[];
     
     if (valid.length > 0) {
        this.store.addUniforms(valid);
        this.isBulkAdding.set(false);
     }
  }

  // --- Singing Schedule Logic ---

  deleteSingingSchedule(id: string) {
    if (confirm('Delete this singing schedule?')) {
       this.store.deleteSingingSchedule(id);
    }
  }

  openSingingBulkAdd() {
    this.singingImportText = '';
    this.parsedSingingPreview.set([]);
    this.isSingingImporting.set(true);
  }

  async analyzeSchedule() {
    if (!this.singingImportText.trim()) return;
    
    this.isAnalyzing.set(true);
    const results = await this.gemini.parseSingingSchedule(this.singingImportText);
    
    // Map to valid objects with IDs
    const mapped: SingingSchedule[] = results.map((r: any) => ({
       id: Date.now().toString() + Math.random(),
       date: r.date,
       assignments: r.assignments
    }));
    
    this.parsedSingingPreview.set(mapped);
    this.isAnalyzing.set(false);
  }

  saveSingingImport() {
    if (this.parsedSingingPreview().length > 0) {
       this.store.addSingingSchedules(this.parsedSingingPreview());
       this.isSingingImporting.set(false);
    }
  }
}
