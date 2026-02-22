/* =====================================================================
   ARQUIVO: app.js - VERSÃO ATUALIZADA
   Lógica completa da aplicação ADEGA IRMÃOS JG COM RASTREAMENTO
   Gerencia carrinho, checkout, pagamento, cálculo de km e mapa
   ===================================================================== */

/* =====================================================================
   SEÇÃO 1: CONFIGURAÇÃO PADRÃO
   Valores iniciais da loja e do aplicativo
   ===================================================================== */

const defaultConfig = {
  company_name: 'ADEGA IRMÃOS JG',
  slogan: 'Qualidade e variedade em bebidas',
  phone: '(00) 00000-0000',
  address: 'Seu endereço aqui',
  store_status: 'Aberto',
  delivery_price_per_km: 2.0, // ✨ NOVO: Taxa por KM (antes era fixa)
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

/* =====================================================================
   SEÇÃO 2: VARIÁVEIS GLOBAIS - RASTREAMENTO
   Novas variáveis para controlar distância e entrega
   ===================================================================== */

let currentDistance = 0 // Distância inserida pelo cliente em KM
let deliveryFee = 0 // Taxa de entrega calculada (distância × R$ 2,00)
let trackingActive = false // Controla se o rastreamento está ativo
let trackingProgress = 0 // Progresso do rastreamento (0 a 100)
let trackingInterval = null // ID do intervalo para simular movimento

/* =====================================================================
   SEÇÃO 2B: BASE DE DADOS DE PRODUTOS
   Array com todos os produtos disponíveis para venda
   ===================================================================== */

const products = [
  // CERVEJAS
  {
    id: 1,
    name: 'Cerveja Slok 350ml',
    category: 'cerveja',
    price: 4.99,
    image: 'imagens/skol.jpg',
  },
  {
    id: 2,
    name: 'Cerveja IPA',
    category: 'cerveja',
    price: 12.99,
    image: 'imagens/cerveja-ipa.jpg',
  },
  {
    id: 3,
    name: 'Cerveja Weiss',
    category: 'cerveja',
    price: 9.99,
    image: 'imagens/cerveja-weiss.jpg',
  },

  // DESTILADOS
  {
    id: 4,
    name: 'Whisky 12 anos',
    category: 'destilado',
    price: 129.9,
    image: 'imagens/whisky.jpg',
  },
  {
    id: 5,
    name: 'Vodka Premium',
    category: 'destilado',
    price: 69.9,
    image: 'imagens/vodka.jpg',
  },
  {
    id: 6,
    name: 'Cachaça Artesanal',
    category: 'destilado',
    price: 24.9,
    image: 'imagens/cachaca.jpg',
  },

  // REFRIGERANTES
  {
    id: 7,
    name: 'Coca-Cola 2L',
    category: 'refrigerante',
    price: 9.99,
    image: 'imagens/coca-cola.jpg',
  },
  {
    id: 8,
    name: 'Guaraná 2L',
    category: 'refrigerante',
    price: 7.99,
    image: 'imagens/guarana.jpg',
  },
  {
    id: 9,
    name: 'Água Mineral',
    category: 'refrigerante',
    price: 2.99,
    image: 'imagens/agua-mineral.jpg',
  },
]

/* =====================================================================
   SEÇÃO 3: VARIÁVEIS GLOBAIS
   Armazenam estados da aplicação durante a sessão
   ===================================================================== */

let currentCategory = 'all'
let cartItems = []
let config = { ...defaultConfig }

/* =====================================================================
   SEÇÃO 4: FUNÇÕES DO CARRINHO (SEM ALTERAÇÕES)
   Gerenciam adição, remoção e atualização de itens do carrinho
   ===================================================================== */

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
            <p class="text-amber-400">R$ ${item.price
              .toFixed(2)
              .replace('.', ',')}</p>
          </div>
          <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-300 transition-colors" title="Remover item">
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

  updateTotals()
}

/**
 * ✨ NOVO: Função para calcular totais COM DISTÂNCIA
 * Agora inclui a taxa de entrega baseada em km
 */
