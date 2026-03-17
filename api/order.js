const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(200).send('OK');

    try {
        const data = req.body;
        
        const DRIVER_ID = '993037802';
        const ADMIN_ID = '993037802';
        const DRIVER_TOKEN = '8640774352:AAHiHJbjctBaJwcxJFfK16mjChHpxfpMZHw';
        const ADMIN_TOKEN = '8672148337:AAEmIFVKJNDo5gJUNzcwGBBXJbalN_8voQ0';
        const CLIENT_TOKEN = process.env.BOT_TOKEN; // Убедитесь, что в Vercel есть эта переменная

        const driverBot = new Telegraf(DRIVER_TOKEN);
        const adminBot = new Telegraf(ADMIN_TOKEN);
        const clientBot = new Telegraf(CLIENT_TOKEN);

        const msg = `🚕 НОВЫЙ ЗАКАЗ\n👤 Клиент: ${data.user.first_name}\n📍 Откуда: ${data.from}\n📍 Куда: ${data.to}\n💰 Цена: ${data.price}`;

        // Шлем водителю
        await driverBot.telegram.sendMessage(DRIVER_ID, msg, { parse_mode: 'HTML' });
        
        // Шлем админу
        await adminBot.telegram.sendMessage(ADMIN_ID, msg, { parse_mode: 'HTML' });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error' });
    }
};
