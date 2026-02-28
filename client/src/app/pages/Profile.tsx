import { useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { ArrowLeft, Award, Clock, TrendingUp, QrCode, X, Settings } from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const { user, orderHistory, isLoading } = useUser();
  const [showQR, setShowQR] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-amber-900 text-xl">Загрузка...</div>
      </div>
    );
  }

  const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
  const totalPointsEarned = orderHistory.reduce((sum, order) => sum + order.pointsEarned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100">
        <div className="px-4 py-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-amber-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-amber-900" />
            </button>
            <h1 className="text-xl font-bold text-amber-900">Профиль</h1>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors"
            title="Admin Panel"
          >
            <Settings className="w-6 h-6 text-amber-900" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-amber-100 text-sm">ID: {user.id}</p>
            </div>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition-colors"
          >
            <div>
              <p className="text-amber-100 text-sm mb-1">Баланс баллов</p>
              <p className="text-3xl font-bold">{user.points}</p>
            </div>
            <Award className="w-12 h-12 text-amber-200" />
          </button>
          <p className="text-amber-100 text-xs text-center mt-3">
            Нажмите для показа QR-кода
          </p>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative">
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 hover:bg-amber-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-amber-900" />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-900">Карта лояльности</h3>
              </div>
              
              <div className="bg-white p-4 rounded-xl border-4 border-amber-200 flex justify-center mb-4">
                <QRCode
                  value={`LOYALTY_CARD:${user.id}:${user.points}`}
                  size={200}
                  fgColor="#78350f"
                  bgColor="#ffffff"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-amber-900">{user.points} баллов</p>
                <p className="text-sm text-amber-600">
                  Покажите этот QR-код на кассе для начисления баллов
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-700">Всего потрачено</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{totalSpent} ₽</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-700">Получено баллов</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">{totalPointsEarned}</p>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            История заказов
          </h3>
          
          {orderHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-amber-700">Заказов пока нет</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 text-amber-600 font-medium hover:text-amber-700"
              >
                Перейти в меню
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orderHistory.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-amber-600 mb-1">
                        {new Date(order.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-amber-500">Заказ #{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-900">{order.total} ₽</p>
                      <p className="text-xs text-green-600 font-medium">
                        +{order.pointsEarned} баллов
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-amber-100 pt-3 space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-amber-700">
                          {item.drink.name} x{item.quantity}
                        </span>
                        <span className="text-amber-600 text-xs">
                          {item.customization.bean}, {item.customization.milk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}