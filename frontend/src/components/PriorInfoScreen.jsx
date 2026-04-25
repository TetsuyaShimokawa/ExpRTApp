// Shown before each task in the INFO condition.
// Risk: displays the 9 probability levels used (same for all prize levels).
// Time: displays the exchange rates for each of the 3 delay conditions.

const RISK_PROB_LEVELS = [0.01, 0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99]

const TIME_RATES_BY_DELAY = {
  '1week':   { label: '1週間後', rates: [1.01, 1.02, 1.03, 1.05, 1.08, 1.12, 1.17, 1.23, 1.30] },
  '1month':  { label: '1ヶ月後', rates: [1.01, 1.03, 1.05, 1.08, 1.12, 1.17, 1.25, 1.35, 1.50] },
  '3months': { label: '3ヶ月後', rates: [1.02, 1.05, 1.10, 1.20, 1.35, 1.50, 1.75, 2.00, 2.50] },
}

function DotScale({ values, labelFn, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', padding: '4px 0' }}>
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 9, color: '#666' }}>{labelFn(v)}</span>
        </div>
      ))}
    </div>
  )
}

function RiskInfo() {
  return (
    <div style={s.card}>
      <div style={s.icon}>🎲</div>
      <h2 style={s.title}>リスク課題について</h2>

      <p style={s.text}>
        この課題では <strong>3種類の当選金額</strong>（¥500・¥1,000・¥2,000）と
        <strong>9種類の確率水準</strong>を組み合わせた 27ブロックを行います。
      </p>

      <div style={s.infoBox}>
        <p style={s.boxTitle}>使用する確率水準（9水準、各金額共通）</p>
        <DotScale
          values={RISK_PROB_LEVELS}
          labelFn={(v) => `${Math.round(v * 100)}%`}
          color="#1976d2"
        />
        <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#555', textAlign: 'center' }}>
          1% から 99% まで低・中・高の各確率帯に分散しています
        </p>
      </div>

      <div style={s.infoBox}>
        <p style={s.boxTitle}>当選金額の水準</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          {[500, 1000, 2000].map((prize) => (
            <div key={prize} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1565c0' }}>¥{prize.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: '#777' }}>安全額: ¥{(prize * 0.05).toFixed(0)}〜¥{prize.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimeInfo() {
  return (
    <div style={s.card}>
      <div style={s.icon}>⏰</div>
      <h2 style={s.title}>時間割引課題について</h2>

      <p style={s.text}>
        この課題では <strong>3種類の遅延期間</strong>と各遅延に対応した
        <strong>9種類の交換レート</strong>を組み合わせた 27ブロックを行います。
        遅延期間はブロックごとに変わります。
      </p>

      {Object.entries(TIME_RATES_BY_DELAY).map(([key, { label, rates }]) => (
        <div key={key} style={s.infoBox}>
          <p style={s.boxTitle}>{label}の交換レート（9水準）</p>
          <DotScale
            values={rates}
            labelFn={(v) => `×${v.toFixed(2)}`}
            color="#2e7d32"
          />
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#555', textAlign: 'center' }}>
            ×{rates[0].toFixed(2)} 〜 ×{rates[rates.length - 1].toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function PriorInfoScreen({ taskType, onNext }) {
  return (
    <div style={s.container}>
      {taskType === 'risk' ? <RiskInfo /> : <TimeInfo />}
      <button style={s.btn} onClick={onNext}>理解しました →</button>
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: '#f5f5f5', gap: 16 },
  card: { background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 540, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 40 },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1565c0' },
  text: { margin: 0, fontSize: '0.92rem', lineHeight: 1.7, color: '#444', textAlign: 'left', width: '100%' },
  infoBox: { background: '#f5f5f5', borderRadius: 10, padding: '12px 16px', width: '100%' },
  boxTitle: { margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#555', textAlign: 'left' },
  btn: { padding: '12px 36px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
}
