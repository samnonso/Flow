
# ChordFlow Architecture

ChordFlow is a modern, single-page application (SPA) built to serve as a comprehensive operating system for worship teams. It leverages the latest Angular features for performance and reactivity, coupled with Google's Gemini API for intelligent features.

## 1. High-Level Stack

- **Framework**: Angular v18+ (Standalone Components, Zoneless Change Detection).
- **Language**: TypeScript 5.x.
- **Styling**: Tailwind CSS (Utility-first).
- **State Management**: Angular Signals (Native reactive primitives).
- **AI/ML**: Google Gemini API via `@google/genai` SDK.
- **Audio Engine**: Web Audio API (Native browser API for synthesis, analysis, and mixing).
- **Build Tool**: Angular CLI / Vite (implied via ESM usage).

## 2. Core Modules & Components

The application is structured by feature domains rather than technical layers.

### A. Core (`src/app`)
- **`AppComponent`**: Root container.
- **`MainLayoutComponent`**: Handles the responsive shell (Sidebar for desktop, Bottom Nav for mobile) and global overlays (Assistant).
- **`LoginComponent`**: Entry point with simulated authentication and visual "vibe" animations.

### B. Feature Domains (`src/components`)
1.  **Dashboard**: Aggregates data from all services (Birthdays, Setlists, Next Event). Uses computed signals to derive state from the global store.
2.  **Musicians Corner ("The Lab")**:
    *   **Audio Engine**: Manages `AudioContext`, `GainNode`s for mixing stems, and `AnalyserNode` for the Chromatic Tuner.
    *   **Stem Separation**: Currently simulates separation via random waveform generation. Future integration point for TensorFlow.js or server-side Demucs.
    *   **Chord Visualization**: Renders SVG diagrams dynamically based on chord names.
3.  **Event Planner ("The Plot")**:
    *   **Kanban**: Drag-and-drop task management.
    *   **Generative AI**: Uses `GeminiService` to parse unstructured text (chat dumps) into structured JSON tasks and schedules.
4.  **Ride Share ("Pull Up")**: Peer-to-peer logistics management.
5.  **Chat ("The GC")**: Simulated real-time chat interface.

### C. Services (`src/services`)

#### `StoreService` (The Source of Truth)
- **Pattern**: Singleton Service with Signals.
- **Responsibility**: Holds application state (User Profile, Songs, Tasks, Chat History).
- **Mechanism**:
    - `signal<T>`: For writable state.
    - `computed(() => ...)`: For derived state (e.g., filtering tasks, sorting schedules).
    - `update()`: For immutable state modifications.
- **Persistence**: Currently in-memory. Designed to be swapped for Firebase/Supabase observables.

#### `GeminiService` (The Brain)
- **SDK**: `@google/genai`.
- **Model**: `gemini-2.5-flash` (Optimized for speed/latency).
- **Responsibilities**:
    - **Chat**: Context-aware assistant using `systemInstruction`.
    - **Extraction**: Converting unstructured WhatsApp text into JSON entities (Songs, Tasks).
    - **Analysis**: Musical theory analysis (Transposition logic verification).

## 3. Key Technical Decisions

### Zoneless Angular
We utilize `provideZonelessChangeDetection()`. This removes the `zone.js` dependency, reducing bundle size and improving stack trace readability. Change detection is triggered manually via Signals or async pipe subscriptions.

### Tailwind CSS
No external UI component libraries (Material, Bootstrap) are used. All components are custom-built with Tailwind for maximum design control and "vibe" consistency.

### Web Audio API
Instead of relying on heavy audio libraries, we interact directly with the browser's AudioContext. This provides low-latency performance for the Metronome and Tuner features.

## 4. Data Flow

1.  **User Action**: User clicks "Add Task".
2.  **Component**: Calls `StoreService.addTask()`.
3.  **Service**: Updates the `eventTasks` signal.
4.  **Reactivity**:
    - `DashboardComponent` (watching `eventTasks`) automatically updates the "Side Quests" count.
    - `EventPlannerComponent` (watching `eventTasks`) automatically re-renders the Kanban board.
