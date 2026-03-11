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
import { UserMenu } from './components/UserMenu';

import { Id } from '../convex/_generated/dataModel';

interface AppProps {
  convexUserId?: Id<"users">;
  initialServerData?: any;
}

function App({ convexUserId, initialServerData }: AppProps) {
  const { state, stats, setAction, getGeneratorCost, buyGenerator, buyUpgrade, calculatePrestigeEarned, prestige, handleStoryChoice, buyMetaPerk, unlockIdol } = useGameEngine(convexUserId, initialServerData);
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
    <div className="relative flex flex-col h-screen overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gameBg bg-blend-overlay">
      {/* Background visual layers for stage effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-pink-800 to-indigo-900 opacity-80 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '1s'}} />

      {/* Floating HUD Container */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start p-4 pointer-events-none">
        
        {/* Left HUD: Title & Level */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-gamePanel/80 backdrop-blur-md px-6 py-3 rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-2 border-pink-400/50 flex flex-col items-start transform transition-transform hover:scale-105">
            <h1 className="text-xl md:text-2xl font-bold text-pink-500 tracking-wider drop-shadow-sm font-fredoka uppercase">
              오시 클리커
            </h1>
            {state.prestigeLevel > 0 && (
              <div className="text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full mt-1 shadow-inner">
                Lv. {state.prestigeLevel} <span className="opacity-80">| Bonus +{(state.prestigeCurrency * 10).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right HUD: Resources & Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-gamePanel/80 backdrop-blur-md h-12 flex items-center px-4 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-2 border-pink-400/50 gap-2">
            <span className="text-2xl animate-bounce">💕</span>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold text-pink-500 leading-none">하트</span>
              <span className="text-lg font-extrabold text-gray-800 leading-none">{formatNumber(state.data)}</span>
            </div>
            <div className="h-full w-px bg-pink-200 mx-2" />
            <span className="text-xs font-bold text-gray-500">{formatNumber(stats.incomePerSec)}/s</span>
          </div>

          <button 
            className={`w-12 h-12 flex items-center justify-center rounded-full font-bold shadow-3d-btn transition-all hover:-translate-y-1 active:shadow-3d-btn-pressed active:translate-y-1 border-2 ${soundEnabled ? 'bg-primary border-pink-400 text-white' : 'bg-gray-300 border-gray-400 text-gray-600'}`} 
            onClick={handleSoundToggle}
            title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
          >
            <span className="text-xl">{soundEnabled ? '🔊' : '🔈'}</span>
          </button>
          
          <div className="shadow-lg rounded-full">
            <UserMenu />
          </div>
        </div>
      </div>

      <main className="relative z-10 flex flex-1 overflow-hidden p-4 pt-24 gap-4 max-w-7xl mx-auto w-full">
        <section className="flex-1 min-w-[300px] flex flex-col bg-white/85 rounded-2xl p-5 shadow-sm border-2 border-pink-200 overflow-y-auto relative">
          {/* Removed old text-center data layout since it's now in the HUD */}

          <div className="flex flex-col gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl mb-4 shadow-inner border-2 border-white/60">
            {/* HP Bar */}
            <div className="flex justify-between items-center text-sm mb-1 group">
              <strong className="text-pink-600 font-extrabold w-12 drop-shadow-sm flex items-center gap-1">
                <span>HP</span>
              </strong>
              <div className="flex-1 mx-3 h-5 bg-gray-900/10 rounded-full overflow-hidden border-2 border-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 to-transparent mix-blend-overlay w-full z-10"></div>
                 <div className={`h-full transition-all duration-300 relative ${state.hp < 20 ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]'}`} style={{ width: `${Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))}%` }}>
                   <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/40 blur-[2px]" />
                 </div>
              </div>
              <span className="w-14 text-right font-black text-pink-700 drop-shadow-sm">{Math.floor(state.hp)}<span className="text-xs text-pink-400">/{state.maxHp}</span></span>
            </div>
            
            {/* 피버 게이지 */}
            <div className="flex justify-between items-center text-sm mb-1 group">
              <strong className={`w-12 flex items-center gap-1 font-extrabold drop-shadow-sm ${state.feverTimeLeft > 0 ? 'text-orange-500 animate-pulse' : 'text-orange-400'}`}>
                <span>FP</span>
              </strong>
              <div className={`flex-1 mx-3 h-5 bg-gray-900/10 rounded-full overflow-hidden border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative ${state.feverTimeLeft > 0 ? 'border-yellow-300 shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'border-white/50'}`}>
                 <div className="h-full transition-all duration-300 relative" 
                      style={{ 
                        width: `${state.feverTimeLeft > 0 ? (state.feverTimeLeft / 10) * 100 : state.feverGauge}%`, 
                        background: state.feverTimeLeft > 0 ? 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : 'linear-gradient(90deg, #ff7f00, #ff4500)', 
                        backgroundSize: state.feverTimeLeft > 0 ? '200% 200%' : 'auto',
                      }}>
                   <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[1px]" />
                 </div>
              </div>
              <span className={`w-14 text-right font-black drop-shadow-sm ${state.feverTimeLeft > 0 ? 'text-orange-500 animate-pulse' : 'text-orange-600'}`}>
                {state.feverTimeLeft > 0 ? `${state.feverTimeLeft.toFixed(1)}s` : `${Math.floor(state.feverGauge)}%`}
              </span>
            </div>

            <div className="flex gap-4 px-2 mt-1 border-t-2 border-dashed border-pink-200 pt-2">
              <div className="flex-1 flex justify-between text-sm bg-purple-100/50 px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm items-center">
                <span className="text-purple-600 font-extrabold flex items-center gap-1">✨ <span className="text-[10px] uppercase tracking-wider">Charm</span></span>
                <span className="font-extrabold text-purple-900">{Math.floor(state.charm)} <span className="text-xs text-purple-400 font-bold ml-1">x{stats.charmMult.toFixed(2)}</span></span>
              </div>
              <div className="flex-1 flex justify-between text-sm bg-rose-100/50 px-3 py-1.5 rounded-xl border border-rose-200 shadow-sm items-center">
                <span className="text-rose-600 font-extrabold flex items-center gap-1">💖 <span className="text-[10px] uppercase tracking-wider">Love</span></span>
                <span className="font-extrabold text-rose-900">{Math.floor(state.affection)} <span className="text-xs text-rose-400 font-bold ml-1">/{MAX_AFFECTION}</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center min-h-[250px] my-2">
            <ClickerArea state={state} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 justify-center">
            <button 
              className={`py-4 px-2 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-3d-btn hover:-translate-y-1 hover:brightness-110 active:shadow-3d-btn-pressed active:translate-y-1 ${state.currentAction === 'cheer' ? 'bg-gradient-to-t from-pink-600 to-pink-400 text-white border-2 border-pink-300 ring-2 ring-pink-500/50' : 'bg-white border-2 border-pink-200 text-pink-600'} ${state.hp <= 0 ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
              onClick={() => { setAction('cheer'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              <div className="text-xl mb-1 drop-shadow-sm">📣</div>
              라이브 응원
            </button>
            <button 
              className={`py-4 px-2 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-3d-btn hover:-translate-y-1 hover:brightness-110 active:shadow-3d-btn-pressed active:translate-y-1 ${state.currentAction === 'rest' ? 'bg-gradient-to-t from-blue-500 to-blue-300 text-white border-2 border-blue-200 ring-2 ring-blue-400/50' : 'bg-white border-2 border-blue-200 text-blue-600'}`}
              onClick={() => { setAction('rest'); playSound('action'); }}
            >
              <div className="text-xl mb-1 drop-shadow-sm">🛌</div>
              휴식하기
            </button>
            <button 
              className={`py-4 px-2 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-3d-btn hover:-translate-y-1 hover:brightness-110 active:shadow-3d-btn-pressed active:translate-y-1 ${state.currentAction === 'train' ? 'bg-gradient-to-t from-purple-600 to-purple-400 text-white border-2 border-purple-300 ring-2 ring-purple-500/50' : 'bg-white border-2 border-purple-200 text-purple-600'} ${state.hp <= 0 ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
              onClick={() => { setAction('train'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              <div className="text-xl mb-1 drop-shadow-sm">💪</div>
              보컬 훈련
            </button>
            <button 
              className={`py-4 px-2 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-3d-btn hover:-translate-y-1 hover:brightness-110 active:shadow-3d-btn-pressed active:translate-y-1 ${state.currentAction === 'interact' ? 'bg-gradient-to-t from-rose-500 to-rose-400 text-white border-2 border-rose-300 ring-2 ring-rose-500/50' : 'bg-white border-2 border-rose-200 text-rose-600'} ${state.hp <= 0 ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
              onClick={() => { setAction('interact'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              <div className="text-xl mb-1 drop-shadow-sm">💬</div>
              커뮤니케이션
            </button>
          </div>
        </section>

        {/* 오른쪽 패널: 상점과 성장 요소 */}
        <section className="flex-[1.2] min-w-[320px] flex flex-col bg-white/85 rounded-2xl shadow-sm border-2 border-pink-200 overflow-hidden">
          <div className="flex bg-white/50 border-b-2 border-pink-100">
            <button 
              className={`flex-1 py-3 px-2 font-bold text-sm md:text-base border-b-4 transition-colors ${activeTab === 'generators' ? 'border-primary text-primary bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('generators'); playSound('action'); }}
            >
              프로모션
            </button>
            <button 
              className={`flex-1 py-3 px-2 font-bold text-sm md:text-base border-b-4 transition-colors ${activeTab === 'upgrades' ? 'border-primary text-primary bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('upgrades'); playSound('action'); }}
            >
              의상
            </button>
            <button 
              className={`flex-1 py-3 px-2 font-bold text-sm md:text-base border-b-4 transition-colors ${activeTab === 'prestige' ? 'border-primary text-primary bg-pink-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => { setActiveTab('prestige'); playSound('action'); }}
            >
              졸업
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
              <div className="flex flex-col gap-4">
                <div className="bg-white p-5 rounded-xl border-2 border-pink-200 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-primary mb-2">아이돌 졸업</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    현재 아이돌 활동을 마무리하고 처음부터 다시 시작합니다. 하트, 프로모션, 의상은 모두 초기화됩니다.
                  </p>
                  <div className="mb-4 text-base text-gray-700 space-y-1">
                    <div><strong>현재 누적 하트:</strong> {formatNumber(state.totalData)} 💕</div>
                    <div><strong>획득 예정 명성:</strong> <span className="text-secondary font-bold">+{calculatePrestigeEarned()}</span></div>
                    <div className="text-xs text-gray-400">(누적 하트 100만마다 1 획득)</div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (window.confirm("정말 졸업하시겠습니까? 현재 진행 상황이 초기화됩니다.")) {
                        playSound('prestige');
                        prestige();
                      }
                    }}
                    disabled={calculatePrestigeEarned() <= 0}
                    className={`w-full py-3 px-6 text-lg font-bold text-white rounded-xl transition-all ${calculatePrestigeEarned() > 0 ? 'bg-primary shadow-md hover:bg-pink-500 hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}`}
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
            </div>
            )}

            {/* 엔딩 해금 표시 */}
            {endingUnlocked && (
              <div className="mt-4 p-5 text-center bg-pink-50 rounded-xl border-2 border-primary shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-2">💖 특별 엔딩 해금</h2>
                <p className="text-sm text-gray-700 mb-4">호감도를 최대치까지 채우고 고백에 성공했습니다.</p>
                <button
                  onClick={() => { setActiveTab('ending'); playSound('story'); }}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-pink-500 transition-colors"
                >
                  엔딩 보기
                </button>
              </div>
            )}
          </div>
        </section>

        {activeTab === 'ending' && endingUnlocked && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm p-4">
             <img src="/idol_ending_romance.png" alt="고백 엔딩" className="max-w-full md:max-w-2xl max-h-[70vh] object-contain rounded-2xl shadow-[0_0_40px_rgba(255,105,180,0.4)]" />
             <div className="mt-6 bg-white p-6 rounded-2xl w-full max-w-2xl text-center shadow-xl">
               <h2 className="text-xl md:text-2xl font-bold text-primary mb-3">"항상 곁에서 응원해줘서 고마워요..."</h2>
               <p className="text-gray-700 text-sm md:text-base leading-relaxed">"여기까지 올 수 있었던 건 전부 당신 덕분이에요. 이제는 무대 위에서만이 아니라, 앞으로도 계속 함께 빛나고 싶어요."</p>
               <button
                 onClick={() => { setActiveTab('generators'); playSound('action'); }}
                 className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
               >
                 돌아가기
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
