/* ========================================
   CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
   ======================================== */

const PRODUCTS = [
  {
    id: 1,
    name: 'Cerveja Skol 350ml',
    image: 'images/skol.jpg',
    price: 4.99,
    category: 'cervejas',
  },
  {
    id: 2,
    name: 'Cerveja Skol 350ml pack 12un',
    image: 'images/skol pack.jpeg',
    price: 49.99,
    category: 'cervejas',
  },
  {
    id: 3,
    name: 'Cerveja Lokal 350ml',
    image: 'images/lokal350.jpg',
    price: 3.99,
    category: 'cervejas',
  },
  {
    id: 4,
    name: 'Cerveja Lokal 350ml pack 12un',
    image: 'images/local pack.jpeg',
    price: 39.99,
    category: 'cervejas',
  },
  {
    id: 5,
    name: 'Refrigerante Coca-Cola 2L',
    image: 'images/cocacola-2l.jpg',
    price: 14.99,
    category: 'refrigerantes',
  },
  {
    id: 6,
    name: 'Coca-Cola lata',
    image: 'images/cocacola-lata.jpg',
    price: 4.99,
    category: 'refrigerantes',
  },
  {
    id: 7,
    name: 'Pitú 1L',
    image: 'images/pitu.jpeg',
    price: 14.99,
    category: 'destilados',
  },
  {
    id: 8,
    name: 'Rum 1L',
    image: 'images/run.png',
    price: 34.99,
    category: 'destilados',
  },
  {
    id: 9,
    name: 'Whisky Passaport 1L',
    image: 'images/passaport.jpeg',
    price: 89.99,
    category: 'destilados',
  },
  {
    id: 10,
    name: 'Cachaça 51',
    image: 'images/cachaca-51.png',
    price: 13.99,
    category: 'destilados',
  } /*
  {
    id: 11,
    name: 'Água Mineral 1.5L',
    image: 'images/agua.jpg',
    price: 3.5,
    category: 'agua',
  },
  {
    id: 12,
    name: 'Isotônico 500ml',
    image: 'images/isotonico.jpg',
    price: 8.9,
    category: 'esportes',
  }*/,
  ,
]


let cart = {}
let orders = []
let currentOrderTracking = null
let storeConfig = {
  store_name: 'Distribuidora Gelada',
  store_phone: '(11) 99999-9999',
  delivery_fee: 5.0,
  store_status: 'aberto',
  closed_message: 'Voltamos em breve!',
}

/* ========================================
   ELEMENT SDK INICIALIZAÇÃO
   ======================================== */

;(async () => {
  if (window.elementSdk) {
    const defaultConfig = {
      store_name: storeConfig.store_name,
      store_phone: storeConfig.store_phone,
      delivery_fee: storeConfig.delivery_fee.toString(),
      store_status: storeConfig.store_status,
      closed_message: storeConfig.closed_message,
    }

    await window.elementSdk.init({
      defaultConfig,
      onConfigChange: (config) => {
        storeConfig.store_name = config.store_name || defaultConfig.store_name
        storeConfig.store_phone =
          config.store_phone || defaultConfig.store_phone
        storeConfig.delivery_fee =
          parseFloat(config.delivery_fee) ||
          parseFloat(defaultConfig.delivery_fee)
        storeConfig.store_status =
          config.store_status || defaultConfig.store_status
        storeConfig.closed_message =
          config.closed_message || defaultConfig.closed_message

        document.getElementById('store-name').textContent =
          storeConfig.store_name
        document.getElementById('store-phone').textContent =
          '📞 ' + storeConfig.store_phone

        updateCartTotals()
      },
      mapToCapabilities: (config) => ({
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined,
      }),
      mapToEditPanelValues: (config) =>
        new Map([
          ['store_name', config.store_name],
          ['store_phone', config.store_phone],
          ['delivery_fee', config.delivery_fee],
        ]),
    })
  }

  loadOrdersFromStorage()
  renderOrders()
})()

/* ========================================
   LOCALSTORAGE - SALVAR/CARREGAR PEDIDOS
   ======================================== */

function saveOrdersToStorage() {
  localStorage.setItem('bebidas_orders', JSON.stringify(orders))
}

function loadOrdersFromStorage() {
  const stored = localStorage.getItem('bebidas_orders')
  orders = stored ? JSON.parse(stored) : []
}

/* ========================================
   RENDERIZAÇÃO DE PRODUTOS
   ======================================== */

