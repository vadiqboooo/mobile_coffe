import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  getAllOrders,
  getAllUsers,
  getDrinks,
  updateDrink,
  createDrink,
  deleteDrink,
  Order,
  User,
  Drink,
} from "../api/api";
import {
  LogOut,
  Users,
  ShoppingCart,
  Coffee,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, logout, isLoading: isAuthLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "drinks">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
  });

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth to finish loading
    if (!token) {
      navigate("/admin");
      return;
    }
    loadData();
  }, [token, navigate, isAuthLoading]);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [ordersData, usersData, drinksData] = await Promise.all([
        getAllOrders(token),
        getAllUsers(token),
        getDrinks(),
      ]);
      setOrders(ordersData);
      setUsers(usersData);
      setDrinks(drinksData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const handleDeleteDrink = async (id: string) => {
    if (!token) return;
    if (!confirm("Вы уверены, что хотите удалить этот напиток?")) return;

    try {
      await deleteDrink(token, id);
      setDrinks(drinks.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete drink:", error);
      alert("Ошибка при удалении");
    }
  };

  const handleToggleDrinkActive = async (drink: Drink) => {
    if (!token) return;
    try {
      const updated = await updateDrink(token, drink.id, {
        is_active: !drink.is_active,
      });
      setDrinks(drinks.map((d) => (d.id === drink.id ? updated : d)));
    } catch (error) {
      console.error("Failed to update drink:", error);
    }
  };

  const handleEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setFormData({
      name: drink.name,
      description: drink.description,
      price: drink.price,
      image: drink.image,
    });
    setShowDrinkForm(true);
  };

  const handleCreateDrink = () => {
    setEditingDrink(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "",
    });
    setShowDrinkForm(true);
  };

  const handleSubmitDrink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingDrink) {
        const updated = await updateDrink(token, editingDrink.id, formData);
        setDrinks(drinks.map((d) => (d.id === editingDrink.id ? updated : d)));
      } else {
        const created = await createDrink(token, formData);
        setDrinks([...drinks, created]);
      }
      setShowDrinkForm(false);
    } catch (error) {
      console.error("Failed to save drink:", error);
      alert("Ошибка при сохранении");
    }
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-4 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "orders"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Заказы
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "users"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab("drinks")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "drinks"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Напитки
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue} ₽</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Заказов</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">История заказов</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Заказов пока нет</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          Заказ #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString("ru-RU")}
                        </p>
                        <p className="text-sm text-gray-500">Пользователь: {order.user_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{order.total} ₽</p>
                        <p className="text-sm text-green-600">+{order.points_earned} баллов</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                          {item.quantity}x {item.bean_option}, {item.milk_option},{" "}
                          {item.syrup_option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Пользователи</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">{user.points} баллов</p>
                    {user.created_at && (
                      <p className="text-sm text-gray-500">
                        с {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drinks Tab */}
        {activeTab === "drinks" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Меню напитков</h2>
              <button
                onClick={handleCreateDrink}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Добавить
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drinks.map((drink) => (
                <div
                  key={drink.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{drink.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          drink.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {drink.is_active ? "Активен" : "Неактивен"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {drink.description}
                    </p>
                    <p className="text-lg font-bold text-amber-600 mb-4">{drink.price} ₽</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDrink(drink)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Изменить
                      </button>
                      <button
                        onClick={() => handleToggleDrinkActive(drink)}
                        className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                          drink.is_active
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {drink.is_active ? "Отключить" : "Включить"}
                      </button>
                      <button
                        onClick={() => handleDeleteDrink(drink.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Drink Form Modal */}
      {showDrinkForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingDrink ? "Изменить напиток" : "Новый напиток"}
            </h3>
            <form onSubmit={handleSubmitDrink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL изображения
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDrinkForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
