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
  xpStart: number
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
    xpStart: 0,
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
    xpStart: 0,
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
    xpStart: 3250,
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
    xpStart: 1750,
    xpNext: 2500,
    streak: 5,
    totalStars: 31,
    teacher: 'Mr. Shreenath Verma',
  },
]

function mergeUsers(stored: User[]): User[] {
  const defaultsById = new Map(DEFAULT_USERS.map(user => [user.id, user]))
  const byId = new Map(DEFAULT_USERS.map(user => [user.id, user]))

  for (const user of stored) {
    const defaultUser = defaultsById.get(user.id)
    byId.set(user.id, {
      ...defaultUser,
      ...user,
      xpStart:
        user.xpStart ??
        defaultUser?.xpStart ??
        Math.max(0, user.xpNext - 500),
    })
  }

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

export function getUserById(userId: string): User | null {
  return getUsers().find(user => user.id === userId) ?? null
}

export function calculateQuestXP(accuracy: number): number {
  const safeAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)))
  // Every first-time quest completion is worth 100 XP, with up to 50 bonus XP
  // for strong performance.
  return 100 + Math.round(safeAccuracy * 0.5)
}

export function getXPProgress(user: Pick<User, 'xp' | 'xpStart' | 'xpNext'>) {
  const start = Math.max(0, user.xpStart ?? Math.max(0, user.xpNext - 500))
  const range = Math.max(1, user.xpNext - start)
  const progress = Math.max(0, Math.min(100, ((user.xp - start) / range) * 100))

  return {
    start,
    current: user.xp,
    next: user.xpNext,
    progress,
    remaining: Math.max(0, user.xpNext - user.xp),
  }
}

export function awardQuestXP(
  userId: string,
  accuracy: number,
): { user: User; xpGained: number; starsEarned: number; levelUps: number } | null {
  const users = getUsers()
  const index = users.findIndex(user => user.id === userId)

  if (index === -1) return null

  const current = users[index]
  const xpGained = calculateQuestXP(accuracy)

  let xp = current.xp + xpGained
  let level = current.level
  let xpStart = current.xpStart ?? Math.max(0, current.xpNext - 500)
  let xpNext = current.xpNext
  let levelUps = 0

  while (xp >= xpNext) {
    xpStart = xpNext
    level += 1
    levelUps += 1
    xpNext += 500
  }

  const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1

  const updatedUser: User = {
    ...current,
    xp,
    xpStart,
    xpNext,
    level,
    totalStars: current.totalStars + starsEarned,
  }

  const updatedUsers = users.map((user, userIndex) =>
    userIndex === index ? updatedUser : user,
  )

  saveUsers(updatedUsers)

  return {
    user: updatedUser,
    xpGained,
    starsEarned,
    levelUps,
  }
}