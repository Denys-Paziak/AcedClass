type UploadLevel = {
  minUploads: number;
  minApprovalRate: number;
  plusDailyLimit: number;
};

const levels: UploadLevel[] = [
  { minUploads: 100, minApprovalRate: 95, plusDailyLimit: 8 },
  { minUploads: 40, minApprovalRate: 90, plusDailyLimit: 4 },
  { minUploads: 0, minApprovalRate: 0, plusDailyLimit: 0 },
];

export function getPlusDailyUploadLimit(totalUploads: number, approvalLevel: number): number {
  if (totalUploads >= 25 && approvalLevel < 25) {
    return 4;
  }

  const level = levels.find(
    l => totalUploads >= l.minUploads && approvalLevel >= l.minApprovalRate
  );
  return level?.plusDailyLimit ?? 0;
}
