const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
    const BOT_TOKEN = '8640774352:AAHiHJbjctBaJwcxJFfK16mjChHpxfpMZHw';
    const bot = new Telegraf(BOT_TOKEN);
    const { body } = req;

    // 1. Обработка кнопок (Принять/Отклонить)
    if (body && body.callback_query) {
        const callback = body.callback_query;
        const data = callback.data; // например "accept_123456"
        const driverId = callback.from.id;
        
        // Нам нужен токен КЛИЕНТСКОГО бота, чтобы написать клиенту
        // Он должен быть в ENV, либо вставьте сюда токен вашего первого бота вручную
        const CLIENT_TOKEN = process.env.BOT_TOKEN; 
        const clientBot = new Telegraf(CLIENT_TOKEN);

        if (data.startsWith('accept_')) {
            const clientId = data.split('_')[1];
            
            // Пишем водителю "ОК"
            await bot.telegram.answerCbQuery(callback.id, "Вы приняли заказ!");
            await bot.telegram.editMessageText(driverId, callback.message.message_id, null, 
                callback.message.text + "\n\n✅ <b>ВЫ ПРИНЯЛИ ЭТОТ ЗАКАЗ</b>", 
                { parse_mode: 'HTML' }
            );

            // Пишем клиенту "Водитель едет"
            try {
                await clientBot.telegram.sendMessage(clientId, "✅ Водитель принял ваш заказ! Ожидайте звонка.");
            } catch (e) {
                console.log("Не смогли написать клиенту (он не запускал бота или бот заблокирован)");
            }

        } else if (data.startsWith('reject_')) {
            await bot.telegram.answerCbQuery(callback.id, "Вы отклонили заказ.");
            await bot.telegram.editMessageText(driverId, callback.message.message_id, null, 
                callback.message.text + "\n\n❌ <b>ЗАКАЗ ОТКЛОНЕН</b>", 
                { parse_mode: 'HTML' }
            );
        }

        return res.status(200).send('OK');
    }

    // 2. Команда /start
    if (body && body.message && body.message.text === '/start') {
        const chatId = body.message.chat.id;
        await bot.telegram.sendMessage(chatId, 
            `👋 Вы в панели водителя.\n\nКогда поступит заказ, вы увидите его здесь.`,
            { parse_mode: 'Markdown' }
        );
    }
    
    res.status(200).send('OK');
};
