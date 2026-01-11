const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

if (!productId || isNaN(productId)) {
  document.getElementById('product-detail').innerHTML = '<p>Неверный ID товара</p>';
} else {
  loadProduct(productId);
}

async function loadProduct(id) {
  try {
    const res = await fetch(`${API_URL}product/${id}?api_key=${encodeURIComponent(api_key)}`);
    
    if (!res.ok) {
      throw new Error('Товар не найден');
    }

    const product = await res.json();

    document.getElementById('product-detail').innerHTML = `
      <div class="product-full">
        <img src="${product.img}" alt="${product.name}" class="product-full__img">
        <div class="product-full__info">
          <h1>${product.name}</h1>
          <p class="price">${product.price} ₽</p>
          <p>⭐ ${product.rating} (${product.rating_count} отзывов)</p>
          <p>${product.description || 'Описание отсутствует'}</p>
          <button onclick="addToCart(${product.id})">В корзину</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById('product-detail').innerHTML = '<p>Ошибка загрузки товара</p>';
  }
}

// Функция добавления в корзину (та же, что и в каталоге)
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item.id === productId);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  showNotification('Товар добавлен в корзину!');
}

// Уведомление (упрощённая версия)
function showNotification(text) {
  const notif = document.createElement('div');
  notif.textContent = text;
  notif.style.cssText = `
    position: fixed;
    top: 40px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    font-family: sans-serif;
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}