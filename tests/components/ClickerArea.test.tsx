import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClickerArea } from '@/components/ClickerArea';
import { GameState } from '@/hooks/useGameEngine';

const mockBaseState: GameState = {
  data: 0,
  totalData: 0,
  generators: {},
  upgrades: [],
  lastSavedTime: 0,
  prestigeLevel: 0,
  prestigeCurrency: 0,
  hp: 100,
  maxHp: 100,
  charm: 0,
  affection: 0,
  feverGauge: 0,
  feverTimeLeft: 0,
  currentAction: 'idle',
  seenEvents: [],
  activeEvent: null,
  metaPerks: {},
  unlockedIdols: ['idol_default'],
  currentIdolId: 'idol_default',
};

describe('ClickerArea Component', () => {
  it('renders the base sprite when idle with high HP', () => {
    render(<ClickerArea state={mockBaseState} />);
    const image = screen.getByAltText('아이돌 캐릭터');
    
    // Default config yields idol_base_normal.png initially
    expect(image).toHaveAttribute('src', '/idol_base_normal.png');
  });

  it('renders the tired sprite when HP is low', () => {
    render(<ClickerArea state={{ ...mockBaseState, hp: 15 }} />);
    const image = screen.getByAltText('아이돌 캐릭터');
    
    expect(image).toHaveAttribute('src', '/idol_base_tired.png');
  });

  it('renders action specific sprites based on currentAction', () => {
    const { rerender } = render(<ClickerArea state={{ ...mockBaseState, currentAction: 'cheer' }} />);
    let image = screen.getByAltText('아이돌 캐릭터');
    expect(image).toHaveAttribute('src', '/idol_base_happy.png');

    rerender(<ClickerArea state={{ ...mockBaseState, currentAction: 'rest' }} />);
    image = screen.getByAltText('아이돌 캐릭터');
    expect(image).toHaveAttribute('src', '/idol_base_sleeping.png');

    rerender(<ClickerArea state={{ ...mockBaseState, currentAction: 'train' }} />);
    image = screen.getByAltText('아이돌 캐릭터');
    expect(image).toHaveAttribute('src', '/idol_base_training.png');
  });
});
