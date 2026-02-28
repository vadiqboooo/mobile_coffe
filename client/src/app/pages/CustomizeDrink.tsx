import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { getDrink, getBeanOptions, getMilkOptions, getSyrupOptions, Drink, Option } from "../api/api";

export default function CustomizeDrink() {
  const navigate = useNavigate();
  const { drinkId } = useParams();
  const { addToCart } = useCart();

  const [drink, setDrink] = useState<Drink | null>(null);
  const [beanOptions, setBeanOptions] = useState<Option[]>([]);
  const [milkOptions, setMilkOptions] = useState<Option[]>([]);
  const [syrupOptions, setSyrupOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBean, setSelectedBean] = useState<string>("");
  const [selectedMilk, setSelectedMilk] = useState<string>("");
  const [selectedSyrup, setSelectedSyrup] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedDrink, beans, milks, syrups] = await Promise.all([
          getDrink(drinkId!),
          getBeanOptions(),
          getMilkOptions(),
          getSyrupOptions(),
        ]);
        setDrink(fetchedDrink);
        setBeanOptions(beans);
        setMilkOptions(milks);
        setSyrupOptions(syrups);
        if (beans.length) setSelectedBean(beans[0].id);
        if (milks.length) setSelectedMilk(milks[0].id);
        if (syrups.length) setSelectedSyrup(syrups[0].id);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (drinkId) {
      loadData();
    }
  }, [drinkId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-amber-900 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!drink) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-amber-900 text-xl">Напиток не найден</div>
      </div>
    );
  }

  const bean = beanOptions.find((b) => b.id === selectedBean)!;
  const milk = milkOptions.find((m) => m.id === selectedMilk)!;
  const syrup = syrupOptions.find((s) => s.id === selectedSyrup)!;

  const totalPrice = drink.price + bean.price + milk.price + syrup.price;

  const handleAddToCart = () => {
    addToCart({
      drink,
      customization: {
        bean: bean.name,
        milk: milk.name,
        syrup: syrup.name,
      },
      quantity: 1,
      id: `${drink.id}-${Date.now()}`,
    });
    navigate("/cart");
  };

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
            <h1 className="text-xl font-bold text-amber-900">Настройте напиток</h1>
            <p className="text-sm text-amber-700">{drink.name}</p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Drink Image */}
        <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-xl">
          <img
            src={drink.image}
            alt={drink.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{drink.name}</h2>
            <p className="text-white/90">{drink.description}</p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          {/* Bean Selection */}
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-3">Выберите зерно</h3>
            <div className="grid grid-cols-3 gap-3">
              {beanOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedBean(option.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBean === option.id
                      ? "border-amber-600 bg-amber-50 shadow-md"
                      : "border-amber-200 bg-white hover:border-amber-400"
                  }`}
                >
                  <div className="font-semibold text-amber-900 text-sm mb-1">
                    {option.name}
                  </div>
                  {option.price > 0 && (
                    <div className="text-xs text-amber-700">+{option.price} ₽</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Milk Selection */}
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-3">Выберите молоко</h3>
            <div className="space-y-2">
              {milkOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedMilk(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                    selectedMilk === option.id
                      ? "border-amber-600 bg-amber-50 shadow-md"
                      : "border-amber-200 bg-white hover:border-amber-400"
                  }`}
                >
                  <span className="font-semibold text-amber-900">{option.name}</span>
                  {option.price > 0 && (
                    <span className="text-sm text-amber-700">+{option.price} ₽</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Syrup Selection */}
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-3">Выберите сироп</h3>
            <div className="space-y-2">
              {syrupOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedSyrup(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                    selectedSyrup === option.id
                      ? "border-amber-600 bg-amber-50 shadow-md"
                      : "border-amber-200 bg-white hover:border-amber-400"
                  }`}
                >
                  <span className="font-semibold text-amber-900">{option.name}</span>
                  {option.price > 0 && (
                    <span className="text-sm text-amber-700">+{option.price} ₽</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 shadow-2xl">
        <div className="max-w-md mx-auto px-4 py-4">
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:from-amber-700 hover:to-amber-800 transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            Добавить в корзину • {totalPrice} ₽
          </button>
        </div>
      </div>
    </div>
  );
}
