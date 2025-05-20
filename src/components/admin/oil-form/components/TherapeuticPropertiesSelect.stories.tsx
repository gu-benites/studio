import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TherapeuticPropertiesSelect } from './TherapeuticPropertiesSelect';
import { useTherapeuticProperties } from '../hooks/useTherapeuticProperties';
import type { TherapeuticProperty } from '../hooks/useTherapeuticProperties';

// Mock data for storybook
const MOCK_PROPERTIES: TherapeuticProperty[] = [
  { 
    id: '1', 
    property_name: 'Anti-inflammatory',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '2', 
    property_name: 'Antiseptic',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '3', 
    property_name: 'Calming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '4', 
    property_name: 'Energizing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: '5', 
    property_name: 'Digestive Aid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

// Mock the hook for storybook
jest.mock('../hooks/useTherapeuticProperties');

// Type for Storybook decorator
const withMockedHook = (Story: React.ComponentType) => {
  // Mock the hook implementation
  (useTherapeuticProperties as jest.Mock).mockImplementation(() => ({
    properties: MOCK_PROPERTIES,
    isLoading: false,
    error: null,
    createProperty: async (name: string): Promise<TherapeuticProperty> => ({
      id: `new-${Date.now()}`,
      property_name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
    isCreating: false,
    propertyExists: (name: string) => 
      MOCK_PROPERTIES.some(p => 
        p.property_name.toLowerCase() === name.toLowerCase()
      ),
  }));
  
  return <Story />;
};

const meta: Meta<typeof TherapeuticPropertiesSelect> = {
  title: 'Admin/OilForm/TherapeuticPropertiesSelect',
  component: TherapeuticPropertiesSelect,
  tags: ['autodocs'],
  decorators: [withMockedHook],
};

export default meta;

type Story = StoryObj<typeof TherapeuticPropertiesSelect>;

// Helper component to manage state for stories
const Template: React.FC<{
  args: React.ComponentProps<typeof TherapeuticPropertiesSelect>;
  initialValue?: string[];
}> = ({ args, initialValue = [] }) => {
  const [selected, setSelected] = useState<string[]>(initialValue);
  return (
    <div className="w-[400px]">
      <TherapeuticPropertiesSelect
        {...args}
        value={selected}
        onChange={setSelected}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Selected IDs: {selected.join(', ') || 'None'}
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    value: [],
    placeholder: 'Search therapeutic properties...',
  },
  render: (args) => <Template args={args} />,
};

export const WithInitialSelection: Story = {
  ...Default,
  args: {
    ...Default.args,
    value: ['1', '3'], // Pre-select Anti-inflammatory and Calming
  },
  render: (args) => <Template args={args} initialValue={args.value} />,
};

export const WithMaxSelections: Story = {
  ...Default,
  args: {
    ...Default.args,
    maxSelections: 2,
  },
  render: (args) => <Template args={args} />,
};

export const Disabled: Story = {
  ...Default,
  args: {
    ...Default.args,
    disabled: true,
  },
  render: (args) => <Template args={args} />,
};
