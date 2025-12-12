import { useGLTF } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SharkFin = () => {
  const { scene } = useGLTF('/models/shark_fin.glb');
  const finRef = useRef<THREE.Group>(null); // Use THREE.Group if your model is a group of meshes
  const [targetScale, setTargetScale] = useState(0); // Starts hidden
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    // Clone the scene to avoid modifying the original GLTF asset if multiple fins are rendered
    const clonedScene = scene.clone();
    if (finRef.current) {
      finRef.current.add(clonedScene);
    }

    const interval = setInterval(() => {
      setTargetScale(prev => (prev === 0 ? 0.1 : 0)); // Toggle visibility
      // Only set new position when it's about to appear
      if (targetScale === 0) { // If it was hidden, and is now becoming visible
        const x = (Math.random() - 0.5) * 5;
        const y = (Math.random() - 0.5) * 5;
        setPosition([x, y, 0]); // Z will be calculated in useFrame
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetScale, scene]);

  useFrame((state) => { // 'state' contains time information
    if (finRef.current) {
      // Smoothly interpolate scale (as described above)
      // finRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      const currentTime = state.clock.elapsedTime; // Get current time

      // Get the current X and Y position of the fin
      const currentX = finRef.current.position.x;
      const currentY = finRef.current.position.y;

      // Replicate the wave elevation calculation from UkiyoeShaderMaterial (lines 59-64 of UkiyoeWaves.tsx)
      let elevation = Math.sin(currentX * 2.0 + currentTime * 0.2) * 0.2;
      elevation += Math.sin(currentY * 3.0 + currentTime * 0.1) * 0.1;
      elevation += Math.sin(currentY * 10.0 - currentTime * 0.5) * 0.05;

      // Apply a small offset so the fin appears above the water surface
      const surfaceOffset = 0.05; // Adjust this value as needed
      finRef.current.position.z = elevation + surfaceOffset;
    }
  });

  return (
    <group ref={finRef} position={position} />
  );
};
 export default SharkFin;
