import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthModal from './components/AuthModal'
import MemberZone from './pages/MemberZone'
import AdminMembers from './pages/AdminMembers'
import {
  supabase, signOut,
  fetchCategories, fetchProducts,
  validateCoupon, fetchMemberCoupons,
  createOrder,
} from './lib/supabase'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STORES = [
  { id: 1, name: '信義旗艦店', hours: '10:00-22:00' },
  { id: 2, name: '西門町店',   hours: '10:00-23:00' },
  { id: 3, name: '中山北路店', hours: '10:00-21:30' },
]
const SWEETNESS = ['無糖','微糖','半糖','七分糖','全糖']
const ICE       = ['去冰','少冰','正常冰','多冰']
const SIZES     = [{ label:'中杯 M', extra:0 },{ label:'大杯 L', extra:10 }]
const TOPPINGS  = [
  { id:'pearl',   name:'珍珠',   price:10 },
  { id:'coconut', name:'椰果',   price:10 },
  { id:'pudding', name:'布丁',   price:15 },
  { id:'grass',   name:'仙草凍', price:10 },
  { id:'redbean', name:'蜜紅豆', price:15 },
  { id:'tarocircle', name:'芋圓', price:15 },
]
function genOrderNum() { return 'A' + String(Math.floor(Math.random()*900+100)) }

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page:    { minHeight:'100vh', background:'#FDF6ED', fontFamily:"'Noto Sans TC', sans-serif", color:'#2D1B0E' },
  header:  { background:'#2D1B0E', color:'#F5E6C8', padding:'0 20px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(45,27,14,0.3)' },
  btn:     { background:'#F5A623', color:'#2D1B0E', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnOut:  { background:'transparent', color:'#F5A623', border:'2px solid #F5A623', borderRadius:8, padding:'7px 16px', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnGreen:{ background:'#38A169', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnRed:  { background:'#E53E3E', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer', fontSize:13 },
  card:    { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(45,27,14,0.08)', overflow:'hidden' },
  input:   { width:'100%', padding:'10px 14px', border:'1.5px solid #E8D5B7', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', background:'#FDFAF5' },
  pill:    (a) => ({ padding:'8px 16px', borderRadius:30, border:'2px solid '+(a?'#F5A623':'#E8D5B7'), background:a?'#F5A623':'#fff', color:a?'#2D1B0E':'#8B6A40', fontWeight:700, cursor:'pointer', fontSize:13, transition:'all .2s', whiteSpace:'nowrap' }),
  modal:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  modalBox:{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', padding:24 },
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
function TagBadge({ tag }) {
  if (!tag) return null
  const map = { 熱銷:['#FFF3CD','#B7791F'], 人氣:['#FED7D7','#C53030'], 新品:['#C6F6D5','#276749'], 限定:['#E9D8FD','#6B46C1'], 季節:['#BEE3F8','#2B6CB0'] }
  const [bg,text] = map[tag] || ['#EDF2F7','#4A5568']
  return <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color:text }}>{tag}</span>
}

function ProductCard({ product, onAdd }) {
  return (
    <div style={{ ...S.card, display:'flex', flexDirection:'column', cursor:'pointer', transition:'transform .2s, box-shadow .2s' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(245,166,35,0.2)' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
      <div style={{ background:'linear-gradient(135deg,#FDF0DC,#FAE0B0)', height:110, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative' }}>
        🧋
        <div style={{ position:'absolute', top:8, right:8 }}><TagBadge tag={product.tag} /></div>
      </div>
      <div style={{ padding:'14px 14px 16px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ fontWeight:800, fontSize:15 }}>{product.name}</div>
        <div style={{ fontSize:12, color:'#8B6A40', lineHeight:1.5, flex:1 }}>{product.description}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
          <span style={{ fontWeight:900, fontSize:18, color:'#C05621' }}>NT${product.price}</span>
          <button style={{ ...S.btn, padding:'6px 14px', borderRadius:20 }} onClick={() => onAdd(product)}>加入 +</button>
        </div>
      </div>
    </div>
  )
}

// ─── ADD TO CART MODAL ────────────────────────────────────────────────────────
function AddToCartModal({ product, onClose, onConfirm }) {
  const [size, setSize]           = useState(0)
  const [sweetness, setSweetness] = useState('半糖')
  const [ice, setIce]             = useState('正常冰')
  const [toppings, setToppings]   = useState([])
  const [qty, setQty]             = useState(1)

  const toggleTop = (t) => setToppings(p => p.includes(t.id) ? p.filter(x=>x!==t.id) : [...p,t.id])
  const topTotal  = toppings.reduce((s,tid) => s+(TOPPINGS.find(t=>t.id===tid)?.price||0), 0)
  const unitPrice = product.price + SIZES[size].extra + topTotal

  return (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:20 }}>{product.name}</div>
            <div style={{ fontSize:12, color:'#8B6A40', marginTop:2 }}>{product.description}</div>
          </div>
          <button onClick={onClose} style={{ background:'#EDF2F7', border:'none', borderRadius:50, width:32, height:32, cursor:'pointer', fontSize:18 }}>×</button>
        </div>
        {[['🥤 杯型', SIZES.map((s,i)=>({label:`${s.label}${s.extra?` +${s.extra}`:''}`, val:i})), size, setSize],
          ['🍯 甜度', SWEETNESS.map(s=>({label:s,val:s})), sweetness, setSweetness],
          ['❄️ 冰塊', ICE.map(s=>({label:s,val:s})), ice, setIce]
        ].map(([title, opts, cur, setter]) => (
          <div key={title} style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:8 }}>{title}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {opts.map(o => <button key={o.val} style={S.pill(cur===o.val)} onClick={() => setter(o.val)}>{o.label}</button>)}
            </div>
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#5D3A1A', marginBottom:8 }}>✨ 加料</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {TOPPINGS.map(t => <button key={t.id} style={S.pill(toppings.includes(t.id))} onClick={() => toggleTop(t)}>{t.name} +{t.price}</button>)}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1.5px solid #F0E4D0', paddingTop:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setQty(q=>Math.max(1,q-1))} style={{ width:34, height:34, borderRadius:50, border:'2px solid #E8D5B7', background:'#fff', fontSize:18, cursor:'pointer' }}>-</button>
            <span style={{ fontWeight:800, fontSize:18 }}>{qty}</span>
            <button onClick={() => setQty(q=>q+1)} style={{ width:34, height:34, borderRadius:50, border:'2px solid #F5A623', background:'#F5A623', fontSize:18, cursor:'pointer' }}>+</button>
          </div>
          <button style={{ ...S.btn, fontSize:15, padding:'12px 24px' }}
            onClick={() => onConfirm({ ...product, productId: product.id, size: SIZES[size].label, sweetness, ice, toppings: toppings.map(tid=>TOPPINGS.find(t=>t.id===tid)?.name), unitPrice, qty })}>
            加入購物車 NT${unitPrice*qty}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CART / CHECKOUT MODAL ────────────────────────────────────────────────────
function CartModal({ cart, onRemove, onCheckout, onClose, user, profile }) {
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon]         = useState(null)
  const [couponMsg, setCouponMsg]   = useState('')
  const [payment, setPayment]       = useState('現金')
  const [usePoints, setUsePoints]   = useState(0)
  const [memberCoupons, setMemberCoupons] = useState([])
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (user) fetchMemberCoupons(user.id).then(r => setMemberCoupons(r.data || []))
  }, [user])

  const subtotal    = cart.reduce((s,i) => s+i.unitPrice*i.qty, 0)
  const couponSave  = !coupon ? 0 : coupon.discount_type === 'percent' ? Math.round(subtotal*(coupon.discount_value/100)) : coupon.discount_value
  const pointsSave  = Math.min(usePoints, profile?.points || 0)
  const total       = Math.max(0, subtotal - couponSave - pointsSave)

  const applyCoupon = async (code) => {
    const { data, error } = await validateCoupon(code || couponCode)
    if (error || !data) { setCoupon(null); setCouponMsg('❌ 無效或已過期') }
    else { setCoupon(data); setCouponMsg('✅ ' + data.description) }
  }

  const handleCheckout = async () => {
    setLoading(true)
    await onCheckout({ payment, coupon, total, subtotal, discount: couponSave, pointsUsed: pointsSave })
    setLoading(false)
  }

  return (
    <div style={S.modal} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontWeight:900, fontSize:20 }}>🛒 購物車結帳</div>
          <button onClick={onClose} style={{ background:'#EDF2F7', border:'none', borderRadius:50, width:32, height:32, cursor:'pointer', fontSize:18 }}>×</button>
        </div>

        {cart.length === 0
          ? <div style={{ textAlign:'center', padding:'40px 0', color:'#8B6A40' }}>購物車是空的 🧋</div>
          : <>
            {cart.map((item,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #F0E4D0' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{item.name} × {item.qty}</div>
                  <div style={{ fontSize:12, color:'#8B6A40', marginTop:2 }}>{item.size} ｜ {item.sweetness} ｜ {item.ice}{item.toppings?.length ? ' ｜ '+item.toppings.join(', ') : ''}</div>
                </div>
                <div style={{ fontWeight:800, color:'#C05621' }}>NT${item.unitPrice*item.qty}</div>
                <button onClick={() => onRemove(i)} style={{ background:'none', border:'none', color:'#A0AEC0', cursor:'pointer', fontSize:18 }}>×</button>
              </div>
            ))}

            {/* Member coupon selector */}
            {user && memberCoupons.length > 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>🎫 我的優惠券</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {memberCoupons.map(mc => (
                    <button key={mc.id} style={S.pill(coupon?.id===mc.coupon_id)}
                      onClick={() => { applyCoupon(mc.coupons?.code) }}>
                      {mc.coupons?.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual coupon input */}
            <div style={{ marginTop:14, display:'flex', gap:8 }}>
              <input style={{ ...S.input, flex:1 }} placeholder="或輸入優惠券代碼" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
              <button style={S.btnOut} onClick={() => applyCoupon()}>套用</button>
            </div>
            {couponMsg && <div style={{ fontSize:12, marginTop:6, color: coupon ? '#276749' : '#C53030' }}>{couponMsg}</div>}

            {/* Points */}
            {user && (profile?.points||0) > 0 && (
              <div style={{ marginTop:14, background:'#FDF6ED', borderRadius:10, padding:14 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>⭐ 使用點數折抵（可用：{profile.points} 點）</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="range" min={0} max={Math.min(profile.points, subtotal)} value={usePoints}
                    onChange={e => setUsePoints(Number(e.target.value))}
                    style={{ flex:1, accentColor:'#F5A623' }} />
                  <span style={{ fontWeight:800, color:'#C05621', minWidth:70 }}>-NT${pointsSave}</span>
                </div>
                <div style={{ fontSize:12, color:'#8B6A40', marginTop:4 }}>使用 {usePoints} 點 = 折抵 NT${pointsSave}</div>
              </div>
            )}

            {/* Payment */}
            <div style={{ marginTop:14 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>💳 付款方式</div>
              <div style={{ display:'flex', gap:8 }}>
                {['現金','Line Pay','信用卡'].map(p => <button key={p} style={S.pill(payment===p)} onClick={() => setPayment(p)}>{p}</button>)}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginTop:20, background:'#FDF6ED', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14 }}><span>小計</span><span>NT${subtotal}</span></div>
              {couponSave > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14, color:'#276749' }}><span>優惠折抵</span><span>-NT${couponSave}</span></div>}
              {pointsSave > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:14, color:'#6B46C1' }}><span>點數折抵</span><span>-NT${pointsSave}</span></div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:20, marginTop:8, paddingTop:8, borderTop:'1.5px solid #E8D5B7' }}>
                <span>總計</span><span style={{ color:'#C05621' }}>NT${total}</span>
              </div>
              {user && <div style={{ fontSize:12, color:'#8B6A40', marginTop:6 }}>本次消費可累積 {total} 點</div>}
            </div>

            <button style={{ ...S.btn, width:'100%', marginTop:16, padding:'14px', fontSize:16 }}
              onClick={handleCheckout} disabled={loading}>
              {loading ? '處理中...' : `確認結帳 NT${total}`}
            </button>
            {!user && <div style={{ textAlign:'center', fontSize:12, color:'#8B6A40', marginTop:10 }}>登入會員可使用優惠券、點數並累積回饋</div>}
          </>}
      </div>
    </div>
  )
}

// ─── SUCCESS MODAL ────────────────────────────────────────────────────────────
function SuccessModal({ order, onClose }) {
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, textAlign:'center', paddingTop:40 }}>
        <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
        <div style={{ fontWeight:900, fontSize:26, color:'#C05621' }}>訂單成立！</div>
        <div style={{ fontSize:14, color:'#5D3A1A', marginTop:6 }}>取餐號碼</div>
        <div style={{ fontSize:72, fontWeight:900, letterSpacing:4, margin:'12px 0' }}>{order.order_number}</div>
        <div style={{ background:'#FDF0DC', borderRadius:12, padding:16, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontSize:13, color:'#5D3A1A' }}>💰 NT${order.total} ｜ 💳 {order.payment_method}</div>
          {order.points_earned > 0 && <div style={{ fontSize:13, color:'#6B46C1', marginTop:4 }}>⭐ 累積 {order.points_earned} 點</div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
          {['待接單','已接單製作中','已完成可取餐'].map((s,i) => (
            <><div key={s} style={{ textAlign:'center', flex:1 }}>
              <div style={{ width:28, height:28, borderRadius:50, background: i===0 ? '#F5A623' : '#E8D5B7', margin:'0 auto 4px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                {i===0 ? '✓' : i+1}
              </div>
              <div style={{ fontSize:10, color: i===0 ? '#C05621' : '#A0AEC0', fontWeight:700 }}>{s}</div>
            </div>
            {i<2 && <div style={{ flex:1, height:2, background: i===0 ? '#F5A623' : '#E8D5B7' }}/>}</>
          ))}
        </div>
        <button style={{ ...S.btn, padding:'12px 40px', fontSize:15 }} onClick={onClose}>返回菜單</button>
      </div>
    </div>
  )
}

// ─── CONSUMER VIEW ────────────────────────────────────────────────────────────
function ConsumerView({ onSwitchAdmin }) {
  const { user, profile } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts]     = useState([])
  const [selCategory, setSelCategory] = useState(null)
  const [search, setSearch]         = useState('')
  const [addModal, setAddModal]     = useState(null)
  const [cart, setCart]             = useState([])
  const [showCart, setShowCart]     = useState(false)
  const [showAuth, setShowAuth]     = useState(false)
  const [showMember, setShowMember] = useState(false)
  const [memberTab, setMemberTab]     = useState('profile')
  const [successOrder, setSuccessOrder] = useState(null)
  const [selStore, setSelStore]     = useState(STORES[0])

  useEffect(() => {
    fetchCategories().then(r => setCategories(r.data || []))
    fetchProducts().then(r => setProducts(r.data || []))
  }, [])

  const visibleProducts = products
    .filter(p => !selCategory || p.category_id === selCategory)
    .filter(p => !search || p.name.includes(search) || (p.description||'').includes(search))

  const checkout = async ({ payment, coupon, total, subtotal, discount, pointsUsed }) => {
    const orderNum = genOrderNum()
    const pointsEarned = user ? total : 0

    const orderData = {
      order_number:   orderNum,
      user_id:        user?.id,
      store_id:       selStore.id,
      payment_method: payment,
      subtotal,
      discount,
      points_used:    pointsUsed,
      total,
      coupon_id:      coupon?.id || null,
      points_earned:  pointsEarned,
    }

    if (user) {
      // Save to Supabase
      const items = cart.map(item => ({ ...item }))
      const { data: newOrder, error } = await createOrder({ ...orderData, items })
      if (!error && pointsEarned > 0) {
        // Update profile points via RPC or direct update handled server-side
      }
      setSuccessOrder({ ...orderData, points_earned: pointsEarned })
    } else {
      setSuccessOrder({ ...orderData, points_earned: 0 })
    }
    setCart([])
    setShowCart(false)
  }

  if (showMember) return <MemberZone onBack={() => setShowMember(false)} tab={memberTab} />

  // Greeting based on time of day
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return '早安'; if (h < 14) return '午安'
    if (h < 18) return '下午好'; return '晚安'
  })()
  const memberName = profile?.name || user?.user_metadata?.name || '會員'

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <span style={{ fontSize:20, fontWeight:900, letterSpacing:2, color:'#F5A623' }}>🧋 可可茶飲</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {user ? (
            <>
              {/* Personalized greeting */}
              <span style={{ fontSize:13, color:'#F5E6C8', opacity:.9 }}>
                {greeting}，<span style={{ color:'#F5A623', fontWeight:800 }}>{memberName}</span> 👋
              </span>
              {/* Points badge */}
              {(profile?.points||0) > 0 && (
                <span style={{ background:'rgba(245,166,35,0.15)', border:'1px solid #F5A623', color:'#F5A623', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
                  ⭐ {profile.points} 點
                </span>
              )}
              {/* 會員專區 with quick links */}
              <div style={{ position:'relative' }}
                onMouseEnter={e => e.currentTarget.querySelector('.mdrop').style.display='block'}
                onMouseLeave={e => e.currentTarget.querySelector('.mdrop').style.display='none'}>
                <button style={{ ...S.btn, fontSize:13 }} onClick={() => { setMemberTab('profile'); setShowMember(true) }}>
                  👤 會員專區 ▾
                </button>
                <div className="mdrop" style={{ display:'none', position:'absolute', top:'calc(100% + 6px)', right:0, background:'#fff', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.18)', minWidth:170, zIndex:300, overflow:'hidden', border:'1px solid #F0E4D0' }}>
                  {[['📋','我的訂單','orders'],['👤','基本資料','profile'],['🎫','我的優惠券','coupons'],['⭐','點數紀錄','points']].map(([icon,label,tabId]) => (
                    <button key={label} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', border:'none', borderBottom:'1px solid #F5EDE0', background:'none', cursor:'pointer', fontSize:14, color:'#2D1B0E', textAlign:'left', fontFamily:'inherit' }}
                      onMouseEnter={e => e.currentTarget.style.background='#FDF6ED'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}
                      onClick={() => { setMemberTab(tabId); setShowMember(true) }}>
                      {icon} {label}
                    </button>
                  ))}
                  <button style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#E53E3E', textAlign:'left', fontFamily:'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FFF5F5'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}
                    onClick={signOut}>
                    🚪 登出
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button style={S.btn} onClick={() => setShowAuth(true)}>登入 / 註冊</button>
          )}
          <button style={{ ...S.btnOut, position:'relative' }} onClick={() => setShowCart(true)}>
            🛒 {cart.length > 0 && <span style={{ background:'#E53E3E', color:'#fff', borderRadius:50, padding:'2px 6px', fontSize:11, marginLeft:4 }}>{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </button>
          <button style={{ ...S.btn, fontSize:11, padding:'5px 10px' }} onClick={onSwitchAdmin}>門市後台</button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px' }}>
        {/* Store picker */}
        <div style={{ background:'#FFF9F0', border:'1.5px solid #F5A623', borderRadius:12, padding:'10px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#5D3A1A' }}>📍 取餐門市</span>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {STORES.map(s => <button key={s.id} style={S.pill(selStore.id===s.id)} onClick={() => setSelStore(s)}>{s.name}</button>)}
          </div>
          <span style={{ fontSize:12, color:'#8B6A40', marginLeft:'auto' }}>🕐 {selStore.hours}</span>
        </div>

        {/* Search */}
        <input style={{ ...S.input, marginBottom:16 }} placeholder="🔍 搜尋飲品..." value={search} onChange={e => setSearch(e.target.value)} />

        {/* Category tabs */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:10, marginBottom:20 }}>
          <button style={S.pill(!selCategory)} onClick={() => setSelCategory(null)}>全部</button>
          {categories.map(c => <button key={c.id} style={S.pill(selCategory===c.id)} onClick={() => setSelCategory(c.id)}>{c.icon} {c.name}</button>)}
        </div>

        {/* Product grid by category */}
        {categories.filter(c => !selCategory || c.id===selCategory).map(cat => {
          const ps = visibleProducts.filter(p => p.category_id===cat.id)
          if (!ps.length) return null
          return (
            <div key={cat.id} style={{ marginBottom:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                <span style={{ fontWeight:800, fontSize:18 }}>{cat.name}</span>
                <span style={{ fontSize:12, color:'#8B6A40', background:'#FDF0DC', borderRadius:20, padding:'2px 10px' }}>{ps.length} 款</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
                {ps.map(p => <ProductCard key={p.id} product={p} onAdd={setAddModal} />)}
              </div>
            </div>
          )
        })}
      </div>

      {addModal && <AddToCartModal product={addModal} onClose={() => setAddModal(null)} onConfirm={item => { setCart(p=>[...p,item]); setAddModal(null) }} />}
      {showCart && <CartModal cart={cart} onRemove={i => setCart(p=>p.filter((_,idx)=>idx!==i))} onCheckout={checkout} onClose={() => setShowCart(false)} user={user} profile={profile} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {successOrder && <SuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />}
    </div>
  )
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ onSwitchConsumer }) {
  const [tab, setTab]           = useState('orders')
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editId, setEditId]     = useState(null)
  const [selStore, setSelStore] = useState(null)

  const statusOrder = ['待接單','已接單製作中','已完成可取餐']
  const statusColor = { '待接單':['#EDF2F7','#4A5568'], '已接單製作中':['#FEEBC8','#B7791F'], '已完成可取餐':['#C6F6D5','#276749'], '已取消':['#FED7D7','#C53030'] }

  useEffect(() => {
    if (tab === 'orders')    loadOrders()
    if (tab === 'products')  { fetchProducts().then(r=>setProducts(r.data||[])); fetchCategories().then(r=>setCategories(r.data||[])) }
    if (tab === 'categories') fetchCategories().then(r=>setCategories(r.data||[]))
  }, [tab])

  const loadOrders = async () => {
    let q = supabase.from('orders').select('*, stores(name), order_items(*), profiles(name,phone)').order('created_at',{ascending:false})
    if (selStore) q = q.eq('store_id', selStore)
    const { data } = await q
    setOrders(data || [])
  }

  const advanceStatus = async (order) => {
    const next = statusOrder[statusOrder.indexOf(order.status)+1]
    if (!next) return
    await supabase.from('orders').update({ status:next, updated_at:new Date().toISOString() }).eq('id',order.id)
    loadOrders()
  }

  const toggleProduct = async (id, active) => {
    await supabase.from('products').update({ active }).eq('id', id)
    setProducts(p => p.map(x => x.id===id ? {...x,active} : x))
  }

  const updateField = (id, field, val) => setProducts(p => p.map(x => x.id===id ? {...x,[field]:val} : x))

  const saveProduct = async (p) => {
    await supabase.from('products').update({ name:p.name, price:p.price, description:p.description }).eq('id',p.id)
    setEditId(null)
  }

  const tabs = [['orders','📋 訂單管理'],['products','🧋 商品管理'],['categories','📁 類別管理'],['members','👥 會員管理']]

  return (
    <div style={{ ...S.page, background:'#F7F4F0' }}>
      <div style={{ ...S.header }}>
        <span style={{ fontSize:18, fontWeight:900, color:'#F5A623' }}>⚙️ 門市後台</span>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select style={{ padding:'6px 10px', borderRadius:8, border:'none', background:'#4A3728', color:'#F5E6C8', fontSize:12 }}
            onChange={e => setSelStore(e.target.value || null)}>
            <option value=''>全部門市</option>
            {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button style={S.btn} onClick={onSwitchConsumer}>前台點餐</button>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'24px 16px' }}>
        <div style={{ display:'flex', gap:4, background:'#E8DDD0', borderRadius:12, padding:4, marginBottom:24, width:'fit-content' }}>
          {tabs.map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding:'10px 18px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background: tab===id ? '#fff' : 'transparent', color: tab===id ? '#2D1B0E' : '#8B6A40', boxShadow: tab===id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>訂單管理</div>
            {orders.map(o => (
              <div key={o.id} style={{ background:'#fff', borderRadius:14, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:18, marginBottom:10, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ fontWeight:900, fontSize:26, color:'#C05621', minWidth:64 }}>{o.order_number}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{o.stores?.name} ｜ {new Date(o.created_at).toLocaleTimeString('zh-TW')} ｜ {o.payment_method}</div>
                  <div style={{ fontSize:13, color:'#5D3A1A', marginTop:3 }}>
                    {o.profiles ? `👤 ${o.profiles.name}` : '訪客'} ｜ {o.order_items?.map(i=>`${i.product_name}×${i.qty}`).join('、')}
                  </div>
                  <div style={{ fontWeight:800, color:'#C05621', marginTop:4 }}>NT${o.total}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                  <span style={{ background:statusColor[o.status]?.[0], color:statusColor[o.status]?.[1], borderRadius:20, padding:'4px 14px', fontWeight:700, fontSize:13 }}>{o.status}</span>
                  {o.status !== '已完成可取餐' && o.status !== '已取消' && (
                    <button style={S.btnGreen} onClick={() => advanceStatus(o)}>→ {statusOrder[statusOrder.indexOf(o.status)+1]}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>商品管理</div>
            <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#FDF6ED', fontSize:13, fontWeight:700, color:'#5D3A1A' }}>
                    {['商品名稱','類別','定價','狀態','操作'].map(h => <th key={h} style={{ padding:'12px 16px', textAlign:'left' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderTop:'1px solid #F0E4D0', opacity: p.active ? 1 : 0.5 }}>
                      <td style={{ padding:'12px 16px', fontWeight:600 }}>
                        {editId===p.id
                          ? <input style={{ ...S.input, width:160 }} value={p.name} onChange={e => updateField(p.id,'name',e.target.value)} />
                          : <>{p.name} <TagBadge tag={p.tag} /></>}
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:13, color:'#8B6A40' }}>{p.categories?.name}</td>
                      <td style={{ padding:'12px 16px', fontWeight:700 }}>
                        {editId===p.id
                          ? <input style={{ ...S.input, width:80 }} type="number" value={p.price} onChange={e => updateField(p.id,'price',Number(e.target.value))} />
                          : `NT$${p.price}`}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background: p.active ? '#C6F6D5' : '#FED7D7', color: p.active ? '#276749' : '#C53030', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700 }}>
                          {p.active ? '上架中' : '已下架'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:8 }}>
                          {editId===p.id
                            ? <button style={S.btnGreen} onClick={() => saveProduct(p)}>儲存</button>
                            : <button style={S.btnOut} onClick={() => setEditId(p.id)}>編輯</button>}
                          <button style={p.active ? S.btnRed : S.btnGreen} onClick={() => toggleProduct(p.id, !p.active)}>
                            {p.active ? '下架' : '上架'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories */}
        {tab === 'categories' && (
          <div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>類別管理</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
              {categories.map(c => (
                <div key={c.id} style={{ background:'#fff', borderRadius:14, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:20, opacity: c.active ? 1 : 0.6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <span style={{ fontSize:30 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16 }}>{c.name}</div>
                      <div style={{ fontSize:12, color:'#8B6A40' }}>{products.filter(p=>p.category_id===c.id).length} 個品項</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <span style={{ flex:1, textAlign:'center', background: c.active ? '#C6F6D5' : '#FED7D7', color: c.active ? '#276749' : '#C53030', borderRadius:8, padding:'4px 0', fontSize:13, fontWeight:700 }}>
                      {c.active ? '啟用中' : '已停用'}
                    </span>
                    <button
                      style={c.active ? S.btnRed : S.btnGreen}
                      onClick={async () => { await supabase.from('categories').update({active:!c.active}).eq('id',c.id); fetchCategories().then(r=>setCategories(r.data||[])) }}>
                      {c.active ? '停用' : '啟用'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {tab === 'members' && <AdminMembers />}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const [isAdmin, setIsAdmin] = useState(false)
  const { loading } = useAuth()

  // Handle OAuth callback
  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      supabase.auth.getSession().then(() => { window.location.href = '/' })
    }
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#FDF6ED', fontFamily:'Noto Sans TC, sans-serif' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:48, marginBottom:12 }}>🧋</div><div style={{ fontWeight:700, color:'#5D3A1A' }}>載入中...</div></div>
    </div>
  )

  return isAdmin
    ? <AdminView onSwitchConsumer={() => setIsAdmin(false)} />
    : <ConsumerView onSwitchAdmin={() => setIsAdmin(true)} />
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>
}
