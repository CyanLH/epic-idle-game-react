import React from 'react';
import { GENERATORS_DATA } from '../config/gameData';
import type { GameState } from '../hooks/useGameEngine';
import type { SoundEffectKey } from '../hooks/useSoundEffects';

interface StoreProps {
  state: GameState;
  getGeneratorCost: (id: string) => number;
  onBuy: (id: string) => void;
  onPlaySound: (effect: SoundEffectKey) => void;
  formatNumber: (n: number) => string;
}

export const Store: React.FC<StoreProps> = ({ state, getGeneratorCost, onBuy, onPlaySound, formatNumber }) => {
  return (
    <div className="store-list">
      {GENERATORS_DATA.map(gen => {
        const cost = getGeneratorCost(gen.id);
        const count = state.generators[gen.id] || 0;
        const canAfford = state.data >= cost;

        return (
          <div 
            key={gen.id} 
            className={`store-item ${canAfford ? '' : 'disabled'}`}
            onClick={() => {
              if (!canAfford) {
                onPlaySound('error');
                return;
              }

              onBuy(gen.id);
              onPlaySound('purchase');
            }}
          >
            <div className="item-icon">{gen.icon}</div>
            <div className="item-info">
              <div className="item-name">{gen.name}</div>
              <div className="item-desc">{gen.desc}</div>
              <div className="item-cost">
                💕 <span className={canAfford ? 'cost-val-active' : 'cost-val'}>{formatNumber(cost)}</span>
              </div>
            </div>
            <div className="item-count">{count}</div>
          </div>
        );
      })}
    </div>
  );
};
