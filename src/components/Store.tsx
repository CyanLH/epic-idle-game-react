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
    <div className="flex flex-col gap-3">
      {GENERATORS_DATA.map(gen => {
        const cost = getGeneratorCost(gen.id);
        const count = state.generators[gen.id] || 0;
        const canAfford = state.data >= cost;

        return (
          <div 
            key={gen.id} 
            className={`flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${canAfford ? 'bg-white border-pink-200 hover:-translate-y-1 hover:border-pink-300' : 'bg-gray-100 border-gray-200 opacity-60 grayscale'}`}
            onClick={() => {
              if (!canAfford) {
                onPlaySound('error');
                return;
              }

              onBuy(gen.id);
              onPlaySound('purchase');
            }}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-xl text-3xl mr-3 shadow-inner border border-pink-200">
              {gen.icon}
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-gray-800 text-base">{gen.name}</div>
              <div className="text-xs text-gray-500 font-semibold mb-1">{gen.desc}</div>
              <div className="text-sm font-bold flex items-center gap-1">
                <span className="text-pink-500">💕</span> 
                <span className={canAfford ? 'text-gray-800 drop-shadow-sm' : 'text-gray-400'}>{formatNumber(cost)}</span>
              </div>
            </div>
            <div className="ml-3 flex flex-col items-end justify-center min-w-[3rem]">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lv</div>
              <div className="text-2xl font-black text-primary drop-shadow-sm leading-none">{count}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
