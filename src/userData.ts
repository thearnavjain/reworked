export type UserRole = 'student' | 'parent' | 'teacher'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
  year?: string
  parentId?: string
  childrenIds?: string[]
  avatar: string
  level: number
  xp: number
  xpNext: number
  streak: number
  totalStars: number
  teacher?: string
}

export type CreateUserInput = Omit<User, 'id'> & { id?: string }

const STORAGE_KEY = 'reworked_users'

export const DEFAULT_USERS: User[] = [
  {
    id: 'teacher-verma',
    username: 'Verma1227',
    password: 'VermaLovesTeaching',
    name: 'Mr. Shreenath Verma',
    role: 'teacher',
    avatar: '👩‍🏫',
    level: 1,
    xp: 0,
    xpNext: 100,
    streak: 0,
    totalStars: 0,
  },
  {
    id: 'parent-atul-jain',
    username: 'Atul Jain',
    password: 'MySonIsFunny',
    name: 'Atul Jain',
    role: 'parent',
    childrenIds: ['student-arnav-jain', 'student-riddhi-jain'],
    avatar: '👤',
    level: 1,
    xp: 0,
    xpNext: 100,
    streak: 0,
    totalStars: 0,
  },
  {
    id: 'student-arnav-jain',
    username: 'Arnav Jain',
    password: 'IHateMakingPasswords',
    name: 'Arnav Jain',
    role: 'student',
    year: 'Year 3',
    parentId: 'parent-atul-jain',
    avatar: '🐼',
    level: 12,
    xp: 3480,
    xpNext: 4000,
    streak: 7,
    totalStars: 48,
    teacher: 'Mr. Shreenath Verma',
  },
  {
    id: 'student-riddhi-jain',
    username: 'Riddhi Jain',
    password: 'RiddhiIsAwesome',
    name: 'Riddhi Jain',
    role: 'student',
    year: 'Year 2',
    parentId: 'parent-atul-jain',
    avatar: '🦊',
    level: 8,
    xp: 2140,
    xpNext: 2500,
    streak: 5,
    totalStars: 31,
    teacher: 'Mr. Shreenath Verma',
  },
]

function mergeUsers(stored: User[]): User[] {
  const byId = new Map(DEFAULT_USERS.map(user => [user.id, user]))
  for (const user of stored) byId.set(user.id, user)
  return Array.from(byId.values())
}

export function getUsers(): User[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_USERS
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return DEFAULT_USERS
    return mergeUsers(parsed)
  } catch {
    return DEFAULT_USERS
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function createUser(input: CreateUserInput): User {
  const user: User = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
  }

  const users = getUsers()
  saveUsers([...users.filter(existing => existing.id !== user.id), user])

  if (user.parentId) {
    const updated = getUsers().map(existing => {
      if (existing.id !== user.parentId || existing.role !== 'parent') return existing
      const childrenIds = Array.from(new Set([...(existing.childrenIds ?? []), user.id]))
      return { ...existing, childrenIds }
    })
    saveUsers(updated)
  }

  return user
}

export function findUser(username: string, password: string, role: UserRole): User | null {
  return getUsers().find(
    user =>
      user.role === role &&
      user.username.toLowerCase() === username.trim().toLowerCase() &&
      user.password === password,
  ) ?? null
}

export function getChildren(parent: User): User[] {
  const users = getUsers()
  const ids = new Set(parent.childrenIds ?? [])
  return users.filter(user => user.role === 'student' && (ids.has(user.id) || user.parentId === parent.id))
}