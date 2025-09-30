import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  defaults: { withCredentials: true },
  get: jest.fn(() => Promise.resolve({ data: { authenticated: false, userId: null } })),
}));

test('renders login prompt by default when not authenticated', async () => {
  render(<App />);
  expect(await screen.findByText(/Slack Message Viewer/i)).toBeInTheDocument();
});

