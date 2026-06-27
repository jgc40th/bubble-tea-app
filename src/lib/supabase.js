// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: false,   // We handle code exchange manually in App.jsx
    persistSession: true,
    autoRefreshToken: true,
  }
})

// ── Auth helpers ──────────────────────────────────────────────

export async function signUpWithEmail(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  return { data, error }
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

// LINE OAuth — redirect to LINE then Supabase handles callback
export function signInWithLine() {
  return supabase.auth.signInWithOAuth({
    provider: 'custom:line',
    options: {
      redirectTo: `${window.location.origin}/?callback=1`,
      scopes: 'openid profile email',
    },
  })
}

// ── Profile ───────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// ── Products / Categories ─────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  return { data, error }
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, icon)')
    .eq('active', true)
  return { data, error }
}

// ── Coupons ───────────────────────────────────────────────────

export async function fetchMemberCoupons(userId) {
  const { data, error } = await supabase
    .from('member_coupons')
    .select('*, coupons(*)')
    .eq('user_id', userId)
    .eq('used', false)
  return { data, error }
}

export async function validateCoupon(code) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .gt('end_at', new Date().toISOString())
    .single()
  return { data, error }
}

// ── Orders ────────────────────────────────────────────────────

export async function createOrder(orderData) {
  const { items, ...order } = orderData

  const { data, error } = await supabase.rpc('create_order', {
    p_order_number:   order.order_number,
    p_user_id:        order.user_id || null,
    p_store_id:       order.store_id,
    p_payment_method: order.payment_method,
    p_subtotal:       order.subtotal,
    p_discount:       order.discount || 0,
    p_points_used:    order.points_used || 0,
    p_total:          order.total,
    p_coupon_id:      order.coupon_id || null,
    p_points_earned:  order.points_earned || 0,
    p_items:          items,
  })

  if (error) return { error }
  return { data: { id: data, order_number: order.order_number } }
}

export async function fetchMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, stores(name), order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// ── Points ────────────────────────────────────────────────────

export async function fetchPointLogs(userId) {
  const { data, error } = await supabase
    .from('point_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  return { data, error }
}

// ── Admin (uses service_role via API routes) ──────────────────

export async function adminFetchAllOrders(storeId) {
  let q = supabase
    .from('orders')
    .select('*, profiles(name, phone), stores(name), order_items(*)')
    .order('created_at', { ascending: false })
  if (storeId) q = q.eq('store_id', storeId)
  return q
}

export async function adminUpdateOrderStatus(orderId, status) {
  return supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
}

export async function adminFetchProducts() {
  return supabase
    .from('products')
    .select('*, categories(name)')
    .order('category_id')
}

export async function adminToggleProduct(id, active) {
  return supabase.from('products').update({ active }).eq('id', id)
}

export async function adminUpsertProduct(product) {
  if (product.id) {
    return supabase.from('products').update(product).eq('id', product.id).select().single()
  }
  return supabase.from('products').insert(product).select().single()
}

export async function adminFetchMembers() {
  return supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function adminGrantCoupon(userId, couponId) {
  // Use RPC to bypass RLS — admin operation
  const { data, error } = await supabase.rpc('admin_grant_coupon', {
    p_user_id: userId,
    p_coupon_id: Number(couponId),
  })
  return { data, error }
}

export async function adminGrantPoints(userId, points, reason) {
  // Use RPC to bypass RLS — admin operation
  const { data, error } = await supabase.rpc('admin_grant_points', {
    p_user_id: userId,
    p_points: Number(points),
    p_reason: reason,
  })
  return { data, error }
}

// ── Point Rules ───────────────────────────────────────────────

export async function fetchPointRules() {
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .eq('active', true)
  return { data, error }
}

export async function adminUpdatePointRule(ruleType, fields) {
  const { data, error } = await supabase.rpc('admin_update_point_rule', {
    p_rule_type:             ruleType,
    p_spend_amount:          fields.spend_amount,
    p_earn_points:           fields.earn_points,
    p_redeem_points:         fields.redeem_points,
    p_redeem_amount:         fields.redeem_amount,
    p_min_order_for_redeem:  fields.min_order_for_redeem,
    p_max_redeem_percent:    fields.max_redeem_percent,
  })
  return { data, error }
}

// 計算可獲得點數
export function calcEarnPoints(total, earnRule) {
  if (!earnRule) return 0
  return Math.floor(total / earnRule.spend_amount) * earnRule.earn_points
}

// 計算最多可折抵金額
export function calcMaxRedeem(subtotal, pointBalance, redeemRule) {
  if (!redeemRule || pointBalance <= 0) return { maxPoints: 0, maxAmount: 0 }
  if (subtotal < redeemRule.min_order_for_redeem) return { maxPoints: 0, maxAmount: 0 }
  const maxByPercent = Math.floor(subtotal * redeemRule.max_redeem_percent / 100)
  const maxByPoints  = Math.floor(pointBalance / redeemRule.redeem_points) * redeemRule.redeem_amount
  const maxAmount    = Math.min(maxByPercent, maxByPoints, subtotal)
  const maxPoints    = Math.ceil(maxAmount / redeemRule.redeem_amount) * redeemRule.redeem_points
  return { maxPoints, maxAmount }
}
