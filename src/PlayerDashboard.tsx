import { useState } from 'react'
import CyberpunkBiking from './games/CyberpunkBiking'
import { getXPProgress, type User } from './userData'
const GAME_COLORS: Record<string, string> = {
  'Dragon Dungeon':     '#ff7c2a',
  'Cavern Combat':      '#bf5fff',
  'Princess Run':       '#ff2d78',
  'Ninja Academy':      '#aaaacc',
  'Cyberpunk Biking':   '#ffe600',
  'Musical Tiles':      '#bf5fff',
  'Fairy Workshop':     '#00f5ff',
  'Unicorn Care':       '#ff2d78',
  'Spaceship Shootout': '#39ff14',
}

const GAME_ICONS: Record<string, string> = {
  'Dragon Dungeon': '🐉', 'Cavern Combat': '⚔️', 'Princess Run': '👑',
  'Ninja Academy': '🥷', 'Cyberpunk Biking': '⚡', 'Musical Tiles': '🎵',
  'Fairy Workshop': '🧚', 'Unicorn Care': '🦄', 'Spaceship Shootout': '🚀',
}

const PLAYER = {
  name: 'Arnav',
  avatar: '🐼',
  level: 12,
  xp: 3480,
  xpNext: 4000,
  grade: 'Year 3',
  streak: 7,
  totalStars: 48,
}

const ACTIVE_QUESTS = [
  { id: 1, title: 'Times Tables Challenge', game: 'Dragon Dungeon',     teacher: 'Mr. Shreenath Verma', dueDate: '2026-8-18', attempts: 1, bestScore: 78 },
  { id: 2, title: 'Spelling Blast',         game: 'Ninja Academy',      teacher: 'Mr. Shreenath Verma', dueDate: '2026-8-20', attempts: 0, bestScore: 0 },
  { id: 3, title: 'Fraction Fun',           game: 'Musical Tiles',      teacher: 'Mr. Davies',  dueDate: '2026-8-22', attempts: 2, bestScore: 91 },
]

const COMPLETED_QUESTS = [
  { id: 4, title: 'Addition Race',    game: 'Spaceship Shootout', date: '10-8-2026', score: 94, stars: 3 },
  { id: 5, title: 'Word Families',    game: 'Fairy Workshop',     date: '27-8-2026', score: 82, stars: 3 },
  { id: 6, title: 'Shape Sorter',     game: 'Cavern Combat',      date: '20-8-2026', score: 67, stars: 2 },
  { id: 7, title: 'Colour Mixing',    game: 'Princess Run',       date: '14-8-2026', score: 88, stars: 3 },
]

const ACHIEVEMENTS = [
  { icon: '🔥', label: '7-Day Streak',    color: '#ff7c2a', unlocked: true  },
  { icon: '⭐', label: 'First Quest',      color: '#ffe600', unlocked: true  },
  { icon: '🏆', label: 'Perfect Score',   color: '#ffe600', unlocked: true  },
  { icon: '⚡', label: 'Speed Runner',    color: '#00f5ff', unlocked: true  },
  { icon: '🎯', label: 'Sharp Shooter',   color: '#39ff14', unlocked: false },
  { icon: '👑', label: 'Top of Class',    color: '#ff2d78', unlocked: false },
  { icon: '🌟', label: 'All Games Done',  color: '#bf5fff', unlocked: false },
  { icon: '💎', label: 'Diamond Rank',    color: '#00f5ff', unlocked: false },
]

const LEADERBOARD = [
  { rank: 1, name: 'Mason L.',    avatar: '🐻', xp: 4800, streak: 14 },
  { rank: 2, name: 'Emma C.',     avatar: '🐱', xp: 4200, streak: 10 },
  { rank: 3, name: 'Arnav S.',   avatar: '🐼', xp: 3480, streak: 7,  isMe: true },
  { rank: 4, name: 'Liam F.',     avatar: '🦊', xp: 3100, streak: 5 },
  { rank: 5, name: 'Isabella C.', avatar: '🦋', xp: 2900, streak: 3 },
]

function StarRating({ count }: { count: number }) {
  return (
    <span>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ opacity: i <= count ? 1 : 0.2, fontSize: '12px' }}>⭐</span>
      ))}
    </span>
  )
}

function AccuracyBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-sm" style={{ background: '#0a0a22', border: '1px solid #1e1e4a' }}>
        <div className="h-full rounded-sm" style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}88`, transition: 'width 0.6s ease' }} />
      </div>
      <span className="font-pixel shrink-0" style={{ fontSize: '7px', color, minWidth: '28px', textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

function getDueInfo(value: string | undefined, completed: boolean) {
  if (completed) {
    return { label: 'COMPLETED', color: '#39ff14' }
  }

  if (!value) {
    return { label: 'NO DUE DATE', color: '#4a4a8a' }
  }

  const match = /^(\\d{4})-(\\d{1,2})-(\\d{1,2})$/.exec(value)
  if (!match) {
    return { label: `DUE ${value}`, color: '#4a4a8a' }
  }

  const [, year, month, day] = match
  const due = new Date(Number(year), Number(month) - 1, Number(day))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return { label: `OVERDUE ${days}D`, color: '#ff2d78' }
  }

  if (diffDays === 0) {
    return { label: 'DUE TODAY', color: '#ff2d78' }
  }

  if (diffDays === 1) {
    return { label: 'DUE TOMORROW', color: '#ffe600' }
  }

  if (diffDays <= 7) {
    return { label: `DUE IN ${diffDays}D`, color: '#ffe600' }
  }

  return { label: `DUE IN ${diffDays}D`, color: '#4a4a8a' }
}

// ── Active Quests ──────────────────────────────────────────────────────────
function ActiveQuests({
  assignments,
  onPlay,
}: {
  assignments: any[]
  onPlay: (assignment: any) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '24px' }}>🗺️</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#ffe600', textShadow: '0 0 8px #ffe600', letterSpacing: '2px' }}>ACTIVE QUESTS</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>Homework waiting to be conquered!</p>
        </div>
      </div>

      {assignments.map(q => {
        const color = GAME_COLORS[q.game]
        const done = Boolean(q.completed)
        const dueInfo = getDueInfo(q.dueDate, done)
        return (
          <div key={q.id} className="flex flex-col gap-3 p-4"
            style={{ border: `1px solid ${done ? color + '55' : '#1e1e4a'}`, background: done ? `${color}08` : 'rgba(10,10,30,0.8)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '28px' }}>{GAME_ICONS[q.game]}</span>
              <div className="flex-1">
                <p className="font-pixel" style={{ fontSize: '9px', color: '#e8e8ff', letterSpacing: '1px' }}>{q.title.toUpperCase()}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-body" style={{ fontSize: '11px', color }}>{q.game}</span>
                  <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>Set by {q.teacher}</span>
                  <span
                    className="font-pixel px-2 py-1"
                    style={{
                      fontSize: '6px',
                      color: dueInfo.color,
                      border: `1px solid ${dueInfo.color}44`,
                      background: `${dueInfo.color}0d`,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {dueInfo.label}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {done ? (
                  <>
                    <p className="font-pixel" style={{ fontSize: '16px', color, textShadow: `0 0 10px ${color}` }}>
  {Number(q.score ?? q.accuracy ?? 0)}%
</p>
                    <p className="font-pixel mt-0.5" style={{ fontSize: '6px', color: '#4a4a8a' }}>BEST SCORE</p>
                  </>
                ) : (
                  <span className="font-pixel px-2 py-1" style={{ fontSize: '7px', color: '#ffe600', background: 'rgba(255,230,0,0.1)', border: '1px solid #ffe60033' }}>NEW!</span>
                )}
              </div>
            </div>
            {done && <AccuracyBar value={Number(q.score ?? q.accuracy ?? 0)} color={color} />}
            <div className="flex items-center justify-between">
              <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>
                {done ? 'Quest completed!' : 'Not started yet'}
              </span>
              <button onClick={() => onPlay(q)} className="pixel-btn px-4 py-2"
                style={{ borderColor: color, color, background: `${color}14`, fontSize: '8px', textShadow: `0 0 8px ${color}`, boxShadow: `0 0 12px ${color}22` }}>
                {done ? '▶ RETRY' : '▶ PLAY NOW'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── My Stats ───────────────────────────────────────────────────────────────
function MyStats({ player }: { player: User & { grade: string } }) {
  const gameScores = [
    { game: 'Spaceship Shootout', score: 94, plays: 3 },
    { game: 'Dragon Dungeon',     score: 78, plays: 1 },
    { game: 'Fairy Workshop',     score: 82, plays: 2 },
    { game: 'Musical Tiles',      score: 91, plays: 2 },
    { game: 'Cavern Combat',      score: 67, plays: 1 },
    { game: 'Princess Run',       score: 88, plays: 2 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-1">
        <span style={{ fontSize: '24px' }}>📊</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#00f5ff', textShadow: '0 0 8px #00f5ff', letterSpacing: '2px' }}>MY STATS</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>Your performance across all game worlds</p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'TOTAL XP',    value: player.xp.toLocaleString(), icon: '⚡', color: '#ffe600' },
          { label: 'LEVEL',       value: player.level,               icon: '🏅', color: '#00f5ff' },
          { label: 'DAY STREAK',  value: player.streak,              icon: '🔥', color: '#ff7c2a' },
          { label: 'TOTAL STARS', value: player.totalStars,          icon: '⭐', color: '#ffe600' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center py-4 gap-1"
            style={{ border: `1px solid ${s.color}44`, background: `${s.color}08` }}>
            <span style={{ fontSize: '22px', filter: `drop-shadow(0 0 6px ${s.color})` }}>{s.icon}</span>
            <span className="font-pixel" style={{ fontSize: '18px', color: s.color, textShadow: `0 0 12px ${s.color}` }}>{s.value}</span>
            <span className="font-pixel" style={{ fontSize: '6px', color: '#4a4a8a', letterSpacing: '1px' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* XP bar */}
      {(() => {
        const xpProgress = getXPProgress(player)
        return (
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-pixel" style={{ fontSize: '7px', color: '#4a4a8a' }}>
                LEVEL {player.level}
              </span>
              <span className="font-pixel" style={{ fontSize: '7px', color: '#ffe600' }}>
                {xpProgress.current.toLocaleString()} / {xpProgress.next.toLocaleString()} XP
              </span>
              <span className="font-pixel" style={{ fontSize: '7px', color: '#4a4a8a' }}>
                LEVEL {player.level + 1}
              </span>
            </div>
            <div className="w-full h-4 rounded-sm" style={{ background: '#0a0a22', border: '1px solid #1e1e4a' }}>
              <div
                className="h-full rounded-sm relative overflow-hidden transition-all"
                style={{
                  width: `${xpProgress.progress}%`,
                  background: 'linear-gradient(90deg, #ffe600, #ff7c2a)',
                  boxShadow: '0 0 10px #ffe60088',
                }}
              >
                <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px)' }} />
              </div>
            </div>
            <p className="font-body mt-1 text-center" style={{ fontSize: '11px', color: '#4a4a8a' }}>
              {xpProgress.remaining.toLocaleString()} XP TO LEVEL UP
            </p>
          </div>
        )
      })()}

      {/* Per-game scores */}
      <div>
        <p className="font-pixel mb-3" style={{ fontSize: '8px', color: '#4a4a8a', letterSpacing: '1px' }}>ACCURACY BY GAME WORLD</p>
        <div className="flex flex-col gap-3">
          {gameScores.map(g => {
            const color = GAME_COLORS[g.game]
            return (
              <div key={g.game}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: '14px' }}>{GAME_ICONS[g.game]}</span>
                  <span className="font-pixel flex-1" style={{ fontSize: '7px', color: '#8888aa', letterSpacing: '0.5px' }}>{g.game.toUpperCase()}</span>
                  <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>{g.plays} play{g.plays !== 1 ? 's' : ''}</span>
                </div>
                <AccuracyBar value={g.score} color={color} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Completed Quests ───────────────────────────────────────────────────────
function CompletedQuests({ assignments }: { assignments: any[] }) {
  const dynamicCompleted = assignments.filter(q => q.completed)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '24px' }}>🏆</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#39ff14', textShadow: '0 0 8px #39ff14', letterSpacing: '2px' }}>COMPLETED QUESTS</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>{COMPLETED_QUESTS.length} quests conquered!</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {COMPLETED_QUESTS.map(q => {
          const color = GAME_COLORS[q.game]
          return (
            <div key={q.id} className="flex items-center gap-3 px-4 py-3"
              style={{ border: '1px solid #1e1e4a', background: 'rgba(10,10,30,0.8)' }}>
              <span style={{ fontSize: '22px' }}>{GAME_ICONS[q.game]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-pixel" style={{ fontSize: '8px', color: '#c8c8e8', letterSpacing: '0.5px' }}>{q.title.toUpperCase()}</p>
                <p className="font-body mt-0.5" style={{ fontSize: '11px', color }}>{q.game}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <StarRating count={q.stars} />
                <div className="text-right">
                  <p className="font-pixel" style={{ fontSize: '14px', color: q.score >= 80 ? '#39ff14' : q.score >= 60 ? '#ffe600' : '#ff2d78', textShadow: `0 0 8px currentColor` }}>{q.score}%</p>
                  <p className="font-pixel" style={{ fontSize: '6px', color: '#2e2e5e' }}>{q.date}</p>
                </div>
              </div>
            </div>
          )
        })}

        {dynamicCompleted.map(q => {
          const color = GAME_COLORS[q.game] ?? '#39ff14'
          const score = Number(q.score ?? q.accuracy ?? 0)
          return (
            <div key={`dynamic-${q.id}`} className="flex items-center gap-3 px-4 py-3"
              style={{ border: `1px solid ${color}44`, background: `${color}08` }}>
              <span style={{ fontSize: '22px' }}>{GAME_ICONS[q.game] ?? '⚡'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-pixel" style={{ fontSize: '8px', color: '#c8c8e8', letterSpacing: '0.5px' }}>{String(q.title ?? 'QUEST').toUpperCase()}</p>
                <p className="font-body mt-0.5" style={{ fontSize: '11px', color }}>{q.game}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <StarRating count={score >= 90 ? 3 : score >= 70 ? 2 : 1} />
                <div className="text-right">
                  <p className="font-pixel" style={{ fontSize: '14px', color: score >= 80 ? '#39ff14' : score >= 60 ? '#ffe600' : '#ff2d78', textShadow: `0 0 8px currentColor` }}>{score}%</p>
                  <p className="font-pixel" style={{ fontSize: '6px', color: '#2e2e5e' }}>{q.completedAt ?? 'COMPLETED'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Achievements ───────────────────────────────────────────────────────────
function Achievements() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '24px' }}>🎖️</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#bf5fff', textShadow: '0 0 8px #bf5fff', letterSpacing: '2px' }}>ACHIEVEMENTS</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>{ACHIEVEMENTS.filter(a => a.unlocked).length} of {ACHIEVEMENTS.length} unlocked</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map((a, i) => (
          <div key={i} className="flex flex-col items-center gap-2 py-4 px-2 transition-all"
            style={{
              border: `1px solid ${a.unlocked ? a.color + '66' : '#1e1e4a'}`,
              background: a.unlocked ? `${a.color}0d` : 'rgba(10,10,22,0.5)',
              boxShadow: a.unlocked ? `0 0 16px ${a.color}22` : 'none',
              opacity: a.unlocked ? 1 : 0.4,
            }}>
            <span style={{ fontSize: '28px', filter: a.unlocked ? `drop-shadow(0 0 8px ${a.color})` : 'grayscale(1)' }}>{a.icon}</span>
            <span className="font-pixel text-center leading-tight" style={{ fontSize: '7px', color: a.unlocked ? a.color : '#2e2e5e', letterSpacing: '0.5px' }}>
              {a.label.toUpperCase()}
            </span>
            {!a.unlocked && (
              <span className="font-pixel" style={{ fontSize: '6px', color: '#2e2e5e' }}>LOCKED 🔒</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Leaderboard ────────────────────────────────────────────────────────────
function Leaderboard() {
  const rankColors = ['#ffe600', '#aaaacc', '#ff7c2a']

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '24px' }}>🥇</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#ffe600', textShadow: '0 0 8px #ffe600', letterSpacing: '2px' }}>CLASS LEADERBOARD</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>Year 3 · This Week</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {LEADERBOARD.map(p => {
          const rankColor = rankColors[p.rank - 1] ?? '#4a4a8a'
          return (
            <div key={p.rank} className="flex items-center gap-3 px-4 py-3 transition-all"
              style={{
                border: `1px solid ${p.isMe ? '#00f5ff55' : '#1e1e4a'}`,
                background: p.isMe ? 'rgba(0,245,255,0.05)' : 'rgba(10,10,30,0.8)',
                boxShadow: p.isMe ? '0 0 20px rgba(0,245,255,0.1)' : 'none',
              }}>
              <span className="font-pixel w-6 text-center shrink-0" style={{ fontSize: '10px', color: rankColor, textShadow: `0 0 8px ${rankColor}` }}>
                {p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank - 1] : `#${p.rank}`}
              </span>
              <span style={{ fontSize: '22px' }}>{p.avatar}</span>
              <span className="font-body flex-1" style={{ fontSize: '14px', color: p.isMe ? '#00f5ff' : '#c8c8e8', fontWeight: p.isMe ? 700 : 400 }}>
                {p.name} {p.isMe && <span className="font-pixel" style={{ fontSize: '7px', color: '#00f5ff', marginLeft: '4px' }}>(YOU)</span>}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span style={{ fontSize: '12px' }}>🔥</span>
                <span className="font-pixel" style={{ fontSize: '7px', color: '#ff7c2a' }}>{p.streak}d</span>
                <span className="font-pixel" style={{ fontSize: '10px', color: '#ffe600', textShadow: '0 0 6px #ffe600' }}>{p.xp.toLocaleString()} XP</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center py-3"
        style={{ border: '1px dashed #1e1e4a', background: 'rgba(255,230,0,0.03)' }}>
        <p className="font-pixel text-center" style={{ fontSize: '8px', color: '#4a4a8a', letterSpacing: '1px' }}>
          🔥 KEEP YOUR STREAK TO CLIMB THE BOARD!
        </p>
      </div>
    </div>
  )
}

