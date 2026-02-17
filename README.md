
# ChordFlow

**ChordFlow** is the operating system for modern worship teams. It combines logistics, music production, and communication into a single, "vibe-coded" platform powered by Google Gemini AI.

## 📚 Documentation

- [**Architecture**](./ARCHITECTURE.md): Deep dive into the tech stack (Angular Signals, Zoneless, Gemini).
- [**Roadmap**](./ROADMAP.md): Future plans and feature rollout schedule.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chord-flow.git
    cd chord-flow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    - Create a `.env` file (or set system env vars) with:
      `API_KEY=your_google_gemini_key`

4.  **Run the application:**
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`.

## ✨ Key Features

### 🧪 The Lab (Musicians Corner)
- **AI Chords**: Real-time chord detection and transposition.
- **Stem Mixer**: Visual audio mixer for backing tracks.
- **Tuner**: Integrated chromatic tuner using the Web Audio API.

### 🤖 Worship Assistant
- Built on `gemini-2.5-flash`.
- Capable of parsing unstructured chat dumps to create calendar events and setlists.
- Suggests songs based on thematic keywords.

### 📅 The Plot (Logistics)
- **Drip Check**: Manage team uniforms and visual inspiration.
- **Mic Duty**: Singing rotas and backup assignments.
- **Kanban**: Drag-and-drop task management for service planning.

## 🛠 Tech Stack

- **Framework**: Angular v18+ (Standalone, Signals, Zoneless)
- **Styling**: Tailwind CSS
- **AI**: `@google/genai`
- **Audio**: Native Web Audio API

## License

MIT
