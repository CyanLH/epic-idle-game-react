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
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex justify-between items-center p-4 bg-white/85 shadow-sm border-b-2 border-primary/20 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1 tracking-tight drop-shadow-sm font-['Fredoka']">✨ 아이돌 육성 클리커 ✨</h1>
          <div className="text-sm font-semibold text-gray-700">
             누적 하트: {formatNumber(state.totalData)} 💕
          </div>
          {state.prestigeLevel > 0 && (
            <div className="text-xs font-bold text-primary mt-1">
              졸업 단계: {state.prestigeLevel} | 추가 보너스: +{(state.prestigeCurrency * 10).toFixed(0)}%
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            className={`px-4 py-2 rounded-full font-bold transition-all shadow-sm ${soundEnabled ? 'bg-primary text-white hover:-translate-y-0.5' : 'bg-gray-200 text-gray-500'}`} 
            onClick={handleSoundToggle}
          >
            {soundEnabled ? '🔊 효과음 켜짐' : '🔈 효과음 꺼짐'}
          </button>
          <UserMenu />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4 max-w-7xl mx-auto w-full">
        
        {/* 왼쪽 패널: 메인 플레이 영역 */}
        <section className="flex-1 min-w-[300px] flex flex-col bg-white/85 rounded-2xl p-5 shadow-sm border-2 border-pink-200 overflow-y-auto relative">
          <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-pink-100 mb-2">
            <span className="block text-sm font-bold text-primary tracking-widest mb-1">보유 하트</span>
            <span className="text-4xl font-extrabold text-gray-800 drop-shadow-sm">{formatNumber(state.data)}</span>
            <span className="text-2xl ml-1">💕</span>
          </div>
          <div className="text-center text-sm font-semibold text-secondary mb-4 bg-purple-50 rounded-lg py-1">
            <span>{formatNumber(stats.incomePerSec)}</span> 하트/초
          </div>

          <div className="flex flex-col gap-2 p-3 bg-white/80 rounded-xl mt-2 mb-4 shadow-sm border border-pink-50">
            <div className="flex justify-between items-center text-sm">
              <strong className="text-primary w-12">체력:</strong>
              <div className="flex-1 mx-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-200 ${state.hp < 20 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100))}%` }}></div>
              </div>
              <span className="w-14 text-right font-semibold text-gray-700">{Math.floor(state.hp)}/{state.maxHp}</span>
            </div>
            
            {/* 피버 게이지 */}
            <div className="flex justify-between items-center text-sm">
              <strong className={`w-12 text-orange-500 ${state.feverTimeLeft > 0 ? 'animate-pulse' : ''}`}>🔥 피버:</strong>
              <div className={`flex-1 mx-3 h-3 bg-gray-200 rounded-full overflow-hidden ${state.feverTimeLeft > 0 ? 'border border-yellow-400' : ''}`}>
                 <div className="h-full transition-all duration-200" 
                      style={{ 
                        width: `${state.feverTimeLeft > 0 ? (state.feverTimeLeft / 10) * 100 : state.feverGauge}%`, 
                        background: state.feverTimeLeft > 0 ? 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' : '#ff4500', 
                        backgroundSize: state.feverTimeLeft > 0 ? '200% 200%' : 'auto',
                      }}></div>
              </div>
              <span className={`w-14 text-right font-semibold ${state.feverTimeLeft > 0 ? 'text-orange-500 font-bold' : 'text-gray-700'}`}>
                {state.feverTimeLeft > 0 ? `${state.feverTimeLeft.toFixed(1)}s` : `${Math.floor(state.feverGauge)}%`}
              </span>
            </div>

            <div className="flex justify-between text-sm px-1">
              <span className="text-purple-600 font-bold">✨ 매력:</span>
              <span className="font-semibold text-gray-700">{Math.floor(state.charm)} (x{stats.charmMult.toFixed(2)})</span>
            </div>
            <div className="flex justify-between text-sm px-1">
              <span className="text-pink-600 font-bold">💖 호감도:</span>
              <span className="font-semibold text-gray-700">{Math.floor(state.affection)} / {MAX_AFFECTION}</span>
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center min-h-[250px] my-2">
            <ClickerArea state={state} />
          </div>

          <div className="flex gap-2 mt-4 justify-center">
            <button 
              className={`flex-1 py-3 px-2 text-sm md:text-base font-bold rounded-xl transition-all shadow-sm ${state.currentAction === 'cheer' ? 'bg-pink-500 text-white scale-105 shadow-pink-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${state.hp <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { setAction('cheer'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              📣 응원
            </button>
            <button 
              className={`flex-1 py-3 px-2 text-sm md:text-base font-bold rounded-xl transition-all shadow-sm ${state.currentAction === 'rest' ? 'bg-blue-400 text-white scale-105 shadow-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => { setAction('rest'); playSound('action'); }}
            >
              🛌 휴식
            </button>
            <button 
              className={`flex-1 py-3 px-2 text-sm md:text-base font-bold rounded-xl transition-all shadow-sm ${state.currentAction === 'train' ? 'bg-purple-500 text-white scale-105 shadow-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${state.hp <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { setAction('train'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              💪 훈련
            </button>
            <button 
              className={`flex-1 py-3 px-2 text-sm md:text-base font-bold rounded-xl transition-all shadow-sm ${state.currentAction === 'interact' ? 'bg-rose-500 text-white scale-105 shadow-rose-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${state.hp <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => { setAction('interact'); playSound('action'); }}
              disabled={state.hp <= 0}
            >
              💬 소통
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
