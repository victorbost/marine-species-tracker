"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import SharkFin from "./SharkFin"

const useBrandColors = () => {
  // Default fallback colors (in case CSS hasn't loaded yet)
  const [colors, setColors] = React.useState({
    start: new THREE.Color("#0f172a"),
    end: new THREE.Color("#38bdf8"),
  });

  useEffect(() => {
    // Function to get the computed value of a CSS variable
    const getVar = (name: string) => {
      if (typeof window === "undefined") return "";
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    };

    const primary900 = getVar("--brand-primary-900");
    const primary500 = getVar("--brand-primary-500");

    if (primary900 && primary500) {
      setColors({
        start: new THREE.Color(`hsl(${primary900.replaceAll(" ", ",")})`),
        end: new THREE.Color(`hsl(${primary500.replaceAll(" ", ",")})`),
      });
    }
  }, []);

  return colors;
};

const UkiyoeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color("#000000"),
    uColorEnd: new THREE.Color("#ffffff"),
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

      // Define a foam color (white)
      vec3 foamColor = vec3(1.0, 1.0, 1.0);

      // Define a threshold for foam (e.g., when elevation is high)
      float foamThreshold = 0.3;

      // If the elevation is above the threshold, mix in some foam color
      if (vElevation > foamThreshold) {
        // A simple linear mix. You could use smoother functions for more realistic foam.
        float foamIntensity = smoothstep(foamThreshold, foamThreshold + 0.1, vElevation);
        color = mix(color, foamColor, foamIntensity);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ UkiyoeShaderMaterial });

// 3. The Wave Mesh Component
function WaveMesh() {
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
}

// 4. Main Export
function UkiyoeWaves() {
  return (
    // Use the darkest brand color for the container background to avoid white flashes
    <div className="absolute inset-0 w-full h-full okinawa-dawn">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <WaveMesh />
        {/* TODO implement physics for the fin */}
        <SharkFin />
      </Canvas>
    </div>
  );
}

export default UkiyoeWaves;
