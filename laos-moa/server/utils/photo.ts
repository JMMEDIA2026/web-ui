// 업체 사진 검사: 올라온 글자를 실제 이미지(JPEG·PNG·WebP)인지 확인하고, 크기를 제한합니다.
export const MAX_PHOTOS_PER_BUSINESS = 12
export const MAX_FULL_B64 = 1_300_000 // 약 975KB
export const MAX_THUMB_B64 = 160_000 // 약 120KB

export function decodeBase64(b64: string): Uint8Array | null {
  try {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  } catch {
    return null
  }
}

// 파일 맨 앞의 표식으로 종류를 확인합니다. (확장자나 올린 사람의 말은 믿지 않습니다)
export function sniffImage(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes.length > 12 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg'
  if (bytes.length > 12 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png'
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  return null
}
