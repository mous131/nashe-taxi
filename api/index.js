const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  // 1. Проверка метода запроса (Telegram шлет POST)
  if (req.method !== 'POST') {
    return res.status(200).send('Сервер работает! Но это не запрос Telegram.');
  }

  try {
    // 2. Получаем токен
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('ОШИБКА: BOT_TOKEN не найден в настройках Vercel!');
      return res.status(500).send('Server config error');
    }

    // 3. Ваша ссылка на приложение (ЗАМЕНИТЕ ВАШ_НИК!)
    const WEB_APP_URL = 'https://ВАШ_НИК.github.io/nashe-taxi/';

    const bot = new Telegraf(BOT_TOKEN);
    const body = req.body;

    // 4. Обработка команды /start
    if (body && body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      const firstName = body.message.from.first_name;

      await bot.telegram.sendMessage(chatId, 
        `👋 *Привет, ${firstName}!*\n\n` +
        `Добро пожаловать в «Наше Такси».\n` +
        `Нажмите кнопку ниже, чтобы вызвать машину.`, 
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚕 Вызвать такси", web_app: { url: WEB_APP_URL } }]
            ]
          }
        }
      );
      return res.status(200).send('OK');
    }

    // 5. Обработка Заказа (из приложения)
    if (body && body.to) {
        const userName = body.user ? body.user.first_name : 'Гость';
        console.log(`🚕 НОВЫЙ ЗАКАЗ от ${userName} -> ${body.to}`);
        return res.status(200).json({ ok: true, message: "Заказ принят" });
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Критическая ошибка:', error);
    res.status(500).send('Internal Error');
  }
};
