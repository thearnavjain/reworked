import { useEffect, useMemo, useState } from 'react'
import { getChildren, type User } from './userData'

const GAME_COLORS: Record<string, string> = {
  'Dragon Dungeon': '#ff7c2a',
  'Cavern Combat': '#bf5fff',
  'Princess Run': '#ff2d78',
  'Ninja Academy': '#aaaacc',
  'Cyberpunk Biking': '#ffe600',
  'Musical Tiles': '#bf5fff',
  'Fairy Workshop': '#00f5ff',
  'Unicorn Care': '#ff2d78',
  'Spaceship Shootout': '#39ff14',
}

const GAME_ICONS: Record<string, string> = {
  'Dragon Dungeon': '🐉',
  'Cavern Combat': '⚔️',
  'Princess Run': '👑',
  'Ninja Academy': '🥷',
  'Cyberpunk Biking': '⚡',
  'Musical Tiles': '🎵',
  'Fairy Workshop': '🧚',
  'Unicorn Care': '🦄',
  'Spaceship Shootout': '🚀',
}

const FALLBACK_CHILD = {
  name: 'Arnav',
  avatar: '🐼',
  grade: 'Year 3',
  level: 12,
  xp: 3480,
  xpNext: 4000,
  streak: 7,
  totalStars: 48,
  teacher: 'Mr. Shreenath Verma',
}

type RawAssignment = {
  id?: number | string
  title?: string
  name?: string
  game?: string
  grade?: string
  date?: string
  targetYear?: string
  dueDate?: string
  due?: string
  instructions?: string
  description?: string
  completed?: boolean
  done?: boolean
  score?: number
  bestScore?: number
  accuracy?: number
  completedBy?: string
  completedById?: string
  students?: Array<{
    name?: string
    completed?: boolean
    accuracy?: number
    score?: number
    timeSpent?: string
    attempts?: number
  }>
}

type ParentAssignment = {
  id: number | string
  title: string
  game: string
  grade: string
  due: string
  done: boolean
  score: number
  attempts: number
  timeSpent: string
  date: string
}

function loadAssignments(): RawAssignment[] {
  try {
    const saved = localStorage.getItem('reworked_assignments')

    if (!saved) return []

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) return []

    return parsed
  } catch {
    return []
  }
}

