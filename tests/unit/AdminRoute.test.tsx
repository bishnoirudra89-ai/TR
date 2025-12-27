import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminRoute from '../../src/components/AdminRoute';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({ profile: null, loading: false })
}));

describe('AdminRoute', () => {
  it('redirects non-admin to /', () => {
    render(
      <BrowserRouter>
        <AdminRoute>
          <div>AdminContent</div>
        </AdminRoute>
      </BrowserRouter>
    );
    // Since AdminRoute renders a Navigate, the actual redirect is handled by router; check no content
    expect(screen.queryByText('AdminContent')).toBeNull();
  });
});
