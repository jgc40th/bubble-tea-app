// src/pages/MemberZone.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, fetchMyOrders, fetchPointLogs, fetchMemberCoupons } from '../lib/supabase'

const S = {
  page: { minHeight:'100vh', background:'#FDF6ED', fontFamily:'Noto Sans TC, sans-serif', paddingBottom:40 },
  card: { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(45,27,14,0.08)', padding:24, marginBottom:16 },
  input: { width:'100%', padding:'10px 14px', border:'1.5px solid #E8D5B7', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', background:'#FDFAF5' },
  btn: { background:'#F5A623', color:'#2D1B0E', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, cursor:'pointer', fontSize:14 },
  tab: (a) => ({ padding:'10px 18px', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14, background: a ? '#F5A623' : 'transparent', color: a ? '#2D1B0E' : '#8B6A40' }),
  badge: { background:'#FDF0DC', color:'#C05621', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 },
  statusColor: { '待接單':['#EDF2F7','#4A5568'], '已接單製作中':['#FEEBC8','#B7791F'], '已完成可取餐':['#C6F6D5','#276749'], '已取消':['#FED7D7','#C53030'] },
}

const levelLabel = { general:'一般會員', silver:'銀卡會員', gold:'金卡會員', vip:'VIP 會員' }
const levelColor  = { general:'#8B6A40', silver:'#718096', gold:'#B7791F', vip:'#6B46C1' }
const nextLevel   = { general:{ name:'銀卡', need:500 }, silver:{ name:'金卡', need:2000 }, gold:{ name:'VIP', need:5000 }, vip: null }

export default function MemberZone({ onBack, tab: initTab = 'profile' }) {
  const { user, profile, refreshProfile } = useAuth()
  const [tab, setTab] = useState(initTab)
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [coupons, setCoupons] = useState([])
  const [editForm, setEditForm] = useState({ name:'', phone:'', birthday:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (profile) setEditForm({ name: profile.name || '', phone: profile.phone || '', birthday: profile.birthday || '' })
  }, [profile])

  useEffect(() => {
    if (!user) return
    if (tab === 'orders') fetchMyOrders(user.id).then(r => setOrders(r.data || []))
    if (tab === 'points') fetchPointLogs(user.id).then(r => setLogs(r.data || []))
    if (tab === 'coupons') fetchMemberCoupons(user.id).then(r => setCoupons(r.data || []))
  }, [tab, user])

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await updateProfile(user.id, editForm)
    setSaving(false)
    if (error) setMsg('儲存失敗：' + error.message)
    else { setMsg('✅ 資料已更新'); refreshProfile() }
  }

  const nl = nextLevel[profile?.level]

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ background:'#2D1B0E', color:'#F5E6C8', padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#F5E6C8', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:14 }}>← 返回</button>
        <span style={{ fontWeight:900, fontSize:18 }}>會員中心</span>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'24px 16px' }}>
        {/* Profile hero */}
        <div style={{ ...S.card, background:'linear-gradient(135deg,#2D1B0E,#5D3A1A)', color:'#F5E6C8', display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:70, height:70, borderRadius:50, background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width:70, height:70, borderRadius:50, objectFit:'cover' }} alt="" /> : '🧋'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:22 }}>{profile?.name || '茶飲會員'}</div>
            <div style={{ fontSize:13, opacity:.8, marginTop:2 }}>{user?.email}</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
              <span style={{ background: levelColor[profile?.level] || '#8B6A40', color:'#fff', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>
                {levelLabel[profile?.level] || '一般會員'}
              </span>
              <span style={{ fontSize:13 }}>⭐ {profile?.points || 0} 點</span>
            </div>
            {nl && (
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:11, opacity:.7 }}>再累積 {nl.need - (profile?.points || 0)} 點升級 {nl.name}會員</div>
                <div style={{ height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, marginTop:4 }}>
                  <div style={{ height:4, background:'#F5A623', borderRadius:2, width: `${Math.min(100, ((profile?.points||0) / nl.need)*100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'#F0E8DC', borderRadius:12, padding:4, marginBottom:20 }}>
          {[['profile','👤 基本資料'],['orders','📋 訂單紀錄'],['points','⭐ 點數紀錄'],['coupons','🎫 我的優惠券']].map(([id,label]) => (
            <button key={id} style={S.tab(tab===id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={S.card}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:20 }}>基本資料維護</div>
            {msg && <div style={{ color: msg.startsWith('✅') ? '#276749' : '#C53030', marginBottom:12, fontSize:13 }}>{msg}</div>}
            {[['姓名','name','text'],['手機','phone','tel'],['生日','birthday','date']].map(([label,key,type]) => (
              <div key={key} style={{ marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:6 }}>{label}</div>
                <input style={S.input} type={type} value={editForm[key]} onChange={e => setEditForm(f=>({...f,[key]:e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:6 }}>LINE 綁定</div>
              {profile?.line_uid
                ? <div style={{ ...S.badge, display:'inline-block' }}>✅ 已綁定 LINE 帳號</div>
                : <div style={{ fontSize:13, color:'#8B6A40' }}>尚未綁定 LINE — 點「LINE 登入」後自動綁定</div>}
            </div>
            <button style={S.btn} onClick={saveProfile} disabled={saving}>{saving ? '儲存中...' : '儲存變更'}</button>
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0
              ? <div style={{ textAlign:'center', padding:'60px 0', color:'#8B6A40' }}>還沒有訂單紀錄</div>
              : orders.map(o => {
                const isExpanded = expandedOrder === o.id
                const sc = S.statusColor[o.status] || ['#EDF2F7','#4A5568']
                return (
                  <div key={o.id} style={{ ...S.card, padding:0, overflow:'hidden' }}>
                    {/* Order header — clickable to expand */}
                    <div style={{ padding:'18px 20px', cursor:'pointer', userSelect:'none' }}
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ fontWeight:900, fontSize:22, color:'#C05621' }}>{o.order_number}</div>
                          <span style={{ background:sc[0], color:sc[1], borderRadius:20, padding:'3px 12px', fontWeight:700, fontSize:12 }}>{o.status}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <span style={{ fontWeight:800, color:'#C05621', fontSize:16 }}>NT${o.total}</span>
                          <span style={{ fontSize:18, color:'#8B6A40', transition:'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display:'inline-block' }}>▾</span>
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:'#8B6A40', marginTop:6, display:'flex', gap:16 }}>
                        <span>📍 {o.stores?.name}</span>
                        <span>🕐 {new Date(o.created_at).toLocaleString('zh-TW')}</span>
                        <span>💳 {o.payment_method}</span>
                        {o.points_earned > 0 && <span style={{ color:'#6B46C1' }}>⭐ +{o.points_earned} 點</span>}
                      </div>
                    </div>

                    {/* Order detail — expandable */}
                    {isExpanded && (
                      <div style={{ borderTop:'1.5px solid #F0E4D0', background:'#FDF9F4' }}>
                        {/* Items */}
                        <div style={{ padding:'16px 20px' }}>
                          <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:12 }}>📋 訂單明細</div>
                          {o.order_items?.map((item, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 0', borderBottom: i < o.order_items.length-1 ? '1px solid #F0E4D0' : 'none' }}>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontSize:14 }}>{item.product_name}</div>
                                <div style={{ fontSize:12, color:'#8B6A40', marginTop:3, display:'flex', flexWrap:'wrap', gap:6 }}>
                                  <span style={{ background:'#F0E8DC', borderRadius:6, padding:'2px 8px' }}>{item.size}</span>
                                  <span style={{ background:'#F0E8DC', borderRadius:6, padding:'2px 8px' }}>{item.sweetness}</span>
                                  <span style={{ background:'#F0E8DC', borderRadius:6, padding:'2px 8px' }}>{item.ice}</span>
                                  {item.toppings?.filter(Boolean).map((t,j) => (
                                    <span key={j} style={{ background:'#FDF0DC', color:'#C05621', borderRadius:6, padding:'2px 8px' }}>+{t}</span>
                                  ))}
                                </div>
                              </div>
                              <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
                                <div style={{ fontSize:12, color:'#8B6A40' }}>× {item.qty}</div>
                                <div style={{ fontWeight:700, color:'#2D1B0E' }}>NT${item.unit_price * item.qty}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Price summary */}
                        <div style={{ padding:'12px 20px 16px', borderTop:'1px solid #F0E4D0' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#8B6A40', marginBottom:4 }}>
                            <span>小計</span><span>NT${o.subtotal}</span>
                          </div>
                          {o.discount > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#276749', marginBottom:4 }}>
                              <span>優惠折抵</span><span>-NT${o.discount}</span>
                            </div>
                          )}
                          {o.points_used > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B46C1', marginBottom:4 }}>
                              <span>點數折抵</span><span>-NT${o.points_used}</span>
                            </div>
                          )}
                          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:16, paddingTop:8, borderTop:'1.5px solid #E8D5B7', marginTop:4 }}>
                            <span>總計</span><span style={{ color:'#C05621' }}>NT${o.total}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}

        {/* Points tab */}
        {tab === 'points' && (
          <div>
            <div style={{ ...S.card, textAlign:'center', background:'linear-gradient(135deg,#FDF0DC,#FAE0B0)' }}>
              <div style={{ fontSize:13, color:'#5D3A1A', marginBottom:4 }}>目前點數餘額</div>
              <div style={{ fontSize:52, fontWeight:900, color:'#C05621' }}>{profile?.points || 0}</div>
              <div style={{ fontSize:13, color:'#8B6A40' }}>點 ｜ 每消費 NT$1 累積 1 點</div>
            </div>
            {logs.length === 0
              ? <div style={{ textAlign:'center', padding:'40px 0', color:'#8B6A40' }}>尚無點數紀錄</div>
              : logs.map((log, i) => (
                <div key={i} style={{ ...S.card, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{log.reason}</div>
                    <div style={{ fontSize:12, color:'#8B6A40' }}>{new Date(log.created_at).toLocaleString('zh-TW')}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:900, fontSize:18, color: log.change > 0 ? '#276749' : '#C53030' }}>
                      {log.change > 0 ? '+' : ''}{log.change}
                    </div>
                    <div style={{ fontSize:12, color:'#8B6A40' }}>餘額 {log.balance_after}</div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Coupons tab */}
        {tab === 'coupons' && (
          <div>
            {coupons.length === 0
              ? <div style={{ textAlign:'center', padding:'60px 0', color:'#8B6A40' }}>目前沒有可用優惠券</div>
              : coupons.map(mc => (
                <div key={mc.id} style={{ ...S.card, border:'2px dashed #F5A623', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, bottom:0, width:6, background:'#F5A623' }}/>
                  <div style={{ paddingLeft:12 }}>
                    <div style={{ fontWeight:900, fontSize:20, color:'#C05621', letterSpacing:2 }}>{mc.coupons?.code}</div>
                    <div style={{ fontWeight:700, fontSize:15, marginTop:4 }}>{mc.coupons?.description}</div>
                    <div style={{ fontSize:13, color:'#8B6A40', marginTop:4 }}>
                      {mc.coupons?.discount_type === 'percent'
                        ? `折扣 ${mc.coupons.discount_value}%`
                        : `折抵 NT$${mc.coupons?.discount_value}`}
                      {mc.coupons?.min_order > 0 ? ` ｜ 最低消費 NT$${mc.coupons.min_order}` : ''}
                    </div>
                    {mc.coupons?.end_at && (
                      <div style={{ fontSize:12, color:'#E53E3E', marginTop:4 }}>
                        有效期限：{new Date(mc.coupons.end_at).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
