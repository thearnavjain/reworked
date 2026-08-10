import { useState, useEffect, useRef } from 'react'
import TeacherDashboard from './TeacherDashboard'
import PlayerDashboard from './PlayerDashboard'
import ParentDashboard from './ParentDashboard'



// One icon per game theme
const DragonFlame = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 4 C20 10 14 12 16 20 C10 16 8 24 14 28 C12 34 18 40 24 44 C30 40 36 34 34 28 C40 24 38 16 32 20 C34 12 28 10 24 4Z" fill="#ff7c2a" />
    <path d="M24 14 C22 18 18 20 20 25 C16 22 15 27 18 30 C17 34 21 38 24 40 C27 38 31 34 30 30 C33 27 32 22 28 25 C30 20 26 18 24 14Z" fill="#ffe600" />
    <circle cx="24" cy="30" r="4" fill="#ff2d78" opacity="0.8" />
  </svg>
)

const CavernStalactite = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="10" height="22" rx="2" fill="#7a7aaa" />
    <polygon points="8,26 18,26 13,38" fill="#5a5a8a" />
    <rect x="22" y="4" width="8" height="16" rx="2" fill="#9a9abb" />
    <polygon points="22,20 30,20 26,30" fill="#7a7aaa" />
    <rect x="34" y="4" width="10" height="26" rx="2" fill="#6a6a9a" />
    <polygon points="34,30 44,30 39,44" fill="#4a4a7a" />
    <rect x="4" y="4" width="40" height="6" fill="#aaaacc" />
  </svg>
)

const PrincessCrown = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <polygon points="4,38 4,18 14,28 24,10 34,28 44,18 44,38" fill="#ffe600" stroke="#ff7c2a" strokeWidth="2" />
    <rect x="4" y="36" width="40" height="8" rx="2" fill="#ff7c2a" />
    <circle cx="24" cy="10" r="4" fill="#ff2d78" />
    <circle cx="4" cy="18" r="3" fill="#00f5ff" />
    <circle cx="44" cy="18" r="3" fill="#00f5ff" />
    <circle cx="14" cy="36" r="2.5" fill="#bf5fff" />
    <circle cx="24" cy="36" r="2.5" fill="#ff2d78" />
    <circle cx="34" cy="36" r="2.5" fill="#bf5fff" />
  </svg>
)

const NinjaShuriken = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'spin-slow 3s linear infinite' }}>
    <polygon points="24,4 28,22 44,24 28,26 24,44 20,26 4,24 20,22" fill="#aaaacc" stroke="#00f5ff" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="5" fill="#0a0a1a" stroke="#00f5ff" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="2" fill="#00f5ff" />
  </svg>
)

const CyberpunkLightning = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <polygon points="28,4 16,26 24,26 20,44 36,20 26,20" fill="#ffe600" />
    <polygon points="28,4 16,26 24,26 20,44 36,20 26,20" fill="none" stroke="#ff7c2a" strokeWidth="1.5" />
    <line x1="8" y1="38" x2="14" y2="32" stroke="#00f5ff" strokeWidth="2" strokeLinecap="round" />
    <line x1="36" y1="10" x2="42" y2="6" stroke="#ff2d78" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MusicNote = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M20 8 L40 4 L40 18 L20 22 Z" fill="#bf5fff" />
    <rect x="16" y="20" width="8" height="14" rx="1" fill="#bf5fff" />
    <rect x="36" y="16" width="8" height="14" rx="1" fill="#bf5fff" />
    <ellipse cx="20" cy="34" rx="6" ry="4" fill="#ff2d78" />
    <ellipse cx="40" cy="30" rx="6" ry="4" fill="#ff2d78" />
  </svg>
)

const FairyWand = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <line x1="10" y1="38" x2="34" y2="14" stroke="#ffaadd" strokeWidth="3" strokeLinecap="round" />
    <polygon points="34,14 30,8 38,6 36,14 42,10" fill="#ffe600" />
    <circle cx="34" cy="10" r="3" fill="white" opacity="0.9" />
    <circle cx="10" cy="42" r="2" fill="#bf5fff" opacity="0.8" />
    <circle cx="18" cy="10" r="1.5" fill="#ff2d78" opacity="0.8" />
    <circle cx="40" cy="30" r="1.5" fill="#00f5ff" opacity="0.8" />
    <circle cx="8" cy="20" r="1" fill="#ffe600" opacity="0.9" />
    <circle cx="30" cy="42" r="1" fill="#39ff14" opacity="0.8" />
  </svg>
)

