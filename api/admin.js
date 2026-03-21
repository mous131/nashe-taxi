const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Server works!');
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN not found');
      return res.status(500).send('Server config error');
    }

    const WEB_APP_URL = 'https://mous131.github.io/nashe-taxi/'; // ТВОЙ URL НА GITHUB
    const bot = new Telegraf(BOT_TOKEN);
    const body = req.body;

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
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Error');
  }
};
