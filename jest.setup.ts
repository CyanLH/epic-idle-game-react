import '@testing-library/jest-dom';

// Next.js useRouter mock
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// NextAuth mock
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User', email: 'test@example.com' } },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Convex mock
jest.mock('convex/react', () => ({
  useMutation: () => jest.fn().mockResolvedValue('mock-convex-id'),
  useQuery: () => undefined,
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: jest.fn().mockImplementation(() => ({})),
}));
