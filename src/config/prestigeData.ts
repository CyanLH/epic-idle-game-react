export interface IdolData {
  id: string;
  name: string;
  desc: string;
  baseSprite: string;
  unlockCost: number; // Cost in prestige currency
  passiveBonusType: 'income' | 'charm' | 'affection';
  passiveBonusValue: number;
}

export interface MetaPerk {
  id: string;
  name: string;
  desc: string;
  maxLevel: number;
  baseCost: number; // Prestige currency cost
  costMultiplier: number; // How much cost increases per level
  effectPerLevel: number;
}

export const IDOL_CANDIDATES: IdolData[] = [
  {
    id: 'idol_default',
    name: '유메 (기본)',
    desc: '꿈을 향해 달리는 평범한 소녀. 잠재력은 미지수입니다.',
    baseSprite: '/idol_base_normal.png',
    unlockCost: 0,
    passiveBonusType: 'income',
    passiveBonusValue: 0 // 기본(보너스 없음)
  },
  {
    id: 'idol_cool',
    name: '레이나 (쿨 뷰티)',
    desc: '기본 매력 수치가 크게 오르는 차가운 성격의 후배.',
    baseSprite: '/idol_branch_cool.png',
    unlockCost: 2,
    passiveBonusType: 'charm',
    passiveBonusValue: 2.0 // 매력 획득량 2배
  },
  {
    id: 'idol_cute',
    name: '모모 (큐트)',
    desc: '태생적으로 애교가 많아 호감도가 치솟는 후배.',
    baseSprite: '/idol_branch_cute.png',
    unlockCost: 2,
    passiveBonusType: 'affection',
    passiveBonusValue: 2.0 // 호감도 획득량 2배
  }
];

export const META_PERKS: MetaPerk[] = [
  {
    id: 'perk_start_funds',
    name: '흙수저 탈출',
    desc: '환생(졸업) 시 들고 시작하는 기본 하트량이 증가합니다.',
    maxLevel: 10,
    baseCost: 1,
    costMultiplier: 1.5,
    effectPerLevel: 500 // 레벨당 시작 하트 +500
  },
  {
    id: 'perk_fever_duration',
    name: '지치지 않는 체력',
    desc: '피버 타임 유지 시간이 길어집니다.',
    maxLevel: 5,
    baseCost: 2,
    costMultiplier: 2.0,
    effectPerLevel: 2 // 레벨당 피버 시간 +2초
  },
  {
    id: 'perk_passive_boost',
    name: '전설의 입소문',
    desc: '모든 프로모션(발전기)의 기본 치어링 효율이 증가합니다.',
    maxLevel: 10,
    baseCost: 3,
    costMultiplier: 1.8,
    effectPerLevel: 0.1 // 레벨당 기본 수익 10% 추가 증가
  }
];
