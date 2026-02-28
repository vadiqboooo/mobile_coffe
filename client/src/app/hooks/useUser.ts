import { useState, useEffect } from "react";
import {
  getUser,
  getUserProfile,
  createOrder as apiCreateOrder,
  OrderItemCreate,
  User,
  OrderHistory,
} from "../api/api";

const DEFAULT_USER_ID = "user-1";

// Mock user for fallback
const MOCK_USER: User = {
  id: DEFAULT_USER_ID,
  name: "Пользователь",
  points: 0,
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from API on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile(DEFAULT_USER_ID);
        setUser(profile.user);
        setOrderHistory(profile.orderHistory);
        setTotalSpent(profile.totalSpent);
        setTotalPointsEarned(profile.totalPointsEarned);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        // Use mock user as fallback
        setUser(MOCK_USER);
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const addOrder = async (items: OrderItemCreate[]) => {
    if (!user) throw new Error("User not loaded");

    try {
      const order = await apiCreateOrder(user.id, items);

      // Update order history
      const newOrder: OrderHistory = {
        id: order.id,
        date: order.created_at,
        items: order.items,
        total: order.total,
        pointsEarned: order.points_earned,
      };
      setOrderHistory((prev) => [newOrder, ...prev]);
      setTotalSpent((prev) => prev + order.total);
      setTotalPointsEarned((prev) => prev + order.points_earned);

      // Update user points
      if (user) {
        setUser({ ...user, points: user.points + order.points_earned });
      }

      return order;
    } catch (err) {
      console.error("Failed to create order:", err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await getUserProfile(DEFAULT_USER_ID);
      setUser(profile.user);
      setOrderHistory(profile.orderHistory);
      setTotalSpent(profile.totalSpent);
      setTotalPointsEarned(profile.totalPointsEarned);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return {
    user,
    orderHistory,
    totalSpent,
    totalPointsEarned,
    isLoading,
    error,
    addOrder,
    refreshProfile,
  };
}
