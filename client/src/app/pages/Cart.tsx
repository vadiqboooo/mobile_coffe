import { useNavigate } from "react-router";
import { useCart } from "../hooks/useCart";
import { useUser } from "../hooks/useUser";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { OrderItemCreate } from "../api/api";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, addOrder, refreshProfile, isLoading: isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-amber-900 text-xl">Загрузка...</div>
      </div>
    );
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.drink.price + calculateExtras(item)) * item.quantity,
    0
  );

  function calculateExtras(item: any) {
    // Calculate extra costs based on customizations
    return 0; // Simplified for now
  }

  const handleCheckout = async () => {
    if (!user) {
      alert("Ошибка: пользователь не загружен");
      return;
    }

    try {
      // Convert cart items to API format
      const orderItems: OrderItemCreate[] = cart.map((item) => ({
        drink_id: item.drink.id,
        quantity: item.quantity,
        bean_option: item.customization.bean,
        milk_option: item.customization.milk,
        syrup_option: item.customization.syrup,
        price: item.drink.price + calculateExtras(item),
      }));

      // Create order via API
      await addOrder(orderItems);

      const pointsEarned = Math.floor(totalPrice * 0.1);
      alert(`Заказ оформлен! Спасибо за покупку ☕\nВы получили ${pointsEarned} баллов!`);
      
      // Clear cart and refresh profile
      clearCart();
      await refreshProfile();
      navigate("/");
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Ошибка при оформлении заказа");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100">
          <div className="px-4 py-4 flex items-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-amber-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-amber-900" />
            </button>
            <h1 className="text-xl font-bold text-amber-900">Корзина</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-16 h-16 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Корзина пуста</h2>
          <p className="text-amber-700 mb-8">Добавьте напитки из меню</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-3 rounded-full font-bold hover:from-amber-700 hover:to-amber-800 transition-all"
          >
            Перейти в меню
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="px-4 py-4 flex items-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-amber-900" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-amber-900">Корзина</h1>
            <p className="text-sm text-amber-700">{cart.length} позиций</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              <img
                src={item.drink.image}
                alt={item.drink.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-1">{item.drink.name}</h3>
                <div className="text-xs text-amber-700 space-y-1">
                  <div>Зерно: {item.customization.bean}</div>
                  <div>Молоко: {item.customization.milk}</div>
                  <div>Сироп: {item.customization.syrup}</div>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 h-fit hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="border-t border-amber-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition-colors"
                >
                  <Minus className="w-4 h-4 text-amber-900" />
                </button>
                <span className="font-bold text-amber-900 w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-900" />
                </button>
              </div>
              <div className="font-bold text-lg text-amber-900">
                {(item.drink.price + calculateExtras(item)) * item.quantity} ₽
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-amber-700 font-medium">Итого:</span>
            <span className="text-2xl font-bold text-amber-900">{totalPrice} ₽</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-amber-700 hover:to-amber-800 transition-all"
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
}