const UnicornHorn = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <polygon points="24,4 18,36 30,36" fill="url(#hornGrad)" stroke="#bf5fff" strokeWidth="1" />
    <defs>
      <linearGradient id="hornGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff2d78" />
        <stop offset="33%" stopColor="#bf5fff" />
        <stop offset="66%" stopColor="#00f5ff" />
        <stop offset="100%" stopColor="#39ff14" />
      </linearGradient>
    </defs>
    <line x1="20" y1="14" x2="28" y2="14" stroke="white" strokeWidth="1" opacity="0.5" />
    <line x1="20" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1" opacity="0.4" />
    <line x1="21" y1="26" x2="27" y2="26" stroke="white" strokeWidth="1" opacity="0.3" />
    <ellipse cx="24" cy="40" rx="14" ry="6" fill="#ff2d78" opacity="0.3" />
  </svg>
)

const SpaceshipPixel = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <polygon points="24,4 30,28 24,24 18,28" fill="#00f5ff" />
    <rect x="14" y="28" width="20" height="8" rx="2" fill="#2a2a7a" stroke="#00f5ff" strokeWidth="1" />
    <rect x="10" y="32" width="8" height="6" rx="1" fill="#1a1a5a" stroke="#00f5ff" strokeWidth="1" />
    <rect x="30" y="32" width="8" height="6" rx="1" fill="#1a1a5a" stroke="#00f5ff" strokeWidth="1" />
    <rect x="20" y="36" width="8" height="4" fill="#0a0a3a" />
    <circle cx="14" cy="40" r="2" fill="#ff7c2a" opacity="0.9" />
    <circle cx="24" cy="42" r="3" fill="#ff2d78" opacity="0.8" />
    <circle cx="34" cy="40" r="2" fill="#ff7c2a" opacity="0.9" />
  </svg>
)

interface GameChip {
  icon: React.ReactNode
  label: string
  color: string
  top: string
  left?: string
  right?: string
  delay: string
}

const GAME_CHIPS: GameChip[] = [
  { icon: <DragonFlame />, label: 'Dragon Dungeon', color: '#ff7c2a', top: '8%', left: '3%', delay: '0s' },
  { icon: <CavernStalactite />, label: 'Cavern Combat', color: '#9a9abb', top: '24%', left: '1%', delay: '-1s' },
  { icon: <PrincessCrown />, label: 'Princess Run', color: '#ffe600', top: '50%', left: '2%', delay: '-2s' },
  { icon: <NinjaShuriken />, label: 'Ninja Academy', color: '#aaaacc', top: '72%', left: '3%', delay: '-0.5s' },
  { icon: <CyberpunkLightning />, label: 'Cyberpunk Biking', color: '#ffe600', top: '88%', left: '8%', delay: '-1.5s' },
  { icon: <MusicNote />, label: 'Musical Tiles', color: '#bf5fff', top: '8%', right: '3%', delay: '-3s' },
  { icon: <FairyWand />, label: 'Fairy Workshop', color: '#ffaadd', top: '28%', right: '1%', delay: '-0.8s' },
  { icon: <UnicornHorn />, label: 'Unicorn Care', color: '#ff2d78', top: '54%', right: '2%', delay: '-2.2s' },
  { icon: <SpaceshipPixel />, label: 'Spaceship Shootout', color: '#00f5ff', top: '80%', right: '3%', delay: '-1.2s' },
]