function updateTotals() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // ✨ NOVO: Usar a taxa calculada por km em vez de uma taxa fixa
  const finalDeliveryFee = deliveryFee > 0 ? deliveryFee : 0

  const total = subtotal + finalDeliveryFee

  // Atualizar sidebar do carrinho
  document.getElementById('cart-subtotal').textContent = `R$ ${subtotal
    .toFixed(2)
    .replace('.', ',')}`
  document.getElementById('cart-delivery').textContent = `R$ ${finalDeliveryFee
    .toFixed(2)
    .replace('.', ',')}`
  document.getElementById('cart-total').textContent = `R$ ${total
    .toFixed(2)
    .replace('.', ',')}`

  // Atualizar modal de checkout
  const checkoutSubtotal = document.getElementById('checkout-subtotal')
  if (checkoutSubtotal) {
    checkoutSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`
    document.getElementById(
      'checkout-delivery'
    ).textContent = `R$ ${finalDeliveryFee.toFixed(2).replace('.', ',')}`
    document.getElementById('checkout-total').textContent = `R$ ${total
      .toFixed(2)
      .replace('.', ',')}`
  }
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
  showNotification(`${product.name} adicionado ao carrinho! ✓`, 'success')
}

function removeFromCart(index) {
  cartItems.splice(index, 1)
  updateCartUI()
  showNotification('Item removido do carrinho', 'info')
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
    return
  }
  updateCartUI()
}

/* =====================================================================
   SEÇÃO 5: FUNÇÕES DO SIDEBAR DO CARRINHO (SEM ALTERAÇÕES)
   ===================================================================== */

function openCart() {
  document.getElementById('cart-sidebar').classList.remove('translate-x-full')
  document.getElementById('cart-overlay').classList.remove('hidden')
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.add('translate-x-full')
  document.getElementById('cart-overlay').classList.add('hidden')
}

/* =====================================================================
   SEÇÃO 6: FUNÇÕES DO CHECKOUT (MODIFICADAS)
   Agora inclui cálculo de distância antes de abrir
   ===================================================================== */

function openCheckout() {
  if (config.store_status.toLowerCase() !== 'aberto') {
    showNotification(
      'Loja fechada no momento. Tente novamente mais tarde!',
      'error'
    )
    return
  }

  if (cartItems.length === 0) {
    showNotification('Seu carrinho está vazio!', 'error')
    return
  }

  // Resetar valores de distância quando abre novo checkout
  currentDistance = 0
  deliveryFee = 0

  document.getElementById('checkout-modal').classList.remove('hidden')
  document.getElementById('checkout-modal').classList.add('flex')

  // Resetar mapa e rastreamento
  resetTracking()
  calculateInstallments()

  const statusBadge = document.getElementById('checkout-store-status')
  if (statusBadge) {
    statusBadge.textContent = config.store_status
  }
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden')
  document.getElementById('checkout-modal').classList.remove('flex')
  stopTracking()
}

/* =====================================================================
   SEÇÃO 7: ✨ NOVAS FUNÇÕES - CÁLCULO DE DISTÂNCIA E TAXA
   ===================================================================== */

/**
 * ✨ NOVO: Calcula a taxa de entrega baseada na distância em KM
 * Valida se a distância é válida e atualiza a interface
 */
function calculateDeliveryDistance() {
  // Obter valor do input de distância
  const distanceInput = document.getElementById('delivery-distance')
  const distance = parseFloat(distanceInput.value)

  // Validação básica
  if (!distance || distance <= 0 || isNaN(distance)) {
    showNotification('Digite uma distância válida em KM!', 'error')
    return
  }

  if (distance > 100) {
    showNotification('Distância máxima é 100 KM!', 'error')
    return
  }

  // ✨ Calcular taxa: distância × R$ 2,00 por km (configurável)
  currentDistance = distance
  const pricePerKm = parseFloat(config.delivery_price_per_km) || 2.0
  deliveryFee = distance * pricePerKm

  // Tempo estimado: 2 minutos por km (simulação realista)
  const estimatedTime = Math.ceil(distance * 2)

  // Atualizar UI com a nova taxa
  updateTotals()

  // Mostrar informações do cálculo
  const distanceInfo = document.getElementById('distance-info')
  distanceInfo.innerHTML = `
    <div class="bg-green-900/20 border border-green-800/30 rounded-lg p-4 space-y-2">
      <p class="text-green-200">✓ Distância calculada com sucesso!</p>
      <div class="text-sm text-green-300">
        <p>📍 Distância: ${distance.toFixed(2)} KM</p>
        <p>💰 Taxa de entrega: R$ ${deliveryFee
          .toFixed(2)
          .replace('.', ',')}</p>
        <p>⏱️ Tempo estimado: ~${estimatedTime} minutos</p>
      </div>
    </div>
  `

  // Renderizar mapa com a rota
  renderDeliveryMap(distance)

  // Mostrar notificação
  showNotification(
    `Taxa de entrega atualizada: R$ ${deliveryFee
      .toFixed(2)
      .replace('.', ',')}`,
    'success'
  )
}

/**
 * ✨ NOVO: Renderiza um mapa simples mostrando loja e ponto de entrega
 * Usa SVG para desenhar a rota
 */
function renderDeliveryMap(distance) {
  const mapContainer = document.getElementById('delivery-map')

  // Coordenadas da loja (ponto fixo)
  const storeX = 80
  const storeY = 150

  // Coordenadas do ponto de entrega (calculado a partir da distância)
  // Usa uma fórmula simples para simular movimento
  const deliveryX = 80 + distance * 8 // Simula movimento proporcional ao KM
  const deliveryY = 150 - distance * 3 // Pequena variação vertical

  // Limitar coordenadas dentro do SVG
  const finalX = Math.min(deliveryX, 450)
  const finalY = Math.max(Math.min(deliveryY, 280), 20)

  // HTML do mapa em SVG
  mapContainer.innerHTML = `
    <div class="bg-amber-900/10 border border-amber-800/30 rounded-lg p-4">
      <svg viewBox="0 0 500 300" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <!-- Fundo do mapa -->
        <rect width="500" height="300" fill="#2d1810" opacity="0.5"/>
        
        <!-- Grid de fundo -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#854d0e" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="500" height="300" fill="url(#grid)" />
        
        <!-- Linha de rota (tracejada) -->
        <line x1="${storeX}" y1="${storeY}" x2="${finalX}" y2="${finalY}" 
              stroke="#D4AF37" stroke-width="2" stroke-dasharray="5,5" opacity="0.6"/>
        
        <!-- Ponto da loja (dourado) -->
        <circle cx="${storeX}" cy="${storeY}" r="12" fill="#D4AF37" stroke="#f59e0b" stroke-width="2"/>
        <text x="${storeX}" y="${
    storeY + 25
  }" text-anchor="middle" fill="#D4AF37" font-size="12" font-weight="bold">
          🏪 Loja
        </text>
        
        <!-- Ponto de entrega (laranja) -->
        <circle cx="${finalX}" cy="${finalY}" r="10" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
        <text x="${finalX}" y="${
    finalY + 25
  }" text-anchor="middle" fill="#f59e0b" font-size="12" font-weight="bold">
          📦 Entrega
        </text>
        
        <!-- Distância no meio da rota -->
        <text x="${(storeX + finalX) / 2}" y="${(storeY + finalY) / 2 - 10}" 
              text-anchor="middle" fill="#fef3c7" font-size="14" font-weight="bold">
          ${distance.toFixed(1)} KM
        </text>
      </svg>
    </div>
  `
}

/* =====================================================================
   SEÇÃO 8: ✨ NOVAS FUNÇÕES - RASTREAMENTO DE PEDIDO
   Simula movimento do pedido no mapa em tempo real
   ===================================================================== */

/**
 * ✨ NOVO: Inicia o rastreamento do pedido com animação
 * Anima um ponto movendo de loja até entrega
 */
function startTracking() {
  if (!currentDistance || currentDistance <= 0) {
    showNotification('Calcule a distância primeiro!', 'error')
    return
  }

  trackingActive = true
  trackingProgress = 0

  // Esconder seção de cálculo
  document.getElementById('distance-calc-section').style.display = 'none'

  // Mostrar seção de rastreamento
  const trackingSection = document.getElementById('delivery-tracking-section')
  trackingSection.style.display = 'block'

  // Tempo total de simulação: 2 minutos por km
  const totalDuration = currentDistance * 2 * 1000 // em milissegundos
  const updateInterval = 100 // Atualizar a cada 100ms

  // Limpar intervalo anterior se existir
  if (trackingInterval) clearInterval(trackingInterval)

  // Iniciar simulação de movimento
  trackingInterval = setInterval(() => {
    trackingProgress += (updateInterval / totalDuration) * 100

    if (trackingProgress >= 100) {
      trackingProgress = 100
      clearInterval(trackingInterval)

      // Mostrar mensagem de conclusão
      document.getElementById('tracking-status').innerHTML = `
        <div class="bg-green-900/30 border border-green-800/50 rounded-lg p-4 text-center">
          <h4 class="text-green-300 font-bold text-lg mb-2">✓ Entrega Concluída!</h4>
          <p class="text-green-200">Seu pedido chegou com sucesso!</p>
        </div>
      `

      setTimeout(() => {
        closeCheckout()
        closeCart()
        cartItems = []
        updateCartUI()
        showNotification('Obrigado pela compra! ✓', 'success')
      }, 2000)

      return
    }

    // Atualizar barra de progresso
    updateTrackingUI()
  }, updateInterval)

  // Renderizar mapa com animação
  renderAnimatedDeliveryMap()
}

/**
 * ✨ NOVO: Renderiza mapa com ponto se movendo (animação)
 */
function renderAnimatedDeliveryMap() {
  const storeX = 80
  const storeY = 150
  const deliveryX = 80 + currentDistance * 8
  const deliveryY = 150 - currentDistance * 3
  const finalX = Math.min(deliveryX, 450)
  const finalY = Math.max(Math.min(deliveryY, 280), 20)

  // Calcular posição do marcador de entrega (movendo)
  const currentX = storeX + (finalX - storeX) * (trackingProgress / 100)
  const currentY = storeY + (finalY - storeY) * (trackingProgress / 100)

  const mapContainer = document.getElementById('delivery-map')

  mapContainer.innerHTML = `
    <div class="bg-amber-900/10 border border-amber-800/30 rounded-lg p-4">
      <svg viewBox="0 0 500 300" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <!-- Fundo -->
        <rect width="500" height="300" fill="#2d1810" opacity="0.5"/>
        
        <!-- Grid -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#854d0e" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="500" height="300" fill="url(#grid)" />
        
        <!-- Caminho percorrido (linha sólida) -->
        <line x1="${storeX}" y1="${storeY}" x2="${currentX}" y2="${currentY}" 
              stroke="#D4AF37" stroke-width="3" opacity="0.8"/>
        
        <!-- Caminho restante (linha tracejada) -->
        <line x1="${currentX}" y1="${currentY}" x2="${finalX}" y2="${finalY}" 
              stroke="#D4AF37" stroke-width="2" stroke-dasharray="5,5" opacity="0.4"/>
        
        <!-- Loja (ponto fixo) -->
        <circle cx="${storeX}" cy="${storeY}" r="12" fill="#D4AF37" stroke="#f59e0b" stroke-width="2"/>
        <text x="${storeX}" y="${
    storeY + 25
  }" text-anchor="middle" fill="#D4AF37" font-size="12" font-weight="bold">
          🏪 Loja
        </text>
        
        <!-- Carro em movimento (ponto animado) -->
        <g>
          <circle cx="${currentX}" cy="${currentY}" r="8" fill="#FF6B6B" stroke="#FFE66D" stroke-width="2"/>
          <text x="${currentX}" y="${
    currentY + 20
  }" text-anchor="middle" fill="#FF6B6B" font-size="14">
            🚗
          </text>
        </g>
        
        <!-- Ponto de entrega (destino) -->
        <circle cx="${finalX}" cy="${finalY}" r="10" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
        <text x="${finalX}" y="${
    finalY + 25
  }" text-anchor="middle" fill="#f59e0b" font-size="12" font-weight="bold">
          📦 Entrega
        </text>
        
        <!-- Porcentagem de progresso -->
        <text x="250" y="30" text-anchor="middle" fill="#fef3c7" font-size="16" font-weight="bold">
          ${trackingProgress.toFixed(0)}% - Em rota!
        </text>
      </svg>
    </div>
  `
}

/**
 * ✨ NOVO: Atualiza a UI de rastreamento
 */
function updateTrackingUI() {
  renderAnimatedDeliveryMap()

  // Atualizar textos de status
  const status = document.getElementById('tracking-status')
  const timeRemaining = Math.ceil(
    ((100 - trackingProgress) * (currentDistance * 2)) / 100
  )

  status.innerHTML = `
    <div class="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-blue-200 font-semibold">🚗 Seu pedido está a caminho!</p>
        <p class="text-blue-400">${trackingProgress.toFixed(0)}%</p>
      </div>
      <div class="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all" 
             style="width: ${trackingProgress}%; transition: width 100ms linear;"></div>
      </div>
      <p class="text-blue-300 text-sm">Tempo estimado: ~${timeRemaining} minutos</p>
    </div>
  `
}

/**
 * ✨ NOVO: Para o rastreamento
 */
function stopTracking() {
  trackingActive = false
  if (trackingInterval) {
    clearInterval(trackingInterval)
    trackingInterval = null
  }
}

/**
 * ✨ NOVO: Reseta tudo para começar um novo cálculo
 */
function resetTracking() {
  stopTracking()
  currentDistance = 0
  deliveryFee = 0
  trackingProgress = 0

  // Mostrar seção de cálculo novamente
  document.getElementById('distance-calc-section').style.display = 'block'
  document.getElementById('delivery-tracking-section').style.display = 'none'
  document.getElementById('distance-info').innerHTML = ''
  document.getElementById('delivery-map').innerHTML = ''
  document.getElementById('tracking-status').innerHTML = ''
  document.getElementById('delivery-distance').value = ''
}

/* =====================================================================
   SEÇÃO 9: FUNÇÕES DE PAGAMENTO (COM PEQUENAS ALTERAÇÕES)
   ===================================================================== */

function calculateInstallments() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const finalDeliveryFee = deliveryFee > 0 ? deliveryFee : 0
  const total = subtotal + finalDeliveryFee

  const installmentsDiv = document.getElementById('payment-installments')

  if (total >= 200) {
    let html =
      '<label class="block text-sm text-amber-200 mb-2">Parcelamento em cartão:</label><div class="space-y-2">'

    for (let i = 1; i <= 4; i++) {
      const installmentValue = (total / i).toFixed(2)
      html += `
        <label class="flex items-center gap-3 p-3 rounded-lg bg-amber-900/20 border border-amber-800/30 hover:border-amber-500/50 cursor-pointer transition-all">
          <input type="radio" name="installments" value="${i}" class="w-4 h-4 cursor-pointer">
          <span class="text-amber-100 flex-1">${i}x de R$ ${installmentValue.replace(
        '.',
        ','
      )}</span>
        </label>
      `
    }

    html += '</div>'
    installmentsDiv.innerHTML = html

    document.querySelector('input[name="installments"]').checked = true
  } else {
    installmentsDiv.innerHTML =
      '<p class="text-amber-300 text-sm">Parcelamento disponível acima de R$ 200</p>'
  }
}

function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-option').forEach((el) => {
    el.classList.remove('border-amber-400', 'bg-amber-900/30')
    el.classList.add('border-amber-800/30')
  })

  event.target
    .closest('.payment-option')
    .classList.add('border-amber-400', 'bg-amber-900/30')

  const installmentsDiv = document.getElementById('payment-installments')

  if (method === 'credit') {
    calculateInstallments()
  } else if (method === 'pix') {
    installmentsDiv.innerHTML =
      '<p class="text-amber-300 text-sm">PIX à vista - desconto de 5%</p>'
  } else if (method === 'debit') {
    installmentsDiv.innerHTML =
      '<p class="text-amber-300 text-sm">Débito à vista</p>'
  }

  document.getElementById('selected-payment').value = method
}

function processPayment() {
  const method = document.getElementById('selected-payment').value
  const name = document.getElementById('customer-name').value.trim()
  const email = document.getElementById('customer-email').value.trim()
  const address = document.getElementById('customer-address').value.trim()

  if (!name || !email || !address) {
    showNotification('Preencha todos os campos!', 'error')
    return
  }

  if (!method) {
    showNotification('Selecione uma forma de pagamento!', 'error')
    return
  }

  const btn = event.target
  btn.disabled = true
  btn.textContent = 'Processando...'

  setTimeout(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const finalDeliveryFee = deliveryFee > 0 ? deliveryFee : 0
    let total = subtotal + finalDeliveryFee

    let paymentDetails = `Forma de pagamento: ${
      method === 'pix'
        ? 'PIX'
        : method === 'credit'
        ? 'Cartão de Crédito'
        : 'Débito'
    }`

    if (method === 'credit') {
      const installments =
        document.querySelector('input[name="installments"]:checked')?.value || 1
      paymentDetails += ` - ${installments}x`
    }

    if (method === 'pix') {
      total = total * 0.95
      paymentDetails += ` - (Desconto de 5% aplicado)`
    }

    const message = `
