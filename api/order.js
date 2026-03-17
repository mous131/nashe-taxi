const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(200).send('OK');

    try {
        const data = req.body;
        const { user, from, to, price } = data;
        
        // 1. ID куда слать (Ваши ID)
        const DRIVER_ID = '993037802';
        const ADMIN_ID = '993037802';

        // 2. Токены ботов
        const DRIVER_TOKEN = '8640774352:AAHiHJbjctBaJwcxJFfK16mjChHpxfpMZHw';
        const ADMIN_TOKEN = '8672148337:AAEmIFVKJNDo5gJUNzcwGBBXJbalN_8voQ0';
        
        // Токен клиентского бота (чтобы слать сообщение клиенту "Водитель едет")
        // Он должен быть в настройках Vercel, но если нет - вставьте сюда вручную
        const CLIENT_TOKEN = process.env.BOT_TOKEN; 

        const driverBot = new Telegraf(DRIVER_TOKEN);
        const adminBot = new Telegraf(ADMIN_TOKEN);
        const clientBot = new Telegraf(CLIENT_TOKEN);

        const userName = user.first_name;
        const userId = user.id;
        const userLink = user.username ? `@${user.username}` : `ID: ${userId}`;

        const message = `
🚕 <b>НОВЫЙ ЗАКАЗ</b>

👤 <b>Клиент:</b> ${userLink} (${userName})
📍 <b>Откуда:</b> ${from}
📍 <b>Куда:</b> ${to}
💰 <b>Цена:</b> ${price}
        `;

        // 3. Отправляем Водителю (с кнопками)
        await driverBot.telegram.sendMessage(DRIVER_ID, message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ Принять", callback_data: `accept_${userId}` },
                        { text: "❌ Отклонить", callback_data: `reject_${userId}` }
                    ]
                ]
            }
        });

        // 4. Отправляем Админу (лог)
        await adminBot.telegram.sendMessage(ADMIN_ID, message + `\n🔔 Статус: Поиск водителя`, {
            parse_mode: 'HTML'
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
