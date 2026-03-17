// api/order.js
const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    // Разрешаем CORS для твоего GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', 'https://mous131.github.io');
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
        
        // Берем токены из переменных окружения
        const DRIVER_ID = process.env.DRIVER_ID;
        const ADMIN_ID = process.env.ADMIN_ID;
        const DRIVER_TOKEN = process.env.DRIVER_TOKEN;
        const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
        const CLIENT_TOKEN = process.env.BOT_TOKEN;

        // Проверяем, что все токены есть
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

        // Отправляем водителю с кнопками
        await driverBot.telegram.sendMessage(DRIVER_ID, orderMsg, { 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Принять заказ", callback_data: `accept_${data.user?.id}` },
                        { text: "❌ Отклонить", callback_data: `reject_${data.user?.id}` }
                    ]
                ]
            }
        });
        
        // Отправляем админу (просто уведомление)
        await adminBot.telegram.sendMessage(ADMIN_ID, orderMsg, { 
            parse_mode: 'HTML'
        });

        // Отправляем подтверждение клиенту (через клиентского бота)
        try {
            const clientBot = new Telegraf(CLIENT_TOKEN);
            await clientBot.telegram.sendMessage(
                data.user?.id, 
                "✅ Ваш заказ принят! Ищем ближайшего водителя..."
            );
        } catch (e) {
            console.log('Не удалось отправить сообщение клиенту:', e.message);
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
