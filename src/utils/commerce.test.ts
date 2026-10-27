import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePurchaseIntent,
  validateCheckoutInput,
  buildPayPalOrderPayload,
  extractApprovalUrl,
  generateFallbackAuraResponse,
  resolveProductDetails,
  CURATED_GADGETS,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  calculateCartSummary,
  CartItem,
  WishlistItem,
  toggleWishlistItem,
  removeFromWishlist,
  isProductInWishlist,
  moveWishlistItemToCart,
  moveAllWishlistToCart,
  filterCatalogProducts,
  filterOrders,
} from './commerce';

test('parsePurchaseIntent detects raw purchase JSON accurately', () => {
  const raw = '{"intent": "purchase", "item": "Aether ANC-1 Studio Headphones", "price": 349}';
  const parsed = parsePurchaseIntent(raw);
  assert.deepEqual(parsed, {
    intent: 'purchase',
    item: 'Aether ANC-1 Studio Headphones',
    price: 349,
  });
});

test('parsePurchaseIntent handles markdown-fenced JSON gracefully', () => {
  const fenced = '```json\n{"intent": "purchase", "item": "Chrono Titanium Pro Watch", "price": 429.99}\n```';
  const parsed = parsePurchaseIntent(fenced);
  assert.deepEqual(parsed, {
    intent: 'purchase',
    item: 'Chrono Titanium Pro Watch',
    price: 429.99,
  });
});

test('parsePurchaseIntent returns null for regular conversational messages', () => {
  const chatMsg = 'The Aether ANC-1 Studio Headphones cost $349 and have 60 hours of battery life.';
  assert.equal(parsePurchaseIntent(chatMsg), null);
});

test('validateCheckoutInput validates required item and positive price', () => {
  const valid = validateCheckoutInput({ item: 'Lumina Air AR Smart Glasses', price: 599 });
  assert.equal(valid.valid, true);
  assert.equal(valid.item, 'Lumina Air AR Smart Glasses');
  assert.equal(valid.price, 599);

  const emptyItem = validateCheckoutInput({ item: '   ', price: 100 });
  assert.equal(emptyItem.valid, false);

  const negativePrice = validateCheckoutInput({ item: 'Headphones', price: -20 });
  assert.equal(negativePrice.valid, false);

  const nanPrice = validateCheckoutInput({ item: 'Headphones', price: 'free' });
  assert.equal(nanPrice.valid, false);
});

test('buildPayPalOrderPayload formats CAPTURE intent and 2-decimal USD amount', () => {
  const payload = buildPayPalOrderPayload('Tactile 65 CNC Mechanical Keyboard', 249, 'http://localhost:3000');
  assert.equal(payload.intent, 'CAPTURE');
  assert.equal(payload.purchase_units.length, 1);
  assert.equal(payload.purchase_units[0].description, 'Tactile 65 CNC Mechanical Keyboard');
  assert.equal(payload.purchase_units[0].amount.currency_code, 'USD');
  assert.equal(payload.purchase_units[0].amount.value, '249.00');
});

test('extractApprovalUrl finds the approve link from PayPal links array', () => {
  const mockPayPalResponse = {
    id: '5O190127TN364715T',
    status: 'CREATED',
    links: [
      {
        href: 'https://api-m.sandbox.paypal.com/v2/checkout/orders/5O190127TN364715T',
        rel: 'self',
        method: 'GET',
      },
      {
        href: 'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T',
        rel: 'approve',
        method: 'GET',
      },
    ],
  };

  assert.equal(
    extractApprovalUrl(mockPayPalResponse),
    'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T'
  );
  assert.equal(extractApprovalUrl({ links: [] }), null);
});

test('generateFallbackAuraResponse returns raw JSON when user states purchase intent', () => {
  const reply = generateFallbackAuraResponse('I want to buy the Aether ANC-1 Studio Headphones');
  const parsed = parsePurchaseIntent(reply);
  assert.ok(parsed);
  assert.equal(parsed.intent, 'purchase');
  assert.equal(parsed.item, 'Aether ANC-1 Studio Headphones');
  assert.equal(parsed.price, 349);
});

