import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from '../../components/navbar';

describe('NavBar', () => {
  it('shows the Education menu items when hovering over Education', async () => {
    render(<NavBar />);

    // Hover over the "Education" link
    const educationLink = screen.getByRole('link', { name: /Education/i });
    await userEvent.hover(educationLink);
    
    // Expect that the Education submenu items appear
    expect(screen.getByRole('link', { name: /CFR Title 15/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SAM Compliance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SBIR Due Diligence/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Resources/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CMMC 2\.0/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FOCI/i })).toBeInTheDocument();
  });
});
