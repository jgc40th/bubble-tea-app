// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      redirectTo: `${window.location.origin}/`,
      scopes: 'profile openid email',
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

  // Insert order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  if (orderError) return { error: orderError }

  // Insert items
  const itemRows = items.map(item => ({
    order_id: newOrder.id,
    product_id: item.productId,
    product_name: item.name,
    unit_price: item.unitPrice,
    qty: item.qty,
    size: item.size,
    sweetness: item.sweetness,
    ice: item.ice,
    toppings: item.toppings || [],
    subtotal: item.unitPrice * item.qty,
  }))
  const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
  if (itemsError) return { error: itemsError }

  return { data: newOrder }
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
  return supabase.from('member_coupons').upsert({ user_id: userId, coupon_id: couponId })
}

export async function adminGrantPoints(userId, points, reason) {
  // Get current balance
  const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single()
  const newBalance = (profile?.points || 0) + points
  await supabase.from('profiles').update({ points: newBalance }).eq('id', userId)
  await supabase.from('point_logs').insert({
    user_id: userId,
    change: points,
    reason,
    balance_after: newBalance,
  })
}