test('generateFallbackAuraResponse returns natural chat for general gadget inquiries', () => {
  const reply = generateFallbackAuraResponse('Tell me about your best wireless headphones');
  assert.equal(parsePurchaseIntent(reply), null);
  assert.ok(reply.includes('Aether ANC-1 Studio Headphones'));
});

test('resolveProductDetails maps items to studio product images and falls back cleanly', () => {
  const headphones = resolveProductDetails('Aether ANC-1 Studio Headphones');
  assert.equal(headphones.imageUrl, '/images/aether-headphones.svg');
  assert.equal(headphones.category, 'Spatial Audio');

  const watch = resolveProductDetails('Chrono Titanium Pro Watch');
  assert.equal(watch.imageUrl, '/images/chrono-watch.svg');

  const custom = resolveProductDetails('Quantum Drone X1');
  assert.equal(custom.imageUrl, '/images/default-gadget.svg');
});

test('Shopping Cart pure functions manage items, quantities, and multi-item totals', () => {
  let cart: CartItem[] = [];
  const g1 = CURATED_GADGETS[0]; // Aether ANC-1 ($349)
  const g2 = CURATED_GADGETS[1]; // Chrono Watch ($429)

  cart = addToCart(cart, g1, 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  // Adding same item increments quantity
  cart = addToCart(cart, g1, 2);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);

  // Add second item
  cart = addToCart(cart, g2, 1);
  assert.equal(cart.length, 2);

  const summary = calculateCartSummary(cart);
  assert.equal(summary.totalItems, 4);
  assert.equal(summary.subtotal, 349 * 3 + 429); // 1047 + 429 = 1476
  assert.ok(summary.summaryTitle.includes('Aether ANC-1 Studio Headphones'));
  assert.ok(summary.specsSummary.includes('Chrono Titanium Pro Watch ×1'));

  // Decrement quantity
  cart = updateCartQuantity(cart, g1.id, -2);
  assert.equal(cart[0].quantity, 1);

  // Remove item
  cart = removeFromCart(cart, g2.id);
  assert.equal(cart.length, 1);
  assert.equal(calculateCartSummary(cart).subtotal, 349);
});

test('Wishlist pure functions toggle, remove, and move saved products into the Shopping Cart', () => {
  let wishlist: WishlistItem[] = [];
  let cart: CartItem[] = [];
  const g1 = CURATED_GADGETS[0]; // Aether ANC-1 ($349)
  const g2 = CURATED_GADGETS[2]; // Lumina Air AR ($599)

  // Toggle on adds product
  wishlist = toggleWishlistItem(wishlist, g1);
  assert.equal(wishlist.length, 1);
  assert.equal(isProductInWishlist(wishlist, g1.id), true);

  // Toggle second product
  wishlist = toggleWishlistItem(wishlist, g2);
  assert.equal(wishlist.length, 2);

  // Toggle g1 again removes it
  wishlist = toggleWishlistItem(wishlist, g1);
  assert.equal(wishlist.length, 1);
  assert.equal(isProductInWishlist(wishlist, g1.id), false);

  // Re-add g1 and move single item to cart
  wishlist = toggleWishlistItem(wishlist, g1);
  const movedOne = moveWishlistItemToCart(wishlist, cart, g1.id);
  wishlist = movedOne.wishlist;
  cart = movedOne.cart;
  assert.equal(wishlist.length, 1);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].id, g1.id);

  // Move all remaining wishlist items to cart
  const movedAll = moveAllWishlistToCart(wishlist, cart);
  wishlist = movedAll.wishlist;
  cart = movedAll.cart;
  assert.equal(wishlist.length, 0);
  assert.equal(cart.length, 2);
  assert.equal(calculateCartSummary(cart).subtotal, 349 + 599);

  // Explicit removeFromWishlist
  wishlist = toggleWishlistItem(wishlist, g2);
  wishlist = removeFromWishlist(wishlist, g2.id);
  assert.equal(wishlist.length, 0);
});

