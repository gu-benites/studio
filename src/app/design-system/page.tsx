// src/app/design-system/page.tsx
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import { ArrowRight, AlertTriangle, Search, ArrowUp, Sparkles, ChevronDown } from 'lucide-react';
import * as AccordionPrimitive from "@radix-ui/react-accordion"


import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RelevancyBadge } from '@/components/ui/relevancy-badge';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

// Define colors from the AromaChat design system for this page specifically
const aromaColors = {
  primary: 'hsl(var(--aroma-primary-hsl))',
  secondary: 'hsl(var(--aroma-secondary-hsl))',
  accent: 'hsl(var(--aroma-accent-hsl))',
  text: 'hsl(var(--aroma-text-hsl))',
  textMuted: 'hsl(var(--aroma-text-muted-hsl))',
  gradStart: 'hsl(var(--aroma-grad-start-hsl))',
  gradEnd: 'hsl(var(--aroma-grad-end-hsl))',
  alertBg: 'hsl(var(--alert-bg-hsl))',
  alertText: 'hsl(var(--alert-text-hsl))',
  alertBorder: 'hsl(var(--alert-border-hsl))',
  alertIcon: 'hsl(var(--alert-icon-hsl))',
};

interface MockCauseSymptom {
  id: string;
  name: string;
  suggestion: string;
  explanation: string;
}

const mockAccordionItemsData: MockCauseSymptom[] = [
  { id: 'mock_cause_1', name: 'Stress & Anxiety', suggestion: 'Common trigger for various health concerns.', explanation: 'Chronic stress can impact sleep, digestion, and overall well-being. It is important to manage stress levels through relaxation techniques.' },
  { id: 'mock_cause_2', name: 'Poor Diet', suggestion: 'Lack of essential nutrients or excessive processed foods.', explanation: 'A balanced diet is crucial for maintaining good health. Nutritional deficiencies can lead to fatigue and other issues.' },
  { id: 'mock_symptom_1', name: 'Headache', suggestion: 'Pain or discomfort in the head or neck region.', explanation: 'Headaches can range from mild to severe and may be caused by various factors including tension, dehydration, or underlying conditions.' },
  { id: 'mock_symptom_2', name: 'Insomnia', suggestion: 'Difficulty falling asleep or staying asleep.', explanation: 'Insomnia can significantly affect daily functioning and mood. Establishing good sleep hygiene is often recommended.' },
];

const mockAccordionItemsDataStyle2: MockCauseSymptom[] = [
  { id: 'style2_item_1', name: 'Nutritional Deficiencies', suggestion: 'May lead to fatigue and weakness.', explanation: 'Ensure a diet rich in vitamins and minerals. Consult a doctor for blood tests if needed.' },
  { id: 'style2_item_2', name: 'Dehydration', suggestion: 'Can cause headaches and dizziness.', explanation: 'Drink an adequate amount of water throughout the day, especially in warm weather or during exercise.' },
];

const mockAccordionItemsDataStyle3: MockCauseSymptom[] = [
  { id: 'style3_item_1', name: 'Environmental Factors', suggestion: 'Allergens or pollutants.', explanation: 'Identify potential environmental triggers and minimize exposure. Air purifiers may be helpful.' },
  { id: 'style3_item_2', name: 'Lack of Exercise', suggestion: 'Contributes to poor circulation and low energy.', explanation: 'Incorporate regular physical activity into your routine, even moderate exercise can make a difference.' },
];