Obrigado pela compra!

${paymentDetails}
Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}
Taxa de Entrega: R$ ${finalDeliveryFee.toFixed(2).replace('.', ',')}
TOTAL: R$ ${total.toFixed(2).replace('.', ',')}

Você receberá um email de confirmação em ${email}
Endereço de entrega: ${address}
Distância: ${currentDistance.toFixed(2)} KM

Referência do pedido: #${Date.now()}
    `

    showNotification('Pedido recebido com sucesso! ✓', 'success')
    console.log('Dados do pedido:', {
      name,
      email,
      address,
      method,
      distance: currentDistance,
      deliveryFee: finalDeliveryFee,
      message,
    })

    setTimeout(() => {
      // ✨ Iniciar rastreamento do pedido
      startTracking()

      btn.disabled = false
      btn.textContent = '✓ Confirmar Pedido'
    }, 1500)
  }, 2000)
}

/* =====================================================================
   SEÇÃO 10: NOTIFICAÇÕES (SEM ALTERAÇÕES)
   ===================================================================== */

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')

  notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white font-semibold z-50 animate-bounce ${
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500'
  }`

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 4000)
}

/* =====================================================================
   SEÇÃO 11: FUNÇÕES DE PRODUTOS (SEM ALTERAÇÕES)
   ===================================================================== */