test('filterCatalogProducts filters across 26 online shopping products by category and search query', () => {
  assert.equal(CURATED_GADGETS.length, 26);
  for (const gadget of CURATED_GADGETS) {
    assert.ok(
      gadget.imageUrl.startsWith('/images/') && gadget.imageUrl.endsWith('.svg'),
      `Expected ${gadget.id} to have a studio SVG image in /images/*.svg, got ${gadget.imageUrl}`
    );
  }

  const allItems = filterCatalogProducts(CURATED_GADGETS, 'All Categories', '');
  assert.equal(allItems.length, CURATED_GADGETS.length);

  const fashionItems = filterCatalogProducts(CURATED_GADGETS, 'Fashion & Apparel', '');
  assert.equal(fashionItems.length, 3);
  assert.ok(fashionItems.some((item) => item.name.includes('Merino Wool Overcoat')));

  const espressoSearch = filterCatalogProducts(CURATED_GADGETS, 'All Categories', 'espresso');
  assert.equal(espressoSearch.length, 1);
  assert.equal(espressoSearch[0].category, 'Home & Kitchen');
  assert.equal(espressoSearch[0].price, 699);

  const sneakerSearch = filterCatalogProducts(CURATED_GADGETS, 'Footwear & Sneakers', 'carbon');
  assert.equal(sneakerSearch.length, 1);
  assert.equal(sneakerSearch[0].name, 'AeroStride Carbon Marathon Sneakers');
});

test('Order Tracking pure functions initialize shipping milestones and advance delivery updates to Delivered', async () => {
  const { createOrderTrackingInfo, advanceOrderTrackingStep } = await import('./commerce');
  let tracking = createOrderTrackingInfo('EC-AURA-987654', 1);

  assert.equal(tracking.trackingNumber, 'AURA-TRK-RA987654');
  assert.equal(tracking.currentStepIndex, 1);
  assert.equal(tracking.currentStatusLabel, 'Packed & Insured');
  assert.equal(tracking.progressPercent, 40);
  assert.equal(tracking.milestones.length, 5);
  assert.equal(tracking.milestones[0].state, 'completed');
  assert.equal(tracking.milestones[1].state, 'current');
  assert.equal(tracking.milestones[2].state, 'upcoming');

  // Advance to Shipped · In Transit
  tracking = advanceOrderTrackingStep(tracking);
  assert.equal(tracking.currentStepIndex, 2);
  assert.equal(tracking.currentStatusLabel, 'Shipped · In Transit');
  assert.equal(tracking.progressPercent, 65);

  // Advance to Out for Delivery
  tracking = advanceOrderTrackingStep(tracking);
  assert.equal(tracking.currentStepIndex, 3);
  assert.equal(tracking.currentStatusLabel, 'Out for Delivery');
  assert.equal(tracking.progressPercent, 85);

  // Advance to Delivered
  tracking = advanceOrderTrackingStep(tracking);
  assert.equal(tracking.currentStepIndex, 4);
  assert.equal(tracking.currentStatusLabel, 'Delivered');
  assert.equal(tracking.progressPercent, 100);
  assert.ok(tracking.estimatedDelivery.includes('Delivered'));

  // Advancing past Delivered stays at Delivered
  const afterDelivered = advanceOrderTrackingStep(tracking);
  assert.equal(afterDelivered.currentStepIndex, 4);
  assert.equal(afterDelivered.progressPercent, 100);
});

