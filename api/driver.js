const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Driver bot works!');
  }

  try {
    const DRIVER_TOKEN = process.env.DRIVER_TOKEN;
    const WEB_APP_URL = 'https://mous131.github.io/nashe-taxi/driver.html'; // ТВОЙ URL НА GITHUB

    if (!DRIVER_TOKEN) {
      return res.status(500).send('Driver token not configured');
    }

    const bot = new Telegraf(DRIVER_TOKEN);
    const body = req.body;

    // Обработка callback кнопок
    if (body && body.callback_query) {
      const callback = body.callback_query;
      const data = callback.data;
      const driverId = callback.from.id;

      if (data.startsWith('accept_')) {
        const orderId = data.split('_')[1];
        
        await bot.telegram.answerCbQuery(callback.id, "Заказ принят!");
        await bot.telegram.editMessageText(
          driverId, 
          callback.message.message_id, 
          null,
          callback.message.text + "\n\n✅ Вы приняли заказ!",
          { parse_mode: 'HTML' }
        );
        
      } else if (data.startsWith('reject_')) {
        await bot.telegram.answerCbQuery(callback.id, "Заказ отклонен");
        await bot.telegram.editMessageText(
          driverId,
          callback.message.message_id,
          null,
          callback.message.text + "\n\n❌ Заказ отклонен",
          { parse_mode: 'HTML' }
        );
      }

      return res.status(200).send('OK');
    }

    // Команда /start
    if (body && body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      await bot.telegram.sendMessage(chatId,
        `🚖 *Панель водителя*\n\n` +
        `Нажмите кнопку ниже, чтобы открыть карту заказов.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{
              text: "🗺 Открыть карту заказов",
              web_app: { url: WEB_APP_URL }
            }]],
            resize_keyboard: true
          }
        }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Driver bot error:', error);
    res.status(500).send('Error');
  }
};
