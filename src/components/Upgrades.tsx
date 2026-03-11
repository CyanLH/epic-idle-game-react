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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {UPGRADES_DATA.map(upg => {
        const isPurchased = state.upgrades.includes(upg.id);
        if (isPurchased) return null; // Hide purchased upgrades

        const canAfford = state.data >= upg.cost;

        return (
          <div 
            key={upg.id} 
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${canAfford ? 'bg-white border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 hover:-translate-y-1 cursor-pointer' : 'bg-gray-100 border-gray-200 opacity-60 grayscale cursor-not-allowed'}`}
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
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-3xl mb-2 shadow-inner border border-purple-200">
              {upg.icon}
            </div>
            <div className="font-extrabold text-gray-800 text-sm text-center leading-tight mb-2 flex-1 flex items-center">{upg.name}</div>
            <div className="text-xs font-bold flex items-center justify-center gap-1 w-full bg-gray-50 rounded-lg py-1 mt-auto border border-gray-100">
               <span className="text-pink-500">💕</span> 
               <span className={canAfford ? 'text-gray-800' : 'text-gray-400'}>{formatNumber(upg.cost)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
