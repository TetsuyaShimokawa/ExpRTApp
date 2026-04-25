import { useState, useEffect, useRef } from 'react'
import { formatYen } from '../utils'

// Generic MPL screen for both risk and time tasks.
// taskType: 'risk' | 'time'
// Risk:  A = safe_amount (certain); B = prize with probability prob
// Time:  A = today_amount (now);   B = future_amount (after delay)
export default function MPLScreen({
  taskType, digitString,
  blockTrials, blockIndex, totalBlocks,
  onBlockComplete, saving,
}) {
  const [choices, setChoices] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const startTimeRef = useRef(Date.now())
  const hasLoad = Boolean(digitString)

  useEffect(() => {
    setChoices({})
    startTimeRef.current = Date.now()
  }, [blockIndex])

  if (!blockTrials || blockTrials.length === 0) return null

  const isRisk = taskType === 'risk'
  const trial0 = blockTrials[0]

  function handleChoice(rowIdx, choice) {
    setChoices((prev) => {
      const next = { ...prev, [rowIdx]: choice }
      if (choice === 'A') {
        // A is more attractive at higher amounts → fill rows above as A
        for (let i = rowIdx + 1; i < blockTrials.length; i++) next[i] = 'A'
      } else {
        // B is more attractive at lower amounts → fill rows below as B
        for (let i = 0; i < rowIdx; i++) next[i] = 'B'
      }
      return next
    })
  }

  const allAnswered = blockTrials.every((_, i) => choices[i])

  async function handleConfirm() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    const blockResults = blockTrials.map((trial, i) => ({
      block: trial.block,
      ...(isRisk
        ? { prob: trial.prob, safe_amount: trial.safe_amount, prize: trial.prize }
        : { exchange_rate: trial.exchange_rate, future_amount: trial.future_amount, today_amount: trial.today_amount, delay_condition: trial.delay_condition }),
      row: trial.row,
      has_load: hasLoad,
      choice: choices[i],
      response_time_ms: Date.now() - startTimeRef.current,
    }))
    onBlockComplete(blockResults)
    setSubmitting(false)
  }

  const progressPct = (blockIndex / totalBlocks) * 100

  // Header info
  const headerItems = isRisk
    ? [
        { label: 'ブロック', value: `${blockIndex + 1} / ${totalBlocks}` },
        { label: '当選賞金', value: formatYen(trial0.prize), color: '#1565c0' },
        { label: '当選確率', value: `${trial0.prob_pct}%`, color: '#1565c0' },
      ]
    : [
        { label: 'ブロック', value: `${blockIndex + 1} / ${totalBlocks}` },
        { label: '遅延', value: trial0.delay_label, color: '#2e7d32' },
        { label: '交換レート', value: `×${trial0.exchange_rate}` },
        { label: '将来受取額', value: formatYen(trial0.future_amount), color: '#2e7d32' },
      ]

  return (
    <div style={s.container}>
      <div style={s.progressOuter}>
        <div style={{ ...s.progressInner, width: `${progressPct}%` }} />
      </div>

      <div style={s.card}>
        <div style={s.header}>
          {headerItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {i > 0 && <div style={s.headerDivider} />}
              <div style={s.headerItem}>
                <span style={s.headerLabel}>{item.label}</span>
                <span style={{ ...s.headerValue, color: item.color || '#263238' }}>{item.value}</span>
              </div>
            </div>
          ))}
          {hasLoad && (
            <>
              <div style={s.headerDivider} />
              <div style={s.headerItem}>
                <span style={s.headerLabel}>記憶する数字</span>
                <span style={{ ...s.headerValue, letterSpacing: '0.12em', color: '#bf360c' }}>{digitString}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ ...s.taskBadge, background: isRisk ? '#e3f2fd' : '#e8f5e9', color: isRisk ? '#1565c0' : '#2e7d32' }}>
          {isRisk
            ? `${formatYen(trial0.prize)} を確率 ${trial0.prob_pct}% で獲得 vs 安全な金額を確実に受け取る`
            : `今日の金額を諦めると ${trial0.delay_label} に ${formatYen(trial0.future_amount)} 受け取れます（×${trial0.exchange_rate}）`}
        </div>

        <p style={s.hint}>ヒント：A か B をクリックすると上下の行が自動補完されます。変更したい行は押し直せます。</p>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.thOpt}>{isRisk ? '選択肢 A（安全額）' : '選択肢 A（今日）'}</th>
                <th style={s.thBtn}>A</th>
                <th style={s.thBtn}>B</th>
                <th style={s.thOpt}>{isRisk ? `選択肢 B（確率${trial0.prob_pct}%）` : `選択肢 B（${trial0.delay_label}）`}</th>
              </tr>
            </thead>
            <tbody>
              {blockTrials.map((trial, i) => {
                const c = choices[i]
                return (
                  <tr key={i} style={{ ...s.row, background: c === 'A' ? '#e3f2fd' : c === 'B' ? '#e8f5e9' : 'transparent' }}>
                    <td style={s.tdOpt}>
                      <span style={{ color: '#1565c0', fontSize: '0.9rem' }}>
                        {isRisk
                          ? <><strong>{formatYen(trial.safe_amount)}</strong> を確実に</>
                          : <>今すぐ <strong>{formatYen(trial.today_amount)}</strong></>}
                      </span>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(i, 'A')}
                        style={{ ...s.btn, background: c === 'A' ? '#1565c0' : '#e3f2fd', color: c === 'A' ? '#fff' : '#1565c0', border: '1px solid #1565c0' }}
                      >A</button>
                    </td>
                    <td style={s.tdBtn}>
                      <button
                        onClick={() => handleChoice(i, 'B')}
                        style={{ ...s.btn, background: c === 'B' ? '#2e7d32' : '#e8f5e9', color: c === 'B' ? '#fff' : '#2e7d32', border: '1px solid #2e7d32' }}
                      >B</button>
                    </td>
                    <td style={s.tdOpt}>
                      <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                        {isRisk
                          ? <>{formatYen(trial.prize)} を確率 {trial.prob_pct}% で</>
                          : <>{trial.delay_label} に <strong>{formatYen(trial.future_amount)}</strong></>}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={{ ...s.confirmBtn, opacity: (!allAnswered || submitting || saving) ? 0.5 : 1 }}
            onClick={handleConfirm}
            disabled={!allAnswered || submitting || saving}
          >
            {blockIndex + 1 < totalBlocks ? '次のブロックへ →' : 'タスク完了'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8' },
  progressOuter: { width: '100%', height: 6, background: '#e0e0e0' },
  progressInner: { height: '100%', background: '#1976d2', transition: 'width 0.4s' },
  card: { background: '#fff', borderRadius: 16, padding: '24px 28px', maxWidth: 720, width: '100%', margin: '20px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 14 },
  header: { display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #e0e0e0' },
  headerItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerLabel: { fontSize: 11, fontWeight: 600, color: '#90a4ae', textTransform: 'uppercase' },
  headerValue: { fontSize: '1rem', fontWeight: 700, color: '#263238' },
  headerDivider: { width: 1, height: 32, background: '#e0e0e0', margin: '0 12px' },
  taskBadge: { borderRadius: 8, padding: '9px 14px', fontSize: '0.88rem', fontWeight: 600 },
  hint: { fontSize: '0.78rem', color: '#888', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  thOpt: { padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#666', borderBottom: '2px solid #e0e0e0', width: '42%' },
  thBtn: { padding: '8px 6px', textAlign: 'center', fontSize: 13, fontWeight: 700, borderBottom: '2px solid #e0e0e0', width: '8%' },
  row: { borderBottom: '1px solid #f0f0f0', transition: 'background 0.1s' },
  tdOpt: { padding: '7px 12px', textAlign: 'center', verticalAlign: 'middle' },
  tdBtn: { padding: '7px 6px', textAlign: 'center', verticalAlign: 'middle' },
  btn: { padding: '4px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  confirmBtn: { padding: '11px 32px', fontSize: 15, fontWeight: 700, background: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
