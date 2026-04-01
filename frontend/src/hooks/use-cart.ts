import { create } from 'zustand';
import http from '@/lib/http';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    brand: string;
    modelName: string;
    stock: number;
    status: boolean;
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await http.get('/cart');
      set({ items: res.data.items || [] });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: number, quantity = 1) => {
    try {
      const res = await http.post('/cart/items', { productId, quantity });
      set({ items: res.data.items || [] });
      toast.success('Đã thêm vào giỏ hàng');
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng';
      toast.error(msg);
      return false;
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    try {
      const res = await http.patch(`/cart/items/${itemId}`, { quantity });
      set({ items: res.data.items || [] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể cập nhật số lượng';
      toast.error(msg);
      // Revert optimism if failed
      get().fetchCart();
      return false;
    }
  },

  removeItem: async (itemId: number) => {
    try {
      // Optimistic update
      const currentItems = get().items;
      set({ items: currentItems.filter(item => item.id !== itemId) });
      
      const res = await http.delete(`/cart/items/${itemId}`);
      set({ items: res.data.items || [] });
      toast.success('Đã xóa khỏi giỏ hàng');
      return true;
    } catch (error: any) {
      get().fetchCart();
      const msg = error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng';
      toast.error(msg);
      return false;
    }
  },

  clearCart: async () => {
    try {
      await http.delete('/cart/clear');
      set({ items: [] });
      return true;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lỗi khi xóa giỏ hàng';
      toast.error(msg);
      return false;
    }
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}));
