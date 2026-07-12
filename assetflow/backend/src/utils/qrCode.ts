import QRCode from 'qrcode';

export async function generateQRCode(assetTag: string): Promise<string> {
  try {
    return await QRCode.toDataURL(assetTag);
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${(error as Error).message}`);
  }
}
