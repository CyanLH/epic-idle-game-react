import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../../src/hooks/useGameEngine';

// Mock dependencies that rely on window/timers
jest.useFakeTimers();

describe('useGameEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with default state when no convex data is provided', () => {
    const { result } = renderHook(() => useGameEngine());

    expect(result.current.state.data).toBe(0);
    expect(result.current.state.hp).toBe(100);
    expect(result.current.state.currentAction).toBe('idle');
  });

  it('merges initialServerData from Convex correctly (retro-compatibility check)', () => {
    const mockServerData = {
      data: 500,
      hp: 50,
      currentAction: 'train', // Note: currentAction isn't stored in server, defaults to idle
      charm: 10,
    };

    const { result } = renderHook(() => useGameEngine('mock-id' as any, mockServerData));

    expect(result.current.state.data).toBe(500);
    expect(result.current.state.hp).toBe(50);
    expect(result.current.state.charm).toBe(10);
    // Action should fallback to initialization default since it's ephemeral
    expect(result.current.state.currentAction).toBe('idle'); 
  });

  it('updates state action correctly via setAction', () => {
    const { result } = renderHook(() => useGameEngine());

    act(() => {
      result.current.setAction('cheer');
    });

    expect(result.current.state.currentAction).toBe('cheer');
  });

  it('drain HP when cheering and recovers HP when resting', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useGameEngine());

    // 1. Set to cheer (drains HP)
    act(() => {
      result.current.setAction('cheer');
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Advance 2 seconds
    });

    // HP should decrease by 5 per second: 100 - (5 * 2) = 90
    expect(Math.floor(result.current.state.hp)).toBe(90);
    expect(result.current.state.data).toBeGreaterThan(0); // Should have earned hearts

    // 2. Set to rest (recovers HP)
    act(() => {
      result.current.setAction('rest');
    });

    act(() => {
      jest.advanceTimersByTime(1000); // Advance 1 second
    });

    // HP should increase by 15 per second: 90 + 15 = 105 (Clamped to 100)
    expect(Math.floor(result.current.state.hp)).toBe(100);
  });
});