// ── Main Player Dashboard ──────────────────────────────────────────────────

export default function PlayerDashboard({
  onLogout,
  assignments,
  onAssignmentCompleted,
  currentUser,
}: {
  onLogout: () => void
  assignments: any[]
  onAssignmentCompleted: (assignmentId: string | number, score: number, total: number) => void
  currentUser: User
}) {
  const [view, setView] = useState<'quests' | 'stats' | 'completed' | 'achievements' | 'leaderboard'>('quests')

  const [activeGame, setActiveGame] = useState<any>(null)

  const player = { ...PLAYER, ...currentUser, grade: currentUser.year ?? PLAYER.grade }
  const visibleAssignments = assignments
    .filter(assignment =>
      (assignment.grade ?? assignment.targetYear) === currentUser.year,
    )
    .map(assignment => {
      const studentResult = Array.isArray(assignment.students)
        ? assignment.students.find((student: any) =>
            student.id === currentUser.id || student.name === currentUser.name,
          )
        : undefined

      return {
        ...assignment,
        completed: studentResult?.completed === true || assignment.completedBy === currentUser.name,
        score: studentResult?.accuracy ?? studentResult?.score ?? (assignment.completedBy === currentUser.name ? assignment.score : 0),
      }
    })

  const NAV = [
    { id: 'quests',       label: '🗺️ ACTIVE QUESTS',   color: '#ffe600',  desc: 'Play your homework' },
    { id: 'stats',        label: '📊 MY STATS',         color: '#00f5ff',  desc: 'Track your progress' },
    { id: 'completed',    label: '🏆 COMPLETED',        color: '#39ff14',  desc: 'View past quests' },
    { id: 'achievements', label: '🎖️ ACHIEVEMENTS',    color: '#bf5fff',  desc: 'Badges earned' },
    { id: 'leaderboard',  label: '🥇 LEADERBOARD',     color: '#ffe600',  desc: 'Class rankings' },
  ] as const

  if (activeGame) {
    return (
      <CyberpunkBiking
        questions={Array.isArray(activeGame.questions) ? activeGame.questions : []}
        onComplete={(score, total) => onAssignmentCompleted(activeGame.id, score, total)}
        onExit={() => setActiveGame(null)}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070714', color: '#e8e8ff' }}>
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-10" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: '#1e1e4a', background: 'rgba(7,7,20,0.97)', boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>🎮</span>
            <span className="font-pixel" style={{ fontSize: '12px', color: '#00f5ff', textShadow: '0 0 12px #00f5ff', letterSpacing: '3px' }}>REWORKED</span>
          </div>
          <div className="h-5 w-px" style={{ background: '#1e1e4a' }} />
          <span className="font-pixel" style={{ fontSize: '8px', color: '#ffe600', textShadow: '0 0 8px #ffe600', letterSpacing: '2px' }}>PLAYER HQ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>{player.avatar}</span>
            <div>
              <p className="font-pixel" style={{ fontSize: '8px', color: '#e8e8ff' }}>{player.name}</p>
              <p className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>{player.grade} · Lv.{player.level}</p>
            </div>
          </div>
          <button onClick={onLogout} className="pixel-btn px-4 py-2"
            style={{ borderColor: '#ff2d78', color: '#ff2d78', background: 'transparent', fontSize: '8px' }}>
            ⏻ LOGOUT
          </button>
        </div>
      </header>

      <div className="relative z-20 flex flex-1">
        {/* Sidebar */}
        <aside className="flex flex-col w-52 shrink-0 border-r py-6 px-3 gap-2"
          style={{ borderColor: '#1e1e4a', background: 'rgba(8,8,20,0.9)' }}>

          {/* Player card */}
          <div className="mb-4 flex flex-col items-center gap-2 py-4 px-2"
            style={{ border: '1px solid #1e1e4a', background: 'rgba(255,230,0,0.03)' }}>
            <span style={{ fontSize: '36px', filter: 'drop-shadow(0 0 8px #ffe600)' }}>{player.avatar}</span>
            <span className="font-pixel" style={{ fontSize: '10px', color: '#ffe600', textShadow: '0 0 8px #ffe600' }}>{player.name}</span>
            <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>{player.grade}</span>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ fontSize: '12px' }}>🔥</span>
              <span className="font-pixel" style={{ fontSize: '8px', color: '#ff7c2a' }}>{player.streak} DAY STREAK</span>
            </div>
            <div className="w-full mt-1">
              {(() => {
                const xpProgress = getXPProgress(player)
                return (
                  <>
                    <div className="flex justify-between mb-1">
                      <span className="font-pixel" style={{ fontSize: '6px', color: '#4a4a8a' }}>
                        LV {player.level}
                      </span>
                      <span className="font-pixel" style={{ fontSize: '6px', color: '#ffe600' }}>
                        {Math.round(xpProgress.progress)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-sm" style={{ background: '#0a0a22', border: '1px solid #1e1e4a' }}>
                      <div
                        className="h-full rounded-sm transition-all"
                        style={{
                          width: `${xpProgress.progress}%`,
                          background: 'linear-gradient(90deg,#ffe600,#ff7c2a)',
                          boxShadow: '0 0 6px #ffe600',
                        }}
                      />
                    </div>
                    <p className="font-pixel mt-1 text-center" style={{ fontSize: '5px', color: '#4a4a8a' }}>
                      {xpProgress.current.toLocaleString()} / {xpProgress.next.toLocaleString()} XP
                    </p>
                  </>
                )
              })()}
            </div>
          </div>

          {NAV.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className="text-left px-3 py-3 transition-all"
              style={{
                border: `1px solid ${view === item.id ? item.color : '#1e1e4a'}`,
                background: view === item.id ? `${item.color}14` : 'transparent',
                boxShadow: view === item.id ? `0 0 16px ${item.color}22` : 'none',
                cursor: 'pointer',
              }}>
              <p className="font-pixel" style={{ fontSize: '7px', color: view === item.id ? item.color : '#4a4a8a', textShadow: view === item.id ? `0 0 8px ${item.color}` : 'none', letterSpacing: '0.5px' }}>
                {item.label}
              </p>
              <p className="font-body mt-0.5" style={{ fontSize: '11px', color: '#2e2e5e' }}>{item.desc}</p>
            </button>
          ))}

          <div className="mt-auto px-1 py-2 text-center">
            <p className="font-pixel" style={{ fontSize: '7px', color: '#2e2e5e', letterSpacing: '1px' }}>⭐ {player.totalStars} TOTAL STARS</p>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 57px)' }}>
          {view === 'quests' && <ActiveQuests
  assignments={visibleAssignments}
  onPlay={(assignment) => setActiveGame(assignment)}
/>}
          {view === 'stats'        && <MyStats player={player} />}
          {view === 'completed'    && <CompletedQuests assignments={visibleAssignments} />}
          {view === 'achievements' && <Achievements />}
          {view === 'leaderboard'  && <Leaderboard />}
        </main>
      </div>

      {/* Ticker */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden border-t-2 z-30"
        style={{ borderColor: '#ffe600', background: 'rgba(7,7,20,0.97)', boxShadow: '0 -4px 20px rgba(255,230,0,0.1)', height: '32px' }}>
        <div className="ticker-track h-full flex items-center">
          {[...Array(2)].flatMap((_, ri) =>
            ['🐉 DRAGON DUNGEON','⚔️ CAVERN COMBAT','👑 PRINCESS RUN','🥷 NINJA ACADEMY',
             '⚡ CYBERPUNK BIKING','🎵 MUSICAL TILES','🧚 FAIRY WORKSHOP','🦄 UNICORN CARE','🚀 SPACESHIP SHOOTOUT']
              .map((item, i) => (
                <span key={`${ri}-${i}`} className="font-pixel whitespace-nowrap px-5"
                  style={{ fontSize: '7px', color: i % 2 === 0 ? '#ffe600' : '#ff7c2a', textShadow: i % 2 === 0 ? '0 0 6px #ffe600' : '0 0 6px #ff7c2a' }}>
                  {item} ★
                </span>
              ))
          )}
        </div>
      </div>
    </div>
  )}