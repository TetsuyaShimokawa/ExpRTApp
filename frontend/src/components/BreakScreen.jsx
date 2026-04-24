import { useState } from 'react'
import { formatYen } from '../utils'

// Steps:
//  "recall"     — if prevDigit non-empty: ask to recall
//  "transition" — if load status changes at this break: notify user
//  "next_info"  — show next block info + new digit (if any)
//  "ready"      — final ready prompt

export default function BreakScreen({
  taskType,
  prevDigit, nextDigit,
  isLoadTransition, loadTransitionType,  // 'on' | 'off'
  nextBlockInfo,   // { stake or futureAmount or prob or rate }
  remainingBlocks,
  onContinue,
}) {
  const needsRecall = Boolean(prevDigit)
  const firstStep = needsRecall ? 'recall' : (isLoadTransition ? 'transition' : 'next_info')
  const [step, setStep] = useState(firstStep)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const correct = typed.trim() === prevDigit

  function handleRecallSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  function afterRecall() {
    setStep(isLoadTransition ? 'transition' : 'next_info')
  }

  function afterTransition() {
    setStep('next_info')
  }

  function afterNextInfo() {
    setStep('ready')
  }

  function handleReady() {
    onContinue(needsRecall ? typed.trim() : undefined)
  }

  // ── Recall step ────────────────────────────────────────────────────────────
  if (step === 'recall') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>🔢</div>
          <h2 style={s.title}>数字を入力してください</h2>
          <p style={s.text}>覚えていた7桁の数字を入力してください。</p>
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
              <button style={s.btn} onClick={afterRecall}>次へ →</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Transition step ────────────────────────────────────────────────────────
  if (step === 'transition') {
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>{loadTransitionType === 'on' ? '🧠' : '😌'}</div>
          <h2 style={s.title}>
            {loadTransitionType === 'on' ? '数字記憶課題が始まります' : '数字記憶課題が終了しました'}
          </h2>
          {loadTransitionType === 'on' ? (
            <p style={s.text}>
              ここからのブロックでは、7桁の数字を覚えながら選択課題を行います。
              次のページで最初の数字を確認してください。
            </p>
          ) : (
            <p style={s.text}>
              ここからは数字を覚える必要はありません。選択課題に集中してください。
            </p>
          )}
          <button style={s.btn} onClick={afterTransition}>次へ →</button>
        </div>
      </div>
    )
  }

  // ── Next info step ─────────────────────────────────────────────────────────
  if (step === 'next_info') {
    const isRisk = taskType === 'risk'
    return (
      <div style={s.container}>
        <div style={s.card}>
          <div style={s.icon}>⏸</div>
          <h2 style={s.title}>次のブロックへ</h2>
          <p style={s.text}>残り <strong>{remainingBlocks} ブロック</strong> です。</p>

          {nextBlockInfo && (
            <div style={s.infoBox}>
              <span style={s.infoLabel}>
                {isRisk ? '次のブロックの当選確率' : '次のブロックの将来受取額'}
              </span>
              <span style={s.infoValue}>
                {isRisk
                  ? `${nextBlockInfo.probPct}%（¥1,000 を確率 ${nextBlockInfo.probPct}% で）`
                  : formatYen(nextBlockInfo.futureAmount)}
              </span>
            </div>
          )}

          {nextDigit && (
            <div style={s.digitBox}>
              <p style={s.digitLabel}>次のブロックで覚える数字</p>
              <div style={s.digitDisplay}>{nextDigit}</div>
            </div>
          )}

          <button style={s.btn} onClick={afterNextInfo}>続ける →</button>
        </div>
      </div>
    )
  }

  // ── Ready step ─────────────────────────────────────────────────────────────
  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>▶</div>
        <h2 style={s.title}>準備ができたら開始してください</h2>
        {nextDigit && (
          <div style={s.digitBox}>
            <p style={s.digitLabel}>このブロックで覚える数字</p>
            <div style={s.digitDisplay}>{nextDigit}</div>
          </div>
        )}
        <button style={s.btn} onClick={handleReady}>開始する →</button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', maxWidth: 460, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 40 },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#263238' },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#455a64' },
  feedback: { fontSize: '1.4rem', fontWeight: 800 },
  answer: { fontSize: '1.1rem', letterSpacing: '0.15em', color: '#444' },
  recallInput: { fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.15em', textAlign: 'center', padding: '10px 16px', border: '2px solid #90caf9', borderRadius: 10, width: '220px', outline: 'none' },
  infoBox: { background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 10, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', width: '100%' },
  infoLabel: { fontSize: 12, fontWeight: 600, color: '#1565c0' },
  infoValue: { fontSize: '1.3rem', fontWeight: 800, color: '#1565c0' },
  digitBox: { background: '#fff8e1', border: '2px solid #ffcc02', borderRadius: 12, padding: '14px 20px', width: '100%' },
  digitLabel: { margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#e65100' },
  digitDisplay: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.2em', color: '#bf360c', fontVariantNumeric: 'tabular-nums' },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
