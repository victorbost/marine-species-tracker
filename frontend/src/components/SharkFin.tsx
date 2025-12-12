// frontend/src/components/SharkFin.tsx
import { useGLTF } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SharkFin = () => {
  const { scene } = useGLTF('/models/shark_fin.glb'); // Assuming this path is now correct
  const finRef = useRef<THREE.Group>(null);
  const [initialY, setInitialY] = useState(0); // For random vertical track
  const [speed, setSpeed] = useState(0.01); // Speed of horizontal movement

  const surfaceOffset = 0.015;
  // Variables for controlling fin's horizontal position
  const startX = -3; // Off-screen left
  const endX = 3;   // Off-screen right
  const resetX = -3; // Where it resets after going off-screen right

  useEffect(() => {
    // Clone the scene only once on mount
    const clonedScene = scene.clone();
    if (finRef.current) {
      finRef.current.add(clonedScene);
      // Set initial scale to 0 so it's invisible until it enters
      finRef.current.scale.set(0, 0, 0);
      // Set initial position off-screen left with a random Y
      finRef.current.position.set(startX, (Math.random() - 0.5) * 1.25, 0); // Random Y
    }
    setInitialY((Math.random() - 0.5) * 1.25); // Store random Y for potential use, or use position directly
    setSpeed(0.005 + Math.random() * 0.01); // Randomize speed slightly
  }, [scene, startX]); // Ensure effect runs only once or when scene changes

  useFrame((state, delta) => {
    if (finRef.current) {
      const currentTime = state.clock.elapsedTime;

      // 1. Horizontal Movement (Left to Right)
      finRef.current.position.x += speed; // Move the fin to the right

      // 2. Wrap Around (Reset to left when off-screen right)
      if (finRef.current.position.x > endX) {
        finRef.current.position.x = resetX;
        finRef.current.position.y = (Math.random() - 0.5) * 3; // New random Y when it resets
        setSpeed(0.005 + Math.random() * 0.01); // New random speed
      }

      // 3. Wave Following (Z-position)
      const currentX = finRef.current.position.x;
      const currentY = finRef.current.position.y;

      // Replicate the wave elevation calculation from UkiyoeShaderMaterial
      let elevation = Math.sin(currentX * 2.0 + currentTime * 0.2) * 0.2;
      elevation += Math.sin(currentY * 3.0 + currentTime * 0.1) * 0.1;
      elevation += Math.sin(currentY * 10.0 - currentTime * 0.5) * 0.05;

      finRef.current.position.z = elevation + surfaceOffset; // Now surfaceOffset is accessible

      // 4. Smooth Appearance/Disappearance (Scaling based on X position)
      const visibleRange = 4; // How far into the screen it should be fully visible
      let targetScale = 0;
      if (finRef.current.position.x > startX + 0.5 && finRef.current.position.x < endX - 0.5) {
        targetScale = 0.1; // Fully visible scale
      }

      // Smoothly interpolate the scale
      finRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return <group ref={finRef} />;
};

export default SharkFin;
