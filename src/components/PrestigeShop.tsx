import React, { useState } from 'react';
import type { GameState } from '../hooks/useGameEngine';
import { META_PERKS, IDOL_CANDIDATES } from '../config/prestigeData';
import type { SoundEffectKey } from '../hooks/useSoundEffects';

interface PrestigeShopProps {
  state: GameState;
  onBuyPerk: (perkId: string) => void;
  onUnlockIdol: (idolId: string) => void;
  onChangeIdol: (idolId: string) => void; // 호출 시 즉시 졸업 처리가 함께 일어난다.
  onPlaySound: (effect: SoundEffectKey) => void;
  formatNumber: (num: number) => string;
}

export const PrestigeShop: React.FC<PrestigeShopProps> = ({ state, onBuyPerk, onUnlockIdol, onChangeIdol, onPlaySound, formatNumber }) => {
  const [subTab, setSubTab] = useState<'perks' | 'idols'>('perks');
  const getBonusLabel = (idol: typeof IDOL_CANDIDATES[number]) => {
    if (idol.passiveBonusType === 'income') return '추가 보너스 없음';
    if (idol.passiveBonusType === 'charm') return `매력 획득 x${idol.passiveBonusValue}`;
    return `호감도 획득 x${idol.passiveBonusValue}`;
  };

  return (
    <div className="p-2 space-y-4">
      <div className="bg-gradient-to-br from-purple-100 to-pink-50 p-5 rounded-2xl mb-2 text-center border-2 border-purple-200 shadow-inner">
        <h3 className="text-purple-600 font-extrabold m-0 uppercase tracking-widest text-sm drop-shadow-sm">보유 명성별</h3>
        <div className="text-4xl font-black text-purple-900 mt-2 drop-shadow-sm flex justify-center items-center gap-2">
          <span className="animate-pulse">⭐</span> {formatNumber(state.prestigeCurrency)}
        </div>
      </div>

      <div className="flex gap-2 mb-4 bg-gray-100/50 p-1 rounded-xl">
        <button 
          className={`flex-1 py-2.5 px-4 rounded-lg font-extrabold text-sm transition-all ${subTab === 'perks' ? 'bg-white text-primary shadow-sm ring-2 ring-primary/20 scale-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
          onClick={() => {
            setSubTab('perks');
            onPlaySound('action');
          }}
        >
          ✨ 메타 특전
        </button>
        <button 
          className={`flex-1 py-2.5 px-4 rounded-lg font-extrabold text-sm transition-all ${subTab === 'idols' ? 'bg-white text-secondary shadow-sm ring-2 ring-secondary/20 scale-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
          onClick={() => {
            setSubTab('idols');
            onPlaySound('action');
          }}
        >
          👗 아이돌 선택
        </button>
      </div>

      {subTab === 'perks' && (
        <div className="flex flex-col gap-3">
          {META_PERKS.map(perk => {
            const currentLevel = state.metaPerks[perk.id] || 0;
            const isMax = currentLevel >= perk.maxLevel;
            const cost = Math.floor(perk.baseCost * Math.pow(perk.costMultiplier, currentLevel));
            const canAfford = state.prestigeCurrency >= cost && !isMax;

            return (
              <div
                key={perk.id}
                className={`flex items-center p-4 rounded-2xl border-2 transition-all ${!canAfford && !isMax ? 'bg-gray-50 border-gray-200 grayscale opacity-70 cursor-not-allowed' : 'bg-white border-pink-200 hover:-translate-y-1 hover:shadow-md cursor-pointer'} ${isMax ? 'border-yellow-400 bg-yellow-50/30' : ''}`}
                onClick={() => {
                  if (!canAfford) {
                    onPlaySound('error');
                    return;
                  }

                  onBuyPerk(perk.id);
                  onPlaySound('purchase');
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="font-extrabold text-gray-800 text-base">{perk.name}</div>
                    <div className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${isMax ? 'bg-yellow-400 text-white shadow-sm' : 'bg-pink-100 text-primary'}`}>
                      Lv. {currentLevel}/{perk.maxLevel}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold mb-2 leading-relaxed">{perk.desc}</div>
                  <div className="text-sm font-bold flex items-center gap-1 bg-white/50 inline-flex px-2 py-1 rounded-md border border-gray-100">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">비용:</span> 
                    <span className={`font-black tracking-tight ${canAfford ? 'text-purple-600' : 'text-gray-400'}`}>
                      {isMax ? '마스터 완료' : `⭐ ${formatNumber(cost)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'idols' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-rose-500 mb-1 text-center bg-rose-50 py-2 rounded-lg border border-rose-100 shadow-inner">
            🚨 아이돌을 변경하면 현재 진행 중인 데이터가 초기화됩니다.
          </p>
          {IDOL_CANDIDATES.map(idol => {
            const isUnlocked = state.unlockedIdols.includes(idol.id);
            const isCurrent = state.currentIdolId === idol.id;
            const canAfford = state.prestigeCurrency >= idol.unlockCost;

            return (
              <div key={idol.id} className={`flex items-center p-3 sm:p-4 rounded-2xl border-2 transition-all ${isCurrent ? 'border-primary shadow-sm bg-pink-50/50 ring-2 ring-primary/20' : 'bg-white border-gray-200'}`}>
                <div className="w-16 h-16 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center overflow-hidden shrink-0 mr-3 shadow-inner relative">
                   {isCurrent && <div className="absolute inset-0 bg-white/20 animate-pulse-glow z-10" />}
                   <img src={idol.baseSprite} alt={idol.name} className="w-full h-full object-cover scale-[1.3] translate-y-2 relative z-0" />
                </div>
                <div className="flex-1 mr-2 min-w-0">
                  <div className="font-extrabold text-gray-800 text-base flex items-center gap-2 truncate">
                    {idol.name}
                    {isCurrent && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm">Play</span>}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold mb-1 truncate">{idol.desc}</div>
                  <div className="text-[11px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                    {getBonusLabel(idol)}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col justify-center">
                  {isCurrent ? (
                    <div className="text-sm font-black text-primary px-3 py-1.5 opacity-60 bg-pink-100 rounded-lg">선택됨</div>
                  ) : isUnlocked ? (
                    <button 
                      onClick={() => {
                        if (window.confirm(`${idol.name}(으)로 변경할까요? 현재 플레이는 즉시 초기화됩니다.`)) {
                          onPlaySound('prestige');
                          onChangeIdol(idol.id);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-t from-purple-600 to-purple-400 text-white font-extrabold rounded-xl shadow-3d-btn hover:-translate-y-0.5 active:shadow-3d-btn-pressed active:translate-y-0.5 transition-all text-sm ring-1 ring-purple-500/50"
                    >
                      교체
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (canAfford && window.confirm(`${idol.name}을(를) ⭐${idol.unlockCost}에 해금할까요?`)) {
                          onUnlockIdol(idol.id);
                          onPlaySound('unlock');
                        }
                      }}
                      disabled={!canAfford}
                      className={`px-3 py-2 font-extrabold rounded-xl shadow-md transition-all text-sm flex items-center gap-1 border border-transparent ${canAfford ? 'bg-gradient-to-t from-primary to-pink-400 text-white hover:brightness-110 active:translate-y-0.5 ring-1 ring-pink-500/50' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'}`}
                    >
                      해금 ⭐{idol.unlockCost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
