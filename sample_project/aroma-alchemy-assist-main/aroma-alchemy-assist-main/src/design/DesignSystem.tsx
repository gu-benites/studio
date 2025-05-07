
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingComponents from './LoadingComponents';

/**
 * AromaChat Design System
 * 
 * This file documents the design principles and component examples
 * for maintaining consistency across the application.
 */

export const ColorPalette = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-20 bg-aroma-primary rounded-md"></div>
        <p className="text-sm font-medium">Primary</p>
        <p className="text-xs text-gray-500">#A7D1AB</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 bg-aroma-secondary rounded-md"></div>
        <p className="text-sm font-medium">Secondary</p>
        <p className="text-xs text-gray-500">#F5F5DC</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 bg-aroma-accent rounded-md"></div>
        <p className="text-sm font-medium">Accent</p>
        <p className="text-xs text-gray-500">#E07A5F</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-20 bg-aroma-dark rounded-md"></div>
        <p className="text-sm font-medium">Dark</p>
        <p className="text-xs text-gray-500">#3D4A3D</p>
      </div>
    </div>
  );
};

export const Typography = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-aroma-dark">Heading 1</h1>
        <p className="text-sm text-gray-500">text-3xl md:text-4xl font-bold text-aroma-dark</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-aroma-dark">Heading 2</h2>
        <p className="text-sm text-gray-500">text-2xl font-semibold text-aroma-dark</p>
      </div>
      <div>
        <h3 className="text-xl font-medium text-aroma-dark">Heading 3</h3>
        <p className="text-sm text-gray-500">text-xl font-medium text-aroma-dark</p>
      </div>
      <div>
        <p className="text-base text-gray-600">Body text</p>
        <p className="text-sm text-gray-500">text-base text-gray-600</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Small text</p>
        <p className="text-xs text-gray-500">text-sm text-gray-500</p>
      </div>
    </div>
  );
};

export const GradientHeadings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#7b61ff] to-[#ff5fa1] text-transparent bg-clip-text">
          Qual receita você quer criar hoje?
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#7b61ff] to-[#ff5fa1] text-transparent bg-clip-text</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-transparent bg-clip-text">
          Purple to Blue Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">
          Pink to Yellow Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
          Green to Blue Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-green-400 to-blue-500</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-500 to-pink-500 text-transparent bg-clip-text">
          Amber to Pink Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-amber-500 to-pink-500</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-aroma-primary to-aroma-accent text-transparent bg-clip-text">
          Aroma Primary to Accent Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-aroma-primary to-aroma-accent</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-br from-purple-600 to-blue-500 text-transparent bg-clip-text">
          Diagonal Purple to Blue Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-br from-purple-600 to-blue-500</p>
      </div>
      
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-tr from-emerald-500 to-sky-500 text-transparent bg-clip-text">
          Diagonal Emerald to Sky Gradient
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-tr from-emerald-500 to-sky-500</p>
      </div>

      {/* New vibrant gradients */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] text-transparent bg-clip-text">
          Vibrant Red to Orange
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316] text-transparent bg-clip-text">
          Vibrant Purple-Pink-Orange
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#0EA5E9] to-[#10B981] text-transparent bg-clip-text">
          Ocean Blue to Emerald
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#0EA5E9] to-[#10B981]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-transparent bg-clip-text">
          Vibrant Purple to Pink
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#F43F5E] to-[#7C3AED] text-transparent bg-clip-text">
          Vibrant Rose to Violet
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#F43F5E] to-[#7C3AED]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] text-transparent bg-clip-text">
          Teal-Blue-Purple Diagonal
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]</p>
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#FB7185] via-[#E879F9] to-[#60A5FA] text-transparent bg-clip-text">
          Vibrant Rose-Pink-Blue
        </h1>
        <p className="text-sm text-gray-500">bg-gradient-to-r from-[#FB7185] via-[#E879F9] to-[#60A5FA]</p>
      </div>
    </div>
  );
};

export const ButtonVariants = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button className="bg-aroma-primary text-white">Primary</Button>
        <Button variant="outline" className="border-aroma-primary text-aroma-dark">Outline</Button>
        <Button variant="secondary" className="bg-aroma-secondary text-aroma-dark">Secondary</Button>
        <Button variant="ghost" className="text-aroma-dark">Ghost</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button size="lg" className="bg-aroma-primary text-white">Large</Button>
        <Button size="default" className="bg-aroma-primary text-white">Default</Button>
        <Button size="sm" className="bg-aroma-primary text-white">Small</Button>
      </div>
    </div>
  );
};

export const BadgeVariants = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <Badge className="bg-green-600">Relevância: 5/5</Badge>
      <Badge className="bg-green-500">Relevância: 4/5</Badge>
      <Badge className="bg-yellow-500">Relevância: 3/5</Badge>
      <Badge className="bg-orange-500">Relevância: 2/5</Badge>
      <Badge className="bg-red-500">Relevância: 1/5</Badge>
    </div>
  );
};

const DesignSystem: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-aroma-dark mb-10">AromaChat Design System</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Loading Components</h2>
        <LoadingComponents />
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Color Palette</h2>
        <Card>
          <CardContent className="pt-6">
            <ColorPalette />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Typography</h2>
        <Card>
          <CardContent className="pt-6">
            <Typography />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Gradient Headings</h2>
        <Card>
          <CardContent className="pt-6">
            <GradientHeadings />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Buttons</h2>
        <Card>
          <CardContent className="pt-6">
            <ButtonVariants />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Badges</h2>
        <Card>
          <CardContent className="pt-6">
            <BadgeVariants />
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-aroma-dark mb-4">Mobile Design Principles</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-2 list-disc pl-5">
              <li>Use larger touch targets (min 44×44px)</li>
              <li>Implement bottom navigation for primary actions</li>
              <li>Use Drawer component for secondary menus</li>
              <li>Ensure sufficient spacing between interactive elements</li>
              <li>Use collapsible sections to save vertical space</li>
              <li>Prioritize single-column layouts on small screens</li>
              <li>Use responsive typography (smaller on mobile)</li>
              <li>Ensure form inputs are at least 48px tall</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DesignSystem;
