import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stars, 
  PresentationControls,
  Stage,
  ContactShadows,
  Html,
  useProgress
} from '@react-three/drei';
import { Character } from './Character';
import { CosmicEnvironment } from './CosmicEnvironment';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

// Loading component
function Loader() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <motion.div 
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4"></div>
        <p className="text-cyan-400 text-lg font-light">
          Loading Lyra... {Math.round(progress)}%
        </p>
        <div className="w-48 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </Html>
  );
}

// Camera controller for smooth movements
function CameraController() {
  const { mousePosition, isIdle } = useStore(state => state.interactions);
  const controlsRef = useRef<any>();

  useFrame(() => {
    if (controlsRef.current && !isIdle) {
      // Subtle camera movement based on mouse position
      const x = (mousePosition.x / window.innerWidth - 0.5) * 0.1;
      const y = -(mousePosition.y / window.innerHeight - 0.5) * 0.05;
      
      controlsRef.current.object.position.x += (x - controlsRef.current.object.position.x) * 0.02;
      controlsRef.current.object.position.y += (y - controlsRef.current.object.position.y) * 0.02;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={8}
      maxPolarAngle={Math.PI / 1.8}
      minPolarAngle={Math.PI / 3}
      target={[0, 1, 0]}
      autoRotate={isIdle}
      autoRotateSpeed={0.5}
    />
  );
}

// Lighting setup for character
function SceneLighting() {
  return (
    <>
      {/* Main directional light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-3, 2, -5]}
        intensity={0.6}
        color="#4fc3f7"
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.4} color="#1a1a2e" />
      
      {/* Point light for rim lighting */}
      <pointLight
        position={[0, 5, -3]}
        intensity={0.8}
        color="#e1bee7"
        distance={10}
        decay={2}
      />
    </>
  );
}

// Main Character Scene Component
export function CharacterScene() {
  const { ui, character } = useStore();
  
  return (
    <div className="relative w-full h-full">
      {/* Performance monitor overlay */}
      <div className="absolute top-4 left-4 z-10 text-cyan-400 text-sm font-mono opacity-70">
        <div>Character: {character.isLoaded ? 'Loaded' : 'Loading'}</div>
        <div>Animation: {character.currentAnimation}</div>
        <div>Expression: {character.expression}</div>
      </div>

      {/* Main 3D Canvas */}
      <Canvas
        shadows
        camera={{ 
          position: [0, 1.5, 5], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        className="bg-transparent"
      >
        {/* Suspense wrapper for async loading */}
        <Suspense fallback={<Loader />}>
          {/* Scene Lighting */}
          <SceneLighting />
          
          {/* Camera Controls */}
          <CameraController />
          
          {/* Cosmic Environment */}
          <CosmicEnvironment theme={ui.theme} />
          
          {/* Stars background */}
          <Stars
            radius={50}
            depth={50}
            count={1000}
            factor={4}
            saturation={0.3}
            fade
            speed={0.5}
          />
          
          {/* Character in presentation controls for better interaction */}
          <PresentationControls
            enabled={true}
            global={false}
            cursor={true}
            snap={false}
            speed={1}
            zoom={1}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
          >
            {/* Main Character */}
            <Character />
          </PresentationControls>
          
          {/* Contact shadows for grounding */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.3}
            scale={5}
            blur={2}
            far={2}
            color="#000000"
          />
          
          {/* Environment for reflections */}
          <Environment preset="night" background={false} />
          
        </Suspense>
      </Canvas>

      {/* UI Overlay for character info */}
      <motion.div
        className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-md rounded-lg p-4 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: character.isLoaded ? 1 : 0,
          y: character.isLoaded ? 0 : 20
        }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-cyan-400 font-semibold mb-2">
          {character.name}
        </h3>
        <p className="text-gray-300 text-sm">
          Your virtual companion from the digital cosmos. 
          Click on me to interact!
        </p>
        {character.isAnimating && (
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-cyan-400 text-xs">
              {character.currentAnimation}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