function formatDate(value?: string) {
  if (!value) return 'NO DUE DATE'

  // yyyy-mm-dd
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${Number(day)}-${Number(month)}-${year}`
  }

  return value
}

function getStudentResult(
  assignment: RawAssignment,
  studentName: string,
) {
  const students = Array.isArray(assignment.students)
    ? assignment.students
    : []

  const result =
    students.find(s =>
      (s.name || '').toLowerCase().includes(studentName.toLowerCase()),
    )

  return result
}

function normalizeAssignment(
  assignment: RawAssignment,
  index: number,
  studentName: string,
): ParentAssignment {
  const studentResult = getStudentResult(assignment, studentName)

  const completedByThisStudent = assignment.completedBy === studentName
  const rawScore =
    studentResult?.accuracy ??
    studentResult?.score ??
    (completedByThisStudent ? assignment.accuracy ?? assignment.bestScore ?? assignment.score : 0) ??
    0

  const score = Number(rawScore) || 0

  const done =
    studentResult?.completed === true ||
    completedByThisStudent

  return {
    id: assignment.id ?? `assignment-${index}`,
    title:
      assignment.title ||
      assignment.name ||
      'Untitled Quest',
    game:
      assignment.game ||
      'Dragon Dungeon',
    grade:
      assignment.grade ||
      'Year 3',
    due:
      formatDate(assignment.dueDate || assignment.due),
    done,
    score,
    attempts:
      studentResult?.attempts ??
      (done ? 1 : 0),
    timeSpent:
      studentResult?.timeSpent ||
      '—',
    date:
      formatDate(assignment.date),
  }
}

function AccuracyBar({
  value,
  color,
}: {
  value: number
  color: string
}) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-2 rounded-sm"
        style={{
          background: '#0a0a22',
          border: '1px solid #1e1e4a',
        }}
      >
        <div
          className="h-full rounded-sm transition-all"
          style={{
            width: `${safeValue}%`,
            background: color,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>

      <span
        className="font-pixel shrink-0"
        style={{
          fontSize: '7px',
          color,
          minWidth: '32px',
          textAlign: 'right',
        }}
      >
        {safeValue}%
      </span>
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────

function Overview({
  selectedChild,
  assignments,
}: {
  selectedChild: typeof FALLBACK_CHILD
  assignments: ParentAssignment[]
}) {
  const completed = assignments.filter(a => a.done)
  const pending = assignments.filter(a => !a.done)

  const avgAccuracy = completed.length
    ? Math.round(
        completed.reduce((sum, a) => sum + a.score, 0) /
          completed.length,
      )
    : 0

  return (
    <div className="flex flex-col gap-6">

      {/* Hero */}
      <div
        className="flex items-center gap-5 p-5"
        style={{
          border: '2px solid #bf5fff44',
          background: 'rgba(191,95,255,0.05)',
          boxShadow: '0 0 30px rgba(191,95,255,0.08)',
        }}
      >
        <span
          style={{
            fontSize: '52px',
            filter: 'drop-shadow(0 0 12px #bf5fff)',
          }}
        >
          {selectedChild.avatar}
        </span>

        <div className="flex-1">
          <p
            className="font-pixel"
            style={{
              fontSize: '14px',
              color: '#bf5fff',
              textShadow: '0 0 12px #bf5fff',
              letterSpacing: '2px',
            }}
          >
            {selectedChild.name.toUpperCase()}
          </p>

          <p
            className="font-body mt-0.5"
            style={{
              fontSize: '13px',
              color: '#6a6a9a',
            }}
          >
            {selectedChild.grade} · {selectedChild.teacher}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <span
              className="font-pixel"
              style={{
                fontSize: '8px',
                color: '#ffe600',
              }}
            >
              Lv.{selectedChild.level}
            </span>

            <span style={{ fontSize: '12px' }}>🔥</span>

            <span
              className="font-pixel"
              style={{
                fontSize: '8px',
                color: '#ff7c2a',
              }}
            >
              {selectedChild.streak} DAY STREAK
            </span>
          </div>

          <div className="mt-2 w-64">
            <div className="flex justify-between mb-1">
              <span
                className="font-pixel"
                style={{
                  fontSize: '6px',
                  color: '#4a4a8a',
                }}
              >
                XP PROGRESS
              </span>

              <span
                className="font-pixel"
                style={{
                  fontSize: '6px',
                  color: '#ffe600',
                }}
              >
                {selectedChild.xp} / {selectedChild.xpNext}
              </span>
            </div>

            <div
              className="w-full h-3 rounded-sm"
              style={{
                background: '#0a0a22',
                border: '1px solid #1e1e4a',
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${Math.min(
                    100,
                    (selectedChild.xp /
                      selectedChild.xpNext) *
                      100,
                  )}%`,
                  background:
                    'linear-gradient(90deg,#ffe600,#ff7c2a)',
                  boxShadow: '0 0 8px #ffe60088',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'ACTIVE QUESTS',
            value: pending.length,
            icon: '📋',
            color: '#ffe600',
          },
          {
            label: 'COMPLETED',
            value: completed.length,
            icon: '✅',
            color: '#39ff14',
          },
          {
            label: 'AVG ACCURACY',
            value: `${avgAccuracy}%`,
            icon: '🎯',
            color: '#00f5ff',
          },
          {
            label: 'TOTAL QUESTS',
            value: assignments.length,
            icon: '🎮',
            color: '#bf5fff',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex flex-col items-center py-4 gap-1"
            style={{
              border: `1px solid ${stat.color}44`,
              background: `${stat.color}08`,
            }}
          >
            <span
              style={{
                fontSize: '22px',
                filter: `drop-shadow(0 0 6px ${stat.color})`,
              }}
            >
              {stat.icon}
            </span>

            <span
              className="font-pixel"
              style={{
                fontSize: '18px',
                color: stat.color,
                textShadow: `0 0 12px ${stat.color}`,
              }}
            >
              {stat.value}
            </span>

            <span
              className="font-pixel"
              style={{
                fontSize: '6px',
                color: '#4a4a8a',
                letterSpacing: '1px',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pending quests */}
      <div>
        <p
          className="font-pixel mb-3"
          style={{
            fontSize: '8px',
            color: '#ffe600',
            letterSpacing: '1px',
            textShadow: '0 0 6px #ffe600',
          }}
        >
          ⚠️ PENDING QUESTS
        </p>

        <div className="flex flex-col gap-2">
          {pending.map(assignment => {
            const color =
              GAME_COLORS[assignment.game] ||
              '#00f5ff'

            return (
              <div
                key={assignment.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  border: '1px solid #ffe60033',
                  background:
                    'rgba(255,230,0,0.04)',
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {GAME_ICONS[assignment.game] || '🎮'}
                </span>

                <div className="flex-1">
                  <p
                    className="font-pixel"
                    style={{
                      fontSize: '8px',
                      color: '#c8c8e8',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {assignment.title.toUpperCase()}
                  </p>

                  <p
                    className="font-body mt-0.5"
                    style={{
                      fontSize: '11px',
                      color,
                    }}
                  >
                    {assignment.game}
                  </p>
                </div>

                <span
                  className="font-pixel"
                  style={{
                    fontSize: '7px',
                    color: '#ffe600',
                    background:
                      'rgba(255,230,0,0.1)',
                    border:
                      '1px solid #ffe60033',
                    padding: '3px 8px',
                  }}
                >
                  DUE {assignment.due}
                </span>
              </div>
            )
          })}

          {pending.length === 0 && (
            <div
              className="flex items-center justify-center py-4"
              style={{
                border: '1px dashed #1e1e4a',
              }}
            >
              <p
                className="font-pixel text-center"
                style={{
                  fontSize: '8px',
                  color: '#39ff14',
                  textShadow:
                    '0 0 6px #39ff14',
                }}
              >
                ✅ ALL CAUGHT UP!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Assignments ──────────────────────────────────────────────────────────────

function Assignments({
  selectedChild,
  assignments,
}: {
  selectedChild: typeof FALLBACK_CHILD
  assignments: ParentAssignment[]
}) {
  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '22px' }}>📚</span>

        <div>
          <p
            className="font-pixel"
            style={{
              fontSize: '10px',
              color: '#00f5ff',
              textShadow: '0 0 8px #00f5ff',
              letterSpacing: '2px',
            }}
          >
            {selectedChild.name.toUpperCase()}'S ASSIGNMENTS
          </p>

          <p
            className="font-body"
            style={{
              fontSize: '12px',
              color: '#4a4a8a',
            }}
          >
            {assignments.length} total ·{' '}
            {assignments.filter(a => !a.done).length}{' '}
            pending
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-14 gap-3"
          style={{
            border: '1px dashed #1e1e4a',
          }}
        >
          <span style={{ fontSize: '34px' }}>📭</span>

          <p
            className="font-pixel"
            style={{
              fontSize: '8px',
              color: '#4a4a8a',
            }}
          >
            NO QUESTS ASSIGNED YET
          </p>

          <p
            className="font-body"
            style={{
              fontSize: '12px',
              color: '#2e2e5e',
            }}
          >
            New homework quests will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map(assignment => {
            const color =
              GAME_COLORS[assignment.game] ||
              '#00f5ff'

            return (
              <div
                key={assignment.id}
                className="p-4"
                style={{
                  border: `1px solid ${
                    assignment.done
                      ? color + '44'
                      : '#ffe60033'
                  }`,
                  background: assignment.done
                    ? `${color}07`
                    : 'rgba(255,230,0,0.03)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '24px' }}>
                    {GAME_ICONS[assignment.game] ||
                      '🎮'}
                  </span>

                  <div className="flex-1">
                    <p
                      className="font-pixel"
                      style={{
                        fontSize: '8px',
                        color: '#e8e8ff',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {assignment.title.toUpperCase()}
                    </p>

                    <p
                      className="font-body mt-0.5"
                      style={{
                        fontSize: '11px',
                        color,
                      }}
                    >
                      {assignment.game}
                    </p>

                    <p
                      className="font-body mt-0.5"
                      style={{
                        fontSize: '10px',
                        color: '#2e2e5e',
                      }}
                    >
                      {assignment.grade} · Assigned{' '}
                      {assignment.date || '—'}
                    </p>
                  </div>

                  {assignment.done ? (
                    <div className="text-right">
                      <p
                        className="font-pixel"
                        style={{
                          fontSize: '16px',
                          color:
                            assignment.score >= 80
                              ? '#39ff14'
                              : '#ffe600',
                          textShadow:
                            '0 0 8px currentColor',
                        }}
                      >
                        {assignment.score}%
                      </p>

                      <p
                        className="font-pixel"
                        style={{
                          fontSize: '6px',
                          color: '#4a4a8a',
                        }}
                      >
                        SCORE
                      </p>
                    </div>
                  ) : (
                    <span
                      className="font-pixel px-2 py-1"
                      style={{
                        fontSize: '7px',
                        color: '#ffe600',
                        background:
                          'rgba(255,230,0,0.1)',
                        border:
                          '1px solid #ffe60033',
                      }}
                    >
                      DUE {assignment.due}
                    </span>
                  )}
                </div>

                {assignment.done && (
                  <div className="mt-3">
                    <AccuracyBar
                      value={assignment.score}
                      color={
                        assignment.score >= 80
                          ? '#39ff14'
                          : assignment.score >= 60
                            ? '#ffe600'
                            : '#ff2d78'
                      }
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Game Progress ─────────────────────────────────────────────────────────────

function GameProgress({
  selectedChild,
  assignments,
}: {
  selectedChild: typeof FALLBACK_CHILD
  assignments: ParentAssignment[]
}) {
  const gameProgress = useMemo(() => {
    const map = new Map<
      string,
      {
        game: string
        accuracy: number
        plays: number
      }
    >()

    assignments
      .filter(a => a.done)
      .forEach(assignment => {
        const existing = map.get(
          assignment.game,
        )

        if (!existing) {
          map.set(assignment.game, {
            game: assignment.game,
            accuracy: assignment.score,
            plays: 1,
          })
        } else {
          const total =
            existing.accuracy * existing.plays

          existing.plays += 1

          existing.accuracy = Math.round(
            (total + assignment.score) /
              existing.plays,
          )
        }
      })

    return Array.from(map.values()).sort(
      (a, b) => b.accuracy - a.accuracy,
    )
  }, [assignments])

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center gap-3 mb-1">
        <span style={{ fontSize: '22px' }}>🎮</span>

        <div>
          <p
            className="font-pixel"
            style={{
              fontSize: '10px',
              color: '#39ff14',
              textShadow: '0 0 8px #39ff14',
              letterSpacing: '2px',
            }}
          >
            GAME PROGRESS
          </p>

          <p
            className="font-body"
            style={{
              fontSize: '12px',
              color: '#4a4a8a',
            }}
          >
            Accuracy across completed game
            worlds for {selectedChild.name}
          </p>
        </div>
      </div>

      {gameProgress.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3"
          style={{
            border: '1px dashed #1e1e4a',
          }}
        >
          <span style={{ fontSize: '32px' }}>
            🎮
          </span>

          <p
            className="font-pixel"
            style={{
              fontSize: '8px',
              color: '#2e2e5e',
            }}
          >
            NO GAME RESULTS YET
          </p>

          <p
            className="font-body"
            style={{
              fontSize: '12px',
              color: '#2e2e5e',
            }}
          >
            Results will appear here after
            quests are completed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {gameProgress.map(progress => {
            const color =
              GAME_COLORS[progress.game] ||
              '#00f5ff'

            return (
              <div
                key={progress.game}
                className="p-4"
                style={{
                  border:
                    '1px solid #1e1e4a',
                  background:
                    'rgba(10,10,30,0.8)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: '22px' }}>
                    {GAME_ICONS[progress.game] ||
                      '🎮'}
                  </span>

                  <div className="flex-1">
                    <p
                      className="font-pixel"
                      style={{
                        fontSize: '8px',
                        color: '#8888aa',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {progress.game.toUpperCase()}
                    </p>

                    <p
                      className="font-body mt-0.5"
                      style={{
                        fontSize: '11px',
                        color: '#4a4a8a',
                      }}
                    >
                      {progress.plays} play
                      {progress.plays !== 1
                        ? 's'
                        : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="font-pixel"
                      style={{
                        fontSize: '18px',
                        color,
                        textShadow: `0 0 10px ${color}`,
                      }}
                    >
                      {progress.accuracy}%
                    </p>
                  </div>
                </div>

                <AccuracyBar
                  value={progress.accuracy}
                  color={color}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function ActivityFeed({
  selectedChild,
  assignments,
}: {
  selectedChild: typeof FALLBACK_CHILD
  assignments: ParentAssignment[]
}) {
  const feed = assignments
    .slice()
    .reverse()
    .map(assignment => ({
      ...assignment,
      action: assignment.done
        ? 'completed'
        : 'assigned',
    }))

  const actionColor = (action: string) => {
    if (action === 'completed') return '#39ff14'
    if (action === 'assigned') return '#ffe600'
    return '#00f5ff'
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '22px' }}>📰</span>

        <div>
          <p
            className="font-pixel"
            style={{
              fontSize: '10px',
              color: '#bf5fff',
              textShadow: '0 0 8px #bf5fff',
              letterSpacing: '2px',
            }}
          >
            RECENT ACTIVITY
          </p>

          <p
            className="font-body"
            style={{
              fontSize: '12px',
              color: '#4a4a8a',
            }}
          >
            What {selectedChild.name} has
            been up to
          </p>
        </div>
      </div>

      {feed.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3"
          style={{
            border: '1px dashed #1e1e4a',
          }}
        >
          <span style={{ fontSize: '32px' }}>
            📰
          </span>

          <p
            className="font-pixel"
            style={{
              fontSize: '8px',
              color: '#2e2e5e',
            }}
          >
            NO ACTIVITY YET
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-0">

          <div
            className="absolute left-8 top-4 bottom-4 w-px"
            style={{
              background:
                'linear-gradient(#bf5fff44,transparent)',
            }}
          />

          {feed.map((item, index) => {
            const color = actionColor(
              item.action,
            )

            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-start gap-4 py-3 pl-2"
              >
                <div
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-sm mt-0.5 z-10"
                  style={{
                    background: '#070714',
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${color}66`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-sm"
                    style={{
                      background: color,
                    }}
                  />
                </div>

                <div
                  className="flex-1 flex flex-col gap-0.5 pb-3 border-b"
                  style={{
                    borderColor: '#0e0e2a',
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: '16px' }}>
                      🐼
                    </span>

                    <span
                      className="font-body"
                      style={{
                        fontSize: '13px',
                        color: '#c8c8e8',
                      }}
                    >
                      <span style={{ color }}>
                        {item.action}
                      </span>{' '}
                      <span
                        style={{
                          fontWeight: 700,
                        }}
                      >
                        "{item.title}"
                      </span>

                      <span
                        style={{
                          color:
                            GAME_COLORS[
                              item.game
                            ] || '#00f5ff',
                        }}
                      >
                        {' '}
                        in {item.game}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.done && (
                      <span
                        className="font-pixel"
                        style={{
                          fontSize: '7px',
                          color:
                            item.score >= 80
                              ? '#39ff14'
                              : '#ffe600',
                        }}
                      >
                        {item.score}% accuracy
                      </span>
                    )}

                    <span
                      className="font-body"
                      style={{
                        fontSize: '11px',
                        color: '#2e2e5e',
                      }}
                    >
                      {item.done
                        ? 'Completed'
                        : `Due ${item.due}`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Parent Dashboard ─────────────────────────────────────────────────────

export default function ParentDashboard({
  onLogout,
  currentUser,
}: {
  onLogout: () => void
  currentUser: User
}) {
  const [view, setView] = useState<
    'overview' |
    'assignments' |
    'progress' |
    'activity'
  >('overview')

  const [rawAssignments, setRawAssignments] =
    useState<RawAssignment[]>(() =>
      loadAssignments(),
    )

  /*
   * Refresh the parent data whenever the component
   * becomes visible again.
   *
   * This is useful when the teacher creates an
   * assignment in another dashboard and then the
   * parent dashboard is opened.
   */
  useEffect(() => {
    const refresh = () => {
      setRawAssignments(loadAssignments())
    }

    refresh()

    const interval = window.setInterval(
      refresh,
      1000,
    )

    window.addEventListener(
      'storage',
      refresh,
    )

    window.addEventListener(
      'focus',
      refresh,
    )

    return () => {
      window.clearInterval(interval)
      window.removeEventListener(
        'storage',
        refresh,
      )
      window.removeEventListener(
        'focus',
        refresh,
      )
    }
  }, [])

  const children = getChildren(currentUser)
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? '')
  const selectedChildUser = children.find(child => child.id === selectedChildId) ?? children[0]

  const child = selectedChildUser
    ? {
        ...FALLBACK_CHILD,
        name: selectedChildUser.name,
        avatar: selectedChildUser.avatar,
        grade: selectedChildUser.year ?? FALLBACK_CHILD.grade,
        level: selectedChildUser.level,
        xp: selectedChildUser.xp,
        xpNext: selectedChildUser.xpNext,
        streak: selectedChildUser.streak,
        totalStars: selectedChildUser.totalStars,
        teacher: selectedChildUser.teacher ?? FALLBACK_CHILD.teacher,
      }
    : FALLBACK_CHILD

  const assignments = useMemo(
    () =>
      rawAssignments
        .filter(assignment =>
          !selectedChildUser ||
          (assignment.grade ?? assignment.targetYear) === selectedChildUser.year,
        )
        .map((assignment, index) =>
          normalizeAssignment(
            assignment,
            index,
            selectedChildUser?.name ?? FALLBACK_CHILD.name,
          ),
        ),
    [rawAssignments, selectedChildUser?.id, selectedChildUser?.name, selectedChildUser?.year],
  )

  const NAV = [
    {
      id: 'overview',
      label: '🏠 OVERVIEW',
      color: '#bf5fff',
      desc: 'Child summary',
    },
    {
      id: 'assignments',
      label: '📚 ASSIGNMENTS',
      color: '#00f5ff',
      desc: 'Homework tracker',
    },
    {
      id: 'progress',
      label: '🎮 GAME PROGRESS',
      color: '#39ff14',
      desc: 'Game accuracy',
    },
    {
      id: 'activity',
      label: '📰 ACTIVITY',
      color: '#ffe600',
      desc: 'Recent history',
    },
  ] as const

  const pendingCount = assignments.filter(
    assignment => !assignment.done,
  ).length

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: '#070714',
        color: '#e8e8ff',
      }}
    >
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-10" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}

      <header
        className="relative z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{
          borderColor: '#1e1e4a',
          background: 'rgba(7,7,20,0.97)',
          boxShadow:
            '0 2px 20px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>
              🎮
            </span>

            <span
              className="font-pixel"
              style={{
                fontSize: '12px',
                color: '#00f5ff',
                textShadow:
                  '0 0 12px #00f5ff',
                letterSpacing: '3px',
              }}
            >
              REWORKED
            </span>
          </div>

          <div
            className="h-5 w-px"
            style={{
              background: '#1e1e4a',
            }}
          />

          <span
            className="font-pixel"
            style={{
              fontSize: '8px',
              color: '#bf5fff',
              textShadow:
                '0 0 8px #bf5fff',
              letterSpacing: '2px',
            }}
          >
            PARENT HQ
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>
              👤
            </span>

            <span
              className="font-body"
              style={{
                fontSize: '13px',
                color: '#8888aa',
              }}
            >
              Parent · {children.length} {children.length === 1 ? 'child' : 'children'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="pixel-btn px-4 py-2"
            style={{
              borderColor: '#ff2d78',
              color: '#ff2d78',
              background: 'transparent',
              fontSize: '8px',
            }}
          >
            ⏻ LOGOUT
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}

      <div className="relative z-20 flex flex-1">

        {/* Sidebar */}

        <aside
          className="flex flex-col w-52 shrink-0 border-r py-6 px-3 gap-2"
          style={{
            borderColor: '#1e1e4a',
            background:
              'rgba(8,8,20,0.9)',
          }}
        >
          <div className="mb-4">
            <p
              className="font-pixel mb-2 px-1"
              style={{
                fontSize: '6px',
                color: '#2e2e5e',
                letterSpacing: '1px',
              }}
            >
              MY CHILD
            </p>

            <div className="flex flex-col gap-2">
              {children.map(candidate => {
                const selected = candidate.id === selectedChildUser?.id
                return (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedChildId(candidate.id)}
                    className="w-full flex items-center gap-2 px-2 py-2.5 text-left"
                    style={{
                      border: `1px solid ${selected ? '#bf5fff' : '#1e1e4a'}`,
                      background: selected ? 'rgba(191,95,255,0.1)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{candidate.avatar}</span>
                    <div>
                      <p
                        className="font-pixel"
                        style={{
                          fontSize: '8px',
                          color: selected ? '#bf5fff' : '#8888aa',
                          textShadow: selected ? '0 0 6px #bf5fff' : 'none',
                        }}
                      >
                        {candidate.name}
                      </p>
                      <p className="font-body" style={{ fontSize: '10px', color: '#2e2e5e' }}>
                        {candidate.year ?? 'No year'} · Lv.{candidate.level}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className="h-px mb-2"
            style={{
              background: '#1e1e4a',
            }}
          />

          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() =>
                setView(item.id)
              }
              className="text-left px-3 py-3 transition-all"
              style={{
                border: `1px solid ${
                  view === item.id
                    ? item.color
                    : '#1e1e4a'
                }`,
                background:
                  view === item.id
                    ? `${item.color}14`
                    : 'transparent',
                boxShadow:
                  view === item.id
                    ? `0 0 16px ${item.color}22`
                    : 'none',
                cursor: 'pointer',
              }}
            >
              <p
                className="font-pixel"
                style={{
                  fontSize: '7px',
                  color:
                    view === item.id
                      ? item.color
                      : '#4a4a8a',
                  textShadow:
                    view === item.id
                      ? `0 0 8px ${item.color}`
                      : 'none',
                  letterSpacing: '0.5px',
                }}
              >
                {item.label}
              </p>

              <p
                className="font-body mt-0.5"
                style={{
                  fontSize: '11px',
                  color: '#2e2e5e',
                }}
              >
                {item.desc}
              </p>
            </button>
          ))}

          {/* Live pending alert */}

          {pendingCount > 0 && (
            <div
              className="mt-auto mx-1 px-3 py-2"
              style={{
                border:
                  '1px solid #ffe60044',
                background:
                  'rgba(255,230,0,0.05)',
              }}
            >
              <p
                className="font-pixel"
                style={{
                  fontSize: '7px',
                  color: '#ffe600',
                  textShadow:
                    '0 0 6px #ffe600',
                  letterSpacing: '0.5px',
                }}
              >
                ⚠️ {pendingCount} QUEST
                {pendingCount !== 1
                  ? 'S'
                  : ''}{' '}
                DUE SOON
              </p>

              <p
                className="font-body mt-0.5"
                style={{
                  fontSize: '10px',
                  color: '#4a4a8a',
                }}
              >
                Remind {child.name} to
                play!
              </p>
            </div>
          )}

          {assignments.length === 0 && (
            <div
              className="mt-auto mx-1 px-3 py-2"
              style={{
                border:
                  '1px solid #00f5ff22',
                background:
                  'rgba(0,245,255,0.03)',
              }}
            >
              <p
                className="font-pixel"
                style={{
                  fontSize: '6px',
                  color: '#2e2e5e',
                  lineHeight: '1.6',
                }}
              >
                LIVE SYNC ACTIVE
                <br />
                WAITING FOR QUESTS
              </p>
            </div>
          )}
        </aside>

        {/* Main */}

        <main
          className="flex-1 p-8 overflow-y-auto"
          style={{
            maxHeight:
              'calc(100vh - 57px)',
          }}
        >
          {view === 'overview' && (
            <Overview
              selectedChild={child}
              assignments={assignments}
            />
          )}

          {view === 'assignments' && (
            <Assignments
              selectedChild={child}
              assignments={assignments}
            />
          )}

          {view === 'progress' && (
            <GameProgress
              selectedChild={child}
              assignments={assignments}
            />
          )}

          {view === 'activity' && (
            <ActivityFeed
              selectedChild={child}
              assignments={assignments}
            />
          )}
        </main>
      </div>

      {/* ── Ticker ─────────────────────────────────────────────────────────── */}

      <div
        className="fixed bottom-0 left-0 right-0 overflow-hidden border-t-2 z-30"
        style={{
          borderColor: '#bf5fff',
          background:
            'rgba(7,7,20,0.97)',
          boxShadow:
            '0 -4px 20px rgba(191,95,255,0.1)',
          height: '32px',
        }}
      >
        <div className="ticker-track h-full flex items-center">
          {[...Array(2)].flatMap(
            (_, ri) =>
              [
                '🐉 DRAGON DUNGEON',
                '⚔️ CAVERN COMBAT',
                '👑 PRINCESS RUN',
                '🥷 NINJA ACADEMY',
                '⚡ CYBERPUNK BIKING',
                '🎵 MUSICAL TILES',
                '🧚 FAIRY WORKSHOP',
                '🦄 UNICORN CARE',
                '🚀 SPACESHIP SHOOTOUT',
              ].map((item, i) => (
                <span
                  key={`${ri}-${i}`}
                  className="font-pixel whitespace-nowrap px-5"
                  style={{
                    fontSize: '7px',
                    color:
                      i % 2 === 0
                        ? '#bf5fff'
                        : '#ff2d78',
                    textShadow:
                      i % 2 === 0
                        ? '0 0 6px #bf5fff'
                        : '0 0 6px #ff2d78',
                  }}
                >
                  {item} ★
                </span>
              )),
          )}
        </div>
      </div>
    </div>
  )
}