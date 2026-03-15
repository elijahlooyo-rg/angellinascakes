const cartItemsEl = document.getElementById("cart-items")
const cartEmptyEl = document.getElementById("cart-empty")
const cartTotalEl = document.getElementById("cart-total")
const clearCartBtn = document.getElementById("clear-cart")
const subtotalEl = document.getElementById("subtotal")
const shippingEl = document.getElementById("shipping")
const totalEl = document.getElementById("total")

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.warn("Failed to load cart", error)
    return {}
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.warn("Failed to save cart", error)
  }
}

function getCartItemCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function calculateSubtotal(cart) {
  return Object.values(cart).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
}

function renderCart() {
  const cart = loadCart()
  const items = Object.values(cart)

  const totalCount = getCartItemCount(cart)
  cartTotalEl.textContent = totalCount

  const subtotal = calculateSubtotal(cart)
  const shipping = subtotal > 0 ? 5 : 0 // Fixed shipping $5 if cart not empty
  const total = subtotal + shipping

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`
  shippingEl.textContent = `$${shipping.toFixed(2)}`
  totalEl.textContent = `$${total.toFixed(2)}`

  if (!items.length) {
    cartEmptyEl.style.display = "block"
    cartItemsEl.innerHTML = ""
    return
  }

  cartEmptyEl.style.display = "none"

  cartItemsEl.innerHTML = items
    .map((item) => {
      const qty = item.quantity || 0
      const price = item.price || 0
      const itemTotal = price * qty
      return `
        <article class="cart-item">
          <img class="cart-item__image" src="${item.image || ""}" alt="${item.name}" />
          <div class="cart-item__details">
            <h3>${item.name}</h3>
            <p>${item.description || ""}</p>
            <div class="cart-item__meta">
              <div class="quantity-controls">
                <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                <span class="qty-display">${qty}</span>
                <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
              </div>
              <span class="item-price">$${price.toFixed(2)} each</span>
              <span class="item-total">Total: $${itemTotal.toFixed(2)}</span>
              <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>
          </div>
        </article>
      `
    })
    .join("")
}

function updateQuantity(itemId, delta) {
  const cart = loadCart()
  const item = cart[itemId]
  if (!item) return

  item.quantity = Math.max(0, (item.quantity || 0) + delta)
  if (item.quantity === 0) {
    delete cart[itemId]
  }
  saveCart(cart)
  renderCart()
  updateCartCountDisplay(cart)
}

function removeItem(itemId) {
  const cart = loadCart()
  delete cart[itemId]
  saveCart(cart)
  renderCart()
  updateCartCountDisplay(cart)
}

function clearCart() {
  saveCart({})
  renderCart()
  updateCartCountDisplay({})
}

function handleCartAction(event) {
  const target = event.target
  const itemId = target.dataset.id

  if (target.classList.contains("qty-plus")) {
    updateQuantity(itemId, 1)
  } else if (target.classList.contains("qty-minus")) {
    updateQuantity(itemId, -1)
  } else if (target.classList.contains("remove-btn")) {
    removeItem(itemId)
  }
}

clearCartBtn?.addEventListener("click", clearCart)
cartItemsEl?.addEventListener("click", handleCartAction)

const checkoutBtn = document.getElementById("checkout")
checkoutBtn?.addEventListener("click", handleCheckout)

function handleCheckout() {
  const cart = loadCart()
  const items = Object.values(cart)
  
  if (!items.length) {
    alert("Your cart is empty!")
    return
  }
  
  const subtotal = calculateSubtotal(cart)
  const shipping = subtotal > 0 ? 5 : 0
  const total = subtotal + shipping
  
  let orderMessage = "New Order from Angellina Cakes Website\n\n"
  
  items.forEach(item => {
    const itemTotal = (item.price || 0) * (item.quantity || 0)
    orderMessage += `${item.name} - Quantity: ${item.quantity} - $${itemTotal.toFixed(2)}\n`
  })
  
  orderMessage += `\nSubtotal: $${subtotal.toFixed(2)}\nShipping: $${shipping.toFixed(2)}\nTotal: $${total.toFixed(2)}`
  
  const whatsappUrl = `https://wa.me/256757511917?text=${encodeURIComponent(orderMessage)}`
  
  window.open(whatsappUrl, '_blank')
}

renderCart()
