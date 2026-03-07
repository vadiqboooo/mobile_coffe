import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { getCurrentUser, loginUser } from "../api/api";
import { User } from "../api/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, avatar?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("user_token");
      const userId = localStorage.getItem("user_id");

      if (token && userId) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
        } catch (err) {
          console.error("Failed to get current user:", err);
          // Token invalid, clear storage
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("user_name");
          localStorage.removeItem("user_avatar");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (name: string, avatar?: string) => {
    const response = await loginUser({ name, avatar });
    localStorage.setItem("user_token", response.access_token);
    localStorage.setItem("user_id", response.user_id);
    localStorage.setItem("user_name", name);
    localStorage.setItem("user_avatar", avatar || "👤");
    
    const userData = await getCurrentUser(response.access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_avatar");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
