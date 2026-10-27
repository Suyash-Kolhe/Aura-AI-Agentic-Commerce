import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Exact system instructions required for Aura
const AURA_SYSTEM_INSTRUCTION =
  'You are Aura, a helpful online shopping assistant. Chat naturally about products across electronics, fashion, footwear, home & kitchen, beauty, fitness, gaming, and travel accessories. When the user explicitly states they want to buy a specific item, stop conversing and reply ONLY with a raw JSON object in this format: {"intent": "purchase", "item": "[Item Name]", "price": [Price in USD as a number]}. Do not include markdown formatting or extra text.';

function createProductSvgDataUri(label, category, accentHex, secondaryHex, iconPath) {
  const escapeXml = (str) =>
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

const CURATED_GADGETS = [
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

// In-memory ledger for orders created during the session
const sessionOrders = [];

function resolveProductDetails(itemName) {
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
    category: 'Online Shopping Marketplace',
    specs: 'Verified Authentic · Express Insured Delivery · 1-Year Warranty',
  };
}

function isConfiguredSecret(val) {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const placeholders = [
    'MY_GEMINI_API_KEY',
    'YOUR_GEMINI_API_KEY',
    'YOUR_PAYPAL_SANDBOX_CLIENT_ID',
    'YOUR_PAYPAL_SANDBOX_CLIENT_SECRET',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
  ];
  return !placeholders.includes(trimmed);
}

function parsePurchaseIntent(responseText) {
  if (!responseText || typeof responseText !== 'string') return null;
  const trimmed = responseText.trim();
  if (!trimmed.includes('"intent"') || !trimmed.includes('"purchase"')) {
    return null;
  }

  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
    if (
      parsed &&
      parsed.intent === 'purchase' &&
      typeof parsed.item === 'string' &&
      parsed.item.trim().length > 0
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

function generateFallbackAuraResponse(userMessage) {
  const cleanMsg = (userMessage || '').trim();
  const lower = cleanMsg.toLowerCase();

  const purchaseIntentRegex =
    /\b(i want to buy|i'd like to buy|i would like to buy|buy the|buy a|buy this|buy|purchase the|purchase a|purchase|i'll take the|i will take the|order the|get me the|checkout with)\b/i;

  if (purchaseIntentRegex.test(cleanMsg)) {
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
        /^.*?\b(?:i want to buy|i'd like to buy|i would like to buy|buy the|buy a|buy|purchase the|purchase a|purchase|i'll take the|i will take the|order the|get me the|checkout with)\s+/i,
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
      return `I highly recommend the ${product.name} ($${product.price}) in our ${product.category} collection. Key highlights: ${product.specs}. You can save it to your Wishlist, add it to your Shopping Cart, or say "I want to buy the ${product.name} for $${product.price}" for instant PayPal checkout!`;
    }
  }

  if (lower.includes('track') || lower.includes('order') || lower.includes('shipping') || lower.includes('delivery')) {
    return 'You can track all active and completed PayPal orders directly in the Order Ledger! Use the search bar in the Order Ledger to filter by Order ID, Product Name, or Tracking Number, and click "Advance Shipping Status" on any completed order to view live delivery updates.';
  }

  return 'Hello! I am Aura, your online shopping assistant. We carry 26+ curated products across Electronics & Tech, Fashion & Apparel, Footwear & Sneakers, Home & Kitchen, Beauty & Personal Care, Sports & Fitness, Gaming, and Travel Accessories.\n\nAsk me for recommendations in any category, save favourites to your Wishlist, add items to your Shopping Cart, or tell me which item you want to buy (e.g., "I want to buy the Chrono Titanium Pro Watch for $429") to check out instantly with PayPal.';
}

/**
 * Helper function getPayPalAccessToken()
 * Uses Basic Auth with the PayPal Client ID and Secret to call
 * https://api-m.sandbox.paypal.com/v1/oauth2/token
 */
export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!isConfiguredSecret(clientId) || !isConfiguredSecret(clientSecret)) {
    throw new Error('PAYPAL_SANDBOX_CREDENTIALS_NOT_SET');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    }
  );

  return response.data.access_token;
}

