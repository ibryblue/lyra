import React, { Suspense, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AnimatePresence } from 'framer-motion';
import { CharacterScene } from '../components/Character/CharacterScene';
import { MainInterface } from '../components/UI/MainInterface';
import { CosmicBackground, CosmicParticles, CosmicLoader } from '../components/UI/CosmicBackground';
import { useInteractions } from '../hooks/useInteractions';
import { useStore } from '../store/useStore';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center p-8 bg-gray-900/80 backdrop-blur-md rounded-xl max-w-md">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          Lyra encountered an error. Please try refreshing the page.
        </p>
        <pre className="text-xs text-gray-500 mb-6 bg-gray-800 p-3 rounded overflow-auto max-h-32">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Main Application Component
function MainPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { character } = useStore();
  
  // Initialize interactions hook
  useInteractions();

  // Simulate loading progress
  useEffect(() => {
    const loadingSteps = [
      { delay: 0, progress: 0, message: 'Initializing...' },
      { delay: 500, progress: 20, message: 'Loading 3D engine...' },
      { delay: 1000, progress: 40, message: 'Preparing character...' },
      { delay: 1500, progress: 60, message: 'Setting up voice system...' },
      { delay: 2000, progress: 80, message: 'Configuring interactions...' },
      { delay: 2500, progress: 100, message: 'Ready!' },
    ];

    loadingSteps.forEach(step => {
      setTimeout(() => {
        setLoadingProgress(step.progress);
        if (step.progress === 100) {
          setTimeout(() => setIsLoading(false), 500);
        }
      }, step.delay);
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="relative min-h-screen overflow-hidden bg-gray-900">
        {/* Cosmic Background */}
        <CosmicBackground />
        <CosmicParticles />

        {/* Loading Screen */}
        <AnimatePresence>
          {isLoading && (
            <CosmicLoader progress={loadingProgress} />
          )}
        </AnimatePresence>

        {/* Main Application Content */}
        {!isLoading && (
          <>
            {/* 3D Character Scene */}
            <div className="absolute inset-0">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-cyan-400 text-lg">Loading 3D scene...</div>
                </div>
              }>
                <CharacterScene />
              </Suspense>
            </div>

            {/* UI Interface */}
            <MainInterface />

            {/* Welcome Message Overlay */}
            {character.isLoaded && (
              <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <div className="bg-gray-900/90 backdrop-blur-md rounded-lg px-6 py-3 text-center max-w-md">
                  <h2 className="text-cyan-400 font-semibold mb-1">Welcome to Lyra</h2>
                  <p className="text-gray-300 text-sm">
                    Click on me to interact, or use the controls to customize my voice and appearance!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Performance Info (Development) */}
        {process.env.NODE_ENV === 'development' && !isLoading && (
          <div className="fixed bottom-4 right-4 bg-black/50 text-white text-xs p-2 rounded font-mono">
            <div>Mode: Development</div>
            <div>Character: {character.isLoaded ? 'Loaded' : 'Loading'}</div>
            <div>FPS: {Math.round(1000 / 16)} (estimated)</div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default MainPage; 