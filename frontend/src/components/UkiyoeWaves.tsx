"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// 1. Helper to parse Tailwind CSS variables into Three.js Colors
const useBrandColors = () => {
  // Default fallback colors (in case CSS hasn't loaded yet)
  const [colors, setColors] = React.useState({
    start: new THREE.Color("#0f172a"), // Fallback dark
    end: new THREE.Color("#38bdf8"),   // Fallback light
  });

  useEffect(() => {
    // Function to get the computed value of a CSS variable
    const getVar = (name: string) => {
      if (typeof window === "undefined") return "";
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    };

    // Grab your specific brand variables
    // We assume the variable contains HSL channels like "215 25% 27%"
    // or fully formatted colors depending on your setup.
    const primary900 = getVar("--brand-primary-900");
    const primary500 = getVar("--brand-primary-500");

    if (primary900 && primary500) {
      // Three.js can parse "hsl(215, 25%, 27%)" strings.
      // We reconstruct the CSS string safely.
      setColors({
        start: new THREE.Color(`hsl(${primary900.replaceAll(" ", ",")})`),
        end: new THREE.Color(`hsl(${primary500.replaceAll(" ", ",")})`),
      });
    }
  }, []);

  return colors;
};

// 2. Define the Shader Material
const UkiyoeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color("#000000"), // Will be overwritten by props
    uColorEnd: new THREE.Color("#ffffff"),   // Will be overwritten by props
  },
  // Vertex Shader (Geometry / Movement)
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;

    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      // Large Swell
      float elevation = sin(modelPosition.x * 2.0 + uTime * 0.2) * 0.2;
      // Cross Wave
      elevation += sin(modelPosition.y * 3.0 + uTime * 0.1) * 0.1;
      // Small Ripple
      elevation += sin(modelPosition.y * 10.0 - uTime * 0.5) * 0.05;

      modelPosition.z += elevation;
      modelPosition.y += elevation * 0.5;

      vElevation = elevation;
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `,
  // Fragment Shader (Color / Pixel)
  `
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying float vElevation;

    void main() {
      // Mix factor based on wave height
      float mixStrength = (vElevation + 0.25) * 2.0;

      // Interpolate between the Deep color (900) and Crest color (500)
      vec3 color = mix(uColorStart, uColorEnd, mixStrength);

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ UkiyoeShaderMaterial });

// 3. The Wave Mesh Component
const WaveMesh = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { start, end } = useBrandColors();

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;

      // Smoothly interpolate color changes if they load in late
      materialRef.current.uniforms.uColorStart.value.lerp(start, 0.1);
      materialRef.current.uniforms.uColorEnd.value.lerp(end, 0.1);
    }
  });

  return (
    // Rotate to face camera slightly
    <mesh rotation={[-Math.PI / 3, 0, 0]} scale={1.5}>
      <planeGeometry args={[10, 10, 128, 128]} />
      {/* We pass the initial colors, but useFrame lerps them for smoothness */}
      <ukiyoeShaderMaterial
        ref={materialRef}
        side={THREE.DoubleSide}
        uColorStart={start}
        uColorEnd={end}
      />
    </mesh>
  );
};

// 4. Main Export
const UkiyoeWaves = () => {
  return (
    // Use the darkest brand color for the container background to avoid white flashes
    <div className="absolute inset-0 w-full h-full okinawa-dawn">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <WaveMesh />
      </Canvas>
    </div>
  );
};

export default UkiyoeWaves;
