import React, { useState } from 'react';
import type { GameState } from '../hooks/useGameEngine';
import { META_PERKS, IDOL_CANDIDATES } from '../config/prestigeData';

interface PrestigeShopProps {
  state: GameState;
  onBuyPerk: (perkId: string) => void;
  onUnlockIdol: (idolId: string) => void;
  onChangeIdol: (idolId: string) => void; // This will trigger prestige()
  formatNumber: (num: number) => string;
}

export const PrestigeShop: React.FC<PrestigeShopProps> = ({ state, onBuyPerk, onUnlockIdol, onChangeIdol, formatNumber }) => {
  const [subTab, setSubTab] = useState<'perks' | 'idols'>('perks');

  return (
    <div className="prestige-shop" style={{ padding: '10px' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-primary)', margin: 0 }}>Available Prestige Currency</h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px' }}>
          ⭐ {formatNumber(state.prestigeCurrency)}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '16px' }}>
        <button 
          className={`tab-btn ${subTab === 'perks' ? 'active' : ''}`}
          onClick={() => setSubTab('perks')}
          style={{ padding: '8px', fontSize: '0.9rem' }}
        >
          Meta Perks
        </button>
        <button 
          className={`tab-btn ${subTab === 'idols' ? 'active' : ''}`}
          onClick={() => setSubTab('idols')}
          style={{ padding: '8px', fontSize: '0.9rem' }}
        >
          Idol Selection
        </button>
      </div>

      {subTab === 'perks' && (
        <div className="store-list">
          {META_PERKS.map(perk => {
            const currentLevel = state.metaPerks[perk.id] || 0;
            const isMax = currentLevel >= perk.maxLevel;
            const cost = Math.floor(perk.baseCost * Math.pow(perk.costMultiplier, currentLevel));
            const canAfford = state.prestigeCurrency >= cost && !isMax;

            return (
              <div key={perk.id} className={`store-item ${!canAfford ? 'disabled' : ''}`} onClick={() => canAfford && onBuyPerk(perk.id)}>
                <div className="item-info">
                  <div className="item-name">{perk.name} <span style={{fontSize:'0.8rem', color:'var(--color-primary)'}}>Lv.{currentLevel}/{perk.maxLevel}</span></div>
                  <div className="item-desc">{perk.desc}</div>
                  <div className="item-cost">
                    Cost: <span className={state.prestigeCurrency >= cost ? 'cost-val-active' : 'cost-val'}>{isMax ? 'MAX' : `⭐ ${formatNumber(cost)}`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'idols' && (
        <div className="store-list">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '12px', textAlign: 'center' }}>
            Warning: Changing idol will instantly graduate your current run and restart from 0 Hearts!
          </p>
          {IDOL_CANDIDATES.map(idol => {
            const isUnlocked = state.unlockedIdols.includes(idol.id);
            const isCurrent = state.currentIdolId === idol.id;
            const canAfford = state.prestigeCurrency >= idol.unlockCost;

            return (
              <div key={idol.id} className={`store-item ${isCurrent ? 'active' : ''}`} style={{ border: isCurrent ? '2px solid var(--color-primary)' : '' }}>
                <img src={idol.baseSprite} alt={idol.name} style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '12px', borderRadius: '50%', background: 'var(--bg-primary)' }} />
                <div className="item-info" style={{ flex: 1 }}>
                  <div className="item-name">{idol.name}</div>
                  <div className="item-desc">{idol.desc}</div>
                  <div style={{ fontSize:'0.8rem', color: 'var(--color-secondary)' }}>
                    Bonus: {idol.passiveBonusType === 'income' ? 'None' : `${idol.passiveBonusType} x${idol.passiveBonusValue}`}
                  </div>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  {isCurrent ? (
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Active</span>
                  ) : isUnlocked ? (
                    <button 
                      onClick={() => {
                        if (window.confirm(`Switch to ${idol.name}? This will instantly restart your current game.`)) {
                          onChangeIdol(idol.id);
                        }
                      }}
                      style={{ padding: '8px 12px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Select
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (canAfford && window.confirm(`Unlock ${idol.name} for ⭐${idol.unlockCost}?`)) {
                          onUnlockIdol(idol.id);
                        }
                      }}
                      disabled={!canAfford}
                      style={{ padding: '8px 12px', background: canAfford ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: canAfford ? 'pointer' : 'not-allowed' }}
                    >
                      Unlock ⭐{idol.unlockCost}
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
