import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const mockAnalyzeJournal = vi.fn();
const mockSendChat = vi.fn();

vi.mock('../hooks/useWellnessApi', () => ({
  useWellnessApi: () => ({
    loading: false,
    error: null,
    analyzeJournal: mockAnalyzeJournal,
    sendChat: mockSendChat,
  }),
}));

function sidebar() {
  return screen.getByRole('complementary', { name: /main navigation/i });
}

describe('App', () => {
  beforeEach(() => {
    mockAnalyzeJournal.mockReset();
    mockSendChat.mockReset();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-id-1' });
  });

  it('submits daily check-in with metrics', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(sidebar()).getByRole('button', { name: 'Check-in' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /daily check-in/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /submit daily check-in/i }));

    expect(await screen.findByText(/thank you for checking in/i)).toBeInTheDocument();
  });

  it('navigates to journal page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(sidebar()).getByRole('button', { name: 'Journal' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^journal$/i })).toBeInTheDocument();
    });
  });

  it('renders nav, main, and footer landmarks', async () => {
    render(<App />);
    expect(screen.getByRole('complementary', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByText(/lumina/i).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  it('navigates between sidebar pages', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/good|hey night owl/i);
    });

    await user.click(within(sidebar()).getByRole('button', { name: 'Dashboard' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /wellness dashboard/i })).toBeInTheDocument();
    });

    await user.click(within(sidebar()).getByRole('button', { name: 'Check-in' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /daily check-in/i })).toBeInTheDocument();
    });
  });
});
