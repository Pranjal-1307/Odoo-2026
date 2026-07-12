import { AssetStatus } from '@prisma/client';

export function isValidTransition(from: AssetStatus, to: AssetStatus): boolean {
  const transitions: Record<AssetStatus, AssetStatus[]> = {
    AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'],
    ALLOCATED: ['AVAILABLE', 'UNDER_MAINTENANCE', 'LOST'],
    RESERVED: ['AVAILABLE'],
    UNDER_MAINTENANCE: ['AVAILABLE', 'RETIRED', 'DISPOSED'],
    LOST: ['AVAILABLE', 'DISPOSED'],
    RETIRED: ['DISPOSED'],
    DISPOSED: [],
  };
  return transitions[from]?.includes(to) ?? false;
}

export function getValidTransitions(status: AssetStatus): AssetStatus[] {
  const transitions: Record<AssetStatus, AssetStatus[]> = {
    AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'],
    ALLOCATED: ['AVAILABLE', 'UNDER_MAINTENANCE', 'LOST'],
    RESERVED: ['AVAILABLE'],
    UNDER_MAINTENANCE: ['AVAILABLE', 'RETIRED', 'DISPOSED'],
    LOST: ['AVAILABLE', 'DISPOSED'],
    RETIRED: ['DISPOSED'],
    DISPOSED: [],
  };
  return transitions[status] ?? [];
}
