import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Heart,
  Search,
  Truck,
  Package,
  MapPin,
  X,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { UserProfile } from './AuthModal';
import {
  CURATED_GADGETS,
  GadgetItem,
  CartItem,
  WishlistItem,
  OrderTrackingInfo,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  calculateCartSummary,
  toggleWishlistItem,
  removeFromWishlist,
  isProductInWishlist,
  moveWishlistItemToCart,
  moveAllWishlistToCart,
  filterCatalogProducts,
  createOrderTrackingInfo,
  advanceOrderTrackingStep,
  parsePurchaseIntent,
  resolveProductDetails,
  filterOrders,
  generateFallbackAuraResponse,
  createFallbackCheckoutOrder,
} from '../utils/commerce';
import { formatUserInitials } from '../utils/auth';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'paypal';
  text: string;
  item?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  specs?: string;
  approveUrl?: string;
  orderId?: string;
}

export interface ActiveOrder {
  orderId: string;
  item: string;
  price: number;
  imageUrl?: string;
  category?: string;
  specs?: string;
  approveUrl?: string;
  status: string;
  tracking?: OrderTrackingInfo;
}

export const INITIAL_DEMO_ORDERS: ActiveOrder[] = [
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
  },
];

interface ChatPageProps {
  currentUser: UserProfile | null;
  onBackToHome: () => void;
  onLogout: () => void;
}