function renderProducts(category = 'all') {
  const grid = document.getElementById('products-grid')

  const filtered =
    category === 'all'
      ? products
      : products.filter((p) => p.category === category)

  grid.innerHTML = filtered
    .map(
      (product) => `
    <div class="product-card card-hover rounded-2xl bg-gradient-to-br from-amber-900/30 to-amber-950/50 border border-amber-800/30 overflow-hidden" data-category="${
      product.category
    }">
      <div class="h-48 bg-amber-900/20 flex items-center justify-center overflow-hidden">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="w-full h-full object-cover" 
          loading="lazy" 
          onerror="console.error('Imagem não encontrada:', this.src); this.style.background='#854d0e'; this.alt='Imagem indisponível';"
        >
      </div>
      
      <div class="p-6 text-center">
        <h4 class="font-semibold text-amber-100 mb-2">${product.name}</h4>
        <p class="text-2xl font-bold text-amber-400 mb-4">
          R$ ${product.price.toFixed(2).replace('.', ',')}
        </p>
        <button 
          class="add-to-cart w-full py-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-amber-900 transition-all text-sm font-medium" 
          onclick="addToCart(${product.id})"
        >
          Adicionar
        </button>
      </div>
    </div>
  `
    )
    .join('')
}

/* =====================================================================
   SEÇÃO 12: INTEGRAÇÃO COM SDK DO CANVA (COM ALTERAÇÃO)
   ===================================================================== */

