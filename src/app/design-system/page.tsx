// src/app/design-system/page.tsx
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react'; 
import { ArrowRight, AlertTriangle, ArrowUp, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 

// Define colors from the AromaChat design system for this page specifically
// These would ideally come from a theme context or CSS variables if used app-wide
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


const DesignSystemPage: NextPage = () => {
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const inputValue = formData.get('chat-input') as string;
    console.log('Form submitted with input:', inputValue);
    // In a real app, you would handle the input here
    event.currentTarget.reset(); // Optional: clear input after submit
  };

  const handleOldInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Old input changed:', event.target.value);
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

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Color Palette (PRD 4.1.1)</h2>
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
                <div className="h-20 w-full rounded-md flex items-center justify-center text-white font-semibold bg-aroma-text">Text</div>
                <p className="text-sm font-medium text-aroma-text">Text</p>
                <p className="text-xs text-aroma-text-muted">#4B4763</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Typography (Poppins)</h2>
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
                <h1 
                  className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end"
                >
                  Qual receita você quer criar hoje?
                </h1>
                <p className="text-sm mt-1 text-aroma-text-muted">Represents: &lt;Typography&gt; styled with gradient background clip.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Loading & Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-medium p-6 pb-0">Loading Indicator</h3>
              <div className="p-6 pt-6 flex justify-center items-center min-h-[150px]">
                <div className="w-20 h-20 relative">
                  {/* Simplified pulse circles for direct Tailwind application */}
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/80" style={{ animationDelay: '-0.1s', width: '40%', height: '40%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/70" style={{ animationDelay: '0s',   width: '47.5%', height: '47.5%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/60" style={{ animationDelay: '0.1s',  width: '55%', height: '55%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/50" style={{ animationDelay: '0.2s',  width: '62.5%', height: '62.5%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/40" style={{ animationDelay: '0.3s',  width: '70%', height: '70%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/30" style={{ animationDelay: '0.4s',  width: '77.5%', height: '77.5%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/20" style={{ animationDelay: '0.5s',  width: '85%', height: '85%' }}></div>
                  <div className="absolute left-1/2 top-1/2 rounded-full animate-pulseRing bg-aroma-primary/10" style={{ animationDelay: '0.6s',  width: '92.5%', height: '92.5%' }}></div>
                </div>
              </div>
              <p className="text-sm p-6 pt-0 text-center text-aroma-text-muted">Represents: Custom loading component or styled &lt;CircularProgress&gt;.</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-medium p-6 pb-0">Progress Steps</h3>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-base font-medium mb-3 text-center">Progress Bar</p>
                  <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end" style={{ width: '65%' }} role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2 px-1 text-aroma-text-muted">
                    <span>65% Complete</span>
                    <span>Time elapsed: 01:15</span>
                  </div>
                  <p className="text-sm mt-2 text-center text-aroma-text-muted">Represents: &lt;LinearProgress&gt; styled with gradient.</p>
                </div>
                <div>
                  <p className="text-base font-medium mb-3 text-center">Step List Example</p>
                  <ul className="space-y-2 text-center">
                    <li className="transition-all duration-400 ease-in-out text-sm font-normal opacity-70 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through text-aroma-text-muted"><span className="font-bold mr-1">✓</span>Enter Health Concern</li>
                    <li className="transition-all duration-400 ease-in-out text-sm font-normal opacity-70 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through text-aroma-text-muted"><span className="font-bold mr-1">✓</span>Provide Demographics</li>
                    <li 
                      className="transition-all duration-400 ease-in-out text-lg font-bold opacity-100 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center relative text-aroma-text after:inline-block after:ml-1 after:w-[1.5em] after:text-left after:align-bottom after:content-[''] after:animate-ellipsis" 
                    >
                      Select Causes
                    </li>
                    <li className="transition-all duration-400 ease-in-out text-muted-foreground text-sm font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center">Select Symptoms</li>
                    <li className="transition-all duration-400 ease-in-out text-muted-foreground text-sm font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center">Review Properties</li>
                  </ul>
                  <p className="text-sm mt-2 text-center text-aroma-text-muted">Represents: &lt;Stepper&gt; or custom list component.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Buttons</h2>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Main Action Button</h3>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="font-semibold py-3.5 px-8 rounded-3xl shadow-button-normal hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end text-primary-foreground focus:ring-aroma-primary hover:shadow-button-focus"
                  >
                    Criar Receita
                    <ArrowRight strokeWidth={2.5} className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: &lt;Button variant="contained"&gt; heavily styled.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Standard Variants</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button className="bg-aroma-primary text-primary-foreground hover:bg-aroma-primary/90 focus:ring-aroma-primary">Primary Contained</Button>
                  <Button variant="outline" className="border-aroma-primary text-aroma-primary hover:bg-aroma-primary/10 focus:ring-aroma-primary hover:text-aroma-primary">Primary Outlined</Button>
                  <Button variant="ghost" className="text-aroma-primary hover:bg-aroma-primary/10 focus:ring-aroma-primary hover:text-aroma-primary">Primary Text</Button>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: Standard &lt;Button&gt; variants.</p>
                <div className="flex flex-wrap gap-4 items-center mt-4">
                  <Button className="bg-aroma-secondary text-primary-foreground hover:bg-aroma-secondary/90 focus:ring-aroma-secondary">Secondary Contained</Button>
                  <Button variant="outline" className="border-aroma-secondary text-aroma-secondary hover:bg-aroma-secondary/10 focus:ring-aroma-secondary hover:text-aroma-secondary">Secondary Outlined</Button>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: Standard &lt;Button&gt; variants with secondary color.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Suggestion Chips / Small Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-full border-purple-200 text-aroma-primary bg-purple-50 hover:bg-purple-100 hover:text-aroma-primary">Relaxar</Button>
                  <Button variant="outline" className="rounded-full border-purple-200 text-aroma-primary bg-purple-50 hover:bg-purple-100 hover:text-aroma-primary">Dormir melhor</Button>
                  <Button variant="outline" className="rounded-full border-purple-200 text-aroma-primary bg-purple-50 hover:bg-purple-100 hover:text-aroma-primary">Alívio da tensão</Button>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: &lt;Chip&gt; components.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Input Fields</h2>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-8">
                <div>
                  <Label htmlFor="health-concern-example-old" className="block text-sm font-medium text-aroma-text mb-2">Health Concern Input (Old Style)</Label>
                  <div className="group relative rounded-3xl border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end transition-all duration-200 ease-in-out">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                        <Search className="w-5 h-5" />
                      </div>
                      <Input 
                        type="text" 
                        id="health-concern-example-old" 
                        placeholder="Ex: dor de cabeça, insônia, ansiedade..." 
                        className="block w-full rounded-[calc(1.75rem-1px)] border-none bg-card py-3.5 pl-12 pr-4 text-base leading-6 shadow-none outline-none placeholder:text-muted-foreground text-card-foreground"
                        onChange={handleOldInputChange}
                      />
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-aroma-text-muted">Represents: &lt;TextField variant="outlined"&gt; styled with gradient border effect.</p>
                </div>
                
                <div>
                  <Label htmlFor="chat-input-example" className="block text-sm font-medium text-aroma-text mb-2">Chat Input (New Style)</Label>
                  <form onSubmit={handleFormSubmit} className="space-y-2">
                    <div className="group relative rounded-md border border-input p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-aroma-grad-start to-aroma-grad-end transition-all duration-200 ease-in-out">
                       <div className="flex items-center w-full bg-card rounded-[calc(theme(borderRadius.md)-1px)] p-1 pr-1.5 shadow-sm">
                        <Search className="h-5 w-5 text-muted-foreground mx-3 pointer-events-none" />
                        <Separator orientation="vertical" className="h-6 mr-2 bg-border" />
                        <Input
                          type="text"
                          id="chat-input-example"
                          name="chat-input"
                          placeholder="Descreva sua ideia de receita..."
                          className="flex-grow py-2.5 px-2 bg-transparent border-none outline-none text-card-foreground placeholder:text-muted-foreground text-sm h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button 
                          type="submit"
                          size="icon"
                          className="h-9 w-9 bg-aroma-secondary text-primary-foreground rounded-md hover:bg-aroma-secondary/90 focus:ring-aroma-secondary focus:ring-offset-card"
                          aria-label="Criar Receita"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </form>
                  <p className="text-sm mt-2 text-aroma-text-muted">Represents: New chat-style input with action button. Gradient border on focus/hover.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-primary-foreground bg-aroma-primary/80">Relevância: 5/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-aroma-text bg-aroma-accent/80">Relevância: 4/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-primary-foreground bg-yellow-500">Relevância: 3/5</span> 
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-primary-foreground bg-aroma-secondary/80">Relevância: 2/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-primary-foreground bg-red-500">Relevância: 1/5</span>
                </div>
                <p className="text-sm mt-2 text-aroma-text-muted">Represents: &lt;Chip size="small"&gt;.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-aroma-text">Layout Components (Conceptual)</h2>
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

