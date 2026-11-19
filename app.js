const searchInput = document.querySelector('#product-search')
const categoryButtons = [...document.querySelectorAll('.filter-button')]
const products = [...document.querySelectorAll('.product')]
const resultsCount = document.querySelector('#results-count')
const emptyResults = document.querySelector('#empty-results')
const bagCount = document.querySelector('#bag-count')
const bagEmpty = document.querySelector('#bag-empty')
const bagItems = document.querySelector('#bag-items')
const bagTotal = document.querySelector('#bag-total')
const checkoutStart = document.querySelector('#checkout-start')
const checkoutForm = document.querySelector('#checkout-form')
const checkoutStatus = document.querySelector('#checkout-status')

let activeCategory = 'all'
const cart = new Map()

function filterProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase()
  let visibleCount = 0

  for (const product of products) {
    const matchesCategory = activeCategory === 'all' || product.dataset.category === activeCategory
    const matchesSearch = product.textContent.toLocaleLowerCase().includes(query)
    const isVisible = matchesCategory && matchesSearch

    product.hidden = !isVisible
    if (isVisible) visibleCount += 1
  }

  resultsCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'piece' : 'pieces'}`
  emptyResults.hidden = visibleCount > 0
}

function formatPrice(amount) {
  return `KSh ${amount.toLocaleString('en-KE')}`
}

function renderCart() {
  bagItems.replaceChildren()

  let totalItems = 0
  let totalPrice = 0

  for (const [id, item] of cart) {
    totalItems += item.quantity
    totalPrice += item.price * item.quantity

    const row = document.createElement('li')
    row.className = 'bag-item'

    const name = document.createElement('span')
    name.className = 'bag-item-name'
    name.textContent = item.name

    const price = document.createElement('span')
    price.className = 'bag-item-price'
    price.textContent = formatPrice(item.price * item.quantity)

    const quantity = document.createElement('div')
    quantity.className = 'quantity-controls'
    quantity.setAttribute('aria-label', `${item.name} quantity`)

    const decrease = document.createElement('button')
    decrease.type = 'button'
    decrease.textContent = '−'
    decrease.setAttribute('aria-label', `Remove one ${item.name}`)
    decrease.addEventListener('click', () => {
      if (item.quantity === 1) {
        cart.delete(id)
      } else {
        item.quantity -= 1
      }
      renderCart()
    })

    const count = document.createElement('span')
    count.textContent = String(item.quantity)

    const increase = document.createElement('button')
    increase.type = 'button'
    increase.textContent = '+'
    increase.setAttribute('aria-label', `Add one ${item.name}`)
    increase.addEventListener('click', () => {
      item.quantity += 1
      renderCart()
    })

    quantity.append(decrease, count, increase)
    row.append(name, price, quantity)
    bagItems.append(row)
  }

  bagEmpty.hidden = totalItems > 0
  bagCount.textContent = totalItems === 0
    ? 'Your bag is empty'
    : `${totalItems} ${totalItems === 1 ? 'piece' : 'pieces'} in your bag`
  bagTotal.hidden = totalItems === 0
  bagTotal.textContent = `Subtotal: ${formatPrice(totalPrice)}`
  checkoutStart.disabled = totalItems === 0

  if (totalItems === 0) {
    checkoutForm.hidden = true
    checkoutStatus.textContent = ''
  }
}

for (const product of products) {
  const addButton = product.querySelector('.add-button')

  addButton.addEventListener('click', () => {
    const id = product.dataset.product
    const item = cart.get(id)

    if (item) {
      item.quantity += 1
    } else {
      cart.set(id, {
        name: product.querySelector('h3').textContent,
        price: Number(product.dataset.price),
        quantity: 1
      })
    }

    checkoutStatus.textContent = ''
    renderCart()
  })
}

checkoutStart.addEventListener('click', () => {
  checkoutForm.hidden = false
  checkoutForm.querySelector('input').focus()
})

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault()
  checkoutStatus.textContent = 'Your details are ready to review. No order has been placed and no payment has been processed.'
})

searchInput.addEventListener('input', filterProducts)

for (const button of categoryButtons) {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category

    for (const categoryButton of categoryButtons) {
      const isActive = categoryButton === button
      categoryButton.classList.toggle('is-active', isActive)
      categoryButton.setAttribute('aria-pressed', String(isActive))
    }

    filterProducts()
    renderCart()
  })
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.focus()
  }
})

filterProducts()
