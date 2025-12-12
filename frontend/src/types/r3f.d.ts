/// <reference types="@react-three/fiber" />
import { Object3DNode, MaterialNode } from '@react-three/fiber';
import { ShaderMaterial, Color } from 'three';

// Define the specific uniforms your shader will use
type UkiyoeShaderMaterialProps = {
  uTime?: number;
  uColorStart?: Color | string;
  uColorEnd?: Color | string;
  wireframe?: boolean;
} & JSX.IntrinsicElements['shaderMaterial'];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Register the custom shader material
      ukiyoeShaderMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & UkiyoeShaderMaterialProps;
    }
  }
}
