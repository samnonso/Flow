
# WorshipFlow / Nonso's Beat Lab

WorshipFlow is a comprehensive, modern web application designed for worship teams and choirs. It integrates setlist management, logistics (ride-sharing, events), communication, and AI-powered music production tools into a single platform.

## Features

### 🎵 Musicians Corner (Nonso's Beat Lab)
- **AI Stem Separation:** Upload audio or provide a URL to isolate Vocals, Drums, Bass, and Other tracks.
- **Audio Mixer:** Real-time volume mixing, mute/solo controls, and waveform visualization.
- **Chord Lab:** AI-detected chords with real-time transposition and instrument diagrams.
- **Sequencer:** Integrated 16-step beat sequencer.

### 📅 Event & Logistics
- **Event Planner:** Kanban board for tasks, calendar view, and AI-generated project plans.
- **Uniform Schedules:** Manage "Fit Checks" and color themes for upcoming services.
- **Ride Sharing:** "Pull Up" feature for coordinating carpools to rehearsal/service.

### 👥 Team Management
- **Choir Manager:** Rostering for Admins, Musicians, and Members.
- **Chat:** Integrated team communication with simulated WhatsApp history.
- **Settings:** Manage integrations (LoopCommunity, MultiTracks, Planning Center).

## Tech Stack

- **Framework:** Angular v18+ (Standalone Components, Signals)
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`) for analysis, transcription, and suggestions.
- **Audio:** Web Audio API for real-time mixing and synthesis.
- **Routing:** Angular Router with Lazy Loading.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/worship-flow.git
    cd worship-flow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    - Create a `.env` file or configured your environment variables.
    - `API_KEY`: Your Google Gemini API Key.

4.  **Run the application:**
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`.

## Usage

- **Dashboard:** The landing page summarizing upcoming events, setlists, and active ride requests.
- **Studio Mode:** Navigate to "The Lab" -> "Enter Studio" to access the stem separator and beat maker.
- **Chat:** Click the "Assistant" button in the bottom right or sidebar to talk to the AI helper.

## Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
