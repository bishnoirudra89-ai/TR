import React from 'react';
import { render, screen } from '@testing-library/react';
import Forbidden from '../../src/pages/forbidden/Forbidden';

describe('Forbidden page', () => {
  it('renders countdown when closed', () => {
    // Mock Date to 19:00 local
    const RealDate = Date;
    const mockDate = new Date();
    mockDate.setHours(19, 0, 0, 0);
    global.Date = class extends Date {
      constructor() { super(); return mockDate; }
      static now() { return mockDate.getTime(); }
    } as unknown as DateConstructor;

    render(<Forbidden />);
    expect(screen.getByText(/Forbidden Land/i)).toBeInTheDocument();

    // restore
    global.Date = RealDate;
  });
});
