import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/components/sidebar/SidebarContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock session for testing
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: any;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, session = mockSession }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>{children}</SidebarProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: any },
) => {
  const { session, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders session={session}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockPlayer = (overrides = {}) => ({
  id: 'player-1',
  name: 'Test Player',
  position: 'BTN',
  stack: 1000,
  isActive: true,
  hasCards: true,
  hasFolded: false,
  isAllIn: false,
  betAmount: 0,
  ...overrides,
});

export const createMockGameState = (overrides = {}) => ({
  players: [
    createMockPlayer({ id: 'player-1', position: 'BTN' }),
    createMockPlayer({ id: 'player-2', position: 'SB', stack: 950, betAmount: 50 }),
    createMockPlayer({ id: 'player-3', position: 'BB', stack: 900, betAmount: 100 }),
  ],
  pot: 150,
  currentBet: 100,
  communityCards: [],
  stage: 'preflop',
  activePlayerId: 'player-1',
  ...overrides,
});
