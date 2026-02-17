
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Styles for background animation -->
    <style>
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob {
        animation: blob 10s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    </style>

    <!-- Main Container -->
    <div class="h-full w-full bg-slate-900 font-sans relative isolate">
      
      <!-- Fixed Background Layer (Clipped to prevent scrollbars from blobs) -->
      <div class="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <!-- Vivid Background Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"></div>
          
          <!-- Animated Background Blobs -->
          <div class="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div class="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <!-- Grid Pattern Overlay -->
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
      </div>

      <!-- Scrollable Content Layer -->
      <div class="h-full overflow-y-auto flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <!-- Logo Section -->
          <div class="flex flex-col items-center">
            <div class="h-24 w-24 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transform rotate-6 border border-white/10 mb-6 transition hover:rotate-0 hover:scale-105 duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
               </svg>
            </div>
            <h2 class="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight drop-shadow-sm mb-2">
              ChordFlow
            </h2>
            <p class="text-center text-slate-400 text-lg">
              {{ store.t().login.tagline }}
            </p>
          </div>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white/10 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/10">
            <form class="space-y-6" (ngSubmit)="onLogin()">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-200"> {{ store.t().login.emailLabel }} </label>
                <div class="mt-2">
                  <input id="email" name="email" type="email" autocomplete="email" required 
                    class="appearance-none block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-inner hover:bg-slate-800/70">
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-slate-200"> {{ store.t().login.passLabel }} </label>
                <div class="mt-2">
                  <input id="password" name="password" type="password" autocomplete="current-password" required 
                    class="appearance-none block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-inner hover:bg-slate-800/70">
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-600 rounded bg-slate-800">
                  <label for="remember-me" class="ml-2 block text-sm text-slate-300"> Keep me posted </label>
                </div>

                <div class="text-sm">
                  <a href="#" class="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"> {{ store.t().login.forgot }} </a>
                </div>
              </div>

              <div>
                <button type="submit" 
                  class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transform hover:-translate-y-0.5 transition-all duration-200">
                  {{ store.t().login.submit }}
                </button>
              </div>
              
              <div class="text-center pt-2">
                <p class="text-sm text-slate-400">
                  New here? 
                  <a href="#" class="font-bold text-cyan-400 hover:text-cyan-300 ml-1 transition-colors">{{ store.t().login.join }}</a>
                </p>
              </div>
            </form>

            <div class="mt-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/10"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-3 bg-transparent text-slate-300 font-medium"> or continue with </span>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-3 gap-3">
                <!-- Social buttons -->
                <div>
                  <button type="button" (click)="onSocialLogin('Google')" class="w-full inline-flex justify-center py-2.5 px-4 border border-slate-600/50 rounded-xl shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                    <span class="sr-only">Sign in with Google</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <button type="button" (click)="onSocialLogin('Microsoft')" class="w-full inline-flex justify-center py-2.5 px-4 border border-slate-600/50 rounded-xl shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                    <span class="sr-only">Sign in with Microsoft</span>
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.55 11.55H1V1h10.55v10.55zm0 11.45H1V12.45h10.55V23zm11.45-11.45H12.45V1h10.55v10.55zm0 11.45H12.45V12.45h10.55V23z"/>
                    </svg>
                  </button>
                </div>
                <div>
                   <button type="button" (click)="onSocialLogin('Apple')" class="w-full inline-flex justify-center py-2.5 px-4 border border-slate-600/50 rounded-xl shadow-sm bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                    <span class="sr-only">Sign in with Apple</span>
                     <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                       <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                     </svg>
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  store = inject(StoreService);
  private router: Router = inject(Router);

  onLogin() {
    this.router.navigate(['/app/dashboard']);
  }

  onSocialLogin(provider: string) {
    // Simulate social login action
    // In a production app, this would initiate OAuth flow
    console.log(`Authenticating with ${provider}...`);
    this.router.navigate(['/app/dashboard']);
  }
}
