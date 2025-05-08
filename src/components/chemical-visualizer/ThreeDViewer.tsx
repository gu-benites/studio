"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Atom {
  id: number;
  element: string;
  x: number;
  y: number;
  z: number;
}

interface Bond {
  atom1Idx: number;
  atom2Idx: number;
  type: number;
}

export interface MoleculeData {
  atoms: Atom[];
  bonds: Bond[];
}

interface ThreeDViewerProps {
  moleculeData: MoleculeData | null;
  representation: 'ballAndStick' | 'spaceFilling' | 'wireframe';
  atomScaleFactor: number;
  bondRadius: number;
  showHydrogens: boolean;
  isLoading?: boolean; // General loading state from parent
}

const baseAtomColors: Record<string, number> = {
    'H':  0xFFFFFF, 'C':  0x202020, 'O':  0xFF0000, 'N':  0x0000FF,
    'S':  0xFFFF00, 'P':  0xFFA500, 'F':  0x00FF00, 'CL': 0x00FF00,
    'BR': 0xA52A2A, 'I':  0x800080, 'DEFAULT': 0xCCCCCC
};
const baseAtomRadii: Record<string, number> = {
    'H':  0.30, 'C':  0.70, 'O':  0.65, 'N':  0.70,
    'S':  1.00, 'P':  1.10, 'F':  0.60, 'CL': 1.00,
    'BR': 1.15, 'I':  1.33, 'DEFAULT': 0.75
};
const vdwAtomRadii: Record<string, number> = {
    'H': 1.20, 'C': 1.70, 'O': 1.52, 'N': 1.55,
    'S': 1.80, 'P': 1.80, 'F': 1.47, 'CL': 1.75,
    'BR': 1.85, 'I': 1.98, 'DEFAULT': 1.60
};
const sphereSegments = 16;
const cylinderSegments = 8;

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  moleculeData,
  representation,
  atomScaleFactor,
  bondRadius,
  showHydrogens,
  isLoading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false); // Internal rendering busy state


  const displayMolecule = useCallback(() => {
    if (!moleculeGroupRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current || !rendererRef.current || !moleculeData) {
      return;
    }
    
    setIsRendering(true);

    // Clear previous molecule
    while (moleculeGroupRef.current.children.length > 0) {
      const object = moleculeGroupRef.current.children[0];
      moleculeGroupRef.current.remove(object);
      if ((object as THREE.Mesh).geometry) (object as THREE.Mesh).geometry.dispose();
      const material = (object as THREE.Mesh).material;
      if (material) {
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      }
    }

    const { atoms, bonds } = moleculeData;
    if (atoms.length === 0) {
        setIsRendering(false);
        return;
    }

    const offset = new THREE.Vector3();
    atoms.forEach(atom => offset.add(new THREE.Vector3(atom.x, atom.y, atom.z)));
    offset.divideScalar(atoms.length || 1);

    const hiddenAtomIndices = new Set<number>();
    if (!showHydrogens) {
        atoms.forEach((atom, index) => {
            if (atom.element === 'H') hiddenAtomIndices.add(index);
        });
    }
    
    atoms.forEach((atom, index) => {
        if (hiddenAtomIndices.has(index)) return;

        const atomElementKey = atom.element.toUpperCase();
        const color = baseAtomColors[atomElementKey] || baseAtomColors['DEFAULT'];
        let atomMesh;
        let radius;

        if (representation === 'wireframe') {
            radius = (baseAtomRadii[atomElementKey] || baseAtomRadii['DEFAULT']) * atomScaleFactor * 0.3;
            radius = Math.min(0.12, Math.max(0.04, radius)); 
            const sphereGeometry = new THREE.SphereGeometry(radius, 8, 8); 
            const sphereMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 50, emissive: color, emissiveIntensity: 0.15 });
            atomMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        } else if (representation === 'spaceFilling') {
            radius = (vdwAtomRadii[atomElementKey] || vdwAtomRadii['DEFAULT']) * atomScaleFactor;
            const sphereGeometry = new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
            const sphereMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 60 });
            atomMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        } else { // ballAndStick
            radius = (baseAtomRadii[atomElementKey] || baseAtomRadii['DEFAULT']) * atomScaleFactor;
            const sphereGeometry = new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
            const sphereMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 60 });
            atomMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        }
        
        atomMesh.position.set(atom.x - offset.x, atom.y - offset.y, atom.z - offset.z);
        moleculeGroupRef.current?.add(atomMesh);
    });

    if (representation !== 'spaceFilling') { 
        bonds.forEach(bond => {
            if (hiddenAtomIndices.has(bond.atom1Idx) || hiddenAtomIndices.has(bond.atom2Idx)) return;

            const atom1 = atoms[bond.atom1Idx];
            const atom2 = atoms[bond.atom2Idx];
            if (!atom1 || !atom2) return;

            const pos1 = new THREE.Vector3(atom1.x - offset.x, atom1.y - offset.y, atom1.z - offset.z);
            const pos2 = new THREE.Vector3(atom2.x - offset.x, atom2.y - offset.y, atom2.z - offset.z);
            
            const bondVector = new THREE.Vector3().subVectors(pos2, pos1);
            const bondLength = bondVector.length();
            if (bondLength < 0.01) return;
            
            let effectiveBondRadius = bondRadius;
            if (representation === 'wireframe') {
                effectiveBondRadius = Math.max(0.02, bondRadius * 0.25); 
            }

            const bondGeometry = new THREE.CylinderGeometry(effectiveBondRadius, effectiveBondRadius, bondLength, cylinderSegments);
            const bondMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 30 });
            
            const cylinderMesh = new THREE.Mesh(bondGeometry, bondMaterial);
            cylinderMesh.position.copy(pos1).add(bondVector.clone().multiplyScalar(0.5));
            cylinderMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bondVector.clone().normalize());
            moleculeGroupRef.current?.add(cylinderMesh);
        });
    }

    let maxDist = 0;
    atoms.forEach((atom, index) => {
        if (hiddenAtomIndices.has(index)) return;
        const dist = new THREE.Vector3(atom.x - offset.x, atom.y - offset.y, atom.z - offset.z).length();
        if (dist > maxDist) maxDist = dist;
    });
    
    let zoomFactor = 2.8; 
    if (representation === 'spaceFilling') zoomFactor = 2.0;
    else if (representation === 'wireframe') zoomFactor = 3.5;

    const effectiveDefaultRadius = (baseAtomRadii['DEFAULT'] || 0.75) * atomScaleFactor * 2;
    cameraRef.current.position.z = Math.max(5, (maxDist * zoomFactor) + effectiveDefaultRadius);
    controlsRef.current.target.copy(new THREE.Vector3(0,0,0));
    controlsRef.current.update();
    
    // Delay setting rendering to false slightly to ensure one render cycle completes
    requestAnimationFrame(() => setIsRendering(false));
  }, [moleculeData, representation, atomScaleFactor, bondRadius, showHydrogens]);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current && !rendererRef.current) {
      // Initialize Three.js
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = new THREE.Color(0xe0e0e0);

      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      cameraRef.current.position.z = 15;

      rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(rendererRef.current.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      sceneRef.current.add(ambientLight);
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight1.position.set(5, 10, 7.5);
      sceneRef.current.add(directionalLight1);
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-5, -5, -7.5);
      sceneRef.current.add(directionalLight2);
      
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;

      moleculeGroupRef.current = new THREE.Group();
      sceneRef.current.add(moleculeGroupRef.current);
      
      const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        controlsRef.current?.update();
        if (sceneRef.current && cameraRef.current && rendererRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();
    }

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width > 0 && height > 0) {
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current && containerRef.current && rendererRef.current.domElement) {
         if (containerRef.current.contains(rendererRef.current.domElement)) {
             containerRef.current.removeChild(rendererRef.current.domElement);
         }
      }
      rendererRef.current?.dispose();
      rendererRef.current = null;
      sceneRef.current?.clear(); 
      sceneRef.current = null;
      cameraRef.current = null; 
      controlsRef.current?.dispose();
      controlsRef.current = null;
      moleculeGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (moleculeData) {
      displayMolecule();
    } else if (moleculeGroupRef.current) {
      // Clear if moleculeData becomes null
       while (moleculeGroupRef.current.children.length > 0) {
          const object = moleculeGroupRef.current.children[0];
          moleculeGroupRef.current.remove(object);
          if ((object as THREE.Mesh).geometry) (object as THREE.Mesh).geometry.dispose();
          const material = (object as THREE.Mesh).material;
          if (material) {
            if (Array.isArray(material)) {
              material.forEach(m => m.dispose());
            } else {
              material.dispose();
            }
          }
        }
    }
  }, [moleculeData, representation, atomScaleFactor, bondRadius, showHydrogens, displayMolecule]);


  return (
    <div ref={containerRef} className="absolute inset-0 rounded-md bg-muted/50 border overflow-hidden">
      {(isLoading || isRendering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
       {!moleculeData && !isLoading && !isRendering && (
         <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-0">
            <p className="text-muted-foreground">No 3D data to display or CID not found.</p>
        </div>
       )}
    </div>
  );
};