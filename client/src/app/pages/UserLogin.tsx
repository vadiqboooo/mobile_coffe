import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { loginUser } from "../api/api";

const AVATARS = [
  "👤",
  "🧑",
  "👨",
  "👩",
  "🧔",
  "👱",
  "👲",
  "👳",
];

export default function UserLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser({ name: name.trim(), avatar: selectedAvatar });
      
      // Store token and user info
      localStorage.setItem("user_token", response.access_token);
      localStorage.setItem("user_id", response.user_id);
      localStorage.setItem("user_name", name.trim());
      localStorage.setItem("user_avatar", selectedAvatar);
      
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-amber-900 mb-6 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад в меню</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-amber-900" />
            </div>
            <h1 className="text-2xl font-bold text-amber-900 mb-2">
              Добро пожаловать
            </h1>
            <p className="text-amber-600">
              Введите имя для входа в систему лояльности
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-2">
                Ваше имя
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
                className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-amber-900"
                autoFocus
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Выберите аватар
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`p-3 rounded-xl text-3xl transition-all ${
                      selectedAvatar === avatar
                        ? "bg-amber-100 ring-2 ring-amber-500"
                        : "bg-amber-50 hover:bg-amber-100"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="text-center text-xs text-amber-500 mt-4">
            При первом входе будет создан новый аккаунт
          </p>
        </div>
      </div>
    </div>
  );
}
