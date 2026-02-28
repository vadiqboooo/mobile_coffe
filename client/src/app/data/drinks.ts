export interface Drink {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface DrinkCustomization {
  bean: string;
  milk: string;
  syrup: string;
}

export interface CartItem {
  drink: Drink;
  customization: DrinkCustomization;
  quantity: number;
  id: string;
}

export const drinks: Drink[] = [
  {
    id: "americano",
    name: "Американо",
    description: "Классический эспрессо с горячей водой",
    price: 150,
    image: "https://images.unsplash.com/photo-1622465413095-2ee67c192522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBhbWVyaWNhbm98ZW58MXx8fHwxNzcxMDUzMTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "cappuccino",
    name: "Капучино",
    description: "Эспрессо с молочной пеной",
    price: 180,
    image: "https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDF8fHx8MTc3MTAyMTY1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "latte",
    name: "Латте",
    description: "Нежный кофе с молоком",
    price: 190,
    image: "https://images.unsplash.com/photo-1669162364316-a74b2d661d1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGNvZmZlZSUyMGFydHxlbnwxfHx8fDE3NzEwNDUyODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "filter",
    name: "Фильтр кофе",
    description: "Альтернативный способ заваривания",
    price: 170,
    image: "https://images.unsplash.com/photo-1637944220531-5f6fd15c1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWx0ZXIlMjBjb2ZmZWUlMjBwb3VyJTIwb3ZlcnxlbnwxfHx8fDE3NzEwNTMxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: "hot-chocolate",
    name: "Горячий шоколад",
    description: "Согревающий напиток из шоколада",
    price: 200,
    image: "https://images.unsplash.com/photo-1643641543738-04aac0809fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBjaG9jb2xhdGUlMjBkcmlua3xlbnwxfHx8fDE3NzEwNTMxNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
];

export const beanOptions = [
  { id: "arabica", name: "Арабика", price: 0 },
  { id: "robusta", name: "Робуста", price: 10 },
  { id: "blend", name: "Смесь", price: 5 },
];

export const milkOptions = [
  { id: "regular", name: "Обычное", price: 0 },
  { id: "almond", name: "Миндальное", price: 30 },
  { id: "oat", name: "Овсяное", price: 30 },
  { id: "soy", name: "Соевое", price: 25 },
  { id: "coconut", name: "Кокосовое", price: 35 },
];

export const syrupOptions = [
  { id: "none", name: "Без сиропа", price: 0 },
  { id: "vanilla", name: "Ваниль", price: 40 },
  { id: "caramel", name: "Карамель", price: 40 },
  { id: "hazelnut", name: "Фундук", price: 40 },
  { id: "chocolate", name: "Шоколад", price: 40 },
];
