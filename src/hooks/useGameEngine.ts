import { useState, useEffect, useCallback, useRef } from 'react';
import { GENERATORS_DATA, UPGRADES_DATA } from '../config/gameData';
import { STORY_EVENTS } from '../config/storyData';
import { IDOL_CANDIDATES, META_PERKS } from '../config/prestigeData';
import { MAX_AFFECTION, MAX_CHARM, clampStat } from '../config/balance';

const SAVE_KEY = 'anime_idle_save';

const createInitialState = (): GameState => ({
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

const normalizeGameState = (state: GameState): GameState => {
  const maxHp = Math.max(1, clampStat(state.maxHp, 1, Number.MAX_SAFE_INTEGER));
  const hp = clampStat(state.hp, 0, maxHp);

  return {
    ...state,
    maxHp,
    hp,
    charm: clampStat(state.charm, 0, MAX_CHARM),
    affection: clampStat(state.affection, 0, MAX_AFFECTION),
    feverGauge: clampStat(state.feverGauge, 0, 100),
    feverTimeLeft: Math.max(0, state.feverTimeLeft),
  };
};

const loadInitialState = (): GameState => {
  const fallbackState = createInitialState();

  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      return fallbackState;
    }

    const parsed = JSON.parse(saved);
    const loadedState: GameState = normalizeGameState({
      ...fallbackState,
      ...parsed
    });

    if (loadedState.lastSavedTime) {
      const offlineSeconds = (Date.now() - loadedState.lastSavedTime) / 1000;
      if (offlineSeconds > 60) {
        const tempStats = calculateStats(loadedState);
        if (tempStats.incomePerSec > 0) {
          const earned = tempStats.incomePerSec * offlineSeconds;
          loadedState.data += earned;
          loadedState.totalData += earned;
          console.log(`오프라인 경과 시간: ${offlineSeconds.toFixed(0)}초, 획득 하트: ${earned.toFixed(0)}`);
        }
      }
    }

    return normalizeGameState(loadedState);
  } catch (e) {
    console.error("세이브 데이터를 불러오지 못했습니다.", e);
    return fallbackState;
  }
};

