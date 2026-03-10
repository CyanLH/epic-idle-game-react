"use client";

import { useEffect, useRef, useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { ClickerArea } from './components/ClickerArea';
import { Store } from './components/Store';
import { Upgrades } from './components/Upgrades';
import { STORY_EVENTS } from './config/storyData';
import { StoryModal } from './components/StoryModal';
import { PrestigeShop } from './components/PrestigeShop';
import { MAX_AFFECTION } from './config/balance';
import { useSoundEffects } from './hooks/useSoundEffects';
import './App.css';

function App() {
  const { state, stats, setAction, getGeneratorCost, buyGenerator, buyUpgrade, calculatePrestigeEarned, prestige, handleStoryChoice, buyMetaPerk, unlockIdol } = useGameEngine();
  const [activeTab, setActiveTab] = useState<'generators' | 'upgrades' | 'prestige' | 'ending'>('generators');
  const { soundEnabled, setSoundEnabled, playSound } = useSoundEffects();
  const soundStateRef = useRef({
    activeEvent: null as string | null,
    endingUnlocked: false,
    feverActive: false,
  });

  // 큰 수를 짧은 영어 단위로 축약한다.
  const formatNumber = (num: number) => {
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi"];
    const suffixNum = Math.floor(Math.log10(num) / 3);
    let shortValue = parseFloat((num / Math.pow(1000, suffixNum)).toPrecision(3));
    if (shortValue % 1 !== 0) shortValue = Number(shortValue.toFixed(1));
    return shortValue + suffixes[suffixNum];
  };

  const endingUnlocked = state.affection >= MAX_AFFECTION && state.upgrades.includes('upg_romance');

  useEffect(() => {
    const previousState = soundStateRef.current;
    const feverActive = state.feverTimeLeft > 0;

    if (state.activeEvent && previousState.activeEvent !== state.activeEvent) {
      playSound('story');
    }

    if (feverActive && !previousState.feverActive) {
      playSound('fever');
    }

    if (endingUnlocked && !previousState.endingUnlocked) {
      playSound('ending');
    }

    soundStateRef.current = {
      activeEvent: state.activeEvent,
      endingUnlocked,
      feverActive,
    };
  }, [endingUnlocked, playSound, state.activeEvent, state.feverTimeLeft]);

  const handleSoundToggle = () => {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);

    if (nextEnabled) {
      playSound('toggle', { force: true });
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>✨ 아이돌 육성 클리커 ✨</h1>
        <div className="header-stats">
           누적 하트: {formatNumber(state.totalData)} 💕
        </div>
        {state.prestigeLevel > 0 && (
          <div className="prestige-stats" style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '4px' }}>
            졸업 단계: {state.prestigeLevel} | 추가 보너스: +{(state.prestigeCurrency * 10).toFixed(0)}%
          </div>
        )}
        <button className={`sound-toggle ${soundEnabled ? '' : 'muted'}`} onClick={handleSoundToggle}>
          {soundEnabled ? '🔊 효과음 켜짐' : '🔈 효과음 꺼짐'}
        </button>
      </header>

      <main className="game-container">
        
        {/* 왼쪽 패널: 메인 플레이 영역 */}
        <section className="panel clicker-panel" style={{ position: 'relative' }}>
          <div className="currency-display">
            <span className="currency-label">하트</span>
            <span className="currency-value">{formatNumber(state.data)}</span>
            <span className="currency-unit">💕</span>
          </div>
          <div className="income-display">
            <span>{formatNumber(stats.incomePerSec)}</span> 하트/초
          </div>

          <div className="stats-hud" style={{ padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#ff69b4' }}>체력:</strong>
              <div style={{ flex: 1, margin: '0 10px', height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden' }}>
                 <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))}%`, background: state.hp < 20 ? 'red' : '#ff69b4', transition: 'width 0.2s' }}></div>
              </div>
              <span>{Math.floor(state.hp)}/{state.maxHp}</span>
            </div>
            {/* 피버 게이지 */}
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#ff4500', animation: state.feverTimeLeft > 0 ? 'pulse 0.5s infinite alternate' : 'none' }}>🔥 피버:</strong>
              <div style={{ flex: 1, margin: '0 10px', height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden', border: state.feverTimeLeft > 0 ? '1px solid gold' : 'none' }}>
                 <div style={{ height: '100%', width: `${state.feverTimeLeft > 0 ? (state.feverTimeLeft / 10) * 100 : state.feverGauge}%`, background: state.feverTimeLeft > 0 ? 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : '#ff4500', transition: state.feverTimeLeft > 0 ? 'none' : 'width 0.2s', backgroundSize: '200% 200%', animation: state.feverTimeLeft > 0 ? 'rainbowMove 1s linear infinite' : 'none' }}></div>
              </div>
              <span style={{ width: '45px', textAlign: 'right', fontWeight: state.feverTimeLeft > 0 ? 'bold' : 'normal', color: state.feverTimeLeft > 0 ? '#ff4500' : 'inherit' }}>
                {state.feverTimeLeft > 0 ? `${state.feverTimeLeft.toFixed(1)}s` : `${Math.floor(state.feverGauge)}%`}
              </span>
            </div>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8a2be2', fontWeight: 'bold' }}>✨ 매력:</span>
              <span>{Math.floor(state.charm)} (x{stats.charmMult.toFixed(2)})</span>
            </div>
            <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#ff1493', fontWeight: 'bold' }}>💖 호감도:</span>
              <span>{Math.floor(state.affection)} / {MAX_AFFECTION}</span>
            </div>
          </div>
          
          <div className="clicker-container" style={{ flex: 1, position: 'relative' }}>
            <ClickerArea state={state} />
          </div>

          <div className="action-toggles" style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
            <button 
              className={`action-btn ${state.currentAction === 'cheer' ? 'active' : ''}`}
              onClick={() => {
                setAction('cheer');
                playSound('action');
              }}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'cheer' ? '#ff69b4' : '#f0f0f0', color: state.currentAction === 'cheer' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              📣 응원
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'rest' ? 'active' : ''}`}
              onClick={() => {
                setAction('rest');
                playSound('action');
              }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'rest' ? '#87ceeb' : '#f0f0f0', color: state.currentAction === 'rest' ? 'white' : '#333', cursor: 'pointer' }}
            >
              🛌 휴식
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'train' ? 'active' : ''}`}
              onClick={() => {
                setAction('train');
                playSound('action');
              }}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'train' ? '#9370db' : '#f0f0f0', color: state.currentAction === 'train' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              💪 훈련
            </button>
            <button 
              className={`action-btn ${state.currentAction === 'interact' ? 'active' : ''}`}
              onClick={() => {
                setAction('interact');
                playSound('action');
              }}
              disabled={state.hp <= 0}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: state.currentAction === 'interact' ? '#ff1493' : '#f0f0f0', color: state.currentAction === 'interact' ? 'white' : '#333', cursor: state.hp <= 0 ? 'not-allowed' : 'pointer' }}
            >
              💬 소통
            </button>
          </div>
        </section>

        {/* 오른쪽 패널: 상점과 성장 요소 */}
        <section className="panel store-panel">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'generators' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('generators');
                playSound('action');
              }}
            >
              프로모션
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('upgrades');
                playSound('action');
              }}
            >
              의상
            </button>
            <button 
              className={`tab-btn ${activeTab === 'prestige' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('prestige');
                playSound('action');
              }}
            >
              졸업
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'generators' && (
              <Store 
                state={state} 
                getGeneratorCost={getGeneratorCost} 
                onBuy={buyGenerator} 
                onPlaySound={playSound}
                formatNumber={formatNumber} 
              />
            )}
            
            {activeTab === 'upgrades' && (
              <Upgrades 
                state={state} 
                onBuy={buyUpgrade} 
                onPlaySound={playSound}
                formatNumber={formatNumber} 
              />
            )}

            {activeTab === 'prestige' && (
              <>
              <div className="prestige-container" style={{ padding: '20px', textAlign: 'center', background: 'white', borderRadius: '12px', border: 'var(--border-cute)', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>아이돌 졸업</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>
                  현재 아이돌 활동을 마무리하고 처음부터 다시 시작합니다. 하트, 프로모션, 의상은 모두 초기화됩니다.
                </p>
                <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                  <strong>현재 누적 하트:</strong> {formatNumber(state.totalData)} 💕
                  <br/>
                  <strong>획득 예정 명성:</strong> <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>+{calculatePrestigeEarned()}</span>
                  <br/>
                  <small style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>(누적 하트 100만마다 1 획득)</small>
                </div>
                
                <button 
                  onClick={() => {
                    if (window.confirm("정말 졸업하시겠습니까? 현재 진행 상황이 초기화됩니다.")) {
                      playSound('prestige');
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
                  지금 졸업하기
                </button>
              </div>
              <PrestigeShop 
                state={state} 
                onBuyPerk={buyMetaPerk} 
                onUnlockIdol={unlockIdol} 
                onChangeIdol={prestige} // 아이돌 변경 시 졸업 로직을 함께 사용한다.
                onPlaySound={playSound}
                formatNumber={formatNumber} 
              />
            </>
            )}

            {/* 엔딩 해금 표시 */}
            {endingUnlocked && (
              <div style={{ padding: '20px', textAlign: 'center', background: '#ffe4e1', borderRadius: '12px', border: '2px solid #ff69b4', marginTop: '20px' }}>
                <h2 style={{ color: '#ff1493' }}>💖 특별 엔딩 해금</h2>
                <p>호감도를 최대치까지 채우고 고백에 성공했습니다.</p>
                <button
                  onClick={() => {
                    setActiveTab('ending');
                    playSound('story');
                  }}
                  style={{ padding: '10px 20px', background: '#ff1493', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  엔딩 보기
                </button>
              </div>
            )}
          </div>
        </section>

        {activeTab === 'ending' && endingUnlocked && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <img src="/idol_ending_romance.png" alt="고백 엔딩" style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 0 30px rgba(255, 105, 180, 0.5)' }} />
             <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '12px', width: '80%', maxWidth: '600px', textAlign: 'center' }}>
               <h2 style={{ color: '#ff69b4', marginBottom: '10px' }}>"항상 곁에서 응원해줘서 고마워요..."</h2>
               <p style={{ color: '#333', fontSize: '1.1rem' }}>"여기까지 올 수 있었던 건 전부 당신 덕분이에요. 이제는 무대 위에서만이 아니라, 앞으로도 계속 함께 빛나고 싶어요."</p>
               <button
                 onClick={() => {
                   setActiveTab('generators');
                   playSound('action');
                 }}
                 style={{ marginTop: '20px', padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
               >
                 닫기
               </button>
             </div>
          </div>
        )}

      </main>

      {/* 스토리 이벤트 모달 */}
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