export default function ChatPage({ currentUser, onBackToHome, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am Aura, your autonomous AI shopping assistant. Ask me anything about our curated hardware, add your desired products to your Shopping Cart, or say "I want to buy..." to initiate an instant PayPal checkout order.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cartCheckoutLoading, setCartCheckoutLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(INITIAL_DEMO_ORDERS);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [lastIntent, setLastIntent] = useState<{ item: string; price: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubView, setActiveSubView] = useState<'chat' | 'cart' | 'wishlist' | 'marketplace'>('chat');

  const cartSummary = calculateCartSummary(cart);
  const filteredProducts = filterCatalogProducts(CURATED_GADGETS, selectedCategory, searchQuery);
  const filteredActiveOrders = filterOrders(activeOrders, orderSearchQuery);
  const categoryOptions = [
    'All Categories',
    'Electronics & Tech',
    'Fashion & Apparel',
    'Footwear & Sneakers',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Fitness',
    'Gaming & Consoles',
    'Bags & Travel',
  ];

  const handleAddProductToCart = (gadget: GadgetItem) => {
    setCart((prev) => addToCart(prev, gadget, 1));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setCart((prev) => updateCartQuantity(prev, id, delta));
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => removeFromCart(prev, id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleWishlist = (gadget: GadgetItem) => {
    setWishlist((prev) => toggleWishlistItem(prev, gadget));
  };

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist((prev) => removeFromWishlist(prev, id));
  };

  const handleMoveWishlistToCart = (id: string) => {
    const result = moveWishlistItemToCart(wishlist, cart, id);
    setWishlist(result.wishlist);
    setCart(result.cart);
  };

  const handleMoveAllWishlistToCart = () => {
    const result = moveAllWishlistToCart(wishlist, cart);
    setWishlist(result.wishlist);
    setCart(result.cart);
  };

  const handleClearWishlist = () => {
    setWishlist([]);
  };

  const handleCartCheckout = async () => {
    if (cart.length === 0 || cartCheckoutLoading) return;
    const summary = calculateCartSummary(cart);
    setCartCheckoutLoading(true);
    setLastIntent({ item: summary.summaryTitle, price: summary.subtotal });
    setActiveSubView('chat');

    setMessages((prev) => [
      ...prev,
      {
        id: `u-cart-${Date.now()}`,
        sender: 'user',
        text: `Checkout my shopping cart (${summary.totalItems} item${summary.totalItems > 1 ? 's' : ''}): ${summary.specsSummary}`,
      },
    ]);

    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: summary.summaryTitle,
          price: summary.subtotal,
        }),
      });
      const checkoutData = await checkoutRes.json();
      const approveUrl = checkoutData.approveUrl || checkoutData.url;

      if (approveUrl) {
        const newOrder: ActiveOrder = {
          orderId: checkoutData.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`,
          item: summary.summaryTitle,
          price: summary.subtotal,
          imageUrl: summary.primaryImageUrl,
          category: `Cart Bundle (${summary.totalItems} items)`,
          specs: summary.specsSummary,
          approveUrl,
          status: checkoutData.status || 'CREATED',
        };
        setActiveOrders((prev) => [newOrder, ...prev]);

        setMessages((prev) => [
          ...prev,
          {
            id: `p-cart-${Date.now()}`,
            sender: 'paypal',
            text: `Your Shopping Cart checkout (${summary.totalItems} item${summary.totalItems > 1 ? 's' : ''}) is ready! Click below to securely complete your purchase via PayPal:`,
            item: summary.summaryTitle,
            price: summary.subtotal,
            imageUrl: summary.primaryImageUrl,
            category: `Shopping Cart Order · ${summary.totalItems} Units`,
            specs: summary.specsSummary,
            approveUrl,
            orderId: newOrder.orderId,
          },
        ]);
        setCart([]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-cart-${Date.now()}`,
          sender: 'bot',
          text: 'Unable to process cart checkout right now. Please try again.',
        },
      ]);
    } finally {
      setCartCheckoutLoading(false);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
    ]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const rawReply: string = data.reply || data.response || '';
      const intent = parsePurchaseIntent(rawReply);

      if (intent) {
        setLastIntent({ item: intent.item, price: intent.price });
        const resolved = resolveProductDetails(intent.item);
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item: intent.item, price: intent.price }),
        });
        const checkoutData = await checkoutRes.json();
        const approveUrl = checkoutData.approveUrl || checkoutData.url;

        if (approveUrl) {
          const newOrder: ActiveOrder = {
            orderId: checkoutData.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`,
            item: intent.item,
            price: intent.price,
            imageUrl: checkoutData.imageUrl || resolved.imageUrl,
            category: checkoutData.category || resolved.category,
            specs: checkoutData.specs || resolved.specs,
            approveUrl,
            status: checkoutData.status || 'CREATED',
          };
          setActiveOrders((prev) => [newOrder, ...prev]);

          setMessages((prev) => [
            ...prev,
            {
              id: `p-${Date.now()}`,
              sender: 'paypal',
              text: 'Great! Click below to securely complete your purchase via PayPal Sandbox:',
              item: intent.item,
              price: intent.price,
              imageUrl: checkoutData.imageUrl || resolved.imageUrl,
              category: checkoutData.category || resolved.category,
              specs: checkoutData.specs || resolved.specs,
              approveUrl,
              orderId: checkoutData.orderId,
            },
          ]);
          setLoading(false);
          return;
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: rawReply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, sender: 'bot', text: 'Unable to reach Aura server. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleSimulateCapture = async (orderId: string) => {
    const initialTracking = createOrderTrackingInfo(orderId, 1);
    try {
      await fetch('/api/orders/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
    } catch {
      // simulate capture locally even if server mock
    }

    setActiveOrders((prev) =>
      prev.map((ord) =>
        ord.orderId === orderId
          ? { ...ord, status: 'COMPLETED', tracking: initialTracking }
          : ord
      )
    );

    const found = activeOrders.find((o) => o.orderId === orderId);
    if (found) {
      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: 'bot',
          text: `Payment confirmed! Order ${orderId} for "${found.item}" ($${found.price.toFixed(2)} USD) was captured via PayPal Sandbox. Live Order Tracking (${initialTracking.trackingNumber}) is now active in your Checkout Ledger.`,
        },
      ]);
    }
  };

  const handleAdvanceOrderTracking = async (orderId: string) => {
    try {
      await fetch('/api/orders/track-advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
    } catch {
      // update local state even if offline
    }

    setActiveOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderId !== orderId) return ord;
        const currentTracking = ord.tracking || createOrderTrackingInfo(ord.orderId, 1);
        return {
          ...ord,
          tracking: advanceOrderTrackingStep(currentTracking),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[hsl(260_87%_3%)] text-[hsl(40_6%_95%)] flex flex-col selection:bg-[#6366f1]/30 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0c081e]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Aura AI" className="h-7 w-auto object-contain select-none" />
            <div className="hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Agent Online</span>
            </div>
          </div>
        </div>

        {/* Marketplace, Wishlist & Cart Shortcuts, User Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSubView('marketplace')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'marketplace'
                ? 'bg-indigo-600/35 border-indigo-400/60 text-white'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30 text-indigo-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-300" />
            <span>Marketplace ({CURATED_GADGETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('wishlist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'wishlist'
                ? 'bg-pink-600/35 border-pink-400/60 text-white'
                : 'bg-pink-500/15 hover:bg-pink-500/25 border-pink-500/30 text-pink-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('cart')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'cart'
                ? 'bg-purple-600/35 border-purple-400/60 text-white'
                : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-purple-300" />
            <span>Cart ({cartSummary.totalItems})</span>
            {cartSummary.subtotal > 0 && (
              <span className="font-mono text-emerald-400">· ${cartSummary.subtotal.toFixed(2)}</span>
            )}
          </button>

          {currentUser && (
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-purple-600/40 border border-purple-400/60 flex items-center justify-center text-[11px] font-bold text-white">
                {formatUserInitials(currentUser.name)}
              </div>
              <span className="text-xs text-white font-medium max-w-[120px] truncate">{currentUser.name}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {activeSubView === 'cart' ? (
        /* Dedicated Shopping Cart Page View */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-purple-900/35 via-indigo-900/20 to-[#130d2a] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/25 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-general">Your Shopping Cart</h1>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-xs font-mono font-semibold text-purple-200">
                    {cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Review your selected products, adjust quantities, or proceed to instant 1-click PayPal Orders v2 checkout.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveSubView('chat')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chat &amp; Marketplace</span>
              </button>
            </div>
          </div>

          <section
            id="shopping-cart-section"
            aria-label="Shopping Cart Page"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 bg-[#130d2a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Selected Products in Cart</h2>
                <span className="text-xs text-zinc-400">Insured Express Air Delivery Eligible</span>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-2xl bg-black/25 border border-white/5 space-y-4">
                  <ShoppingCart className="w-10 h-10 text-purple-300 mx-auto stroke-[1.5]" />
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <p className="text-base font-bold text-white">Your Shopping Cart is Empty</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Explore our 26-product Online Shopping Marketplace or ask Aura Concierge for recommendations, then click <strong className="text-purple-300">+ Add to Cart</strong> on any product.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('chat')}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
                  >
                    <span>Browse Marketplace &amp; Add Products</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-16 object-cover rounded-xl border border-white/10 shrink-0 bg-black/40"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-purple-300">{item.category}</span>
                          <h3 className="text-sm font-bold text-white truncate mt-0.5">{item.name}</h3>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{item.specs}</p>
                          <div className="text-xs text-zinc-300 font-mono mt-1.5">
                            ${item.price.toFixed(2)} each ·{' '}
                            <span className="text-emerald-400 font-bold">
                              Line Total: ${(item.price * item.quantity).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2 py-1">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-2 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-1 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => handleRemoveItem(item.id)}
                          className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-[#130d2a] border border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-base font-bold text-white">Order Summary</h2>
                <p className="text-xs text-zinc-400 mt-0.5">PayPal Sandbox Orders v2 Instant Checkout</p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Items Subtotal ({cartSummary.totalItems})</span>
                  <span className="font-mono font-semibold text-white tabular-nums">${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Insured Express Air Shipping</span>
                  <span className="text-emerald-400 font-mono font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>PayPal Buyer Protection</span>
                  <span className="text-purple-300 font-mono">Included</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total Checkout Amount</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    ${cartSummary.subtotal.toFixed(2)} USD
                  </span>
                </div>
                <button
                  type="button"
                  disabled={cart.length === 0 || cartCheckoutLoading}
                  onClick={() => void handleCartCheckout()}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {cartCheckoutLoading
                      ? 'Generating PayPal Order...'
                      : `Proceed to PayPal Checkout ($${cartSummary.subtotal.toFixed(2)})`}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : activeSubView === 'wishlist' ? (
        /* Dedicated Saved Wishlist Page View */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-pink-900/35 via-purple-900/20 to-[#130d2a] border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shrink-0">
                <Heart className="w-6 h-6 fill-pink-400/30" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-general">Your Saved Wishlist</h1>
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-xs font-mono font-semibold text-pink-200">
                    {wishlist.length} Saved
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Bookmark your favourite products across all 8 marketplace categories for future buying, or move them directly to your Shopping Cart.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {wishlist.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleMoveAllWishlistToCart}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all cursor-pointer shadow-md"
                  >
                    Move All to Cart
                  </button>
                  <button
                    type="button"
                    onClick={handleClearWishlist}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
                  >
                    Clear Wishlist
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveSubView('chat')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chat &amp; Marketplace</span>
              </button>
            </div>
          </div>

          <section
            id="wishlist-section"
            aria-label="Saved Wishlist Page"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 bg-[#130d2a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Saved Favourite Products</h2>
                <span className="text-xs text-zinc-400">Ready to Move to Cart Anytime</span>
              </div>

              {wishlist.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-2xl bg-black/25 border border-white/5 space-y-4">
                  <Heart className="w-10 h-10 text-pink-300 mx-auto stroke-[1.5]" />
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <p className="text-base font-bold text-white">Your Saved Wishlist is Empty</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Click <strong className="text-pink-300">Wishlist</strong> on any product in our 26-item Online Shopping Marketplace to bookmark your favourites for future buying.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubView('chat')}
                    className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
                  >
                    <span>Browse Marketplace &amp; Save Products</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-16 object-cover rounded-xl border border-white/10 shrink-0 bg-black/40"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-medium text-pink-300">{item.category}</span>
                          <h3 className="text-sm font-bold text-white truncate mt-0.5">{item.name}</h3>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{item.specs}</p>
                          <div className="text-xs text-emerald-400 font-mono font-bold mt-1.5">
                            ${item.price.toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveWishlistToCart(item.id)}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                        >
                          + Move to Cart
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from wishlist`}
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-[#130d2a] border border-pink-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-base font-bold text-white">Wishlist Overview</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Instant Cart Transfer &amp; Bundle Checkout</p>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Saved Products</span>
                  <span className="font-mono font-semibold text-white tabular-nums">{wishlist.length} Items</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Combined Wishlist Value</span>
                  <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                    ${wishlist.reduce((sum, item) => sum + item.price, 0).toFixed(2)} USD
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  type="button"
                  disabled={wishlist.length === 0}
                  onClick={() => {
                    handleMoveAllWishlistToCart();
                    setActiveSubView('cart');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Move All Saved Items to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubView('cart')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
                >
                  Open Shopping Cart Page
                </button>
              </div>
            </div>
          </section>
        </main>
      ) : activeSubView === 'marketplace' ? (
        /* Dedicated Online Shopping Marketplace Page View */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/35 via-purple-900/20 to-[#130d2a] border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-general">Online Shopping Marketplace</h1>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-xs font-mono font-semibold text-indigo-200">
                    {filteredProducts.length} of {CURATED_GADGETS.length} Items
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Explore 26 verified products across Electronics, Fashion, Footwear, Home &amp; Kitchen, Beauty, Sports &amp; Fitness, Gaming, and Travel.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubView('chat')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to AI Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('cart')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart ({cartSummary.totalItems})</span>
              </button>
            </div>
          </div>

          <section
            id="catalog-section"
            aria-label="Online Shopping Marketplace Page"
            className="space-y-6"
          >
            <div className="bg-[#130d2a] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all 26 products across 8 categories (e.g., laptop, coat, sneakers, espresso, serum, console)..."
                  className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        active
                          ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-purple-500/20 hover:border-purple-400/30'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400 bg-[#130d2a] rounded-2xl border border-white/10">
                No products match your search. Try another keyword or switch to <strong>All Categories</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((g) => {
                  const inCart = cart.find((c) => c.id === g.id);
                  const savedInWishlist = isProductInWishlist(wishlist, g.id);
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-2xl bg-[#130d2a] border border-white/10 flex flex-col justify-between gap-3.5 hover:border-purple-500/40 transition-all shadow-lg"
                    >
                      <div className="space-y-3">
                        <img
                          src={g.imageUrl}
                          alt={g.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-contain rounded-xl border border-white/10 bg-[#EAE6DF]"
                        />
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-purple-300 font-medium truncate">{g.category}</span>
                            <span className="text-sm text-emerald-400 font-mono tabular-nums font-bold">
                              ${g.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white truncate mt-1">{g.name}</div>
                          <div className="text-xs text-zinc-400 line-clamp-2 mt-1">{g.specs}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(g)}
                          aria-label={savedInWishlist ? `Remove ${g.name} from wishlist` : `Save ${g.name} to wishlist`}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                            savedInWishlist
                              ? 'bg-pink-500/25 border-pink-400/50 text-pink-200'
                              : 'bg-white/5 hover:bg-pink-500/15 border-white/10 hover:border-pink-400/30 text-zinc-300 hover:text-pink-200'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${savedInWishlist ? 'fill-pink-400 text-pink-400' : ''}`} />
                          <span>{savedInWishlist ? 'Saved' : 'Wishlist'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddProductToCart(g)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/40 text-xs font-semibold text-purple-200 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubView('chat');
                            void sendMessage(`I want to buy the ${g.name} for $${g.price}`);
                          }}
                          className="w-full mt-1 heroSecondary rounded-lg px-3 py-2 text-xs font-semibold text-white hover:bg-purple-600/30 transition-all cursor-pointer text-center"
                        >
                          Buy via PayPal (${g.price})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      ) : (
      /* Main Chat & Marketplace Workspace */
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Welcome Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-transparent border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-general">
                Aura AI Shopping Assistant &amp; Marketplace
              </h1>
              <p className="text-xs text-zinc-400">
                Logged in as <span className="text-purple-300 font-medium">{currentUser?.email || 'Authenticated User'}</span> · Add products to your Cart and click the Cart option in the header to view your Cart page.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PayPal Orders v2 Active</span>
          </div>
        </div>

        {/* 2-Column Split: Chat + Wishlist / Ledger / Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Left Column: Chatting Interface */}
          <section className="lg:col-span-7 lg:sticky lg:top-24 bg-[#130d2a] border border-white/10 rounded-2xl flex flex-col h-[720px] shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  AU
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Aura Concierge</h2>
                  <p className="text-[11px] text-zinc-400">Gemini 2.5 Intent Engine &amp; PayPal Checkout</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Interactive Session
              </span>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#0e0922]">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={
                      m.sender === 'user'
                        ? 'ml-auto max-w-[85%] bg-[#6366f1] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm shadow-md'
                        : 'mr-auto max-w-[92%] bg-white/5 border border-white/10 text-zinc-200 px-4 py-3 rounded-2xl rounded-bl-sm text-sm space-y-3 shadow-sm'
                    }
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    {m.sender === 'paypal' && m.approveUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="space-y-3 pt-2"
                      >
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3.5 shadow-inner">
                          {m.imageUrl && (
                            <img
                              src={m.imageUrl}
                              alt={m.item || 'Product'}
                              referrerPolicy="no-referrer"
                              className="w-20 h-16 object-cover rounded-lg border border-white/15 shrink-0 bg-white/5"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-purple-300 font-medium">{m.category}</div>
                            <div className="text-sm font-bold text-white truncate">{m.item}</div>
                            <div className="text-xs text-zinc-400 truncate mt-0.5">{m.specs}</div>
                            <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums mt-1">
                              ${m.price?.toFixed(2)} USD
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={m.approveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-xl transition-all shadow-lg"
                          >
                            Complete Purchase via PayPal (${m.price?.toFixed(2)})
                          </a>
                          {m.orderId && (
                            <button
                              type="button"
                              onClick={() => void handleSimulateCapture(m.orderId!)}
                              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Simulate Sandbox Approval
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mr-auto bg-white/5 border border-white/10 text-zinc-400 px-4 py-2.5 rounded-2xl text-xs font-medium flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Aura is analyzing intent...</span>
                </motion.div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-zinc-400 shrink-0 font-medium">Try:</span>
                <button
                  type="button"
                  onClick={() => void sendMessage('What are the key specs of the Aether ANC-1 Studio Headphones?')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white shrink-0 cursor-pointer transition-colors"
                >
                  ANC-1 Specs
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage('Tell me about Lumina Air AR Glasses')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white shrink-0 cursor-pointer transition-colors"
                >
                  Lumina AR Info
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage('I want to buy the Aether ANC-1 Studio Headphones for $349')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 shrink-0 cursor-pointer font-medium transition-colors"
                >
                  Buy ANC-1 ($349)
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage('I want to buy the Chrono Titanium Pro Watch for $429')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 shrink-0 cursor-pointer font-medium transition-colors"
                >
                  Buy Watch ($429)
                </button>
              </div>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#130d2a] border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Aura anything or say 'I want to buy...'"
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-zinc-500 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:bg-white/10 focus:border-purple-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </section>

          {/* Right Column: Live PayPal Ledger & Storefront Hub */}
          <aside className="lg:col-span-5 space-y-6">
            {/* 1. PAYPAL CHECKOUT LEDGER */}
            <div className="bg-[#130d2a] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">PayPal Orders Ledger</h2>
                </div>
                <span className="text-xs text-purple-300 font-mono tabular-nums">
                  {orderSearchQuery.trim()
                    ? `${filteredActiveOrders.length}/${activeOrders.length} Orders`
                    : `${activeOrders.length} Order${activeOrders.length === 1 ? '' : 's'}`}
                </span>
              </div>

              {/* Order Ledger Search Filter Input */}
              <div className="mb-3">
                <label htmlFor="order-ledger-search" className="sr-only">
                  Filter active orders by product name or order ID
                </label>
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
                  <input
                    id="order-ledger-search"
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search orders by product name or order ID..."
                    aria-label="Filter active orders by product name or order ID"
                    className="w-full pl-8 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-2.5 p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
                      aria-label="Clear order search"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {orderSearchQuery.trim() && (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5 px-0.5">
                    <span>
                      Showing {filteredActiveOrders.length} of {activeOrders.length} order{activeOrders.length === 1 ? '' : 's'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery('')}
                      className="text-purple-300 hover:text-white underline cursor-pointer text-[11px]"
                    >
                      Reset filter
                    </button>
                  </div>
                )}
              </div>

              {lastIntent && (
                <div className="mb-3 p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] font-mono text-purple-200">
                  <div className="text-zinc-400 text-[10px] uppercase font-semibold">Intent Detected:</div>
                  <div>item: &quot;{lastIntent.item}&quot;</div>
                  <div>price: ${lastIntent.price.toFixed(2)} USD</div>
                </div>
              )}

              {activeOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No PayPal orders initiated yet. Add products to your Shopping Cart above and click <strong>Proceed to PayPal Checkout</strong>.
                </div>
              ) : filteredActiveOrders.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 bg-white/5 rounded-xl border border-white/10 p-4 space-y-2.5">
                  <Search className="w-5 h-5 text-zinc-500 mx-auto opacity-70" />
                  <div className="font-semibold text-zinc-200 text-sm">No matching orders found</div>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    No active orders match &quot;<span className="text-purple-300 font-mono">{orderSearchQuery}</span>&quot;. Try searching with a different product name or order ID.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 font-medium transition cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredActiveOrders.map((ord) => {
                    const isCompleted = ord.status === 'COMPLETED';
                    const tracking = isCompleted
                      ? ord.tracking || createOrderTrackingInfo(ord.orderId, 1)
                      : null;

                    return (
                      <div
                        key={ord.orderId}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                              <span>{ord.orderId}</span>
                              {isCompleted ? (
                                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Captured
                                </span>
                              ) : (
                                <span className="text-amber-400">Pending Approval</span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white truncate mt-0.5">{ord.item}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              ${ord.price.toFixed(2)}
                            </div>
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => void handleSimulateCapture(ord.orderId)}
                                className="text-[10px] text-purple-300 hover:text-white underline cursor-pointer mt-0.5 block"
                              >
                                Simulate Capture
                              </button>
                            )}
                          </div>
                        </div>

                        {isCompleted && tracking && (
                          <div className="pt-2.5 border-t border-white/10 space-y-2.5 bg-black/30 rounded-xl p-3 border">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-200">
                                <Truck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>Order Tracking · {tracking.currentStatusLabel}</span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {tracking.progressPercent}%
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-400 font-mono">
                              <span>Tracking #: <strong className="text-zinc-200">{tracking.trackingNumber}</strong></span>
                              <span className="text-emerald-300">{tracking.estimatedDelivery}</span>
                            </div>

                            {/* Shipping Progress Bar */}
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${tracking.progressPercent}%` }}
                              />
                            </div>

                            {/* Latest Delivery Update Banner */}
                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300 flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-semibold text-white">{tracking.currentStatusLabel}</div>
                                <div className="text-zinc-400 leading-relaxed">{tracking.latestUpdateMessage}</div>
                              </div>
                            </div>

                            {/* 5-Stage Delivery Milestone Stepper */}
                            <div className="space-y-1.5 pt-1">
                              {tracking.milestones.map((step) => {
                                const isDone = step.state === 'completed';
                                const isCurrent = step.state === 'current';
                                return (
                                  <div
                                    key={step.code}
                                    className="flex items-center justify-between gap-2 text-[11px]"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                          isDone
                                            ? 'bg-emerald-400'
                                            : isCurrent
                                              ? 'bg-purple-400 ring-2 ring-purple-400/40'
                                              : 'bg-zinc-600'
                                        }`}
                                      />
                                      <span
                                        className={`truncate ${
                                          isDone
                                            ? 'text-zinc-300'
                                            : isCurrent
                                              ? 'text-white font-semibold'
                                              : 'text-zinc-500'
                                        }`}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 truncate max-w-[145px]">
                                      {step.location}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Action Button to Simulate Next Delivery Update */}
                            <div className="pt-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <Package className="w-3 h-3 text-zinc-400" />
                                {tracking.carrier}
                              </span>
                              {tracking.currentStepIndex < 4 ? (
                                <button
                                  type="button"
                                  onClick={() => void handleAdvanceOrderTracking(ord.orderId)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-[11px] font-semibold text-purple-200 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  Simulate Next Delivery Update →
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Package Delivered</span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      )}
    </div>
  );
}
