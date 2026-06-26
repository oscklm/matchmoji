import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'

const DEVICE_KEY = 'matchmoji:deviceId'
const NAME_KEY = 'matchmoji:name'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

function randomName(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: ' ',
    style: 'capital',
    length: 2,
  })
}

export function getName(): string {
  let name = localStorage.getItem(NAME_KEY)
  if (!name) {
    name = randomName()
    localStorage.setItem(NAME_KEY, name)
  }
  return name
}

export function saveName(name: string): string {
  const clean = name.trim().slice(0, 24) || randomName()
  localStorage.setItem(NAME_KEY, clean)
  return clean
}
