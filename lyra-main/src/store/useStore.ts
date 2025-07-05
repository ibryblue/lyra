import { create } from 'zustand';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { RefObject } from 'react';

export interface VRMFile {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

export interface VRMAFile {
  id: string;
  name: string;
  url: string;
  animation?: THREE.AnimationClip;
}

interface Character {
  name: string;
  isLoaded: boolean;
  isAnimating: boolean;
  currentAnimation: string;
  expression: string;
  lipSyncVisemes: number[];
  currentVRM: VRMFile | null;
  currentVRMA: VRMAFile | null;
  vrmFiles: VRMFile[];
  vrmaFiles: VRMAFile[];
  vrmRef?: RefObject<VRM | null>;
  animationState: 'playing' | 'paused';
}

interface Voice {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

interface UI {
  isMenuOpen: boolean;
  activePanel: 'character' | 'voice' | 'settings' | null;
  theme: 'cosmic' | 'space' | 'nebula';
}

interface Interactions {
  lastInteraction: Date | null;
  interactionCount: number;
  isIdle: boolean;
  idleTime: number;
  mousePosition: { x: number; y: number };
}

interface AppState {
  character: Character;
  voice: Voice;
  ui: UI;
  interactions: Interactions;
  isSpeaking: boolean;
  audioContext: AudioContext | null;
  currentDialogue: string;
  
  // Actions
  setCharacterLoaded: (loaded: boolean) => void;
  setCharacterAnimation: (animation: string) => void;
  setCharacterExpression: (expression: string) => void;
  setLipSyncVisemes: (visemes: number[]) => void;
  
  // VRM Actions
  addVRMFile: (file: VRMFile) => void;
  removeVRMFile: (id: string) => void;
  setCurrentVRM: (vrmFile: VRMFile | null) => void;
  setVRMRef: (ref: RefObject<VRM | null>) => void;
  
  // VRMA Actions
  addVRMAFile: (file: VRMAFile) => void;
  removeVRMAFile: (id: string) => void;
  setCurrentVRMA: (vrmaFile: VRMAFile | null) => void;
  
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setVoiceVolume: (volume: number) => void;
  
  setActivePanel: (panel: 'character' | 'voice' | 'settings' | null) => void;
  toggleMenu: () => void;
  setTheme: (theme: 'cosmic' | 'space' | 'nebula') => void;
  
  registerInteraction: () => void;
  setIdleStatus: (isIdle: boolean) => void;
  updateMousePosition: (x: number, y: number) => void;
  
