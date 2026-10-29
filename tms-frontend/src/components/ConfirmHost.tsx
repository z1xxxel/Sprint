import { useConfirm } from '../lib/confirm'
import ConfirmModal from './ConfirmModal'

export default function ConfirmHost() {
  const pending = useConfirm((s) => s.pending)
  const resolve = useConfirm((s) => s.resolve)

  if (!pending) return null

  return (
    <ConfirmModal
      options={pending}
      onConfirm={async () => {
        resolve(true)
      }}
      onCancel={() => resolve(false)}
    />
  )
}