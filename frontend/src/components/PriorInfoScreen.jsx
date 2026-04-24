// Shown before each task in the INFO condition.
// Displays a histogram of the values used in the upcoming task.

const PROB_LEVELS = [
  0.01, 0.02, 0.03, 0.05, 0.07, 0.10, 0.15, 0.20, 0.25, 0.30,
  0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80,
  0.85, 0.90, 0.92, 0.93, 0.95, 0.97, 0.98, 0.99,
]

const EXCHANGE_RATES = [
  1.01, 1.02, 1.03, 1.05, 1.07, 1.10, 1.13, 1.17, 1.20, 1.25,
  1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.70, 1.80, 1.90,
  2.00, 2.20, 2.50, 3.00, 3.50, 4.00, 5.00, 7.00,
]

function Histogram({ values, labelFn, color, binCount = 7 }) {
  // Bin the values into binCount equal-width bins
  const min = Math.min(...values)
  const max = Math.max(...values)
  const width = (max - min) / binCount
  const bins = Array.from({ length: binCount }, (_, i) => ({
    lo: min + i * width,
    hi: min + (i + 1) * width,
    count: 0,
  }))
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / width), binCount - 1)
    bins[idx].count++
  }
  const maxCount = Math.max(...bins.map((b) => b.count))

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, padding: '0 4px' }}>
      {bins.map((bin, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div
            style={{
              width: '100%',
              height: `${(bin.count / maxCount) * 64}px`,
              background: color,
              borderRadius: '3px 3px 0 0',
              minHeight: bin.count > 0 ? 4 : 0,
            }}
          />
          <span style={{ fontSize: 9, color: '#888', whiteSpace: 'nowrap' }}>{labelFn(bin.lo)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PriorInfoScreen({ taskType, delayLabel, onNext }) {
  const isRisk = taskType === 'risk'

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.icon}>{isRisk ? '🎲' : '⏰'}</div>
        <h2 style={s.title}>
          {isRisk ? 'リスク課題について' : '時間割引課題について'}
        </h2>

        <p style={s.text}>
          {isRisk
            ? 'この課題では28種類の確率水準を使用します。以下にその分布を示します。'
            : `この課題では28種類の交換レートを使用します。以下にその分布を示します。`}
        </p>

        <div style={s.histBox}>
          <p style={s.histTitle}>
            {isRisk ? '使用する確率水準の分布（1%〜99%、28水準）' : '使用する交換レートの分布（×1.01〜×7.00、28水準）'}
          </p>
          <Histogram
            values={isRisk ? PROB_LEVELS : EXCHANGE_RATES}
            labelFn={(v) => isRisk ? `${Math.round(v * 100)}%` : `×${v.toFixed(1)}`}
            color={isRisk ? '#1976d2' : '#2e7d32'}
          />
        </div>

        <div style={s.noteBox}>
          {isRisk ? (
            <>
              <p style={s.noteText}>• 確率は <strong>1%から99%</strong> まで幅広く分布しています</p>
              <p style={s.noteText}>• 低確率（10%以下）と高確率（90%以上）に多くの水準が集中しています</p>
              <p style={s.noteText}>• 中間確率（40〜60%）の水準は比較的少なめです</p>
            </>
          ) : (
            <>
              <p style={s.noteText}>• 交換レートは <strong>×1.01から×7.00</strong> まで分布しています</p>
              <p style={s.noteText}>• 低倍率（×2.00以下）が全体の <strong>約71%（20/28水準）</strong> を占めます</p>
              <p style={s.noteText}>• 高倍率（×3.00以上）は5水準のみです</p>
            </>
          )}
        </div>

        <button style={s.btn} onClick={onNext}>理解しました →</button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 520, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 40 },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1565c0' },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#444', textAlign: 'left', width: '100%' },
  histBox: { background: '#f5f5f5', borderRadius: 10, padding: '14px 16px', width: '100%' },
  histTitle: { margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#555', textAlign: 'left' },
  noteBox: { background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: '12px 16px', width: '100%', textAlign: 'left' },
  noteText: { margin: '2px 0', fontSize: '0.88rem', color: '#2e7d32' },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
