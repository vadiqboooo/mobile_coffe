const API_BASE_URL = "http://localhost:8000/api";

// Types
export interface Drink {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_active: boolean;
}

export interface Option {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  drink: Drink;
  customization: {
    bean: string;
    milk: string;
    syrup: string;
  };
  quantity: number;
  id: string;
}

export interface OrderItemCreate {
  drink_id: string;
  quantity: number;
  bean_option: string;
  milk_option: string;
  syrup_option: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  points: number;
  avatar?: string | null;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  drink_id: string;
  quantity: number;
  bean_option: string;
  milk_option: string;
  syrup_option: string;
  price: number;
  drink?: Drink;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  points_earned: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderHistory {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  pointsEarned: number;
}

export interface UserProfile {
  user: User;
  orderHistory: OrderHistory[];
  totalSpent: number;
  totalPointsEarned: number;
}

export interface AdminLogin {
  username: string;
  password: string;
}

export interface DrinkUpdate {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  is_active?: boolean;
}

// API functions
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// Drinks API
export async function getDrinks(): Promise<Drink[]> {
  const response = await fetch(`${API_BASE_URL}/drinks`);
  return handleResponse<Drink[]>(response);
}

export async function getDrink(id: string): Promise<Drink> {
  const response = await fetch(`${API_BASE_URL}/drinks/${id}`);
  return handleResponse<Drink>(response);
}

export async function getBeanOptions(): Promise<Option[]> {
  const response = await fetch(`${API_BASE_URL}/drinks/options/beans`);
  return handleResponse<Option[]>(response);
}

export async function getMilkOptions(): Promise<Option[]> {
  const response = await fetch(`${API_BASE_URL}/drinks/options/milk`);
  return handleResponse<Option[]>(response);
}

export async function getSyrupOptions(): Promise<Option[]> {
  const response = await fetch(`${API_BASE_URL}/drinks/options/syrups`);
  return handleResponse<Option[]>(response);
}

// Users API
export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse<User>(response);
}

export async function createUser(data: { name: string; points?: number; avatar?: string }): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/profile`);
  return handleResponse<UserProfile>(response);
}

export async function createOrder(
  userId: string,
  items: OrderItemCreate[]
): Promise<Order> {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const points_earned = Math.floor(total * 0.1);

  const response = await fetch(`${API_BASE_URL}/users/${userId}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      total,
      points_earned,
      items,
    }),
  });
  return handleResponse<Order>(response);
}

// Admin API
export async function loginUser(username: string, password: string): Promise<{ access_token: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<{ access_token: string }>(response);
}

export async function getAllOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return handleResponse<Order[]>(response);
}

export async function getAllUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return handleResponse<User[]>(response);
}

export async function updateDrink(
  token: string,
  id: string,
  data: { name?: string; description?: string; price?: number; image?: string; is_active?: boolean }
): Promise<Drink> {
  const response = await fetch(`${API_BASE_URL}/admin/drinks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Drink>(response);
}

export async function createDrink(
  token: string,
  data: { name: string; description: string; price: number; image: string }
): Promise<Drink> {
  const response = await fetch(`${API_BASE_URL}/admin/drinks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Drink>(response);
}

export async function deleteDrink(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/drinks/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
}
