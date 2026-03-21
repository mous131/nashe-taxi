const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    // Разрешаем CORS
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
        const data = req.body;
        
        // Получаем токены из переменных окружения
        const DRIVER_ID = process.env.DRIVER_ID;
        const ADMIN_ID = process.env.ADMIN_ID;
        const DRIVER_TOKEN = process.env.DRIVER_TOKEN;
        const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
        const CLIENT_TOKEN = process.env.BOT_TOKEN;

        if (!DRIVER_TOKEN || !ADMIN_TOKEN || !CLIENT_TOKEN) {
            console.error('Missing tokens');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const driverBot = new Telegraf(DRIVER_TOKEN);
        const adminBot = new Telegraf(ADMIN_TOKEN);
        
        // Формируем сообщение
        const orderMsg = `
🚕 <b>НОВЫЙ ЗАКАЗ</b>

👤 <b>Клиент:</b> ${data.user?.first_name || 'Неизвестно'} ${data.user?.last_name || ''}
🆔 <b>ID:</b> <code>${data.user?.id || 'Нет ID'}</code>
@${data.user?.username || 'нет username'}

📍 <b>Откуда:</b> ${data.from || 'Не указано'}
📍 <b>Куда:</b> ${data.to || 'Не указано'}
💰 <b>Цена:</b> ${data.price || '0'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
        `;

        // Отправляем водителю
        await driverBot.telegram.sendMessage(DRIVER_ID, orderMsg, { 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Принять заказ", callback_data: `accept_${Date.now()}` },
                        { text: "❌ Отклонить", callback_data: `reject_${Date.now()}` }
                    ]
                ]
            }
        });
        
        // Отправляем админу
        await adminBot.telegram.sendMessage(ADMIN_ID, orderMsg, { parse_mode: 'HTML' });

        // Отправляем подтверждение клиенту
        try {
            const clientBot = new Telegraf(CLIENT_TOKEN);
            await clientBot.telegram.sendMessage(
                data.user?.id, 
                "✅ Ваш заказ принят! Ищем ближайшего водителя.\n\nОжидайте, скоро с вами свяжутся."
            );
        } catch (e) {
            console.log('Не удалось отправить сообщение клиенту');
        }

        res.status(200).json({ 
            success: true, 
            message: 'Заказ отправлен водителям' 
        });
        
    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};
// api/order.js - добавить в начало файла
const fetch = require('node-fetch'); // если нужно, установите: npm install node-fetch

// В функции создания заказа, перед сохранением, добавьте:
async function calculateOptimalPrice(distance) {
    try {
        const response = await fetch(`${process.env.VERCEL_URL}/api/calculate-price`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ distance })
        });
        const data = await response.json();
        return data.tariffs?.economy || distance * 50;
    } catch (error) {
        return distance * 50; // fallback цена
    }
}

// В вашем существующем коде, где создается заказ:
const optimalPrice = await calculateOptimalPrice(distance);
