
import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    let key = '';
    try {
      key = process.env['API_KEY'] || '';
    } catch (e) {
      console.warn('API Key not found or process not defined. AI features disabled.');
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  createChatSession(systemInstruction?: string): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction }
    });
  }

  async getSongSuggestions(currentSongs: string[], theme: string): Promise<string> {
    try {
      const prompt = `I have a worship setlist with these songs: ${currentSongs.join(', ')}. The theme is "${theme}". Suggest 3 more songs that fit musically and thematically. Format as a simple bulleted list.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "No suggestions available.";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "Unable to fetch suggestions. Please check API Key.";
    }
  }

  async generateEventPlan(eventName: string, date: string): Promise<string> {
    try {
      const prompt = `Create a high-level project plan for a church musical event called "${eventName}" happening on ${date}. Include 5 key milestones with approximate deadlines relative to the event date. Return as JSON array of objects with 'task' and 'deadline' properties.`;
       const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return response.text || '[]';
    } catch (error) {
      console.error('Gemini Error:', error);
      return '[]';
    }
  }

  async transcribeMusic(
    input: { type: 'file' | 'url', data: string, mimeType?: string }, 
    mode: string, 
    targetKey: string
  ): Promise<string> {
    try {
      let parts: any[] = [];
      
      const keyInstruction = targetKey === 'Original' ? 'the original key' : `the key of ${targetKey}`;
      
      const promptText = `You are an expert musical director and transcriber. Analyze the provided audio/song. 
      Identify the song structure (Intro, Verse, Chorus, Bridge). 
      TRANSPOSE the entire song to ${keyInstruction}.
      
      Focus on ${mode}. Provide the chords and specific notes.
      
      Use a structured, readable format (Markdown recommended).`;

      if (input.type === 'file' && input.mimeType) {
        // Handle Base64 Audio
        parts = [
          {
            inlineData: {
              mimeType: input.mimeType,
              data: input.data
            }
          },
          { text: promptText }
        ];
      } else {
        // Handle URL
        parts = [
          { text: `Analyze the song at this URL: ${input.data}. \n\n ${promptText}` }
        ];
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts }
      });

      return response.text || "Could not transcribe audio.";
    } catch (error) {
      console.error('Gemini Transcription Error:', error);
      return "Error processing transcription request. Please try again.";
    }
  }

  // New method for the AI Beat Maker Studio
  async analyzeSongDeeply(input: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<any> {
    try {
      const prompt = `
        Analyze this audio track for a music production studio app.
        Return a strictly valid JSON object with the following structure:
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "bpm": 120,
          "key": "C Major",
          "timeSignature": "4/4",
          "chords": [
             { "time": 0, "chord": "C", "duration": 4 },
             { "time": 4, "chord": "G", "duration": 4 }
          ],
          "lyrics": [
             { "time": 0, "text": "Verse 1 starts here" }
          ],
          "sections": [
             { "name": "Intro", "startTime": 0 },
             { "name": "Verse", "startTime": 15 }
          ]
        }
        Estimate the chords and timing as accurately as possible.
      `;

      let parts: any[] = [];
      if (input.type === 'file' && input.mimeType) {
        parts = [
          { inlineData: { mimeType: input.mimeType, data: input.data } },
          { text: prompt }
        ];
      } else {
        parts = [
          { text: `Analyze the audio at this URL: ${input.data}. \n\n ${prompt}` }
        ];
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts },
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Gemini Deep Analysis Error:', error);
      // Return mock data fallback if AI fails or API key missing
      return {
        title: "Detected Song",
        artist: "Unknown Artist",
        bpm: 72,
        key: "C",
        timeSignature: "4/4",
        chords: [
          { time: 0, chord: "C", duration: 4 },
          { time: 4, chord: "G/B", duration: 4 },
          { time: 8, chord: "Am7", duration: 4 },
          { time: 12, chord: "Fmaj7", duration: 4 },
          { time: 16, chord: "C", duration: 4 },
          { time: 20, chord: "G", duration: 4 }
        ],
        lyrics: [
           { time: 0, text: "Intro..." },
           { time: 8, text: "Amazing grace how sweet the sound" },
           { time: 16, text: "That saved a wretch like me" }
        ], 
        sections: [
           { name: "Intro", startTime: 0 },
           { name: "Verse 1", startTime: 8 }
        ]
      };
    }
  }

  async parseSingingSchedule(text: string): Promise<any[]> {
    try {
      const currentYear = new Date().getFullYear();
      const prompt = `
      You are an assistant for a church choir admin. Parse the following text into a structured JSON array of singing schedules.
      
      Input Text:
      "${text}"

      Rules:
      1. Identify dates (e.g., "1st Feb"). Infer the year as ${currentYear}. If the date has passed in ${currentYear}, use ${currentYear + 1}. Format strictly as YYYY-MM-DD.
      2. Extract assignment roles (e.g., Call to Worship, Praise, Hymn, Offering).
      3. Extract the 'Lead' name for each role.
      4. Extract 'Back ups' (names list). Associate backups with the preceding role (e.g., Praise backups vs Hymn backups).
      5. Return a JSON array where each item represents a date.
      
      JSON Schema:
      [
        {
          "date": "YYYY-MM-DD",
          "assignments": [
            { "role": "Call to Worship", "lead": "Name", "backups": [] },
            { "role": "Praise", "lead": "Name", "backups": ["Name 1", "Name 2"] }
          ]
        }
      ]
      `;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error('Gemini Parsing Error:', error);
      return [];
    }
  }

  async extractWorkflowData(text: string): Promise<{ songs: any[], tasks: any[] }> {
    try {
      const prompt = `
      You are an intelligent agent for a worship team app. Analyze the unstructured text below (likely from a WhatsApp group chat) and extract specific entities.
      
      Input Text:
      "${text}"

      Tasks:
      1. Identify potential Songs for a setlist. Look for Key (e.g. "in E", "key of G") and BPM if available. Default key to "C" if not found.
      2. Identify potential Tasks or Events. Look for dates, times, and action items (e.g. "Rehearsal on Thurs", "Submit songs by Friday").
      
      Return STRICT JSON format:
      {
        "songs": [
          { "title": "Song Title", "artist": "Artist (or Unknown)", "key": "Key", "bpm": 0, "notes": "Any context from chat" }
        ],
        "tasks": [
          { "title": "Task Name", "deadline": "YYYY-MM-DD", "assignee": "Name (or Unassigned)" }
        ]
      }
      
      For dates, assume the current year is ${new Date().getFullYear()}. If a day (e.g., "Friday") is mentioned, find the next occurrence of that day from today (${new Date().toISOString().split('T')[0]}).
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(response.text || '{ "songs": [], "tasks": [] }');
    } catch (error) {
      console.error('Gemini Extraction Error:', error);
      return { songs: [], tasks: [] };
    }
  }

  async generateSimulatedUpdates(): Promise<string> {
    try {
      const prompt = `
      Act as a "Live Sync" agent for a Worship Team App. Simulate incoming data from a WhatsApp group chat.
      
      Context:
      - The user just clicked "Sync".
      - Generate 3-4 realistic new messages that might have been sent in the last few hours by team members (Sarah, Mike, etc.).
      - The messages should contain actionable info: e.g., adding a new song, changing a key, or assigning a task.
      
      Requirement:
      - Extract any songs mentioned.
      - Extract any tasks mentioned.
      
      Return JSON Format:
      {
        "messages": [
           { "sender": "Name", "text": "Message content", "timestamp": "ISO string (use today's date/time)" }
        ],
        "songs": [
           { "title": "Song Title", "artist": "Artist", "key": "Key", "bpm": 70, "category": "Praise" }
        ],
        "tasks": [
           { "title": "Task Title", "assignee": "Name", "deadline": "YYYY-MM-DD", "status": "todo" }
        ]
      }
      `;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return response.text || '{}';
    } catch (e) {
      console.error('Gemini Agent Error:', e);
      return '{}';
    }
  }
}
