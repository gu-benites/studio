
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, ImageOff, RefreshCw } from 'lucide-react';
import Image from 'next/image'; // Import next/image
// Dynamic import for THREE and OrbitControls will be handled in useEffect
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Alert, AlertDescription } from '@/components/ui/alert'; 
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";


const ChemicalVisualizerPage: NextPage = () => {
  const { toast } = useToast();
  const threeContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs for THREE.js objects
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any | null>(null); // Using any for OrbitControls to avoid direct THREE import issue at top level
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);


  const [searchType, setSearchType] = useState<'cid' | 'name'>('cid');
  const [searchTerm, setSearchTerm] = useState<string>('22311'); // Default: Limonene
  const [searchResults, setSearchResults] = useState<{ cid: string; title: string }[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Default: Limonene (22311). Visualize to load.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isViewerLoading, setIsViewerLoading] = useState<boolean>(false);

  const [compoundName, setCompoundName] = useState<string>('');
  const [molecularFormula, setMolecularFormula] = useState<string>('');
  const [structureImageUrl, setStructureImageUrl] = useState<string>('');
  const [parsedMoleculeData, setParsedMoleculeData] = useState<any>(null);

  const [representation, setRepresentation] = useState<'ballAndStick' | 'spaceFilling' | 'wireframe'>('ballAndStick');
  const [atomScaleFactor, setAtomScaleFactor] = useState<number>(1.0);
  const [bondRadius, setBondRadius] = useState<number>(0.1);
  const [showHydrogens, setShowHydrogens] = useState<boolean>(true);

  useEffect(() => {
    let THREE: typeof import('three');
    let OrbitControls: typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;

    const initThree = async () => {
      if (typeof window !== 'undefined' && threeContainerRef.current && !rendererRef.current) {
        THREE = await import('three');
        const { OrbitControls: OC } = await import('three/examples/jsm/controls/OrbitControls.js');
        OrbitControls = OC;

        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0xe0e0e0);

        cameraRef.current = new THREE.PerspectiveCamera(
          75,
          threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight,
          0.1,
          1000
        );
        cameraRef.current.position.z = 15;

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rendererRef.current.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        threeContainerRef.current.appendChild(rendererRef.current.domElement);

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
    };

    initThree();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && threeContainerRef.current) {
        cameraRef.current.aspect = threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (threeContainerRef.current && rendererRef.current.domElement) {
          // Check if domElement still exists before trying to remove
          if (threeContainerRef.current.contains(rendererRef.current.domElement)) {
            threeContainerRef.current.removeChild(rendererRef.current.domElement);
          }
        }
        rendererRef.current = null; 
      }
        // Dispose of scene, camera, controls, moleculeGroup if they exist and have dispose methods
        sceneRef.current?.clear(); // THREE.Scene doesn't have a dispose, but clear can help
        cameraRef.current = null; // No dispose method for camera
        controlsRef.current?.dispose();
        if(moleculeGroupRef.current) {
            while(moleculeGroupRef.current.children.length > 0){ 
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
        moleculeGroupRef.current = null;
    };
  }, []);

  const formatMolecularFormula = (formula: string) => {
    return formula.replace(/([A-Za-z])([0-9]+)/g, '$1<sub>$2</sub>');
  };

  const parseSDF = (sdfData: string) => {
    const lines = sdfData.split('\n');
    const atoms = [];
    const bonds = [];
    if (lines.length < 4) {
      console.error("SDF data too short.");
      return { atoms, bonds };
    }
    const countsLine = lines[3].trim();
    const parts = countsLine.match(/(\d+)\s+(\d+)/); 
    if (!parts || parts.length < 3) {
        console.error("Could not parse numAtoms/numBonds from SDF:", countsLine);
        return { atoms, bonds };
    }
    const numAtoms = parseInt(parts[1]);
    const numBonds = parseInt(parts[2]);

    if (isNaN(numAtoms) || isNaN(numBonds)) {
      console.error("Invalid atom/bond count:", countsLine);
      return { atoms, bonds };
    }

    for (let i = 0; i < numAtoms; i++) {
      const lineIndex = 4 + i;
      if (lineIndex >= lines.length) break;
      const line = lines[lineIndex];
      const x = parseFloat(line.substring(0, 10));
      const y = parseFloat(line.substring(10, 20));
      const z = parseFloat(line.substring(20, 30));
      let element = line.substring(31, 34).trim().toUpperCase();
      if (element === "CL") element = "Cl";
      if (element === "BR") element = "Br";
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && element) {
        atoms.push({ element, x, y, z, id: i });
      } else {
        console.warn(`Skipping malformed atom line ${lineIndex + 1}: ${line}`);
      }
    }

    const bondStartIndex = 4 + numAtoms;
    for (let i = 0; i < numBonds; i++) {
      const lineIndex = bondStartIndex + i;
      if (lineIndex >= lines.length) break;
      const line = lines[lineIndex];
      const atom1Idx = parseInt(line.substring(0, 3)) - 1; 
      const atom2Idx = parseInt(line.substring(3, 6)) - 1; 
      const bondType = parseInt(line.substring(6, 9));
      if (!isNaN(atom1Idx) && !isNaN(atom2Idx) && atom1Idx < atoms.length && atom2Idx < atoms.length) {
        bonds.push({ atom1_idx: atom1Idx, atom2_idx: atom2Idx, type: bondType }); 
      } else {
         console.warn(`Skipping malformed/invalid bond line ${lineIndex + 1}: ${line}`);
      }
    }
    return { atoms, bonds };
  };
  
  const displayMolecule = useCallback(async (molecule: any) => {
    if (!moleculeGroupRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const THREE = await import('three');

    // Clear previous molecule
    while (moleculeGroupRef.current.children.length > 0) {
      const object = moleculeGroupRef.current.children[0];
      moleculeGroupRef.current.remove(object);
      if ((object as THREE.Mesh).geometry) (object as THREE.Mesh).geometry.dispose();
      if ((object as THREE.Mesh).material) {
        const material = (object as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      }
    }

    const { atoms, bonds } = molecule;
    if (atoms.length === 0) return;

    const offset = new THREE.Vector3();
    atoms.forEach((atom: any) => {
      offset.add(new THREE.Vector3(atom.x, atom.y, atom.z));
    });
    offset.divideScalar(atoms.length);

    const hiddenAtomIndices = new Set<number>();
    if (!showHydrogens) {
        atoms.forEach((atom: any, index: number) => {
            if (atom.element === 'H') hiddenAtomIndices.add(index);
        });
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

    atoms.forEach((atom: any, index: number) => {
        if (hiddenAtomIndices.has(index)) return;

        const effectiveAtomRadii = representation === 'spaceFilling' ? vdwAtomRadii : baseAtomRadii;
        const radius = (effectiveAtomRadii[atom.element.toUpperCase()] || effectiveAtomRadii['DEFAULT']) * atomScaleFactor;
        const color = baseAtomColors[atom.element.toUpperCase()] || baseAtomColors['DEFAULT'];
        
        let sphereMesh;
        if (representation === 'wireframe') {
            const sphereGeometry = new THREE.SphereGeometry(Math.max(0.05, radius * 0.2), 8, 8);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: false });
            sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        } else {
            const sphereGeometry = new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
            const sphereMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 60 });
            sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        }
        sphereMesh.position.set(atom.x - offset.x, atom.y - offset.y, atom.z - offset.z);
        moleculeGroupRef.current?.add(sphereMesh);
    });

    if (representation !== 'spaceFilling') {
        bonds.forEach((bond: any) => {
            if (hiddenAtomIndices.has(bond.atom1_idx) || hiddenAtomIndices.has(bond.atom2_idx)) return;

            const atom1 = atoms[bond.atom1_idx];
            const atom2 = atoms[bond.atom2_idx];
            if (!atom1 || !atom2) return;

            const pos1 = new THREE.Vector3(atom1.x - offset.x, atom1.y - offset.y, atom1.z - offset.z);
            const pos2 = new THREE.Vector3(atom2.x - offset.x, atom2.y - offset.y, atom2.z - offset.z);
            
            const bondVector = new THREE.Vector3().subVectors(pos2, pos1);
            const bondLength = bondVector.length();
            if (bondLength < 0.01) return;

            const effectiveBondRadius = (representation === 'wireframe') ? Math.max(0.02, bondRadius * 0.3) : bondRadius;
            const bondGeometry = new THREE.CylinderGeometry(effectiveBondRadius, effectiveBondRadius, bondLength, cylinderSegments);
            const bondMaterial = representation === 'wireframe' 
                ? new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true })
                : new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 30 });

            const cylinderMesh = new THREE.Mesh(bondGeometry, bondMaterial);
            cylinderMesh.position.copy(pos1).add(bondVector.clone().multiplyScalar(0.5));
            cylinderMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bondVector.clone().normalize());
            moleculeGroupRef.current?.add(cylinderMesh);
        });
    }

    let maxDist = 0;
    atoms.forEach((atom: any) => {
        // Ensure 'id' property exists on atom objects if using atom.id
        // If atoms are indexed directly and don't have an 'id' property, use their index
        const atomIndex = atoms.indexOf(atom); // Or however you get the index if 'id' isn't present
        if (hiddenAtomIndices.has(atomIndex)) return; 
        const dist = new THREE.Vector3(atom.x - offset.x, atom.y - offset.y, atom.z - offset.z).length();
        if (dist > maxDist) maxDist = dist;
    });
    
    let zoomFactor = 3.0;
    if (representation === 'spaceFilling') zoomFactor = 2.2;
    else if (representation === 'wireframe') zoomFactor = 3.8;

    cameraRef.current.position.z = Math.max(5, maxDist * zoomFactor + (baseAtomRadii['DEFAULT'] * atomScaleFactor * 2));
    controlsRef.current.target.copy(new THREE.Vector3(0,0,0));
    controlsRef.current.update();

  }, [representation, atomScaleFactor, bondRadius, showHydrogens]);

  const loadCompoundByCID = useCallback(async (cid: string) => {
    setIsLoading(true);
    setIsViewerLoading(true);
    setStatusMessage(`Fetching data for CID: ${cid}...`);
    setCompoundName('');
    setMolecularFormula('');
    setStructureImageUrl('');
    setParsedMoleculeData(null);
    if (moleculeGroupRef.current) {
      while (moleculeGroupRef.current.children.length > 0) {
        moleculeGroupRef.current.remove(moleculeGroupRef.current.children[0]);
      }
    }

    try {
      const namePromise = fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/Title/JSON`);
      const formulaPromise = fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula/JSON`);
      const imageSrc = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;
      setStructureImageUrl(imageSrc); // Set immediately for optimistic loading

      const [nameResponse, formulaResponse] = await Promise.all([namePromise, formulaPromise]);

      let fetchedCompoundName = `Compound (CID: ${cid})`;
      if (nameResponse.ok) {
        const nameData = await nameResponse.json();
        if (nameData.PropertyTable?.Properties?.[0]?.Title) {
          fetchedCompoundName = nameData.PropertyTable.Properties[0].Title;
        }
      } else { console.warn(`Could not fetch compound name for CID ${cid}`); }
      setCompoundName(fetchedCompoundName);

      if (formulaResponse.ok) {
        const formulaData = await formulaResponse.json();
        if (formulaData.PropertyTable?.Properties?.[0]?.MolecularFormula) {
          setMolecularFormula(formulaData.PropertyTable.Properties[0].MolecularFormula);
        } else { setMolecularFormula('N/A'); }
      } else {
        console.warn(`Could not fetch molecular formula for CID ${cid}`);
        setMolecularFormula('Error loading formula.');
      }
      
      const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
      const sdfResponse = await fetch(sdfUrl);

      if (!sdfResponse.ok) {
        const errorText = await sdfResponse.text();
        if (sdfResponse.status === 404 || errorText.includes("PUGREST.NotFound")) {
            throw new Error(`CID ${cid}: 3D structure data not found. 2D info may be available.`);
        }
        throw new Error(`Failed to fetch 3D SDF (CID ${cid}). Status: ${sdfResponse.status}`);
      }
      
      const sdfData = await sdfResponse.text();
      if (!sdfData || sdfData.trim() === "" || sdfData.includes("PUGREST.NotFound")) {
        throw new Error(`No 3D SDF data returned for CID ${cid}.`);
      }
      const parsedData = parseSDF(sdfData);
      if (!parsedData || parsedData.atoms.length === 0) {
        throw new Error('Failed to parse 3D SDF or no atoms found.');
      }
      setParsedMoleculeData(parsedData);
      setStatusMessage(`Successfully loaded: ${fetchedCompoundName} (CID: ${cid}).`);
      toast({ title: "Success", description: `${fetchedCompoundName} loaded.` });

    } catch (error: any) {
      console.error('Error loading compound by CID:', error);
      setStatusMessage(`Load Error (CID: ${cid}): ${error.message}`);
      setParsedMoleculeData(null); // Ensure no old data is shown on error
      setStructureImageUrl(''); // Clear image on SDF error too if it implies no 3D data
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsViewerLoading(false);
    }
  }, [toast, parseSDF]);

  const loadCompoundByName = useCallback(async (name: string) => {
    setIsLoading(true);
    setStatusMessage(`Searching for compound: "${name}"...`);
    setCompoundName('');
    setMolecularFormula('Searching...');
    setStructureImageUrl('');
    setParsedMoleculeData(null);
    setSearchResults([]); // Clear previous name search results

    try {
        const nameSearchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
        const cidsResponse = await fetch(nameSearchUrl);

        if (!cidsResponse.ok) {
            if (cidsResponse.status === 404) throw new Error(`Compound name "${name}" not found.`);
            throw new Error(`Error fetching CIDs for name. Status: ${cidsResponse.status}`);
        }
        const cidsData = await cidsResponse.json();
        const cids = cidsData.IdentifierList?.CID;

        if (!cids || cids.length === 0) throw new Error(`No CIDs found for "${name}".`);

        if (cids.length === 1) {
            setStatusMessage(`One match found (CID: ${cids[0]}). Loading details...`);
            await loadCompoundByCID(cids[0].toString());
        } else {
            setStatusMessage(`Multiple matches for "${name}". Fetching titles...`);
            // Limit the number of CIDs sent for titles to avoid overly long URLs (e.g., first 20)
            const cidsForTitles = cids.slice(0, 20).join(',');
            const titlesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cidsForTitles}/property/Title/JSON`;
            const titlesResponse = await fetch(titlesUrl);
            let titlesMap: Record<string, string> = {};
            if (titlesResponse.ok) {
                const titlesData = await titlesResponse.json();
                titlesData.PropertyTable?.Properties?.forEach((prop: any) => {
                    titlesMap[prop.CID] = prop.Title;
                });
            } else console.warn("Could not fetch titles for multiple CIDs.");

            const results = cids.map((cid: number) => ({
                cid: cid.toString(),
                title: titlesMap[cid] || `Compound CID: ${cid}`
            }));
            
            setSearchResults(results.slice(0, 10)); // Show max 10 results for selection
            setStatusMessage(`Please select from ${results.length > 10 ? 'the first 10 of ' : ''}${results.length} matches.`);
            toast({ title: "Multiple Matches", description: `Found ${results.length} matches. Select one from the list.` });
        }
    } catch (error: any) {
        console.error('Error searching by name:', error);
        setStatusMessage(`Name Search Error: ${error.message}`);
        toast({ title: "Search Error", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [loadCompoundByCID, toast]);

  const handleVisualizeClick = () => {
    if (!searchTerm.trim()) {
      setStatusMessage('Please enter a search term.');
      toast({ title: "Input Required", description: "Please enter a search term.", variant: "destructive" });
      return;
    }
    setSearchResults([]); // Clear name search results when visualizing directly
    if (searchType === 'cid') {
      if (!/^\d+$/.test(searchTerm)) {
        setStatusMessage('Invalid CID. Please enter numbers only.');
        toast({ title: "Invalid Input", description: "CID must be numeric.", variant: "destructive" });
        return;
      }
      loadCompoundByCID(searchTerm);
    } else {
      loadCompoundByName(searchTerm);
    }
  };
  
  // useEffect to call displayMolecule when parsedMoleculeData or visual controls change
  useEffect(() => { 
    if (parsedMoleculeData && rendererRef.current) { // Ensure renderer is initialized
      setIsViewerLoading(true);
      displayMolecule(parsedMoleculeData).finally(() => setIsViewerLoading(false));
    }
  }, [parsedMoleculeData, representation, atomScaleFactor, bondRadius, showHydrogens, displayMolecule]);

  const resetAll = () => {
    setSearchType('cid');
    setSearchTerm('22311');
    setSearchResults([]);
    setStatusMessage('Default: Limonene (22311). Visualize to load.');
    setCompoundName('');
    setMolecularFormula('');
    setStructureImageUrl('');
    setParsedMoleculeData(null);
    setRepresentation('ballAndStick');
    setAtomScaleFactor(1.0);
    setBondRadius(0.1);
    setShowHydrogens(true);
    setIsLoading(false);
    setIsViewerLoading(false); // Reset viewer loading state
    if (moleculeGroupRef.current) {
      while (moleculeGroupRef.current.children.length > 0) {
        moleculeGroupRef.current.remove(moleculeGroupRef.current.children[0]);
      }
    }
    toast({ title: "Visualizer Reset", description: "All fields and views have been reset." });
  };


  return (
    <>
      <Head>
        <title>Chemical Visualizer - RecipeSage</title>
        <meta name="description" content="Visualize chemical compounds from PubChem in 2D and 3D." />
      </Head>
      <div className="container mx-auto py-8 px-4 space-y-6">
        <header className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">PubChem Compound Visualizer</h1>
            <p className="mt-2 text-lg text-muted-foreground">Explore chemical structures in 2D and 3D.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Search Compound</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-none w-full sm:w-auto">
                <Label htmlFor="searchTypeSelect">Search By</Label>
                <Select value={searchType} onValueChange={(value: 'cid' | 'name') => {
                  setSearchType(value);
                  setSearchTerm(value === 'cid' ? '22311' : 'aspirin'); // Update placeholder text on type change
                  setSearchResults([]); // Clear results on type change
                }}>
                  <SelectTrigger id="searchTypeSelect">
                    <SelectValue placeholder="Select search type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cid">PubChem CID</SelectItem>
                    <SelectItem value="name">Compound Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-grow w-full">
                <Label htmlFor="searchInput">Search Term</Label>
                <Input
                  id="searchInput"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchType === 'cid' ? "e.g., 22311" : "e.g., Aspirin"}
                  onKeyPress={(e) => e.key === 'Enter' && handleVisualizeClick()}
                />
              </div>
              <Button onClick={handleVisualizeClick} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Visualize
              </Button>
               <Button onClick={resetAll} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
             {searchResults.length > 0 && (
                <div className="space-y-2 pt-2">
                    <Label>Select a compound from results:</Label>
                    <ul className="max-h-40 overflow-y-auto border rounded-md divide-y">
                        {searchResults.map(result => (
                            <li key={result.cid}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto py-2 px-3"
                                    onClick={() => {
                                        setSearchTerm(result.cid); // Set search term to the selected CID
                                        setSearchType('cid');      // Switch search type to CID
                                        setSearchResults([]);      // Clear search results
                                        loadCompoundByCID(result.cid);
                                    }}
                                >
                                    <span className="font-medium text-primary mr-2">CID: {result.cid}</span> - {result.title}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <Alert variant={statusMessage.includes('Error') || statusMessage.includes('Failed') ? "destructive" : "default"} className="mt-2">
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compound Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{compoundName || "N/A"}</h3>
                  {molecularFormula && <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatMolecularFormula(molecularFormula) }} />}
                </div>
                 <Separator />
                <div>
                  <Label>2D Structure</Label>
                  {structureImageUrl ? (
                    <Image
                      src={structureImageUrl}
                      alt={`2D structure of ${compoundName || 'compound'}`}
                      width={300} // Provide a base width
                      height={300} // Provide a base height
                      className="mt-2 border rounded-md object-contain w-full max-w-xs mx-auto" // Use Tailwind for responsive width
                      data-ai-hint="molecule structure"
                      onError={() => {
                        setStructureImageUrl(''); // Clear on error to show placeholder
                        toast({ title: "Image Error", description: "Could not load 2D structure image.", variant: "destructive"});
                      }}
                      unoptimized // Necessary if not using a configured Next.js image optimizer domain for pubchem
                    />
                  ) : (
                    <div className="mt-2 border rounded-md aspect-square w-full max-w-xs mx-auto flex flex-col items-center justify-center bg-muted">
                      <ImageOff className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">2D Image not available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3D Visual Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="representationSelect">Representation</Label>
                  <Select value={representation} onValueChange={(value: 'ballAndStick' | 'spaceFilling' | 'wireframe') => setRepresentation(value)}>
                    <SelectTrigger id="representationSelect">
                      <SelectValue placeholder="Select representation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ballAndStick">Ball and Stick</SelectItem>
                      <SelectItem value="spaceFilling">Space Filling</SelectItem>
                      <SelectItem value="wireframe">Wireframe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="atomSizeSlider">Atom Size Factor: {atomScaleFactor.toFixed(2)}</Label>
                  <Slider
                    id="atomSizeSlider"
                    min={0.2} max={2.5} step={0.05}
                    value={[atomScaleFactor]}
                    onValueChange={([value]) => setAtomScaleFactor(value)}
                    disabled={representation === 'wireframe'}
                  />
                </div>
                <div>
                  <Label htmlFor="bondThicknessSlider">Bond Thickness: {bondRadius.toFixed(2)}</Label>
                  <Slider
                    id="bondThicknessSlider"
                    min={0.02} max={0.5} step={0.01}
                    value={[bondRadius]}
                    onValueChange={([value]) => setBondRadius(value)}
                    disabled={representation === 'spaceFilling'}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="showHydrogensCheckbox" checked={showHydrogens} onCheckedChange={(checked) => setShowHydrogens(Boolean(checked))} />
                  <Label htmlFor="showHydrogensCheckbox" className="cursor-pointer">Show Hydrogens</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>3D Structure Viewer</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow relative min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
                <div ref={threeContainerRef} className="absolute inset-0 rounded-md bg-muted/50 border overflow-hidden">
                  {isViewerLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChemicalVisualizerPage;

