import React from 'react';
import { GENERATORS_DATA } from '../config/gameData';
import type { GameState } from '../hooks/useGameEngine';

interface StoreProps {
  state: GameState;
  getGeneratorCost: (id: string) => number;
  onBuy: (id: string) => void;
  formatNumber: (n: number) => string;
}

export const Store: React.FC<StoreProps> = ({ state, getGeneratorCost, onBuy, formatNumber }) => {
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
            onClick={() => onBuy(gen.id)}
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
