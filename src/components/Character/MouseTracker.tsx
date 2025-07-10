import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { VRMLookAt } from '@pixiv/three-vrm';

export function MouseTracker() {
  const { character } = useStore();
  const [isTracking, setIsTracking] = useState(true);
  const targetObj = useRef(new THREE.Object3D());
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastBlinkTime = useRef(Date.now());
  const nextBlinkDelay = useRef(getRandomBlinkDelay());
  const isMoving = useRef(false);
  const moveStartTime = useRef(0);
  const moveDistance = useRef(new THREE.Vector3());
  const moveDuration = useRef(0);
  const lastMouseMoveTime = useRef(Date.now());
  const isIdle = useRef(false);
  const centerPos = new THREE.Vector3(0, 1.5, -2);
  const currentVelocity = useRef(new THREE.Vector3());

  function getRandomBlinkDelay() {
    return 2000 + Math.random() * 4000;
  }

  // Improved lerp function with velocity for smoother transitions
  function smoothLerp(current: number, target: number, velocity: { value: number }, smoothTime: number, deltaTime: number): number {
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = current - target;
    const temp = (velocity.value + omega * change) * deltaTime;
    velocity.value = (velocity.value - omega * temp) * exp;
    return target + (change + temp) * exp;
  }

  // Force eyes to center
  useEffect(() => {
    if (character.vrmRef?.current?.lookAt) {
      targetObj.current.position.copy(centerPos);
      character.vrmRef.current.lookAt.target = targetObj.current;
    }
  }, [character.vrmRef]);

  useEffect(() => {
    let animationFrameId: number;
    const target = new THREE.Vector3().copy(centerPos);
    let lastUpdateTime = Date.now();
    let idleCheckTimeout: NodeJS.Timeout;
    
    // Initialize target object position at eye level
    targetObj.current.position.copy(centerPos);
    currentVelocity.current.set(0, 0, 0);
    
    function startIdleCheck() {
      clearTimeout(idleCheckTimeout);
      idleCheckTimeout = setTimeout(() => {
        isIdle.current = true;
        isMoving.current = true;
        moveStartTime.current = Date.now();
        moveDuration.current = 800;
        moveDistance.current.subVectors(centerPos, targetObj.current.position);
      }, 1000);
    }
    
    function updateMousePosition(event: MouseEvent) {
      if (!isTracking || !character.vrmRef?.current) return;

      // Check if any expression is active
      const expressionManager = character.vrmRef.current.expressionManager;
      const hasActiveExpression = expressionManager?.expressions.some(
        expr => expressionManager?.getValue(expr.expressionName) > 0 && 
        expr.expressionName !== 'blink'
      );

      // If expressions are active or not tracking, keep eyes centered
      if (hasActiveExpression || !isTracking) {
        target.copy(centerPos);
        targetObj.current.position.copy(centerPos);
        if (character.vrmRef?.current?.lookAt) {
          character.vrmRef.current.lookAt.target = targetObj.current;
          // Force immediate update
          character.vrmRef.current.update(0);
        }
        return;
      }

      // Calculate normalized mouse position
      const rect = document.body.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Check if mouse is in center area (smaller dead zone)
      const inCenterArea = Math.abs(x) < 0.1 && Math.abs(y) < 0.1;

      // Apply natural movement limits
      const maxHorizontal = 0.6;
      const maxVertical = 0.4;

      // Simple clamping for more predictable movement
      const normalizedX = Math.max(-maxHorizontal, Math.min(maxHorizontal, x));
      const normalizedY = Math.max(-maxVertical, Math.min(maxVertical, y));

      // Calculate target position with balanced ranges
      const targetX = normalizedX * 0.8; // Reduced multiplier for more natural horizontal movement
      const targetY = normalizedY * 0.6 + 1.5; // Reduced multiplier but still noticeable
      const targetZ = -2 + Math.abs(normalizedY) * 0.3; // Subtle depth change

      // Set target based on position
      if (inCenterArea || isIdle.current) {
        target.copy(centerPos);
      } else {
        target.set(targetX, targetY, targetZ);
      }

      // Reset idle check
      isIdle.current = false;
      lastMouseMoveTime.current = Date.now();
      startIdleCheck();

      // Calculate movement
      moveDistance.current.subVectors(target, targetObj.current.position);
      const distance = moveDistance.current.length();

      // Start new movement if distance is significant
      if (distance > 0.001) {
        isMoving.current = true;
        moveStartTime.current = Date.now();
        moveDuration.current = 300; // Faster response time
        lastMousePos.current = { x, y };
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
        const deltaTime = Math.min((now - lastUpdateTime) / 1000, 0.016);
        lastUpdateTime = now;

        const lookAt = character.vrmRef.current.lookAt;
        if (lookAt) {
          // Check if expressions are active and force center if needed
          const expressionManager = character.vrmRef.current.expressionManager;
          const hasActiveExpression = expressionManager?.expressions.some(
            expr => expressionManager?.getValue(expr.expressionName) > 0 && 
            expr.expressionName !== 'blink'
          );

          if (hasActiveExpression || !isTracking) {
            targetObj.current.position.copy(centerPos);
            lookAt.target = targetObj.current;
          } else {
            const elapsed = now - moveStartTime.current;
            const progress = Math.min(elapsed / moveDuration.current, 1);
            
            if (progress < 1 && isMoving.current) {
              // Enhanced smooth movement with velocity
              const newPosition = new THREE.Vector3();
              const velocityX = { value: currentVelocity.current.x };
              const velocityY = { value: currentVelocity.current.y };
              const velocityZ = { value: currentVelocity.current.z };

              // Apply smoothing with different parameters for each axis
              newPosition.x = smoothLerp(
                targetObj.current.position.x,
                target.x,
                velocityX,
                0.08, // Faster horizontal response
                deltaTime
              );
              newPosition.y = smoothLerp(
                targetObj.current.position.y,
                target.y,
                velocityY,
                0.1, // Balanced vertical movement
                deltaTime
              );
              newPosition.z = smoothLerp(
                targetObj.current.position.z,
                target.z,
                velocityZ,
                0.12, // Smooth depth changes
                deltaTime
              );

              currentVelocity.current.set(velocityX.value, velocityY.value, velocityZ.value);
              targetObj.current.position.copy(newPosition);
            } else {
              targetObj.current.position.copy(target);
              isMoving.current = false;
            }

            lookAt.target = targetObj.current;
          }
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
      clearTimeout(idleCheckTimeout);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [character.vrmRef, isTracking]);

  return null;
} 