async function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const itemsContainer = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p>Ваша корзина пуста</p>';
    if (totalContainer) totalContainer.textContent = '';
    return;
  }

  try {
    const productPromises = cart.map(item =>
      fetch(`${API_URL}product/${item.id}?api_key=${encodeURIComponent(api_key)}`)
        .then(res => {
          return res.json().then(product => ({ ...product, quantity: item.quantity }));
        })
    );

    const products = await Promise.all(productPromises);

    const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

    itemsContainer.innerHTML = products.map(p => `
    <div class="cart-item" onclick="openProductPage(${p.id})">
        <img src="${p.img}" alt="${p.name}" class="cart-item__img">
        <div class="cart-item__info">
        <strong>${p.name}</strong><br>
        Цена: ${p.price} ₽<br>
        Кол-во:
        <button type="button" onclick="event.stopPropagation(); changeQuantity(${p.id}, -1)">-</button>
        ${p.quantity}
        <button type="button" onclick="event.stopPropagation(); changeQuantity(${p.id}, 1)">+</button>
        <div class="cart-item__total">Сумма: ${p.price * p.quantity} ₽</div>
        </div>
        <button class="cart-item__remove" type="button" onclick="event.stopPropagation(); removeFromCart(${p.id})">
        Удалить
        </button>
    </div>
    `).join('');

    if (totalContainer) {
      totalContainer.innerHTML = `<h3>Итого: ${total} ₽</h3>`;
    }

  } catch (err) {
    itemsContainer.innerHTML = '<p>Не удалось загрузить товары из корзины</p>';
  }
}

function changeQuantity(productId, num) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity += num;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
  }
}

function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCartItems();
}

function openProductPage(productId) {
  window.location.href = `product.html?id=${productId}`;
}

window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;

loadCartItems();