function onConfigChange(configUpdate) {
  config = { ...defaultConfig, ...configUpdate }

  document.getElementById('header-company').textContent = config.company_name
  document.getElementById('header-slogan').textContent = config.slogan
  document.getElementById('footer-company').textContent = config.company_name
  document.getElementById('contact-phone').textContent = config.phone
  document.getElementById('contact-address').textContent = config.address

  const statusBadge = document.getElementById('store-status-badge')
  statusBadge.textContent = config.store_status

  if (config.store_status.toLowerCase() === 'aberto') {
    statusBadge.classList.remove('bg-red-900/60', 'text-red-200')
    statusBadge.classList.add('bg-green-900/60', 'text-green-200')
  } else {
    statusBadge.classList.remove('bg-green-900/60', 'text-green-200')
    statusBadge.classList.add('bg-red-900/60', 'text-red-200')
  }

  const heroTitle = document.getElementById('hero-title')
  heroTitle.innerHTML = config.hero_title.replace(
    'da região',
    '<br><span class="text-gradient">da região</span>'
  )

  document.getElementById('hero-subtitle').textContent = config.hero_subtitle

  document.body.style.fontFamily = `${config.font_family}, Montserrat, sans-serif`
  document.documentElement.style.fontSize = `${config.font_size}px`

  // ✨ Atualizar preço por KM quando configuração muda
  updateTotals()
}