  setSpeaking: (speaking: boolean) => void;
  setAudioContext: (context: AudioContext | null) => void;
  setCurrentDialogue: (dialogue: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  character: {
    name: 'Lyra',
    isLoaded: false,
    isAnimating: false,
    currentAnimation: 'idle',
    expression: 'neutral',
    lipSyncVisemes: [],
    currentVRM: null,
    currentVRMA: null,
    vrmFiles: [],
    vrmaFiles: [],
    animationState: 'playing',
  },
  
  voice: {
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  },
  
  ui: {
    isMenuOpen: false,
    activePanel: null,
    theme: 'cosmic',
  },
  
  interactions: {
    lastInteraction: null,
    interactionCount: 0,
    isIdle: false,
    idleTime: 0,
    mousePosition: { x: 0, y: 0 },
  },
  
  isSpeaking: false,
  audioContext: null,
  currentDialogue: '',
  
  // Character Actions
  setCharacterLoaded: (loaded) => 
    set((state) => ({ 
      character: { ...state.character, isLoaded: loaded } 
    })),
    
  setCharacterAnimation: (animation) => 
    set((state) => ({ 
      character: { 
        ...state.character, 
        currentAnimation: animation, 
        isAnimating: animation !== 'paused',
        animationState: animation === 'paused' ? 'paused' : 'playing'
      } 
    })),
    
  setCharacterExpression: (expression) => 
    set((state) => ({ 
      character: { ...state.character, expression } 
    })),
    
  setLipSyncVisemes: (visemes) => 
    set((state) => ({ 
      character: { ...state.character, lipSyncVisemes: visemes } 
    })),
  
  // Voice Actions
  setVoice: (voice) => 
    set((state) => ({ 
      voice: { ...state.voice, voice } 
    })),
    
  setVoiceRate: (rate) => 
    set((state) => ({ 
      voice: { ...state.voice, rate } 
    })),
    
  setVoicePitch: (pitch) => 
    set((state) => ({ 
      voice: { ...state.voice, pitch } 
    })),
    
  setVoiceVolume: (volume) => 
    set((state) => ({ 
      voice: { ...state.voice, volume } 
    })),
  
  // UI Actions
  setActivePanel: (panel) => 
    set((state) => ({ 
      ui: { ...state.ui, activePanel: panel } 
    })),
    
  toggleMenu: () => 
    set((state) => ({ 
      ui: { ...state.ui, isMenuOpen: !state.ui.isMenuOpen } 
    })),
    
  setTheme: (theme) => 
    set((state) => ({ 
      ui: { ...state.ui, theme } 
    })),
  
  // Interaction Actions
  registerInteraction: () => 
    set((state) => ({ 
      interactions: { 
        ...state.interactions, 
        lastInteraction: new Date(),
        interactionCount: state.interactions.interactionCount + 1,
        isIdle: false,
        idleTime: 0
      } 
    })),
    
  setIdleStatus: (isIdle) => 
    set((state) => ({ 
      interactions: { ...state.interactions, isIdle } 
    })),
    
  updateMousePosition: (x, y) => 
    set((state) => ({ 
      interactions: { ...state.interactions, mousePosition: { x, y } } 
    })),
  
  // Speech Actions
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setAudioContext: (context) => set({ audioContext: context }),
  setCurrentDialogue: (dialogue) => set({ currentDialogue: dialogue }),
  
  // VRM Actions
  addVRMFile: (file: VRMFile) => 
    set((state) => {
      const existingIndex = state.character.vrmFiles.findIndex(f => f.id === file.id);
      
      if (existingIndex !== -1) {
        // Update existing file
        const updatedFiles = [...state.character.vrmFiles];
        updatedFiles[existingIndex] = file;
        return { character: { ...state.character, vrmFiles: updatedFiles } };
      } else {
        // Add new file
        return { character: { ...state.character, vrmFiles: [...state.character.vrmFiles, file] } };
      }
    }),
    
  removeVRMFile: (id) =>
    set((state) => ({
      character: {
        ...state.character,
        vrmFiles: state.character.vrmFiles.filter(f => f.id !== id),
        currentVRM: state.character.currentVRM?.id === id ? null : state.character.currentVRM
      }
    })),
    
  setCurrentVRM: (vrmFile) =>
    set((state) => ({
      character: {
        ...state.character,
        currentVRM: vrmFile
      }
    })),

  setVRMRef: (ref) =>
    set((state) => ({
      character: {
        ...state.character,
        vrmRef: ref
      }
    })),
    
  // VRMA Actions
  addVRMAFile: (file: VRMAFile) => 
    set((state) => {
      const existingIndex = state.character.vrmaFiles.findIndex(f => f.id === file.id);
      
      if (existingIndex !== -1) {
        // Update existing file
        const updatedFiles = [...state.character.vrmaFiles];
        updatedFiles[existingIndex] = file;
        return { character: { ...state.character, vrmaFiles: updatedFiles } };
      } else {
        // Add new file
        return { character: { ...state.character, vrmaFiles: [...state.character.vrmaFiles, file] } };
      }
    }),
    
  removeVRMAFile: (id) =>
    set((state) => ({
      character: {
        ...state.character,
        vrmaFiles: state.character.vrmaFiles.filter(f => f.id !== id),
        currentVRMA: state.character.currentVRMA?.id === id ? null : state.character.currentVRMA
      }
    })),
    
  setCurrentVRMA: (vrmaFile) =>
    set((state) => ({
      character: {
        ...state.character,
        currentVRMA: vrmaFile
      }
    })),
}));
