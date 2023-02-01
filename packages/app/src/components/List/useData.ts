import dayjs from 'dayjs'
import { getAppDataPath } from '~/api'
import type { MessageModel } from '~~/models/Message'
import { byteSize } from '~~/utils'

export function useData(message: MessageModel) {
  const messageStore = useMessageStore()

  const title = computedAsync(async() => {
    if (message.title) return message.title
    switch (message.category) {
      case 'image': {
        return `${await getAppDataPath()}${message.filePath}`
      }
      case 'link':
        return message.link || ''
      default:
        return ''
    }
  })
  const updatedAt = computed(() => dayjs(message.updatedAt).format('YYYY/MM/DD HH:mm'))
  const updatedFromNow = computed(() => dayjs(message.updatedAt).fromNow())
  const description = computed(() => {
    switch (message.category) {
      case 'text': {
        if (!message.size && message.size !== 0) {
          return updatedAt.value
        }
        const r = byteSize(message.size)
        return r?.text
      }
      case 'image': {
        if (message.metadata?.width && message.metadata?.height) {
          return `${message.metadata.width} × ${message.metadata.height}`
        }
        return updatedAt.value
      }
      case 'link':
        return message.link || updatedAt.value
      case 'other':
        return updatedAt.value
      default:
        return updatedAt.value
    }
  })
  const thumb = computedAsync(async() => {
    switch (message.category) {
      case 'image':
        return `atom://${await getAppDataPath()}${message.thumb}`
      case 'text':
        return '/icons/ClippingTextIcon.png'
      case 'link':
        return '/icons/BookmarkIcon.png'
      default:
        return '/icons/GenericDocumentIcon.png'
    }
  })
  const isSelected = computed(() => messageStore.selectedMessageIds.includes(message.id))

  return {
    title,
    description,
    thumb,
    updatedAt,
    updatedFromNow,
    isSelected,
  }
}