function renderProducts() {
  const section = document.getElementById('section-produtos')

  const html = PRODUCTS.map(
    (product) => `
    <div class="product-card glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-pink-500 transition">
      <div class="product-image h-40 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
        <img 
          src="${product.image}" 
          alt="${product.name}"
          class="w-full h-full object-cover"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%231e293b%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22 font-size=%2224%22%3E📸%3C/text%3E%3C/svg%3E';"
        >
      </div>
      <div class="p-3">
        <h3 class="text-white font-semibold text-sm mb-2 line-clamp-2">${
          product.name
        }</h3>
        <p class="text-gray-400 text-xs mb-3">Preço unitário</p>
        <div class="text-cyan-400 font-bold text-lg mb-3">R$ ${product.price.toFixed(
          2
        )}</div>
        <div class="flex items-center gap-2">
          <button onclick="decreaseQuantity(${
            product.id
          })" class="flex-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 py-2 rounded-lg font-bold transition">−</button>
          <span class="flex-1 text-center text-white font-bold">${
            cart[product.id] || 0
          }</span>
          <button onclick="increaseQuantity(${
            product.id
          })" class="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 rounded-lg font-bold transition">+</button>
        </div>
      </div>
    </div>
  `
  ).join('')

  section.innerHTML = html
}

/* ========================================
   CONTROLE DE QUANTIDADE
   ======================================== */

function increaseQuantity(productId) {
  cart[productId] = (cart[productId] || 0) + 1
  updateCart()
}

function decreaseQuantity(productId) {
  if (cart[productId] && cart[productId] > 0) {
    cart[productId]--
    if (cart[productId] === 0) {
      delete cart[productId]
    }
    updateCart()
  }
}

/* ========================================
   ATUALIZAÇÃO DO CARRINHO
   ======================================== */

function updateCart() {
  renderProducts()
  renderCartItems()
  updateCartTotals()
  updateCartBadge()
}

function renderCartItems() {
  const cartItems = document.getElementById('cart-items')
  const emptyCart = document.getElementById('cart-empty')
  const items = Object.keys(cart).filter((id) => cart[id] > 0)

  if (items.length === 0) {
    cartItems.innerHTML = ''
    emptyCart.classList.remove('hidden')
    return
  }

  emptyCart.classList.add('hidden')
  cartItems.innerHTML = items
    .map((productId) => {
      const product = PRODUCTS.find((p) => p.id == productId)
      const quantity = cart[productId]
      const subtotal = product.price * quantity

      return `
      <div class="cart-item glass-card rounded-xl p-3 flex items-center gap-3 animate-slideInLeft">
        <img src="${product.image}" alt="${
        product.name
      }" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 50 50%22%3E%3Crect fill=%22%231e293b%22 width=%2250%22 height=%2250%22/%3E%3Ctext x=%2725%25%27 y=%2725%25%27 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22 font-size=%2212%22%3E📦%3C/text%3E%3C/svg%3E';">
        <div class="flex-1 min-w-0">
          <p class="cart-item-name text-white font-semibold text-sm truncate">${
            product.name
          }</p>
          <p class="cart-item-price text-gray-400 text-xs">R$ ${subtotal.toFixed(
            2
          )} (${quantity}x)</p>
        </div>
        <button onclick="removeFromCart(${productId})" class="cart-item-remove text-red-300 bg-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold transition">
          ✕
        </button>
      </div>
    `
    })
    .join('')
}

function removeFromCart(productId) {
  delete cart[productId]
  updateCart()
}

