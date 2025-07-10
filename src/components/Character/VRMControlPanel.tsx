import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { VRMUpload, VRMAUpload } from './FileUpload';
import { 
  User, 
  Play, 
  Pause, 
  RotateCcw, 
  Smile, 
  Frown, 
  Meh, 
  Zap,
  Settings,
  ChevronDown,
  ChevronRight,
  Upload,
  Film,
  SmilePlus
} from 'lucide-react';
import { VRMValidator } from '../VRMValidator';
import * as THREE from 'three';
import { VRMManager, getVRMManager, VRMAManager, getVRMAManager } from '../../lib/vrmManager';

export function VRMControlPanel() {
  const [activeTab, setActiveTab] = useState<'character' | 'animation' | 'expression' | 'validation'>('character');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationScene, setValidationScene] = useState<THREE.Scene | null>(null);
  
  const {
    character,
    setCharacterAnimation,
    setCharacterExpression,
    setCurrentVRM,
    setCurrentVRMA
  } = useStore();
  
  // Track animation state
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Update isPlaying state when animation changes
  useEffect(() => {
    if (character.currentAnimation === 'paused') {
      setIsPlaying(false);
    } else if (character.currentVRMA) {
      setIsPlaying(true);
    }
  }, [character.currentAnimation, character.currentVRMA]);
  
  // Add cleanup effect for animations
  useEffect(() => {
    const cleanup = () => {
      if (character.currentVRMA?.animation) {
        const mixer = character.vrmRef?.current?.scene?.userData.mixer;
        if (mixer) {
          mixer.stopAllAction();
        }
      }
    };

    // Clean up animations on component unmount or page refresh
    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [character.currentVRMA, character.vrmRef]);
  
  // Create a scene for validation when VRM is available
  useEffect(() => {
    if (character.vrmRef?.current) {
      // Create a new scene for validation
      const scene = new THREE.Scene();
      
      // Add the VRM to the scene if it exists
      if (character.vrmRef.current.scene) {
        scene.add(character.vrmRef.current.scene.clone());
      }
      
      setValidationScene(scene);
    } else {
      setValidationScene(null);
    }
  }, [character.vrmRef?.current]);
  
  const expressions = [
    { id: 'neutral', name: 'Neutral', icon: Meh, color: 'gray' },
    { id: 'happy', name: 'Happy', icon: Smile, color: 'green' },
    { id: 'angry', name: 'Angry', icon: Frown, color: 'red' },
    { id: 'surprised', name: 'Surprised', icon: Zap, color: 'yellow' },
  ];
  
  const animations = [
    { id: 'VRMA_01', name: 'Show full body', description: 'Full body display animation' },
    { id: 'VRMA_02', name: 'Greeting', description: 'Friendly greeting animation' },
    { id: 'VRMA_03', name: 'Peace sign', description: 'Peace sign gesture' },
    { id: 'VRMA_04', name: 'Shoot', description: 'Shooting animation' }
  ];
  
  const handleExpressionChange = (expressionId: string) => {
    try {
      // Get the VRM instance
      const vrm = character.vrmRef?.current;
      if (!vrm) {
        console.error('VRM not loaded');
        return;
      }

      // Get VRM manager for expressions
      const vrmManager = getVRMManager();
      
      // Reset all expressions first
      const allExpressions = ['neutral', 'happy', 'sad', 'surprised', 'angry', 'relaxed'];
      allExpressions.forEach(expr => {
        vrmManager.setVRMExpression(vrm, expr, 0);
      });

      // For angry expression, create an intense angry look focusing on eyes
      if (expressionId === 'angry') {
        // Set maximum anger for the base expression
        vrmManager.setVRMExpression(vrm, 'angry', 1.0);
        // Add a bit of surprise to raise outer eyebrows for intensity
        vrmManager.setVRMExpression(vrm, 'surprised', 0.15);
        // Ensure no conflicting expressions
        vrmManager.setVRMExpression(vrm, 'happy', 0);
        vrmManager.setVRMExpression(vrm, 'sad', 0);
        // Very small amount of neutral to prevent over-exaggeration
        vrmManager.setVRMExpression(vrm, 'neutral', 0.05);
        // Add a touch of relaxed to prevent mouth from dominating
        vrmManager.setVRMExpression(vrm, 'relaxed', 0.1);
      } else {
        // For other expressions, just set the selected one
        vrmManager.setVRMExpression(vrm, expressionId, 1.0);
      }
      
      // Update state
      setCharacterExpression(expressionId);
    } catch (error) {
      console.error('Error changing expression:', error);
    }
  };
  
  const handleAnimationChange = async (animationId: string) => {
    try {
      // Get the VRM instance
      const vrm = character.vrmRef?.current;
      if (!vrm) {
        console.error('VRM not loaded');
        return;
      }

      // Load the new animation
      const vrmaPath = `/animations/${animationId}.vrma`;
      const vrmaManager = getVRMAManager();
      const animations = await vrmaManager.loadVRMA(vrmaPath);
      
      if (!animations || animations.length === 0) {
        console.error('No animations found in VRMA file');
        return;
      }

      // Create or get the mixer
      if (!character.vrmRef.current.scene.userData.mixer) {
        character.vrmRef.current.scene.userData.mixer = new THREE.AnimationMixer(character.vrmRef.current.scene);
      }
      const mixer = character.vrmRef.current.scene.userData.mixer;

      // Stop any current animations
      mixer.stopAllAction();
      
      // Play the new animation
      const action = mixer.clipAction(animations[0]);
      action.reset();
      action.clampWhenFinished = true;
      action.loop = THREE.LoopRepeat; // Change to LoopRepeat to allow continuous play/pause
      action.play();

      // Update state with properly formatted VRMA data
      setCurrentVRMA({
        id: animationId,
        name: animations[0].name || animationId,
        url: vrmaPath,
        animation: animations[0]
      });
      setCharacterAnimation('playing');
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading animation:', error);
    }
  };
  
  const handlePauseAnimation = () => {
    try {
      const mixer = character.vrmRef?.current?.scene?.userData.mixer;
      if (mixer && character.currentVRMA?.animation) {
        // Stop all animations to return to T-pose
        mixer.stopAllAction();
        // Update state
        setCharacterAnimation('paused');
        setIsPlaying(false);
        // Clear the current animation to fully reset
        setCurrentVRMA(null);
      }
    } catch (error) {
      console.error('Error pausing animation:', error);
    }
  };

  const handlePlayAnimation = () => {
    try {
      if (character.currentVRMA?.id) {
        // Start the animation from beginning
        handleAnimationChange(character.currentVRMA.id);
      }
    } catch (error) {
      console.error('Error playing animation:', error);
    }
  };

  const handleResetAnimation = () => {
    try {
      if (character.currentVRMA?.id) {
        // Restart the current animation from the beginning
        handleAnimationChange(character.currentVRMA.id);
      }
    } catch (error) {
      console.error('Error resetting animation:', error);
    }
  };

  // Update the render controls to show active state
  const renderAnimationControls = () => {
    const hasActiveAnimation = character.currentVRMA !== null;
    const isPaused = character.currentAnimation === 'paused';
    
    return (
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={handlePauseAnimation}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            hasActiveAnimation 
              ? isPaused
                ? 'bg-gray-800 text-gray-400'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-400'
          }`}
          title="Pause"
          disabled={!hasActiveAnimation || isPaused}
        >
          <Pause className="w-5 h-5" />
        </button>
        <button
          onClick={handlePlayAnimation}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            hasActiveAnimation
              ? isPaused
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-400'
          }`}
          title="Play"
          disabled={!hasActiveAnimation || (!isPaused && isPlaying)}
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetAnimation}
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            hasActiveAnimation
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 opacity-50 cursor-not-allowed text-gray-400'
          }`}
          title="Reset"
          disabled={!hasActiveAnimation}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700 p-6 w-full max-w-3xl">
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            VRM Character Control
          </h2>
          <p className="text-gray-400 text-sm">
            Manage your character's appearance and animations
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2 bg-gray-800 rounded-lg p-2">
          {[
            { id: 'character', name: 'Character', icon: User },
            { id: 'animation', name: 'Animation', icon: Film },
            { id: 'expression', name: 'Expression', icon: SmilePlus },
            { id: 'validation', name: 'Settings', icon: Settings }
          ].filter(tab => tab.id !== 'voice').map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg
                transition-all duration-200 text-sm font-medium
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-base">{tab.name}</span>
            </button>
          ))}
        </div>
        
        {/* Content area - Increased max height and added padding */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Character management */}
            {activeTab === 'character' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Current Character</h3>
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {character.currentVRM?.name || character.name || 'No character loaded'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {character.isLoaded ? 'Loaded' : 'No VRM loaded'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VRM Upload Section */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-3">Load VRM Character</h4>
                  <VRMUpload />
                </div>
                
                {/* Advanced settings */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm"
                  >
                    {showAdvanced ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                    <span>Advanced Settings</span>
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-3 space-y-3">
                      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-2">Character Settings</h4>
                        <div className="space-y-2">
                          <div>
                            <label htmlFor="character-scale" className="block text-xs text-gray-400 mb-1">Scale</label>
                            <input
                              id="character-scale"
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              defaultValue="1"
                              title="Adjust character scale"
                              className="w-full accent-purple-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="character-position-y" className="block text-xs text-gray-400 mb-1">Position Y</label>
                            <input
                              id="character-position-y"
                              type="range"
                              min="-1"
                              max="1"
                              step="0.1"
                              defaultValue="0"
                              title="Adjust character vertical position"
                              className="w-full accent-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Animation management */}
            {activeTab === 'animation' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Animation Controls</h3>
                  
                  {/* Current animation */}
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-white font-medium">
                          {character.currentVRMA?.name || character.currentAnimation || 'No animation'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {character.currentVRMA ? 'VRMA Animation' : 'Built-in Animation'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VRMA Upload Section */}
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
                    <h4 className="text-white font-medium mb-3">Load VRMA Animation</h4>
                    <VRMAUpload />
                  </div>
                  
                  {/* VRMA animations */}
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2">Character Actions</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {animations.map((anim) => (
                        <div
                          key={anim.id}
                          className={`
                            p-3 rounded-lg transition-all
                            ${character.currentVRMA?.id === anim.id
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-gray-800/50 hover:bg-gray-800 border-transparent'
                            }
                            border-2
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-white">{anim.name}</div>
                              <div className="text-sm text-gray-400">{anim.description}</div>
                            </div>
                            <div className="flex space-x-2">
                              {character.currentVRMA?.id === anim.id ? (
                                character.currentAnimation === 'paused' ? (
                                  <button
                                    onClick={handlePlayAnimation}
                                    className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white"
                                    title="Play"
                                  >
                                    <Play className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={handlePauseAnimation}
                                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                                    title="Pause"
                                  >
                                    <Pause className="w-5 h-5" />
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => handleAnimationChange(anim.id)}
                                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                                  title="Play"
                                >
                                  <Play className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Animation status */}
                  {character.currentVRMA && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-sm text-cyan-400">
                          Current Action: {character.currentVRMA.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Expression management */}
            {activeTab === 'expression' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Expression Controls</h3>
                  
                  {/* Current expression */}
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded">
                        <SmilePlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {character.expression || 'Neutral'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Current Expression
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expression buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {expressions.map(exp => {
                      const ExpIcon = exp.icon;
                      return (
                        <button
                          key={exp.id}
                          onClick={() => handleExpressionChange(exp.id)}
                          className={`
                            p-3 rounded-lg flex items-center space-x-3 transition-all
                            ${character.expression === exp.id
                              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className={`p-2 rounded-full bg-opacity-20 bg-white`}>
                            <ExpIcon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{exp.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Validation tab - Adjusted padding and spacing */}
            {activeTab === 'validation' && (
              <div className="space-y-4 p-2">
                <VRMValidator 
                  vrm={character.vrmRef?.current} 
                  scene={validationScene}
                  onValidationComplete={(result) => {
                    console.log('Validation result:', result);
                  }}
                  onFixComplete={(success) => {
                    console.log('Fix completed:', success);
                  }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
