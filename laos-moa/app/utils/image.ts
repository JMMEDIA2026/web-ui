// 브라우저에서 사진을 줄여 JPEG로 바꿉니다. (큰 사진 1600px, 작은 사진 480px)
// 휴대폰 사진의 회전 정보도 반영하고, 위치 정보(EXIF)는 다시 그리면서 자연스럽게 사라집니다.

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // 아래의 이미지 태그 방식으로 다시 시도합니다.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('변환 실패'))), 'image/jpeg', quality)
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('읽기 실패'))
    reader.readAsDataURL(blob)
  })
}

/** 긴 변이 maxSide 이하가 되도록 줄이고, 글자 수(base64)가 maxChars 이하가 될 때까지 품질을 낮춥니다. */
export async function shrinkImage(file: File, maxSide: number, maxChars: number): Promise<string> {
  const bitmap = await loadBitmap(file)
  const w = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
  const h = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
  if (!w || !h) throw new Error('이미지를 읽을 수 없습니다')

  let side = maxSide
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = Math.min(1, side / Math.max(w, h))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('이미지를 처리할 수 없습니다')
    ctx.fillStyle = '#fff' // 투명한 PNG 배경은 흰색으로
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    for (const q of [0.82, 0.72, 0.62, 0.5]) {
      const b64 = await blobToBase64(await toBlob(canvas, q))
      if (b64.length <= maxChars) return b64
    }
    side = Math.round(side * 0.8) // 그래도 크면 더 작게 줄여 다시 시도
  }
  throw new Error('사진이 너무 커서 줄일 수 없습니다. 다른 사진을 골라 주세요')
}

export const FULL_MAX_SIDE = 1600
export const THUMB_MAX_SIDE = 480
export const FULL_MAX_CHARS = 1_250_000
export const THUMB_MAX_CHARS = 150_000

// ---- 메인 배너: 가운데를 2:1로 잘라 가로 1200px 이하로 줄입니다. ----
export const BANNER_RATIO = 2
export const BANNER_MAX_WIDTH = 1200
export const BANNER_MAX_CHARS = 1_250_000

export async function cropBanner(file: File): Promise<string> {
  const bitmap = await loadBitmap(file)
  const w = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
  const h = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
  if (!w || !h) throw new Error('이미지를 읽을 수 없습니다')

  // 원본에서 2:1 영역을 가운데 기준으로 잘라 냅니다.
  let sw = w
  let sh = Math.round(w / BANNER_RATIO)
  if (sh > h) {
    sh = h
    sw = Math.round(h * BANNER_RATIO)
  }
  const sx = Math.round((w - sw) / 2)
  const sy = Math.round((h - sh) / 2)

  let outW = Math.min(BANNER_MAX_WIDTH, sw)
  for (let attempt = 0; attempt < 5; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = Math.round(outW / BANNER_RATIO)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('이미지를 처리할 수 없습니다')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    for (const q of [0.85, 0.75, 0.65, 0.5]) {
      const b64 = await blobToBase64(await toBlob(canvas, q))
      if (b64.length <= BANNER_MAX_CHARS) return b64
    }
    outW = Math.round(outW * 0.8)
  }
  throw new Error('이미지가 너무 커서 줄일 수 없습니다. 다른 이미지를 골라 주세요')
}
