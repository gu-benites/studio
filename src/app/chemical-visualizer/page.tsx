"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, ImageOff, RefreshCw } from 'lucide-react';
import Image from 'next/image';

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
import { ThreeDViewer } from '@/components/chemical-visualizer/ThreeDViewer'; 
import type { MoleculeData } from '@/components/chemical-visualizer/ThreeDViewer';

const ChemicalVisualizerPage: NextPage = () => {
  const { toast } = useToast();
  
  const [searchType, setSearchType] = useState<'cid' | 'name'>('cid');
  const [searchTerm, setSearchTerm] = useState<string>('22311'); 
  const [searchResults, setSearchResults] = useState<{ cid: string; title: string }[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Default: Limonene (22311). Visualize to load.');
  const [isLoading, setIsLoading] = useState<boolean>(false); // For API calls
  const [isViewerBusy, setIsViewerBusy] = useState<boolean>(false); // For 3D rendering operations feedback

  const [compoundName, setCompoundName] = useState<string>('');
  const [molecularFormula, setMolecularFormula] = useState<string>('');
  const [structureImageUrl, setStructureImageUrl] = useState<string | null>(null);
  const [parsedMoleculeData, setParsedMoleculeData] = useState<MoleculeData | null>(null);

  const [representation, setRepresentation] = useState<'ballAndStick' | 'spaceFilling' | 'wireframe'>('ballAndStick');
  const [atomScaleFactor, setAtomScaleFactor] = useState<number>(1.0);
  const [bondRadius, setBondRadius] = useState<number>(0.1);
  const [showHydrogens, setShowHydrogens] = useState<boolean>(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Load default compound on mount after client-side hydration
    loadCompoundByCID('22311');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const formatMolecularFormula = (formula: string) => {
    return formula.replace(/([A-Za-z])([0-9]+)/g, '$1<sub>$2</sub>');
  };

  const parseSDF = useCallback((sdfData: string): MoleculeData => {
    const lines = sdfData.split('\n');
    const atoms = [];
    const bonds = [];
    if (lines.length < 4) {
      console.error("SDF data too short.");
      return { atoms, bonds };
    }
    const countsLine = lines[3].trim();
    const parts = countsLine.match(/^\s*(\d+)\s+(\d+)/);
    if (!parts || parts.length < 3) {
        console.error("Could not parse numAtoms/numBonds from SDF:", countsLine, "Raw parts:", lines[3]);
        return { atoms, bonds };
    }
    const numAtoms = parseInt(parts[1], 10);
    const numBonds = parseInt(parts[2], 10);

    if (isNaN(numAtoms) || isNaN(numBonds)) {
      console.error("Invalid atom/bond count from SDF parts:", parts);
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
      
      if (element.length > 1 && element !== 'CL' && element !== 'BR') {
          element = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
      } else {
          element = element.toUpperCase(); 
      }

      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && element) {
        atoms.push({ element, x, y, z, id: i });
      } else {
        console.warn(`Skipping malformed atom line ${lineIndex + 1}: '${line}'`);
      }
    }

    const bondStartIndex = 4 + numAtoms;
    for (let i = 0; i < numBonds; i++) {
      const lineIndex = bondStartIndex + i;
      if (lineIndex >= lines.length) break;
      const line = lines[lineIndex];
      const atom1Idx = parseInt(line.substring(0, 3), 10) - 1; 
      const atom2Idx = parseInt(line.substring(3, 6), 10) - 1; 
      const type = parseInt(line.substring(6, 9), 10); // bondType
      if (!isNaN(atom1Idx) && !isNaN(atom2Idx) && !isNaN(type) && atom1Idx < atoms.length && atom2Idx < atoms.length) {
        bonds.push({ atom1Idx, atom2Idx, type }); 
      } else {
         console.warn(`Skipping malformed/invalid bond line ${lineIndex + 1}: '${line}'`);
      }
    }
    return { atoms, bonds };
  }, []);
  
  const loadCompoundByCID = useCallback(async (cid: string) => {
    setIsLoading(true);
    setIsViewerBusy(true);
    setStatusMessage(`Fetching data for CID: ${cid}...`);
    setCompoundName('');
    setMolecularFormula('');
    setStructureImageUrl(null);
    setParsedMoleculeData(null);

    try {
      const namePromise = fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/Title/JSON`);
      const formulaPromise = fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula/JSON`);
      const imageSrc = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`;
      setStructureImageUrl(imageSrc);

      const [nameResponse, formulaResponse] = await Promise.all([namePromise, formulaPromise]);

      let fetchedCompoundName = `Compound (CID: ${cid})`;
      if (nameResponse.ok) {
        const nameData = await nameResponse.json();
        fetchedCompoundName = nameData.PropertyTable?.Properties?.[0]?.Title || fetchedCompoundName;
      }
      setCompoundName(fetchedCompoundName);

      if (formulaResponse.ok) {
        const formulaData = await formulaResponse.json();
        setMolecularFormula(formulaData.PropertyTable?.Properties?.[0]?.MolecularFormula || 'N/A');
      } else {
        setMolecularFormula('Error loading formula.');
      }
      
      const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
      const sdfResponse = await fetch(sdfUrl);

      if (!sdfResponse.ok) {
        const errorText = await sdfResponse.text();
        let userMessage = `Failed to fetch 3D SDF (CID ${cid}). Status: ${sdfResponse.status}`;
        if (sdfResponse.status === 404 || errorText.includes("PUGREST.NotFound")) {
            userMessage = `CID ${cid}: 3D structure data not found. 2D info may be available.`;
        }
        throw new Error(userMessage);
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
      setParsedMoleculeData(null); 
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsViewerBusy(false);
    }
  }, [toast, parseSDF]); 

  const loadCompoundByName = useCallback(async (name: string) => {
    setIsLoading(true);
    setIsViewerBusy(true);
    setStatusMessage(`Searching for compound: "${name}"...`);
    setCompoundName('');
    setMolecularFormula('Searching...');
    setStructureImageUrl(null);
    setParsedMoleculeData(null);
    setSearchResults([]); 

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
            
            setSearchResults(results.slice(0, 10)); 
            setStatusMessage(`Please select from ${results.length > 10 ? 'the first 10 of ' : ''}${results.length} matches.`);
            toast({ title: "Multiple Matches", description: `Found ${results.length} matches. Select one from the list.` });
        }
    } catch (error: any) {
        console.error('Error searching by name:', error);
        setStatusMessage(`Name Search Error: ${error.message}`);
        toast({ title: "Search Error", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsViewerBusy(false); 
    }
  }, [loadCompoundByCID, toast]);

  const handleVisualizeClick = () => {
    if (!searchTerm.trim()) {
      setStatusMessage('Please enter a search term.');
      toast({ title: "Input Required", description: "Please enter a search term.", variant: "destructive" });
      return;
    }
    setSearchResults([]); 
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
  
  const resetAll = () => {
    setSearchType('cid');
    setSearchTerm('22311');
    setSearchResults([]);
    setStatusMessage('Default: Limonene (22311). Visualize to load.');
    setCompoundName('');
    setMolecularFormula('');
    setStructureImageUrl(null);
    setParsedMoleculeData(null);
    setRepresentation('ballAndStick');
    setAtomScaleFactor(1.0);
    setBondRadius(0.1);
    setShowHydrogens(true);
    setIsLoading(false);
    setIsViewerBusy(false);
    loadCompoundByCID('22311');
    toast({ title: "Visualizer Reset", description: "All fields and views have been reset." });
  };

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
                  setSearchTerm(value === 'cid' ? '22311' : 'aspirin'); 
                  setSearchResults([]); 
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
                                        setSearchTerm(result.cid); 
                                        setSearchType('cid');      
                                        setSearchResults([]);      
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
                  <h3 className="text-lg font-semibold text-primary">{compoundName || (isLoading ? "Loading..." : "N/A")}</h3>
                  {molecularFormula ? <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatMolecularFormula(molecularFormula) }} /> : (isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : null)}
                </div>
                 <Separator />
                <div>
                  <Label>2D Structure</Label>
                  {structureImageUrl ? (
                    <Image
                      src={structureImageUrl}
                      alt={`2D structure of ${compoundName || 'compound'}`}
                      width={300} 
                      height={300} 
                      className="mt-2 border rounded-md object-contain w-full max-w-xs mx-auto" 
                      data-ai-hint="molecule structure"
                      onError={() => {
                        setStructureImageUrl(null); 
                        toast({ title: "Image Error", description: "Could not load 2D structure image.", variant: "destructive"});
                      }}
                      unoptimized 
                    />
                  ) : (
                    <div className="mt-2 border rounded-md aspect-square w-full max-w-xs mx-auto flex flex-col items-center justify-center bg-muted">
                      {isLoading ? <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" /> : <ImageOff className="h-12 w-12 text-muted-foreground" />}
                      <p className="text-sm text-muted-foreground mt-2">{isLoading ? "Loading 2D image..." : "2D Image not available"}</p>
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
                 <ThreeDViewer
                    moleculeData={parsedMoleculeData}
                    representation={representation}
                    atomScaleFactor={atomScaleFactor}
                    bondRadius={bondRadius}
                    showHydrogens={showHydrogens}
                    isLoading={isViewerBusy || isLoading} // Pass combined loading state
                 />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChemicalVisualizerPage;