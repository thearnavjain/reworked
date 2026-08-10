import { useEffect, useState } from 'react'

type Question = {
  question: string
  answer: string | number
  choices: string[]
}

type GameState =
  | 'countdown'
  | 'launch'  
  | 'racing'
  | 'question'
  | 'boost'
  | 'finish'
  | 'results'

const TEST_QUESTIONS: Question[] = [
  {
    question: 'What is 5 + 7?',
    answer: '12',
    choices: ['12', '10', '14', '15'],
  },
  {
    question: 'What is the capital of France?',
    answer: 'Paris',
    choices: ['Madrid', 'Paris', 'Berlin', 'Rome'],
  },
  {
    question: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    choices: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
  },
  {
    question: 'What is 9 × 6?',
    answer: '54',
    choices: ['45', '54', '63', '48'],
  },
]

const BIKE_COLORS = [
  '#ff2d78',
  '#bf5fff',
  '#00f5ff',
  '#ffe600',
  '#39ff14',
]

type CyberpunkBikingProps = {
  questions?: Question[]
  onComplete?: (score: number, total: number) => void
  onExit?: () => void
}

export default function CyberpunkBiking({
  questions = TEST_QUESTIONS,
  onComplete,
  onExit,
}: CyberpunkBikingProps) {
  const questionBank: Question[] = (questions.length > 0 ? questions : TEST_QUESTIONS).map((q: any) => ({
    question: String(q.question ?? q.prompt ?? ''),
    answer: q.answer ?? q.correct_answer ?? q.correctAnswer ?? '',
    choices: Array.isArray(q.choices)
      ? q.choices.map(String)
      : Array.isArray(q.options)
        ? q.options.map(String)
        : [],
  }))

  const playableQuestions = questionBank.length > 0 ? questionBank : TEST_QUESTIONS

  const [gameState, setGameState] = useState<GameState>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correct, setCorrect] = useState<boolean | null>(null)

  const question = playableQuestions[questionIndex] ?? TEST_QUESTIONS[0]
  const opponentsRemaining =
    playableQuestions.length - questionIndex

  // ── Countdown ───────────────────────────────────────────────

  useEffect(() => {
    if (gameState !== 'countdown') return

    if (countdown === 0) {
      setGameState('launch')
      return
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1)
    }, 900)

    return () => clearTimeout(timer)
  }, [gameState, countdown])

  // ── Race launch ──────────────────────────────────────────────

