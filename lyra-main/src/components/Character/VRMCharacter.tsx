import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { useStore } from '../../store/useStore';
import { useCharacterInteractions } from '../../hooks/useInteractions';
import { VRMManager, getVRMManager, getVRMAManager } from '../../lib/vrmManager';
import { MouseTracker } from './MouseTracker';

// Add global declarations for TypeScript
declare global {
  interface Window {
    animationMixer: THREE.AnimationMixer | null;
    currentAnimationAction: THREE.AnimationAction | null;
  }
}

export function VRMCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { scene } = useThree();
  const {
    character,
    setCharacterLoaded,
    setVRMRef
  } = useStore();
  
  const { handleCharacterClick } = useCharacterInteractions();
  
  // Initialize VRM manager
  const vrmManager = useRef<VRMManager | null>(null);
  useEffect(() => {
    vrmManager.current = getVRMManager(scene);
  }, [scene]);
  
  // Update VRM reference in store when it changes
  useEffect(() => {
    setVRMRef(vrmRef);
  }, [vrmRef, setVRMRef]);
  
  // Initialize character state
  useEffect(() => {
    setCharacterLoaded(false);
  }, [setCharacterLoaded]);
  
  // Load VRM when current VRM changes
  useEffect(() => {
    if (character.currentVRM) {
      loadVRMFile(character.currentVRM);
    }
  }, [character.currentVRM]);
  
  // Handle VRMA changes
  useEffect(() => {
    // Stop and cleanup current animation
    if (currentAction) {
      currentAction.stop();
      currentAction.getMixer().stopAllAction();
      setCurrentAction(null);
    }
    
    // Apply new animation if available
    if (character.currentVRMA?.animation && mixerRef.current && vrmRef.current) {
      const vrmaManager = getVRMAManager();
      const action = vrmaManager.applyAnimationToVRM(vrmRef.current, character.currentVRMA.animation, mixerRef.current);
      
      if (action) {
        action.reset().play();
        setCurrentAction(action);
        console.log('Started new animation:', character.currentVRMA.name);
      }
    }
  }, [character.currentVRMA]);
  
  // Cleanup animations when component unmounts
  useEffect(() => {
    return () => {
      if (currentAction) {
        currentAction.stop();
        currentAction.getMixer().stopAllAction();
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);
  
  // Animation system
  useFrame((state, delta) => {
    if (!vrmRef.current || !vrmManager.current) return;
    
    // Update VRM
    vrmManager.current.updateVRM(vrmRef.current, delta);
    
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
  
  // Load VRM file
  const loadVRMFile = async (vrmFile: any) => {
    if (!vrmFile || !vrmFile.url || !vrmManager.current) {
      setCharacterLoaded(false);
      setLoadError('No VRM file provided');
      return;
    }
    
    try {
      // Load the VRM model
      const vrm = await vrmManager.current.loadVRM(vrmFile.url);
      
      if (vrm) {
        // Clear existing content and add new VRM
        if (groupRef.current) {
          groupRef.current.clear();
          groupRef.current.add(vrm.scene);
        }
        
        // Update refs and state
        vrmRef.current = vrm;
        setCharacterLoaded(true);
        setLoadError(null);
        
        // Create animation mixer
        if (vrm.scene) {
          // Stop any existing animation
          if (currentAction) {
            currentAction.stop();
            currentAction.getMixer().stopAllAction();
            setCurrentAction(null);
          }
          if (mixerRef.current) {
            mixerRef.current.stopAllAction();
          }
          
          // Create new mixer
          mixerRef.current = new THREE.AnimationMixer(vrm.scene);
          
          // Apply current animation if available
          if (character.currentVRMA?.animation) {
            const vrmaManager = getVRMAManager();
            const action = vrmaManager.applyAnimationToVRM(vrm, character.currentVRMA.animation, mixerRef.current);
            if (action) {
              action.reset().play();
              setCurrentAction(action);
              console.log('Applied animation to new model:', character.currentVRMA.name);
            }
          }
        }
        
        console.log('VRM file loaded successfully:', vrmFile.name);
      } else {
        console.error('VRM loading failed: VRM object is null');
        setCharacterLoaded(false);
        setLoadError('Failed to load VRM model');
      }
    } catch (error) {
      console.error('VRM loading failed:', error);
      setCharacterLoaded(false);
      setLoadError(error instanceof Error ? error.message : 'Failed to load VRM model');
    }
  };
  
  // Return empty group if no character is loaded
  if (!character.isLoaded) {
    return <group ref={groupRef} />;
  }
  
  // Return the character group with click handler and mouse tracker
  return (
    <>
      <group ref={groupRef} onClick={handleCharacterClick}>
        {/* VRM model will be added to the scene directly */}
      </group>
      <MouseTracker />
    </>
  );
}
