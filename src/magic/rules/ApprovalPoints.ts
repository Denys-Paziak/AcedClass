type ApprovalPoints = {
  min: number;
  max: number | null;
  points: number;
};

const levels: ApprovalPoints[] = [
  { min: 75, max: null, points: 4 },
  { min: 50, max: 74.9, points: 3 },
  { min: 25, max: 49.9, points: 2 },
  { min: 0, max: 24.9, points: 1 },
];

export function getPointsByApprovalRate(rate: number): number {
  const level = levels.find(l => rate >= l.min && (l.max === null || rate <= l.max));
  return level?.points ?? levels[levels.length - 1].points;
}