function updateCartTotals() {
  const subtotal = Object.keys(cart).reduce((sum, productId) => {
    const product = PRODUCTS.find((p) => p.id == productId)
    return sum + product.price * cart[productId]
  }, 0)

  const deliveryFee = storeConfig.delivery_fee
  const total = subtotal + deliveryFee

  document.getElementById('cart-subtotal').textContent = `R$ ${subtotal.toFixed(
    2
  )}`
  document.getElementById(
    'cart-delivery-fee'
  ).textContent = `R$ ${deliveryFee.toFixed(2)}`
  document.getElementById('cart-total').textContent = `R$ ${total.toFixed(2)}`
  document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(
    2
  )}`
}

function updateCartBadge() {
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const badge = document.getElementById('cart-count')

  if (count > 0) {
    badge.textContent = count
    badge.classList.remove('hidden')
  } else {
    badge.classList.add('hidden')
  }
}

/* ========================================
   MODAIS - CARRINHO E CHECKOUT
   ======================================== */

function openCart() {
  const items = Object.keys(cart).filter((id) => cart[id] > 0)
  if (items.length === 0) {
    showToast('Adicione produtos ao carrinho primeiro', 'error')
    return
  }
  document.getElementById('cart-modal').classList.remove('hidden')
  document.getElementById('cart-modal').classList.add('flex')
}

function closeCart() {
  document.getElementById('cart-modal').classList.add('hidden')
  document.getElementById('cart-modal').classList.remove('flex')
}

function openCheckout() {
  const items = Object.keys(cart).filter((id) => cart[id] > 0)
  if (items.length === 0) {
    showToast('Adicione produtos ao carrinho primeiro', 'error')
    return
  }
  document.getElementById('checkout-modal').classList.remove('hidden')
  document.getElementById('checkout-modal').classList.add('flex')
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden')
  document.getElementById('checkout-modal').classList.remove('flex')
}

function closeConfirmation() {
  document.getElementById('confirmation-modal').classList.add('hidden')
  document.getElementById('confirmation-modal').classList.remove('flex')
  switchTab('pedidos')
}

/* ========================================
   FORMULÁRIO DE CHECKOUT
   ======================================== */

document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
  e.preventDefault()

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value
  const customerName = document.getElementById('customer-name').value
  const customerPhone = document.getElementById('customer-phone').value
  const customerAddress = document.getElementById('customer-address').value

  const items = Object.keys(cart).filter((id) => cart[id] > 0)
  if (items.length === 0) {
    showToast('Carrinho vazio', 'error')
    return
  }

  const subtotal = items.reduce((sum, productId) => {
    const product = PRODUCTS.find((p) => p.id == productId)
    return sum + product.price * cart[productId]
  }, 0)

  const discount = paymentMethod === 'pix' ? subtotal * 0.05 : 0
  const total = subtotal - discount + storeConfig.delivery_fee

  const orderItems = items
    .map((productId) => {
      const product = PRODUCTS.find((p) => p.id == productId)
      return `${product.name} (${cart[productId]}x)`
    })
    .join(', ')

  const orderNumber = `PED-${Date.now()}`

  // Criar novo pedido
  const newOrder = {
    id: orderNumber,
    type: 'pedido',
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    items: orderItems,
    total: parseFloat(total.toFixed(2)),
    payment_method: paymentMethod,
    status: 'pending',
    created_at: new Date().toISOString(),
    motoboy_lat: -23.5505,
    motoboy_lng: -46.6333,
  }

  // Salvar no localStorage
  orders.unshift(newOrder)
  saveOrdersToStorage()

  cart = {}
  updateCart()
  closeCheckout()
  closeCart()

  document.getElementById('order-number').textContent = orderNumber.replace(
    'PED-',
    ''
  )
  document.getElementById('confirmation-modal').classList.remove('hidden')
  document.getElementById('confirmation-modal').classList.add('flex')

  showToast(`Pedido #${orderNumber.replace('PED-', '')} confirmado!`, 'success')

  document.getElementById('checkout-form').reset()
})

/* ========================================
   PAGAMENTO - ALTERNÂNCIA PIX/CARTÃO
   ======================================== */

document.querySelectorAll('input[name="payment"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const pixInfo = document.getElementById('pix-info')
    const cardInfo = document.getElementById('card-info')

    if (e.target.value === 'pix') {
      pixInfo.classList.remove('hidden')
      cardInfo.classList.add('hidden')
    } else {
      pixInfo.classList.add('hidden')
      cardInfo.classList.remove('hidden')
    }
  })
})

/* ========================================
   RENDERIZAÇÃO DE PEDIDOS
   ======================================== */

