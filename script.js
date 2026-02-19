const defaultConfig = {
  company_name: 'ADEGA IRMÃOS JG',
  slogan: 'Qualidade e variedade em bebidas',
  phone: '(00) 00000-0000',
  address: 'Seu endereço aqui',
  hero_title: 'As melhores bebidas da região',
  hero_subtitle: 'Entrega rápida e preços imbatíveis para você e sua família',
  primary_color: '#D4AF37',
  secondary_color: '#1a0a0a',
  text_color: '#fef3c7',
  accent_color: '#92400e',
  button_color: '#f59e0b',
  font_family: 'Montserrat',
  font_size: 16,
}

const products = [
  {
    id: 1,
    name: 'Cerveja Pilsen',
    category: 'cerveja',
    price: 'R$ 4,99',
    image: 'imagens/cerveja-pilsen.jpg',
  },
  {
    id: 2,
    name: 'Cerveja IPA',
    category: 'cerveja',
    price: 'R$ 12,99',
    image: 'imagens/cerveja-ipa.jpg',
  },
  {
    id: 3,
    name: 'Cerveja Weiss',
    category: 'cerveja',
    price: 'R$ 9,99',
    image: 'imagens/cerveja-weiss.jpg',
  },
  {
    id: 4,
    name: 'Whisky 12 anos',
    category: 'destilado',
    price: 'R$ 129,90',
    image: 'imagens/whisky.jpg',
  },
  {
    id: 5,
    name: 'Vodka Premium',
    category: 'destilado',
    price: 'R$ 69,90',
    image: 'imagens/vodka.jpg',
  },
  {
    id: 6,
    name: 'Cachaça Artesanal',
    category: 'destilado',
    price: 'R$ 24,90',
    image: 'imagens/cachaca.jpg',
  },
  {
    id: 7,
    name: 'Coca-Cola 2L',
    category: 'refrigerante',
    price: 'R$ 9,99',
    image: 'imagens/coca-cola.jpg',
  },
  {
    id: 8,
    name: 'Guaraná 2L',
    category: 'refrigerante',
    price: 'R$ 7,99',
    image: 'imagens/guarana.jpg',
  },
  {
    id: 9,
    name: 'Água Mineral',
    category: 'refrigerante',
    price: 'R$ 2,99',
    image: 'imagens/agua-mineral.jpg',
  },
]

let currentCategory = 'all'
let cartItems = []

// Funções do Carrinho
function updateCartUI() {
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  document.getElementById('cart-count').textContent = count

  const cartItemsDiv = document.getElementById('cart-items')
  if (cartItems.length === 0) {
    cartItemsDiv.innerHTML =
      '<p class="text-amber-200/60 text-center py-12">Carrinho vazio</p>'
  } else {
    cartItemsDiv.innerHTML = cartItems
      .map(
        (item, index) => `
      <div class="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="text-amber-100 font-semibold">${item.name}</h4>
            <p class="text-amber-400">${item.price}</p>
          </div>
          <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
        </div>
        <div class="flex items-center gap-2 bg-amber-950/50 rounded p-2 w-fit">
          <button onclick="decreaseQuantity(${index})" class="w-6 h-6 flex items-center justify-center text-amber-400 hover:text-amber-300">−</button>
          <span class="w-8 text-center text-amber-100">${item.quantity}</span>
          <button onclick="increaseQuantity(${index})" class="w-6 h-6 flex items-center justify-center text-amber-400 hover:text-amber-300">+</button>
        </div>
      </div>
    `
      )
      .join('')
  }

  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('R$ ', '').replace(',', '.'))
    return sum + price * item.quantity
  }, 0)
  document.getElementById('cart-total').textContent = `R$ ${total
    .toFixed(2)
    .replace('.', ',')}`
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId)
  const existingItem = cartItems.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.push({
      id: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
    })
  }
  updateCartUI()
}

function removeFromCart(index) {
  cartItems.splice(index, 1)
  updateCartUI()
}

function increaseQuantity(index) {
  cartItems[index].quantity++
  updateCartUI()
}

function decreaseQuantity(index) {
  if (cartItems[index].quantity > 1) {
    cartItems[index].quantity--
  } else {
    removeFromCart(index)
  }
  updateCartUI()
}

function openCart() {
  document.getElementById('cart-sidebar').classList.remove('translate-x-full')
  document.getElementById('cart-overlay').classList.remove('hidden')
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.add('translate-x-full')
  document.getElementById('cart-overlay').classList.add('hidden')
}

