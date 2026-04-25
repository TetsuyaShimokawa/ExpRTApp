import { useState } from 'react'
import { startSession, saveRiskResult, saveTimeResult } from './utils'
import SetupScreen from './components/SetupScreen'
import InstructionScreen from './components/InstructionScreen'
import PriorInfoScreen from './components/PriorInfoScreen'
import DigitCheckScreen from './components/DigitCheckScreen'
import MPLScreen from './components/MPLScreen'
import BreakScreen from './components/BreakScreen'
import InterTaskBreakScreen from './components/InterTaskBreakScreen'
import FinishScreen from './components/FinishScreen'

// Screen flow:
// SETUP → INSTRUCTION →
//   [PRIOR_INFO_1 (if INFO)] → [DIGIT_CHECK_1 (if first block has load)] →
//   TASK (28 blocks, BREAK between each) →
//   INTER_TASK →
//   [PRIOR_INFO_2 (if INFO)] → [DIGIT_CHECK_2 (if first block has load)] →
//   TASK (28 blocks, BREAK between each) →
//   FINISH

const SCREEN = {
  SETUP: 'SETUP',
  INSTRUCTION: 'INSTRUCTION',
  PRIOR_INFO: 'PRIOR_INFO',
  DIGIT_CHECK: 'DIGIT_CHECK',
  MPL: 'MPL',
  BREAK: 'BREAK',
  INTER_TASK: 'INTER_TASK',
  FINISH: 'FINISH',
}

function groupByBlock(trials) {
  const map = new Map()
  for (const t of trials) {
    if (!map.has(t.block)) map.set(t.block, [])
    map.get(t.block).push(t)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([, rows]) => rows)
}

