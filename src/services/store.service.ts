
import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'Admin' | 'Musician' | 'Soprano' | 'Tenor' | 'Alto' | 'Ad-hoc';

export interface AccessLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  notes: string;
  url?: string;
  category?: 'Call to Worship' | 'Praise' | 'Other';
}

export interface Track {
  id: string;
  title: string;
  source: 'LoopCommunity' | 'MultiTracks';
  key: string;
  purchased: boolean;
  downloaded: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
  platform: 'whatsapp' | 'internal';
}

export interface RideRequest {
  id: string;
  requester: string;
  from: string;
  to: string;
  time: string;
  status: 'pending' | 'accepted';
  driver?: string;
}

export interface EventTask {
  id: string;
  title: string;
  deadline: string;
  status: 'todo' | 'doing' | 'done';
  assignee?: string;
}

export interface Uniform {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g., "Thanksgiving Sunday"
  isFirstSunday: boolean;
  ladies?: string;
  guys?: string;
  comments?: string;
  inspirationImg?: string;
  ladiesInspoImg?: string;
  guysInspoImg?: string;
  colorHex?: string;
}

export interface SingingAssignment {
  role: string; // e.g. "Call to Worship", "Praise", "Hymn"
  lead: string;
  backups?: string[];
}

export interface SingingSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  assignments: SingingAssignment[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bio: string;
  avatarUrl?: string;
  birthdayMonth?: string;
  birthdayDay?: number;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    newSetlists: boolean;
    chatMentions: boolean;
    taskReminders: boolean; // New field
  };
}

// --- New Choir Interfaces ---
export interface ChoirMember {
  id: string;
  name: string;
  role: string; // e.g., "Choir Admin", "Drummer", "Soprano Lead"
  email: string;
  phone: string;
  avatarUrl?: string;
  birthdayMonth?: string; // e.g. "January", "01"
  birthdayDay?: number;   // e.g. 15
}

export interface ChoirGroup {
  name: string;
  logoUrl?: string;
  admins: ChoirMember[];
  musicians: ChoirMember[];
  members: ChoirMember[];
}

export interface IntegrationsState {
  planningCenter: boolean;
  whatsapp: boolean;
  whatsappGroupName: string; // New field for the group name
  loopCommunity: boolean;
  multiTracks: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Helper to get today's date details for mock data
  private todayDate = new Date();
  
  // Language State
  readonly lang = signal<'en' | 'fr'>('en');
  
  // Assistant Visibility State
  readonly isAssistantOpen = signal(false);

  toggleLang() {
    this.lang.update(current => current === 'en' ? 'fr' : 'en');
  }

