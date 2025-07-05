// Text-to-Speech and Audio Processing Utilities

export class TTSManager {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    // Load voices when they become available
    const loadVoicesWhenAvailable = () => {
      this.voices = this.synthesis.getVoices();
      if (this.voices.length === 0) {
        // Voices not loaded yet, try again
        setTimeout(loadVoicesWhenAvailable, 100);
      }
    };

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesWhenAvailable;
    }
    
    loadVoicesWhenAvailable();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  public speak(
    text: string, 
    options: {
      voice?: SpeechSynthesisVoice;
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onViseme?: (visemes: number[]) => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if speech synthesis is available
      if (!this.synthesis) {
        console.warn('Speech synthesis not available');
        resolve();
        return;
      }

      if (this.currentUtterance) {
        this.synthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      if (options.voice) utterance.voice = options.voice;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;

      // Event handlers
      utterance.onstart = () => {
        options.onStart?.();
        if (options.onViseme) {
          this.startLipSyncAnalysis(options.onViseme);
        }
      };

      utterance.onend = () => {
        options.onEnd?.();
        this.stopLipSyncAnalysis();
        resolve();
      };

      utterance.onerror = (error) => {
        console.warn('TTS Error (non-critical):', error.error || 'Speech synthesis failed');
        this.stopLipSyncAnalysis();
        options.onEnd?.(); // Still call onEnd to clean up state
        resolve(); // Resolve instead of reject to prevent breaking the app
      };

      this.currentUtterance = utterance;
      
      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        console.warn('Failed to start speech synthesis:', error);
        options.onEnd?.();
        resolve();
      }
    });
  }

  public stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.stopLipSyncAnalysis();
  }

  public pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  // Lip-sync analysis using Web Audio API
  private async startLipSyncAnalysis(onViseme: (visemes: number[]) => void): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create analyser for frequency analysis
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Start lip-sync visualization loop
      this.lipSyncLoop(onViseme);
    } catch (error) {
      console.error('Error starting lip-sync analysis:', error);
    }
  }

  private lipSyncLoop(onViseme: (visemes: number[]) => void): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!this.analyser || !this.synthesis.speaking) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Simple viseme mapping based on frequency analysis
      const visemes = this.mapFrequenciesToVisemes(dataArray);
      onViseme(visemes);

      requestAnimationFrame(analyze);
    };

    analyze();
  }

  private mapFrequenciesToVisemes(frequencies: Uint8Array): number[] {
    // Simple mapping of frequency data to mouth shapes/visemes
    // This is a basic implementation - more sophisticated lip-sync
    // would require phoneme analysis or pre-processed data
    
    const lowFreq = this.getAverageFrequency(frequencies, 0, 10);
    const midFreq = this.getAverageFrequency(frequencies, 10, 50);
    const highFreq = this.getAverageFrequency(frequencies, 50, 100);

    // Map to basic mouth shapes (0 = closed, 1 = open, 2 = wide, etc.)
    const visemes = [];
    
    if (lowFreq > 100) visemes.push(1); // Low frequencies - open mouth
    if (midFreq > 80) visemes.push(2);  // Mid frequencies - wide mouth
    if (highFreq > 60) visemes.push(3); // High frequencies - narrow mouth
    
    return visemes.length > 0 ? visemes : [0]; // Default to closed mouth
  }

  private getAverageFrequency(frequencies: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < Math.min(end, frequencies.length); i++) {
      sum += frequencies[i];
    }
    return sum / (end - start);
  }

  private stopLipSyncAnalysis(): void {
    // Clean up audio context resources
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
  }
}

// Dialogue system with character personality responses
export class DialogueManager {
  private responses = {
    idle: [
      "Hello there! I'm Lyra, your virtual companion.",
      "I'm here whenever you need me!",
      "What would you like to talk about?",
      "The cosmos holds so many mysteries...",
      "I love watching the stars with you.",
    ],
    
    click: [
      "You clicked on me! That tickles!",
      "Ooh, what's that for?",
      "Did you need something?",
      "I'm all ears... well, digital ears!",
      "That's one way to get my attention!",
    ],
    
    pause: [
      "Seriously? You pressed pause?",
      "Taking a break already?",
      "I'll wait right here for you!",
      "Paused in the middle of our conversation!",
      "Time stops for no one... except you, apparently!",
    ],
    
    keyboard: [
      "Ooh, typing something interesting?",
      "What are you working on?",
      "Those keys are getting a workout!",
      "I love the sound of productivity!",
      "Writing the next great novel?",
    ],
    
    longIdle: [
      "Still there? I'm getting a bit lonely...",
      "Should I put on some ambient space music?",
      "The silence is quite peaceful, actually.",
      "I'm just here, contemplating the universe.",
      "Wake me up when you're ready to chat!",
    ],
    
    greeting: [
      "Welcome to the cosmos!",
      "Hey there, stargazer!",
      "Ready to explore the universe together?",
      "The stars have aligned for our meeting!",
      "Greetings from the digital realm!",
    ]
  };

  public getRandomResponse(category: keyof typeof this.responses): string {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public getContextualResponse(action: string, context?: any): string {
    switch (action) {
      case 'click':
        return this.getRandomResponse('click');
      case 'keyboard':
        return this.getRandomResponse('keyboard');
      case 'pause':
        return this.getRandomResponse('pause');
      case 'idle':
        return this.getRandomResponse('idle');
      case 'longIdle':
        return this.getRandomResponse('longIdle');
      case 'greeting':
        return this.getRandomResponse('greeting');
      default:
        return this.getRandomResponse('idle');
    }
  }
}

// Export singleton instances
export const ttsManager = new TTSManager();
export const dialogueManager = new DialogueManager();
