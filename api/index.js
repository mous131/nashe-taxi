const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  try {
    // 1. Токен лучше хранить в настройках Vercel, но для теста можно тут
    // РЕКОМЕНДАЦИЯ: Вставьте сюда свой токен, потом уберем
   const BOT_TOKEN = process.env.BOT_TOKEN;
    const WEB_APP_URL = 'https://mous131.github.io/nashe-taxi/';

    const bot = new Telegraf(BOT_TOKEN);
    const { body } = req;

    // Обрабатываем обновление от Telegram
    if (body && body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      const firstName = body.message.from.first_name;

      await bot.telegram.sendMessage(chatId, 
        `👋 *Привет, ${firstName}!*\n\n` +
        `Добро пожаловать в «Наше Такси».\n` +
        `Нажмите кнопку ниже, чтобы вызвать машину.\n\n` +
        `🚕 *Быстро. Надежно. По-свойски.*`, 
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚕 Вызвать такси", web_app: { url: WEB_APP_URL } }]
            ]
          }
        }
      );
    }

    res.status(200).send('OK');
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};
// --- Новый код для приема заказов ---
if (body && body.type === 'order') {
    const userName = body.user.first_name;
    const userId = body.user.id;
    const destination = body.to;

    // Здесь можно отправить админу уведомление или записать в базу
    console.log(`НОВЫЙ ЗАКАЗ от ${userName}: едет в ${destination}`);
    
    // Отвечаем приложению, что всё ок
    res.status(200).json({ ok: true, message: "Заказ принят" });
    return; // Завершаем выполнение
}
