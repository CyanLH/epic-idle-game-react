import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { GameState } from '../hooks/useGameEngine';

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
    // 1. Endings / Branches
    // If Affection is super high and they bought the final ending upgrade (placeholder logic for now)
    if (state.affection >= 1000) {
      if (state.upgrades.includes('upg_romance')) {
        return '/idol_ending_romance.png';
      }
    }

    // 2. Evolution Branches (e.g. at 50 Charm or 1M total hearts)
    if (state.totalData > 1000000 || state.charm > 50) {
      // Determine branch based on upgrades or a hidden stat ratio. For now, let's use Charm > 100 for cute, else cool?
      // Actually, if we just have two, let's make it random based on ID or let them buy a class change upgrade.
      // We will default to Cute for High Charm, Cool for High Affection just as a demonstration
      if (state.charm > state.affection) {
        return '/idol_branch_cute.png';
      } else {
         return '/idol_branch_cool.png';
      }
    }

    // 3. Base States depending on currentAction and HP
    if (state.hp < 20 && state.hp > 0) {
      return '/idol_base_tired.png'; // Sweating, tired
    }
    
    switch (state.currentAction) {
      case 'rest':
        return '/idol_base_sleeping.png';
      case 'train':
        return '/idol_base_training.png';
      case 'cheer':
        // If HP is high and doing cheer, be happy
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
        className={`clicker-area ${state.feverTimeLeft > 0 ? 'fever-shake' : ''}`} 
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative' }}
      >
        <div className="waifu-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', transition: 'all 0.5s' }}>
          {/* Pulsing glow behind the anime girl */}
          <div className={`waifu-glow ${state.feverTimeLeft > 0 ? 'fever-glow' : ''}`}></div>
          
          <img 
            src={determineSprite} 
            alt="Anime Waifu" 
            className="waifu-image" 
            draggable="false"
            style={{ 
              maxHeight: '100%', 
              maxWidth: '100%', 
              objectFit: 'contain',
              // Add a subtle bounce if cheering
              animation: state.currentAction === 'cheer' || state.feverTimeLeft > 0 ? 'bounce 0.5s infinite alternate' : 'none'
            }}
          />

          {/* Particles */}
          {particles.map(p => (
            <div 
              key={p.id}
              className="floating-heart-text"
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
