// src/pages/AdminPointRules.jsx
import { useState, useEffect } from 'react'
import { fetchPointRules, adminUpdatePointRule } from '../lib/supabase'

const S = {
  card: { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(45,27,14,0.08)', padding:28, marginBottom:20 },
  input: { padding:'10px 14px', border:'1.5px solid #E8D5B7', borderRadius:8, fontSize:15, outline:'none', background:'#FDFAF5', width:100, textAlign:'center', fontWeight:700 },
  btn: { background:'#F5A623', color:'#2D1B0E', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:800, cursor:'pointer', fontSize:14 },
  label: { fontSize:13, color:'#5D3A1A', fontWeight:700, marginBottom:6, display:'block' },
  section: { fontWeight:900, fontSize:16, color:'#2D1B0E', marginBottom:20, display:'flex', alignItems:'center', gap:8 },
  row: { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:16 },
  text: { fontSize:15, color:'#2D1B0E', fontWeight:500 },
  preview: { background:'linear-gradient(135deg,#FDF0DC,#FAE0B0)', borderRadius:12, padding:'16px 20px', marginTop:20 },
}

export default function AdminPointRules() {
  const [rules, setRules]   = useState({ earn: null, redeem: null })
  const [earn, setEarn]     = useState({ spend_amount:1, earn_points:1 })
  const [redeem, setRedeem] = useState({ redeem_points:100, redeem_amount:10, min_order_for_redeem:0, max_redeem_percent:50 })
  const [saving, setSaving] = useState('')
  const [msg, setMsg]       = useState('')

  useEffect(() => {
    fetchPointRules().then(({ data }) => {
      if (!data) return
      const e = data.find(r => r.rule_type === 'earn')
      const r = data.find(r => r.rule_type === 'redeem')
      if (e) { setRules(prev => ({ ...prev, earn: e })); setEarn({ spend_amount: e.spend_amount, earn_points: e.earn_points }) }
      if (r) { setRules(prev => ({ ...prev, redeem: r })); setRedeem({ redeem_points: r.redeem_points, redeem_amount: r.redeem_amount, min_order_for_redeem: r.min_order_for_redeem, max_redeem_percent: r.max_redeem_percent }) }
    })
  }, [])

  const saveEarn = async () => {
    setSaving('earn')
    const { error } = await adminUpdatePointRule('earn', { ...earn, redeem_points: rules.redeem?.redeem_points || 100, redeem_amount: rules.redeem?.redeem_amount || 10, min_order_for_redeem: rules.redeem?.min_order_for_redeem || 0, max_redeem_percent: rules.redeem?.max_redeem_percent || 50 })
    setSaving('')
    setMsg(error ? '❌ 儲存失敗：' + error.message : '✅ 累點規則已更新')
    setTimeout(() => setMsg(''), 3000)
  }

  const saveRedeem = async () => {
    setSaving('redeem')
    const { error } = await adminUpdatePointRule('redeem', { spend_amount: rules.earn?.spend_amount || 1, earn_points: rules.earn?.earn_points || 1, ...redeem })
    setSaving('')
    setMsg(error ? '❌ 儲存失敗：' + error.message : '✅ 折抵規則已更新')
    setTimeout(() => setMsg(''), 3000)
  }

  const numInput = (val, setter, field, min=1) => (
    <input style={S.input} type="number" min={min} value={val}
      onChange={e => setter(p => ({ ...p, [field]: Number(e.target.value) }))} />
  )

  // Preview calculations
  const exampleOrder = 200
  const earnPreview  = Math.floor(exampleOrder / earn.spend_amount) * earn.earn_points
  const redeemPreview = Math.floor(100 / redeem.redeem_points) * redeem.redeem_amount

  return (
    <div>
      <div style={{ fontWeight:800, fontSize:18, marginBottom:20, color:'#2D1B0E' }}>⭐ 點數規則設定</div>

      {msg && (
        <div style={{ background: msg.startsWith('✅') ? '#C6F6D5' : '#FED7D7', color: msg.startsWith('✅') ? '#276749' : '#C53030', borderRadius:10, padding:'12px 16px', marginBottom:16, fontWeight:700 }}>
          {msg}
        </div>
      )}

      {/* Earn Rule */}
      <div style={S.card}>
        <div style={S.section}>🛍️ 消費累點規則</div>
        <div style={S.row}>
          <span style={S.text}>每消費</span>
          {numInput(earn.spend_amount, setEarn, 'spend_amount')}
          <span style={S.text}>元，贈送</span>
          {numInput(earn.earn_points, setEarn, 'earn_points')}
          <span style={S.text}>點</span>
        </div>

        {/* Preview */}
        <div style={S.preview}>
          <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:8 }}>📊 試算範例</div>
          <div style={{ fontSize:14, color:'#2D1B0E' }}>
            消費 <b>NT${exampleOrder}</b> → 獲得 <b style={{ color:'#C05621' }}>{earnPreview} 點</b>
          </div>
          <div style={{ fontSize:12, color:'#8B6A40', marginTop:4 }}>
            消費 NT$1,000 → 獲得 {Math.floor(1000 / earn.spend_amount) * earn.earn_points} 點
          </div>
        </div>

        <button style={{ ...S.btn, marginTop:20 }} onClick={saveEarn} disabled={saving === 'earn'}>
          {saving === 'earn' ? '儲存中...' : '儲存累點規則'}
        </button>
      </div>

      {/* Redeem Rule */}
      <div style={S.card}>
        <div style={S.section}>🎁 點數折抵規則</div>

        <div style={S.row}>
          <span style={S.text}>每</span>
          {numInput(redeem.redeem_points, setRedeem, 'redeem_points')}
          <span style={S.text}>點，可折抵</span>
          {numInput(redeem.redeem_amount, setRedeem, 'redeem_amount')}
          <span style={S.text}>元</span>
        </div>

        <div style={{ borderTop:'1px solid #F0E4D0', paddingTop:16, marginTop:4 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:14 }}>使用限制</div>

          <div style={S.row}>
            <span style={S.text}>最低消費金額達</span>
            {numInput(redeem.min_order_for_redeem, setRedeem, 'min_order_for_redeem', 0)}
            <span style={S.text}>元才可使用點數折抵</span>
          </div>
          <div style={{ fontSize:12, color:'#8B6A40', marginBottom:14 }}>設為 0 表示無最低消費限制</div>

          <div style={S.row}>
            <span style={S.text}>單筆訂單最多可用點數折抵</span>
            {numInput(redeem.max_redeem_percent, setRedeem, 'max_redeem_percent')}
            <span style={S.text}>% 的訂單金額</span>
          </div>
          <div style={{ fontSize:12, color:'#8B6A40', marginBottom:4 }}>例如設 50%，NT$200 的訂單最多折抵 NT$100</div>
        </div>

        {/* Preview */}
        <div style={S.preview}>
          <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:8 }}>📊 試算範例</div>
          <div style={{ fontSize:14, color:'#2D1B0E' }}>
            擁有 <b>100 點</b> → 可折抵 <b style={{ color:'#C05621' }}>NT${redeemPreview}</b>
          </div>
          <div style={{ fontSize:12, color:'#8B6A40', marginTop:4 }}>
            NT${exampleOrder} 的訂單，最多可折抵 NT${Math.floor(exampleOrder * redeem.max_redeem_percent / 100)}（{redeem.max_redeem_percent}%）
          </div>
          {redeem.min_order_for_redeem > 0 && (
            <div style={{ fontSize:12, color:'#E53E3E', marginTop:4 }}>
              ⚠️ 需消費滿 NT${redeem.min_order_for_redeem} 才能使用點數
            </div>
          )}
        </div>

        <button style={{ ...S.btn, marginTop:20 }} onClick={saveRedeem} disabled={saving === 'redeem'}>
          {saving === 'redeem' ? '儲存中...' : '儲存折抵規則'}
        </button>
      </div>

      {/* Summary card */}
      <div style={{ ...S.card, background:'linear-gradient(135deg,#2D1B0E,#5D3A1A)', color:'#F5E6C8' }}>
        <div style={{ fontWeight:800, fontSize:16, marginBottom:16 }}>📋 目前規則總覽</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:16 }}>
            <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>消費累點</div>
            <div style={{ fontWeight:900, fontSize:18, color:'#F5A623' }}>
              每 NT${earn.spend_amount} = {earn.earn_points} 點
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:16 }}>
            <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>點數折抵</div>
            <div style={{ fontWeight:900, fontSize:18, color:'#F5A623' }}>
              {redeem.redeem_points} 點 = NT${redeem.redeem_amount}
            </div>
            <div style={{ fontSize:11, opacity:.7, marginTop:4 }}>最多折抵 {redeem.max_redeem_percent}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
