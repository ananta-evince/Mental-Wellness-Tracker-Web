import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingPage from '../pages/OnboardingPage';
import { APP_NAME } from '../constants';

describe('OnboardingPage', () => {
  it('renders welcome screen with name and age fields', () => {
    render(<OnboardingPage onComplete={vi.fn()} onSkip={vi.fn()} />);

    expect(screen.getByRole('heading', { name: new RegExp(`Welcome to ${APP_NAME}`, 'i') })).toBeInTheDocument();
    expect(screen.getByLabelText(/what should i call you/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your age/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip onboarding/i })).toBeInTheDocument();
  });

  it('advances to exam selection after valid profile', async () => {
    const user = userEvent.setup();
    render(<OnboardingPage onComplete={vi.fn()} onSkip={vi.fn()} />);

    await user.type(screen.getByLabelText(/what should i call you/i), 'Ananya');
    await user.type(screen.getByLabelText(/your age/i), '17');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByRole('heading', { name: /academic profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NEET' })).toBeInTheDocument();
  });

  it('calls onSkip when skip is clicked', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(<OnboardingPage onComplete={vi.fn()} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: /skip onboarding/i }));
    expect(onSkip).toHaveBeenCalled();
  });
});
