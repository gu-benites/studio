// jest.setup.ts
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Jest matchers
expect.extend(matchers);

// Add a serializer for React elements to make test output more readable
expect.addSnapshotSerializer({
  test: (val: any) => {
    return val && val.$$typeof === Symbol.for('react.test.json');
  },
  print: (val: any, serialize: any) => {
    return serialize(val);
  },
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock next/head
jest.mock('next/head', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(React.Fragment, {}, children);
    },
  };
});

// Mock next/link
jest.mock('next/link', () => {
  const React = require('react');
  return function MockLink({ children, href, ...props }: any) {
    return React.createElement('a', { ...props, href }, children);
  };
});

// Mock lucide-react
jest.mock('lucide-react', () => {
  const React = require('react');
  const createIcon = (name: string) => {
    return function MockIcon(props: any) {
      return React.createElement('span', { ...props, 'data-testid': `icon-${name}` }, name);
    };
  };

  return {
    Plus: createIcon('Plus'),
    X: createIcon('X'),
    ChevronDown: createIcon('ChevronDown'),
    Check: createIcon('Check'),
    Loader2: createIcon('Loader2'),
    AlertCircle: createIcon('AlertCircle'),
  };
});

// Mock session storage
const mockStorage: Record<string, string> = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    },
  },
  writable: true,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Set up ResizeObserver
global.ResizeObserver = MockResizeObserver;

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query');
  return {
    ...originalModule,
    useQuery: jest.fn((...args: any[]) => originalModule.useQuery(...args)),
    useMutation: jest.fn((...args: any[]) => originalModule.useMutation(...args)),
  };
});

// Mock @/lib/supabase
export const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  __esModule: true,
  default: { supabase: mockSupabase },
}));
