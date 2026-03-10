import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { GameState } from '../hooks/useGameEngine';
import { MAX_AFFECTION } from '../config/balance';

interface ClickerAreaProps {
  state: GameState;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  text: string;
  rotation: number;
}

export const ClickerArea: React.FC<ClickerAreaProps> = ({ state }) => {

  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    let interval: number;
    const isFever = state.feverTimeLeft > 0;
    const isActive = state.currentAction === 'cheer' || state.currentAction === 'train' || state.currentAction === 'interact';
    
    if (isActive || isFever) {
      const spawnRate = isFever ? 100 : 800; // spawn every 100ms in fever, 800ms normally
      interval = window.setInterval(() => {
        const id = particleIdCounter.current++;
        const x = 10 + Math.random() * 80; // 10% to 90% width
        const y = 20 + Math.random() * 60; // 20% to 80% height
        const emojis = ['💖', '✨', '🎵', '⭐', '💕', '🔥'];
        const text = emojis[Math.floor(Math.random() * emojis.length)];
        const rotation = Math.random() * 60 - 30;
        
        setParticles(p => [...p, { id, x, y, text, rotation }]);
        
        // Auto remove
        setTimeout(() => {
          setParticles(p => p.filter(particle => particle.id !== id));
        }, 1000);
      }, spawnRate);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.currentAction, state.feverTimeLeft]);

  const determineSprite = useMemo(() => {
    // 1. 엔딩과 분기 우선 처리
    // 호감도가 최대치이고 최종 업그레이드를 구매했다면 엔딩 스프라이트를 보여준다.
    if (state.affection >= MAX_AFFECTION) {
      if (state.upgrades.includes('upg_romance')) {
        return '/idol_ending_romance.png';
      }
    }

    // 2. 진화 분기 처리
    if (state.totalData > 1000000 || state.charm > 50) {
      // 현재는 매력 우세면 큐트, 호감도 우세면 쿨 분기로 단순 처리한다.
      if (state.charm > state.affection) {
        return '/idol_branch_cute.png';
      } else {
         return '/idol_branch_cool.png';
      }
    }

    // 3. 기본 상태
    if (state.hp < 20 && state.hp > 0) {
      return '/idol_base_tired.png'; // 피곤한 상태
    }
    
    switch (state.currentAction) {
      case 'rest':
        return '/idol_base_sleeping.png';
      case 'train':
        return '/idol_base_training.png';
      case 'cheer':
        // 체력이 충분할 때 응원 중이면 더 밝은 표정을 사용한다.
        return state.hp > 50 ? '/idol_base_happy.png' : '/idol_base_normal.png';
      case 'interact':
         return '/idol_base_happy.png';
      case 'idle':
      default:
        return '/idol_base_normal.png';
    }
  }, [state.currentAction, state.hp, state.charm, state.affection, state.totalData, state.upgrades]);

  return (
    <>
      <div 
        className={`w-full h-full flex justify-center items-center relative ${state.feverTimeLeft > 0 ? 'animate-[feverShake_0.5s_infinite]' : ''}`}
      >
        <div className="w-full h-full flex justify-center items-end transition-all duration-500">
          {/* Pulsing glow behind the anime girl */}
          <div className={`absolute w-4/5 h-4/5 bg-pink-300/30 rounded-full blur-3xl -z-10 ${state.feverTimeLeft > 0 ? 'bg-orange-400/50 animate-pulse' : ''}`}></div>
          
          <img 
            src={determineSprite} 
            alt="아이돌 캐릭터" 
            className="waifu-image" 
            draggable="false"
            style={{ 
              maxHeight: '100%', 
              maxWidth: '100%', 
              objectFit: 'contain',
              // 응원이나 피버 상태에서는 살짝 튀는 모션을 준다.
              animation: state.currentAction === 'cheer' || state.feverTimeLeft > 0 ? 'bounce 0.5s infinite alternate' : 'none'
            }}
          />

          {/* Particles */}
          {particles.map(p => (
            <div 
              key={p.id}
              className="absolute pointer-events-none drop-shadow-md select-none animate-[floatUp_1s_ease-out_forwards]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: state.feverTimeLeft > 0 ? '3rem' : '1.5rem',
                transform: `rotate(${p.rotation}deg)`,
                zIndex: 100
              }}
            >
              {p.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
