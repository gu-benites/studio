// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS and other asset imports
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // Add transformIgnorePatterns to ensure lucide-react is transformed
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|@lucide|@radix-ui|@radix-ui/.*|@hookform|@hookform/.*|@tanstack|@tanstack/.*|@dnd-kit|@dnd-kit/.*|@floating-ui|@floating-ui/.*|react-dnd|react-dnd-html5-backend|react-dnd-touch-backend|react-dnd-test-backend|react-dnd-test-utils|dnd-core|react-dnd-core|@react-dnd|@react-dnd/.*|react-dnd|react-dnd-html5-backend|react-dnd-touch-backend|react-dnd-test-backend|react-dnd-test-utils|dnd-core|react-dnd-core|@react-dnd|@react-dnd/.*)/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!**/node_modules/**',
  ],
  // Add moduleDirectories to handle node_modules correctly
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Add extensions to handle
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
