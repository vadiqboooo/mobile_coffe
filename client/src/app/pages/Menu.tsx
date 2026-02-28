import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useUser } from "../hooks/useUser";
import { getDrinks, Drink } from "../api/api";

export default function Menu() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, isLoading: isUserLoading } = useUser();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const loadDrinks = async () => {
      try {
        const fetchedDrinks = await getDrinks();
        setDrinks(fetchedDrinks);
      } catch (error) {
        console.error("Failed to load drinks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDrinks();
  }, []);

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-amber-900 text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="px-4 py-4 flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">☕ Coffee Shop</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-full hover:bg-amber-200 transition-colors"
            >
              <User className="w-5 h-5 text-amber-900" />
              <span className="font-bold text-amber-900">{user?.points ?? 0}</span>
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="relative p-3 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-amber-900" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => navigate(`/customize/${drink.id}`)}
            className="w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex items-center gap-3 p-3"
          >
            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={drink.image}
                alt={drink.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-amber-900 mb-1">{drink.name}</h3>
              <p className="text-xs text-amber-600 line-clamp-2">{drink.description}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-amber-900">{drink.price} ₽</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}