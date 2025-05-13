import '@testing-library/jest-dom';

declare namespace jest {
  interface Matchers<R = void, T = {}> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string | RegExp): R;
  }
}
