import { formatYen } from '../utils'

export default function FinishScreen({
  participantId, bdmResult,
  complianceLog, allRiskResults, allTimeResults,
  delayLabel,
}) {
  const totalLoadBlocks = complianceLog.length
  const correctBlocks = complianceLog.filter((e) => e.correct).length
  const complianceRate = totalLoadBlocks > 0
    ? Math.round((correctBlocks / totalLoadBlocks) * 100)
    : null

  function downloadCSV(rows, filename, taskType) {
    if (!rows || rows.length === 0) return
    const headers = taskType === 'risk'
      ? ['block', 'prob', 'safe_amount', 'prize', 'row', 'has_load', 'choice', 'response_time_ms']
      : ['block', 'exchange_rate', 'future_amount', 'today_amount', 'delay_condition', 'row', 'has_load', 'choice', 'response_time_ms']
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => r[h] ?? '').join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.check}>✓</div>
        <h2 style={s.title}>実験完了</h2>
        <p style={s.msg}>ありがとうございました。すべての課題が終了しました。</p>

        {bdmResult && (
          <div style={s.bdmBox}>
            <h3 style={{ margin: '0 0 10px', color: '#1565c0' }}>🎲 報酬抽選結果</h3>
            <p style={s.line}>
              <strong>抽選された試行：</strong>
              {bdmResult.taskType === 'risk'
                ? `リスク課題 ブロック${bdmResult.selected.block}、確率${bdmResult.selected.prob_pct || Math.round(bdmResult.selected.prob * 100)}%`
                : `時間割引課題 ブロック${bdmResult.selected.block}、×${bdmResult.selected.exchange_rate}（${delayLabel}）`}
            </p>
            <p style={s.line}>
              <strong>あなたの選択：</strong>
              {bdmResult.selected.choice === 'A'
                ? (bdmResult.taskType === 'risk'
                    ? `A（${formatYen(bdmResult.selected.safe_amount)} を確実に）`
                    : `A（今すぐ ${formatYen(bdmResult.selected.today_amount)}）`)
                : (bdmResult.taskType === 'risk'
                    ? `B（¥1,000 を確率${bdmResult.selected.prob_pct || Math.round(bdmResult.selected.prob * 100)}%で）`
                    : `B（${delayLabel}に ${formatYen(bdmResult.selected.future_amount)}）`)}
            </p>
            <p style={s.line}><strong>パフォーマンス報酬：</strong>{formatYen(bdmResult.reward)}</p>
            <hr style={{ margin: '10px 0' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#1b5e20' }}>
              合計（基本謝礼 ¥1,500 + 報酬 {formatYen(bdmResult.reward)}）
              ＝ <span style={{ fontSize: '1.25rem' }}>{formatYen(bdmResult.total)}</span>
            </p>
          </div>
        )}

        {complianceRate !== null && (
          <div style={s.complianceBox}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#455a64' }}>
              数字記憶正答率：<strong>{complianceRate}%</strong>（{correctBlocks} / {totalLoadBlocks} ブロック）
            </p>
          </div>
        )}

        <p style={s.sub}>参加者ID：<strong>{participantId}</strong></p>
        <p style={s.note}>実験者にお知らせください。この画面はそのままにしておいてください。</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {allRiskResults?.length > 0 && (
            <button onClick={() => downloadCSV(allRiskResults, `ExpRT_risk_${participantId}.csv`, 'risk')} style={s.csvBtn}>
              リスク結果 CSV
            </button>
          )}
          {allTimeResults?.length > 0 && (
            <button onClick={() => downloadCSV(allTimeResults, `ExpRT_time_${participantId}.csv`, 'time')} style={s.csvBtn}>
              時間割引結果 CSV
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24, background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)' },
  card: { background: '#fff', padding: '40px 36px', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: 580, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' },
  check: { width: 64, height: 64, background: '#e8f5e9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 32, color: '#388e3c' },
  title: { margin: 0, fontSize: '1.7rem', fontWeight: 800 },
  msg: { margin: 0, fontSize: 15, lineHeight: 1.7 },
  bdmBox: { background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 8, padding: 16, width: '100%', textAlign: 'left' },
  line: { margin: '4px 0', fontSize: '0.9rem' },
  complianceBox: { background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 8, padding: '10px 16px', width: '100%' },
  sub: { margin: 0, fontSize: 13, color: '#888' },
  note: { margin: 0, fontSize: 12, color: '#aaa' },
  csvBtn: { padding: '10px 20px', fontSize: 13, fontWeight: 600, backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
}
