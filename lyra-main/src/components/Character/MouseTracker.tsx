import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { VRMLookAt } from '@pixiv/three-vrm';

export function MouseTracker() {
  const { character } = useStore();
  const [isTracking, setIsTracking] = useState(true);
  const targetObj = useRef(new THREE.Object3D());
  const currentVelocity = useRef(new THREE.Vector3());
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastBlinkTime = useRef(Date.now());
  const nextBlinkDelay = useRef(getRandomBlinkDelay());
  const isMoving = useRef(false);
  const moveStartTime = useRef(0);
  const moveDistance = useRef(new THREE.Vector3());
  const moveDuration = useRef(0);
  const maxSpeed = useRef(0);

  function getRandomBlinkDelay() {
    return 2000 + Math.random() * 4000;
  }

  // From "Eyes Alive" paper - adjusted for separate x/y movement
  function calculateMoveDuration(distanceX: number, distanceY: number): number {
    // Longer duration for vertical movement as eyes move slower vertically
    const xDuration = 0.025 + 0.00235 * Math.abs(distanceX);
    const yDuration = 0.035 + 0.00335 * Math.abs(distanceY); // Slower for vertical
    return Math.max(xDuration, yDuration);
  }

  // From "Realistic Avatar and Head Animation" paper - adjusted for separate x/y movement
  function calculateMaxSpeed(distanceX: number, distanceY: number): number {
    const xSpeed = 473 * (1 - Math.exp(-Math.abs(distanceX) / 7.8));
    const ySpeed = 373 * (1 - Math.exp(-Math.abs(distanceY) / 6.2)); // Slower vertical movement
    return Math.max(xSpeed, ySpeed);
  }

  useEffect(() => {
    let animationFrameId: number;
    const target = new THREE.Vector3(0, 1.5, -2);
    let lastUpdateTime = Date.now();
    
    // Initialize target object position at eye level
    targetObj.current.position.set(0, 1.5, -2);
    
    function updateMousePosition(event: MouseEvent) {
      if (!isTracking || !character.vrmRef?.current) return;

      // Calculate normalized mouse position
      const rect = document.body.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Apply natural movement limits with different ranges for x and y
      const maxHorizontal = 0.6;  // Increased for wider horizontal movement
      const maxVertical = 0.45;   // Adjusted for natural vertical range
      const normalizedX = Math.max(-maxHorizontal, Math.min(maxHorizontal, x));
      const normalizedY = Math.max(-maxVertical, Math.min(maxVertical, y));

      // Calculate target position with adjusted multipliers
      const targetX = normalizedX * 1.2;  // Horizontal movement
      const targetY = normalizedY * 1.0 + 1.5;  // Vertical movement
      const targetZ = -2 + Math.abs(normalizedY) * 0.2; // Slight depth adjustment for vertical movement

      // Set new target position
      target.set(targetX, targetY, targetZ);

      // Calculate separate X and Y distances for movement parameters
      const currentX = targetObj.current.position.x;
      const currentY = targetObj.current.position.y;
      const distanceX = Math.abs(targetX - currentX) * 100; // Convert to degrees
      const distanceY = Math.abs(targetY - currentY) * 100; // Convert to degrees

      // Calculate movement parameters based on both X and Y movement
      moveDistance.current.subVectors(target, targetObj.current.position);
      
      // Only start new movement if either X or Y distance is significant
      if (distanceX > 0.01 || distanceY > 0.01) {
        isMoving.current = true;
        moveStartTime.current = Date.now();
        moveDuration.current = calculateMoveDuration(distanceX, distanceY) * 1000;
        maxSpeed.current = calculateMaxSpeed(distanceX, distanceY);
        lastMousePos.current = { x: normalizedX, y: normalizedY };
      }
    }

    function handleBlink() {
      const now = Date.now();
      if (now - lastBlinkTime.current > nextBlinkDelay.current) {
        if (character.vrmRef?.current) {
          const vrm = character.vrmRef.current;
          vrm.expressionManager?.setValue('blink', 1);
          setTimeout(() => {
            vrm.expressionManager?.setValue('blink', 0);
          }, 150);
        }
        lastBlinkTime.current = now;
        nextBlinkDelay.current = getRandomBlinkDelay();
      }
    }

    function animate() {
      if (character.vrmRef?.current) {
        const now = Date.now();
        const deltaTime = (now - lastUpdateTime) / 1000;
        lastUpdateTime = now;

        const lookAt = character.vrmRef.current.lookAt;
        if (lookAt && isMoving.current) {
          const elapsed = now - moveStartTime.current;
          const progress = Math.min(elapsed / moveDuration.current, 1);
          
          if (progress < 1) {
            // Smooth step interpolation with adjusted curve for more natural movement
            const smoothProgress = progress * progress * (3 - 2 * progress);
            
            // Update position using direct interpolation with the smooth progress
            const newPosition = target.clone().sub(moveDistance.current)
              .add(moveDistance.current.multiplyScalar(smoothProgress));
            
            targetObj.current.position.copy(newPosition);
          } else {
            // Movement complete
            targetObj.current.position.copy(target);
            isMoving.current = false;
          }

          // Apply look at
          lookAt.target = targetObj.current;
        }

        // Handle blinking
        handleBlink();

        // Update VRM animations
        character.vrmRef.current.update(deltaTime);
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();

    // Add mouse move listener
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [character.vrmRef, isTracking]);

  return null;
} 