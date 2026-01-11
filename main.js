const categoriesContainer = document.getElementById('select-category');
const productsContainer = document.getElementsByClassName('products')[0];
const pagesContainer = document.getElementsByClassName('pages')[0];

async function loadCategories() {
    try {
        const params = new URLSearchParams({
            api_key: api_key,
        });

        const response = await fetch(`${API_URL}category?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Ошибка загрузки');

        const categories = await response.json();

        categories.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = element.name;
            categoriesContainer.appendChild(option);
        });

        categoriesContainer.addEventListener('change', (e) => {
            const categoryId = Number(e.target.value);
            loadProducts(1, categoryId);
        });
    }
    catch (err) {
        console.error('Не удалось загрузить категории:', err);
    }
}

async function loadProducts(page = 1, category_id = 0) {
    try {
        const params = new URLSearchParams({
            api_key: api_key,
            page: page,
            category_id: category_id,
        });

        const response = await fetch(`${API_URL}product?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Ошибка загрузки');

        const products = await response.json();

        productsContainer.innerHTML = '';

        products.items.forEach(element => {
            const productEl = document.createElement('div');
            productEl.className = 'product';

            productEl.innerHTML = `
            <div class="product" onclick="openProductPage(${element.id})">
                <img src="${element.img}" alt="${element.name}">
                <h3>${element.name}</h3>
                <p class="price">${element.price} ₽</p>
                <p>⭐ ${element.rating}</p>
                <p><button type="button" onclick="event.stopPropagation(); addToCart(${element.id})">В корзину</button></p>
            </div>
        `;

            productsContainer.appendChild(productEl);
        });

        loadPages(page, products.total_pages, category_id)
    }
    catch (err) {
        productsContainer.innerHTML = '<p>Не удалось загрузить товары.</p>';
        console.error(err);
    }
}

function loadPages(page, total_pages, category_id) {
    let buttonsHTML;
    if (page === 1) {
        buttonsHTML = `
            <div class="page-buttons">
                <button class="disable">Назад</button>
                <button onclick="loadProducts(${page + 1}, ${category_id})">Вперед</button>
            </div>
        `;
    }
    else if (page === total_pages) {
        buttonsHTML = `
            <div class="page-buttons">
                <button id="BTNback" onclick="loadProducts(${page - 1}, ${category_id})">Назад</button>
                <button class="disable" id="BTNnext">Вперед</button>
            </div>
        `;
    }
    else {
        buttonsHTML = `
            <div class="page-buttons">
                <button id="BTNback" onclick="loadProducts(${page - 1}, ${category_id})">Назад</button>
                <button id="BTNnext" onclick="loadProducts(${page + 1}, ${category_id})">Вперед</button>
            </div>
        `;
    }

    pagesContainer.innerHTML = `
            <h3>< ${page} / ${total_pages} ></h3>
            ${buttonsHTML}
    `;
}

function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  const notification = document.createElement('div');
  notification.innerHTML = `
    Товар добавлен в корзину!
    <button style="
      background: none;
      border: none;
      color: white;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      font-size: 16px;
      margin-left: 10px;
    ">&times;</button>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 40px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: sans-serif;
  `;

  const closeBtn = notification.querySelector('button');
  closeBtn.onclick = () => notification.remove();

  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 2000);

  document.body.appendChild(notification);
}

function openProductPage(productId) {
  window.location.href = `product.html?id=${productId}`;
}

window.addToCart = addToCart;
window.loadPages = loadPages;

loadCategories();
loadProducts();