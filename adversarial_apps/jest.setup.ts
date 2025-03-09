import '@testing-library/jest-dom'

const actualNavigation = jest.requireActual('next/navigation');

jest.mock('next/navigation', () => {
    // Return all the other exports from next/navigation
    const originalModule = actualNavigation;
  
    return {
      ...originalModule,
      // Mock useRouter so it doesn't complain about the App Router
      useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(() => Promise.resolve()),
      })),
  
      // Mock useSearchParams to avoid "Cannot read property 'get' of null"
      useSearchParams: jest.fn(() => {
        // Return a URLSearchParams object, or mock it directly
        // Example: ?someKey=someValue
        return new URLSearchParams('someKey=someValue');
      }),
    };
  });