function computeBDM(riskResults, timeResults, complianceLog) {
  const all = [
    ...riskResults.map((r) => ({ ...r, taskType: 'risk' })),
    ...timeResults.map((r) => ({ ...r, taskType: 'time' })),
  ]
  if (!all.length) return null
  const sel = all[Math.floor(Math.random() * all.length)]
  let reward
  if (sel.taskType === 'risk') {
    reward = sel.choice === 'A' ? sel.safe_amount : (Math.random() < sel.prob ? sel.prize : 0)
  } else {
    reward = sel.choice === 'A' ? sel.today_amount : sel.future_amount
  }
  // If the selected block had cognitive load, check whether the digit was recalled correctly.
  // Incorrect or missing recall → reward = 0.
  let digitPenalty = false
  if (sel.has_load) {
    const entry = complianceLog.find(
      (c) => c.task === sel.taskType && c.blockIdx === sel.block - 1
    )
    if (!entry || !entry.correct) {
      reward = 0
      digitPenalty = true
    }
  }
  return { selected: sel, taskType: sel.taskType, reward, total: reward + 1500, digitPenalty }
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Session
  const [sessionId, setSessionId] = useState(null)
  const [participantId, setParticipantId] = useState('')
  const [priorInfo, setPriorInfo] = useState('NONE')
  const [taskOrder, setTaskOrder] = useState('RISK_FIRST')
  const [loadOrder, setLoadOrder] = useState('LOAD_FIRST')

  // Trial data
  const [riskBlocks, setRiskBlocks] = useState([])
  const [timeBlocks, setTimeBlocks] = useState([])
  const [riskDigits, setRiskDigits] = useState([])  // 28 entries: digit or ""
  const [timeDigits, setTimeDigits] = useState([])

  // Progress
  const [currentTask, setCurrentTask] = useState(1)   // 1 or 2
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)

  // Results
  const [allRiskResults, setAllRiskResults] = useState([])
  const [allTimeResults, setAllTimeResults] = useState([])
  const [complianceLog, setComplianceLog] = useState([])
  const [bdmResult, setBdmResult] = useState(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const taskType = (taskOrder === 'RISK_FIRST')
    ? (currentTask === 1 ? 'risk' : 'time')
    : (currentTask === 1 ? 'time' : 'risk')

  const currentBlocks = taskType === 'risk' ? riskBlocks : timeBlocks
  const currentDigits = taskType === 'risk' ? riskDigits : timeDigits
  const currentDigit = currentDigits[currentBlockIndex] || ''
  const prevDigit = currentBlockIndex > 0 ? (currentDigits[currentBlockIndex - 1] || '') : ''
  const nextDigit = currentDigits[currentBlockIndex] || ''

  // Detect load-status change at this break
  const prevHasLoad = Boolean(prevDigit)
  const nextHasLoad = Boolean(nextDigit)
  const isLoadTransition = prevHasLoad !== nextHasLoad
  const loadTransitionType = nextHasLoad ? 'on' : 'off'

  // Next block info for BreakScreen
  const nextBlockTrials = currentBlocks[currentBlockIndex] || []
  const nextBlockInfo = nextBlockTrials[0]
    ? taskType === 'risk'
      ? { probPct: Math.round((nextBlockTrials[0].prob || 0) * 100), prize: nextBlockTrials[0].prize }
      : { futureAmount: nextBlockTrials[0].future_amount, delayLabel: nextBlockTrials[0].delay_label }
    : null

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleSetup(pid, name) {
    setLoading(true)
    setError(null)
    try {
      const data = await startSession({ participant_id: pid, name })
      setSessionId(data.session_id)
      setParticipantId(pid)
      setPriorInfo(data.prior_info)
      setTaskOrder(data.task_order)
      setLoadOrder(data.load_order)
      setRiskBlocks(groupByBlock(data.risk_trials))
      setTimeBlocks(groupByBlock(data.time_trials))
      setRiskDigits(data.risk_digit_strings)
      setTimeDigits(data.time_digit_strings)
      setCurrentTask(1)
      setCurrentBlockIndex(0)
      setScreen(SCREEN.INSTRUCTION)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleInstructionNext() {
    if (priorInfo === 'INFO') {
      setScreen(SCREEN.PRIOR_INFO)
    } else if (currentDigit) {
      setScreen(SCREEN.DIGIT_CHECK)
    } else {
      setScreen(SCREEN.MPL)
    }
  }

  function handlePriorInfoNext() {
    if (currentDigit) {
      setScreen(SCREEN.DIGIT_CHECK)
    } else {
      setScreen(SCREEN.MPL)
    }
  }

  function handleDigitCheckPass() {
    setScreen(SCREEN.MPL)
  }

  async function handleBlockComplete(blockResults) {
    setSaving(true)
    try {
      const common = { session_id: sessionId, participant_id: participantId, prior_info: priorInfo, task_order: taskOrder, load_order: loadOrder }
      if (taskType === 'risk') {
        await Promise.all(blockResults.map((r) => saveRiskResult({ ...common, ...r })))
      } else {
        await Promise.all(blockResults.map((r) => saveTimeResult({ ...common, ...r })))
      }
    } catch (e) {
      console.error('保存エラー:', e)
    } finally {
      setSaving(false)
    }

    // Accumulate results
    const updatedRisk = taskType === 'risk' ? [...allRiskResults, ...blockResults] : allRiskResults
    const updatedTime = taskType === 'time' ? [...allTimeResults, ...blockResults] : allTimeResults
    setAllRiskResults(updatedRisk)
    setAllTimeResults(updatedTime)

    const nextIdx = currentBlockIndex + 1
    if (nextIdx >= currentBlocks.length) {
      // Task finished
      if (currentTask === 1) {
        setCurrentTask(2)
        setCurrentBlockIndex(0)
        setScreen(SCREEN.INTER_TASK)
      } else {
        setBdmResult(computeBDM(updatedRisk, updatedTime, complianceLog))
        setScreen(SCREEN.FINISH)
      }
    } else {
      setCurrentBlockIndex(nextIdx)
      setScreen(SCREEN.BREAK)
    }
  }

  function logCompliance(typedDigit, checkDigit, blockIdx) {
    if (!checkDigit) return
    setComplianceLog((prev) => [
      ...prev,
      { task: taskType, blockIdx, typed: typedDigit, correct: typedDigit === checkDigit },
    ])
  }

  function handleBreakDone(typedDigit) {
    // Log recall for the block we just finished (prevDigit)
    logCompliance(typedDigit || '', prevDigit, currentBlockIndex - 1)
    setScreen(SCREEN.MPL)
  }

  function handleInterTaskDone(typedDigit) {
    // currentTask is already 2 here; derive task 1's type directly from taskOrder
    const task1Type = (taskOrder === 'RISK_FIRST') ? 'risk' : 'time'
    const task1Digits = task1Type === 'risk' ? riskDigits : timeDigits
    logCompliance(typedDigit || '', task1Digits[27] || '', 27)

    const task2Type = (taskOrder === 'RISK_FIRST') ? 'time' : 'risk'
    const task2Digits = task2Type === 'risk' ? riskDigits : timeDigits
    const firstDigitTask2 = task2Digits[0] || ''

    if (priorInfo === 'INFO') {
      setScreen(SCREEN.PRIOR_INFO)
    } else if (firstDigitTask2) {
      setScreen(SCREEN.DIGIT_CHECK)
    } else {
      setScreen(SCREEN.MPL)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  switch (screen) {
    case SCREEN.SETUP:
      return <SetupScreen onSetup={handleSetup} loading={loading} error={error} />

    case SCREEN.INSTRUCTION:
      return (
        <InstructionScreen
          loadOrder={loadOrder}
          onNext={handleInstructionNext}
        />
      )

    case SCREEN.PRIOR_INFO:
      return (
        <PriorInfoScreen
          taskType={taskType}
          onNext={handlePriorInfoNext}
        />
      )

    case SCREEN.DIGIT_CHECK:
      return (
        <DigitCheckScreen
          digitString={currentDigit}
          onPass={handleDigitCheckPass}
        />
      )

    case SCREEN.MPL:
      return (
        <MPLScreen
          taskType={taskType}
          digitString={currentDigit}
          blockTrials={currentBlocks[currentBlockIndex] || []}
          blockIndex={currentBlockIndex}
          totalBlocks={currentBlocks.length}
          onBlockComplete={handleBlockComplete}
          saving={saving}
        />
      )

    case SCREEN.BREAK:
      return (
        <BreakScreen
          taskType={taskType}
          prevDigit={prevDigit}
          nextDigit={nextDigit}
          isLoadTransition={isLoadTransition}
          loadTransitionType={loadTransitionType}
          nextBlockInfo={nextBlockInfo}
          remainingBlocks={currentBlocks.length - currentBlockIndex}
          onContinue={handleBreakDone}
        />
      )

    case SCREEN.INTER_TASK: {
      const task1Type = (taskOrder === 'RISK_FIRST') ? 'risk' : 'time'
      const task2Type = (taskOrder === 'RISK_FIRST') ? 'time' : 'risk'
      const lastDigitTask1 = (task1Type === 'risk' ? riskDigits : timeDigits)[27] || ''
      return (
        <InterTaskBreakScreen
          completedTaskType={task1Type}
          nextTaskType={task2Type}
          prevDigit={lastDigitTask1}
          onContinue={handleInterTaskDone}
        />
      )
    }

    case SCREEN.FINISH:
      return (
        <FinishScreen
          participantId={participantId}
          bdmResult={bdmResult}
          complianceLog={complianceLog}
          allRiskResults={allRiskResults}
          allTimeResults={allTimeResults}
        />
      )

    default:
      return null
  }
}
