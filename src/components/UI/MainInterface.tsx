import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useInteractions } from '../../hooks/useInteractions';
import { ttsManager } from '../../lib/tts';
import { VRMControlPanel } from '../Character/VRMControlPanel';
import { 
  Mic, 
  MicOff, 
  Settings, 
  Volume2, 
  VolumeX, 
  Menu, 
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  MessageCircle,
  Home
} from 'lucide-react';

// Control Panel Component
function ControlPanel() {
  const { 
    voice, 
    isSpeaking, 
    currentDialogue,
    setVoiceRate, 
    setVoiceVolume, 
    setVoicePitch,
    setVoice,
    setSpeaking
  } = useStore();
  
  const { speakResponse } = useInteractions();
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Set to false by default
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Ensure voice is disabled on mount
    setIsVoiceEnabled(false);
    if (isSpeaking) {
      ttsManager.stop();
      setSpeaking(false);
    }
  }, []);

  // Hide the voice UI by returning null
  return null;
}

// Character Panel Component
// VRM Character Panel - now using the new VRM control system
function CharacterPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <VRMControlPanel />
    </motion.div>
  );
}

// Main Interface Component
export function MainInterface() {
  const { ui, toggleMenu, setActivePanel, setCharacterAnimation } = useStore();
  const { speakResponse, isIdle, interactionCount } = useInteractions();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'greet':
        setCharacterAnimation('VRMA_02'); // Greeting animation
        break;
      case 'joke':
        setCharacterAnimation('VRMA_03'); // Peace sign animation
        break;
      case 'compliment':
        setCharacterAnimation('VRMA_01'); // Full body display animation
        break;
      case 'time':
        setCharacterAnimation('VRMA_04'); // Shooting animation
        break;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Menu and Home Buttons */}
      <div className="fixed top-4 right-4 flex space-x-2 z-50">
        <motion.button
          onClick={() => window.location.href = '/'}
          className="bg-gray-900/80 backdrop-blur-md text-cyan-400 p-3 rounded-full hover:bg-gray-800/80 transition-colors pointer-events-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go to Home"
        >
          <Home className="w-6 h-6" />
        </motion.button>
        <motion.button
          onClick={() => toggleMenu()}
          className="bg-gray-900/80 backdrop-blur-md text-cyan-400 p-3 rounded-full hover:bg-gray-800/80 transition-colors pointer-events-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {ui.isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Side Panels */}
      <AnimatePresence>
        {ui.isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          >
            <div className="absolute top-20 right-4 space-y-4" onClick={e => e.stopPropagation()}>
              {/* Panel Selection Buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  style={{ display: 'none' }} // Hide voice button
                  onClick={() => setActivePanel(ui.activePanel === 'voice' ? null : 'voice')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    ui.activePanel === 'voice' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Volume2 className="w-4 h-4 mr-2 inline" />
                  Voice
                </button>
                <button
                  onClick={() => setActivePanel(ui.activePanel === 'character' ? null : 'character')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    ui.activePanel === 'character' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  VRM Character
                </button>
              </div>

              {/* Active Panel */}
              <AnimatePresence mode="wait">
                {ui.activePanel === 'voice' && <ControlPanel key="voice-panel" />}
                {ui.activePanel === 'character' && <CharacterPanel key="character-panel" />}
              </AnimatePresence>

              {/* Default panel when menu is open but no specific panel selected */}
              {!ui.activePanel && (
                <motion.div
                  className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 max-w-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-cyan-400 font-semibold mb-4">Menu</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Select a category above to customize the character's appearance and animations.
                  </p>
                  <div className="space-y-2">
                    <button
                      style={{ display: 'none' }} // Hide voice settings button
                      onClick={() => setActivePanel('voice')}
                      className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <Volume2 className="w-4 h-4 mr-3 text-cyan-400" />
                        <div>
                          <div className="text-gray-200 font-medium">Voice Settings</div>
                          <div className="text-gray-400 text-sm">Configure speech and audio</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActivePanel('character')}
                      className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-3 text-purple-400" />
                        <div>
                          <div className="text-gray-200 font-medium">VRM Character Control</div>
                          <div className="text-gray-400 text-sm">Manage VRM models, VRMA animations and expressions</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
