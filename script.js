const navLinks = document.getElementById("nav-list")
const menu = document.getElementById("humbger")

// Cart state + DOM
const CART_KEY = "angellina_cart"
const cartCountEl = document.querySelector(".cart-count")
const cardsContainer = document.querySelector(".cards")

function safeUpdateCartCount(cart) {
  if (!cartCountEl) return
  updateCartCountDisplay(cart)
}

menu?.addEventListener("click", mobileMenu)

function mobileMenu() {
  navLinks.classList.toggle("active")
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    console.warn("Failed to load cart from storage", error)
    return {}
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.warn("Failed to save cart to storage", error)
  }
}

function getCartItemCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0)
}

function updateCartCountDisplay(cart) {
  const count = getCartItemCount(cart)
  cartCountEl.textContent = count
}

function addProductToCart(details) {
  const cart = loadCart()
  const key = details.id || details.name
  const existing = cart[key] || { ...details, quantity: 0 }

  existing.quantity = (existing.quantity || 0) + 1
  cart[key] = existing

  saveCart(cart)
  updateCartCountDisplay(cart)
}

function resolveProductFromCard(card) {
  const nameEl = card.querySelector("h3")
  const name = nameEl ? nameEl.textContent.trim() : "Product"
  const descriptionEl = card.querySelector("p")
  const description = descriptionEl ? descriptionEl.textContent.trim() : ""
  const imageEl = card.querySelector("img")
  const image = imageEl ? imageEl.src : ""

  // Assume a fixed price for each cake (can be customized per product later)
  const price = 25 // $25 per cake

  return { id: name, name, description, image, price }
}

function addToCart(eventOrDetails) {
  // Support: inline onclick="addToCart()" calls or event listener calls.
  const arg = eventOrDetails || window.event

  // If called with a click event, resolve the button & card
  if (arg && typeof arg === "object" && typeof arg.preventDefault === "function") {
    const button = arg.target.closest(".order")
    const card = button ? button.closest(".card") : null
    if (!card) return
    addProductToCart(resolveProductFromCard(card))
    return
  }

  // If called with an HTMLElement (e.g. button)
  if (arg instanceof HTMLElement) {
    const card = arg.closest(".card")
    if (!card) return
    addProductToCart(resolveProductFromCard(card))
    return
  }

  // If called with details object
  if (arg && typeof arg === "object" && arg.name) {
    addProductToCart(arg)
  }
}

function handleOrderClick(event) {
  addToCart(event)
}

// Initialize
const currentCart = loadCart()
safeUpdateCartCount(currentCart)

if (cardsContainer) {
  cardsContainer.addEventListener("click", handleOrderClick)
}