function mapToCapabilities(configParam) {
  const c = { ...defaultConfig, ...configParam }

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

function mapToEditPanelValues(configParam) {
  const c = { ...defaultConfig, ...configParam }

  return new Map([
    ['company_name', c.company_name],
    ['slogan', c.slogan],
    ['phone', c.phone],
    ['address', c.address],
    ['store_status', c.store_status],
    ['delivery_price_per_km', c.delivery_price_per_km.toString()],
    ['hero_title', c.hero_title],
    ['hero_subtitle', c.hero_subtitle],
  ])
}

/* =====================================================================
   SEÇÃO 13: EVENT LISTENERS (COM NOVAS FUNÇÕES)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  console.log('✓ Aplicação carregada com sucesso!')

  // ========== CARRINHO ==========
  document.getElementById('cart-btn').addEventListener('click', openCart)
  document.getElementById('cart-close').addEventListener('click', closeCart)
  document
    .getElementById('cart-checkout')
    .addEventListener('click', openCheckout)
  document.getElementById('cart-clear').addEventListener('click', function () {
    if (cartItems.length > 0) {
      cartItems = []
      updateCartUI()
      showNotification('Carrinho limpo!', 'info')
    }
  })

  // ========== CHECKOUT ==========
  document
    .getElementById('checkout-close')
    .addEventListener('click', closeCheckout)
  document
    .getElementById('checkout-overlay')
    .addEventListener('click', closeCheckout)

  // ✨ NOVO: Evento para calcular distância
  document
    .getElementById('calculate-distance-btn')
    .addEventListener('click', calculateDeliveryDistance)

  // Permitir Enter no input de distância
  document
    .getElementById('delivery-distance')
    .addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        calculateDeliveryDistance()
      }
    })

  // ========== PAGAMENTO ==========
  document.querySelectorAll('.payment-option').forEach((option) => {
    option.addEventListener('click', function () {
      selectPaymentMethod(this.dataset.method)
    })
  })

  document
    .getElementById('confirm-payment')
    .addEventListener('click', processPayment)

  // ========== FILTRO DE CATEGORIAS ==========
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

  // ========== MENU MOBILE ==========
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

  // ========== FORMULÁRIO DE CONTATO ==========
  document
    .getElementById('contact-form')
    .addEventListener('submit', function (e) {
      e.preventDefault()

      const success = document.getElementById('form-success')
      success.classList.remove('hidden')

      this.reset()

      setTimeout(() => success.classList.add('hidden'), 3000)
    })

  // ========== SCROLL SUAVE ==========
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()

      const target = document.querySelector(this.getAttribute('href'))

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        document.getElementById('mobile-menu').classList.add('hidden')
      }
    })
  })

  // ========== INICIALIZAÇÃO ==========
  renderProducts()
  updateCartUI()

  if (window.elementSdk) {
    console.log('✓ SDK do Canva carregado')

    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues,
    })
  } else {
    console.warn('⚠ SDK do Canva não disponível')
  }
})
