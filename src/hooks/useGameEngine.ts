import { useState, useEffect, useCallback, useRef } from 'react';
import { GENERATORS_DATA, UPGRADES_DATA } from '../config/gameData';
import { STORY_EVENTS } from '../config/storyData';
import { IDOL_CANDIDATES, META_PERKS } from '../config/prestigeData';

const SAVE_KEY = 'anime_idle_save';

export interface GameState {
  data: number;
  totalData: number;
  generators: Record<string, number>;
  upgrades: string[];
  lastSavedTime: number | null;
  prestigeLevel: number;
  prestigeCurrency: number;
  
  // Phase 2 New Stats
  hp: number;
  maxHp: number;
  charm: number;
  affection: number;
  currentAction: 'idle' | 'cheer' | 'rest' | 'train' | 'interact';
  
  // Game Feel Stats
  feverGauge: number;
  feverTimeLeft: number;

  // Story Events
  seenEvents: string[];
  activeEvent: string | null;

  // Prestige & Meta Progression
  unlockedIdols: string[];
  currentIdolId: string;
  metaPerks: Record<string, number>; // perkId -> level
}

export const useGameEngine = () => {
  const [state, setState] = useState<GameState>({
    data: 0,
    totalData: 0,
    generators: {},
    upgrades: [],
    lastSavedTime: null,
    prestigeLevel: 0,
    prestigeCurrency: 0,
    hp: 100,
    maxHp: 100,
    charm: 0,
    affection: 0,
    currentAction: 'idle',
    feverGauge: 0,
    feverTimeLeft: 0,
    seenEvents: [],
    activeEvent: null,
    unlockedIdols: ['idol_default'],
    currentIdolId: 'idol_default',
    metaPerks: {},
  });

  const lastTickTime = useRef(performance.now());
  const reqId = useRef<number | null>(null);

  // Load from LocalStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        let loadedState: GameState = {
          data: 0,
          totalData: 0,
          generators: {},
          upgrades: [],
          lastSavedTime: null,
          prestigeLevel: 0,
          prestigeCurrency: 0,
          hp: 100,
          maxHp: 100,
          charm: 0,
          affection: 0,
          currentAction: 'idle',
          feverGauge: 0,
          feverTimeLeft: 0,
          seenEvents: [],
          activeEvent: null,
          unlockedIdols: ['idol_default'],
          currentIdolId: 'idol_default',
          metaPerks: {},
          ...parsed
        };

        // Offline earnings
        if (loadedState.lastSavedTime) {
          const offlineSeconds = (Date.now() - loadedState.lastSavedTime) / 1000;
          if (offlineSeconds > 60) {
            const tempStats = calculateStats(loadedState);
            if (tempStats.incomePerSec > 0) {
              const earned = tempStats.incomePerSec * offlineSeconds;
              loadedState.data += earned;
              loadedState.totalData += earned;
              console.log(`Offline for ${offlineSeconds.toFixed(0)}s. Earned ${earned.toFixed(0)} Hearts.`);
            }
          }
        }
        setState(loadedState);
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }, []); // Run once

  // Save to LocalStorage periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setState(current => {
        const newState = { ...current, lastSavedTime: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
        return newState;
      });
    }, 5000);
    return () => clearInterval(saveInterval);
  }, []);

  const calculateStats = useCallback((currentState: GameState) => {
    let clickPower = 1;
    let baseIncome = 0;

    // Base prestige multiplier: each prestige currency gives +10% bonus
    let prestigeMult = 1 + (currentState.prestigeCurrency * 0.1);
    
    // Check Meta Perk: perk_passive_boost
    const passiveBoostLevel = currentState.metaPerks['perk_passive_boost'] || 0;
    if (passiveBoostLevel > 0) {
       const boostPerk = META_PERKS.find(p => p.id === 'perk_passive_boost');
       if (boostPerk) {
         prestigeMult += (passiveBoostLevel * boostPerk.effectPerLevel);
       }
    }

    // Charm acts as a multiplier: Every 10 charm adds +5% income
    const charmMult = 1 + (currentState.charm * 0.005);
    
    // Fever mode gives x5 to everything
    const feverMult = currentState.feverTimeLeft > 0 ? 5 : 1;
    
    let finalMult = prestigeMult * charmMult * feverMult;

    // Check Current Idol Bonuses
    const currentIdol = IDOL_CANDIDATES.find(i => i.id === currentState.currentIdolId);
    let idolIncomeSubMult = 1;
    let idolCharmSubMult = 1;
    let idolAffectionSubMult = 1;

    if (currentIdol && currentIdol.passiveBonusValue > 0) {
      if (currentIdol.passiveBonusType === 'income') idolIncomeSubMult = currentIdol.passiveBonusValue;
      if (currentIdol.passiveBonusType === 'charm') idolCharmSubMult = currentIdol.passiveBonusValue;
      if (currentIdol.passiveBonusType === 'affection') idolAffectionSubMult = currentIdol.passiveBonusValue;
    }

    UPGRADES_DATA.forEach(upg => {
      if (currentState.upgrades.includes(upg.id) && upg.type === 'click') {
        clickPower *= upg.multiplier;
      }
    });

    GENERATORS_DATA.forEach(gen => {
      const count = currentState.generators[gen.id] || 0;
      if (count > 0) {
        let genPower = gen.baseIncome;
        UPGRADES_DATA.forEach(upg => {
           if (currentState.upgrades.includes(upg.id) && upg.type === 'generator' && upg.targetGenId === gen.id) {
               genPower *= upg.multiplier;
           }
        });
        baseIncome += (genPower * count);
      }
    });

    return { 
      clickPower: clickPower * finalMult * idolIncomeSubMult, 
      incomePerSec: baseIncome * finalMult * idolIncomeSubMult,
      prestigeMult,
      charmMult,
      finalMult,
      idolCharmSubMult,
      idolAffectionSubMult
    };
  }, []);

  const stats = calculateStats(state);

  // The Game Loop
  const gameLoop = useCallback((timeNow: number) => {
    const delta = (timeNow - lastTickTime.current) / 1000;
    lastTickTime.current = timeNow;

    setState(current => {
      const currentStats = calculateStats(current);
      
      let newHp = current.hp;
      let newCharm = current.charm;
      let newAffection = current.affection;
      let newData = current.data;
      let newTotalData = current.totalData;
      let currentAction = current.currentAction;
      let newFeverGauge = current.feverGauge;
      let newFeverTimeLeft = current.feverTimeLeft;

      // Handle Fever State
      if (newFeverTimeLeft > 0) {
        newFeverTimeLeft -= delta;
        if (newFeverTimeLeft <= 0) {
          newFeverTimeLeft = 0;
        }
      } else if (currentAction !== 'idle' && currentAction !== 'rest') {
        // Build fever gauge during active actions (approx 30 seconds to fill)
        newFeverGauge += 3.33 * delta;
        if (newFeverGauge >= 100) {
          newFeverGauge = 0;
          // Apply fever duration meta perk
          let baseDuration = 10;
          const feverPerkLevel = current.metaPerks['perk_fever_duration'] || 0;
          if (feverPerkLevel > 0) {
             const feverPerk = META_PERKS.find(p => p.id === 'perk_fever_duration');
             baseDuration += feverPerk ? feverPerkLevel * feverPerk.effectPerLevel : 0;
          }
          newFeverTimeLeft = baseDuration; 
        }
      }

      // Handle HP Drain and Regen
      if (currentAction === 'cheer') {
        newHp -= 5 * delta; // Cheer costs 5 HP/s
        // Cheer gives a base rate based on click power, plus generator income
        const cheerIncome = (currentStats.clickPower * 5) + currentStats.incomePerSec;
        newData += cheerIncome * delta;
        newTotalData += cheerIncome * delta;
      } else if (currentAction === 'rest') {
        newHp += 15 * delta; // Rest regens 15 HP/s
      } else if (currentAction === 'train') {
        newHp -= 8 * delta; // Train costs 8 HP/s
        // Train gives base charm based on clickPower
        const trainGain = ((currentStats.clickPower * 0.8) + (currentStats.incomePerSec * 0.01)) * currentStats.idolCharmSubMult;
        newCharm += trainGain * delta; 
      } else if (currentAction === 'interact') {
        newHp -= 3 * delta; // Interact costs 3 HP/s
        // Interact gives base affection based on clickPower
        const interactGain = ((currentStats.clickPower * 0.5) + (currentStats.incomePerSec * 0.005)) * currentStats.idolAffectionSubMult;
        newAffection += interactGain * delta;
      }

      // Constrain HP
      if (newHp > current.maxHp) newHp = current.maxHp;
      if (newHp <= 0) {
        newHp = 0;
        currentAction = 'rest'; // Forced rest
      }

      // Check Story Events Trigger
      let newActiveEvent = current.activeEvent;
      if (!newActiveEvent) {
        for (const evt of STORY_EVENTS) {
          if (newAffection >= evt.triggerAffection && !current.seenEvents.includes(evt.id)) {
            newActiveEvent = evt.id;
            break; // Triggers only one event at a time
          }
        }
      }

      // Only update state if something changed to prevent unnecessary renders, though requestAnimationFrame will trigger a lot anyway
      return {
        ...current,
        hp: newHp,
        charm: newCharm,
        affection: newAffection,
        data: newData,
        totalData: newTotalData,
        currentAction,
        feverGauge: newFeverGauge,
        feverTimeLeft: newFeverTimeLeft,
        activeEvent: newActiveEvent
      };
    });

    reqId.current = requestAnimationFrame(gameLoop);
  }, [calculateStats]);

  useEffect(() => {
    reqId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (reqId.current) cancelAnimationFrame(reqId.current);
    };
  }, [gameLoop]);

  const setAction = useCallback((action: GameState['currentAction']) => {
    setState(current => ({ ...current, currentAction: action }));
  }, []);

  // Removed old click entirely, replacing with the setAction.
  // Kept a mock click for backwards compatibility with any remaining effects if needed, but it does nothing to data now.
  const click = useCallback(() => {
    // Left empty or we can remove it entirely. The new UI will use setAction.
    return stats.clickPower;
  }, [stats.clickPower]);

  const getGeneratorCost = useCallback((genId: string) => {
    const gen = GENERATORS_DATA.find(g => g.id === genId);
    if (!gen) return 0;
    const count = state.generators[genId] || 0;
    return Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, count));
  }, [state.generators]);

  const buyGenerator = useCallback((genId: string) => {
    setState(current => {
      // Need to recalculate cost based on current state, not potentially stale state
      const gen = GENERATORS_DATA.find(g => g.id === genId);
      if (!gen) return current;
      
      const count = current.generators[genId] || 0;
      const cost = Math.floor(gen.baseCost * Math.pow(gen.costMultiplier, count));
      
      if (current.data >= cost) {
        return {
          ...current,
          data: current.data - cost,
          generators: {
            ...current.generators,
            [genId]: count + 1
          }
        };
      }
      return current;
    });
  }, []);

  const buyUpgrade = useCallback((upgId: string) => {
    const upgrade = UPGRADES_DATA.find(u => u.id === upgId);
    if (!upgrade) return;

    setState(current => {
      if (current.data >= upgrade.cost && !current.upgrades.includes(upgId)) {
        return {
          ...current,
          data: current.data - upgrade.cost,
          upgrades: [...current.upgrades, upgId]
        };
      }
      return current;
    });
  }, []);

  const calculatePrestigeEarned = useCallback(() => {
    // 1 prestige currency per 1,000,000 Total Hearts Ever
    return Math.floor(state.totalData / 1000000);
  }, [state.totalData]);

  const prestige = useCallback((newIdolId?: string) => {
    const earned = calculatePrestigeEarned();
    // Allow zero earning if just changing idol without required hearts
    
    setState(current => {
      // Apply start funds meta perk
      let startingData = 0;
      const startFundsLevel = current.metaPerks['perk_start_funds'] || 0;
      if (startFundsLevel > 0) {
        const startPerk = META_PERKS.find(p => p.id === 'perk_start_funds');
        startingData = startPerk ? startFundsLevel * startPerk.effectPerLevel : 0;
      }

      return {
        ...current, // Keep prestige currency, meta perks, and unlocked idols
        data: startingData,
        totalData: startingData,
        generators: {},
        upgrades: [],
        lastSavedTime: Date.now(),
        prestigeLevel: current.prestigeLevel + 1,
        prestigeCurrency: current.prestigeCurrency + earned,
        hp: 100,
        maxHp: 100,
        charm: 0,
        affection: 0,
        currentAction: 'idle',
        feverGauge: 0,
        feverTimeLeft: 0,
        seenEvents: [],
        activeEvent: null,
        currentIdolId: newIdolId || current.currentIdolId
      }
    });
  }, [calculatePrestigeEarned]);

  const handleStoryChoice = useCallback((eventId: string, charmReward: number, affectionReward: number, hpCost: number) => {
    setState(current => ({
      ...current,
      charm: current.charm + charmReward,
      affection: current.affection + affectionReward,
      hp: Math.min(current.maxHp, current.hp - hpCost), // If negative cost, it heals
      seenEvents: [...current.seenEvents, eventId],
      activeEvent: null
    }));
  }, []);

  const buyMetaPerk = useCallback((perkId: string) => {
    const perk = META_PERKS.find(p => p.id === perkId);
    if (!perk) return;

    setState(current => {
      const currentLevel = current.metaPerks[perkId] || 0;
      if (currentLevel >= perk.maxLevel) return current;

      const cost = Math.floor(perk.baseCost * Math.pow(perk.costMultiplier, currentLevel));
      if (current.prestigeCurrency >= cost) {
        return {
          ...current,
          prestigeCurrency: current.prestigeCurrency - cost,
          metaPerks: {
            ...current.metaPerks,
            [perkId]: currentLevel + 1
          }
        };
      }
      return current;
    });
  }, []);

  const unlockIdol = useCallback((idolId: string) => {
    const idol = IDOL_CANDIDATES.find(i => i.id === idolId);
    if (!idol) return;

    setState(current => {
      if (current.unlockedIdols.includes(idolId)) return current;
      
      if (current.prestigeCurrency >= idol.unlockCost) {
        return {
          ...current,
          prestigeCurrency: current.prestigeCurrency - idol.unlockCost,
          unlockedIdols: [...current.unlockedIdols, idolId]
        };
      }
      return current;
    });
  }, []);

  return {
    state,
    stats,
    click,
    setAction,
    getGeneratorCost,
    buyGenerator,
    buyUpgrade,
    calculatePrestigeEarned,
    prestige,
    handleStoryChoice,
    buyMetaPerk,
    unlockIdol,
  };
};
