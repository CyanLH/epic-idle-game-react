export interface GeneratorData {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  costMultiplier: number;
  baseIncome: number;
  icon: string;
}

export interface UpgradeData {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  type: 'click' | 'generator';
  targetGenId?: string;
  multiplier: number;
}

export const GENERATORS_DATA: GeneratorData[] = [
  {
    id: "gen_fan",
    name: "열혈 팬",
    desc: "하트를 꾸준히 모아주는 기본 팬층입니다.",
    baseCost: 15,
    costMultiplier: 1.15,
    baseIncome: 1,
    icon: "👏"
  },
  {
    id: "gen_flyer",
    name: "전단지 홍보",
    desc: "거리 홍보 인력을 고용해 팬을 늘립니다.",
    baseCost: 100,
    costMultiplier: 1.15,
    baseIncome: 5,
    icon: "📄"
  },
  {
    id: "gen_social",
    name: "SNS 매니저",
    desc: "SNS를 관리하며 꾸준히 화제를 만듭니다.",
    baseCost: 1100,
    costMultiplier: 1.15,
    baseIncome: 50,
    icon: "📱"
  },
  {
    id: "gen_merch",
    name: "굿즈 스토어",
    desc: "아크릴 스탠드와 포스터를 판매합니다.",
    baseCost: 12000,
    costMultiplier: 1.15,
    baseIncome: 400,
    icon: "🛍️"
  },
  {
    id: "gen_concert",
    name: "대형 콘서트",
    desc: "대형 공연으로 폭발적인 인기를 끌어냅니다.",
    baseCost: 130000,
    costMultiplier: 1.15,
    baseIncome: 3000,
    icon: "🎤"
  }
];

export const UPGRADES_DATA: UpgradeData[] = [
  {
    id: "upg_click_1",
    name: "상큼한 윙크",
    desc: "기본 행동 효율 x2",
    cost: 100,
    icon: "😉",
    type: "click",
    multiplier: 2
  },
  {
    id: "upg_fan_1",
    name: "응원봉 물결",
    desc: "열혈 팬 수익 x2",
    cost: 500,
    icon: "✨",
    type: "generator",
    targetGenId: "gen_fan",
    multiplier: 2
  },
  {
    id: "upg_click_2",
    name: "무대 의상",
    desc: "기본 행동 효율 x3",
    cost: 2500,
    icon: "👗",
    type: "click",
    multiplier: 3
  },
  {
    id: "upg_social_1",
    name: "바이럴 숏폼",
    desc: "SNS 매니저 수익 x2",
    cost: 5000,
    icon: "🎵",
    type: "generator",
    targetGenId: "gen_social",
    multiplier: 2
  },
  {
    id: "upg_romance",
    name: "고백",
    desc: "마음을 전합니다 (호감도 1000 필요)",
    cost: 1000000,
    icon: "💍",
    type: "click", // 구매 조건만 체크하면 되므로 공용 타입을 사용한다.
    multiplier: 1
  }
];
