"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

type Category =
  | "stress"
  | "recovery"
  | "sleep"
  | "autonomic_balance"
  | "vagal_tone"

type Question = {
  text: string
  help?: string
  category: Category
  reverse?: boolean
}

type CategoryScores = {
  stress: number
  recovery: number
  sleep: number
  autonomic_balance: number
  vagal_tone: number
}

const answerLabels = [
  { value: 1, short: "Never" },
  { value: 2, short: "Rarely" },
  { value: 3, short: "Sometimes" },
  { value: 4, short: "Often" },
  { value: 5, short: "Very often" },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

function track(event: string) {
  if (typeof window !== "undefined") {
    console.log("TRACK:", event)
  }
}

export default function NervousSystemTest() {
  const questions: Question[] = [
    {
      text: "How often do you feel mentally overwhelmed by tasks or demands?",
      help: "Examples: work pressure, deadlines, or feeling like there is too much to handle.",
      category: "stress",
    },
    {
      text: "How often do you notice tension in your body (neck, shoulders, jaw)?",
      help: "Examples: tight shoulders, jaw clenching, or holding tension without noticing.",
      category: "stress",
    },
    {
      text: "How often do you experience racing thoughts or overthinking?",
      help: "Examples: repetitive thoughts, difficulty switching off, or mental restlessness.",
      category: "stress",
    },
    {
      text: "How often does your body feel stuck in fight-or-flight mode?",
      help: "Examples: feeling on edge, keyed up, or unable to fully relax.",
      category: "stress",
    },
    {
      text: "How often do you find it difficult to relax?",
      help: "Examples: trouble unwinding after work, in the evening, or on days off.",
      category: "stress",
    },

    {
      text: "How quickly does your body calm down after stress?",
      help: "Think about how fast you settle after a stressful email, meeting, conflict, or busy day.",
      category: "recovery",
      reverse: true,
    },
    {
      text: "How often do you feel fully rested after sleep?",
      help: "Think about whether sleep leaves you restored rather than just functional.",
      category: "recovery",
      reverse: true,
    },
    {
      text: "How quickly do you regain energy after a demanding day?",
      help: "Examples: whether you bounce back by evening or stay depleted for a long time.",
      category: "recovery",
      reverse: true,
    },
    {
      text: "How often do you feel physically drained without a clear reason?",
      help: "Examples: low energy, heaviness, or fatigue even without intense activity.",
      category: "recovery",
    },
    {
      text: "How often do you feel stressed throughout most of the day?",
      help: "Think about whether stress is occasional or feels like a constant background state.",
      category: "recovery",
    },

    {
      text: "How often do you have trouble falling asleep?",
      help: "Examples: lying awake, mind racing, or needing a long time to drift off.",
      category: "sleep",
    },
    {
      text: "How often do you wake up during the night?",
      help: "Examples: waking once or multiple times and struggling to settle again.",
      category: "sleep",
    },
    {
      text: "How often do you feel tired during the day?",
      help: "Examples: afternoon crashes, low energy, or needing more stimulation to stay alert.",
      category: "sleep",
    },
    {
      text: "How often do you feel calm before going to sleep?",
      help: "Think about whether bedtime feels settled or mentally and physically activated.",
      category: "sleep",
      reverse: true,
    },
    {
      text: "How often do you feel mentally clear when you wake up?",
      help: "Examples: feeling refreshed and focused rather than groggy or foggy.",
      category: "sleep",
      reverse: true,
    },

    {
      text: "How often do you notice a racing heart during stress?",
      help: "Examples: a pounding heartbeat, rapid pulse, or strong physical activation.",
      category: "autonomic_balance",
    },
    {
      text: "How often do noise or busy environments overwhelm you?",
      help: "Examples: crowded places, loud sounds, or too much activity around you.",
      category: "autonomic_balance",
    },
    {
      text: "How often do you feel restless without knowing why?",
      help: "Examples: inner agitation, inability to settle, or unexplained unease.",
      category: "autonomic_balance",
    },
    {
      text: "How often do you feel emotionally steady?",
      help: "Think about how stable and grounded you feel across everyday situations.",
      category: "autonomic_balance",
      reverse: true,
    },
    {
      text: "How often do small things stress you out?",
      help: "Examples: minor delays, messages, interruptions, or small changes in plans.",
      category: "autonomic_balance",
    },

    {
      text: "How often can deep breathing calm your body quickly?",
      help: "Think about whether breathing practices noticeably help your body settle.",
      category: "vagal_tone",
      reverse: true,
    },
    {
      text: "How often do you feel safe and relaxed in your body?",
      help: "Examples: feeling physically at ease, grounded, and not on alert.",
      category: "vagal_tone",
      reverse: true,
    },
    {
      text: "How often do you feel wired but tired?",
      help: "Examples: exhausted but unable to switch off, rest, or fully relax.",
      category: "vagal_tone",
    },
    {
      text: "How often do you experience calm digestion?",
      help: "Examples: a settled stomach, comfortable digestion, and less stress-related gut discomfort.",
      category: "vagal_tone",
      reverse: true,
    },
    {
      text: "How often do you feel mentally and physically balanced?",
      help: "Think about whether your mind and body generally feel in sync and well regulated.",
      category: "vagal_tone",
      reverse: true,
    },
  ]

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [guideRequested, setGuideRequested] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    track("test_started")
  }, [])

  const progress = useMemo(() => {
    if (finished) return 100
    return Math.round(((step + 1) / questions.length) * 100)
  }, [step, questions.length, finished])

  function answer(value: number) {
    const updatedAnswers = [...answers]
    updatedAnswers[step] = value
    setAnswers(updatedAnswers)

    if (step + 1 < questions.length) {
      setStep(step + 1)
    } else {
      track("test_completed")
      setFinished(true)
    }
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  function normalizeScore(raw: number, count: number) {
    const min = count * 1
    const max = count * 5
    return Math.round(((raw - min) / (max - min)) * 100)
  }

  function scoredValue(question: Question, value: number) {
    return question.reverse ? 6 - value : value
  }

  function calculateResults() {
    let totalRaw = 0

    const buckets: Record<Category, number[]> = {
      stress: [],
      recovery: [],
      sleep: [],
      autonomic_balance: [],
      vagal_tone: [],
    }

    questions.forEach((question, index) => {
      const rawAnswer = answers[index]
      const value = scoredValue(question, rawAnswer)

      totalRaw += value
      buckets[question.category].push(value)
    })

    const totalScore = normalizeScore(totalRaw, questions.length)

    const categoryScores: CategoryScores = {
      stress: normalizeScore(
        buckets.stress.reduce((a, b) => a + b, 0),
        buckets.stress.length
      ),
      recovery: normalizeScore(
        buckets.recovery.reduce((a, b) => a + b, 0),
        buckets.recovery.length
      ),
      sleep: normalizeScore(
        buckets.sleep.reduce((a, b) => a + b, 0),
        buckets.sleep.length
      ),
      autonomic_balance: normalizeScore(
        buckets.autonomic_balance.reduce((a, b) => a + b, 0),
        buckets.autonomic_balance.length
      ),
      vagal_tone: normalizeScore(
        buckets.vagal_tone.reduce((a, b) => a + b, 0),
        buckets.vagal_tone.length
      ),
    }

    return { totalScore, categoryScores }
  }

  function getLevel(score: number) {
    if (score <= 39) return "High dysregulation"
    if (score <= 59) return "Moderate imbalance"
    if (score <= 79) return "Healthy regulation"
    return "Excellent regulation"
  }

  function getProfile(scores: CategoryScores) {
    if (scores.sleep < 40) return "Sleep-Depleted"
    if (scores.stress < 45 && scores.recovery < 45) return "Wired but Tired"
    if (scores.stress < 50 && scores.recovery >= 60) return "Resilient but Overloaded"
    if (
      scores.stress >= 70 &&
      scores.recovery >= 70 &&
      scores.sleep >= 70 &&
      scores.autonomic_balance >= 70 &&
      scores.vagal_tone >= 70
    ) {
      return "Well Regulated"
    }
    return "High Stress / Low Recovery"
  }

  function getPersonalizedInsight(scores: CategoryScores) {
    if (scores.sleep < 40) {
      return "Your responses suggest that sleep disruption may currently be placing extra load on your nervous system. Improving nighttime regulation and relaxation may significantly improve recovery."
    }

    if (scores.stress < 45 && scores.recovery < 45) {
      return "Your answers suggest your nervous system may be spending a lot of time in a stress-dominant state, while recovery capacity is reduced. Supporting parasympathetic activation may help restore balance."
    }

    if (scores.vagal_tone < 45) {
      return "Your responses may indicate reduced vagal tone, which can make it harder for the body to switch from stress mode to recovery mode."
    }

    if (scores.stress >= 70 && scores.recovery >= 70) {
      return "Your nervous system appears relatively well regulated. Maintaining healthy stress management, sleep, and recovery habits will help preserve this balance."
    }

    return "Your results suggest a mixed nervous system profile with some areas of resilience and some areas that may benefit from better recovery and regulation."
  }

  function scoreLabel(value: number) {
    if (value <= 39) return "Low"
    if (value <= 59) return "Moderate"
    if (value <= 79) return "Good"
    return "Strong"
  }

  function getCategoryLabel(category: Category) {
    switch (category) {
      case "stress":
        return "Stress"
      case "recovery":
        return "Recovery"
      case "sleep":
        return "Sleep"
      case "autonomic_balance":
        return "Autonomic Balance"
      case "vagal_tone":
        return "Vagal Tone"
    }
  }

  function getStrongestAndWeakest(scores: CategoryScores) {
    const entries = Object.entries(scores) as [Category, number][]
    const sorted = [...entries].sort((a, b) => b[1] - a[1])

    return {
      strongest: {
        key: sorted[0][0],
        value: sorted[0][1],
      },
      weakest: {
        key: sorted[sorted.length - 1][0],
        value: sorted[sorted.length - 1][1],
      },
    }
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleGetGuide() {
    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setEmailError("")
    setIsSaving(true)

    try {
      const { totalScore, categoryScores } = calculateResults()
      const profile = getProfile(categoryScores)

      const { error } = await supabase.from("nervous_system_test_responses").insert([
        {
          email: email.trim(),
          total_score: totalScore,
          profile,
          stress_score: categoryScores.stress,
          recovery_score: categoryScores.recovery,
          sleep_score: categoryScores.sleep,
          autonomic_balance_score: categoryScores.autonomic_balance,
          vagal_tone_score: categoryScores.vagal_tone,
        },
      ])

      if (error) {
        throw error
      }

      track("email_submitted")
      setGuideRequested(true)
    } catch (error) {
      console.error(error)
      setEmailError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  function resetTest() {
    setStep(0)
    setAnswers([])
    setFinished(false)
    setEmail("")
    setEmailError("")
    setGuideRequested(false)
    setIsSaving(false)
  }

  if (finished) {
    const { totalScore, categoryScores } = calculateResults()
    const level = getLevel(totalScore)
    const profile = getProfile(categoryScores)
    const insight = getPersonalizedInsight(categoryScores)
    const { strongest, weakest } = getStrongestAndWeakest(categoryScores)

    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 40, color: "white" }}>
        <div
          style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: 24,
            padding: 32,
          }}
        >
          <p style={{ color: "#999", marginBottom: 8 }}>Neuvago Test Result</p>
          <h1 style={{ fontSize: 42, marginBottom: 10 }}>Your Nervous System Score</h1>

          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, marginBottom: 16 }}>
            {totalScore}
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#1e1e1e",
              border: "1px solid #333",
              marginBottom: 12,
            }}
          >
            {level}
          </div>

          <div style={{ display: "block", color: "#bdbdbd", marginBottom: 20, fontSize: 18 }}>
            Profile: {profile}
          </div>

          <p style={{ color: "#cfcfcf", fontSize: 18, lineHeight: 1.7, marginBottom: 18 }}>
            {insight}
          </p>

          <p style={{ color: "#a3a3a3", fontSize: 16, lineHeight: 1.6 }}>
            Your score estimates how balanced your autonomic nervous system may currently be. Higher scores generally reflect better stress regulation, recovery, sleep quality, autonomic balance, and vagal tone.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 14,
              marginTop: 30,
            }}
          >
            <ScoreCard title="Stress" value={categoryScores.stress} label={scoreLabel(categoryScores.stress)} />
            <ScoreCard title="Recovery" value={categoryScores.recovery} label={scoreLabel(categoryScores.recovery)} />
            <ScoreCard title="Sleep" value={categoryScores.sleep} label={scoreLabel(categoryScores.sleep)} />
            <ScoreCard
              title="Autonomic"
              value={categoryScores.autonomic_balance}
              label={scoreLabel(categoryScores.autonomic_balance)}
            />
            <ScoreCard title="Vagal Tone" value={categoryScores.vagal_tone} label={scoreLabel(categoryScores.vagal_tone)} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              marginTop: 20,
            }}
          >
            <InsightCard
              title="Strongest area"
              value={getCategoryLabel(strongest.key)}
              detail={`${strongest.value}/100`}
            />
            <InsightCard
              title="Weakest area"
              value={getCategoryLabel(weakest.key)}
              detail={`${weakest.value}/100`}
            />
          </div>

          <div
            style={{
              marginTop: 30,
              padding: 20,
              background: "#171717",
              border: "1px solid #2d2d2d",
              borderRadius: 16,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>What this may suggest</h3>
            <p style={{ color: "#c9c9c9", lineHeight: 1.7, margin: 0 }}>
              Lower scores may reflect higher stress load, weaker recovery, reduced parasympathetic activity, or sleep disruption. Higher scores may reflect stronger resilience and better day-to-day nervous system regulation.
            </p>
          </div>

          <div
            style={{
              marginTop: 30,
              padding: 20,
              background: "#171717",
              border: "1px solid #2d2d2d",
              borderRadius: 16,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              Unlock your personalized nervous system report
            </h3>

            <p style={{ color: "#c9c9c9", lineHeight: 1.7, marginTop: 0, marginBottom: 14 }}>
              Enter your email to unlock:
            </p>

            <ul
              style={{
                color: "#c9c9c9",
                lineHeight: 1.8,
                paddingLeft: 20,
                marginTop: 0,
                marginBottom: 14,
              }}
            >
              <li>your full nervous system interpretation</li>
              <li>recommended vagus nerve routines</li>
              <li>stress regulation exercises</li>
              <li>sleep recovery techniques</li>
            </ul>

            <p style={{ color: "#8c8c8c", lineHeight: 1.6, marginTop: 0 }}>
              Your test result will also be saved so you can track changes later.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                style={{
                  flex: "1 1 280px",
                  padding: 16,
                  background: "#1b1b1b",
                  border: "1px solid #333",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 16,
                  boxSizing: "border-box",
                }}
              />

              <button
                onClick={handleGetGuide}
                disabled={isSaving}
                style={{
                  padding: "14px 24px",
                  fontSize: 16,
                  background: "white",
                  color: "black",
                  borderRadius: 10,
                  border: "none",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Unlock my report"}
              </button>
            </div>

            {emailError ? (
              <p style={{ color: "#ff8b8b", marginTop: 10 }}>{emailError}</p>
            ) : null}

            {guideRequested ? (
              <p style={{ color: "#9be7a5", marginTop: 12 }}>
                Thanks — your email and result have been saved.
              </p>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <button
              onClick={resetTest}
              style={{
                padding: "14px 28px",
                fontSize: 16,
                background: "transparent",
                color: "white",
                borderRadius: 10,
                border: "1px solid #333",
                cursor: "pointer",
              }}
            >
              Retake test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 40, color: "white" }}>
      <div
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 24,
          padding: 32,
        }}
      >
        <p style={{ color: "#999", marginBottom: 8 }}>Neuvago Test</p>
        <h1 style={{ fontSize: 42, marginBottom: 10 }}>Nervous System Test</h1>
        <p style={{ color: "#bdbdbd", marginBottom: 8 }}>
          Question {step + 1} of {questions.length}
        </p>

        <p style={{ color: "#8c8c8c", marginTop: 0, marginBottom: 24 }}>
          Most people complete this test in under 2 minutes
        </p>

        <div
          style={{
            width: "100%",
            height: 10,
            background: "#222",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "white",
              transition: "width 0.25s ease",
            }}
          />
        </div>

        <p style={{ fontSize: 30, lineHeight: 1.35, marginBottom: 12 }}>
          {questions[step].text}
        </p>

        {questions[step].help && (
          <p
            style={{
              color: "#9a9a9a",
              fontSize: 16,
              lineHeight: 1.6,
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            {questions[step].help}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
          }}
        >
          {answerLabels.map((option) => (
            <button
              key={option.value}
              onClick={() => answer(option.value)}
              style={{
                padding: "18px 8px",
                fontSize: 16,
                background: "#1b1b1b",
                color: "white",
                border: "1px solid #333",
                borderRadius: 12,
                cursor: "pointer",
                minHeight: 72,
              }}
            >
              {option.short}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 18,
            color: "#9a9a9a",
            fontSize: 14,
          }}
        >
          <span>Choose the answer that fits best</span>
          <span>{progress}% complete</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            onClick={goBack}
            disabled={step === 0}
            style={{
              padding: "12px 18px",
              fontSize: 15,
              background: "transparent",
              color: step === 0 ? "#666" : "white",
              borderRadius: 10,
              border: "1px solid #333",
              cursor: step === 0 ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  title,
  value,
  label,
}: {
  title: string
  value: number
  label: string
}) {
  return (
    <div
      style={{
        background: "#171717",
        border: "1px solid #2d2d2d",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ color: "#999", fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#bdbdbd", marginTop: 6 }}>{label}</div>
    </div>
  )
}

function InsightCard({
  title,
  value,
  detail,
}: {
  title: string
  value: string
  detail: string
}) {
  return (
    <div
      style={{
        background: "#171717",
        border: "1px solid #2d2d2d",
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div style={{ color: "#999", fontSize: 14, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
      <div style={{ color: "#bdbdbd", marginTop: 6 }}>{detail}</div>
    </div>
  )
}