// Funções de Produtos
function renderProducts(category = 'all') {
  const grid = document.getElementById('products-grid')
  const filtered =
    category === 'all'
      ? products
      : products.filter((p) => p.category === category)

  grid.innerHTML = filtered
    .map(
      (product) => `
    <div class="product-card card-hover rounded-2xl bg-gradient-to-br from-amber-900/30 to-amber-950/50 border border-amber-800/30 overflow-hidden" data-category="${product.category}">
      <div class="h-48 bg-amber-900/20 flex items-center justify-center overflow-hidden">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy" onerror="console.error('Imagem não encontrada:', this.src); this.style.background='#854d0e'; this.alt='Imagem indisponível';">
      </div>
      <div class="p-6 text-center">
        <h4 class="font-semibold text-amber-100 mb-2">${product.name}</h4>
        <p class="text-2xl font-bold text-amber-400 mb-4">${product.price}</p>
        <button class="add-to-cart w-full py-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-amber-900 transition-all text-sm font-medium" onclick="addToCart(${product.id})">
          Adicionar
        </button>
      </div>
    </div>
  `
    )
    .join('')
}

// SDK Integration
function onConfigChange(config) {
  const c = { ...defaultConfig, ...config }

  document.getElementById('header-company').textContent = c.company_name
  document.getElementById('header-slogan').textContent = c.slogan
  document.getElementById('footer-company').textContent = c.company_name
  document.getElementById('contact-phone').textContent = c.phone
  document.getElementById('contact-address').textContent = c.address

  const heroTitle = document.getElementById('hero-title')
  heroTitle.innerHTML = c.hero_title.replace(
    'da região',
    '<br><span class="text-gradient">da região</span>'
  )
  document.getElementById('hero-subtitle').textContent = c.hero_subtitle

  // Apply font
  document.body.style.fontFamily = `${c.font_family}, Montserrat, sans-serif`

  // Apply font size scaling
  document.documentElement.style.fontSize = `${c.font_size}px`
}

function mapToCapabilities(config) {
  const c = { ...defaultConfig, ...config }
  return {
    recolorables: [
      {
        get: () => c.secondary_color,
        set: (value) => {
          c.secondary_color = value
          window.elementSdk.setConfig({ secondary_color: value })
        },
      },
      {
        get: () => c.primary_color,
        set: (value) => {
          c.primary_color = value
          window.elementSdk.setConfig({ primary_color: value })
        },
      },
      {
        get: () => c.text_color,
        set: (value) => {
          c.text_color = value
          window.elementSdk.setConfig({ text_color: value })
        },
      },
      {
        get: () => c.accent_color,
        set: (value) => {
          c.accent_color = value
          window.elementSdk.setConfig({ accent_color: value })
        },
      },
      {
        get: () => c.button_color,
        set: (value) => {
          c.button_color = value
          window.elementSdk.setConfig({ button_color: value })
        },
      },
    ],
    borderables: [],
    fontEditable: {
      get: () => c.font_family,
      set: (value) => {
        c.font_family = value
        window.elementSdk.setConfig({ font_family: value })
      },
    },
    fontSizeable: {
      get: () => c.font_size,
      set: (value) => {
        c.font_size = value
        window.elementSdk.setConfig({ font_size: value })
      },
    },
  }
}

function mapToEditPanelValues(config) {
  const c = { ...defaultConfig, ...config }
  return new Map([
    ['company_name', c.company_name],
    ['slogan', c.slogan],
    ['phone', c.phone],
    ['address', c.address],
    ['hero_title', c.hero_title],
    ['hero_subtitle', c.hero_subtitle],
  ])
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Cart buttons
  document.getElementById('cart-btn').addEventListener('click', openCart)
  document.getElementById('cart-close').addEventListener('click', closeCart)

  document
    .getElementById('cart-checkout')
    .addEventListener('click', function () {
      if (cartItems.length === 0) {
        alert('Seu carrinho está vazio!')
        return
      }
      alert(
        'Obrigado pelo seu pedido! Verifique sua caixa de entrada para mais informações.'
      )
      cartItems = []
      updateCartUI()
      closeCart()
    })

  document.getElementById('cart-clear').addEventListener('click', function () {
    if (
      cartItems.length > 0 &&
      confirm('Tem certeza que deseja limpar o carrinho?')
    ) {
      cartItems = []
      updateCartUI()
    }
  })

  // Category filter
  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.category-btn').forEach((b) => {
        b.classList.remove('bg-amber-500', 'text-amber-900')
        b.classList.add('bg-amber-900/30', 'text-amber-300')
      })
      this.classList.add('bg-amber-500', 'text-amber-900')
      this.classList.remove('bg-amber-900/30', 'text-amber-300')
      renderProducts(this.dataset.category)
    })
  })

  // Mobile menu
  document
    .getElementById('mobile-menu-btn')
    .addEventListener('click', function () {
      const menu = document.getElementById('mobile-menu')
      menu.classList.toggle('hidden')
    })

  document.querySelectorAll('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.add('hidden')
    })
  })

  // Contact form
  document
    .getElementById('contact-form')
    .addEventListener('submit', function (e) {
      e.preventDefault()
      const success = document.getElementById('form-success')
      success.classList.remove('hidden')
      this.reset()
      setTimeout(() => success.classList.add('hidden'), 3000)
    })

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

  // Initialize products
  renderProducts()

  // SDK initialization
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues,
    })
  }
})
