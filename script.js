// Products list
const products = [
    { id: 1, name: "Tie-Dye Lounge Set", price: 150.00, image: "asset/product-1.jpg" },
    { id: 2, name: "Sunburst Tracksuit", price: 150.00, image: "asset/product-2.jpg" },
    { id: 3, name: "Retro Red Streetwear", price: 150.00, image: "asset/product-3.jpg" },
    { id: 4, name: "Urban Sportwear Combo", price: 150.00, image: "asset/product-4.jpg" },
    { id: 5, name: "Oversized Knit & Coat", price: 150.00, image: "asset/product-5.jpg" },
    { id: 6, name: "Chic Monochrome Blazer", price: 150.00, image: "asset/product-6.jpg" }
];


const DISCOUNT_THRESHOLD = 3;
const DISCOUNT_RATE = 0.30;

let bundleItems = [];

// DOM elements
let productsGrid, bundleItemsContainer, progressFill,
    subtotalElement, discountRow, discountAmount,
    proceedBtn, proceedText;

// Initialize the app after DOM loads
document.addEventListener('DOMContentLoaded', init);

function init() {
    productsGrid = document.getElementById('productsGrid');
    bundleItemsContainer = document.getElementById('bundleItems');
    progressFill = document.getElementById('progressFill');
    subtotalElement = document.getElementById('subtotal');
    discountRow = document.getElementById('discountRow');
    discountAmount = document.getElementById('discountAmount');
    proceedBtn = document.getElementById('proceedBtn');
    proceedText = document.getElementById('proceedText');

    renderProducts();
    updateBundle();
}

function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.backgroundColor='#e0e0e0'; this.alt='Product Image';">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toFixed(2)}</p>
                <button class="add-to-bundle-btn" onclick="toggleProduct(${product.id})">
                    <span>Add to Bundle</span>
                    <span class="plus-icon">+</span>
                    <span class="check-icon">✓</span>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleProduct(productId) {
    const product = products.find(p => p.id === productId);
    const existingIndex = bundleItems.findIndex(item => item.id === productId);
    const button = document.querySelector(`[onclick="toggleProduct(${productId})"]`);

    if (existingIndex > -1) {
        bundleItems.splice(existingIndex, 1);
        button.classList.remove('added');
        button.querySelector('span').textContent = 'Add to Bundle';
    } else {
        bundleItems.push({ ...product, quantity: 1 });
        button.classList.add('added');
        button.querySelector('span').textContent = 'Added to Bundle';
    }

    updateBundle();
}

function updateQuantity(productId, change) {
    const itemIndex = bundleItems.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        bundleItems[itemIndex].quantity += change;
        if (bundleItems[itemIndex].quantity <= 0) {
            removeFromBundle(productId);
        } else {
            updateBundle();
        }
    }
}

function removeFromBundle(productId) {
    bundleItems = bundleItems.filter(item => item.id !== productId);
    const button = document.querySelector(`[onclick="toggleProduct(${productId})"]`);
    if (button) {
        button.classList.remove('added');
        button.querySelector('span').textContent = 'Add to Bundle';
    }
    updateBundle();
}

function updateBundle() {
    updateProgress();
    renderBundleItems();
    updateSummary();
    updateProceedButton();
}

function updateProgress() {
    const totalItems = bundleItems.reduce((sum, item) => sum + item.quantity, 0);
    const progress = Math.min((totalItems / DISCOUNT_THRESHOLD) * 100, 100);
    progressFill.style.width = `${progress}%`;

    const progressLabel = document.getElementById('progressLabel');
    progressLabel.textContent = `${totalItems}/${DISCOUNT_THRESHOLD} added`;
}

function renderBundleItems() {
    bundleItemsContainer.classList.remove('empty');
    const maxSlots = 3;
    let html = '';

    for (let i = 0; i < maxSlots; i++) {
        const item = bundleItems[i];
        if (item) {
            html += `
                <div class="bundle-slot">
                    <div class="product-box">
                        <img src="${item.image}" alt="${item.name}" class="bundle-item-image" onerror="this.style.backgroundColor='#e0e0e0'; this.alt='Product';">
                    </div>
                    <div class="description-box">
                        <div class="bundle-item-name">${item.name}</div>
                        <div class="bundle-item-price">${item.price.toFixed(2)}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="delete-btn" onclick="removeFromBundle(${item.id})">🗑</button>
                </div>
            `;
        } else {
            html += `
                <div class="bundle-slot empty">
                    <div style="width: 60px; height: 60px; background-color: #f6f5f4ff;"></div>
                    <div style="background-color: #f6f5f4ff; height: 60px; width: 80%;"></div>
                </div>
            `;
        }
    }

    bundleItemsContainer.innerHTML = html;
}

function updateSummary() {
    const totalItems = bundleItems.reduce((sum, item) => sum + item.quantity, 0);
    const originalTotal = bundleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = 0;
    let finalTotal = originalTotal;

    if (totalItems >= DISCOUNT_THRESHOLD) {
        discount = originalTotal * DISCOUNT_RATE;
        finalTotal = originalTotal - discount;
        discountAmount.textContent = `- $${discount.toFixed(2)}`;
        discountRow.style.opacity = '1';
    } else {
        discountAmount.textContent = `- $0.00`;
        discountRow.style.opacity = '0.5';
    }

    subtotalElement.textContent = `$${finalTotal.toFixed(2)}`;
}

function updateProceedButton() {
    const totalItems = bundleItems.reduce((sum, item) => sum + item.quantity, 0);
    proceedText.textContent = 'Add 3 Items to Proceed';

    if (totalItems >= DISCOUNT_THRESHOLD) {
        proceedBtn.disabled = false;
        proceedBtn.classList.remove('completed');
        proceedText.textContent = `Add ${totalItems} Items to cart`;
        proceedBtn.onclick = completeBundle;
    } else {
        proceedBtn.disabled = true;
        proceedBtn.classList.remove('completed');
        proceedBtn.onclick = null;
    }
}

function completeBundle() {
    proceedBtn.classList.add('completed');
    proceedText.textContent = 'Added to Cart';
    proceedBtn.disabled = true;
    proceedBtn.onclick = null;

    const bundleDetails = {
        items: bundleItems,
        totalItems: bundleItems.reduce((sum, item) => sum + item.quantity, 0),
        originalTotal: bundleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        discount: bundleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * DISCOUNT_RATE,
        finalTotal: bundleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - DISCOUNT_RATE)
    };

    console.log('Bundle:', bundleDetails);
}