useEffect(() => {
  if (gameState !== 'launch') return

  const timer = setTimeout(() => {
    setGameState('racing')
  }, 1200)

  return () => clearTimeout(timer)
}, [gameState])

  // ── Approach opponent ──────────────────────────────────────

  useEffect(() => {
    if (gameState !== 'racing') return

    const timer = setTimeout(() => {
      setGameState('question')
    }, 1800)

    return () => clearTimeout(timer)
  }, [gameState])

  // ── Play little arcade ding ─────────────────────────────────

  const playDing = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext
        }).webkitAudioContext

      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      const now = ctx.currentTime

      const notes = [880, 1175, 1568]

      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.frequency.value = frequency
        oscillator.type = 'square'

        gain.gain.setValueAtTime(0.0001, now + index * 0.09)
        gain.gain.exponentialRampToValueAtTime(
          0.08,
          now + index * 0.09 + 0.015
        )
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + index * 0.09 + 0.12
        )

        oscillator.connect(gain)
        gain.connect(ctx.destination)

        oscillator.start(now + index * 0.09)
        oscillator.stop(now + index * 0.09 + 0.13)
      })

      setTimeout(() => ctx.close(), 600)
    } catch {
      // Audio is optional — never let it break the game.
    }
  }

  // ── Answer ──────────────────────────────────────────────────

  const answerQuestion = (answer: string) => {
    if (selectedAnswer !== null) return

    const isCorrect = String(answer) === String(question.answer)

    setSelectedAnswer(answer)
    setCorrect(isCorrect)

    if (isCorrect) {
  setScore(prev => prev + 1)
  playDing()

  setTimeout(() => {
    setGameState('boost')
  }, 650)
} else {
  setTimeout(() => {
    setSelectedAnswer(null)
    setCorrect(null)
    setGameState('racing')
  }, 1000)
}
  }

  // ── Boost animation ────────────────────────────────────────

  useEffect(() => {
    if (gameState !== 'boost') return

    const timer = setTimeout(() => {
      if (questionIndex >= playableQuestions.length - 1) {
        setGameState('finish')
      } else {
        setQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setCorrect(null)
        setGameState('racing')
      }
    }, 1750)

    return () => clearTimeout(timer)
  }, [gameState, questionIndex])

  // ── Finish animation ───────────────────────────────────────

  useEffect(() => {
    if (gameState !== 'finish') return

    onComplete?.(score, playableQuestions.length)

    const timer = setTimeout(() => {
      setGameState('results')
    }, 2600)

    return () => clearTimeout(timer)
  }, [gameState])

  const restart = () => {
    setGameState('countdown')
    setCountdown(3)
    setQuestionIndex(0)
    setScore(0)
    setSelectedAnswer(null)
    setCorrect(null)
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 50% 40%, #11114a 0%, #070714 45%, #020207 100%)',
        color: '#e8e8ff',
      }}
    >
      {/* ─────────────────────────────────────────────────────
          BACKGROUND CITY
      ───────────────────────────────────────────────────── */}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,245,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.07) 1px, transparent 1px)
            `,
            backgroundSize: '55px 55px',
            transform: 'perspective(400px) rotateX(55deg) scale(1.8)',
            transformOrigin: 'bottom',
            opacity: 0.5,
          }}
        />

        {/* skyline */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 h-2/5 opacity-60">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${20 + ((i * 37) % 70)}%`,
                background:
                  'linear-gradient(to top, #08081c, #11113b)',
                borderTop: '1px solid #252565',
                boxShadow: '0 -4px 15px rgba(0,245,255,0.05)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          TOP HUD
      ───────────────────────────────────────────────────── */}

      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <div>
          <p
            className="font-pixel"
            style={{
              fontSize: '13px',
              color: '#00f5ff',
              letterSpacing: '3px',
              textShadow: '0 0 12px #00f5ff',
            }}
          >
            CYBERPUNK BIKING
          </p>

          <p
            className="font-pixel mt-1"
            style={{
              fontSize: '7px',
              color: '#4a4a8a',
              letterSpacing: '1px',
            }}
          >
            NITRO OVERTAKE // ARCADE MODE
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p
              className="font-pixel"
              style={{
                fontSize: '7px',
                color: '#4a4a8a',
              }}
            >
              OVERTAKES
            </p>

            <p
              className="font-pixel"
              style={{
                fontSize: '16px',
                color: '#39ff14',
                textShadow: '0 0 8px #39ff14',
              }}
            >
              {questionIndex}/{playableQuestions.length}
            </p>
          </div>

          <div className="text-right">
            <p
              className="font-pixel"
              style={{
                fontSize: '7px',
                color: '#4a4a8a',
              }}
            >
              SCORE
            </p>

            <p
              className="font-pixel"
              style={{
                fontSize: '16px',
                color: '#ffe600',
                textShadow: '0 0 8px #ffe600',
              }}
            >
              {score}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          RACE TRACK
      ───────────────────────────────────────────────────── */}

      <div
        className="relative z-10 mx-auto mt-2"
        style={{
          width: 'min(1600px, 94vw)',
          height: '430px',
          border: '2px solid #1e1e4a',
          background:
            'linear-gradient(to bottom, rgba(5,5,20,0.1), rgba(3,3,12,0.9))',
          overflow: 'hidden',
        }}
      >
        {/* road */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: '72%',
            height: '100%',
            background:
              'linear-gradient(90deg, #080814, #111122 45%, #111122 55%, #080814)',
            borderLeft: '2px solid #242450',
            borderRight: '2px solid #242450',
          }}
        />

        {/* road perspective lines */}
        <div
          className="absolute left-1/2 top-0 bottom-0"
          style={{
            width: '4px',
            transform: 'translateX(-50%)',
            background:
              'repeating-linear-gradient(to bottom, #ffe600 0 35px, transparent 35px 70px)',
            opacity: 0.4,
          }}
        />

        {/* opponent bikes */}

