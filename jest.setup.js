// jest.setup.js
import '@testing-library/jest-dom';
// @ts-ignore
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Jest matchers
expect.extend(matchers);

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock session storage
const mockStorage = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => mockStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => {
        delete mockStorage[key];
      });
    }),
  },
  writable: true,
});
