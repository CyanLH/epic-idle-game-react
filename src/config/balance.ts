export const MAX_CHARM = 200;
export const MAX_AFFECTION = 1000;

export const clampStat = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
};
