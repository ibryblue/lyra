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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsManager.getVoices();
      setVoices(availableVoices);
      
      // Set default voice
      if (availableVoices.length > 0 && !voice.voice) {
        const femaleVoice = availableVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('hazel')
        ) || availableVoices[0];
        setVoice(femaleVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [setVoice, voice.voice]);

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      ttsManager.stop();
      setSpeaking(false);
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const handleTestVoice = () => {
    if (isVoiceEnabled) {
      speakResponse("Hello! This is how I sound. Nice to meet you!");
    }
  };

  const handleStopSpeaking = () => {
    ttsManager.stop();
    setSpeaking(false);
  };

  return (
    <motion.div
      className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 max-w-sm"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-cyan-400 font-semibold mb-4 flex items-center">
        <Volume2 className="w-5 h-5 mr-2" />
        Voice Settings
      </h3>

      {/* Voice Enable/Disable */}
      <div className="mb-4">
        <button
          onClick={handleVoiceToggle}
          className={`flex items-center justify-center w-full p-3 rounded-lg transition-all ${
            isVoiceEnabled 
              ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {isVoiceEnabled ? (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Voice Enabled
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Voice Disabled
            </>
          )}
        </button>
      </div>

      {isVoiceEnabled && (
        <>
          {/* Voice Selection */}
          <div className="mb-4">
            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-2">
              Voice
            </label>
            <select
              id="voice-select"
              title="Select voice"
              value={voice.voice?.name || ''}
              onChange={(e) => {
                const selectedVoice = voices.find(v => v.name === e.target.value);
                if (selectedVoice) setVoice(selectedVoice);
              }}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Voice Controls */}
          <div className="space-y-4">
            {/* Rate */}
            <div>
              <label htmlFor="voice-speed" className="block text-sm font-medium text-gray-300 mb-1">
                Speed: {voice.rate.toFixed(1)}x
              </label>
              <input
                id="voice-speed"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voice.rate}
                title="Adjust voice speed"
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Pitch */}
            <div>
              <label htmlFor="voice-pitch" className="block text-sm font-medium text-gray-300 mb-1">
                Pitch: {voice.pitch.toFixed(1)}
              </label>
              <input
                id="voice-pitch"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voice.pitch}
                title="Adjust voice pitch"
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Volume */}
            <div>
              <label htmlFor="voice-volume" className="block text-sm font-medium text-gray-300 mb-1">
                Volume: {Math.round(voice.volume * 100)}%
              </label>
              <input
                id="voice-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voice.volume}
                title="Adjust voice volume"
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Test and Control Buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleTestVoice}
              disabled={isSpeaking}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Speaking
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
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
  const { ui, toggleMenu, setActivePanel } = useStore();
  const { speakResponse, isIdle, interactionCount } = useInteractions();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'greet':
        speakResponse("Hello! How are you doing today?");
        break;
      case 'joke':
        speakResponse("Why don't programmers like nature? It has too many bugs!");
        break;
      case 'compliment':
        speakResponse("You have excellent taste in virtual companions!");
        break;
      case 'time':
        const now = new Date();
        speakResponse(`The current time is ${now.toLocaleTimeString()}`);
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

      {/* Quick Actions Bar */}
      <motion.div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-md rounded-full px-6 py-3 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex space-x-4">
          <button
            onClick={() => handleQuickAction('greet')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Greet"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleQuickAction('joke')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
            title="Tell a joke"
          >
            😄
          </button>
          <button
            onClick={() => handleQuickAction('compliment')}
            className="text-pink-400 hover:text-pink-300 transition-colors"
            title="Compliment"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleQuickAction('time')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Current time"
          >
            🕐
          </button>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        className="fixed top-4 left-4 bg-gray-900/80 backdrop-blur-md rounded-lg p-3 pointer-events-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-cyan-400 text-sm font-mono">
          <div>Interactions: {interactionCount}</div>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${isIdle ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
            {isIdle ? 'Idle' : 'Active'}
          </div>
          <div className="mt-1 text-xs">
            Menu: {ui.isMenuOpen ? 'Open' : 'Closed'}
          </div>
        </div>
      </motion.div>

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
                    Select a category above to customize Lyra's behavior and appearance.
                  </p>
                  <div className="space-y-2">
                    <button
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
