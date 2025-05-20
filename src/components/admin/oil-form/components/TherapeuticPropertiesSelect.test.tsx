import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TherapeuticPropertiesSelect } from './TherapeuticPropertiesSelect';
import { useTherapeuticProperties, type TherapeuticProperty } from '../hooks/useTherapeuticProperties';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className, ...props }: any) => (
    <span className={`mock-search-icon ${className}`} {...props} data-testid="search-icon">
      Search
    </span>
  ),
  Plus: ({ className, ...props }: any) => (
    <span className={`mock-plus-icon ${className}`} {...props} data-testid="plus-icon">
      Plus
    </span>
  ),
  X: ({ className, ...props }: any) => (
    <span className={`mock-x-icon ${className}`} {...props} data-testid="x-icon">
      X
    </span>
  ),
  Check: ({ className, ...props }: any) => (
    <span className={`mock-check-icon ${className}`} {...props} data-testid="check-icon">
      Check
    </span>
  ),
}));

// Mock the hook with proper TypeScript types
jest.mock('../hooks/useTherapeuticProperties');

// Create a mock implementation type that matches the hook's return type
type MockUseTherapeuticProperties = jest.Mock<ReturnType<typeof useTherapeuticProperties>, []>;

const mockUseTherapeuticProperties = useTherapeuticProperties as unknown as MockUseTherapeuticProperties;

