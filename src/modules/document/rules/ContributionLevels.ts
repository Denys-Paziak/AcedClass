interface ContributionLevel {
  name: string;
  min: number;
  max: number | null;
};

const levels: ContributionLevel[] = [
  { name: 'Level 0', min: 0, max: 3 },
  { name: 'Level 1', min: 4, max: 9 },
  { name: 'Level 2', min: 10, max: 24 },
  { name: 'Level 3', min: 25, max: 49 },
  { name: 'Level 4', min: 50, max: 99 },
  { name: 'Level 5', min: 100, max: null },
];

export function getContributionLevel(uploadCount: number): string {
  const level = levels.find(l => uploadCount >= l.min && (l.max === null || uploadCount <= l.max));
  return level?.name ?? levels[levels.length - 1].name;
}
