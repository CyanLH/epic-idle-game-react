import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { ClickerArea } from './components/ClickerArea';
import { Store } from './components/Store';
import { Upgrades } from './components/Upgrades';
import { STORY_EVENTS } from './config/storyData';
import { StoryModal } from './components/StoryModal';
import { PrestigeShop } from './components/PrestigeShop';
import './App.css';

function App() {
  const { state, stats, setAction, getGeneratorCost, buyGenerator, buyUpgrade, calculatePrestigeEarned, prestige, handleStoryChoice, buyMetaPerk, unlockIdol } = useGameEngine();
  const [activeTab, setActiveTab] = useState<'generators' | 'upgrades' | 'prestige' | 'ending'>('generators');

  // Helper to format large numbers
  const formatNumber = (num: number) => {
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi"];
    const suffixNum = Math.floor(Math.log10(num) / 3);
    let shortValue = parseFloat((num / Math.pow(1000, suffixNum)).toPrecision(3));
    if (shortValue % 1 !== 0) shortValue = Number(shortValue.toFixed(1));
    return shortValue + suffixes[suffixNum];
  };

  return (
    <div className="app-container">
      <header>
        <h1>✨ Waifu Clicker Idol Project ✨</h1>
        <div className="header-stats">
           Total Hearts Ever: {formatNumber(state.totalData)} 💕
        </div>
        {state.prestigeLevel > 0 && (
          <div className="prestige-stats" style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '4px' }}>
            Prestige Level: {state.prestigeLevel} | Bonus: +{(state.prestigeCurrency * 10).toFixed(0)}%
          </div>
        )}
      </header>

      <main className="game-container">
        
        {/* Left Panel: Clicker Area */}
        <section className="panel clicker-panel" style={{ position: 'relative' }}>
          <div className="currency-display">
            <span className="currency-label">HEARTS :</span>
            <span className="currency-value">{formatNumber(state.data)}</span>
            <span className="currency-unit">💕</span>
          </div>
          <div className="income-display">
            <span>{formatNumber(stats.incomePerSec)}</span> Hearts / sec
          </div>

          <div className="stats-hud" style={{ padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#ff69b4' }}>HP:</strong>
              <div style={{ flex: 1, margin: '0 10px', height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden' }}>
                 <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))}%`, background: state.hp < 20 ? 'red' : '#ff69b4', transition: 'width 0.2s' }}></div>
              </div>
              <span>{Math.floor(state.hp)}/{state.maxHp}</span>
            </div>
            {/* FEVER GAUGE */}
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#ff4500', animation: state.feverTimeLeft > 0 ? 'pulse 0.5s infinite alternate' : 'none' }}>🔥 FEVER:</strong>
              <div style={{ flex: 1, margin: '0 10px', height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden', border: state.feverTimeLeft > 0 ? '1px solid gold' : 'none' }}>
                 <div style={{ height: '100%', width: `${state.feverTimeLeft > 0 ? (state.feverTimeLeft / 10) * 100 : state.feverGauge}%`, background: state.feverTimeLeft > 0 ? 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : '#ff4500', transition: state.feverTimeLeft > 0 ? 'none' : 'width 0.2s', backgroundSize: '200% 200%', animation: state.feverTimeLeft > 0 ? 'rainbowMove 1s linear infinite' : 'none' }}></div>
              </div>
              <span style={{ width: '45px', textAlign: 'right', fontWeight: state.feverTimeLeft > 0 ? 'bold' : 'normal', color: state.feverTimeLeft > 0 ? '#ff4500' : 'inherit' }}>
                {state.feverTimeLeft > 0 ? `${state.feverTimeLeft.toFixed(1)}s` : `${Math.floor(state.feverGauge)}%`}
              </span>
            </div>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8a2be2', fontWeight: 'bold' }}>✨ Charm:</span>
              <span>{Math.floor(state.charm)} (x{stats.charmMult.toFixed(2)})</span>
            </div>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff1493', fontWeight: 'bold' }}>💖 Affection:</span>
              <span>{Math.floor(state.affection)} / 1000</span>
            </div>
          </div>
          
          <div className="clicker-container" style={{ flex: 1, position: 'relative' }}>
            <ClickerArea state={state} />
          </div>

          <div className="action-toggles" style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
            <button 
              className={`action-btn ${state.currentAction === 'cheer' ? 'active' : ''}`}
              onClick={() => setAction('cheer')}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'cheer' ? '#ff69b4' : '#f0f0f0', color: state.currentAction === 'cheer' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              📣 응원 (Cheer)
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'rest' ? 'active' : ''}`}
              onClick={() => setAction('rest')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'rest' ? '#87ceeb' : '#f0f0f0', color: state.currentAction === 'rest' ? 'white' : '#333', cursor: 'pointer' }}
            >
              🛌 휴식 (Rest)
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'train' ? 'active' : ''}`}
              onClick={() => setAction('train')}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'train' ? '#9370db' : '#f0f0f0', color: state.currentAction === 'train' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              💪 훈련 (Train)
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'interact' ? 'active' : ''}`}
              onClick={() => setAction('interact')}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'interact' ? '#ff1493' : '#f0f0f0', color: state.currentAction === 'interact' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              💬 소통 (Interact)
            </button>
          </div>
        </section>

        {/* Right Panel: Store / Upgrades */}
        <section className="panel store-panel">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'generators' ? 'active' : ''}`}
              onClick={() => setActiveTab('generators')}
            >
              PROMOTIONS
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
              onClick={() => setActiveTab('upgrades')}
            >
              OUTFITS
            </button>
            <button 
              className={`tab-btn ${activeTab === 'prestige' ? 'active' : ''}`}
              onClick={() => setActiveTab('prestige')}
            >
              PRESTIGE
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'generators' && (
              <Store 
                state={state} 
                getGeneratorCost={getGeneratorCost} 
                onBuy={buyGenerator} 
                formatNumber={formatNumber} 
              />
            )}
            
            {activeTab === 'upgrades' && (
              <Upgrades 
                state={state} 
                onBuy={buyUpgrade} 
                formatNumber={formatNumber} 
              />
            )}

            {activeTab === 'prestige' && (
              <>
              <div className="prestige-container" style={{ padding: '20px', textAlign: 'center', background: 'white', borderRadius: '12px', border: 'var(--border-cute)', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Idol Graduation (Prestige)</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>
                  Retire your current idol and start fresh! You will lose all Hearts, Promotions, and Outfits.
                </p>
                <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                  <strong>Current Total Hearts:</strong> {formatNumber(state.totalData)} 💕
                  <br/>
                  <strong>Prestige Currency Earned:</strong> <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>+{calculatePrestigeEarned()}</span>
                  <br/>
                  <small style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>(1 per 1,000,000 Total Hearts)</small>
                </div>
                
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to graduate? This will reset your progress!")) {
                      prestige();
                    }
                  }}
                  disabled={calculatePrestigeEarned() <= 0}
                  style={{
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: calculatePrestigeEarned() > 0 ? 'var(--color-primary)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-cute)',
                    cursor: calculatePrestigeEarned() > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: calculatePrestigeEarned() > 0 ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  GRADUATE NOW
                </button>
              </div>
              <PrestigeShop 
                state={state} 
                onBuyPerk={buyMetaPerk} 
                onUnlockIdol={unlockIdol} 
                onChangeIdol={prestige} // Using prestige function directly to handle idol swaps
                formatNumber={formatNumber} 
              />
            </>
            )}

            {/* Ending Overlay Trigger */}
            {state.affection >= 1000 && state.upgrades.includes('upg_romance') && (
              <div style={{ padding: '20px', textAlign: 'center', background: '#ffe4e1', borderRadius: '12px', border: '2px solid #ff69b4', marginTop: '20px' }}>
                <h2 style={{ color: '#ff1493' }}>💖 Special Ending Unlocked</h2>
                <p>You have reached maximum affection and confessed your feelings.</p>
                <button onClick={() => setActiveTab('ending')} style={{ padding: '10px 20px', background: '#ff1493', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View Ending</button>
              </div>
            )}
          </div>
        </section>

        {activeTab === 'ending' && state.affection >= 1000 && state.upgrades.includes('upg_romance') && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <img src="/idol_ending_romance.png" alt="Romance Ending" style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 30px rgba(255, 105, 180, 0.5)' }} />
             <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '12px', width: '80%', maxWidth: '600px', textAlign: 'center' }}>
               <h2 style={{ color: '#ff69b4', marginBottom: '10px' }}>"Thank you for always supporting me..."</h2>
               <p style={{ color: '#333', fontSize: '1.1rem' }}>"I couldn't have made it this far without you cheering me on. From now on, let's shine together, not just on stage... but forever."</p>
               <button onClick={() => setActiveTab('generators')} style={{ marginTop: '20px', padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
             </div>
          </div>
        )}

      </main>

      {/* Story Event Modal Overlay */}
      {state.activeEvent && (
        <StoryModal 
          event={STORY_EVENTS.find(e => e.id === state.activeEvent)!} 
          onChoice={handleStoryChoice} 
        />
      )}
    </div>
  );
}

export default App;
