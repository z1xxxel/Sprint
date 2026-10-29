import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImage } from '../lib/cropImage'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface Props {
  imageSrc: string
  aspect?: number
  cropShape?: 'rect' | 'round'
  outputWidth?: number
  outputHeight?: number
  title?: string
  onCancel: () => void
  onCrop: (blob: Blob) => void | Promise<void>
}

export default function ImageCropperModal({
  imageSrc,
  aspect = 1,
  cropShape = 'rect',
  outputWidth,
  outputHeight,
  title = 'Обрезка изображения',
  onCancel,
  onCrop,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    setBusy(true)
    try {
      const blob = await getCroppedImage(
        imageSrc,
        croppedArea,
        outputWidth && outputHeight
          ? { width: outputWidth, height: outputHeight }
          : undefined
      )
      await onCrop(blob)
    } catch (e) {
      notify.error(e)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#30363d]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="relative w-full h-[360px] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Масштаб</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={busy}
              className="w-full accent-brand-600"
            />
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            {cropShape === 'round' ? 'Круглая область' : 'Прямоугольная область'}
            {aspect ? ` · ${aspect.toFixed(2)}:1` : ''}
            {outputWidth && outputHeight ? ` · ${outputWidth}×${outputHeight}px` : ''}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || !croppedArea}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              {busy ? 'Загрузка...' : 'Применить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}