{gameState === 'countdown' || gameState === 'launch' ? (
  // Initial grid: show the whole pack.
  <>
    {Array.from({ length: TEST_QUESTIONS.length }).map((_, i) => (
      <div
        key={i}
        className={`absolute ${
          gameState === 'launch' && i > 0
            ? 'bike-launch-away'
            : ''
        }`}
        style={{
          left: `calc(50% + ${
            (i % 2 === 0 ? -1 : 1) * (45 + i * 12)
          }px`,
          top: `${110 + i * 52}px`,
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: i === 0 ? '48px' : '32px',
            filter: `drop-shadow(0 0 10px ${BIKE_COLORS[i]})`,
          }}
        >
          🏍️
        </div>
      </div>
    ))}
  </>
) : (
  // During the race: ONLY the current opponent is visible.
  <div
  className={`absolute ${
    gameState === 'boost'
      ? 'opponent-overtaken'
      : gameState === 'racing'
        ? 'opponent-enter'
        : ''
  }`}
  style={{
    left: '50%',
    top: '110px',
    transform: 'translateX(-50%)',
    zIndex: 5,
  }}
>
    <div
      style={{
        fontSize: '48px',
        filter: `drop-shadow(0 0 10px ${
          BIKE_COLORS[questionIndex % BIKE_COLORS.length]
        })`,
      }}
    >
      🏍️
    </div>
  </div>
)}


        {/* player */}
        <div
          className={`
            absolute left-1/2 -translate-x-1/2
            ${gameState === 'boost' ? 'bike-boost' : ''}
          `}
          style={{
            bottom: gameState === 'boost' ? '35px' : '35px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: '58px',
              transform: 'scaleX(-1)',
              filter:
                'drop-shadow(0 0 10px #00f5ff) drop-shadow(0 0 20px #bf5fff)',
            }}
          >
            🏍️
          </div>

          {/* thrusters */}
          {gameState === 'boost' && (
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: '48px',
                fontSize: '28px',
                animation: 'thruster 0.12s infinite alternate',
              }}
            >
              🔥
            </div>
          )}
        </div>

        {/* speed lines */}
        {(gameState === 'racing' || gameState === 'boost') && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${(i * 47) % 100}%`,
                  top: `${(i * 31) % 80}%`,
                  width: '2px',
                  height: `${20 + (i % 4) * 12}px`,
                  background: i % 3 === 0 ? '#00f5ff' : '#bf5fff',
                  opacity: 0.35,
                  animation:
                    'speedline 0.5s linear infinite',
                  animationDelay: `${i * -0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* finish line */}
        {gameState === 'finish' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.25)',
              animation: 'finishFlash 0.5s infinite alternate',
            }}
          >
            <div
              className="font-pixel"
              style={{
                fontSize: '32px',
                color: '#fff',
                textShadow:
                  '0 0 10px #fff, 0 0 25px #00f5ff',
                letterSpacing: '6px',
              }}
            >
              🏁 FINISH 🏁
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────
            COUNTDOWN
        ─────────────────────────────────────────────────── */}

        {gameState === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="font-pixel mb-5"
              style={{
                fontSize: '10px',
                color: '#00f5ff',
                letterSpacing: '3px',
              }}
            >
              GET READY
            </p>

            <span
              className="font-pixel"
              style={{
                fontSize: '80px',
                color: '#39ff14',
                textShadow:
                  '0 0 10px #39ff14, 0 0 35px #39ff14',
                animation: 'countPop 0.9s ease-out',
              }}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
          QUESTION PANEL
      ───────────────────────────────────────────────────── */}

      {gameState === 'question' && (
        <div
          className="fixed inset-x-0 bottom-2 z-50 flex justify-center px-4"
          style={{
            animation: 'questionDrop 0.45s cubic-bezier(.2,.9,.2,1)',
          }}
        >
          <div
            className="w-full max-w-2xl p-4"
            style={{
              background: 'rgba(5,5,18,0.97)',
              border: '2px solid #00f5ff',
              boxShadow:
                '0 0 25px rgba(0,245,255,0.25), inset 0 0 30px rgba(0,245,255,0.04)',
            }}
          >
            <div className="text-center mb-4">
              <p
                className="font-pixel"
                style={{
                  fontSize: '10px',
                  color: '#ffe600',
                  letterSpacing: '2px',
                  textShadow: '0 0 8px #ffe600',
                  paddingTop: '8px',
                }}
              >
                ANSWER TO NITRO OVERTAKE
              </p>

              <div
                className="mt-2 mx-auto"
                style={{
                  width: '80px',
                  height: '2px',
                  background: '#00f5ff',
                  boxShadow: '0 0 8px #00f5ff',
                }}
              />
            </div>

            <p
              className="font-body text-center"
              style={{
                fontSize: '19px',
                color: '#e8e8ff',
                lineHeight: 1.4,
              }}
            >
              {question.question}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-5">
              {question.choices.map(choice => {
                const isSelected = selectedAnswer === choice
                const isCorrectAnswer = choice === question.answer

                let border = '#1e1e4a'
                let color = '#8888aa'

                if (isSelected && correct) {
                  border = '#39ff14'
                  color = '#39ff14'
                } else if (isSelected && !correct) {
                  border = '#ff2d78'
                  color = '#ff2d78'
                }

            

                return (
                  <button
                    key={choice}
                    onClick={() => answerQuestion(choice)}
                    disabled={selectedAnswer !== null}
                    className="font-pixel p-3 transition-all"
                    style={{
                      fontSize: '8px',
                      color,
                      background:
  isSelected && correct
    ? 'rgba(57,255,20,0.08)'
    : isSelected && !correct
      ? 'rgba(255,45,120,0.08)'
      : 'rgba(10,10,30,0.8)',
                      border: `2px solid ${border}`,
                      cursor:
                        selectedAnswer !== null
                          ? 'default'
                          : 'pointer',
                    }}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="text-center mt-4">
                <p
                  className="font-pixel"
                  style={{
                    fontSize: '10px',
                    color: correct ? '#39ff14' : '#ff2d78',
                    textShadow: `0 0 8px ${
                      correct ? '#39ff14' : '#ff2d78'
                    }`,
                  }}
                >
                  {correct ? '✓ NITRO READY!' : '✕ WRONG ANSWER'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          RESULTS
      ───────────────────────────────────────────────────── */}

      {gameState === 'results' && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'rgba(2,2,7,0.94)',
            animation: 'resultsFade 0.6s ease-out',
          }}
        >
          <div
            className="text-center p-8"
            style={{
              width: 'min(500px, 90vw)',
              border: '2px solid #ffe600',
              background: 'rgba(10,10,25,0.95)',
              boxShadow:
                '0 0 50px rgba(255,230,0,0.2)',
            }}
          >
            <div
              style={{
                fontSize: '72px',
                animation: 'medalPop 0.8s cubic-bezier(.2,1.5,.3,1)',
              }}
            >
              🥇
            </div>

            <p
              className="font-pixel mt-3"
              style={{
                fontSize: '20px',
                color: '#ffe600',
                letterSpacing: '3px',
                textShadow:
                  '0 0 10px #ffe600, 0 0 25px #ffe600',
              }}
            >
              RACE COMPLETE
            </p>

            <p
              className="font-pixel mt-3"
              style={{
                fontSize: '9px',
                color: '#39ff14',
              }}
            >
              NITRO CHAMPION
            </p>

            <div
              className="mt-6 p-4"
              style={{
                border: '1px solid #1e1e4a',
                background: 'rgba(0,0,0,0.3)',
              }}
            >
              <p
                className="font-pixel"
                style={{
                  fontSize: '8px',
                  color: '#4a4a8a',
                }}
              >
                FINAL SCORE
              </p>

              <p
                className="font-pixel mt-2"
                style={{
                  fontSize: '30px',
                  color: '#39ff14',
                  textShadow: '0 0 12px #39ff14',
                }}
              >
                {score}/{playableQuestions.length}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={onExit}
                className="pixel-btn px-6 py-3"
                style={{
                  borderColor: '#39ff14',
                  color: '#39ff14',
                  fontSize: '9px',
                }}
              >
                ← DASHBOARD
              </button>

              <button
                onClick={restart}
                className="pixel-btn px-6 py-3"
                style={{
                  borderColor: '#00f5ff',
                  color: '#00f5ff',
                  fontSize: '9px',
                }}
              >
                RACE AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          BOOST FLASH
      ───────────────────────────────────────────────────── */}

      {gameState === 'boost' && (
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            border: '12px solid #00f5ff',
            boxShadow:
              'inset 0 0 80px rgba(0,245,255,0.4)',
            animation: 'boostFlash 0.25s ease-out',
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────
          GLOBAL GAME ANIMATIONS
      ───────────────────────────────────────────────────── */}

      <style>{`
        @keyframes questionDrop {
          from {
            transform: translateY(-120px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes speedline {
          from {
            transform: translateY(-100px);
          }
          to {
            transform: translateY(600px);
          }
        }

        @keyframes thruster {
          from {
            transform: translateX(-50%) scaleY(0.8);
            filter: brightness(1);
          }
          to {
            transform: translateX(-50%) scaleY(1.35);
            filter: brightness(1.8);
          }
        }

        @keyframes countPop {
          from {
            transform: scale(1.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes boostFlash {
          from {
            opacity: 0.9;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes finishFlash {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes resultsFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes medalPop {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .bike-boost {
  animation: bikeBoost 1.75s cubic-bezier(.2,.8,.2,1) forwards;
}

@keyframes bikeBoost {
  0% {
    transform: translateX(-50%) translateY(0) scale(1);
  }

  20% {
    transform: translateX(-50%) translateY(-40px) scale(1.05);
  }

  50% {
    transform: translateX(-50%) translateY(-190px) scale(1.1);
  }

  75% {
    transform: translateX(-50%) translateY(-230px) scale(1.12);
  }

  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
          .bike-launch-away {
  animation: bikeLaunchAway 1.2s cubic-bezier(.2,.8,.2,1) forwards;
}

@keyframes bikeLaunchAway {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  35% {
    opacity: 1;
    transform: translateX(-50%) translateY(-80px) scale(1.05);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-700px) scale(0.7);
  }
}

.opponent-overtaken {
  animation: opponentOvertaken 1.75s cubic-bezier(.2,.8,.2,1) forwards;
}

@keyframes opponentOvertaken {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  25% {
    opacity: 1;
    transform: translateX(-50%) translateY(60px) scale(1.05);
  }

  60% {
    opacity: 1;
    transform: translateX(-50%) translateY(220px) scale(1.08);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(500px) scale(0.85);
  }
}

.opponent-enter {
  animation: opponentEnter 0.8s cubic-bezier(.2,.8,.2,1) forwards;
}

@keyframes opponentEnter {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-280px) scale(0.8);
  }

  60% {
    opacity: 1;
    transform: translateX(-50%) translateY(20px) scale(1.05);
  }

  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

      `}</style>
    </div>
  )
}