// Helper to create a test property
const createTestProperty = (id: string, name: string): TherapeuticProperty => ({
  id,
  property_name: name,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Test properties
const mockProperties: TherapeuticProperty[] = [
  createTestProperty('1', 'Anti-inflammatory'),
  createTestProperty('2', 'Antiseptic'),
  createTestProperty('3', 'Calming'),
  createTestProperty('4', 'Energizing'),
  createTestProperty('5', 'Digestive Aid'),
];

// Default mock implementation with proper TypeScript types
const createMockImplementation = (overrides: Partial<ReturnType<typeof useTherapeuticProperties>> = {}): ReturnType<typeof useTherapeuticProperties> => {
  const mockCreateProperty = jest.fn().mockResolvedValue(createTestProperty('new-1', 'New Property'));
  const mockRefetch = jest.fn().mockResolvedValue({ data: null, error: null });
  
  return {
    properties: mockProperties,
    isLoading: false,
    error: null,
    createProperty: mockCreateProperty as any,
    isCreating: false,
    getPropertyById: (id: string) => mockProperties.find(p => p.id === id),
    getSelectedProperties: (ids: string[] = []) => mockProperties.filter(p => ids.includes(p.id)),
    searchProperties: (term: string) => 
      mockProperties.filter(p => p.property_name.toLowerCase().includes(term.toLowerCase())),
    propertyExists: (name: string) => 
      mockProperties.some(p => p.property_name.toLowerCase() === name.toLowerCase()),
    refetch: mockRefetch as any,
    ...overrides,
  };
};

// Wrapper component to provide React Query context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('TherapeuticPropertiesSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Return the mock implementation directly
    mockUseTherapeuticProperties.mockImplementation(() => createMockImplementation());
  });

  it('renders the component with a button', () => {
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={jest.fn()} />
      </TestWrapper>
    );
    
    // Find the button by its text content
    expect(screen.getByText('Search therapeutic properties...')).toBeInTheDocument();
  });

  it('shows the popover when the button is clicked', async () => {
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={jest.fn()} />
      </TestWrapper>
    );
    
    const button = screen.getByRole('combobox', { name: 'Search therapeutic properties...' });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search properties...')).toBeInTheDocument();
    });
  });

  it('displays a list of properties when the popover is open', async () => {
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={jest.fn()} />
      </TestWrapper>
    );
    
    const button = screen.getByRole('combobox', { name: 'Search therapeutic properties...' });
    await userEvent.click(button);
    
    // Wait for the popover to be visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search properties...')).toBeInTheDocument();
    });
    
    // Check that properties are displayed
    mockProperties.forEach(prop => {
      expect(screen.getByText(prop.property_name)).toBeInTheDocument();
    });
  });

  it('allows selecting a property', async () => {
    const handleChange = jest.fn();
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={handleChange} />
      </TestWrapper>
    );
    
    const button = screen.getByText('Search therapeutic properties...');
    await userEvent.click(button);
    
    const propertyItem = await screen.findByText('Anti-inflammatory');
    await userEvent.click(propertyItem);
    
    expect(handleChange).toHaveBeenCalledWith(['1']);
  });

  it('shows selected properties as badges', () => {
    // Override the mock to return specific properties for the selected IDs
    mockUseTherapeuticProperties.mockImplementation(() => ({
      ...createMockImplementation(),
      // Override the properties to ensure they're returned correctly
      getSelectedProperties: (ids: string[] = []) => {
        return mockProperties.filter(p => ids.includes(p.id));
      }
    }));
    
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={['1', '2']} onChange={jest.fn()} />
      </TestWrapper>
    );

    // Check for badges with the property names
    mockProperties.slice(0, 2).forEach(prop => {
      const badge = screen.getByText(prop.property_name);
      expect(badge).toBeInTheDocument();
      // The badge should have a close button (X icon)
      expect(badge.closest('div')).toContainElement(screen.getByTestId('x-icon'));
    });
  });

  it('allows removing a selected property', async () => {
    const handleChange = jest.fn();
    
    // Override the mock to return specific properties for the selected IDs
    mockUseTherapeuticProperties.mockImplementation(() => ({
      ...createMockImplementation(),
      // Override the properties to ensure they're returned correctly
      getSelectedProperties: (ids: string[] = []) => {
        return mockProperties.filter(p => ids.includes(p.id));
      }
    }));
    
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={['1', '2']} onChange={handleChange} />
      </TestWrapper>
    );
    
    // Find the X icon within the badge
    const xIcons = screen.getAllByTestId('x-icon');
    expect(xIcons.length).toBeGreaterThan(0);
    
    // Click the first X icon (which should be in the first badge)
    await userEvent.click(xIcons[0]);
    
    // Check that onChange was called with the remaining properties
    expect(handleChange).toHaveBeenCalledWith(['2']);
  });

  it('shows a loading state when fetching properties', async () => {
    mockUseTherapeuticProperties.mockImplementation(() => ({
      ...createMockImplementation(),
      isLoading: true,
    }));
    
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={jest.fn()} />
      </TestWrapper>
    );
    
    const button = screen.getByText('Search therapeutic properties...');
    await userEvent.click(button);
    
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it('allows creating a new property', async () => {
    const newProperty = createTestProperty('new-1', 'New Property');
    const mockCreate = jest.fn().mockResolvedValue(newProperty);
    
    mockUseTherapeuticProperties.mockImplementation(() => ({
      ...createMockImplementation(),
      createProperty: mockCreate,
      propertyExists: jest.fn().mockReturnValue(false),
    }));
    
    const handleChange = jest.fn();
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={handleChange} />
      </TestWrapper>
    );
    
    const button = screen.getByText('Search therapeutic properties...');
    await userEvent.click(button);
    
    const input = screen.getByPlaceholderText(/search properties/i);
    await userEvent.type(input, 'New Property');
    
    const createButton = await screen.findByText(/create "new property"/i);
    await userEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('New Property');
      expect(handleChange).toHaveBeenCalledWith([newProperty.id]);
    });
  });

  it('shows an error message when creation fails', async () => {
    const errorMessage = 'Failed to create property';
    const mockCreate = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    mockUseTherapeuticProperties.mockImplementation(() => ({
      ...createMockImplementation(),
      createProperty: mockCreate,
      propertyExists: jest.fn().mockReturnValue(false),
    }));
    
    render(
      <TestWrapper>
        <TherapeuticPropertiesSelect value={[]} onChange={jest.fn()} />
      </TestWrapper>
    );
    
    const button = screen.getByText('Search therapeutic properties...');
    await userEvent.click(button);
    
    const input = screen.getByPlaceholderText(/search properties/i);
    await userEvent.type(input, 'New Property');
    
    const createButton = await screen.findByText(/create "new property"/i);
    await userEvent.click(createButton);
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});
