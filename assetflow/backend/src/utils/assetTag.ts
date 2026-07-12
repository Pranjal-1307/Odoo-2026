import prisma from '../config/database';

export async function generateAssetTag(): Promise<string> {
  const lastAsset = await prisma.asset.findFirst({
    orderBy: {
      assetTag: 'desc',
    },
    select: {
      assetTag: true,
    },
  });

  if (!lastAsset) {
    return 'AF-000001';
  }

  const match = lastAsset.assetTag.match(/^AF-(\d+)$/);
  if (!match) {
    return 'AF-000001';
  }

  const nextNum = parseInt(match[1], 10) + 1;
  const padded = String(nextNum).padStart(6, '0');
  return `AF-${padded}`;
}
