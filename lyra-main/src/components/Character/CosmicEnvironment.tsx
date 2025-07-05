import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicEnvironmentProps {
  theme: 'cosmic' | 'space' | 'nebula';
}

// Particle system for floating cosmic dust
function CosmicDust({ count = 500 }) {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Animated constellation patterns
function ConstellationLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const constellationGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Create constellation patterns
    const constellations = [
      // Lyra constellation inspired points
      [
        new THREE.Vector3(-2, 8, -10),
        new THREE.Vector3(-1, 9, -10),
        new THREE.Vector3(0, 8.5, -10),
        new THREE.Vector3(1, 9.2, -10),
        new THREE.Vector3(2, 8.8, -10),
      ],
      // Another constellation
      [
        new THREE.Vector3(5, 6, -15),
        new THREE.Vector3(6, 7, -15),
        new THREE.Vector3(5.5, 8, -15),
        new THREE.Vector3(4.5, 7.5, -15),
      ],
      // Third constellation
      [
        new THREE.Vector3(-6, 5, -12),
        new THREE.Vector3(-7, 6, -12),
        new THREE.Vector3(-6.5, 7, -12),
        new THREE.Vector3(-5, 6.5, -12),
        new THREE.Vector3(-5.5, 5.5, -12),
      ]
    ];
    
    // Connect points within each constellation
    constellations.forEach(constellation => {
      for (let i = 0; i < constellation.length - 1; i++) {
        points.push(constellation[i]);
        points.push(constellation[i + 1]);
      }
    });
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={constellationGeometry}>
      <lineBasicMaterial
        color="#e1bee7"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Nebula-like background sphere
function NebulaSphere({ theme }: { theme: string }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 512;
    
    // Create gradient background
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    
    switch (theme) {
      case 'cosmic':
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#16213e');
        gradient.addColorStop(0.6, '#0f3460');
        gradient.addColorStop(1, '#0e2954');
        break;
      case 'space':
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#000011');
        break;
      case 'nebula':
        gradient.addColorStop(0, '#2d1b69');
        gradient.addColorStop(0.4, '#11998e');
        gradient.addColorStop(0.8, '#38ef7d');
        gradient.addColorStop(1, '#005f73');
        break;
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add noise
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 30 - 15;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }, [theme]);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.002;
    }
  });

  return (
    <mesh ref={sphereRef} scale={[-50, -50, -50]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial
        map={nebulaTexture}
        side={THREE.BackSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Floating energy orbs
function EnergyOrbs() {
  const orbsRef = useRef<THREE.Group>(null);
  
  const orbs = useMemo(() => {
    const orbPositions = [];
    for (let i = 0; i < 8; i++) {
      orbPositions.push({
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 10 + 2,
          (Math.random() - 0.5) * 20
        ],
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
    return orbPositions;
  }, []);

  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb, index) => {
        const orbData = orbs[index];
        orb.position.y = orbData.position[1] + Math.sin(state.clock.elapsedTime * orbData.speed + orbData.phase) * 2;
        orb.rotation.y = state.clock.elapsedTime * orbData.speed;
        
        // Pulsing glow effect
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + orbData.phase) * 0.3;
        orb.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={orbsRef}>
      {orbs.map((orb, index) => (
        <mesh key={index} position={orb.position as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#4fc3f7" : "#e1bee7"}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main Cosmic Environment Component
export function CosmicEnvironment({ theme }: CosmicEnvironmentProps) {
  return (
    <group>
      {/* Background nebula sphere */}
      <NebulaSphere theme={theme} />
      
      {/* Constellation lines */}
      <ConstellationLines />
      
      {/* Cosmic dust particles */}
      <CosmicDust count={300} />
      
      {/* Energy orbs */}
      <EnergyOrbs />
      
      {/* Additional atmospheric fog */}
      <fog attach="fog" args={['#0e2954', 10, 50]} />
    </group>
  );
}
