import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { dialogueManager, ttsManager } from '../lib/tts';

export const useInteractions = () => {
  const {
    registerInteraction,
    setIdleStatus,
    updateMousePosition,
    setSpeaking,
    setCurrentDialogue,
    voice,
    interactions
  } = useStore();

  const idleTimeoutRef = useRef<NodeJS.Timeout>();
  const longIdleTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    updateMousePosition(event.clientX, event.clientY);
    registerInteraction();
    resetIdleTimers();
  }, [updateMousePosition, registerInteraction]);

  // Handle mouse clicks
  const handleMouseClick = useCallback((event: MouseEvent) => {
    registerInteraction();
    resetIdleTimers();
    
    // Trigger click response
    const response = dialogueManager.getContextualResponse('click');
    speakResponse(response);
  }, [registerInteraction]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    registerInteraction();
    resetIdleTimers();

    // Special responses for specific keys
    let response: string;
    switch (event.key) {
      case ' ':
      case 'Escape':
        response = dialogueManager.getContextualResponse('pause');
        break;
      case 'Enter':
        response = dialogueManager.getContextualResponse('greeting');
        break;
      default:
        response = dialogueManager.getContextualResponse('keyboard');
    }

    speakResponse(response);
  }, [registerInteraction]);

  // Handle window focus/blur
  const handleWindowFocus = useCallback(() => {
    registerInteraction();
    resetIdleTimers();
    
    const response = dialogueManager.getContextualResponse('greeting');
    speakResponse(response);
  }, [registerInteraction]);

  const handleWindowBlur = useCallback(() => {
    setIdleStatus(true);
  }, [setIdleStatus]);

  // Speak response function
  const speakResponse = useCallback(async (text: string) => {
    if (!text) return;

    setCurrentDialogue(text);
    setSpeaking(true);

    try {
      await ttsManager.speak(text, {
        voice: voice.voice || undefined,
        rate: voice.rate,
        pitch: voice.pitch,
        volume: voice.volume,
        onEnd: () => {
          setSpeaking(false);
          setCurrentDialogue('');
        }
      });
    } catch (error) {
      console.warn('Error speaking response (non-critical):', error);
      // Still clean up the speaking state even if TTS fails
      setSpeaking(false);
      setCurrentDialogue('');
      
      // Show visual feedback instead when TTS fails
      const notification = document.createElement('div');
      notification.textContent = text;
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-cyan-400 p-3 rounded-lg z-50 max-w-md text-center';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  }, [voice, setSpeaking, setCurrentDialogue]);

  // Reset idle timers
  const resetIdleTimers = useCallback(() => {
    setIdleStatus(false);
    
    // Clear existing timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (longIdleTimeoutRef.current) clearTimeout(longIdleTimeoutRef.current);

    // Set new idle timer (30 seconds)
    idleTimeoutRef.current = setTimeout(() => {
      setIdleStatus(true);
      const response = dialogueManager.getContextualResponse('idle');
      speakResponse(response);
    }, 30000);

    // Set long idle timer (2 minutes)
    longIdleTimeoutRef.current = setTimeout(() => {
      const response = dialogueManager.getContextualResponse('longIdle');
      speakResponse(response);
    }, 120000);
  }, [setIdleStatus, speakResponse]);

  // Initialize interaction listeners
  useEffect(() => {
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleMouseClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Start idle timers
    resetIdleTimers();

    // Initial greeting after a short delay
    const greetingTimeout = setTimeout(() => {
      const response = dialogueManager.getContextualResponse('greeting');
      speakResponse(response);
    }, 2000);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleMouseClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (longIdleTimeoutRef.current) clearTimeout(longIdleTimeoutRef.current);
      clearTimeout(greetingTimeout);
    };
  }, [
    handleMouseMove,
    handleMouseClick,
    handleKeyDown,
    handleWindowFocus,
    handleWindowBlur,
    resetIdleTimers,
    speakResponse
  ]);

  // Manual interaction trigger
  const triggerInteraction = useCallback((action: string, context?: any) => {
    registerInteraction();
    resetIdleTimers();
    
    const response = dialogueManager.getContextualResponse(action, context);
    speakResponse(response);
  }, [registerInteraction, resetIdleTimers, speakResponse]);

  return {
    triggerInteraction,
    speakResponse,
    isIdle: interactions.isIdle,
    interactionCount: interactions.interactionCount,
    lastInteraction: interactions.lastInteraction,
    mousePosition: interactions.mousePosition
  };
};

// Hook for character-specific interactions
export const useCharacterInteractions = () => {
  const { character, setCharacterExpression, setCharacterAnimation } = useStore();
  const { triggerInteraction } = useInteractions();

  const handleCharacterClick = useCallback((event: any) => {
    event.stopPropagation();
    
    // Change expression temporarily
    setCharacterExpression('happy');
    setTimeout(() => setCharacterExpression('neutral'), 3000);
    
    // Trigger wave animation
    setCharacterAnimation('wave');
    setTimeout(() => setCharacterAnimation('idle'), 2000);
    
    // Trigger speech response
    triggerInteraction('click');
  }, [setCharacterExpression, setCharacterAnimation, triggerInteraction]);

  const expressEmotion = useCallback((emotion: string, duration: number = 3000) => {
    setCharacterExpression(emotion);
    setTimeout(() => setCharacterExpression('neutral'), duration);
  }, [setCharacterExpression]);

  const playAnimation = useCallback((animation: string, duration: number = 2000) => {
    setCharacterAnimation(animation);
    setTimeout(() => setCharacterAnimation('idle'), duration);
  }, [setCharacterAnimation]);

  return {
    handleCharacterClick,
    expressEmotion,
    playAnimation,
    character
  };
};
