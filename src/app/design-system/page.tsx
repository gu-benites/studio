// src/app/design-system/page.tsx
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react'; // Keep React import
import { Search, ArrowRight, AlertTriangle } from 'lucide-react';

// Define colors from the AromaChat design system for this page specifically
const aromaColors = {
  primary: '#7a5cff',
  secondary: '#FF7A5C',
  accent: '#5CFF7A',
  text: '#4B4763',
  textMuted: '#6f6b89',
  gradStart: '#7b61ff',
  gradEnd: '#ff5fa1',
  alertBg: 'rgba(255, 244, 229, 0.8)',
  alertText: '#d97706',
  alertBorder: 'rgba(245, 158, 11, 0.5)',
  alertIcon: '#d97706',
};

const DesignSystemPage: NextPage = () => {
  // State for input field focus to manually apply gradient border styles if needed,
  // but aiming for CSS-only solution with group-focus-within.
  // const [isInputFocused, setIsInputFocused] = React.useState(false);

  return (
    <>
      <Head>
        <title>AromaChat Design System</title>
      </Head>
      <div 
        className="container mx-auto py-10 px-4 bg-gray-100 font-poppins" 
        style={{ color: aromaColors.text }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: aromaColors.text }}>AromaChat Design System</h1>
        <p className="mb-10" style={{ color: aromaColors.textMuted }}>Showcasing styles for Material UI React components based on PRD guidelines (v2).</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Color Palette (PRD 4.1.1)</h2>
          <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
            <div className="card-content p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="flex flex-col gap-2 items-center">
                <div className="h-20 w-full rounded-md" style={{ background: `linear-gradient(to right, ${aromaColors.gradStart}, ${aromaColors.gradEnd})` }}></div>
                <p className="text-sm font-medium" style={{ color: aromaColors.text }}>Primary Gradient</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>{aromaColors.gradStart} to {aromaColors.gradEnd}</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-20 w-full rounded-md" style={{ backgroundColor: aromaColors.primary }}></div>
                <p className="text-sm font-medium" style={{ color: aromaColors.text }}>Primary</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>{aromaColors.primary} (Purple)</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-20 w-full rounded-md" style={{ backgroundColor: aromaColors.secondary }}></div>
                <p className="text-sm font-medium" style={{ color: aromaColors.text }}>Secondary</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>{aromaColors.secondary} (Orange)</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-20 w-full rounded-md" style={{ backgroundColor: aromaColors.accent }}></div>
                <p className="text-sm font-medium" style={{ color: aromaColors.text }}>Accent</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>{aromaColors.accent} (Green)</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <div className="h-20 w-full rounded-md flex items-center justify-center text-white font-semibold" style={{ backgroundColor: aromaColors.text }}>Text</div>
                <p className="text-sm font-medium" style={{ color: aromaColors.text }}>Text</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>{aromaColors.text}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Typography (Poppins)</h2>
          <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
            <div className="card-content p-6 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Heading 1 (Poppins Bold)</h1>
                <p className="text-sm" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography variant="h1"&gt;</p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Heading 2 (Poppins SemiBold)</h2>
                <p className="text-sm" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography variant="h2"&gt;</p>
              </div>
              <div>
                <h3 className="text-xl font-medium">Heading 3 (Poppins Medium)</h3>
                <p className="text-sm" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography variant="h3"&gt;</p>
              </div>
              <div>
                <p className="text-base font-normal">Body text (Poppins Regular). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p className="text-sm" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography variant="body1"&gt;</p>
              </div>
              <div>
                <p className="text-sm font-normal" style={{ color: aromaColors.textMuted }}>Small text / captions (Poppins Regular).</p>
                <p className="text-xs" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography variant="caption"&gt; or `variant="body2"`</p>
              </div>
              <div>
                <p className="text-base font-semibold">SemiBold Body text</p>
                <p className="text-sm" style={{ color: aromaColors.textMuted }}>For emphasis. Use `fontWeight` prop on &lt;Typography&gt;.</p>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-medium mb-2">Gradient Heading Example</h3>
                <h1 
                  className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${aromaColors.gradStart}, ${aromaColors.gradEnd})`,
                  }}
                >
                  Qual receita você quer criar hoje?
                </h1>
                <p className="text-sm mt-1" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Typography&gt; styled with gradient background clip.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Loading & Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
              <h3 className="text-xl font-medium p-6 pb-0">Loading Indicator</h3>
              <div className="card-content pt-6 flex justify-center items-center min-h-[150px]">
                <div className="w-20 h-20 relative">
                  <div className="pulse-container">
                    {/* Tailwind animation 'animate-pulseRing' should be defined in tailwind.config.js */}
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.85)`, animationDelay: '-0.1s', width: '40%', height: '40%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.75)`, animationDelay: '0s',   width: '47.5%', height: '47.5%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.65)`, animationDelay: '0.1s',  width: '55%', height: '55%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.55)`, animationDelay: '0.2s',  width: '62.5%', height: '62.5%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.45)`, animationDelay: '0.3s',  width: '70%', height: '70%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.35)`, animationDelay: '0.4s',  width: '77.5%', height: '77.5%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.25)`, animationDelay: '0.5s',  width: '85%', height: '85%' }}></div>
                    <div className="pulse-circle animate-pulseRing absolute left-1/2 top-1/2 rounded-full" style={{ backgroundColor: `rgba(122, 92, 255, 0.15)`, animationDelay: '0.6s',  width: '92.5%', height: '92.5%' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-sm p-6 pt-0 text-center" style={{ color: aromaColors.textMuted }}>Represents: Custom loading component or styled MUI &lt;CircularProgress&gt;.</p>
            </div>
            <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
              <h3 className="text-xl font-medium p-6 pb-0">Progress Steps</h3>
              <div className="card-content p-6 space-y-6">
                <div>
                  <p className="text-base font-medium mb-3 text-center">Progress Bar</p>
                  <div className="bg-gray-200 rounded-full h-2.5 w-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '65%', background: `linear-gradient(to right, ${aromaColors.gradStart}, ${aromaColors.gradEnd})` }} role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2 px-1" style={{ color: aromaColors.textMuted }}>
                    <span>65% Complete</span>
                    <span>Time elapsed: 01:15</span>
                  </div>
                  <p className="text-sm mt-2 text-center" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;LinearProgress&gt; styled with gradient.</p>
                </div>
                <div>
                  <p className="text-base font-medium mb-3 text-center">Step List Example</p>
                  <ul className="space-y-2 text-center">
                    <li className="transition-all duration-400 ease-in-out text-gray-400 text-base font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through" style={{color: aromaColors.textMuted, opacity: 0.7 }}><span className="font-bold mr-1">✓</span>Enter Health Concern</li>
                    <li className="transition-all duration-400 ease-in-out text-gray-400 text-base font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center line-through" style={{color: aromaColors.textMuted, opacity: 0.7 }}><span className="font-bold mr-1">✓</span>Provide Demographics</li>
                    <li className="transition-all duration-400 ease-in-out text-lg font-bold opacity-100 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center animate-ellipsis" style={{color: aromaColors.text}}>Select Causes</li>
                    <li className="transition-all duration-400 ease-in-out text-gray-400 text-base font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center" style={{color: '#9ca3af'}}>Select Symptoms</li>
                    <li className="transition-all duration-400 ease-in-out text-gray-400 text-base font-normal opacity-90 min-h-[1.75rem] leading-[1.75rem] flex items-center justify-center" style={{color: '#9ca3af'}}>Review Properties</li>
                  </ul>
                  <p className="text-sm mt-2 text-center" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Stepper&gt; or custom list component.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Buttons</h2>
          <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
            <div className="card-content p-6 space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3">Main Action Button</h3>
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-white font-semibold py-3.5 px-8 rounded-3xl shadow-button-normal hover:-translate-y-0.5 hover:shadow-button-focus focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                    style={{ 
                      background: `linear-gradient(to right, ${aromaColors.gradStart}, ${aromaColors.gradEnd})`,
                      boxShadow: '0 4px 12px rgba(75, 71, 99, 0.1)', // button-normal
                      // hover:boxShadow needs JS or more complex Tailwind setup
                      // focus:ringColor should be aromaColors.primary
                    }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0px 6px 18px rgba(122, 92, 255, 0.3)'} // button-focus
                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 71, 99, 0.1)'} // button-normal
                  >
                    Criar Receita
                    <ArrowRight strokeWidth={2.5} className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Button variant="contained"&gt; heavily styled.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Standard Variants</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{backgroundColor: aromaColors.primary, borderColor: aromaColors.primary}}>Primary Contained</button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 border bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{color: aromaColors.primary, borderColor: aromaColors.primary, /* hover:backgroundColor: aromaColors.primary+'1A' */ }}>Primary Outlined</button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{color: aromaColors.primary, /* hover:backgroundColor: aromaColors.primary+'1A' */}}>Primary Text</button>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: Standard MUI &lt;Button&gt; variants.</p>
                <div className="flex flex-wrap gap-4 items-center mt-4">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{backgroundColor: aromaColors.secondary, borderColor: aromaColors.secondary}}>Secondary Contained</button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 border bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{color: aromaColors.secondary, borderColor: aromaColors.secondary, /* hover:backgroundColor: aromaColors.secondary+'1A' */}}>Secondary Outlined</button>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: Standard MUI &lt;Button&gt; variants with secondary color.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Suggestion Chips / Small Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="text-sm font-medium py-2 px-4 rounded-full transition-colors duration-200" style={{backgroundColor: '#f3e8ff', borderColor: '#d8b4fe', color: aromaColors.primary, borderWidth: '1px'}}>Relaxar</button>
                  <button className="text-sm font-medium py-2 px-4 rounded-full transition-colors duration-200" style={{backgroundColor: '#f3e8ff', borderColor: '#d8b4fe', color: aromaColors.primary, borderWidth: '1px'}}>Dormir melhor</button>
                  <button className="text-sm font-medium py-2 px-4 rounded-full transition-colors duration-200" style={{backgroundColor: '#f3e8ff', borderColor: '#d8b4fe', color: aromaColors.primary, borderWidth: '1px'}}>Alívio da tensão</button>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Chip&gt; components.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Input Fields</h2>
          <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
            <div className="card-content p-6">
              <div className="max-w-lg mx-auto">
                <label htmlFor="health-concern-example" className="block text-sm font-medium mb-2" style={{color: aromaColors.text}}>Health Concern Input</label>
                <div className="group relative rounded-3xl border border-gray-300 p-px hover:border-transparent focus-within:border-transparent hover:bg-gradient-to-r focus-within:bg-gradient-to-r from-[#7b61ff] to-[#ff5fa1] hover:from-[#7b61ff] hover:to-[#ff5fa1] focus-within:from-[#7b61ff] focus-within:to-[#ff5fa1]">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Search className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      id="health-concern-example" 
                      placeholder="Ex: dor de cabeça, insônia, ansiedade..." 
                      className="block w-full rounded-[calc(1.75rem-1px)] border-none bg-white py-3.5 pl-12 pr-4 text-base leading-6 shadow-none outline-none placeholder-gray-400"
                      style={{color: aromaColors.text}}
                      // onFocus={() => setIsInputFocused(true)}
                      // onBlur={() => setIsInputFocused(false)}
                    />
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;TextField variant="outlined"&gt; styled.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Alerts & Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
              <h3 className="text-xl font-medium p-6 pb-0">Alert Example</h3>
              <div className="card-content p-6">
                <div 
                  className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4"
                  style={{ backgroundColor: aromaColors.alertBg, borderColor: aromaColors.alertBorder }}
                >
                  <AlertTriangle className="h-4 w-4" style={{ color: aromaColors.alertIcon }} />
                  <div className="text-sm [&_p]:leading-relaxed" style={{ color: aromaColors.alertText }}>
                    Estamos com alta demanda. Pode haver pequenos atrasos nas sugestões. Obrigada!
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Alert severity="warning"&gt;.</p>
              </div>
            </div>
            <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
              <h3 className="text-xl font-medium p-6 pb-0">Relevancy Badges</h3>
              <div className="card-content p-6">
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-white" style={{backgroundColor: `rgba(122, 92, 255, 0.8)`}}>Relevância: 5/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold" style={{backgroundColor: `rgba(92, 255, 122, 0.8)`, color: aromaColors.text}}>Relevância: 4/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-white bg-yellow-500">Relevância: 3/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-white" style={{backgroundColor: `rgba(255, 122, 92, 0.8)`}}>Relevância: 2/5</span>
                  <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold text-white bg-red-500">Relevância: 1/5</span>
                </div>
                <p className="text-sm mt-2" style={{ color: aromaColors.textMuted }}>Represents: MUI &lt;Chip size="small"&gt;.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: aromaColors.text }}>Layout Components (Conceptual)</h2>
          <div className="card bg-white rounded-lg border border-gray-200 shadow-card">
            <div className="card-content p-6 space-y-4" style={{ color: aromaColors.text }}>
              <p>Layout structure will follow `01_saas_template.md` using MUI components:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>**Sidebar:** MUI &lt;Drawer&gt; component (persistent or temporary variant) with &lt;List&gt;, &lt;ListItem&gt;, &lt;ListItemIcon&gt;, &lt;ListItemText&gt;.</li>
                <li>**User Menu:** MUI &lt;Menu&gt; or &lt;Popover&gt; anchored to a &lt;Button&gt; or &lt;Avatar&gt; in the sidebar.</li>
                <li>**Settings Page:** Main content area with MUI &lt;Tabs orientation="vertical"&gt; and &lt;TabPanel&gt;.</li>
                <li>**Modals:** MUI &lt;Dialog&gt; for confirmations (logout) or full-screen content (Subscription).</li>
                <li>**Cards:** MUI &lt;Card&gt; with &lt;CardContent&gt;, &lt;CardHeader&gt;, etc. (as used in this design system).</li>
              </ul>
              <p className="text-sm" style={{ color: aromaColors.textMuted }}>Refer to `01_saas_template.md` for layout details and Material UI documentation for component implementation.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DesignSystemPage;
