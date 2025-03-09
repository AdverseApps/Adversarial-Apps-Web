import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'whatwg-fetch'; // (optional) if needed for fetch polyfill

// Mock the Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn() }),
}));

import SearchBar from '../../components/searchbar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the dropdown when user types and fetch returns data', async () => {
    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        companies: [
          { 'Company Name': 'CompanyA', CIK: '0001111111' },
          { 'Company Name': 'CompanyB', CIK: '0002222222' },
        ],
      }),
    });

    render(<SearchBar placeholder="Search..." />);

    // Type something in the input
    const input = screen.getByPlaceholderText(/Search.../i);
    await userEvent.type(input, 'T');

    await waitFor(() => {
      // Expect the list items from the mock data to show up
      expect(screen.getByText('CompanyA')).toBeInTheDocument();
      expect(screen.getByText('CompanyB')).toBeInTheDocument();
    });

    const listElement = screen.getByRole('list');
    expect(listElement).toBeInTheDocument();
  });
});
