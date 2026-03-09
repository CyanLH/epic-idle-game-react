import React, { useMemo } from 'react';
import type { GameState } from '../hooks/useGameEngine';

interface ClickerAreaProps {
  state: GameState;
}

export const ClickerArea: React.FC<ClickerAreaProps> = ({ state }) => {

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
        className="clicker-area" 
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative' }}
      >
        <div className="waifu-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', transition: 'all 0.5s' }}>
          {/* Pulsing glow behind the anime girl */}
          <div className="waifu-glow"></div>
          
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
              animation: state.currentAction === 'cheer' ? 'bounce 0.5s infinite alternate' : 'none'
            }}
          />
        </div>
      </div>
    </>
  );
};
