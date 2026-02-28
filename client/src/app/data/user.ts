export interface User {
  id: string;
  name: string;
  points: number;
  avatar?: string;
}

export interface OrderHistory {
  id: string;
  date: string;
  items: any[];
  total: number;
  pointsEarned: number;
}

// Mock user data
export const mockUser: User = {
  id: "user-1",
  name: "Пользователь",
  points: 250,
};

// Points system: 10% of order total
export const calculatePoints = (total: number): number => {
  return Math.floor(total * 0.1);
};
