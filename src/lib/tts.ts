// Text-to-Speech and Audio Processing Utilities

export const ttsManager = {
  speak: (text: string, voice: SpeechSynthesisVoice | null, rate: number, pitch: number, volume: number) => {
    // Silently return without speaking, but don't break the chain
    return Promise.resolve();
  },
  
  stop: () => {
    window.speechSynthesis.cancel();
  },
  
  getVoices: () => {
    return window.speechSynthesis.getVoices();
  }
};

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
export const dialogueManager = new DialogueManager();
