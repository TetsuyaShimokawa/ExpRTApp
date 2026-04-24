import { useState } from 'react'
import { formatYen } from '../utils'

// Shown between task 1 and task 2.
// If the last block of task 1 had load, first shows digit recall.
export default function InterTaskBreakScreen({
  completedTaskType, nextTaskType,
  prevDigit, delayLabel,
  onContinue,
}) {
  const needsRecall = Boolean(prevDigit)
  const [step, setStep] = useState(needsRecall ? 'recall' : 'info')
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const correct = typed.trim() === prevDigit

  function handleRecallSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (step === 'recall') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>🔢</div>
          <h2 style={s.title}>数字を入力してください</h2>
          <p style={s.text}>タスク①の最後に覚えていた7桁の数字を入力してください。</p>
          {!submitted ? (
            <form onSubmit={handleRecallSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
              <input
                style={s.recallInput}
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="7桁の数字"
                maxLength={7}
                autoFocus
              />
              <button type="submit" style={s.btn} disabled={!typed.trim()}>確認する</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div style={{ ...s.feedback, color: correct ? '#2e7d32' : '#c62828' }}>
                {correct ? '✓ 正解！' : '✗ 不正解でした'}
              </div>
              <div style={s.answer}>正解：{prevDigit}</div>
              <button style={s.btn} onClick={() => setStep('info')}>次のタスクへ →</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Info step ──────────────────────────────────────────────────────────────
  const taskLabel = (t) => t === 'risk' ? 'リスク課題' : '時間割引課題'
  const completedLabel = taskLabel(completedTaskType)
  const nextLabel = taskLabel(nextTaskType)

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.checkCircle}>✓</div>
        <h2 style={s.title}>{completedLabel}が終わりました</h2>
        <p style={s.text}>お疲れ様でした。少し休憩してください。</p>

        <div style={s.nextBox}>
          <p style={s.nextLabel}>次のタスク</p>
          <p style={s.nextTitle}>{nextLabel}</p>
          <p style={s.nextDesc}>
            {nextTaskType === 'risk'
              ? '確率ごとに、安全な金額（A）と ¥1,000 くじ（B）を選びます。28ブロック×20行。'
              : `交換レートごとに、今すぐ受け取る（A）と${delayLabel}に受け取る（B）を選びます。28ブロック×20行。`}
          </p>
        </div>

        <button style={s.btn} onClick={() => onContinue(needsRecall ? typed.trim() : undefined)}>
          {nextLabel}を開始する →
        </button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', maxWidth: 500, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 40 },
  checkCircle: { width: 64, height: 64, background: '#e8f5e9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 32, color: '#388e3c' },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#263238' },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#455a64' },
  feedback: { fontSize: '1.4rem', fontWeight: 800 },
  answer: { fontSize: '1.1rem', letterSpacing: '0.15em', color: '#444' },
  recallInput: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', padding: '10px 16px', border: '2px solid #90caf9', borderRadius: 10, width: '220px', outline: 'none' },
  nextBox: { background: '#f5f5f5', borderRadius: 12, padding: '16px 20px', width: '100%', textAlign: 'left' },
  nextLabel: { margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#90a4ae', textTransform: 'uppercase' },
  nextTitle: { margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#1565c0' },
  nextDesc: { margin: 0, fontSize: '0.9rem', color: '#546e7a', lineHeight: 1.6 },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
