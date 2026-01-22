const CART_KEY = 'shoeculture_cart'

const getCart = () => {
  const raw = localStorage.getItem(CART_KEY)
  if (!raw) {
    return []
  }
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

const addToCart = (productId) => {
  const cart = getCart()
  const existing = cart.find((item) => item.productId === productId)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({ productId, quantity: 1 })
  }
  saveCart(cart)
}

const updateQuantity = (productId, quantity) => {
  const cart = getCart()
  const next = cart
    .map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    )
    .filter((item) => item.quantity > 0)
  saveCart(next)
  return next
}

const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.productId !== productId)
  saveCart(cart)
  return cart
}

const clearCart = () => {
  saveCart([])
}

export { addToCart, getCart, updateQuantity, removeFromCart, clearCart }
