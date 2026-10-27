export interface PurchaseIntent {
  intent: 'purchase';
  item: string;
  price: number;
}

export interface GadgetItem {
  id: string;
  name: string;
  category: string;
  price: number;
  specs: string;
  stockStatus: string;
  imageUrl: string;
  keywords: string[];
  svgType?: string;
}

export interface ResolvedProductDetails {
  imageUrl: string;
  category: string;
  specs: string;
}

export const AURA_SYSTEM_INSTRUCTION =
  'You are Aura, a helpful online shopping assistant. Chat naturally about products across electronics, fashion, footwear, home & kitchen, beauty, fitness, gaming, and travel accessories. When the user explicitly states they want to buy a specific item, stop conversing and reply ONLY with a raw JSON object in this format: {"intent": "purchase", "item": "[Item Name]", "price": [Price in USD as a number]}. Do not include markdown formatting or extra text.';

export function createProductSvgDataUri(
  label: string,
  category: string,
  accentHex: string,
  secondaryHex: string,
  iconPath: string
): string {
  const escapeXml = (str: string) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  const safeCategory = escapeXml(category.toUpperCase());
  const safeLabel = escapeXml(label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#140d2b"/>
        <stop offset="55%" stop-color="#1e153b"/>
        <stop offset="100%" stop-color="#0d081d"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentHex}"/>
        <stop offset="100%" stop-color="${secondaryHex}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" rx="18" fill="url(#bg)"/>
    <circle cx="320" cy="50" r="85" fill="${accentHex}" opacity="0.14"/>
    <circle cx="80" cy="210" r="95" fill="${secondaryHex}" opacity="0.12"/>
    <rect x="135" y="34" width="130" height="122" rx="26" fill="url(#accent)" opacity="0.18" stroke="${accentHex}" stroke-width="1.5" stroke-opacity="0.5"/>
    <g transform="translate(164, 58) scale(3)" fill="none" stroke="url(#accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
    <rect x="24" y="176" width="352" height="62" rx="12" fill="#090514" opacity="0.78" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="40" y="199" fill="${accentHex}" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1">${safeCategory}</text>
    <text x="40" y="221" fill="#ffffff" font-family="system-ui, sans-serif" font-size="14.5" font-weight="700">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SHOPPING_CATEGORIES = [
  'All Categories',
  'Spatial Audio',
  'Wearables',
  'Spatial Computing',
  'Input Hardware',
  'Electronics & Tech',
  'Fashion & Apparel',
  'Footwear & Sneakers',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Fitness',
  'Gaming & Consoles',
  'Bags & Travel',
] as const;

export const CURATED_GADGETS: GadgetItem[] = [
  {
    id: 'aether-anc-1',
    name: 'Aether ANC-1 Studio Headphones',
    category: 'Spatial Audio',
    price: 349,
    specs: '45mm Beryllium Drivers · 48dB Hybrid ANC · 60h Battery',
    stockStatus: 'In Stock',
    imageUrl: '/images/aether-headphones.svg',
    keywords: ['headphone', 'headphones', 'aether', 'anc', 'anc-1', 'audio', 'earphones', 'sony', 'wh-1000xm5', 'bose', 'airpods max'],
    svgType: 'headphones',
  },
  {
    id: 'chrono-titanium-pro',
    name: 'Chrono Titanium Pro Watch',
    category: 'Wearables',
    price: 429,
    specs: 'Grade 5 Titanium · Dual-Frequency GPS · 14-Day Autonomy',
    stockStatus: 'In Stock',
    imageUrl: '/images/chrono-watch.svg',
    keywords: ['watch', 'smartwatch', 'chrono', 'titanium', 'wearable', 'apple watch', 'garmin'],
    svgType: 'smartwatch',
  },
  {
    id: 'lumina-air-ar',
    name: 'Lumina Air AR Smart Glasses',
    category: 'Spatial Computing',
    price: 599,
    specs: 'Micro-OLED 120Hz Waveguide · 68g Magnesium Frame · Directional Acoustic Chambers',
    stockStatus: 'Limited Run',
    imageUrl: '/images/lumina-glasses.svg',
    keywords: ['glasses', 'ar', 'lumina', 'smart glasses', 'spatial', 'goggles', 'headset', 'vr'],
    svgType: 'glasses',
  },
  {
    id: 'tactile-65-cnc',
    name: 'Tactile 65 CNC Mechanical Keyboard',
    category: 'Input Hardware',
    price: 249,
    specs: '6063 Bead-Blasted Aluminum · Gasket Mount · Hot-Swap Hall Effect Switches',
    stockStatus: 'In Stock',
    imageUrl: '/images/tactile-keyboard.svg',
    keywords: ['keyboard', 'mechanical', 'tactile', 'cnc', 'keycaps', 'typing'],
    svgType: 'keyboard',
  },
  {
    id: 'novabook-pro-16',
    name: 'NovaBook Pro 16" OLED Laptop',
    category: 'Electronics & Tech',
    price: 1499,
    specs: '12-Core Silicon · 32GB Unified RAM · 1TB NVMe SSD · 4K 120Hz OLED Display',
    stockStatus: 'In Stock',
    imageUrl: '/images/novabook-pro-16.svg',
    keywords: ['laptop', 'novabook', 'notebook', 'macbook', 'computer', 'oled laptop', 'ultrabook'],
  },
  {
    id: 'zenith-x1-smartphone',
    name: 'Zenith X1 Ultra 5G Smartphone',
    category: 'Electronics & Tech',
    price: 999,
    specs: '200MP Periscope Telephoto · 6.8" LTPO AMOLED · 512GB Storage · Titanium Frame',
    stockStatus: 'In Stock',
    imageUrl: '/images/zenith-x1-smartphone.svg',
    keywords: ['phone', 'smartphone', 'zenith', 'mobile', '5g', 'iphone', 'galaxy'],
  },
  {
    id: 'lumix-4k-mirrorless',
    name: 'AetherCam S5 Full-Frame 4K Camera',
    category: 'Electronics & Tech',
    price: 1299,
    specs: '33MP Full-Frame CMOS · 5-Axis IBIS · 4K 60p 10-Bit Internal · 28-70mm f/2.8 Lens',
    stockStatus: 'In Stock',
    imageUrl: '/images/lumix-4k-mirrorless.svg',
    keywords: ['camera', 'mirrorless', 'dslr', 'aethercam', 'lens', 'photography', '4k camera'],
  },
  {
    id: 'nordic-wool-overcoat',
    name: 'Nordic Tailored Merino Wool Overcoat',
    category: 'Fashion & Apparel',
    price: 289,
    specs: '100% Italian Merino Wool · Water-Repellent Finish · Bemberg Satin Lining',
    stockStatus: 'In Stock',
    imageUrl: '/images/nordic-wool-overcoat.svg',
    keywords: ['coat', 'overcoat', 'trench', 'wool', 'jacket', 'fashion', 'apparel', 'clothing', 'menswear', 'womenswear'],
  },
  {
    id: 'kuroki-selvedge-jacket',
    name: 'Kuroki 14oz Selvedge Denim Jacket',
    category: 'Fashion & Apparel',
    price: 179,
    specs: 'Japanese Loomstate Indigo Selvedge · Custom Copper Hardware · Chain-Stitched Hem',
    stockStatus: 'In Stock',
    imageUrl: '/images/kuroki-selvedge-jacket.svg',
    keywords: ['denim', 'jeans', 'jacket', 'selvedge', 'kuroki', 'shirt', 'clothes'],
  },
  {
    id: 'cashmere-crewneck-sweater',
    name: 'Luxe Pure Cashmere Crewneck Sweater',
    category: 'Fashion & Apparel',
    price: 159,
    specs: '100% Grade-A Mongolian 2-Ply Cashmere · Ribbed Trim · Ultra-Soft Breathable Knit',
    stockStatus: 'In Stock',
    imageUrl: '/images/cashmere-crewneck-sweater.svg',
    keywords: ['sweater', 'cashmere', 'knitwear', 'hoodie', 'pullover', 'top', 'apparel'],
  },
  {
    id: 'aerostride-carbon-sneakers',
    name: 'AeroStride Carbon Marathon Sneakers',
    category: 'Footwear & Sneakers',
    price: 189,
    specs: 'Full-Length Carbon Fiber Plate · Nitrogen-Infused Supercritical Foam · Engineered Mesh',
    stockStatus: 'In Stock',
    imageUrl: '/images/aerostride-carbon-sneakers.svg',
    keywords: ['sneakers', 'shoes', 'running shoes', 'aerostride', 'footwear', 'trainers', 'nike', 'adidas'],
  },
  {
    id: 'artisan-chelsea-boots',
    name: 'Artisan Goodyear-Welted Chelsea Boots',
    category: 'Footwear & Sneakers',
    price: 245,
    specs: 'Full-Grain Italian Calfskin · Vibram All-Weather Lug Sole · Cork-Filled Midsole',
    stockStatus: 'In Stock',
    imageUrl: '/images/artisan-chelsea-boots.svg',
    keywords: ['boots', 'chelsea boots', 'leather boots', 'shoes', 'footwear'],
  },
  {
    id: 'cloudcourt-leather-lowtops',
    name: 'CloudCourt Vintage Leather Low-Tops',
    category: 'Footwear & Sneakers',
    price: 135,
    specs: 'Supple Nappa Leather Upper · OrthoLite Memory Foam Footbed · Margom Rubber Cupsole',
    stockStatus: 'In Stock',
    imageUrl: '/images/cloudcourt-leather-lowtops.svg',
    keywords: ['low-tops', 'court shoes', 'casual shoes', 'cloudcourt', 'white sneakers'],
  },
  {
    id: 'barista-dual-boiler-espresso',
    name: 'Barista Pro Dual-Boiler Espresso Machine',
    category: 'Home & Kitchen',
    price: 699,
    specs: '15-Bar Italian Rotary Pump · PID Temperature Control · Integrated Conical Burr Grinder',
    stockStatus: 'In Stock',
    imageUrl: '/images/barista-dual-boiler-espresso.svg',
    keywords: ['espresso', 'coffee', 'coffee maker', 'barista', 'kitchen', 'appliance', 'home'],
  },
  {
    id: 'purevortex-hepa-purifier',
    name: 'PureVortex HEPA-14 Smart Air Purifier',
    category: 'Home & Kitchen',
    price: 279,
    specs: 'Captures 99.99% of 0.1 Micron Allergens · Real-Time Laser PM2.5 Sensor · Whisper 21dB',
    stockStatus: 'In Stock',
    imageUrl: '/images/purevortex-hepa-purifier.svg',
    keywords: ['air purifier', 'hepa', 'purifier', 'purevortex', 'home', 'allergen', 'vacuum'],
  },
  {
    id: 'heritage-cast-iron-dutch-oven',
    name: 'Heritage Enameled Cast Iron Dutch Oven (6 Qt)',
    category: 'Home & Kitchen',
    price: 165,
    specs: 'Triple-Layer French Porcelain Enamel · Self-Basting Lid · Oven-Safe to 500°F',
    stockStatus: 'In Stock',
    imageUrl: '/images/heritage-cast-iron-dutch-oven.svg',
    keywords: ['dutch oven', 'cookware', 'pot', 'pan', 'cast iron', 'kitchen', 'cooking'],
  },
  {
    id: 'lumiere-peptide-serum',
    name: 'Lumière Hyaluronic & Peptide Facial Serum',
    category: 'Beauty & Personal Care',
    price: 68,
    specs: '2% Multi-Molecular Hyaluronic Acid · Copper Tripeptides · Barrier-Restoring Ceramides',
    stockStatus: 'In Stock',
    imageUrl: '/images/lumiere-peptide-serum.svg',
    keywords: ['serum', 'skincare', 'beauty', 'hyaluronic', 'peptide', 'moisturizer', 'cosmetics', 'face'],
  },
  {
    id: 'aeroionic-hair-styler',
    name: 'AeroIonic High-Velocity Ionic Hair Styler',
    category: 'Beauty & Personal Care',
    price: 329,
    specs: '110,000 RPM Brushless Digital Motor · Coanda Smoothing · 3 Magnetic Styling Nozzles',
    stockStatus: 'In Stock',
    imageUrl: '/images/aeroionic-hair-styler.svg',
    keywords: ['hair dryer', 'styler', 'dyson', 'aeroionic', 'hair', 'beauty', 'grooming'],
  },
  {
    id: 'santal-eau-de-parfum',
    name: 'Santal & Cedarwood Eau de Parfum (100ml)',
    category: 'Beauty & Personal Care',
    price: 145,
    specs: 'Australian Sandalwood · Guaiac Wood · Spiced Cardamom · Botanical Extracts',
    stockStatus: 'In Stock',
    imageUrl: '/images/santal-eau-de-parfum.svg',
    keywords: ['perfume', 'fragrance', 'cologne', 'santal', 'parfum', 'scent', 'beauty'],
  },
  {
    id: 'flexbell-adjustable-dumbbells',
    name: 'FlexBell Pro Quick-Select Dumbbells (5–52.5 lbs)',
    category: 'Sports & Fitness',
    price: 389,
    specs: '15 Weight Increments · 1-Second Twist-Dial Adjustment · Machined Steel Plates',
    stockStatus: 'In Stock',
    imageUrl: '/images/flexbell-adjustable-dumbbells.svg',
    keywords: ['dumbbell', 'dumbbells', 'weights', 'gym', 'fitness', 'workout', 'sports'],
  },
  {
    id: 'pulseforge-massage-gun',
    name: 'PulseForge Deep-Tissue Percussion Massager',
    category: 'Sports & Fitness',
    price: 149,
    specs: '16mm Deep Amplitude · QuietGlide 40dB Brushless Motor · 6 Titanium & Silicone Heads',
    stockStatus: 'In Stock',
    imageUrl: '/images/pulseforge-massage-gun.svg',
    keywords: ['massage gun', 'massager', 'theragun', 'recovery', 'pulseforge', 'fitness'],
  },
  {
    id: 'valkyrie-oled-handheld',
    name: 'Valkyrie OLED Portable Gaming Console',
    category: 'Gaming & Consoles',
    price: 549,
    specs: '7.4" HDR OLED 90Hz Display · 1TB NVMe SSD · Hall-Effect Joysticks · Wi-Fi 6E',
    stockStatus: 'In Stock',
    imageUrl: '/images/valkyrie-oled-handheld.svg',
    keywords: ['console', 'gaming', 'handheld', 'steam deck', 'switch', 'valkyrie', 'video game'],
  },
  {
    id: 'apex-elite-controller',
    name: 'Apex Elite Haptic Wireless Controller',
    category: 'Gaming & Consoles',
    price: 169,
    specs: '1000Hz Ultra-Low Latency · Optical Micro-Switch Triggers · 4 Rear Paddles · Dock',
    stockStatus: 'In Stock',
    imageUrl: '/images/apex-elite-controller.svg',
    keywords: ['controller', 'gamepad', 'joystick', 'apex', 'gaming', 'xbox', 'ps5'],
  },
  {
    id: 'voyager-polycarbonate-carryon',
    name: 'Voyager Aerospace Hardshell Carry-On',
    category: 'Bags & Travel',
    price: 265,
    specs: '100% German Makrolon Polycarbonate · Hinomoto 360° Silent Spinner Wheels · Dual TSA Locks',
    stockStatus: 'In Stock',
    imageUrl: '/images/voyager-polycarbonate-carryon.svg',
    keywords: ['luggage', 'suitcase', 'carry-on', 'travel', 'bag', 'voyager', 'baggage'],
  },
  {
    id: 'nomad-ballistic-backpack',
    name: 'Nomad Ballistic Nylon & Leather Backpack',
    category: 'Bags & Travel',
    price: 195,
    specs: '1680D Cordura Ballistic Nylon · Suspended 16" Laptop Vault · YKK AquaGuard Zippers',
    stockStatus: 'In Stock',
    imageUrl: '/images/nomad-ballistic-backpack.svg',
    keywords: ['backpack', 'bag', 'rucksack', 'laptop bag', 'nomad', 'travel'],
  },
  {
    id: 'paperlux-eink-reader',
    name: 'PaperLux 7" Glare-Free E-Ink Reader',
    category: 'Electronics & Tech',
    price: 179,
    specs: '300 PPI Carta 1300 E-Ink · Adjustable Warm Light · IPX8 Waterproof · 10-Week Battery',
    stockStatus: 'In Stock',
    imageUrl: '/images/paperlux-eink-reader.svg',
    keywords: ['kindle', 'ereader', 'e-reader', 'book', 'books', 'paperlux', 'tablet', 'reading'],
  },
];

/**
 * Pure function to filter products by category and search query
 */
export function filterCatalogProducts(
  products: GadgetItem[],
  selectedCategory: string,
  searchQuery: string
): GadgetItem[] {
  const cleanCategory = (selectedCategory || 'All Categories').trim();
  const cleanSearch = (searchQuery || '').trim().toLowerCase();

  return products.filter((item) => {
    const matchesCategory =
      cleanCategory === 'All Categories' ||
      cleanCategory === 'All' ||
      item.category.toLowerCase() === cleanCategory.toLowerCase() ||
      (cleanCategory === 'Electronics & Tech' &&
        ['Spatial Audio', 'Wearables', 'Spatial Computing', 'Input Hardware', 'Electronics & Tech'].includes(
          item.category
        ));

    if (!matchesCategory) return false;
    if (!cleanSearch) return true;

    return (
      item.name.toLowerCase().includes(cleanSearch) ||
      item.category.toLowerCase().includes(cleanSearch) ||
      item.specs.toLowerCase().includes(cleanSearch) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(cleanSearch))
    );
  });
}