const TICKER_ITEMS = [
  '🐉 DRAGON DUNGEON',
  '⚔️ CAVERN COMBAT',
  '👑 PRINCESS RUN',
  '🥷 NINJA ACADEMY',
  '⚡ CYBERPUNK BIKING',
  '🎵 MUSICAL TILES',
  '🧚 FAIRY WORKSHOP',
  '🦄 UNICORN CARE',
  '🚀 SPACESHIP SHOOTOUT',
]

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [userType, setUserType] = useState<'student' | 'parent' | 'teacher'>('student')
  const [isLoading, setIsLoading] = useState(false)
  const [teacherLoggedIn, setTeacherLoggedIn] = useState(false)
  const [playerLoggedIn, setPlayerLoggedIn] = useState(false)
  const [parentLoggedIn, setParentLoggedIn] = useState(false)
  const [teacherId, setTeacherId] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const generated = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    setStars(generated)
  }, [])

  const [assignments, setAssignments] = useState<any[]>(() => {
  const saved = localStorage.getItem('reworked_assignments')
  return saved ? JSON.parse(saved) : []
})

const handleAssignmentCreated = (assignment: any) => {
  setAssignments(prev => {
    const updated = [...prev, assignment]
    localStorage.setItem('reworked_assignments', JSON.stringify(updated))
    return updated
  })
}

