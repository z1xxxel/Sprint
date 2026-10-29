import { api } from './client'

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post<string>('/files/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}