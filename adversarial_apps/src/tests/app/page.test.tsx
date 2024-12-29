import { render, screen } from '@testing-library/react';
import Home from '../../app/page';  // Adjust this path as needed

describe('Home Page', () => {
    it('shows the "Sponsors" heading', () => {
      render(<Home />);
      const sponsorsHeading = screen.getByRole('heading', { name: /Sponsors/i });
      expect(sponsorsHeading).toBeInTheDocument();
    });
  });
