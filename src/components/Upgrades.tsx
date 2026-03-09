import React from 'react';
import { UPGRADES_DATA } from '../config/gameData';
import type { GameState } from '../hooks/useGameEngine';
import type { SoundEffectKey } from '../hooks/useSoundEffects';

interface UpgradesProps {
  state: GameState;
  onBuy: (id: string) => void;
  onPlaySound: (effect: SoundEffectKey) => void;
  formatNumber: (n: number) => string;
}

export const Upgrades: React.FC<UpgradesProps> = ({ state, onBuy, onPlaySound, formatNumber }) => {
  return (
    <div className="grid-list">
      {UPGRADES_DATA.map(upg => {
        const isPurchased = state.upgrades.includes(upg.id);
        if (isPurchased) return null; // Hide purchased upgrades

        const canAfford = state.data >= upg.cost;

        return (
          <div 
            key={upg.id} 
            className={`upgrade-item ${canAfford ? '' : 'disabled'}`}
            onClick={() => {
              if (!canAfford) {
                onPlaySound('error');
                return;
              }

              onBuy(upg.id);
              onPlaySound('purchase');
            }}
            title={upg.desc}
          >
            <div className="upgrade-icon">{upg.icon}</div>
            <div className="upgrade-name">{upg.name}</div>
            <div className="upgrade-cost">
               💕 <span className={canAfford ? 'cost-val-active' : 'cost-val'}>{formatNumber(upg.cost)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
