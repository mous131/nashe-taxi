const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  const BOT_TOKEN = '8640774352:AAHiHJbjctBaJwcxJFfK16mjChHpxfpMZHw'; // Токен водителя
  const bot = new Telegraf(BOT_TOKEN);
  const { body } = req;

  if (body && body.message && body.message.text === '/start') {
    const chatId = body.message.chat.id;
    const firstName = body.message.from.first_name;
    
    // ОТправляем вам (водителю) его Chat ID
    await bot.telegram.sendMessage(chatId, 
      `👋 Привет, ${firstName}!\n\n` +
      `Вы зарегистрированы как **Водитель**.\n\n` +
      `Ваш Chat ID: \`${chatId}\`\n\n` +
      `Сообщите этот ID разработчику, чтобы получать заказы.`,
      { parse_mode: 'Markdown' }
    );
  }
  
  res.status(200).send('OK');
};
