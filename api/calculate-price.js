// api/calculate-price.js
// Адаптируем логику из Yandex-Go для расчета стоимости

const PRICE_PER_KM = 50; // базовая цена за км
const PRICE_PER_MINUTE = 10; // цена за минуту
const BASE_PRICE = 99; // минимальная стоимость
const SURGE_MULTIPLIER = 1.5; // множитель в час пик (можно динамически)

// Функция для расчета времени в пути (в минутах) на основе расстояния и скорости
function calculateTravelTime(distanceKm, timeOfDay) {
    // Средняя скорость в городе: 25 км/ч = 0.417 км/мин
    let avgSpeed = 25;
    
    // Корректируем скорость в зависимости от времени суток
    if (timeOfDay === 'peak') {
        avgSpeed = 15; // Час пик - пробки
    } else if (timeOfDay === 'night') {
        avgSpeed = 40; // Ночью быстрее
    }
    
    const timeMinutes = (distanceKm / avgSpeed) * 60;
    return Math.ceil(timeMinutes);
}

// Расчет стоимости с учетом динамических факторов
function calculatePrice(distanceKm, timeOfDay = 'normal', weather = 'good') {
    let price = BASE_PRICE;
    
    // Стоимость за километраж
    price += distanceKm * PRICE_PER_KM;
    
    // Примерное время в пути
    const travelTime = calculateTravelTime(distanceKm, timeOfDay);
    price += travelTime * PRICE_PER_MINUTE;
    
    // Коэффициент времени суток
    let timeMultiplier = 1;
    if (timeOfDay === 'peak') timeMultiplier = 1.3;
    if (timeOfDay === 'night') timeMultiplier = 1.2;
    
    // Погодный коэффициент
    let weatherMultiplier = 1;
    if (weather === 'rain') weatherMultiplier = 1.2;
    if (weather === 'snow') weatherMultiplier = 1.3;
    
    price = price * timeMultiplier * weatherMultiplier;
    
    // Применяем surge-цену в час пик
    if (timeOfDay === 'peak') {
        price *= SURGE_MULTIPLIER;
    }
    
    return Math.round(price);
}

// Получение времени суток
function getTimeOfDay() {
    const hour = new Date().getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
        return 'peak';
    } else if (hour >= 23 || hour <= 5) {
        return 'night';
    }
    return 'normal';
}

// Асинхронное вычисление с использованием оркестратора (как в Yandex-Go)
async function calculateWithOrchestrator(expression) {
    // Здесь можно отправить задачу в оркестратор
    // Пока используем локальный расчет
    return eval(expression);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { distance, from, to, route } = req.body;
        
        if (!distance) {
            return res.status(400).json({ error: 'Distance is required' });
        }
        
        const timeOfDay = getTimeOfDay();
        
        // Учитываем пробки (можно добавить API Яндекс.Карт или 2GIS)
        const trafficMultiplier = route?.traffic || 1;
        
        // Расчет цены
        let price = calculatePrice(distance, timeOfDay);
        price = Math.round(price * trafficMultiplier);
        
        // Альтернативные тарифы (как в Yandex-Go)
        const tariffs = {
            economy: price,
            comfort: Math.round(price * 1.3),
            business: Math.round(price * 1.8),
            minivan: Math.round(price * 1.5)
        };
        
        res.status(200).json({
            success: true,
            price,
            tariffs,
            details: {
                distance: distance.toFixed(1),
                basePrice: BASE_PRICE,
                pricePerKm: PRICE_PER_KM,
                timeOfDay,
                estimatedTime: calculateTravelTime(distance, timeOfDay),
                surgeApplied: timeOfDay === 'peak'
            }
        });
        
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Calculation error' });
    }
};
