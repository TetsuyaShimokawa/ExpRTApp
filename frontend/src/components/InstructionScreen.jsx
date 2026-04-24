export default function InstructionScreen({ loadOrder, delayLabel, onNext }) {
  const loadDesc = loadOrder === 'LOAD_FIRST'
    ? '各タスクの最初の14ブロック'
    : '各タスクの後半14ブロック'

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.title}>実験の説明</h2>

        <section style={s.section}>
          <h3 style={s.heading}>全体の流れ</h3>
          <p style={s.text}>
            この実験は <strong>2つのタスク</strong>（リスク課題・時間割引課題）で構成されています。
            各タスクはそれぞれ <strong>28ブロック</strong>（各20行）あります。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>タスク①：リスク課題</h3>
          <p style={s.text}>
            各ブロックで確率 p を固定し、「<strong>安全な金額を今すぐ受け取る（A）</strong>」か
            「<strong>¥1,000 を確率 p% で受け取る（B）</strong>」の20択を行います。
            安全な金額は ¥50 から ¥1,000 まで変化します。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>タスク②：時間割引課題</h3>
          <p style={s.text}>
            各ブロックで交換レートを固定し、「<strong>今すぐ金額を受け取る（A）</strong>」か
            「<strong>{delayLabel}に ¥1,000×レート を受け取る（B）</strong>」の20択を行います。
            今日の金額は ¥50 から ¥1,000 まで変化します。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>選択の補助</h3>
          <p style={s.text}>
            A または B をクリックすると、それより有利な行が自動補完されます。
            変更したい行は押し直せます。
          </p>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>数字記憶課題</h3>
          <div style={s.loadBox}>
            <p style={s.text}>
              各タスクの <strong>{loadDesc}</strong> の間、7桁の数字を覚えながら選択課題を行います。
              ブロック終了後に数字の入力を求めることがあります。
            </p>
            <p style={{ ...s.text, fontSize: '0.85rem', color: '#78909c' }}>
              ※ 数字は常に画面上部に表示されます。できる限り記憶してください。
            </p>
          </div>
        </section>

        <section style={s.section}>
          <h3 style={s.heading}>報酬</h3>
          <p style={s.text}>
            全試行の中から1行をランダムに選び、その選択に基づいて報酬を決定します（BDM方式）。
            基本謝礼 ¥1,500 に加えてパフォーマンス報酬 ¥0〜¥1,000 が支払われます。
          </p>
        </section>

        <button style={s.btn} onClick={onNext}>次へ →</button>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '24px 16px', background: '#f5f5f5' },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', maxWidth: 640, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 20 },
  title: { margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1565c0' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  heading: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#333', borderLeft: '3px solid #1565c0', paddingLeft: 10 },
  text: { margin: 0, fontSize: '0.95rem', lineHeight: 1.7, color: '#444' },
  loadBox: { background: '#fff8e1', border: '2px solid #ffcc02', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  btn: { padding: '12px 32px', fontSize: 15, fontWeight: 700, backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-end' },
}