  // Translation Dictionary
  readonly t = computed(() => {
    const isEn = this.lang() === 'en';
    return {
      sidebar: {
        hub: isEn ? 'Hub' : 'Le QG',
        lab: isEn ? 'The Lab' : 'Le Labo',
        aux: isEn ? 'Tracks' : 'La Sono',
        gc: isEn ? 'Team Chat' : 'Le Chat',
        rides: isEn ? 'Pull Up' : 'On Bouge',
        events: isEn ? 'Events' : 'Le Plan',
        settings: isEn ? 'Settings' : 'Config',
        profile: isEn ? 'My Era' : 'Mon Era',
        squadSync: isEn ? 'Squad Sync' : 'Synchro Squad',
        assistant: isEn ? 'Worship Assistant' : 'Assistant Culte'
      },
      dashboard: {
        welcome: isEn ? 'Wsg' : 'Wesh',
        subtitle: isEn ? "Here's the tea on the worship squad today." : "Voici les bails de l'équipe aujourd'hui.",
        squadButton: isEn ? 'Squad Goals' : 'Objectif Squad',
        upNext: isEn ? 'UP NEXT FR' : 'PROCHAIN TRUC',
        eventTitle: isEn ? 'Sunday Service Vibe' : 'Vibe du Dimanche',
        viewSetlist: isEn ? 'Peep the Setlist' : 'Voir les Sons',
        viewDeets: isEn ? 'The Deets' : 'Les Détails',
        daysLeft: isEn ? 'Days til we lock in' : 'Jours avant le lock-in',
        birthdays: isEn ? 'Main Character Energy' : 'Mode Star',
        birthdaySub: isEn ? "It's their main character moment! Send some immaculate vibes." : "C'est leur moment ! Envoie de la force.",
        setlistTitle: isEn ? 'Setlist' : 'Les Sons',
        uniformTitle: isEn ? 'Fit Check' : 'Check Ton Flow',
        chatTitle: isEn ? 'The Group Chat' : 'Le Groupe',
        tasksTitle: isEn ? 'Side Quests' : 'Quêtes Annexes',
        tasksDue: isEn ? 'Due (High Key)' : 'À rendre (Urgent)',
        quickActions: isEn ? 'Speedrun' : 'Speedrun',
        manageChoir: isEn ? 'Manage Fam' : 'Gérer la Mif',
        copRide: isEn ? 'Cop a Ride' : 'Choper un lift',
        grindTime: isEn ? 'Grind Time' : 'Au Charbon',
        vibesConfig: isEn ? 'vibes.config' : 'config.vibes'
      },
      login: {
        tagline: isEn ? "Sync your squad's aura." : "Synchronise l'aura de ton équipe.",
        emailLabel: isEn ? 'The Gmail' : 'Ton Gmail',
        passLabel: isEn ? 'The Secret Code' : 'Le Code Secret',
        submit: isEn ? 'Let me in' : 'Laisse-moi entrer',
        forgot: isEn ? 'Ghosted by your password?' : 'Mot de passe oublié ?',
        join: isEn ? 'Join the fam.' : 'Rejoins la mif.'
      },
      musicians: {
        title: isEn ? 'The Lab' : 'Le Labo',
        subtitle: isEn ? 'Sunday Service Setlist' : 'Setlist du Dimanche',
        receipts: isEn ? 'Receipts' : 'Les Preuves',
        addSong: isEn ? 'Add Song' : 'Ajouter un Son',
        lineup: isEn ? 'The Lineup' : 'La Setlist',
        vibeCurator: isEn ? 'AI Suggestions' : 'Suggestions IA',
        aiPrompt: isEn ? 'Brain empty? Let the AI cook up some suggestions.' : 'Pas d\'inspi ? Laisse l\'IA cuisiner.',
        deconstruct: isEn ? 'Deconstruct the Beat' : 'Déconstruire le Beat',
        tools: isEn ? 'Tools' : 'Outils',
        metronome: isEn ? 'Stay on Beat' : 'Garder le Rythme',
        tuner: isEn ? 'Fix the Pitch' : 'Accorder tout ça'
      },
      events: {
        title: isEn ? 'Events' : 'Le Plan',
        subtitle: isEn ? "Get organized so we don't flop." : "S'organiser pour pas flopper.",
        kanban: isEn ? 'Kanban' : 'Kanban',
        dates: isEn ? 'Dates' : 'Dates',
        dripCheck: isEn ? 'Drip Check (Admin)' : 'Drip Check (Admin)',
        micDuty: isEn ? 'Mic Duty' : 'Au Micro',
        bulkAdd: isEn ? 'Bulk Add' : 'Ajout Masse',
        aiCook: isEn ? 'Let AI Cook' : "Laisse l'IA Cuisiner",
        vibeCheck: isEn ? 'Vibe Check:' : 'Vibe Check :',
        todo: isEn ? 'Not Started' : 'Pas Commencé',
        doing: isEn ? 'Cooking' : 'Ça cuisine',
        done: isEn ? 'Ate & Left No Crumbs' : 'Masterclass / Plié'
      },
      rides: {
        title: isEn ? 'Pull Up' : 'On Bouge',
        subtitle: isEn ? "Don't be late. Skrrt skrrt." : "Sois pas en retard. Skrrt skrrt.",
        needLift: isEn ? 'Need a Lift' : "Besoin d'un lift",
        otherOptions: isEn ? 'Other Ways to Pull Up' : 'Autres moyens de bouger',
        carpool: isEn ? 'Carpool Karaoke' : 'Covoiturage Karaoké',
        secured: isEn ? 'SECURED' : 'SÉCURISÉ',
        leftOnRead: isEn ? 'LEFT ON READ' : 'VU',
        gotchu: isEn ? 'I gotchu' : 'Je te gère'
      },
      chat: {
        dms: isEn ? 'DMs & GCs' : 'DMs & Groupes',
        header: isEn ? 'Worship Team Main' : 'Équipe Louange',
        searchPlaceholder: isEn ? 'Stalk history...' : 'Stalker l\'historique...',
        inputPlaceholder: isEn ? 'Spill the tea...' : 'Balance les infos...'
      },
      tracks: {
        title: isEn ? 'Backing Tracks (The Sauce)' : 'Backing Tracks (La Sauce)',
        mood: isEn ? 'Current Mood' : 'Mood Actuel'
      },
      common: {
        start: isEn ? 'Start' : 'Go',
        cancel: isEn ? 'Cancel' : 'Annuler',
        save: isEn ? 'Save' : 'Sauvegarder',
        edit: isEn ? 'Edit' : 'Modifier',
        delete: isEn ? 'Delete' : 'Supprimer'
      }
    };
  });
  
