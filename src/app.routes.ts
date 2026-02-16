
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { MainLayoutComponent } from './components/main-layout.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LoginComponent 
  },
  { 
    path: 'app', 
    component: MainLayoutComponent,
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'musicians', 
        loadComponent: () => import('./components/musicians-corner.component').then(m => m.MusiciansCornerComponent) 
      },
      { 
        path: 'tracks', 
        loadComponent: () => import('./components/track-manager.component').then(m => m.TrackManagerComponent) 
      },
      { 
        path: 'chat', 
        loadComponent: () => import('./components/chat-window.component').then(m => m.ChatWindowComponent) 
      },
      { 
        path: 'rides', 
        loadComponent: () => import('./components/ride-share.component').then(m => m.RideShareComponent) 
      },
      { 
        path: 'events', 
        loadComponent: () => import('./components/event-planner.component').then(m => m.EventPlannerComponent) 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./components/user-profile.component').then(m => m.UserProfileComponent) 
      },
      { 
        path: 'choir-manager', 
        loadComponent: () => import('./components/choir-manager.component').then(m => m.ChoirManagerComponent) 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./components/settings.component').then(m => m.SettingsComponent) 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