function renderOrders() {
  const ordersList = document.getElementById('orders-list')
  const emptyState = document.getElementById('orders-empty')

  if (!orders || orders.length === 0) {
    ordersList.innerHTML = ''
    emptyState.classList.remove('hidden')
    return
  }

  emptyState.classList.add('hidden')
  ordersList.innerHTML = orders
    .map((order) => {
      const statusMap = {
        pending: { text: 'Aguardando', color: 'bg-red-500/20 text-red-300' },
        processing: {
          text: 'Preparando',
          color: 'bg-yellow-500/20 text-yellow-300',
        },
        in_delivery: {
          text: 'Em entrega',
          color: 'bg-blue-500/20 text-blue-300',
        },
        delivered: {
          text: 'Entregue',
          color: 'bg-green-500/20 text-green-300',
        },
      }

      const status = statusMap[order.status] || statusMap.pending
      const orderNumber = order.id.replace('PED-', '')
      const createdDate = new Date(order.created_at).toLocaleDateString('pt-BR')

      return `
      <div class="order-card glass-card rounded-2xl p-4 animate-slideInLeft">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-white font-bold">Pedido #${orderNumber}</div>
            <div class="text-gray-400 text-xs">${createdDate}</div>
          </div>
          <span class="order-status ${
            status.color
          } text-xs font-semibold px-3 py-1 rounded-full">${status.text}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <div class="text-gray-400 text-xs">Cliente</div>
            <div class="text-white font-semibold truncate">${
              order.customer_name
            }</div>
          </div>
          <div>
            <div class="text-gray-400 text-xs">Telefone</div>
            <div class="text-white font-semibold">${order.customer_phone}</div>
          </div>
          <div class="col-span-2">
            <div class="text-gray-400 text-xs">Endereço</div>
            <div class="text-white font-semibold truncate">${
              order.customer_address
            }</div>
          </div>
        </div>
        <div class="bg-black/20 rounded-lg p-2 mb-3">
          <div class="text-gray-400 text-xs mb-1">Itens</div>
          <div class="text-white text-sm line-clamp-2">${order.items}</div>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-white/10">
          <span class="text-gray-400 text-sm">Total</span>
          <span class="text-cyan-400 font-bold text-lg">R$ ${order.total.toFixed(
            2
          )}</span>
        </div>
        ${
          order.status === 'in_delivery'
            ? `
          <button onclick="startTracking('${order.id}')" class="w-full mt-3 btn-secondary py-2 rounded-lg text-white text-sm font-semibold">
            📍 Rastrear Entrega
          </button>
        `
            : ''
        }
      </div>
    `
    })
    .join('')
}

/* ========================================
   RASTREAMENTO DE ENTREGA
   ======================================== */

function startTracking(orderId) {
  currentOrderTracking = orders.find((o) => o.id === orderId)
  if (!currentOrderTracking) return

  switchTab('rastreio')
  renderTracking()
  startMotoboySim()
}

function renderTracking() {
  const trackingEmpty = document.getElementById('tracking-empty')
  const trackingMap = document.getElementById('tracking-map')

  if (!currentOrderTracking || currentOrderTracking.status !== 'in_delivery') {
    trackingMap.classList.add('hidden')
    trackingEmpty.classList.remove('hidden')
    return
  }

  trackingEmpty.classList.add('hidden')
  trackingMap.classList.remove('hidden')
}

let motoboySim = null

function startMotoboySim() {
  if (motoboySim) clearInterval(motoboySim)

  let progress = 0
  motoboySim = setInterval(() => {
    progress += Math.random() * 15
    if (progress >= 100) {
      progress = 100
      clearInterval(motoboySim)
    }

    const progressBar = document.getElementById('delivery-progress')
    if (progressBar) {
      progressBar.style.width = progress + '%'
    }

    const eta = Math.max(1, Math.ceil(20 * (1 - progress / 100)))
    const etaElement = document.getElementById('eta')
    if (etaElement) {
      etaElement.textContent = `${eta}-${eta + 5} min`
    }

    const motoboy = document.getElementById('motoboy-marker')
    if (motoboy) {
      motoboy.style.transform = `translate(${50 + (300 * progress) / 100}, ${
        150 - (50 * progress) / 100
      })`
    }
  }, 3000)
}

/* ========================================
   NAVEGAÇÃO POR ABAS
   ======================================== */

function switchTab(tabName) {
  document.getElementById('section-produtos').classList.add('hidden')
  document.getElementById('section-pedidos').classList.add('hidden')
  document.getElementById('section-rastreio').classList.add('hidden')

  document.getElementById('tab-produtos').classList.remove('tab-active')
  document.getElementById('tab-pedidos').classList.remove('tab-active')
  document.getElementById('tab-rastreio').classList.remove('tab-active')

  if (tabName === 'produtos') {
    document.getElementById('section-produtos').classList.remove('hidden')
    document.getElementById('tab-produtos').classList.add('tab-active')
  } else if (tabName === 'pedidos') {
    document.getElementById('section-pedidos').classList.remove('hidden')
    document.getElementById('tab-pedidos').classList.add('tab-active')
    renderOrders()
  } else if (tabName === 'rastreio') {
    document.getElementById('section-rastreio').classList.remove('hidden')
    document.getElementById('tab-rastreio').classList.add('tab-active')
    renderTracking()
  }

  closeCart()
  closeCheckout()
}

/* ========================================
   NOTIFICAÇÕES (TOAST)
   ======================================== */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = `toast ${type} animate-slideInRight`
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

/* ========================================
   INICIALIZAÇÃO
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderProducts()
  updateCartTotals()
})
