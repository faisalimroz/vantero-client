import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and in browser, can notify AuthContext
    return Promise.reject(error);
  }
);

/* =========================================================
   STOREFRONT PUBLIC ENDPOINTS
   ========================================================= */

export const getCMSSections = async () => {
  const res = await api.get('/cms/sections');
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const getCategoryBySlug = async (slug: string) => {
  const res = await api.get(`/categories/${slug}`);
  return res.data;
};

export const getProducts = async (params: Record<string, any> = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getProductBySlug = async (slug: string) => {
  const res = await api.get(`/products/${slug}`);
  return res.data;
};

export const getShopTheLooks = async () => {
  const res = await api.get('/shop-the-look');
  return res.data;
};

export const getShopTheLookBySlug = async (slug: string) => {
  const res = await api.get(`/shop-the-look/${slug}`);
  return res.data;
};

export const getOrderTracking = async (orderNumber: string) => {
  const res = await api.get(`/orders/track/${orderNumber}`);
  return res.data;
};

/* =========================================================
   CUSTOMER AUTHENTICATED ENDPOINTS
   ========================================================= */

export const createOrder = async (orderData: {
  items: Array<{
    productId: string;
    size: string;
    color?: string;
    quantity: number;
    title?: string;
    image?: string;
  }>;
  deliveryArea?: 'inside_dhaka' | 'outside_dhaka';
  shippingAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  customerNotes?: string;
}) => {
  const res = await api.post('/orders', orderData);
  return res.data;
};

export const getMyOrders = async () => {
  const res = await api.get('/orders/my-orders');
  return res.data;
};

export const googleLogin = async (credential: string) => {
  const res = await api.post('/auth/google', { credential });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

export const updateProfile = async (profileData: { name?: string; email?: string; avatar?: string; phone?: string }) => {
  const res = await api.patch('/auth/profile', profileData);
  return res.data;
};

export const addSavedAddress = async (addressData: any) => {
  const res = await api.post('/auth/addresses', addressData);
  return res.data;
};

export const deleteSavedAddress = async (addressId: string) => {
  const res = await api.delete(`/auth/addresses/${addressId}`);
  return res.data;
};

export const adminLoginApi = async (email: string, password: string) => {
  const res = await api.post('/auth/admin-login', { email, password });
  return res.data;
};

/* =========================================================
   ADMIN DASHBOARD ENDPOINTS
   ========================================================= */

export const getAdminAnalytics = async (range: string = 'this_month') => {
  const res = await api.get('/admin/analytics/dashboard', { params: { range } });
  return res.data;
};

// Admin CMS
export const getAdminCMSSections = async () => {
  const res = await api.get('/cms/admin/sections');
  return res.data;
};

export const updateCMSSection = async (sectionKey: string, data: any) => {
  const res = await api.put(`/cms/sections/${sectionKey}`, data);
  return res.data;
};

// Admin Categories
export const getAdminCategories = async () => {
  const res = await api.get('/categories/admin/all');
  return res.data;
};

export const createAdminCategory = async (data: any) => {
  const res = await api.post('/categories', data);
  return res.data;
};

export const updateAdminCategory = async (id: string, data: any) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteAdminCategory = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};

export const createAdminSubCategory = async (categoryId: string, data: any) => {
  const res = await api.post(`/categories/${categoryId}/subcategories`, data);
  return res.data;
};

export const deleteAdminSubCategory = async (subId: string) => {
  const res = await api.delete(`/categories/subcategories/${subId}`);
  return res.data;
};

// Admin Products
export const getAdminProducts = async (params: any = {}) => {
  const res = await api.get('/products/admin/all', { params });
  return res.data;
};

export const createAdminProduct = async (data: any) => {
  const res = await api.post('/products', data);
  return res.data;
};

export const updateAdminProduct = async (id: string, data: any) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteAdminProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// Admin Shop the Look
export const getAdminShopTheLooks = async () => {
  const res = await api.get('/shop-the-look/admin/all');
  return res.data;
};

export const createAdminShopTheLook = async (data: any) => {
  const res = await api.post('/shop-the-look', data);
  return res.data;
};

export const updateAdminShopTheLook = async (id: string, data: any) => {
  const res = await api.put(`/shop-the-look/${id}`, data);
  return res.data;
};

export const deleteAdminShopTheLook = async (id: string) => {
  const res = await api.delete(`/shop-the-look/${id}`);
  return res.data;
};

// Admin Orders
export const getAdminOrders = async (params: any = {}) => {
  const res = await api.get('/orders/admin/all', { params });
  return res.data;
};

export const updateOrderStatus = async (
  id: string,
  data: {
    status: string;
    note?: string;
    courierName?: string;
    trackingCode?: string;
    trackingUrl?: string;
  }
) => {
  const res = await api.patch(`/orders/admin/${id}/status`, data);
  return res.data;
};

// Admin Image & Media Upload (Supports Multer diskStorage with Images & Product Showcase Videos)
export const uploadImage = async (file: File, folder: string = 'misc') => {
  const formData = new FormData();
  // Append folder BEFORE file so diskStorage destination can read it
  formData.append('folder', folder);
  formData.append('file', file);
  formData.append('image', file);

  const res = await api.post(`/upload?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadMedia = uploadImage;

/* =========================================================
   RETURNS & POST-DELIVERY WORKFLOW ENDPOINTS
   ========================================================= */

// Customer Return Request Submission
export const submitReturnRequestApi = async (orderNumber: string, formData: FormData) => {
  const res = await api.post(`/orders/${orderNumber}/return?folder=returns`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Customer Get Return Tracking for Order
export const getOrderReturnApi = async (orderNumber: string) => {
  const res = await api.get(`/orders/${orderNumber}/return`);
  return res.data;
};

// Admin Returns Queue
export const getAdminReturns = async (params: any = {}) => {
  const res = await api.get('/returns/admin/all', { params });
  return res.data;
};

// Admin Single Return Detail
export const getAdminReturnById = async (id: string) => {
  const res = await api.get(`/returns/admin/${id}`);
  return res.data;
};

// Admin Update Return Status & Restock
export const updateReturnStatus = async (
  id: string,
  data: {
    status: string;
    note?: string;
    rejectionReason?: string;
    courierName?: string;
    trackingCode?: string;
    restockItems?: boolean;
  }
) => {
  const res = await api.patch(`/returns/admin/${id}/status`, data);
  return res.data;
};

// Admin Returns Analytics
export const getAdminReturnsAnalytics = async () => {
  const res = await api.get('/returns/admin/analytics');
  return res.data;
};

/* =========================================================
   CUSTOMER REVIEWS & STOREFRONT TESTIMONIALS
   ========================================================= */

// Get reviews (public: published only; admin: pass { all: true })
export const getReviews = async (params: { all?: boolean } = {}) => {
  const res = await api.get('/reviews', { params });
  return res.data;
};

// Admin: Create review
export const createReview = async (data: any) => {
  const res = await api.post('/reviews', data);
  return res.data;
};

// Admin: Update review
export const updateReview = async (id: string, data: any) => {
  const res = await api.put(`/reviews/${id}`, data);
  return res.data;
};

// Admin: Delete review
export const deleteReview = async (id: string) => {
  const res = await api.delete(`/reviews/${id}`);
  return res.data;
};

/* =========================================================
   LEGAL POLICIES (TERMS, PRIVACY, REFUND)
   ========================================================= */

// Get all policy summaries
export const getPolicies = async () => {
  const res = await api.get('/policies');
  return res.data;
};

// Get single policy by key ('terms-of-service' | 'privacy-policy' | 'refund-policy')
export const getPolicyByKey = async (key: string) => {
  const res = await api.get(`/policies/${key}`);
  return res.data;
};

// Admin: Update policy
export const updatePolicy = async (key: string, data: any) => {
  const res = await api.put(`/policies/${key}`, data);
  return res.data;
};

/* =========================================================
   SITE SETTINGS (SHIPPING & FREE DELIVERY THRESHOLD)
   ========================================================= */

export interface SiteSettingsData {
  freeDeliveryThreshold: number;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  freeDeliveryMessage: string;
}

// Public: Get delivery & free shipping settings
export const getSiteSettings = async (): Promise<{ success: boolean; settings: SiteSettingsData }> => {
  const res = await api.get('/settings');
  return res.data;
};

// Admin: Update delivery & free shipping settings
export const updateSiteSettings = async (data: Partial<SiteSettingsData>): Promise<{ success: boolean; settings: SiteSettingsData; message: string }> => {
  const res = await api.put('/settings', data);
  return res.data;
};

/* =========================================================
   ADMIN NOTIFICATIONS (ORDERS & RETURNS)
   ========================================================= */

export interface AdminNotification {
  _id: string;
  type: 'NEW_ORDER' | 'RETURN_DELIVERY';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  isRead: boolean;
  createdAt: string;
}

export const getAdminNotifications = async (params?: { limit?: number; unreadOnly?: boolean }): Promise<{ success: boolean; notifications: AdminNotification[]; unreadCount: number }> => {
  const res = await api.get('/admin/notifications', { params });
  return res.data;
};

export const markNotificationRead = async (id: string): Promise<{ success: boolean; notification: AdminNotification; unreadCount: number }> => {
  const res = await api.patch(`/admin/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async (): Promise<{ success: boolean; message: string; unreadCount: number }> => {
  const res = await api.patch('/admin/notifications/read-all');
  return res.data;
};

export const markAdminNotificationRead = markNotificationRead;
export const markAllAdminNotificationsRead = markAllNotificationsRead;

/* =========================================================
   BLOGS & EDITORIAL ARTICLES
   ========================================================= */

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const getBlogs = async (params: { tag?: string; page?: number; limit?: number } = {}) => {
  const res = await api.get('/blogs', { params });
  return res.data;
};

export const getBlogBySlug = async (slug: string) => {
  const res = await api.get(`/blogs/${slug}`);
  return res.data;
};

export const getAdminBlogs = async (params: { q?: string } = {}) => {
  const res = await api.get('/blogs/admin/all', { params });
  return res.data;
};

export const createAdminBlog = async (data: Partial<BlogItem>) => {
  const res = await api.post('/blogs', data);
  return res.data;
};

export const updateAdminBlog = async (id: string, data: Partial<BlogItem>) => {
  const res = await api.put(`/blogs/${id}`, data);
  return res.data;
};

export const deleteAdminBlog = async (id: string) => {
  const res = await api.delete(`/blogs/${id}`);
  return res.data;
};

/* =========================================================
   FAQS (FREQUENTLY ASKED QUESTIONS)
   ========================================================= */

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export const getFAQs = async (): Promise<{ success: boolean; faqs: FAQItem[] }> => {
  const res = await api.get('/faqs');
  return res.data;
};

export const getPublicFAQs = getFAQs;

export const getAdminFAQs = async (): Promise<{ success: boolean; faqs: FAQItem[]; total: number }> => {
  const res = await api.get('/faqs/admin');
  return res.data;
};

export const createAdminFAQ = async (data: Partial<FAQItem>) => {
  const res = await api.post('/faqs', data);
  return res.data;
};

export const updateAdminFAQ = async (id: string, data: Partial<FAQItem>) => {
  const res = await api.put(`/faqs/${id}`, data);
  return res.data;
};

export const deleteAdminFAQ = async (id: string) => {
  const res = await api.delete(`/faqs/${id}`);
  return res.data;
};
