const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function formatYen(amount) {
  return '¥' + Number(amount).toLocaleString('ja-JP')
}

export async function startSession({ participant_id, name }) {
  const res = await fetch(`${API_BASE}/api/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant_id, name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'セッション開始に失敗しました')
  }
  return res.json()
}

export async function saveRiskResult(result) {
  const res = await fetch(`${API_BASE}/api/results/risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
  if (!res.ok) console.error('リスク結果の保存に失敗しました', result)
}

export async function saveTimeResult(result) {
  const res = await fetch(`${API_BASE}/api/results/time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
  if (!res.ok) console.error('時間割引結果の保存に失敗しました', result)
}