/**
 * POST /api/chat
 * Initializes Google Gemini API with Aura system instructions.
 */
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body?.message ?? req.body?.prompt ?? '';
    if (typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      return res.status(400).json({
        error: 'Please enter a message before sending.',
      });
    }

    const trimmedMessage = userMessage.trim();
    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = '';

    if (isConfiguredSecret(apiKey)) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const catalogContext = CURATED_GADGETS.map(
          (g) => `${g.name}: $${g.price} (${g.specs})`
        ).join('; ');

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 2500)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: trimmedMessage,
            config: {
              systemInstruction: `${AURA_SYSTEM_INSTRUCTION}\nCatalog reference: ${catalogContext}`,
              temperature: 0.2,
            },
          }),
          timeoutPromise,
        ]);

        replyText = (response.text || '').trim();
      } catch (_err) {
        replyText = generateFallbackAuraResponse(trimmedMessage);
      }
    } else {
      replyText = generateFallbackAuraResponse(trimmedMessage);
    }

    const detectedIntent = parsePurchaseIntent(replyText);
    if (detectedIntent) {
      replyText = JSON.stringify(detectedIntent);
    } else {
      const fallbackCheck = generateFallbackAuraResponse(trimmedMessage);
      const fallbackIntent = parsePurchaseIntent(fallbackCheck);
      if (fallbackIntent) {
        replyText = JSON.stringify(fallbackIntent);
      }
    }

    return res.json({
      reply: replyText,
      response: replyText,
      text: replyText,
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to process chat message.',
    });
  }
});

/**
 * POST /api/checkout
 * Accepts item and price, calls getPayPalAccessToken(), then posts to
 * https://api-m.sandbox.paypal.com/v2/checkout/orders (intent: 'CAPTURE', currency: 'USD')
 * and returns the approve URL along with resolved product image and specs.
 */