test('filterOrders filters active orders by product name or order ID accurately', () => {
  const sampleOrders = [
    {
      orderId: 'ORD-98765-ABC',
      item: 'Aether ANC-1 Studio Headphones',
      specs: '45mm Beryllium Drivers',
      price: 349,
      status: 'COMPLETED',
      tracking: {
        trackingNumber: 'AURA-TRK-98765ABC',
        currentStatusLabel: 'Shipped · In Transit',
      },
    },
    {
      orderId: 'ORD-11223-XYZ',
      item: 'Chrono Titanium Pro Watch',
      specs: 'Sapphire Crystal · ECG Monitor',
      price: 429,
      status: 'CREATED',
    },
    {
      orderId: 'ORD-44556-BUNDLE',
      item: 'Cart Bundle (2 items): Lumina Air AR Smart Glasses + Cyberdeck 40 mechanical keyboard',
      specs: 'Lumina Air AR Smart Glasses ×1, Cyberdeck 40 ×1',
      price: 848,
      status: 'COMPLETED',
      tracking: {
        trackingNumber: 'AURA-TRK-44556BUN',
        currentStatusLabel: 'Out for Delivery',
      },
    },
  ];

  // Empty or whitespace query returns all orders
  assert.equal(filterOrders(sampleOrders, '').length, 3);
  assert.equal(filterOrders(sampleOrders, '   ').length, 3);

  // Filter by exact or partial order ID (case-insensitive)
  const byId = filterOrders(sampleOrders, 'ord-11223');
  assert.equal(byId.length, 1);
  assert.equal(byId[0].orderId, 'ORD-11223-XYZ');

  const byIdUpper = filterOrders(sampleOrders, '98765-ABC');
  assert.equal(byIdUpper.length, 1);
  assert.equal(byIdUpper[0].item, 'Aether ANC-1 Studio Headphones');

  // Filter by product name
  const byName = filterOrders(sampleOrders, 'Headphones');
  assert.equal(byName.length, 1);
  assert.equal(byName[0].orderId, 'ORD-98765-ABC');

  // Filter by product name inside cart bundle
  const byBundleItem = filterOrders(sampleOrders, 'Lumina Air');
  assert.equal(byBundleItem.length, 1);
  assert.equal(byBundleItem[0].orderId, 'ORD-44556-BUNDLE');

  // Filter by tracking number
  const byTracking = filterOrders(sampleOrders, 'TRK-98765');
  assert.equal(byTracking.length, 1);
  assert.equal(byTracking[0].orderId, 'ORD-98765-ABC');

  // Filter by transaction status
  const byCompleted = filterOrders(sampleOrders, 'completed');
  assert.equal(byCompleted.length, 2);

  // Non-matching query returns empty list
  const noMatches = filterOrders(sampleOrders, 'non-existent-gadget-xyz');
  assert.equal(noMatches.length, 0);
});

test('Vercel resilient fallback handles Chrono Titanium Pro Watch purchase prompt and creates PayPal checkout order', async () => {
  const { createFallbackCheckoutOrder } = await import('./commerce');

  // Exact prompt from user screenshot on Vercel
  const userPrompt = 'I want to buy the Chrono Titanium Pro Watch for $429';
  const fallbackReply = generateFallbackAuraResponse(userPrompt);
  const parsedIntent = parsePurchaseIntent(fallbackReply);

  assert.ok(parsedIntent, 'Expected purchase intent JSON from fallback engine');
  assert.equal(parsedIntent.intent, 'purchase');
  assert.equal(parsedIntent.item, 'Chrono Titanium Pro Watch');
  assert.equal(parsedIntent.price, 429);

  // Short chip prompt "Buy Watch ($429)"
  const shortChipReply = generateFallbackAuraResponse('Buy Watch ($429)');
  const parsedChipIntent = parsePurchaseIntent(shortChipReply);
  assert.ok(parsedChipIntent, 'Expected purchase intent JSON from short chip prompt');
  assert.equal(parsedChipIntent.item, 'Chrono Titanium Pro Watch');
  assert.equal(parsedChipIntent.price, 429);

  // Client-side fallback checkout order generator
  const checkoutOrder = createFallbackCheckoutOrder(parsedIntent.item, parsedIntent.price);
  assert.ok(checkoutOrder.orderId.startsWith('EC-AURA-'));
  assert.ok(checkoutOrder.approveUrl.includes('sandbox.paypal.com/checkoutnow?token='));
  assert.equal(checkoutOrder.item, 'Chrono Titanium Pro Watch');
  assert.equal(checkoutOrder.price, 429);
  assert.equal(checkoutOrder.imageUrl, '/images/chrono-watch.svg');
  assert.equal(checkoutOrder.status, 'CREATED');
});