const handleAssignmentCompleted = (assignmentId: string | number, score: number, total: number) => {
  setAssignments(prev => {
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0
    const completedAt = new Date().toLocaleDateString('en-GB')

    const updated = prev.map(assignment => {
      if (assignment.id !== assignmentId) return assignment

      const existingStudents = Array.isArray(assignment.students) ? assignment.students : []
      const arnav = existingStudents.find((student: any) => student.name === 'Arnav Jain')

      const updatedArnav = {
        name: 'Arnav Jain',
        avatar: arnav?.avatar ?? '🐼',
        completed: true,
        accuracy,
        timeSpent: arnav?.timeSpent ?? '—',
        attempts: (arnav?.attempts ?? 0) + 1,
      }

      const students = arnav
        ? existingStudents.map((student: any) =>
            student.name === 'Arnav Jain' ? updatedArnav : student
          )
        : [...existingStudents, updatedArnav]

      return {
        ...assignment,
        completed: true,
        score: accuracy,
        accuracy,
        completedAt,
        completedBy: 'Arnav Jain',
        students,
      }
    })

    localStorage.setItem('reworked_assignments', JSON.stringify(updated))
    return updated
  })
}

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault()

  setLoginError('')

  const validStudent =
    userType === 'student' &&
    username === 'Arnav Jain' &&
    password === 'IHateMakingPasswords'

  const validParent =
    userType === 'parent' &&
    username === 'Atul Jain' &&
    password === 'MySonIsFunny'

  if (!validStudent && !validParent) {
    setLoginError(
      userType === 'student'
        ? 'INVALID PLAYER CREDENTIALS'
        : 'INVALID PARENT CREDENTIALS'
    )
    return
  }

  setIsLoading(true)

  setTimeout(() => {
    setIsLoading(false)

    if (validStudent) {
      setPlayerLoggedIn(true)
    }

    if (validParent) {
      setParentLoggedIn(true)
    }
  }, 800)
}
const handleTeacherLogin = (e: React.FormEvent) => {
  e.preventDefault()

  setLoginError('')

  const validTeacher =
    teacherId === 'Verma1227' &&
    teacherPassword === 'VermaLovesTeaching'

  if (!validTeacher) {
    setLoginError('INVALID STAFF CREDENTIALS')
    return
  }

  setIsLoading(true)

  setTimeout(() => {
    setIsLoading(false)
    setTeacherLoggedIn(true)
  }, 800)
}

  if (teacherLoggedIn) return (
  <TeacherDashboard
    onLogout={() => {
      setTeacherLoggedIn(false)
      setTeacherId('')
      setTeacherPassword('')
    }}
    onAssignmentCreated={handleAssignmentCreated}
    assignments={assignments}
  />
)
  if (playerLoggedIn) return (
  <PlayerDashboard
      onLogout={() => {
        setPlayerLoggedIn(false)
        setUsername('')
        setPassword('')
      }}
      assignments={assignments}
      onAssignmentCompleted={handleAssignmentCompleted}
  />
)
  if (parentLoggedIn)  return <ParentDashboard  onLogout={() => { setParentLoggedIn(false); setUsername(''); setPassword('') }} />

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f28 50%, #0a0a1a 100%)' }}
    >
      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Scanline overlay */}
      <div className="scanline-overlay" />
      {loginError && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{
      background: 'rgba(0,0,0,0.55)',
    }}
  >
    <div
      style={{
        width: 'min(420px, 90vw)',
        background: '#080812',
        border: '2px solid #ff2d78',
        boxShadow: '0 0 30px rgba(255,45,120,0.45)',
        padding: '28px',
        textAlign: 'center',
      }}
    >
      <div
        className="font-pixel"
        style={{
          color: '#ff2d78',
          fontSize: '18px',
          letterSpacing: '2px',
          textShadow: '0 0 10px #ff2d78',
          marginBottom: '14px',
        }}
      >
        ACCESS DENIED
      </div>

      <div
        className="font-pixel"
        style={{
          color: '#aaaacc',
          fontSize: '9px',
          letterSpacing: '1px',
          marginBottom: '24px',
        }}
      >
        {loginError}
      </div>

      <button
        type="button"
        onClick={() => setLoginError('')}
        style={{
          background: '#ff2d78',
          color: '#080812',
          border: 'none',
          padding: '12px 28px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 0 15px rgba(255,45,120,0.4)',
        }}
      >
        DISMISS
      </button>
    </div>
  </div>
)}

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating game chips — left side */}
      {GAME_CHIPS.filter(c => c.left).map((chip, i) => (
        <div
          key={chip.label}
          className="absolute hidden lg:flex flex-col items-center gap-2 game-chip"
          style={{
            top: chip.top,
            left: chip.left,
            animationDelay: chip.delay,
          }}
        >
          <div
            className="p-3 rounded-lg border-2 backdrop-blur-sm"
            style={{
              borderColor: chip.color,
              background: `rgba(10,10,26,0.8)`,
              boxShadow: `0 0 12px ${chip.color}44`,
            }}
          >
            {chip.icon}
          </div>
          <span
            className="font-pixel text-center leading-tight"
            style={{
              fontSize: '7px',
              color: chip.color,
              textShadow: `0 0 8px ${chip.color}`,
              maxWidth: '80px',
            }}
          >
            {chip.label}
          </span>
        </div>
      ))}

      {/* Floating game chips — right side */}
      {GAME_CHIPS.filter(c => c.right).map((chip, i) => (
        <div
          key={chip.label}
          className="absolute hidden lg:flex flex-col items-center gap-2 game-chip"
          style={{
            top: chip.top,
            right: chip.right,
            animationDelay: chip.delay,
          }}
        >
          <div
            className="p-3 rounded-lg border-2 backdrop-blur-sm"
            style={{
              borderColor: chip.color,
              background: `rgba(10,10,26,0.8)`,
              boxShadow: `0 0 12px ${chip.color}44`,
            }}
          >
            {chip.icon}
          </div>
          <span
            className="font-pixel text-center leading-tight"
            style={{
              fontSize: '7px',
              color: chip.color,
              textShadow: `0 0 8px ${chip.color}`,
              maxWidth: '80px',
            }}
          >
            {chip.label}
          </span>
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        {/* Logo & title */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 flex items-center justify-center border-2 rounded"
              style={{ borderColor: '#00f5ff', background: '#050510', boxShadow: '0 0 20px #00f5ff55' }}
            >
              <span style={{ fontSize: '24px' }}>🎮</span>
            </div>
            <h1
              className="font-pixel arcade-flicker"
              style={{
                fontSize: 'clamp(18px, 4vw, 32px)',
                color: '#00f5ff',
                textShadow: '0 0 20px #00f5ff, 0 0 40px #00f5ff88',
                letterSpacing: '4px',
              }}
            >
              REWORKED
            </h1>
          </div>
          <p
            className="font-pixel text-center"
            style={{
              fontSize: '8px',
              color: '#ffe600',
              textShadow: '0 0 8px #ffe600',
              letterSpacing: '3px',
              marginTop: '4px',
            }}
          >
            LEARN · PLAY · LEVEL UP
          </p>

          {/* XP bar decoration */}
          <div className="mt-4 flex items-center gap-2">
            <span className="font-pixel" style={{ fontSize: '7px', color: '#39ff14' }}>XP</span>
            <div
              className="w-40 h-3 rounded-sm border"
              style={{ borderColor: '#39ff14', background: '#050510' }}
            >
              <div
                className="h-full rounded-sm"
                style={{
                  width: '68%',
                  background: 'linear-gradient(90deg, #39ff14, #ffe600)',
                  boxShadow: '0 0 8px #39ff14',
                }}
              />
            </div>
            <span className="font-pixel" style={{ fontSize: '7px', color: '#39ff14' }}>68%</span>
          </div>
        </div>

        {/* Login panel */}
        <div
          className="w-full max-w-sm relative"
          style={{
            border: '3px solid #2a2a5a',
            background: 'rgba(10,10,26,0.95)',
            boxShadow: '0 0 40px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Panel corner decorators */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(pos => (
            <div
              key={pos}
              className={`absolute w-3 h-3 ${pos}`}
              style={{
                border: '2px solid #00f5ff',
                boxShadow: '0 0 6px #00f5ff',
              }}
            />
          ))}

          {/* Panel header */}
          <div
            className="px-6 py-3 border-b-2 flex items-center justify-between"
            style={{ borderColor: '#2a2a5a', background: 'rgba(0,245,255,0.04)' }}
          >
            <span className="font-pixel" style={{ fontSize: '9px', color: '#00f5ff' }}>
              INSERT COIN
            </span>
            <div className="flex gap-1.5">
              {['#ff2d78', '#ffe600', '#39ff14'].map(c => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Player type toggle */}
            <div
              className="flex mb-6 border-2 overflow-hidden"
              style={{ borderColor: '#2a2a5a' }}
            >
              {([
                { id: 'student', label: '🎮 PLAYER', color: '#00f5ff' },
                { id: 'parent',  label: '👤 PARENT', color: '#bf5fff' },
                { id: 'teacher', label: '📋 TEACHER', color: '#39ff14' },
              ] as const).map((tab, i, arr) => (
                <button
                  key={tab.id}
                  onClick={() => setUserType(tab.id)}
                  className="flex-1 py-2.5 font-pixel transition-all"
                  style={{
                    fontSize: '7px',
                    letterSpacing: '0.5px',
                    background: userType === tab.id ? `${tab.color}22` : 'transparent',
                    color: userType === tab.id ? tab.color : '#3a3a7a',
                    borderRight: i < arr.length - 1 ? '1px solid #2a2a5a' : 'none',
                    textShadow: userType === tab.id ? `0 0 8px ${tab.color}` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {userType !== 'teacher' ? (
              <>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  {/* Username */}
                  <div>
                    <label className="font-pixel block mb-2" style={{ fontSize: '8px', color: '#7a7aaa', letterSpacing: '1px' }}>
                      USERNAME
                    </label>
                    <input
                      className="pixel-input"
                      type="text"
                      placeholder="ENTER NAME..."
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="font-pixel block mb-2" style={{ fontSize: '8px', color: '#7a7aaa', letterSpacing: '1px' }}>
                      PASSWORD
                    </label>
                    <input
                      className="pixel-input"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !username}
                    className="pixel-btn mt-2 py-3.5"
                    style={{
                      borderColor: userType === 'parent' ? '#bf5fff' : '#00f5ff',
                      background: !username ? 'transparent' : 'linear-gradient(135deg, #00f5ff18, #bf5fff18)',
                      color: userType === 'parent' ? '#bf5fff' : '#00f5ff',
                      textShadow: username ? `0 0 10px ${userType === 'parent' ? '#bf5fff' : '#00f5ff'}` : 'none',
                      boxShadow: username ? `0 0 16px ${userType === 'parent' ? '#bf5fff' : '#00f5ff'}44` : 'none',
                      cursor: !username ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading
                      ? <span style={{ animation: 'blink 0.6s infinite' }}>LOADING...</span>
                      : '▶ START GAME'
                    }
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: '#2a2a5a' }} />
                  <span className="font-pixel" style={{ fontSize: '7px', color: '#3a3a7a' }}>OR</span>
                  <div className="flex-1 h-px" style={{ background: '#2a2a5a' }} />
                </div>

                <button
                  className="pixel-btn w-full py-3"
                  style={{
                    borderColor: '#bf5fff',
                    background: 'transparent',
                    color: '#bf5fff',
                    textShadow: '0 0 8px #bf5fff',
                    boxShadow: '0 0 12px #bf5fff22',
                  }}
                >
                  ✦ NEW PLAYER
                </button>

                <div className="text-center mt-4">
                  <button
                    className="font-pixel"
                    style={{ fontSize: '7px', color: '#3a3a7a', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffe600')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3a3a7a')}
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>
              </>
            ) : (
              /* ── TEACHER LOGIN ── */
              <form onSubmit={handleTeacherLogin} className="flex flex-col gap-4">
                <div>
                  <label className="font-pixel block mb-2" style={{ fontSize: '8px', color: '#7a7aaa', letterSpacing: '1px' }}>
                    TEACHER ID
                  </label>
                  <input
                    className="pixel-input"
                    type="text"
                    placeholder="STAFF ID..."
                    autoComplete="username"
                    value={teacherId}
                    onChange={e => setTeacherId(e.target.value)}
                    style={{ caretColor: '#39ff14', color: '#39ff14' }}
                  />
                </div>
                <div>
                  <label className="font-pixel block mb-2" style={{ fontSize: '8px', color: '#7a7aaa', letterSpacing: '1px' }}>
                    PASSWORD
                  </label>
                  <input
                    className="pixel-input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={teacherPassword}
                    onChange={e => setTeacherPassword(e.target.value)}
                    style={{ caretColor: '#39ff14', color: '#39ff14' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !teacherId}
                  className="pixel-btn mt-2 py-3.5"
                  style={{
                    borderColor: '#39ff14',
                    background: 'linear-gradient(135deg, #39ff1418, #ffe60008)',
                    color: !teacherId ? '#1e4a1e' : '#39ff14',
                    textShadow: teacherId ? '0 0 10px #39ff14' : 'none',
                    boxShadow: teacherId ? '0 0 16px #39ff1444' : 'none',
                    cursor: !teacherId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading
                    ? <span style={{ animation: 'blink 0.6s infinite' }}>LOADING...</span>
                    : '▶ ENTER PORTAL'
                  }
                </button>
                <div className="text-center">
                  <button type="button" className="font-pixel"
                    style={{ fontSize: '7px', color: '#3a3a7a', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffe600')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3a3a7a')}
                  >FORGOT PASSWORD?</button>
                </div>
              </form>
            )}
          </div>

          {/* Lives / credits footer */}
          <div
            className="px-6 py-3 border-t-2 flex items-center justify-between"
            style={{ borderColor: '#2a2a5a', background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '12px' }}>❤️❤️❤️</span>
              <span className="font-pixel" style={{ fontSize: '7px', color: '#ff2d78' }}>3 LIVES</span>
            </div>
            <span className="font-pixel" style={{ fontSize: '7px', color: '#3a3a7a' }}>
              © 2026 REWORKED
            </span>
          </div>
        </div>

        {/* Help text */}
        <p
          className="font-body text-center mt-6"
          style={{ fontSize: '13px', color: '#4a4a8a', maxWidth: '320px', lineHeight: 1.5 }}
        >
          Ask a grown-up to help you sign up if this is your first time!
        </p>
      </div>

      {/* Bottom ticker */}
      <div
        className="fixed bottom-0 left-0 right-0 overflow-hidden border-t-2 z-20"
        style={{
          borderColor: '#ff2d78',
          background: 'rgba(10,10,26,0.95)',
          boxShadow: '0 -4px 20px rgba(255,45,120,0.2)',
          height: '36px',
        }}
      >
        <div className="ticker-track h-full flex items-center">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={`ticker-${i}`}
              className="font-pixel whitespace-nowrap px-6"
              style={{
                fontSize: '9px',
                color: i % 2 === 0 ? '#ff2d78' : '#ffe600',
                textShadow: i % 2 === 0 ? '0 0 8px #ff2d78' : '0 0 8px #ffe600',
              }}
            >
              {item} ★
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}