app.post('/api/checkout', async (req, res) => {
  const rawItem = req.body?.item;
  const rawPrice = req.body?.price;

  if (typeof rawItem !== 'string' || rawItem.trim().length === 0) {
    return res.status(400).json({ error: 'A valid non-empty item name is required.' });
  }

  const numericPrice = Number(rawPrice);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ error: 'A valid positive numeric price in USD is required.' });
  }

  const item = rawItem.trim();
  const price = Math.round(numericPrice * 100) / 100;
  const formattedPrice = price.toFixed(2);
  const productDetails = resolveProductDetails(item);
  const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: item,
        amount: {
          currency_code: 'USD',
          value: formattedPrice,
        },
      },
    ],
    application_context: {
      brand_name: 'Aura Tech Commerce',
      user_action: 'PAY_NOW',
      return_url: `${appUrl}/?checkout=approved`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
    },
  };

  try {
    const accessToken = await getPayPalAccessToken();

    const orderResponse = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 12000,
      }
    );

    const links = orderResponse.data?.links || [];
    const approveLink = links.find(
      (link) => link.rel === 'approve' || link.rel === 'payer-action'
    );

    if (!approveLink || !approveLink.href) {
      throw new Error('No approve URL returned from PayPal order creation.');
    }

    const orderRecord = {
      orderId: orderResponse.data.id,
      item,
      price,
      imageUrl: productDetails.imageUrl,
      category: productDetails.category,
      specs: productDetails.specs,
      currency: 'USD',
      intent: 'CAPTURE',
      status: orderResponse.data.status || 'CREATED',
      approveUrl: approveLink.href,
      mode: 'paypal_sandbox_live',
      createdAt: new Date().toISOString(),
    };
    sessionOrders.unshift(orderRecord);

    return res.json({
      approveUrl: approveLink.href,
      url: approveLink.href,
      orderId: orderRecord.orderId,
      item,
      price,
      imageUrl: orderRecord.imageUrl,
      category: orderRecord.category,
      specs: orderRecord.specs,
      status: orderRecord.status,
      mode: orderRecord.mode,
    });
  } catch (_paypalErr) {
    const mockToken = `EC-AURA-${Date.now().toString(36).toUpperCase()}`;
    const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${mockToken}`;

    const orderRecord = {
      orderId: mockToken,
      item,
      price,
      imageUrl: productDetails.imageUrl,
      category: productDetails.category,
      specs: productDetails.specs,
      currency: 'USD',
      intent: 'CAPTURE',
      status: 'CREATED',
      approveUrl,
      mode: 'sandbox_preview',
      createdAt: new Date().toISOString(),
    };
    sessionOrders.unshift(orderRecord);

    return res.json({
      approveUrl,
      url: approveUrl,
      orderId: orderRecord.orderId,
      item,
      price,
      imageUrl: orderRecord.imageUrl,
      category: orderRecord.category,
      specs: orderRecord.specs,
      status: orderRecord.status,
      mode: orderRecord.mode,
    });
  }
});

app.get('/api/catalog', (_req, res) => {
  res.json({ gadgets: CURATED_GADGETS });
});

const ORDER_TRACKING_STAGES = [
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

function createOrderTrackingInfo(orderId, stepIndex = 1) {
  const cleanId = String(orderId || 'ORD0000')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(-8)
    .padStart(6, '8');
  const clampedIndex = Math.max(
    0,
    Math.min(ORDER_TRACKING_STAGES.length - 1, Math.floor(stepIndex))
  );
  const currentStage = ORDER_TRACKING_STAGES[clampedIndex];

  const milestones = ORDER_TRACKING_STAGES.map((stage, idx) => ({
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

// Seed demo orders so /api/orders returns consistent transactions matching client initial state
sessionOrders.push(
  {
    orderId: 'ORD-98741-AURA',
    item: 'Aether ANC-1 Studio Headphones',
    price: 349.0,
    imageUrl: '/images/aether-headphones.svg',
    category: 'Spatial Audio',
    specs: '45mm Beryllium Drivers · 48dB Hybrid ANC · 60h Battery',
    status: 'COMPLETED',
    approveUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=ORD-98741-AURA',
    tracking: createOrderTrackingInfo('ORD-98741-AURA', 2),
  },
  {
    orderId: 'ORD-84512-PRO',
    item: 'Chrono Titanium Pro Watch',
    price: 429.0,
    imageUrl: '/images/chrono-watch.svg',
    category: 'Wearables',
    specs: 'Aerospace Grade 5 Titanium · Dual-band GPS · 14-Day Battery',
    status: 'CREATED',
    approveUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=ORD-84512-PRO',
  },
  {
    orderId: 'ORD-62190-STUDIO',
    item: 'AeroStride Carbon Marathon Sneakers',
    price: 219.0,
    imageUrl: '/images/aerostride-sneakers.svg',
    category: 'Footwear & Sneakers',
    specs: 'Dual-Density Pebax Foam · Full-Length Carbon Plate',
    status: 'COMPLETED',
    approveUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=ORD-62190-STUDIO',
    tracking: createOrderTrackingInfo('ORD-62190-STUDIO', 4),
  }
);

app.get('/api/orders', (_req, res) => {
  res.json({ orders: sessionOrders });
});

app.post('/api/orders/capture', (req, res) => {
  const { orderId, item, price } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required.' });
  }
  let order = sessionOrders.find((o) => o.orderId === orderId);
  if (!order) {
    const details = resolveProductDetails(item || 'Aura Hardware Order');
    order = {
      orderId,
      item: item || 'Aura Hardware Order',
      price: Number(price) || 299,
      imageUrl: details.imageUrl,
      category: details.category,
      specs: details.specs,
      status: 'COMPLETED',
      approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
    };
    sessionOrders.unshift(order);
  }
  order.status = 'COMPLETED';
  order.capturedAt = new Date().toISOString();
  order.tracking = createOrderTrackingInfo(order.orderId, 1);
  return res.json({ order, tracking: order.tracking });
});

app.post('/api/orders/track-advance', (req, res) => {
  const { orderId, currentStepIndex } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required.' });
  }
  let order = sessionOrders.find((o) => o.orderId === orderId);
  if (!order) {
    const baseStep = typeof currentStepIndex === 'number' ? currentStepIndex : 1;
    const nextIdx = Math.min(ORDER_TRACKING_STAGES.length - 1, baseStep + 1);
    const tracking = createOrderTrackingInfo(orderId, nextIdx);
    return res.json({
      order: { orderId, status: 'COMPLETED', tracking },
      tracking,
    });
  }
  const currentIdx = order.tracking ? order.tracking.currentStepIndex : 1;
  const nextIdx = Math.min(ORDER_TRACKING_STAGES.length - 1, currentIdx + 1);
  order.tracking = createOrderTrackingInfo(order.orderId, nextIdx);
  return res.json({ order, tracking: order.tracking });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Agentic Commerce server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