  // User Profile State
  readonly userProfile = signal<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@worshipflow.com',
    phone: '(555) 123-4567',
    role: 'Admin',
    bio: 'Just trying to pass the vibe check for the Lord. No cap.',
    avatarUrl: undefined,
    // Setting default to today so the feature is visible immediately
    birthdayMonth: this.todayDate.toLocaleString('default', { month: 'long' }), 
    birthdayDay: this.todayDate.getDate(),
    notifications: {
      email: true,
      sms: false,
      push: true,
      newSetlists: true,
      chatMentions: true,
      taskReminders: true // Default ON
    }
  });

  // Rehearsal Corner Access Logs
  readonly rehearsalAccessLogs = signal<AccessLog[]>([
     { id: 'mock1', timestamp: new Date(Date.now() - 3600000).toISOString(), userName: 'Sarah', userRole: 'Musician' },
     { id: 'mock2', timestamp: new Date(Date.now() - 7200000).toISOString(), userName: 'Mike', userRole: 'Musician' }
  ]);

  // Choir Data State
  readonly choirGroup = signal<ChoirGroup>({
    name: 'Grace Community Choir',
    logoUrl: undefined,
    admins: [
      { id: 'a1', name: 'John Doe', role: 'Main Admin', email: 'john@example.com', phone: '555-0101', birthdayMonth: 'August', birthdayDay: 12 }
    ],
    musicians: [
      { id: 'm1', name: 'Mike Ross', role: 'Drummer', email: 'mike@example.com', phone: '555-0102', birthdayMonth: 'March', birthdayDay: 4 },
      { id: 'm2', name: 'Sarah Lee', role: 'Keyboard', email: 'sarah@example.com', phone: '555-0103' }
    ],
    members: [
      // Mocking a member birthday for today as well
      { 
        id: 'c1', 
        name: 'Alice Smith', 
        role: 'Soprano', 
        email: 'alice@example.com', 
        phone: '555-0104', 
        birthdayMonth: this.todayDate.toLocaleString('default', { month: 'long' }), 
        birthdayDay: this.todayDate.getDate() 
      },
      { id: 'c2', name: 'Bob Jones', role: 'Tenor', email: 'bob@example.com', phone: '555-0105', birthdayMonth: 'December', birthdayDay: 25 }
    ]
  });

  // Musicians Corner State
  readonly currentSetlist = signal<Song[]>([
    { id: '1', title: 'Graves Into Gardens', artist: 'Elevation Worship', bpm: 70, key: 'B', notes: 'Pads go brrr. Bridge goes hard fr fr.', url: 'https://www.youtube.com/watch?v=KwX1f2gYKZ4', category: 'Praise' },
    { id: '2', title: 'Goodness of God', artist: 'Bethel Music', bpm: 63, key: 'Ab', notes: 'Acoustic intro only. Don\'t be mid.', url: '', category: 'Call to Worship' },
    { id: '3', title: 'Build My Life', artist: 'Housefires', bpm: 68, key: 'G', notes: 'Spontaneous flow at the end. Let the spirit cook.', url: '', category: 'Call to Worship' },
  ]);

  // Track Manager State
  readonly tracks = signal<Track[]>([
    { id: '101', title: 'Graves Into Gardens (Live)', source: 'MultiTracks', key: 'B', purchased: true, downloaded: true },
    { id: '102', title: 'Way Maker', source: 'LoopCommunity', key: 'E', purchased: true, downloaded: false },
    { id: '103', title: 'Jireh', source: 'MultiTracks', key: 'Eb', purchased: false, downloaded: false },
  ]);

  // Chat State
  readonly messages = signal<ChatMessage[]>([
    { id: '1', sender: 'Sarah (Worship Ldr)', text: 'Yo fam! Setlist for Sunday just dropped. It\'s giving revival.', timestamp: new Date(Date.now() - 86400000), isMe: false, platform: 'whatsapp' },
    { id: '2', sender: 'Mike (Drums)', text: 'Bet. Listening now. These songs slap.', timestamp: new Date(Date.now() - 86000000), isMe: false, platform: 'whatsapp' },
    { id: '3', sender: 'Me', text: 'I might need a lift this Sunday, car is cooked.', timestamp: new Date(Date.now() - 3600000), isMe: true, platform: 'internal' },
  ]);

  // Ride Share State
  readonly rideRequests = signal<RideRequest[]>([
    { id: 'r1', requester: 'John Doe', from: 'North Hills', to: 'Main Campus', time: 'Sunday 7:30 AM', status: 'pending' }
  ]);

  // Event Planner State
  readonly eventTasks = signal<EventTask[]>([
    { id: 't1', title: 'Secure the Robes', deadline: '2023-11-15', status: 'done', assignee: 'Alice Smith' },
    { id: 't2', title: 'Lock in Setlist', deadline: '2023-11-20', status: 'doing', assignee: 'Sarah Lee' },
    { id: 't3', title: 'Stage Design Glow Up', deadline: '2023-12-01', status: 'todo' },
  ]);

  // Uniform Schedule State
  readonly uniformSchedule = signal<Uniform[]>([
    // Entry 1: 1st Sunday (Thanksgiving)
    { 
      id: 'u1', 
      date: this.getDateForNextSpecificDay(0), // Closest upcoming Sunday
      title: 'Thanksgiving Drip', 
      isFirstSunday: true,
      colorHex: '#f59e0b', // Amber for thanksgiving
      inspirationImg: 'https://picsum.photos/seed/thanksgiving_vibe/300/400'
    },
    // Entry 2: Regular Sunday (Navy/Grey)
    { 
      id: 'u2', 
      date: this.getDateForNextSpecificDay(7), // The Sunday after next
      title: 'Fit Check: Navy & Grey', 
      isFirstSunday: false,
      ladies: 'Navy blue jacket, white shirt, heather grey pants, black shoes.',
      guys: 'Navy blue jacket, white shirt, heather grey pants, black shoes.',
      comments: 'Heather grey is the lighter shade. Guys, blue tie is the move.',
      inspirationImg: 'https://picsum.photos/seed/fashion_suit/200/300', // General mood board
      ladiesInspoImg: 'https://picsum.photos/seed/ladies_formal/200/300',
      guysInspoImg: 'https://picsum.photos/seed/guys_suits/200/300',
      colorHex: '#1e3a8a' // Navy Blue
    }
  ]);

  // Singing Schedule State
  readonly singingSchedule = signal<SingingSchedule[]>([]);

  // Integrations State
  readonly integrations = signal<IntegrationsState>({
    planningCenter: false,
    whatsapp: true, // Default connected
    whatsappGroupName: 'Worship Team Main', // Default group name
    loopCommunity: false,
    multiTracks: false
  });

  // State to track if Auto-Sync has run this session
  readonly hasAutoSynced = signal(false);

  markAutoSynced() {
    this.hasAutoSynced.set(true);
  }

  // Helper to get next Sunday date string
  private getDateForNextSpecificDay(daysOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7 + daysOffset);
    return d.toISOString().split('T')[0];
  }

  // Log Rehearsal Access
  logRehearsalAccess(user: UserProfile) {
    this.rehearsalAccessLogs.update(logs => [
      {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        userName: user.name,
        userRole: user.role
      },
      ...logs
    ]);
  }

  addSong(song: Song) {
    this.currentSetlist.update(list => [...list, song]);
  }
  
  addTrack(track: Track) {
     this.tracks.update(list => [track, ...list]);
  }

  updateSong(id: string, updates: Partial<Song>) {
    this.currentSetlist.update(list => 
      list.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  }

  deleteSong(id: string) {
    this.currentSetlist.update(list => list.filter(s => s.id !== id));
  }

  addMessage(msg: ChatMessage) {
    this.messages.update(msgs => [...msgs, msg]);
  }

  requestRide(req: RideRequest) {
    this.rideRequests.update(reqs => [...reqs, req]);
    // Trigger notification to simulate other users seeing this
    this.sendPushNotification(
      'New Ride Request',
      `${req.requester} needs a lift from ${req.from} for ${req.time}.`
    );
  }

  acceptRide(id: string, driver: string) {
    this.rideRequests.update(reqs => reqs.map(r => r.id === id ? { ...r, status: 'accepted', driver } : r));
    const req = this.rideRequests().find(r => r.id === id);
    if (req) {
       this.sendPushNotification('Ride Secured', `${driver} pulled up for ${req.requester}.`);
    }
  }
  
  addTask(task: EventTask) {
    this.eventTasks.update(tasks => [...tasks, task]);
  }

  updateTask(id: string, updates: Partial<EventTask>) {
    this.eventTasks.update(tasks => 
      tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }

  updateProfile(profile: UserProfile) {
    this.userProfile.set(profile);
  }

  // Uniform Methods
  addUniforms(uniforms: Uniform[]) {
     this.uniformSchedule.update(list => {
      // Filter out conflicting dates to allow overwrite/update logic if needed, or just append distinct dates
      const newDates = new Set(uniforms.map(u => u.date));
      const filtered = list.filter(u => !newDates.has(u.date));
      return [...filtered, ...uniforms].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  updateUniform(id: string, updates: Partial<Uniform>) {
    this.uniformSchedule.update(list => 
      list.map(u => u.id === id ? { ...u, ...updates } : u)
    );
  }

  deleteUniform(id: string) {
    this.uniformSchedule.update(list => list.filter(u => u.id !== id));
  }

  // Singing Schedule Methods
  addSingingSchedules(schedules: SingingSchedule[]) {
    this.singingSchedule.update(list => {
      const newDates = new Set(schedules.map(s => s.date));
      const filtered = list.filter(s => !newDates.has(s.date));
      return [...filtered, ...schedules].sort((a, b) => a.date.localeCompare(b.date));
    });
  }

  deleteSingingSchedule(id: string) {
    this.singingSchedule.update(list => list.filter(s => s.id !== id));
  }

  // --- Integrations Methods ---
  updateIntegrationStatus(key: keyof IntegrationsState, status: boolean) {
    this.integrations.update(current => ({
      ...current,
      [key]: status
    }));
  }

  updateWhatsAppGroupName(name: string) {
    this.integrations.update(current => ({
      ...current,
      whatsappGroupName: name
    }));
  }

  fetchWhatsAppHistory() {
    // Simulate fetching historical messages from the WhatsApp Community
    const history: ChatMessage[] = [
      { 
        id: 'wa-old-1', 
        sender: 'Pastor Dave', 
        text: 'Service was fire today everyone! The flow was immaculate.', 
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        isMe: false, 
        platform: 'whatsapp' 
      },
      { 
        id: 'wa-old-2', 
        sender: 'Sarah (Worship Ldr)', 
        text: 'PSA: Rehearsal starts at 6pm sharp. Don\'t ghost me.', 
        timestamp: new Date(Date.now() - 259200000), // 3 days ago
        isMe: false, 
        platform: 'whatsapp' 
      },
      { 
        id: 'wa-old-3', 
        sender: 'Mike (Drums)', 
        text: 'Can someone bring an extra cable? Mine is acting weird.', 
        timestamp: new Date(Date.now() - 262800000), // 3 days + 1hr ago
        isMe: false, 
        platform: 'whatsapp' 
      },
      { 
        id: 'wa-old-4', 
        sender: 'Alice Smith', 
        text: 'Just uploaded the new charts. Peep the drive.', 
        timestamp: new Date(Date.now() - 345600000), // 4 days ago
        isMe: false, 
        platform: 'whatsapp' 
      }
    ];

    this.messages.update(current => {
      // Prevent duplicates if pulled multiple times
      const existingIds = new Set(current.map(m => m.id));
      const newHistory = history.filter(h => !existingIds.has(h.id));
      // Merge and sort
      return [...current, ...newHistory].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }

  // --- Choir Management Methods ---

  updateChoirProfile(name: string, logoUrl?: string) {
    this.choirGroup.update(current => ({
      ...current,
      name,
      logoUrl: logoUrl !== undefined ? logoUrl : current.logoUrl
    }));
  }

  addChoirMember(category: 'admins' | 'musicians' | 'members', member: ChoirMember) {
    this.choirGroup.update(current => ({
      ...current,
      [category]: [...current[category], member]
    }));
  }

  addChoirMembers(category: 'admins' | 'musicians' | 'members', members: ChoirMember[]) {
    this.choirGroup.update(current => ({
      ...current,
      [category]: [...current[category], ...members]
    }));
  }

  updateChoirMember(category: 'admins' | 'musicians' | 'members', id: string, updates: Partial<ChoirMember>) {
    this.choirGroup.update(current => ({
      ...current,
      [category]: current[category].map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }

  removeChoirMember(category: 'admins' | 'musicians' | 'members', id: string) {
    this.choirGroup.update(current => ({
      ...current,
      [category]: current[category].filter(m => m.id !== id)
    }));
  }

  // --- Notification Logic ---

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  sendPushNotification(title: string, body: string) {
    // Only send if user has enabled push in profile AND browser permission is granted
    if (this.userProfile().notifications.push && Notification.permission === 'granted') {
       try {
         new Notification(title, {
           body: body,
           icon: 'https://picsum.photos/id/40/64/64', // Generic icon
           silent: false
         });
       } catch (e) {
         console.error('Notification trigger failed', e);
       }
    } else {
      console.log('Notification suppressed (Permission denied or disabled):', title, body);
    }
  }

  // Check for tasks due soon and notify
  checkTaskReminders() {
    const user = this.userProfile();
    // Only proceed if push and task reminders are enabled
    if (!user.notifications.push || !user.notifications.taskReminders) return;

    if (Notification.permission !== 'granted') return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate tomorrow date string
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const myPendingTasks = this.eventTasks().filter(t => 
        t.assignee === user.name && t.status !== 'done'
    );

    myPendingTasks.forEach(task => {
        if (task.deadline === todayStr) {
            this.sendPushNotification('Task Due Today 🚨', `"${task.title}" is due today! Lock in.`);
        } else if (task.deadline === tomorrowStr) {
            this.sendPushNotification('Task Due Tomorrow ⏳', `"${task.title}" is due tomorrow.`);
        }
    });
  }
}
