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
  const [showSuccess, setShowSuccess] = useState(false)

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

  function getScoreColorClasses(score: number) {
    if (score <= 39) {
      return {
        ring: "from-rose-500 to-orange-400",
        glow: "shadow-[0_0_40px_rgba(244,63,94,0.18)]",
      }
    }
    if (score <= 59) {
      return {
        ring: "from-amber-400 to-orange-400",
        glow: "shadow-[0_0_40px_rgba(251,191,36,0.18)]",
      }
    }
    if (score <= 79) {
      return {
        ring: "from-lime-400 to-emerald-400",
        glow: "shadow-[0_0_40px_rgba(74,222,128,0.18)]",
      }
    }
    return {
      ring: "from-emerald-400 to-cyan-400",
      glow: "shadow-[0_0_40px_rgba(52,211,153,0.2)]",
    }
  }

  function getPrimaryIssue(scores: CategoryScores) {
    const entries = Object.entries(scores) as [Category, number][]
    const sorted = [...entries].sort((a, b) => a[1] - b[1])
    return getCategoryLabel(sorted[0][0])
  }

  function getRecommendedRoutine(scores: CategoryScores) {
    if (scores.sleep < 40) {
      return [
        {
          title: "Morning reset",
          duration: "2 minutes",
          text: "Start the day with a short calming routine to reduce carryover stress and help the body wake up in a more regulated state.",
        },
        {
          title: "Midday stress reset",
          duration: "1–3 minutes",
          text: "Use a short reset during the day to interrupt tension buildup and reduce nervous system overload.",
        },
        {
          title: "Evening calming routine",
          duration: "5 minutes",
          text: "Prioritize down-regulation before bed to help your body transition more smoothly toward sleep and recovery.",
        },
      ]
    }

    if (scores.vagal_tone < 45) {
      return [
        {
          title: "Morning vagal activation",
          duration: "2 minutes",
          text: "Begin the day with gentle stimulation or slow breathing to support parasympathetic tone and body awareness.",
        },
        {
          title: "Midday regulation break",
          duration: "1–3 minutes",
          text: "Use a short recovery window during the day to reduce activation and bring your body back toward baseline.",
        },
        {
          title: "Evening body reset",
          duration: "5 minutes",
          text: "Finish the day with a calming routine that supports recovery, digestion, and deeper relaxation.",
        },
      ]
    }

    if (scores.stress < 45 && scores.recovery < 45) {
      return [
        {
          title: "Morning calm baseline",
          duration: "2 minutes",
          text: "Start the day by lowering background activation and giving your nervous system a steadier baseline.",
        },
        {
          title: "Midday nervous system reset",
          duration: "1–3 minutes",
          text: "Interrupt accumulated stress before it spills into the rest of the day.",
        },
        {
          title: "Evening downshift",
          duration: "5 minutes",
          text: "Help the body leave stress mode and move more fully into repair and recovery.",
        },
      ]
    }

    return [
      {
        title: "Morning reset",
        duration: "2 minutes",
        text: "Begin the day with a short regulating routine that supports calm focus and nervous system balance.",
      },
      {
        title: "Midday reset",
        duration: "1–3 minutes",
        text: "A short reset helps prevent accumulated stress and supports better regulation across the day.",
      },
      {
        title: "Evening calming routine",
        duration: "5 minutes",
        text: "Support deeper recovery in the evening and help the body transition toward rest.",
      },
    ]
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
      setShowSuccess(true)
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
    setShowSuccess(false)
  }

  if (showSuccess) {
    const { totalScore, categoryScores } = calculateResults()
    const profile = getProfile(categoryScores)
    const primaryIssue = getPrimaryIssue(categoryScores)
    const { strongest, weakest } = getStrongestAndWeakest(categoryScores)
    const routine = getRecommendedRoutine(categoryScores)
    const scoreStyle = getScoreColorClasses(totalScore)

    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-8">
            <div className="mb-6 inline-flex rounded-full border border-emerald-700/50 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              Report saved successfully
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Your report is on the way
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  We’ve saved your result and your personalized guide is being prepared for <span className="font-medium text-white">{email}</span>. You can use the summary below right away.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className={`relative ${scoreStyle.glow}`}>
                  <div
                    className={`flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br ${scoreStyle.ring} p-[2px] sm:h-56 sm:w-56`}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-black text-center">
                      <div className="text-5xl font-bold leading-none sm:text-6xl">
                        {totalScore}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
                        Saved Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FeatureCard
                label="Profile"
                value={profile}
                text="Your main nervous system pattern."
              />
              <FeatureCard
                label="Primary issue"
                value={primaryIssue}
                text="The area that may need the most support right now."
              />
              <FeatureCard
                label="Strongest area"
                value={getCategoryLabel(strongest.key)}
                text={`${strongest.value}/100`}
              />
              <FeatureCard
                label="Weakest area"
                value={getCategoryLabel(weakest.key)}
                text={`${weakest.value}/100`}
              />
            </div>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">What happens next</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StepCard
                  step="1"
                  title="Check your email"
                  text="Your saved report and next-step guide can be delivered to your inbox."
                />
                <StepCard
                  step="2"
                  title="Review your routine"
                  text="Use the routine below as your immediate starting point."
                />
                <StepCard
                  step="3"
                  title="Build consistency"
                  text="Small daily regulation practices can improve balance over time."
                />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">
                Recommended nervous system routine
              </h2>

              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-base">
                Based on your result, these are the most relevant starting points right now.
              </p>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {routine.map((item) => (
                  <RoutineCard
                    key={item.title}
                    title={item.title}
                    duration={item.duration}
                    text={item.text}
                  />
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">Continue your journey</h2>

              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-base">
                Keep building your nervous system baseline with education, routines, and consistent recovery practices.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/"
                  className="rounded-xl bg-white px-5 py-4 text-center text-base font-medium text-black transition hover:bg-zinc-200"
                >
                  Learn how Neuvago works
                </a>

                <button
                  onClick={resetTest}
                  className="rounded-xl border border-zinc-700 px-5 py-4 text-base text-white transition hover:border-zinc-500"
                >
                  Retake test
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  }

  if (finished) {
    const { totalScore, categoryScores } = calculateResults()
    const level = getLevel(totalScore)
    const profile = getProfile(categoryScores)
    const insight = getPersonalizedInsight(categoryScores)
    const { strongest, weakest } = getStrongestAndWeakest(categoryScores)
    const primaryIssue = getPrimaryIssue(categoryScores)
    const routine = getRecommendedRoutine(categoryScores)
    const scoreStyle = getScoreColorClasses(totalScore)
    const stressRecoveryPosition = Math.max(
      0,
      Math.min(
        100,
        Math.round((categoryScores.recovery - categoryScores.stress + 100) / 2)
      )
    )

    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-8">
            <p className="mb-2 text-sm text-zinc-500">Neuvago Test Result</p>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Your Nervous System Score
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                  A personalized estimate of how balanced your nervous system may currently be across stress, recovery, sleep, autonomic balance, and vagal tone.
                </p>

                <div className="mt-6 inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200">
                  {level}
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className={`relative ${scoreStyle.glow}`}>
                  <div
                    className={`flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${scoreStyle.ring} p-[2px] sm:h-64 sm:w-64`}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-black text-center">
                      <div className="text-6xl font-bold leading-none sm:text-7xl">
                        {totalScore}
                      </div>
                      <div className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-400">
                        Score
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FeatureCard
                label="Profile"
                value={profile}
                text="Your primary nervous system pattern based on how your answers cluster."
              />
              <FeatureCard
                label="Primary issue"
                value={primaryIssue}
                text="The area that may currently benefit most from focused support."
              />
              <FeatureCard
                label="Strongest area"
                value={getCategoryLabel(strongest.key)}
                text={`${strongest.value}/100`}
              />
            </div>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">
                Your nervous system profile
              </h2>

              <p className="mt-3 text-base leading-7 text-zinc-200 sm:text-lg">
                {insight}
              </p>

              <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
                Higher scores generally reflect better stress regulation, recovery,
                sleep quality, autonomic balance, and vagal tone.
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">Score breakdown</h2>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <ScoreCard title="Stress" value={categoryScores.stress} label={scoreLabel(categoryScores.stress)} />
                <ScoreCard title="Recovery" value={categoryScores.recovery} label={scoreLabel(categoryScores.recovery)} />
                <ScoreCard title="Sleep" value={categoryScores.sleep} label={scoreLabel(categoryScores.sleep)} />
                <ScoreCard title="Autonomic" value={categoryScores.autonomic_balance} label={scoreLabel(categoryScores.autonomic_balance)} />
                <ScoreCard title="Vagal Tone" value={categoryScores.vagal_tone} label={scoreLabel(categoryScores.vagal_tone)} />
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">
                Nervous system balance meter
              </h2>

              <p className="mt-3 text-sm leading-7 text-zinc-400 sm:text-base">
                This compares current stress load with recovery capacity. The further to the right, the more your results suggest stronger recovery relative to stress.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <span>Stress dominant</span>
                  <span>Recovery dominant</span>
                </div>

                <div className="relative h-3 rounded-full bg-gradient-to-r from-rose-500 via-zinc-700 to-emerald-400">
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-lg"
                    style={{ left: `${stressRecoveryPosition}%` }}
                  />
                </div>

                <div className="mt-3 text-sm text-zinc-300">
                  You are currently leaning slightly toward{" "}
                  <span className="font-medium text-white">
                    {stressRecoveryPosition < 45
                      ? "stress activation"
                      : stressRecoveryPosition > 55
                      ? "recovery capacity"
                      : "a mixed balance state"}
                  </span>
                  .
                </div>
              </div>
            </section>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="text-lg font-semibold sm:text-xl">
                Recommended nervous system routine
              </h2>

              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-base">
                Based on your results, your nervous system may benefit from small daily regulation practices that help shift the body from stress activation into recovery states.
              </p>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {routine.map((item) => (
                  <RoutineCard
                    key={item.title}
                    title={item.title}
                    duration={item.duration}
                    text={item.text}
                  />
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h3 className="text-lg font-semibold sm:text-xl">What this may suggest</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-base">
                Lower scores may reflect higher stress load, weaker recovery, reduced parasympathetic activity, or sleep disruption. Higher scores may reflect stronger resilience and better day-to-day nervous system regulation.
              </p>
            </section>

            <section
              id="unlock-report"
              className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
            >
              <h3 className="text-lg font-semibold sm:text-xl">
                Unlock your personalized nervous system report
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-300 sm:text-base">
                Enter your email to unlock:
              </p>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-zinc-300 sm:text-base">
                <li>your full nervous system interpretation</li>
                <li>recommended vagus nerve routines</li>
                <li>stress regulation exercises</li>
                <li>sleep recovery techniques</li>
              </ul>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Your test result will also be saved so you can track changes later.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-base text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />

                <button
                  onClick={handleGetGuide}
                  disabled={isSaving}
                  className="rounded-xl bg-white px-6 py-4 text-base font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Unlock my report"}
                </button>
              </div>

              {emailError ? (
                <p className="mt-3 text-sm text-rose-400">{emailError}</p>
              ) : null}

              {guideRequested ? (
                <p className="mt-3 text-sm text-emerald-400">
                  Thanks — your email and result have been saved.
                </p>
              ) : null}
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={resetTest}
                className="w-full rounded-xl border border-zinc-700 px-5 py-4 text-base text-white transition hover:border-zinc-500 sm:w-auto"
              >
                Retake test
              </button>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/90 p-3 backdrop-blur sm:hidden">
          <a
            href="#unlock-report"
            className="block w-full rounded-xl bg-white px-5 py-4 text-center text-base font-medium text-black"
          >
            Unlock my full report
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-8">
          <p className="mb-2 text-sm text-zinc-500">Neuvago Test</p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Nervous System Test
          </h1>

          <p className="mt-4 text-base text-zinc-300">
            Question {step + 1} of {questions.length}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Most people complete this test in under 2 minutes
          </p>

          <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-8 text-[2rem] font-medium leading-tight tracking-tight sm:text-[2.35rem]">
            {questions[step].text}
          </p>

          {questions[step].help && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
              {questions[step].help}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {answerLabels.map((option) => (
              <button
                key={option.value}
                onClick={() => answer(option.value)}
                className="min-h-[72px] rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-4 text-sm font-medium text-white transition hover:border-zinc-600 hover:bg-zinc-800 sm:text-base"
              >
                {option.short}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Choose the answer that fits best</span>
            <span>{progress}% complete</span>
          </div>

          <div className="mt-5">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="w-full rounded-xl border border-zinc-800 px-5 py-3 text-sm text-white transition hover:border-zinc-600 disabled:cursor-not-allowed disabled:text-zinc-600 sm:w-auto"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </main>
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="text-xs text-zinc-500 sm:text-sm">{title}</div>
      <div className="mt-2 text-3xl font-bold sm:text-4xl">{value}</div>
      <div className="mt-2 text-sm text-zinc-300">{label}</div>
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="text-xs text-zinc-500 sm:text-sm">{title}</div>
      <div className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">{value}</div>
      <div className="mt-2 text-sm text-zinc-300">{detail}</div>
    </div>
  )
}

function FeatureCard({
  label,
  value,
  text,
}: {
  label: string
  value: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{text}</div>
    </div>
  )
}

function RoutineCard({
  title,
  duration,
  text,
}: {
  title: string
  duration: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
          {duration}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  )
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
        {step}
      </div>
      <div className="mt-3 text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{text}</div>
    </div>
  )
}