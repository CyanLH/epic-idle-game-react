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
    name: "Loyal Fan",
    desc: "Cheerfully gives you hearts.",
    baseCost: 15,
    costMultiplier: 1.15,
    baseIncome: 1,
    icon: "👏"
  },
  {
    id: "gen_flyer",
    name: "Flyer Campaign",
    desc: "Hire students to hand out flyers.",
    baseCost: 100,
    costMultiplier: 1.15,
    baseIncome: 5,
    icon: "📄"
  },
  {
    id: "gen_social",
    name: "Social Media Manager",
    desc: "Posts cute selfies constantly.",
    baseCost: 1100,
    costMultiplier: 1.15,
    baseIncome: 50,
    icon: "📱"
  },
  {
    id: "gen_merch",
    name: "Merch Store",
    desc: "Sells acrylic stands and posters.",
    baseCost: 12000,
    costMultiplier: 1.15,
    baseIncome: 400,
    icon: "🛍️"
  },
  {
    id: "gen_concert",
    name: "Live Concert",
    desc: "Massive stadium performance.",
    baseCost: 130000,
    costMultiplier: 1.15,
    baseIncome: 3000,
    icon: "🎤"
  }
];

export const UPGRADES_DATA: UpgradeData[] = [
  {
    id: "upg_click_1",
    name: "Cute Wink",
    desc: "Clicking power x2",
    cost: 100,
    icon: "😉",
    type: "click",
    multiplier: 2
  },
  {
    id: "upg_fan_1",
    name: "Glow Sticks",
    desc: "Loyal Fans work 2x better",
    cost: 500,
    icon: "✨",
    type: "generator",
    targetGenId: "gen_fan",
    multiplier: 2
  },
  {
    id: "upg_click_2",
    name: "Idol Outfit",
    desc: "Clicking power x3",
    cost: 2500,
    icon: "👗",
    type: "click",
    multiplier: 3
  },
  {
    id: "upg_social_1",
    name: "Viral Tiktok",
    desc: "Social Media handles 2x more",
    cost: 5000,
    icon: "🎵",
    type: "generator",
    targetGenId: "gen_social",
    multiplier: 2
  },
  {
    id: "upg_romance",
    name: "Confession",
    desc: "Confess your feelings (Requires 1000 Affection)",
    cost: 1000000,
    icon: "💍",
    type: "click", // Using 'click' as a generic type here since it just needs to be bought
    multiplier: 1
  }
];