/**
 * Resolves the studio product image URL, category, and specs for a given item name
 */
export function resolveProductDetails(itemName: string): ResolvedProductDetails {
  const lower = (itemName || '').trim().toLowerCase();

  for (const gadget of CURATED_GADGETS) {
    if (
      lower.includes(gadget.name.toLowerCase()) ||
      gadget.keywords.some((kw) => lower.includes(kw))
    ) {
      return {
        imageUrl: gadget.imageUrl,
        category: gadget.category,
        specs: gadget.specs,
      };
    }
  }

  return {
    imageUrl: '/images/default-gadget.svg',
    category: 'Flagship Tech Hardware',
    specs: 'Verified Authentic · Express Insured Delivery · 1-Year Warranty',
  };
}

/**
 * Parses a raw response string from Gemini (or fallback) to determine if it contains
 * a purchase intent JSON object: {"intent": "purchase", "item": "[Item Name]", "price": [Price]}
 */
export function parsePurchaseIntent(responseText: string): PurchaseIntent | null {
  if (!responseText || typeof responseText !== 'string') {
    return null;
  }

  const trimmed = responseText.trim();
  const hasIntentMarker =
    trimmed.includes('"intent"') && trimmed.includes('"purchase"');

  if (!hasIntentMarker) {
    return null;
  }

  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const jsonCandidate = cleaned.slice(startIdx, endIdx + 1);
  try {
    const parsed = JSON.parse(jsonCandidate);
    if (
      parsed &&
      parsed.intent === 'purchase' &&
      typeof parsed.item === 'string' &&
      parsed.item.trim().length > 0 &&
      (typeof parsed.price === 'number' || typeof parsed.price === 'string')
    ) {
      const numericPrice = Number(parsed.price);
      if (Number.isFinite(numericPrice) && numericPrice > 0) {
        return {
          intent: 'purchase',
          item: parsed.item.trim(),
          price: Math.round(numericPrice * 100) / 100,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export interface CheckoutValidationResult {
  valid: boolean;
  item?: string;
  price?: number;
  error?: string;
}

/**
 * Validates checkout input payload { item, price }
 */
export function validateCheckoutInput(body: unknown): CheckoutValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const record = body as Record<string, unknown>;
  const rawItem = record.item;
  const rawPrice = record.price;

  if (typeof rawItem !== 'string' || rawItem.trim().length === 0) {
    return { valid: false, error: 'A valid non-empty item name is required.' };
  }

  const numericPrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string' && rawPrice.trim() !== ''
        ? Number(rawPrice)
        : NaN;

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return { valid: false, error: 'A valid positive numeric price in USD is required.' };
  }

  return {
    valid: true,
    item: rawItem.trim(),
    price: Math.round(numericPrice * 100) / 100,
  };
}

/**
 * Builds the standard PayPal v2 Orders API payload (intent: 'CAPTURE', currency: 'USD')
 */
export function buildPayPalOrderPayload(
  item: string,
  price: number,
  appUrl = 'http://localhost:3000'
) {
  const formattedPrice = price.toFixed(2);
  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: item,
        amount: {
          currency_code: 'USD',
          value: formattedPrice,
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: formattedPrice,
            },
          },
        },
        items: [
          {
            name: item,
            unit_amount: {
              currency_code: 'USD',
              value: formattedPrice,
            },
            quantity: '1',
          },
        ],
      },
    ],
    application_context: {
      brand_name: 'Aura Tech Commerce',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${appUrl.replace(/\/$/, '')}/?checkout=approved`,
      cancel_url: `${appUrl.replace(/\/$/, '')}/?checkout=cancelled`,
    },
  };
}

/**
 * Extracts the approval URL from a PayPal v2 Order response object.
 */
export function extractApprovalUrl(orderResponse: unknown): string | null {
  if (!orderResponse || typeof orderResponse !== 'object') {
    return null;
  }

  const links = (orderResponse as { links?: Array<{ href?: string; rel?: string }> }).links;
  if (!Array.isArray(links)) {
    return null;
  }

  const approveLink = links.find(
    (link) =>
      link &&
      typeof link.href === 'string' &&
      (link.rel === 'approve' || link.rel === 'payer-action')
  );

  return approveLink?.href ?? null;
}

export interface CheckoutOrderResult {
  orderId: string;
  item: string;
  price: number;
  imageUrl: string;
  category: string;
  specs: string;
  approveUrl: string;
  status: string;
  mode: string;
}

/**
 * Creates a deterministic PayPal Sandbox checkout order payload when the backend checkout endpoint
 * is unreachable (e.g. static hosting) or when PayPal Sandbox credentials are not configured.
 */
export function createFallbackCheckoutOrder(item: string, price: number): CheckoutOrderResult {
  const cleanItem = (item || 'Aura Curated Product').trim();
  const safePrice =
    Number.isFinite(Number(price)) && Number(price) > 0
      ? Math.round(Number(price) * 100) / 100
      : 299;
  const resolved = resolveProductDetails(cleanItem);
  const orderId = `EC-AURA-${Date.now().toString(36).toUpperCase()}`;
  const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;

  return {
    orderId,
    item: cleanItem,
    price: safePrice,
    imageUrl: resolved.imageUrl,
    category: resolved.category,
    specs: resolved.specs,
    approveUrl,
    status: 'CREATED',
    mode: 'sandbox_preview',
  };
}

/**
 * Deterministic fallback for Aura when GEMINI_API_KEY is missing, rate-limited, or when running on static deployments.
 */
export function generateFallbackAuraResponse(userMessage: string): string {
  const cleanMsg = (userMessage || '').trim();
  const lower = cleanMsg.toLowerCase();

  const isQuestionAboutBuying =
    /\b(how|what|why|where|when)\s+(to\s+|do\s+i\s+|should\s+i\s+|can\s+i\s+)?buy\b/i.test(cleanMsg);

  const purchaseIntentRegex =
    /\b(i want to buy|i'd like to buy|i would like to buy|buy the|buy a|buy this|buy|purchase the|purchase a|purchase|i'll take the|i will take the|order the|order a|get me the|checkout with)\b/i;

  if (!isQuestionAboutBuying && purchaseIntentRegex.test(cleanMsg)) {
    for (const gadget of CURATED_GADGETS) {
      const nameMatch = lower.includes(gadget.name.toLowerCase());
      const keywordMatch = gadget.keywords.some((kw) => lower.includes(kw));
      if (nameMatch || keywordMatch) {
        const priceMatch = cleanMsg.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
        const finalPrice = priceMatch ? Number(priceMatch[1]) : gadget.price;
        return JSON.stringify({
          intent: 'purchase',
          item: gadget.name,
          price: finalPrice,
        });
      }
    }

    const priceMatch =
      cleanMsg.match(/\$\s*(\d+(?:\.\d{1,2})?)/) ||
      cleanMsg.match(/\bfor\s+(\d+(?:\.\d{1,2})?)\s*(?:usd|dollars)?\b/i);
    const extractedPrice = priceMatch ? Number(priceMatch[1]) : 299;

    let extractedItem = cleanMsg
      .replace(
        /^.*?\b(?:i want to buy|i'd like to buy|i would like to buy|buy the|buy a|buy this|buy|purchase the|purchase a|purchase|i'll take the|i will take the|order the|order a|get me the|checkout with)\s+/i,
        ''
      )
      .replace(/\s+(?:for|at)\s+\$?\d+(?:\.\d{1,2})?\s*(?:usd|dollars)?.*$/i, '')
      .replace(/\(\s*\$\s*\d+(?:\.\d{1,2})?\s*\)/g, '')
      .replace(/\$\s*\d+(?:\.\d{1,2})?/g, '')
      .replace(/[.!?]+$/, '')
      .trim();

    if (!extractedItem || extractedItem.length < 2) {
      extractedItem = 'Aether ANC-1 Studio Headphones';
    } else {
      extractedItem = extractedItem.charAt(0).toUpperCase() + extractedItem.slice(1);
    }

    return JSON.stringify({
      intent: 'purchase',
      item: extractedItem,
      price: extractedPrice,
    });
  }

  for (const product of CURATED_GADGETS) {
    if (
      lower.includes(product.name.toLowerCase()) ||
      product.keywords.some((kw) => lower.includes(kw))
    ) {
      return `I highly recommend the ${product.name} ($${product.price}) in our ${product.category} collection. Key highlights: ${product.specs}. Availability: ${product.stockStatus}. You can save it to your Wishlist, add it to your Shopping Cart, or say "I want to buy the ${product.name}" for instant PayPal checkout!`;
    }
  }

  if (/\b(track|tracking|shipping|delivery|order status|where is my order)\b/i.test(cleanMsg)) {
    return 'All completed PayPal orders include live 5-stage Order Tracking in your PayPal Orders Ledger (Order Confirmed → Packed & Insured → Shipped · In Transit → Out for Delivery → Delivered). You can also filter your active orders by product name or order ID right inside the Ledger!';
  }

  if (/\b(categories|catalog|browse|all products|what do you sell|what do you have)\b/i.test(cleanMsg)) {
    return 'We offer 26 curated products across 8 categories: Electronics & Tech (Aether ANC-1 Headphones $349, Chrono Titanium Pro Watch $429, Lumina Air AR Glasses $599), Fashion & Apparel, Footwear & Sneakers, Home & Kitchen, Beauty & Personal Care, Sports & Fitness, Gaming & Consoles, and Bags & Travel. Ask about any item or say "I want to buy [item]" for instant PayPal checkout!';
  }

  return 'Hello! I am Aura, your online shopping assistant. We carry 26 curated products across Electronics & Tech, Fashion & Apparel, Footwear & Sneakers, Home & Kitchen, Beauty & Personal Care, Sports & Fitness, Gaming, and Travel Accessories.\n\nAsk me for recommendations in any category, save favourites to your Wishlist, add items to your Shopping Cart, or tell me which item you want to buy to check out instantly with PayPal.';
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  specs: string;
  imageUrl: string;
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  summaryTitle: string;
  specsSummary: string;
  primaryImageUrl: string;
}

/**
 * Pure function to add a gadget to the shopping cart or increment its quantity
 */
export function addToCart(
  cart: CartItem[],
  gadget: Pick<GadgetItem, 'id' | 'name' | 'category' | 'price' | 'specs' | 'imageUrl'>,
  quantityToAdd = 1
): CartItem[] {
  const safeQty = Math.max(1, Math.floor(quantityToAdd));
  const existingIndex = cart.findIndex((item) => item.id === gadget.id);
  if (existingIndex > -1) {
    return cart.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: item.quantity + safeQty } : item
    );
  }
  return [
    ...cart,
    {
      id: gadget.id,
      name: gadget.name,
      category: gadget.category,
      price: gadget.price,
      specs: gadget.specs,
      imageUrl: gadget.imageUrl,
      quantity: safeQty,
    },
  ];
}

/**
 * Pure function to update a cart item's quantity by delta (removes item if quantity <= 0)
 */
export function updateCartQuantity(cart: CartItem[], id: string, delta: number): CartItem[] {
  return cart
    .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
    .filter((item) => item.quantity > 0);
}

/**
 * Pure function to remove an item completely from the cart
 */
export function removeFromCart(cart: CartItem[], id: string): CartItem[] {
  return cart.filter((item) => item.id !== id);
}

/**
 * Pure function to compute total quantity, subtotal, and PayPal checkout description for all cart items
 */
export function calculateCartSummary(cart: CartItem[]): CartSummary {
  if (!Array.isArray(cart) || cart.length === 0) {
    return {
      totalItems: 0,
      subtotal: 0,
      summaryTitle: 'Empty Cart',
      specsSummary: 'No items selected',
      primaryImageUrl: '/images/default-gadget.svg',
    };
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const rawSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;

  const summaryTitle =
    cart.length === 1
      ? cart[0].quantity > 1
        ? `${cart[0].name} (×${cart[0].quantity})`
        : cart[0].name
      : `${cart[0].name} + ${cart.length - 1} more item${cart.length - 1 > 1 ? 's' : ''} (${totalItems} units)`;

  const specsSummary = cart
    .map((item) => `${item.name} ×${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`)
    .join(' · ');

  return {
    totalItems,
    subtotal,
    summaryTitle,
    specsSummary,
    primaryImageUrl: cart[0].imageUrl || '/images/default-gadget.svg',
  };
}

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  price: number;
  specs: string;
  imageUrl: string;
}

/**
 * Checks whether a product ID is currently saved in the user's wishlist
 */
export function isProductInWishlist(wishlist: WishlistItem[], id: string): boolean {
  return wishlist.some((item) => item.id === id);
}

/**
 * Pure function to toggle a product in the user's wishlist (adds if missing, removes if present)
 */
export function toggleWishlistItem(
  wishlist: WishlistItem[],
  gadget: Pick<GadgetItem, 'id' | 'name' | 'category' | 'price' | 'specs' | 'imageUrl'>
): WishlistItem[] {
  if (isProductInWishlist(wishlist, gadget.id)) {
    return wishlist.filter((item) => item.id !== gadget.id);
  }
  return [
    ...wishlist,
    {
      id: gadget.id,
      name: gadget.name,
      category: gadget.category,
      price: gadget.price,
      specs: gadget.specs,
      imageUrl: gadget.imageUrl,
    },
  ];
}

/**
 * Pure function to remove an item from the wishlist by ID
 */
export function removeFromWishlist(wishlist: WishlistItem[], id: string): WishlistItem[] {
  return wishlist.filter((item) => item.id !== id);
}

/**
 * Pure function to move a single saved wishlist item into the shopping cart for buying
 */
export function moveWishlistItemToCart(
  wishlist: WishlistItem[],
  cart: CartItem[],
  id: string
): { wishlist: WishlistItem[]; cart: CartItem[] } {
  const target = wishlist.find((item) => item.id === id);
  if (!target) {
    return { wishlist, cart };
  }
  return {
    wishlist: removeFromWishlist(wishlist, id),
    cart: addToCart(cart, target, 1),
  };
}

/**
 * Pure function to move all saved wishlist items into the shopping cart at once
 */
export function moveAllWishlistToCart(
  wishlist: WishlistItem[],
  cart: CartItem[]
): { wishlist: WishlistItem[]; cart: CartItem[] } {
  let updatedCart = [...cart];
  for (const item of wishlist) {
    updatedCart = addToCart(updatedCart, item, 1);
  }
  return {
    wishlist: [],
    cart: updatedCart,
  };
}

export type TrackingStepCode =
  | 'ORDER_CONFIRMED'
  | 'PACKED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface OrderTrackingMilestone {
  code: TrackingStepCode;
  label: string;
  detail: string;
  location: string;
  state: 'completed' | 'current' | 'upcoming';
}

export interface OrderTrackingInfo {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  currentStepIndex: number;
  currentStatusLabel: string;
  latestUpdateMessage: string;
  estimatedDelivery: string;
  progressPercent: number;
  milestones: OrderTrackingMilestone[];
}

export const ORDER_TRACKING_STAGES: Array<{
  code: TrackingStepCode;
  label: string;
  detail: string;
  location: string;
  etaText: string;
  progressPercent: number;
}> = [
  {
    code: 'ORDER_CONFIRMED',
    label: 'Order Confirmed',
    detail: 'PayPal payment captured & verified. Inventory reserved at fulfillment center.',
    location: 'Aura Global Fulfillment Hub',
    etaText: 'Est. Delivery: 3 Business Days',
    progressPercent: 20,
  },
  {
    code: 'PACKED',
    label: 'Packed & Insured',
    detail: 'Quality inspection passed. Sealed in shock-proof packaging with insured airway bill.',
    location: 'San Jose Dispatch Facility',
    etaText: 'Est. Delivery: 2–3 Business Days',
    progressPercent: 40,
  },
  {
    code: 'IN_TRANSIT',
    label: 'Shipped · In Transit',
    detail: 'Departed regional sorting facility aboard Aura Priority Express Air cargo.',
    location: 'Memphis Express Air Hub',
    etaText: 'Est. Delivery: Tomorrow by 8:00 PM',
    progressPercent: 65,
  },
  {
    code: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    detail: 'Loaded onto local courier vehicle for final-mile priority doorstep delivery.',
    location: 'Local Metropolitan Courier Depot',
    etaText: 'Arriving Today by 6:00 PM',
    progressPercent: 85,
  },
  {
    code: 'DELIVERED',
    label: 'Delivered',
    detail: 'Package delivered safely to recipient address. Digital proof of delivery recorded.',
    location: 'Recipient Front Door / Concierge',
    etaText: 'Delivered · Signed & Verified',
    progressPercent: 100,
  },
];

/**
 * Pure function to create structured shipping & delivery tracking info for a completed PayPal order
 */
export function createOrderTrackingInfo(
  orderId: string,
  stepIndex = 1
): OrderTrackingInfo {
  const cleanId = (orderId || 'ORD0000')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(-8)
    .padStart(6, '8');
  const clampedIndex = Math.max(0, Math.min(ORDER_TRACKING_STAGES.length - 1, Math.floor(stepIndex)));
  const currentStage = ORDER_TRACKING_STAGES[clampedIndex];

  const milestones: OrderTrackingMilestone[] = ORDER_TRACKING_STAGES.map((stage, idx) => ({
    code: stage.code,
    label: stage.label,
    detail: stage.detail,
    location: stage.location,
    state: idx < clampedIndex ? 'completed' : idx === clampedIndex ? 'current' : 'upcoming',
  }));

  return {
    orderId: orderId || 'ORD-UNKNOWN',
    trackingNumber: `AURA-TRK-${cleanId}`,
    carrier: 'Aura Priority Express (DHL Air)',
    currentStepIndex: clampedIndex,
    currentStatusLabel: currentStage.label,
    latestUpdateMessage: `${currentStage.detail} (${currentStage.location})`,
    estimatedDelivery: currentStage.etaText,
    progressPercent: currentStage.progressPercent,
    milestones,
  };
}

/**
 * Pure function to advance an order's shipping status to the next delivery milestone
 */
export function advanceOrderTrackingStep(tracking: OrderTrackingInfo): OrderTrackingInfo {
  const nextStep = Math.min(ORDER_TRACKING_STAGES.length - 1, tracking.currentStepIndex + 1);
  return createOrderTrackingInfo(tracking.orderId, nextStep);
}

export interface FilterableOrder {
  orderId: string;
  item: string;
  specs?: string;
  status?: string;
  tracking?: {
    trackingNumber?: string;
    currentStatusLabel?: string;
  };
}

/**
 * Pure function to filter active orders by product name, order ID, specs, or transaction status.
 * Returns all orders if query is empty or only whitespace.
 */
export function filterOrders<T extends FilterableOrder>(
  orders: T[],
  query: string
): T[] {
  const normalized = (query || '').trim().toLowerCase();
  if (!normalized) return orders;

  return orders.filter((order) => {
    const idMatch = (order.orderId || '').toLowerCase().includes(normalized);
    const itemMatch = (order.item || '').toLowerCase().includes(normalized);
    const specsMatch = (order.specs || '').toLowerCase().includes(normalized);
    const trackingMatch =
      (order.tracking?.trackingNumber || '').toLowerCase().includes(normalized) ||
      (order.tracking?.currentStatusLabel || '').toLowerCase().includes(normalized);
    const statusMatch = (order.status || '').toLowerCase().includes(normalized);

    return idMatch || itemMatch || specsMatch || Boolean(trackingMatch) || statusMatch;
  });
}