const calculateStats = (currentState: GameState) => {
  const normalizedState = normalizeGameState(currentState);
  let clickPower = 1;
  let baseIncome = 0;

  // 기본 졸업 배율: 명성 1당 10% 보너스
  let prestigeMult = 1 + (normalizedState.prestigeCurrency * 0.1);
  
  // 메타 특전: perk_passive_boost
  const passiveBoostLevel = normalizedState.metaPerks['perk_passive_boost'] || 0;
  if (passiveBoostLevel > 0) {
     const boostPerk = META_PERKS.find(p => p.id === 'perk_passive_boost');
     if (boostPerk) {
       prestigeMult += (passiveBoostLevel * boostPerk.effectPerLevel);
     }
  }

  // 매력은 수익 배율에 관여한다. 매력 10당 수익 5% 증가
  const charmMult = 1 + (normalizedState.charm * 0.005);
  
  // 피버 상태에서는 모든 효율 5배
  const feverMult = normalizedState.feverTimeLeft > 0 ? 5 : 1;
  
  const finalMult = prestigeMult * charmMult * feverMult;

  // 현재 선택한 아이돌의 패시브 보너스
  const currentIdol = IDOL_CANDIDATES.find(i => i.id === normalizedState.currentIdolId);
  let idolIncomeSubMult = 1;
  let idolCharmSubMult = 1;
  let idolAffectionSubMult = 1;

  if (currentIdol && currentIdol.passiveBonusValue > 0) {
    if (currentIdol.passiveBonusType === 'income') idolIncomeSubMult = currentIdol.passiveBonusValue;
    if (currentIdol.passiveBonusType === 'charm') idolCharmSubMult = currentIdol.passiveBonusValue;
    if (currentIdol.passiveBonusType === 'affection') idolAffectionSubMult = currentIdol.passiveBonusValue;
  }

  UPGRADES_DATA.forEach(upg => {
    if (normalizedState.upgrades.includes(upg.id) && upg.type === 'click') {
      clickPower *= upg.multiplier;
    }
  });

  GENERATORS_DATA.forEach(gen => {
    const count = normalizedState.generators[gen.id] || 0;
    if (count > 0) {
      let genPower = gen.baseIncome;
      UPGRADES_DATA.forEach(upg => {
         if (normalizedState.upgrades.includes(upg.id) && upg.type === 'generator' && upg.targetGenId === gen.id) {
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
};

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
  const [state, setState] = useState<GameState>(loadInitialState);

  const lastTickTime = useRef<number | null>(null);
  const reqId = useRef<number | null>(null);

  // 주기적으로 로컬 스토리지에 저장한다.
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setState(current => {
        const newState = normalizeGameState({ ...current, lastSavedTime: Date.now() });
        localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
        return newState;
      });
    }, 5000);
    return () => clearInterval(saveInterval);
  }, []);

  const stats = calculateStats(state);

  useEffect(() => {
    const gameLoop = (timeNow: number) => {
      if (lastTickTime.current === null) {
        lastTickTime.current = timeNow;
      }

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

        // 피버 상태 처리
        if (newFeverTimeLeft > 0) {
          newFeverTimeLeft -= delta;
          if (newFeverTimeLeft <= 0) {
            newFeverTimeLeft = 0;
          }
        } else if (currentAction !== 'idle' && currentAction !== 'rest') {
          // 행동 중에는 피버 게이지가 차오른다. 대략 30초면 가득 찬다.
          newFeverGauge += 3.33 * delta;
          if (newFeverGauge >= 100) {
            newFeverGauge = 0;
            // 피버 지속 시간 메타 특전 반영
            let baseDuration = 10;
            const feverPerkLevel = current.metaPerks['perk_fever_duration'] || 0;
            if (feverPerkLevel > 0) {
               const feverPerk = META_PERKS.find(p => p.id === 'perk_fever_duration');
               baseDuration += feverPerk ? feverPerkLevel * feverPerk.effectPerLevel : 0;
            }
            newFeverTimeLeft = baseDuration; 
          }
        }

        // 체력 소모와 회복 처리
        if (currentAction === 'cheer') {
          newHp -= 5 * delta; // 응원은 초당 체력 5 소모
          // 응원 수익은 기본 행동 효율과 자동 수익을 함께 반영한다.
          const cheerIncome = (currentStats.clickPower * 5) + currentStats.incomePerSec;
          newData += cheerIncome * delta;
          newTotalData += cheerIncome * delta;
        } else if (currentAction === 'rest') {
          newHp += 15 * delta; // 휴식은 초당 체력 15 회복
        } else if (currentAction === 'train') {
          newHp -= 8 * delta; // 훈련은 초당 체력 8 소모
          // 훈련은 기본 행동 효율과 자동 수익 일부를 매력으로 바꾼다.
          const trainGain = ((currentStats.clickPower * 0.8) + (currentStats.incomePerSec * 0.01)) * currentStats.idolCharmSubMult;
          newCharm += trainGain * delta; 
        } else if (currentAction === 'interact') {
          newHp -= 3 * delta; // 소통은 초당 체력 3 소모
          // 소통은 기본 행동 효율과 자동 수익 일부를 호감도로 바꾼다.
          const interactGain = ((currentStats.clickPower * 0.5) + (currentStats.incomePerSec * 0.005)) * currentStats.idolAffectionSubMult;
          newAffection += interactGain * delta;
        }

        // 체력 범위 제한
        if (newHp > current.maxHp) newHp = current.maxHp;
        if (newHp <= 0) {
          newHp = 0;
          currentAction = 'rest'; // 체력이 바닥나면 강제로 휴식 전환
        }

        newCharm = clampStat(newCharm, 0, MAX_CHARM);
        newAffection = clampStat(newAffection, 0, MAX_AFFECTION);

        // 스토리 이벤트 트리거 확인
        let newActiveEvent = current.activeEvent;
        if (!newActiveEvent) {
          for (const evt of STORY_EVENTS) {
            if (newAffection >= evt.triggerAffection && !current.seenEvents.includes(evt.id)) {
              newActiveEvent = evt.id;
              break; // 한 번에 하나의 이벤트만 띄운다.
            }
          }
        }

        return normalizeGameState({
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
        });
      });

      reqId.current = requestAnimationFrame(gameLoop);
    };

    reqId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (reqId.current) cancelAnimationFrame(reqId.current);
      lastTickTime.current = null;
    };
  }, []);

  const setAction = useCallback((action: GameState['currentAction']) => {
    setState(current => normalizeGameState({ ...current, currentAction: action }));
  }, []);

  // 기존 클릭 방식은 제거했고, 남은 참조 호환을 위해 빈 함수를 유지한다.
  const click = useCallback(() => {
    // 현재 UI는 setAction 기반으로 동작한다.
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
      // 현재 상태 기준으로 비용을 다시 계산한다.
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
    // 누적 하트 100만당 명성 1 획득
    return Math.floor(state.totalData / 1000000);
  }, [state.totalData]);

  const prestige = useCallback((newIdolId?: string) => {
    const earned = calculatePrestigeEarned();
    // 아이돌 교체만 하는 경우에는 획득 명성이 0이어도 허용한다.
    
    setState(current => {
      // 시작 자금 메타 특전 반영
      let startingData = 0;
      const startFundsLevel = current.metaPerks['perk_start_funds'] || 0;
      if (startFundsLevel > 0) {
        const startPerk = META_PERKS.find(p => p.id === 'perk_start_funds');
        startingData = startPerk ? startFundsLevel * startPerk.effectPerLevel : 0;
      }

      return normalizeGameState({
        ...current, // 명성, 메타 특전, 해금한 아이돌은 유지
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
      });
    });
  }, [calculatePrestigeEarned]);

  const handleStoryChoice = useCallback((eventId: string, charmReward: number, affectionReward: number, hpCost: number) => {
    setState(current => normalizeGameState({
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