const DesignSystemPage: NextPage = () => {
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inputValue = formData.get('chat-input') as string;
    console.log('Chat input submitted:', inputValue);
    event.currentTarget.reset();
  };

  // State for Accordion Style 1
  const [selectedStyle1, setSelectedStyle1] = React.useState<string[]>([]);
  const [openStyle1, setOpenStyle1] = React.useState<string[]>([mockAccordionItemsData[0].id]); // Open first by default

  // State for Accordion Style 2
  const [selectedStyle2, setSelectedStyle2] = React.useState<string[]>([]);
  const [openStyle2, setOpenStyle2] = React.useState<string[]>([]);

  // State for Accordion Style 3
  const [openStyle3, setOpenStyle3] = React.useState<string[]>([]); 

  const handleAccordionToggle = (
    itemId: string, 
    isChecked: boolean,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
    setOpenItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelectedItems(prevSelected =>
      isChecked ? [...prevSelected, itemId] : prevSelected.filter(id => id !== itemId)
    );
    if (isChecked) {
      setOpenItems(prevOpen => [...new Set([...prevOpen, itemId])]);
    } else {
       // Only close if it was open due to this item
       setOpenItems(prevOpen => prevOpen.filter(id => id !== itemId)); 
    }
  };

  const handleTriggerClick = (
    itemId: string, 
    setOpenItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setOpenItems(prevOpen =>
      prevOpen.includes(itemId) ? prevOpen.filter(id => id !== itemId) : [...prevOpen, itemId]
    );
  };


  return (
    <>
      <Head>
        <title>AromaChat Design System</title>
      </Head>
      <div
        className="container mx-auto py-10 px-4 bg-background font-poppins text-foreground"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-aroma-text">AromaChat Design System</h1>
        <p className="mb-10 text-aroma-text-muted">Showcasing styles for React components based on PRD guidelines (v2).</p>

        {/* Color Palette Section */}
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-aroma-text mb-4">Color Palette (PRD 4.1.1)</h2>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <div className="flex flex-col gap-2 items-center">
                        <div className="h-20 w-full rounded-md bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end"></div>
                        <p className="text-sm font-medium text-aroma-text">Primary Gradient</p>
                        <p className="text-xs text-aroma-text-muted">#7b61ff to #ff5fa1</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="h-20 w-full rounded-md bg-aroma-primary"></div>
                        <p className="text-sm font-medium text-aroma-text">Primary</p>
                        <p className="text-xs text-aroma-text-muted">#7a5cff (Purple)</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="h-20 w-full rounded-md bg-aroma-secondary"></div>
                        <p className="text-sm font-medium text-aroma-text">Secondary</p>
                        <p className="text-xs text-aroma-text-muted">#FF7A5C (Orange)</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="h-20 w-full rounded-md bg-aroma-accent"></div>
                        <p className="text-sm font-medium text-aroma-text">Accent</p>
                        <p className="text-xs text-aroma-text-muted">#5CFF7A (Green)</p>
                    </div>
                    <div className="flex flex-col gap-2 items-center">
                        <div className="h-20 w-full rounded-md bg-aroma-text flex items-center justify-center text-primary-foreground font-semibold">Text</div>
                        <p className="text-sm font-medium text-aroma-text">Text</p>
                        <p className="text-xs text-aroma-text-muted">#4B4763</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-aroma-text mb-4">Typography (Poppins)</h2>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Heading 1 (Poppins Bold)</h1>
                        <p className="text-sm text-aroma-text-muted">Represents: &lt;Typography variant="h1"&gt;</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">Heading 2 (Poppins SemiBold)</h2>
                        <p className="text-sm text-aroma-text-muted">Represents: &lt;Typography variant="h2"&gt;</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Heading 3 (Poppins Medium)</h3>
                        <p className="text-sm text-aroma-text-muted">Represents: &lt;Typography variant="h3"&gt;</p>
                    </div>
                    <div>
                        <p className="text-base font-normal">Body text (Poppins Regular). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <p className="text-sm text-aroma-text-muted">Represents: &lt;Typography variant="body1"&gt;</p>
                    </div>
                    <div>
                        <p className="text-sm font-normal text-aroma-text-muted">Small text / captions (Poppins Regular).</p>
                        <p className="text-xs text-aroma-text-muted">Represents: &lt;Typography variant="caption"&gt; or `variant="body2"`</p>
                    </div>
                    <div>
                        <p className="text-base font-semibold">SemiBold Body text</p>
                        <p className="text-sm text-aroma-text-muted">For emphasis. Use `fontWeight` prop on &lt;Typography&gt;.</p>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-medium mb-2">Gradient Heading Example</h3>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end text-transparent bg-clip-text">
                            Qual receita você quer criar hoje?
                        </h1>
                        <p className="text-sm text-aroma-text-muted mt-1">Represents: &lt;Typography&gt; styled with gradient background clip.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Loading & Progress Section */}
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-aroma-text mb-4">Loading & Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-xl font-medium p-6 pb-0">Loading Indicator</h3>
                    <div className="p-6 pt-6 flex justify-center items-center min-h-[150px]">
                        <div className="w-20 h-20 relative">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/80" style={{ animationDelay: '-0.1s', width: '40%', height: '40%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/70" style={{ animationDelay: '0s',   width: '47.5%', height: '47.5%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/60" style={{ animationDelay: '0.1s',  width: '55%', height: '55%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/50" style={{ animationDelay: '0.2s',  width: '62.5%', height: '62.5%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/40" style={{ animationDelay: '0.3s',  width: '70%', height: '70%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/30" style={{ animationDelay: '0.4s',  width: '77.5%', height: '77.5%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/20" style={{ animationDelay: '0.5s',  width: '85%', height: '85%' }}></div>
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulseRing bg-aroma-primary/10" style={{ animationDelay: '0.6s',  width: '92.5%', height: '92.5%' }}></div>
                        </div>
                    </div>
                    <p className="text-sm text-aroma-text-muted p-6 pt-0 text-center">Represents: Custom loading component or styled &lt;CircularProgress&gt;.</p>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-xl font-medium p-6 pb-0">Progress Steps</h3>
                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-base font-medium mb-3 text-center">Progress Bar</p>
                            <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end" style={{ width: '65%' }} role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}></div>
                            </div>
                            <div className="flex justify-between text-xs text-aroma-text-muted mt-2 px-1">
                                <span>65% Complete</span>
                                <span>Time elapsed: 01:15</span>
                            </div>
                            <p className="text-sm text-aroma-text-muted mt-2 text-center">Represents: &lt;LinearProgress&gt; styled with gradient.</p>
                        </div>
                        <div>
                            <p className="text-base font-medium mb-3 text-center">Step List Example</p>
                             <ul className="space-y-2 text-center">
                                <li className="transition-all duration-400 ease-in-out text-sm font-normal opacity-70 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through text-aroma-text-muted"><span className="font-bold mr-1">✓ </span>Enter Health Concern</li>
                                <li className="transition-all duration-400 ease-in-out text-sm font-normal opacity-70 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through text-aroma-text-muted"><span className="font-bold mr-1">✓ </span>Provide Demographics</li>
                                <li className="transition-all duration-400 ease-in-out text-lg font-bold opacity-100 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center relative text-aroma-text after:inline-block after:ml-1 after:w-[1.5em] after:text-left after:align-bottom after:content-[''] after:animate-ellipsis">Select Causes</li>
                                <li className="transition-all duration-400 ease-in-out text-muted-foreground text-sm font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center">Select Symptoms</li>
                                <li className="transition-all duration-400 ease-in-out text-muted-foreground text-sm font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center">Review Properties</li>
                            </ul>
                            <p className="text-sm text-aroma-text-muted mt-2 text-center">Represents: &lt;Stepper&gt; or custom list component.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-aroma-text mb-4">Buttons</h2>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 space-y-8">
                  <div>
                      <h3 className="text-lg font-medium mb-3">Main Action Button</h3>
                      <div className="flex flex-wrap gap-4">
                           <Button className="font-semibold py-3.5 px-8 rounded-3xl shadow-button-normal hover:-translate-y-0.5 hover:shadow-button-focus focus:ring-offset-2 focus:ring-aroma-primary transition-all duration-200 bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end text-primary-foreground h-auto text-base">
                                Criar Receita
                                <ArrowRight strokeWidth={2.5} className="ml-2 h-4 w-4" />
                            </Button>
                      </div>
                      <p className="text-sm text-aroma-text-muted mt-2">Represents: &lt;Button variant="default"&gt; heavily styled.</p>
                  </div>

                  <div>
                      <h3 className="text-lg font-medium mb-3">Standard Variants</h3>
                      <div className="flex flex-wrap gap-4 items-center">
                          <Button variant="default">Primary Contained</Button>
                          <Button variant="outline">Primary Outlined</Button>
                          <Button variant="ghost">Primary Text</Button>
                      </div>
                      <p className="text-sm text-aroma-text-muted mt-2">Represents: Standard &lt;Button&gt; variants using `color="primary"`.</p>
                      <div className="flex flex-wrap gap-4 items-center mt-4">
                          <Button variant="secondary" className="bg-aroma-secondary text-secondary-foreground hover:bg-aroma-secondary/90 focus:ring-aroma-secondary">Secondary Contained</Button>
                          <Button variant="outline" className="border-aroma-secondary text-aroma-secondary hover:bg-aroma-secondary/10 focus:ring-aroma-secondary">Secondary Outlined</Button>
                      </div>
                      <p className="text-sm text-aroma-text-muted mt-2">Represents: Standard &lt;Button&gt; variants using `color="secondary"`.</p>
                  </div>

                  <div>
                      <h3 className="text-lg font-medium mb-3">Suggestion Chips / Small Actions</h3>
                      <div className="flex flex-wrap gap-3">
                          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer transition-colors shadow-sm bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">Relaxar</Badge>
                          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer transition-colors shadow-sm bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">Dormir melhor</Badge>
                          <Badge variant="outline" className="px-4 py-2 text-sm rounded-full cursor-pointer transition-colors shadow-sm bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">Alívio da tensão</Badge>
                      </div>
                      <p className="text-sm text-aroma-text-muted mt-2">Represents: &lt;Badge variant="outline"&gt; components styled as chips.</p>
                  </div>
              </div>
          </div>
        </section>

        {/* Input Fields Section */}
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-aroma-text mb-4">Input Fields</h2>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <Label htmlFor="health-concern-example" className="block text-sm font-medium text-aroma-text mb-2">Health Concern Input (Old Style)</Label>
                            <div className="group relative rounded-3xl border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start/50 to-aroma-grad-end/50 transition-all duration-200 ease-in-out focus-within:from-aroma-grad-start focus-within:to-aroma-grad-end hover:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)_/_0.5),_0_0_0_1px_hsl(var(--aroma-grad-end)_/_0.5)] focus-within:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)),_0_0_0_1px_hsl(var(--aroma-grad-end))]">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <Input 
                                        type="text" 
                                        id="health-concern-example" 
                                        placeholder="Ex: dor de cabeça, insônia, ansiedade..." 
                                        className="block w-full rounded-[calc(theme(borderRadius.3xl)-1px)] border-none bg-card py-3.5 pl-12 pr-4 text-base leading-6 shadow-none outline-none placeholder:text-muted-foreground text-foreground h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-aroma-text-muted mt-2">Represents: &lt;Input&gt; styled with large border-radius, icon, and custom gradient focus/hover effect.</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="chat-input" className="block text-sm font-medium text-aroma-text mb-2">Chat Input (New Style)</Label>
                            <form onSubmit={handleFormSubmit} 
                                className="group relative rounded-md border border-input p-[1px] 
                                           hover:border-transparent focus-within:border-transparent 
                                           hover:bg-gradient-to-r focus-within:bg-gradient-to-r 
                                           from-aroma-grad-start/20 to-aroma-grad-end/20 
                                           transition-all duration-200 ease-in-out 
                                           focus-within:from-aroma-grad-start/50 focus-within:to-aroma-grad-end/50 
                                           hover:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)_/_0.1)] 
                                           focus-within:shadow-[0_0_0_1px_hsl(var(--aroma-grad-start)_/_0.3)]"
                            >
                                <div className="flex items-center w-full bg-card rounded-[calc(theme(borderRadius.md)-1.5px)] p-1 pr-1.5 shadow-sm">
                                    <Search className="h-5 w-5 text-muted-foreground mx-3 pointer-events-none" />
                                    <Separator orientation="vertical" className="h-6 mr-2 bg-border" />
                                    <Input
                                        name="chat-input"
                                        type="text"
                                        placeholder="Digite sua mensagem ou ideia..."
                                        className="flex-grow py-2.5 px-2 bg-transparent border-none outline-none text-card-foreground placeholder:text-muted-foreground text-sm h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Button 
                                        type="submit"
                                        size="icon"
                                        className="h-9 w-9 bg-aroma-secondary text-primary-foreground rounded-md hover:bg-aroma-secondary/90 focus:ring-aroma-secondary focus:ring-offset-card"
                                        aria-label="Enviar mensagem"
                                    >
                                        <ArrowUp className="w-5 h-5" />
                                    </Button>
                                </div>
                            </form>
                            <p className="text-sm text-aroma-text-muted mt-2">Represents: Input with integrated send button, icon and gradient focus/hover border.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Accordion Selection</h2>
          
          {/* Accordion Style 1: Joined, Standard Switch, No Chevron */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3 text-aroma-text">Style 1: Joined Items, Switch, No Chevron</h3>
            <Accordion
              type="multiple"
              value={openStyle1}
              onValueChange={setOpenStyle1}
              className="w-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
            >
              {mockAccordionItemsData.map((item, index) => {
                const isChecked = selectedStyle1.includes(item.id);
                return (
                  <AccordionItem
                    value={item.id}
                    key={item.id}
                    className={cn(
                      "transition-colors",
                      index !== 0 && "border-t", 
                      isChecked ? "bg-primary/10" : "bg-card"
                    )}
                  >
                    {/* Custom header layout */}
                    <AccordionPrimitive.Header className="flex">
                      <div className={cn(
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                        isChecked ? "hover:bg-primary/15" : "hover:bg-muted/50"
                      )}>
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Switch
                            id={`style1-switch-${item.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleAccordionToggle(item.id, checked, selectedStyle1, setSelectedStyle1, setOpenStyle1)}
                            className="shrink-0 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                            aria-labelledby={`style1-label-${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <AccordionTrigger
                            onClick={() => handleTriggerClick(item.id, setOpenStyle1)}
                            className={cn(
                              "p-0 flex-1 text-left hover:no-underline",
                              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
                            )}
                            showChevron={false}
                          >
                            <Label
                              htmlFor={`style1-switch-${item.id}`}
                              id={`style1-label-${item.id}`}
                              className="font-medium text-base cursor-pointer flex-1 truncate"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent AccordionTrigger's onClick
                                handleAccordionToggle(item.id, !isChecked, selectedStyle1, setSelectedStyle1, setOpenStyle1);
                              }}
                            >
                              {item.name}
                            </Label>
                          </AccordionTrigger>
                        </div>
                      </div>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-card/50">
                      <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                      <p className="text-xs text-muted-foreground/80">{item.explanation}</p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            <p className="text-sm mt-2 text-aroma-text-muted">Joined items with shared borders. Switch for selection. No chevron.</p>
          </div>

          {/* Accordion Style 2: Separated, Standard Switch, No Chevron */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3 text-aroma-text">Style 2: Separated Items, Switch, No Chevron</h3>
            <Accordion
              type="multiple"
              value={openStyle2}
              onValueChange={setOpenStyle2}
              className="w-full space-y-2"
            >
              {mockAccordionItemsDataStyle2.map((item) => {
                const isChecked = selectedStyle2.includes(item.id);
                return (
                  <AccordionItem
                    value={item.id}
                    key={item.id}
                    className={cn(
                      "transition-colors border rounded-lg overflow-hidden shadow-sm",
                      isChecked ? "bg-primary/10" : "bg-card"
                    )}
                  >
                     <AccordionPrimitive.Header className="flex">
                       <div className={cn(
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                        isChecked ? "hover:bg-primary/15" : "hover:bg-muted/50"
                      )}>
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Switch
                            id={`style2-switch-${item.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleAccordionToggle(item.id, checked, selectedStyle2, setSelectedStyle2, setOpenStyle2)}
                            className="shrink-0 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                            aria-labelledby={`style2-label-${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                           <AccordionTrigger
                            onClick={() => handleTriggerClick(item.id, setOpenStyle2)}
                            className={cn(
                              "p-0 flex-1 text-left hover:no-underline",
                              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
                            )}
                            showChevron={false}
                          >
                            <Label
                              htmlFor={`style2-switch-${item.id}`}
                              id={`style2-label-${item.id}`}
                              className="font-medium text-base cursor-pointer flex-1 truncate"
                               onClick={(e) => {
                                e.stopPropagation();
                                handleAccordionToggle(item.id, !isChecked, selectedStyle2, setSelectedStyle2, setOpenStyle2);
                              }}
                            >
                              {item.name}
                            </Label>
                          </AccordionTrigger>
                        </div>
                      </div>
                    </AccordionPrimitive.Header>
                    <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-card/50">
                      <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                      <p className="text-xs text-muted-foreground/80">{item.explanation}</p>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            <p className="text-sm mt-2 text-aroma-text-muted">Separated, individually bordered items. Switch for selection. No chevron.</p>
          </div>

          {/* Accordion Style 3: Separated, No Switch, With Chevron */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-3 text-aroma-text">Style 3: Separated Items, No Switch, With Chevron</h3>
            <Accordion
              type="multiple"
              value={openStyle3}
              onValueChange={setOpenStyle3}
              className="w-full space-y-2"
            >
              {mockAccordionItemsDataStyle3.map((item) => (
                <AccordionItem
                  value={item.id}
                  key={item.id}
                  className={cn(
                    "transition-colors border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm",
                    openStyle3.includes(item.id) ? "bg-muted/30" : "bg-card"
                  )}
                >
                  <AccordionTrigger
                    onClick={() => handleTriggerClick(item.id, setOpenStyle3)}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-3 text-left hover:no-underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors group",
                      openStyle3.includes(item.id) ? "hover:bg-muted/50" : "hover:bg-muted/50",
                      "focus-visible:ring-offset-card"
                    )}
                    showChevron={true} 
                  >
                    {/* Label now acts as the direct child content for AccordionTrigger */}
                    <Label className="font-medium text-base cursor-pointer flex-1 truncate">
                      {item.name}
                    </Label>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 space-y-1 bg-card/50">
                    <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                    <p className="text-xs text-muted-foreground/80">{item.explanation}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-sm mt-2 text-aroma-text-muted">Separated, individually bordered items. No switch. Chevron for expand/collapse.</p>
          </div>
        </section>

        {/* Alerts & Badges Section */}
         <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Alerts & Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-medium p-6 pb-0">Alert Example</h3>
              <div className="p-6">
                <div
                  className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 bg-alert-bg/80 border-alert-border text-alert-text"
                >
                  <AlertTriangle className="h-4 w-4 text-alert-icon" />
                  <div className="text-sm [&_p]:leading-relaxed">
                    Estamos com alta demanda. Pode haver pequenos atrasos nas sugestões. Obrigada!
                  </div>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: &lt;Alert severity="warning"&gt;.</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-medium p-6 pb-0">Relevancy Badges</h3>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <RelevancyBadge score={5} />
                  <RelevancyBadge score={4} />
                  <RelevancyBadge score={3} />
                  <RelevancyBadge score={2} />
                  <RelevancyBadge score={1} />
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: New &lt;RelevancyBadge score={'{1-5}'} /&gt; component.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Components Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-aroma-text mb-4">Layout Components (Conceptual)</h2>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <p>Layout structure will follow `01_saas_template.md` using components:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>**Sidebar:** Custom Drawer component with Shadcn UI elements.</li>
                <li>**User Menu:** Integrated within Sidebar, using Shadcn UI buttons/layout.</li>
                <li>**Settings Page:** Main content area with Shadcn UI &lt;Tabs&gt;.</li>
                <li>**Modals:** Shadcn UI &lt;AlertDialog&gt; / &lt;Dialog&gt; for confirmations and full-screen content.</li>
                <li>**Cards:** Shadcn UI &lt;Card&gt; (as used in this design system).</li>
              </ul>
              <p className="text-sm text-aroma-text-muted">Refer to `01_saas_template.md` for layout details and Shadcn UI documentation for component implementation.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DesignSystemPage;
