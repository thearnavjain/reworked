import { useState, useRef } from 'react'


const GAME_NAMES = [
  'Dragon Dungeon', 'Cavern Combat', 'Princess Run', 'Ninja Academy',
  'Cyberpunk Biking', 'Musical Tiles', 'Fairy Workshop', 'Unicorn Care', 'Spaceship Shootout',
]

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

interface Assignment {
  id: string | number
  title: string
  game: string
  grade: string
  date: string
  dueDate: string
  students: StudentResult[]
  questions?: any[]
  teacher?: string
  student?: string
  instructions?: string
  completed?: boolean
  score?: number
  completedAt?: string
}

interface StudentResult {
  name: string
  avatar: string
  completed: boolean
  accuracy: number
  timeSpent: string
  attempts: number
}

const MOCK_STUDENTS: StudentResult[] = [
  { name: 'Shravani Mishra',   avatar: '🐱', completed: true,  accuracy: 94, timeSpent: '12m', attempts: 1 },
  { name: 'Venkateshwar Iyer',   avatar: '🦊', completed: true,  accuracy: 78, timeSpent: '18m', attempts: 2 },
  { name: 'Arnav Jain',   avatar: '🐼', completed: true,  accuracy: 88, timeSpent: '14m', attempts: 1 },
  { name: 'Neel Patel',    avatar: '🐸', completed: false, accuracy: 0,  timeSpent: '—',   attempts: 0 },
  { name: 'Avanti  Jayprakash',   avatar: '🦁', completed: true,  accuracy: 62, timeSpent: '22m', attempts: 3 },
  { name: 'Manoj Lokesh',     avatar: '🐻', completed: true,  accuracy: 97, timeSpent: '10m', attempts: 1 },
  { name: 'Kareena Modi',  avatar: '🐨', completed: false, accuracy: 0,  timeSpent: '—',   attempts: 0 },
  { name: 'Jay Evans',  avatar: '🐯', completed: true,  accuracy: 71, timeSpent: '20m', attempts: 2 },
  { name: 'Sania Singh', avatar: '🦋', completed: true,  accuracy: 85, timeSpent: '15m', attempts: 1 },
  { name: 'Yusuf Khan',   avatar: '🦅', completed: true,  accuracy: 90, timeSpent: '11m', attempts: 1 },
]

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 1, title: 'Times Tables Challenge', game: 'Dragon Dungeon',     grade: 'Year 3', date: '14-8-2026', dueDate: '18-10-2026', students: MOCK_STUDENTS },
  { id: 2, title: 'Addition Race',          game: 'Spaceship Shootout', grade: 'Year 2', date: '10-8-2026', dueDate: '15-10-2026', students: MOCK_STUDENTS.slice(0, 8) },
  { id: 3, title: 'Spelling Blast',         game: 'Ninja Academy',      grade: 'Year 3', date: '07-8-2026', dueDate: '11-10-2026', students: MOCK_STUDENTS.slice(2) },
  { id: 4, title: 'Fraction Fun',           game: 'Musical Tiles',      grade: 'Year 4', date: '30-8-2026', dueDate: '04-10-2026', students: MOCK_STUDENTS.slice(1, 9) },
  { id: 5, title: 'Word Families',          game: 'Fairy Workshop',     grade: 'Year 2', date: '23-8-2026', dueDate: '27-9-2026', students: MOCK_STUDENTS.slice(0, 7) },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-pixel" style={{ fontSize: '7px', color: '#4a4a8a', letterSpacing: '1px' }}>
      {children}
    </span>
  )
}

function NeonInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <input
        {...props}
        className="pixel-input mt-1.5"
        style={{ caretColor: '#39ff14', color: '#39ff14', ...(props.style ?? {}) }}
      />
    </div>
  )
}

function AccuracyBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-sm" style={{ background: '#0a0a22', border: '1px solid #1e1e4a' }}>
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}88` }}
        />
      </div>
      <span className="font-pixel shrink-0" style={{ fontSize: '7px', color, minWidth: '30px', textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

// ── Upload Assignment ──────────────────────────────────────────────────────

function UploadAssignment({ onAssignmentCreated }: { onAssignmentCreated: (assignment: any) => void }) {
  const [title, setTitle] = useState('')
  const [game, setGame] = useState('Dragon Dungeon')
  const [grade, setGrade] = useState('Year 2')
  const [instructions, setInstructions] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!title || files.length === 0) return

  setLoading(true)
  setError('')
  setQuestions([])
  let allGeneratedQuestions: any[] = []

  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      // 1. Upload the file and extract its text
      const uploadResponse = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }

      const uploadResult = await uploadResponse.json()

      // 2. Send the extracted text to Gemini
      const questionResponse = await fetch(
        'http://127.0.0.1:8000/generate-questions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: uploadResult.text,
          }),
        }
      )

      if (!questionResponse.ok) {
        throw new Error('AI question generation failed')
      }

      const questionResult = await questionResponse.json()

      // Gemini currently returns the generated JSON as a string.
      let generatedQuestions = questionResult.questions

      if (typeof generatedQuestions === 'string') {
        generatedQuestions = JSON.parse(generatedQuestions)
      }

      if (generatedQuestions?.questions) {
  allGeneratedQuestions = [
    ...allGeneratedQuestions,
    ...generatedQuestions.questions,
  ]

  setQuestions(prev => [
    ...prev,
    ...generatedQuestions.questions,
  ])
}
    }

      // Use allGeneratedQuestions collected from processing files.
      if (allGeneratedQuestions.length === 0) {
        throw new Error('No questions were generated from the uploaded file.')
      }

      // Update local state with the final generated questions and create assignment
      setQuestions(allGeneratedQuestions)

      const assignment = {
        id: crypto.randomUUID(),
        title,
        game,
        grade,
        instructions,
        dueDate,
        teacher: 'Mr. Shreenath Verma',
        student: 'Arnav Jain',
        questions: allGeneratedQuestions,
      }

      onAssignmentCreated(assignment)

      setSuccess(true)

  } catch (error) {
    console.error('Processing error:', error)
    setError(
      error instanceof Error
        ? error.message
        : 'Something went wrong while processing the assignment.'
    )
  } finally {
    setLoading(false)
  }
}

  const color = GAME_COLORS[game] ?? '#39ff14'

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Hero banner */}
      <div
        className="flex items-center gap-4 p-5 mb-6"
        style={{ background: 'rgba(57,255,20,0.05)', border: '2px solid #1e4a1e', boxShadow: '0 0 30px rgba(57,255,20,0.08)' }}
      >
        <div style={{ fontSize: '40px', filter: 'drop-shadow(0 0 12px #39ff14)' }}>📤</div>
        <div>
          <p className="font-pixel" style={{ fontSize: '11px', color: '#39ff14', textShadow: '0 0 10px #39ff14', letterSpacing: '2px' }}>
            UPLOAD ASSIGNMENT
          </p>
          <p className="font-body mt-1" style={{ fontSize: '13px', color: '#6a6a9a' }}>
            Gamify any homework — attach your worksheet and assign it to a game world.
          </p>
        </div>
      </div>

      <form
  onSubmit={handleSubmit}
  className="flex flex-col gap-5"
  style={{ paddingBottom: '64px' }}
>
        {/* Row 1 */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 140px' }}>
          <NeonInput label="QUEST TITLE" type="text" placeholder="e.g. Times Tables..." value={title} onChange={e => setTitle(e.target.value)} />
          <div>
            <SectionLabel>GRADE / CLASS</SectionLabel>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="mt-1.5"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', background: '#050510', border: '2px solid #1e1e4a', color: '#39ff14', padding: '11px 12px', width: '100%', outline: 'none', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#39ff14' }}
              onBlur={e => { e.target.style.borderColor = '#1e1e4a' }}
            >
              {['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6'].map(g => (
                <option key={g} value={g} style={{ background: '#0a0a1a' }}>{g.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <SectionLabel>DUE DATE</SectionLabel>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="pixel-input mt-1.5"
              style={{ color: '#39ff14', caretColor: '#39ff14', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Game selector */}
        <div>
          <SectionLabel>ASSIGN TO GAME WORLD</SectionLabel>
          <div className="grid grid-cols-3 gap-2 mt-2 sm:grid-cols-5">
            {GAME_NAMES.map(g => {
              const c = GAME_COLORS[g]
              const selected = game === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGame(g)}
                  className="flex flex-col items-center gap-1 py-2 px-1 transition-all"
                  style={{
                    border: `2px solid ${selected ? c : '#1e1e4a'}`,
                    background: selected ? `${c}18` : 'transparent',
                    boxShadow: selected ? `0 0 12px ${c}44` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{GAME_ICONS[g]}</span>
                  <span className="font-pixel text-center leading-tight" style={{ fontSize: '5.5px', color: selected ? c : '#2e2e5e', letterSpacing: '0.5px' }}>
                    {g.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <SectionLabel>INSTRUCTIONS (OPTIONAL)</SectionLabel>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Add any notes for students..."
            rows={2}
            className="pixel-input mt-1.5 resize-none"
            style={{ caretColor: '#39ff14', color: '#39ff14', fontFamily: 'var(--font-body)', fontSize: '13px', padding: '10px 14px' }}
          />
        </div>

        {/* Drop zone */}
        <div>
          <SectionLabel>ATTACH WORKSHEET FILES</SectionLabel>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer mt-1.5"
            style={{
              border: `2px dashed ${dragOver ? color : '#1e1e4a'}`,
              padding: '28px 16px',
              background: dragOver ? `${color}08` : 'rgba(5,5,16,0.5)',
              boxShadow: dragOver ? `0 0 20px ${color}22` : 'none',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '32px' }}>📁</span>
            <span className="font-pixel" style={{ fontSize: '8px', color: dragOver ? color : '#2e2e5e', letterSpacing: '1px' }}>
              {dragOver ? 'DROP TO ATTACH!' : 'DRAG & DROP OR CLICK TO BROWSE'}
            </span>
            <span className="font-body" style={{ fontSize: '12px', color: '#2e2e5e' }}>PDF · DOC · TXT</span>
          </div>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt"
            onChange={e => e.target.files && setFiles(prev => [...prev, ...Array.from(e.target.files!)])}
            style={{ display: 'none' }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2"
                style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid #1a4a1a' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span style={{ fontSize: '13px' }}>📄</span>
                  <span className="font-body truncate" style={{ fontSize: '12px', color: '#39ff14' }}>{f.name}</span>
                  <span className="font-body shrink-0" style={{ fontSize: '11px', color: '#2e2e5e' }}>
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="font-pixel ml-3 shrink-0"
                  style={{ fontSize: '8px', color: '#ff2d78', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center justify-center gap-3 py-3"
            style={{ border: '2px solid #39ff14', background: 'rgba(57,255,20,0.08)', boxShadow: '0 0 24px rgba(57,255,20,0.2)' }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <div>
              <p className="font-pixel" style={{ fontSize: '9px', color: '#39ff14', textShadow: '0 0 8px #39ff14' }}>QUEST SENT!</p>
              <p className="font-body" style={{ fontSize: '12px', color: '#4a7a4a' }}>Students will see it in their game world.</p>
            </div>
          </div>
        )}

        {error && (
  <div
    className="flex items-center gap-3 py-3 px-4"
    style={{
      border: '2px solid #ff2d78',
      background: 'rgba(255,45,120,0.08)',
      boxShadow: '0 0 24px rgba(255,45,120,0.15)',
    }}
  >
    <span style={{ fontSize: '20px' }}>⚠️</span>
    <div>
      <p
        className="font-pixel"
        style={{
          fontSize: '9px',
          color: '#ff2d78',
          textShadow: '0 0 8px #ff2d78',
        }}
      >
        PROCESSING ERROR
      </p>
      <p
        className="font-body"
        style={{ fontSize: '12px', color: '#8a4a5a' }}
      >
        {error}
      </p>
    </div>
  </div>
)}

{questions.length > 0 && (
  <div
    className="flex flex-col gap-2 p-4"
    style={{
      border: '2px solid #00f5ff',
      background: 'rgba(0,245,255,0.04)',
      boxShadow: '0 0 24px rgba(0,245,255,0.1)',
    }}
  >
    <div className="flex items-center justify-between">
      <p
        className="font-pixel"
        style={{
          fontSize: '9px',
          color: '#00f5ff',
          textShadow: '0 0 8px #00f5ff',
          letterSpacing: '1px',
        }}
      >
        🤖 {questions.length} QUESTIONS GENERATED
      </p>

      <span
        className="font-pixel"
        style={{ fontSize: '6px', color: '#4a4a8a' }}
      >
        GEMINI AI
      </span>
    </div>

    {questions.map((q, index) => (
      <div
        key={index}
        className="p-3"
        style={{
          border: '1px solid #1e1e4a',
          background: 'rgba(10,10,30,0.8)',
        }}
      >
        <p
          className="font-pixel"
          style={{
            fontSize: '7px',
            color: '#39ff14',
            marginBottom: '6px',
          }}
        >
          Q{index + 1}
        </p>

        <p
          className="font-body"
          style={{
            fontSize: '12px',
            color: '#c8c8e8',
          }}
        >
          {q.question}
        </p>

        {q.choices?.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {q.choices.map((choice: string, choiceIndex: number) => (
              <span
                key={choiceIndex}
                className="font-body"
                style={{
                  fontSize: '11px',
                  color: '#6a6a9a',
                }}
              >
                {String.fromCharCode(65 + choiceIndex)}. {choice}
              </span>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
)}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !title || files.length === 0}
          className="pixel-btn py-4"
          style={{
            borderColor: '#39ff14',
            background: (!title || files.length === 0) ? 'transparent' : 'linear-gradient(135deg, #39ff1418, #ffe60008)',
            color: (!title || files.length === 0) ? '#1e4a1e' : '#39ff14',
            textShadow: (!title || files.length === 0) ? 'none' : '0 0 12px #39ff14',
            boxShadow: (!title || files.length === 0) ? 'none' : '0 0 20px #39ff1444',
            cursor: (!title || files.length === 0) ? 'not-allowed' : 'pointer',
            fontSize: '11px',
          }}
        >
          {loading ? <span style={{ animation: 'blink 0.6s infinite' }}>UPLOADING QUEST...</span> : '▲ SEND QUEST TO STUDENTS'}
        </button>
      </form>
    </div>
  )
}

// ── View Assigned Games ────────────────────────────────────────────────────

function ViewAssignedGames({ assignments, onSelect }: { assignments: Assignment[]; onSelect: (a: Assignment) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '22px' }}>📋</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#00f5ff', textShadow: '0 0 8px #00f5ff', letterSpacing: '2px' }}>ASSIGNED GAMES</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>All active and completed quest assignments</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {assignments.map(a => {
          const color = GAME_COLORS[a.game] ?? '#00f5ff'
          const completed = a.students.filter(s => s.completed).length
          const total = a.students.length
          const pct = Math.round((completed / total) * 100)
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className="text-left transition-all"
              style={{
                border: `1px solid #1e1e4a`,
                background: 'rgba(10,10,30,0.8)',
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '36px 1fr auto',
                gap: '12px',
                alignItems: 'center',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${color}22` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e4a'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: '24px' }}>{GAME_ICONS[a.game]}</span>
              <div>
                <p className="font-pixel" style={{ fontSize: '9px', color: '#e8e8ff', letterSpacing: '1px' }}>{a.title.toUpperCase()}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-body" style={{ fontSize: '11px', color }}>
                    {a.game}
                  </span>
                  <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>{a.grade}</span>
                  <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>Due {a.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-32 h-1.5 rounded-sm" style={{ background: '#0a0a22' }}>
                    <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
                  </div>
                  <span className="font-pixel" style={{ fontSize: '6px', color: '#4a4a8a' }}>{completed}/{total} DONE</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-pixel" style={{ fontSize: '14px', color, textShadow: `0 0 8px ${color}` }}>{pct}%</span>
                <p className="font-pixel mt-1" style={{ fontSize: '6px', color: '#2e2e5e' }}>COMPLETE</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Completion Students List ───────────────────────────────────────────────

function CompletionList({ assignment, onBack }: { assignment: Assignment; onBack: () => void }) {
  const color = GAME_COLORS[assignment.game] ?? '#00f5ff'
  const done = assignment.students.filter(s => s.completed)
  const pending = assignment.students.filter(s => !s.completed)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="pixel-btn px-3 py-1.5"
          style={{ borderColor: '#2e2e5e', color: '#2e2e5e', fontSize: '8px', background: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00f5ff'; (e.currentTarget as HTMLElement).style.color = '#00f5ff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2e2e5e'; (e.currentTarget as HTMLElement).style.color = '#2e2e5e' }}
        >← BACK</button>
        <div>
          <p className="font-pixel" style={{ fontSize: '9px', color, textShadow: `0 0 8px ${color}`, letterSpacing: '1px' }}>
            {GAME_ICONS[assignment.game]} {assignment.title.toUpperCase()}
          </p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>{assignment.game} · {assignment.grade}</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'COMPLETED', value: done.length, color: '#39ff14' },
          { label: 'PENDING',   value: pending.length, color: '#ffe600' },
          { label: 'AVG SCORE', value: `${Math.round(done.reduce((s, x) => s + x.accuracy, 0) / (done.length || 1))}%`, color: '#00f5ff' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center py-3"
            style={{ border: `1px solid ${stat.color}44`, background: `${stat.color}08` }}>
            <span className="font-pixel" style={{ fontSize: '20px', color: stat.color, textShadow: `0 0 10px ${stat.color}` }}>
              {stat.value}
            </span>
            <span className="font-pixel mt-1" style={{ fontSize: '6px', color: '#4a4a8a', letterSpacing: '1px' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Student rows */}
      <div className="flex flex-col gap-1.5">
        {[...done, ...pending].map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3"
            style={{ background: s.completed ? 'rgba(57,255,20,0.04)' : 'rgba(255,230,0,0.03)', border: `1px solid ${s.completed ? '#1a4a1a' : '#2a2a10'}` }}>
            <span style={{ fontSize: '20px' }}>{s.avatar}</span>
            <span className="font-body flex-1" style={{ fontSize: '13px', color: '#c8c8e8' }}>{s.name}</span>
            {s.completed ? (
              <>
                <span className="font-pixel" style={{ fontSize: '7px', color: '#4a4a8a' }}>{s.timeSpent}</span>
                <span className="font-pixel" style={{ fontSize: '7px', color: '#4a4a8a' }}>{s.attempts}× tries</span>
                <AccuracyBar value={s.accuracy} color={s.accuracy >= 80 ? '#39ff14' : s.accuracy >= 60 ? '#ffe600' : '#ff2d78'} />
              </>
            ) : (
              <span className="font-pixel px-2 py-1" style={{ fontSize: '7px', color: '#ffe600', background: 'rgba(255,230,0,0.1)', border: '1px solid #ffe60033' }}>
                NOT YET
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Student Accuracy by Game ───────────────────────────────────────────────

function StudentAccuracy({ assignments }: { assignments: Assignment[] }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const gameStats = GAME_NAMES.map(g => {
    const relevant = assignments.filter(a => a.game === g)
    if (relevant.length === 0) return null
    const allStudents = relevant.flatMap(a => a.students.filter(s => s.completed))
    const avg = allStudents.length ? Math.round(allStudents.reduce((s, x) => s + x.accuracy, 0) / allStudents.length) : 0
    return { game: g, avg, count: allStudents.length, assignments: relevant.length }
  }).filter(Boolean) as { game: string; avg: number; count: number; assignments: number }[]

  const focusGame = selectedGame
    ? assignments.find(a => a.game === selectedGame)
    : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-1">
        <span style={{ fontSize: '22px' }}>📊</span>
        <div>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#bf5fff', textShadow: '0 0 8px #bf5fff', letterSpacing: '2px' }}>STUDENT ACCURACY</p>
          <p className="font-body" style={{ fontSize: '12px', color: '#4a4a8a' }}>Average accuracy per game world</p>
        </div>
      </div>

      {/* Per-game accuracy bars */}
      <div className="flex flex-col gap-3">
        {gameStats.map(stat => {
          const color = GAME_COLORS[stat.game]
          const selected = selectedGame === stat.game
          return (
            <button
              key={stat.game}
              onClick={() => setSelectedGame(selected ? null : stat.game)}
              className="text-left px-4 py-3 transition-all"
              style={{
                border: `1px solid ${selected ? color : '#1e1e4a'}`,
                background: selected ? `${color}0d` : 'rgba(10,10,30,0.6)',
                boxShadow: selected ? `0 0 16px ${color}22` : 'none',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontSize: '18px' }}>{GAME_ICONS[stat.game]}</span>
                <span className="font-pixel" style={{ fontSize: '8px', color: selected ? color : '#8888aa', letterSpacing: '1px' }}>
                  {stat.game.toUpperCase()}
                </span>
                <span className="font-body ml-auto" style={{ fontSize: '11px', color: '#2e2e5e' }}>
                  {stat.assignments} quest{stat.assignments !== 1 ? 's' : ''} · {stat.count} results
                </span>
              </div>
              <AccuracyBar value={stat.avg} color={color} />
            </button>
          )
        })}
      </div>

      {/* Per-student breakdown when a game is selected */}
      {focusGame && (
        <div className="flex flex-col gap-2">
          <p className="font-pixel" style={{ fontSize: '8px', color: GAME_COLORS[focusGame.game], letterSpacing: '1px' }}>
            {GAME_ICONS[focusGame.game]} STUDENT BREAKDOWN · {focusGame.title.toUpperCase()}
          </p>
          {focusGame.students.filter(s => s.completed).sort((a, b) => b.accuracy - a.accuracy).map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: 'rgba(10,10,30,0.8)', border: '1px solid #1e1e4a' }}>
              <span style={{ fontSize: '18px' }}>{s.avatar}</span>
              <span className="font-body w-32 shrink-0" style={{ fontSize: '12px', color: '#c8c8e8' }}>{s.name}</span>
              <div className="flex-1">
                <AccuracyBar value={s.accuracy} color={s.accuracy >= 80 ? '#39ff14' : s.accuracy >= 60 ? '#ffe600' : '#ff2d78'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Previous Assignments wrapper ───────────────────────────────────────────

function PreviousAssignments({ assignments }: { assignments: Assignment[] }) {
  const [subView, setSubView] = useState<'list' | 'completion' | 'accuracy'>('list')
  const [selected, setSelected] = useState<Assignment | null>(null)

  const SUB_TABS = [
    { id: 'list',       label: '📋 ASSIGNED GAMES',    color: '#00f5ff' },
    { id: 'completion', label: '✅ COMPLETION LIST',    color: '#39ff14' },
    { id: 'accuracy',   label: '📊 STUDENT ACCURACY',  color: '#bf5fff' },
  ] as const

  return (
    <div className="flex flex-col gap-0">
      {/* Sub-tabs */}
      <div className="flex border-b mb-5" style={{ borderColor: '#1e1e4a' }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubView(tab.id); setSelected(null) }}
            className="font-pixel px-4 py-2.5 transition-all"
            style={{
              fontSize: '7px',
              letterSpacing: '0.5px',
              color: subView === tab.id ? tab.color : '#2e2e5e',
              borderBottom: subView === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              textShadow: subView === tab.id ? `0 0 8px ${tab.color}` : 'none',
              background: 'none',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subView === 'list' && <ViewAssignedGames assignments={assignments} onSelect={a => { setSelected(a); setSubView('completion') }} />}
      {subView === 'completion' && selected && <CompletionList assignment={selected} onBack={() => setSubView('list')} />}
      {subView === 'completion' && !selected && <ViewAssignedGames assignments={assignments} onSelect={a => { setSelected(a) }} />}
      {subView === 'accuracy' && <StudentAccuracy assignments={assignments} />}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function TeacherDashboard({
  onLogout,
  onAssignmentCreated,
  assignments,
}: {
  onLogout: () => void
  onAssignmentCreated: (assignment: any) => void
  assignments: any[]
}) {
  const [view, setView] = useState<'upload' | 'previous'>('upload')

  const dynamicAssignments: Assignment[] = assignments.map((assignment: any) => {
    const students = Array.isArray(assignment.students) && assignment.students.length > 0
      ? assignment.students
      : [{
          name: assignment.student ?? 'Arnav Jain',
          avatar: '🐼',
          completed: Boolean(assignment.completed),
          accuracy: Number(assignment.accuracy ?? assignment.score ?? 0),
          timeSpent: '—',
          attempts: 0,
        }]

    return {
      ...assignment,
      date: assignment.date ?? assignment.completedAt ?? new Date().toLocaleDateString('en-GB'),
      dueDate: assignment.dueDate ?? '—',
      students,
    }
  })

  const allAssignments = [...dynamicAssignments, ...MOCK_ASSIGNMENTS]

  const NAV = [
    { id: 'upload',   label: '📤 UPLOAD QUEST',      color: '#39ff14', desc: 'Gamify new homework' },
    { id: 'previous', label: '📚 PREVIOUS QUESTS',   color: '#00f5ff', desc: 'View & track assignments' },
  ] as const

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070714', color: '#e8e8ff' }}>
      {/* Scanlines */}
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-10" />

      {/* ── Top bar ── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: '#1e1e4a', background: 'rgba(7,7,20,0.97)', boxShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>🎮</span>
            <span className="font-pixel" style={{ fontSize: '12px', color: '#00f5ff', textShadow: '0 0 12px #00f5ff', letterSpacing: '3px' }}>
              REWORKED
            </span>
          </div>
          <div className="h-5 w-px" style={{ background: '#1e1e4a' }} />
          <span className="font-pixel" style={{ fontSize: '8px', color: '#39ff14', textShadow: '0 0 8px #39ff14', letterSpacing: '2px' }}>
            TEACHER PORTAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>👩‍🏫</span>
            <span className="font-body" style={{ fontSize: '13px', color: '#8888aa' }}>Mr. Shreenath Verma · Year 3</span>
          </div>
          <button
            onClick={onLogout}
            className="pixel-btn px-4 py-2"
            style={{ borderColor: '#ff2d78', color: '#ff2d78', background: 'transparent', fontSize: '8px', textShadow: '0 0 6px #ff2d78' }}
          >
            ⏻ LOGOUT
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative z-20 flex flex-1">

        {/* Sidebar */}
        <aside
  className="flex flex-col w-52 shrink-0 border-r py-6 px-3 gap-2"
  style={{
    borderColor: '#1e1e4a',
    background: 'rgba(8,8,20,0.9)',
    paddingBottom: '48px',
  }}
>

          {/* XP strip */}
          <div className="mb-4 px-2">
            <div className="flex justify-between mb-1">
              <span className="font-pixel" style={{ fontSize: '6px', color: '#4a4a8a' }}>CLASS XP</span>
              <span className="font-pixel" style={{ fontSize: '6px', color: '#39ff14' }}>LVL 7</span>
            </div>
            <div className="w-full h-2 rounded-sm" style={{ background: '#0a0a22', border: '1px solid #1e1e4a' }}>
              <div className="h-full rounded-sm" style={{ width: '62%', background: 'linear-gradient(90deg,#39ff14,#ffe600)', boxShadow: '0 0 6px #39ff14' }} />
            </div>
          </div>

          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="text-left px-3 py-3 transition-all"
              style={{
                border: `1px solid ${view === item.id ? item.color : '#1e1e4a'}`,
                background: view === item.id ? `${item.color}14` : 'transparent',
                boxShadow: view === item.id ? `0 0 16px ${item.color}22` : 'none',
                cursor: 'pointer',
              }}
            >
              <p className="font-pixel" style={{ fontSize: '7.5px', color: view === item.id ? item.color : '#4a4a8a', textShadow: view === item.id ? `0 0 8px ${item.color}` : 'none', letterSpacing: '0.5px' }}>
                {item.label}
              </p>
              <p className="font-body mt-1" style={{ fontSize: '11px', color: '#2e2e5e' }}>{item.desc}</p>
            </button>
          ))}

          {/* Quick stats */}
          <div className="mt-auto flex flex-col gap-2 px-1">
            <p className="font-pixel" style={{ fontSize: '6px', color: '#2e2e5e', letterSpacing: '1px' }}>QUICK STATS</p>
            {[
              { label: 'Total Quests', value: '5',  color: '#00f5ff' },
              { label: 'Active',       value: '2',  color: '#ffe600' },
              { label: 'Students',     value: '28', color: '#39ff14' },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="font-body" style={{ fontSize: '11px', color: '#4a4a8a' }}>{s.label}</span>
                <span className="font-pixel" style={{ fontSize: '9px', color: s.color, textShadow: `0 0 6px ${s.color}` }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main
  className="flex-1 p-8 overflow-y-auto"
  style={{
    maxHeight: 'calc(100vh - 57px)',
    paddingBottom: '64px',
  }}
>
          {view === 'upload' && (
  <UploadAssignment onAssignmentCreated={onAssignmentCreated} />
)}
          {view === 'previous' && <PreviousAssignments assignments={allAssignments} />}
        </main>
      </div>

      {/* Bottom ticker */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden border-t-2 z-30"
        style={{ borderColor: '#39ff14', background: 'rgba(7,7,20,0.97)', boxShadow: '0 -4px 20px rgba(57,255,20,0.1)', height: '32px' }}>
        <div className="ticker-track h-full flex items-center">
          {[...Array(2)].flatMap((_, ri) =>
            ['🐉 DRAGON DUNGEON','⚔️ CAVERN COMBAT','👑 PRINCESS RUN','🥷 NINJA ACADEMY',
             '⚡ CYBERPUNK BIKING','🎵 MUSICAL TILES','🧚 FAIRY WORKSHOP','🦄 UNICORN CARE','🚀 SPACESHIP SHOOTOUT']
              .map((item, i) => (
                <span key={`${ri}-${i}`} className="font-pixel whitespace-nowrap px-5"
                  style={{ fontSize: '7px', color: i % 2 === 0 ? '#39ff14' : '#ffe600', textShadow: i % 2 === 0 ? '0 0 6px #39ff14' : '0 0 6px #ffe600' }}>
                  {item} ★
                </span>
              ))
          )}
        </div>
      </div>
    </div>
  )}