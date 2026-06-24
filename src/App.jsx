import { useState, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const STORES = [
  { id: 1, name: "信義旗艦店", address: "台北市信義區松壽路12號", lat: 25.0339, lng: 121.5645, hours: "10:00-22:00" },
  { id: 2, name: "西門町店", address: "台北市萬華區西門町8號", lat: 25.0422, lng: 121.5081, hours: "10:00-23:00" },
  { id: 3, name: "中山北路店", address: "台北市中山區中山北路二段33號", lat: 25.0569, lng: 121.5237, hours: "10:00-21:30" },
];

const INITIAL_CATEGORIES = [
  { id: 1, name: "招牌特調", icon: "⭐", active: true },
  { id: 2, name: "珍珠奶茶", icon: "🧋", active: true },
  { id: 3, name: "純茶系列", icon: "🍵", active: true },
  { id: 4, name: "水果茶", icon: "🍑", active: true },
  { id: 5, name: "鮮奶系列", icon: "🥛", active: true },
  { id: 6, name: "冰沙特飲", icon: "🧊", active: true },
];

const INITIAL_PRODUCTS = [
  // 招牌特調
  { id: 101, categoryId: 1, name: "百香雙響炮", desc: "酸甜百香果搭配茉莉綠茶，加入Q彈珍珠與高纖椰果", price: 75, active: true, tag: "熱銷" },
  { id: 102, categoryId: 1, name: "奶茶三兄弟", desc: "香濃奶茶搭配布丁、珍珠及仙草，一次就有3種口感", price: 85, active: true, tag: "人氣" },
  { id: 103, categoryId: 1, name: "21歲輕檸烏龍", desc: "現切新鮮檸檬搭配輕焙烏龍，清新酸甜解膩必喝", price: 75, active: true, tag: "新品" },
  { id: 104, categoryId: 1, name: "星空葡萄", desc: "巨峰葡萄果肉搭配波波晶球，芝士奶蓋覆頂，絕美漸層", price: 90, active: true, tag: "限定" },

  // 珍珠奶茶
  { id: 201, categoryId: 2, name: "珍珠奶茶", desc: "Q彈珍珠搭配比例恰到好處的經典奶茶", price: 65, active: true, tag: "" },
  { id: 202, categoryId: 2, name: "珍珠鮮奶茶", desc: "Q彈珍珠搭配新鮮牛奶與茶底，口感更為濃郁", price: 75, active: true, tag: "" },
  { id: 203, categoryId: 2, name: "四季珍椰青", desc: "特選台灣四季春茶，搭配高纖椰果及Q彈珍珠", price: 70, active: true, tag: "" },
  { id: 204, categoryId: 2, name: "芋頭珍奶", desc: "大甲芋頭熬煮，搭配Q彈珍珠與香醇奶茶", price: 80, active: true, tag: "季節" },

  // 純茶系列
  { id: 301, categoryId: 3, name: "四季春青茶", desc: "嚴選台灣四季春茶葉，清香回甘", price: 45, active: true, tag: "" },
  { id: 302, categoryId: 3, name: "茉莉綠茶", desc: "精選茉莉花茶，清淡芬芳，入口清爽", price: 45, active: true, tag: "" },
  { id: 303, categoryId: 3, name: "阿薩姆紅茶", desc: "嚴選阿薩姆紅茶，茶味醇厚，回甘持久", price: 45, active: true, tag: "" },
  { id: 304, categoryId: 3, name: "綠茶養樂多", desc: "清新綠茶搭配養樂多，酸甜爽口是老顧客私藏款", price: 55, active: true, tag: "" },

  // 水果茶
  { id: 401, categoryId: 4, name: "葡萄柚果粒茶", desc: "新鮮葡萄柚果粒搭配茶底，酸甜清爽，層次豐富", price: 75, active: true, tag: "人氣" },
  { id: 402, categoryId: 4, name: "莓果派對烏龍茶", desc: "多種莓果搭配清香烏龍茶底，色彩繽紛滿滿維他命", price: 80, active: true, tag: "" },
  { id: 403, categoryId: 4, name: "蜂蜜檸檬", desc: "新鮮現切檸檬配上天然蜂蜜，酸甜平衡超清爽", price: 65, active: true, tag: "" },
  { id: 404, categoryId: 4, name: "百香果綠茶", desc: "熱帶百香果香氣融入清爽綠茶，夏日首選", price: 65, active: true, tag: "" },

  // 鮮奶系列
  { id: 501, categoryId: 5, name: "伯爵鮮奶茶", desc: "帶有柑橘香氣的英式伯爵茶，融合香草風味配上濃厚奶蓋", price: 80, active: true, tag: "" },
  { id: 502, categoryId: 5, name: "芋頭西谷米牛奶", desc: "現煮西谷米搭配大甲芋頭與鮮奶，口感綿密香甜", price: 85, active: true, tag: "季節" },
  { id: 503, categoryId: 5, name: "綠豆沙牛奶", desc: "真材實料綠豆冰沙搭配鮮奶，消暑經典不過時", price: 75, active: true, tag: "" },
  { id: 504, categoryId: 5, name: "日式焙奶茶", desc: "鹿兒島茶葉慢火深烘，茶香濃郁搭配香醇奶茶", price: 85, active: true, tag: "冬季" },

  // 冰沙特飲
  { id: 601, categoryId: 6, name: "芒果冰沙", desc: "選用愛文芒果製成綿密冰沙，果香濃郁夏日必喝", price: 80, active: true, tag: "季節" },
  { id: 602, categoryId: 6, name: "草莓奶昔", desc: "鮮甜草莓與鮮奶打製，濃郁細緻入口即化", price: 85, active: true, tag: "" },
  { id: 603, categoryId: 6, name: "抹茶紅豆冰沙", desc: "濃郁抹茶冰沙搭配蜜紅豆，和風甜點飲品", price: 85, active: true, tag: "" },
];

const COUPONS = [
  { code: "WELCOME10", discount: 10, type: "percent", desc: "新會員9折優惠" },
  { code: "SUMMER50", discount: 50, type: "fixed", desc: "夏日優惠折抵50元" },
];

const SWEETNESS = ["無糖", "微糖", "半糖", "七分糖", "全糖"];
const ICE = ["去冰", "少冰", "正常冰", "多冰"];
const SIZES = [
  { label: "中杯 M", extra: 0 },
  { label: "大杯 L", extra: 10 },
];
const TOPPINGS = [
  { id: "pearl", name: "珍珠", price: 10 },
  { id: "coconut", name: "椰果", price: 10 },
  { id: "pudding", name: "布丁", price: 15 },
  { id: "grass", name: "仙草凍", price: 10 },
  { id: "redbean", name: "蜜紅豆", price: 15 },
  { id: "tarocircle", name: "芋圓", price: 15 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function genOrderNum() {
  return "A" + String(Math.floor(Math.random() * 900 + 100));
}
function calcTotal(items, coupon) {
  const sub = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  if (!coupon) return sub;
  if (coupon.type === "percent") return Math.round(sub * (1 - coupon.discount / 100));
  return Math.max(0, sub - coupon.discount);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  // Warm amber/cream palette inspired by tea
  page: { minHeight: "100vh", background: "#FDF6ED", fontFamily: "'Noto Sans TC', sans-serif", color: "#2D1B0E" },
  headerBar: { background: "#2D1B0E", color: "#F5E6C8", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(45,27,14,0.3)" },
  logo: { fontSize: 22, fontWeight: 900, letterSpacing: 2, color: "#F5A623" },
  btn: { background: "#F5A623", color: "#2D1B0E", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14, transition: "all .2s" },
  btnOutline: { background: "transparent", color: "#F5A623", border: "2px solid #F5A623", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  btnDanger: { background: "#E53E3E", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  btnGreen: { background: "#38A169", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(45,27,14,0.08)", overflow: "hidden" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E8D5B7", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FDFAF5" },
  tag: { display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  sectionTitle: { fontSize: 18, fontWeight: 800, color: "#2D1B0E", marginBottom: 16 },
  pill: (active) => ({ padding: "8px 18px", borderRadius: 30, border: "2px solid " + (active ? "#F5A623" : "#E8D5B7"), background: active ? "#F5A623" : "#fff", color: active ? "#2D1B0E" : "#8B6A40", fontWeight: 700, cursor: "pointer", fontSize: 13, transition: "all .2s", whiteSpace: "nowrap" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modalBox: { background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 24 },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function TagBadge({ tag }) {
  if (!tag) return null;
  const colors = { "熱銷": ["#FFF3CD", "#B7791F"], "人氣": ["#FED7D7", "#C53030"], "新品": ["#C6F6D5", "#276749"], "限定": ["#E9D8FD", "#6B46C1"], "季節": ["#BEE3F8", "#2B6CB0"], "冬季": ["#EBF8FF", "#2C5282"] };
  const [bg, text] = colors[tag] || ["#EDF2F7", "#4A5568"];
  return <span style={{ ...S.tag, background: bg, color: text }}>{tag}</span>;
}

function ProductCard({ product, onAdd }) {
  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(245,166,35,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ background: "linear-gradient(135deg, #FDF0DC 0%, #FAE0B0 100%)", height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
        🧋
        <div style={{ position: "absolute", top: 8, right: 8 }}><TagBadge tag={product.tag} /></div>
      </div>
      <div style={{ padding: "14px 14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#2D1B0E" }}>{product.name}</div>
        <div style={{ fontSize: 12, color: "#8B6A40", lineHeight: 1.5, flex: 1 }}>{product.desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#C05621" }}>NT${product.price}</span>
          <button style={{ ...S.btn, padding: "6px 16px", fontSize: 13, borderRadius: 20 }} onClick={() => onAdd(product)}>加入 +</button>
        </div>
      </div>
    </div>
  );
}

function AddToCartModal({ product, onClose, onConfirm }) {
  const [size, setSize] = useState(0);
  const [sweetness, setSweetness] = useState("半糖");
  const [ice, setIce] = useState("正常冰");
  const [toppings, setToppings] = useState([]);
  const [qty, setQty] = useState(1);

  const toggleTopping = (t) => setToppings(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]);
  const toppingTotal = toppings.reduce((s, tid) => s + (TOPPINGS.find(t => t.id === tid)?.price || 0), 0);
  const unitPrice = product.price + SIZES[size].extra + toppingTotal;

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{product.name}</div>
            <div style={{ fontSize: 13, color: "#8B6A40", marginTop: 2 }}>{product.desc}</div>
          </div>
          <button onClick={onClose} style={{ background: "#EDF2F7", border: "none", borderRadius: 50, width: 32, height: 32, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {/* Size */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#5D3A1A" }}>🥤 杯型</div>
          <div style={{ display: "flex", gap: 8 }}>
            {SIZES.map((s, i) => (
              <button key={i} style={S.pill(size === i)} onClick={() => setSize(i)}>
                {s.label}{s.extra > 0 ? ` +${s.extra}` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Sweetness */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#5D3A1A" }}>🍯 甜度</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SWEETNESS.map(s => <button key={s} style={S.pill(sweetness === s)} onClick={() => setSweetness(s)}>{s}</button>)}
          </div>
        </div>

        {/* Ice */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#5D3A1A" }}>❄️ 冰塊</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ICE.map(s => <button key={s} style={S.pill(ice === s)} onClick={() => setIce(s)}>{s}</button>)}
          </div>
        </div>

        {/* Toppings */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#5D3A1A" }}>✨ 加料（可多選）</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPPINGS.map(t => (
              <button key={t.id} style={S.pill(toppings.includes(t.id))} onClick={() => toggleTopping(t)}>
                {t.name} +{t.price}
              </button>
            ))}
          </div>
        </div>

        {/* Qty + confirm */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid #F0E4D0", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 50, border: "2px solid #E8D5B7", background: "#fff", fontSize: 18, cursor: "pointer" }}>-</button>
            <span style={{ fontWeight: 800, fontSize: 18 }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 50, border: "2px solid #F5A623", background: "#F5A623", fontSize: 18, cursor: "pointer" }}>+</button>
          </div>
          <button style={{ ...S.btn, fontSize: 15, padding: "12px 28px" }}
            onClick={() => onConfirm({ ...product, size: SIZES[size].label, sweetness, ice, toppings: toppings.map(tid => TOPPINGS.find(t => t.id === tid)?.name), unitPrice, qty })}>
            加入購物車 NT${unitPrice * qty}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPanel({ cart, onRemove, onCheckout, onClose }) {
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [payment, setPayment] = useState("現金");

  const applyCoupon = () => {
    const c = COUPONS.find(c => c.code === couponCode.toUpperCase());
    if (c) { setCoupon(c); setCouponMsg("✅ " + c.desc); }
    else { setCoupon(null); setCouponMsg("❌ 無效優惠券"); }
  };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total = calcTotal(cart, coupon);

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>🛒 購物車</div>
          <button onClick={onClose} style={{ background: "#EDF2F7", border: "none", borderRadius: 50, width: 32, height: 32, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8B6A40" }}>購物車是空的，快去點飲料吧 🧋</div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #F0E4D0" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.name} × {item.qty}</div>
                  <div style={{ fontSize: 12, color: "#8B6A40", marginTop: 2 }}>{item.size} ｜ {item.sweetness} ｜ {item.ice}{item.toppings?.length > 0 ? " ｜ 加料: " + item.toppings.join(", ") : ""}</div>
                </div>
                <div style={{ fontWeight: 800, color: "#C05621" }}>NT${item.unitPrice * item.qty}</div>
                <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#A0AEC0", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}

            {/* Coupon */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="輸入優惠券代碼" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
              <button style={{ ...S.btnOutline }} onClick={applyCoupon}>套用</button>
            </div>
            {couponMsg && <div style={{ fontSize: 12, marginTop: 6, color: coupon ? "#276749" : "#C53030" }}>{couponMsg}</div>}

            {/* Payment */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>💳 付款方式</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["現金", "Line Pay", "信用卡"].map(p => (
                  <button key={p} style={S.pill(payment === p)} onClick={() => setPayment(p)}>{p}</button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginTop: 20, background: "#FDF6ED", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                <span>小計</span><span>NT${subtotal}</span>
              </div>
              {coupon && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: "#276749" }}>
                <span>優惠折抵</span><span>-NT${subtotal - total}</span>
              </div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, marginTop: 8, paddingTop: 8, borderTop: "1.5px solid #E8D5B7" }}>
                <span>總計</span><span style={{ color: "#C05621" }}>NT${total}</span>
              </div>
            </div>

            <button style={{ ...S.btn, width: "100%", marginTop: 16, padding: "14px", fontSize: 16 }}
              onClick={() => onCheckout(payment, coupon, total)}>
              確認結帳 →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OrderSuccessModal({ order, onClose }) {
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontWeight: 900, fontSize: 28, color: "#C05621" }}>訂單成立！</div>
        <div style={{ fontSize: 16, color: "#5D3A1A", marginTop: 8 }}>您的取餐號碼</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#2D1B0E", letterSpacing: 4, margin: "16px 0" }}>{order.num}</div>
        <div style={{ background: "#FDF0DC", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "left" }}>
          <div style={{ fontSize: 13, color: "#5D3A1A" }}>📍 {order.store} ｜ 💳 {order.payment}</div>
          <div style={{ fontSize: 13, color: "#5D3A1A", marginTop: 4 }}>💰 NT${order.total} ｜ 📦 {order.items.length} 項商品</div>
          <div style={{ fontSize: 12, color: "#8B6A40", marginTop: 8 }}>訂單狀態更新將透過通知告知，請稍候。</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#F5A623" }}></div>
          <div style={{ fontSize: 12, color: "#C05621", fontWeight: 700 }}>待接單</div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#E8D5B7" }}></div>
          <div style={{ fontSize: 12, color: "#A0AEC0" }}>製作中</div>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#E8D5B7" }}></div>
          <div style={{ fontSize: 12, color: "#A0AEC0" }}>可取餐</div>
        </div>
        <button style={{ ...S.btn, padding: "12px 40px", fontSize: 15 }} onClick={onClose}>返回菜單</button>
      </div>
    </div>
  );
}

// ─── CONSUMER VIEW ───────────────────────────────────────────────────────────
function ConsumerView({ products, categories, onSwitchAdmin }) {
  const [selCategory, setSelCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState([]);
  const [successOrder, setSuccessOrder] = useState(null);
  const [selStore, setSelStore] = useState(STORES[0]);
  const [view, setView] = useState("menu"); // menu | orders

  const activeCategories = categories.filter(c => c.active);
  const visibleProducts = products
    .filter(p => p.active)
    .filter(p => !selCategory || p.categoryId === selCategory)
    .filter(p => !search || p.name.includes(search) || p.desc.includes(search));

  const addToCart = (item) => setCart(prev => [...prev, item]);
  const removeFromCart = (i) => setCart(prev => prev.filter((_, idx) => idx !== i));

  const checkout = (payment, coupon, total) => {
    const order = { num: genOrderNum(), store: selStore.name, payment, total, items: cart, status: "待接單", time: new Date().toLocaleTimeString("zh-TW") };
    setOrders(prev => [order, ...prev]);
    setCart([]);
    setShowCart(false);
    setSuccessOrder(order);
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.headerBar}>
        <span style={S.logo}>🧋 可可茶飲</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ ...S.btnOutline, position: "relative" }} onClick={() => setShowCart(true)}>
            🛒 購物車 {cart.length > 0 && <span style={{ background: "#E53E3E", color: "#fff", borderRadius: 50, padding: "2px 6px", fontSize: 11, marginLeft: 4 }}>{cart.reduce((s, i) => s + i.qty, 0)}</span>}
          </button>
          <button style={S.btnOutline} onClick={() => setView(v => v === "menu" ? "orders" : "menu")}>
            {view === "menu" ? "我的訂單" : "菜單"}
          </button>
          <button style={{ ...S.btn, fontSize: 12, padding: "6px 12px" }} onClick={onSwitchAdmin}>門市後台</button>
        </div>
      </div>

      {view === "menu" ? (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
          {/* Store selector */}
          <div style={{ background: "#FFF9F0", border: "1.5px solid #F5A623", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#5D3A1A" }}>📍 取餐門市</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STORES.map(s => (
                <button key={s.id} style={S.pill(selStore.id === s.id)} onClick={() => setSelStore(s)}>{s.name}</button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#8B6A40", marginLeft: "auto" }}>🕐 {selStore.hours}</span>
          </div>

          {/* Search */}
          <input style={{ ...S.input, marginBottom: 20, fontSize: 15 }} placeholder="🔍 搜尋飲品..." value={search} onChange={e => setSearch(e.target.value)} />

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
            <button style={S.pill(!selCategory)} onClick={() => setSelCategory(null)}>全部</button>
            {activeCategories.map(c => (
              <button key={c.id} style={S.pill(selCategory === c.id)} onClick={() => setSelCategory(c.id)}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {activeCategories
            .filter(c => !selCategory || c.id === selCategory)
            .map(cat => {
              const ps = visibleProducts.filter(p => p.categoryId === cat.id);
              if (!ps.length) return null;
              return (
                <div key={cat.id} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{cat.icon}</span>
                    <span style={{ ...S.sectionTitle, marginBottom: 0 }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: "#8B6A40", background: "#FDF0DC", borderRadius: 20, padding: "2px 10px" }}>{ps.length} 款</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {ps.map(p => <ProductCard key={p.id} product={p} onAdd={setAddModal} />)}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
          <div style={S.sectionTitle}>📋 我的訂單</div>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8B6A40" }}>還沒有訂單，去點飲料吧！</div>
          ) : orders.map((o, i) => (
            <div key={i} style={{ ...S.card, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 24, color: "#C05621" }}>{o.num}</div>
                  <div style={{ fontSize: 13, color: "#5D3A1A" }}>{o.store} ｜ {o.time}</div>
                </div>
                <span style={{ background: o.status === "可取餐" ? "#C6F6D5" : o.status === "製作中" ? "#FEEBC8" : "#EDF2F7", color: o.status === "可取餐" ? "#276749" : o.status === "製作中" ? "#B7791F" : "#4A5568", borderRadius: 20, padding: "4px 14px", fontWeight: 700, fontSize: 13 }}>{o.status}</span>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0E4D0" }}>
                {o.items.map((item, j) => <div key={j} style={{ fontSize: 13, color: "#5D3A1A", marginBottom: 2 }}>• {item.name} × {item.qty} ({item.sweetness}/{item.ice})</div>)}
                <div style={{ fontWeight: 800, color: "#C05621", marginTop: 8 }}>NT${o.total}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addModal && <AddToCartModal product={addModal} onClose={() => setAddModal(null)} onConfirm={item => { addToCart(item); setAddModal(null); }} />}
      {showCart && <CartPanel cart={cart} onRemove={removeFromCart} onCheckout={checkout} onClose={() => setShowCart(false)} />}
      {successOrder && <OrderSuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />}
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ products, setProducts, categories, setCategories, onSwitchConsumer }) {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([
    { num: "A201", store: "信義旗艦店", time: "14:32", items: [{ name: "珍珠奶茶", qty: 2 }, { name: "百香雙響炮", qty: 1 }], total: 205, status: "待接單", payment: "Line Pay" },
    { num: "A188", store: "西門町店", time: "14:18", items: [{ name: "奶茶三兄弟", qty: 1 }, { name: "芒果冰沙", qty: 2 }], total: 245, status: "製作中", payment: "現金" },
    { num: "A175", store: "信義旗艦店", time: "14:05", items: [{ name: "四季春青茶", qty: 3 }], total: 135, status: "可取餐", payment: "信用卡" },
  ]);
  const [editProduct, setEditProduct] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [newProductModal, setNewProductModal] = useState(false);
  const [newCatModal, setNewCatModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", categoryId: categories[0]?.id, price: "", desc: "", tag: "", active: true });
  const [newCat, setNewCat] = useState({ name: "", icon: "🧋", active: true });

  const statusOrder = ["待接單", "製作中", "可取餐"];
  const statusColor = { "待接單": ["#EDF2F7", "#4A5568"], "製作中": ["#FEEBC8", "#B7791F"], "可取餐": ["#C6F6D5", "#276749"] };
  const advanceStatus = (i) => setOrders(prev => prev.map((o, idx) => idx !== i ? o : { ...o, status: statusOrder[Math.min(statusOrder.indexOf(o.status) + 1, 2)] }));

  const toggleProductActive = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const toggleCatActive = (id) => setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const saveProduct = () => {
    if (!newProd.name || !newProd.price) return;
    setProducts(prev => [...prev, { ...newProd, id: Date.now(), price: Number(newProd.price) }]);
    setNewProductModal(false);
    setNewProd({ name: "", categoryId: categories[0]?.id, price: "", desc: "", tag: "", active: true });
  };
  const saveCat = () => {
    if (!newCat.name) return;
    setCategories(prev => [...prev, { ...newCat, id: Date.now() }]);
    setNewCatModal(false);
    setNewCat({ name: "", icon: "🧋", active: true });
  };
  const updateProduct = (id, field, val) => setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const tabs = [
    { id: "orders", label: "📋 訂單管理" },
    { id: "products", label: "🧋 商品管理" },
    { id: "categories", label: "📁 類別管理" },
  ];

  return (
    <div style={{ ...S.page, background: "#F7F4F0" }}>
      <div style={{ ...S.headerBar, background: "#2D1B0E" }}>
        <span style={S.logo}>⚙️ 門市後台</span>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 13, background: "#4A3728", color: "#F5E6C8" }}>
            {STORES.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
          <button style={S.btn} onClick={onSwitchConsumer}>前台點餐</button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#E8DDD0", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: tab === t.id ? "#fff" : "transparent", color: tab === t.id ? "#2D1B0E" : "#8B6A40", boxShadow: tab === t.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all .2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === "orders" && (
          <div>
            <div style={S.sectionTitle}>訂單管理</div>
            {orders.map((o, i) => (
              <div key={i} style={{ ...S.card, padding: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: "#C05621", minWidth: 64 }}>{o.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{o.store} ｜ {o.time} ｜ {o.payment}</div>
                  <div style={{ fontSize: 13, color: "#5D3A1A", marginTop: 4 }}>{o.items.map(it => `${it.name}×${it.qty}`).join("、")}</div>
                  <div style={{ fontWeight: 800, color: "#C05621", marginTop: 4 }}>NT${o.total}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ background: statusColor[o.status][0], color: statusColor[o.status][1], borderRadius: 20, padding: "4px 16px", fontWeight: 700, fontSize: 13 }}>{o.status}</span>
                  {o.status !== "可取餐" && (
                    <button style={S.btnGreen} onClick={() => advanceStatus(i)}>
                      → {statusOrder[statusOrder.indexOf(o.status) + 1]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products tab */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={S.sectionTitle}>商品管理</div>
              <button style={S.btn} onClick={() => setNewProductModal(true)}>+ 新增商品</button>
            </div>
            <div style={{ ...S.card, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FDF6ED", fontWeight: 700, fontSize: 13, color: "#5D3A1A" }}>
                    {["商品名稱", "類別", "定價", "狀態", "操作"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #F0E4D0", opacity: p.active ? 1 : 0.5 }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        {editProduct === p.id
                          ? <input style={{ ...S.input, width: 160 }} value={p.name} onChange={e => updateProduct(p.id, "name", e.target.value)} />
                          : <><span>{p.name}</span>{p.tag && <TagBadge tag={p.tag} />}</>}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#8B6A40" }}>
                        {categories.find(c => c.id === p.categoryId)?.name}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                        {editProduct === p.id
                          ? <input style={{ ...S.input, width: 80 }} value={p.price} onChange={e => updateProduct(p.id, "price", Number(e.target.value))} type="number" />
                          : `NT$${p.price}`}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: p.active ? "#C6F6D5" : "#FED7D7", color: p.active ? "#276749" : "#C53030", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                          {p.active ? "上架中" : "已下架"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {editProduct === p.id
                            ? <button style={S.btnGreen} onClick={() => setEditProduct(null)}>儲存</button>
                            : <button style={S.btnOutline} onClick={() => setEditProduct(p.id)}>編輯</button>}
                          <button style={p.active ? S.btnDanger : S.btnGreen} onClick={() => toggleProductActive(p.id)}>
                            {p.active ? "下架" : "上架"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* New product modal */}
            {newProductModal && (
              <div style={S.modal} onClick={e => e.target === e.currentTarget && setNewProductModal(false)}>
                <div style={S.modalBox}>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>新增商品</div>
                  {[["商品名稱", "name", "text"], ["價格", "price", "number"], ["描述", "desc", "text"], ["標籤", "tag", "text"]].map(([label, field, type]) => (
                    <div key={field} style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</div>
                      <input style={S.input} type={type} value={newProd[field]} onChange={e => setNewProd(p => ({ ...p, [field]: e.target.value }))} placeholder={label} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>類別</div>
                    <select style={{ ...S.input }} value={newProd.categoryId} onChange={e => setNewProd(p => ({ ...p, categoryId: Number(e.target.value) }))}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={S.btn} onClick={saveProduct}>儲存商品</button>
                    <button style={S.btnOutline} onClick={() => setNewProductModal(false)}>取消</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories tab */}
        {tab === "categories" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={S.sectionTitle}>類別管理</div>
              <button style={S.btn} onClick={() => setNewCatModal(true)}>+ 新增類別</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {categories.map(c => (
                <div key={c.id} style={{ ...S.card, padding: 20, opacity: c.active ? 1 : 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#8B6A40" }}>{products.filter(p => p.categoryId === c.id).length} 個品項</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ flex: 1, textAlign: "center", background: c.active ? "#C6F6D5" : "#FED7D7", color: c.active ? "#276749" : "#C53030", borderRadius: 8, padding: "4px 0", fontSize: 13, fontWeight: 700 }}>
                      {c.active ? "啟用中" : "已停用"}
                    </span>
                    <button style={c.active ? S.btnDanger : S.btnGreen} onClick={() => toggleCatActive(c.id)}>
                      {c.active ? "停用" : "啟用"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {newCatModal && (
              <div style={S.modal} onClick={e => e.target === e.currentTarget && setNewCatModal(false)}>
                <div style={S.modalBox}>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>新增類別</div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>類別名稱</div>
                    <input style={S.input} value={newCat.name} onChange={e => setNewCat(c => ({ ...c, name: e.target.value }))} placeholder="例：季節限定" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>圖示 (Emoji)</div>
                    <input style={S.input} value={newCat.icon} onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))} placeholder="🧋" />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={S.btn} onClick={saveCat}>儲存類別</button>
                    <button style={S.btnOutline} onClick={() => setNewCatModal(false)}>取消</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  return isAdmin
    ? <AdminView products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} onSwitchConsumer={() => setIsAdmin(false)} />
    : <ConsumerView products={products} categories={categories} onSwitchAdmin={() => setIsAdmin(true)} />;
}
