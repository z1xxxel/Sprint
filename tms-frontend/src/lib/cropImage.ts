function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Обрезает изображение по пиксельной области.
 * @param imageSrc — URL (objectURL / dataURL / http URL)
 * @param pixelCrop — область из react-easy-crop.onCropComplete
 * @param outputSize — итоговый размер (если не передан, берётся область)
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize?: { width: number; height: number },
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Не удалось получить 2d context')

  const targetW = outputSize?.width ?? pixelCrop.width
  const targetH = outputSize?.height ?? pixelCrop.height

  canvas.width = targetW
  canvas.height = targetH

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetW,
    targetH
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Пустое изображение'))),
      outputFormat,
      quality
    )
  })
}