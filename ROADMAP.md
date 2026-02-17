
# ChordFlow Product Roadmap

This document outlines the strategic direction for ChordFlow, moving from a high-fidelity prototype to a production-grade SaaS platform for worship teams.

## Phase 1: Foundation (Current Status)
*Goal: Establish the core UX and prove the value of AI integration.*

- [x] **Architecture**: Angular Standalone + Signals + Tailwind setup.
- [x] **AI Core**: Gemini integration for Chat, Parsing, and Suggestions.
- [x] **The Lab (UI)**: Audio mixer UI, Tuner (Microphone access), and Sequencer UI.
- [x] **Logistics**: Basic Event Kanban and Ride Sharing UI.
- [x] **Mobile**: Responsive layout with Bottom Nav.

## Phase 2: Backend & Persistence (Q2 2024)
*Goal: Enable real data persistence and multi-user collaboration.*

- [ ] **Authentication**: Integrate Firebase Auth or Supabase Auth (replace mock login).
- [ ] **Database**: Move `StoreService` in-memory data to Firestore or PostgreSQL.
- [ ] **Real-time Sync**: Implement WebSockets for "The GC" (Chat) and "Squad Sync" (live setlist updates).
- [ ] **File Storage**: Allow users to upload actual profile pictures and MP3s (AWS S3 or Firebase Storage).

## Phase 3: Advanced Audio Features (Q3 2024)
*Goal: Make "The Lab" a fully functional production tool.*

- [ ] **Real Stem Separation**:
    - *Option A*: Server-side processing using Spleeter/Demucs (Python backend).
    - *Option B*: Client-side TensorFlow.js model (Experimental).
- [ ] **Cloud Tracks**: Connect real APIs for LoopCommunity and MultiTracks (OAuth integration).
- [ ] **Advanced Metronome**: Add polyrhythms and visual click tracks (flashing screen).

## Phase 4: Integrations & Ecosystem (Q4 2024)
*Goal: Integrate with the wider church tech ecosystem.*

- [ ] **Planning Center Online (PCO)**: Two-way sync for Plans and People.
- [ ] **Calendar Sync**: Export "The Plot" events to Google Calendar/Outlook (iCal).
- [ ] **WhatsApp Bot**: A real Twilio/Meta API integration to allow the AI to read actual WhatsApp groups and update the app automatically.

## Phase 5: Native & Hardware (2025)
*Goal: High-performance mobile experience.*

- [ ] **Mobile App**: Wrap the web app using Capacitor or Ionic for iOS/Android App Store release.
- [ ] **Offline Mode**: Service Workers to cache Setlists and Audio for offline use on stage.
- [ ] **Bluetooth Page Turner**: Support for pedal page turners for lyrics/chords.
