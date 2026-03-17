const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  const BOT_TOKEN = '8672148337:AAEmIFVKJNDo5gJUNzcwGBBXJbalN_8voQ0'; // Токен админа
  const bot = new Telegraf(BOT_TOKEN);
  const { body } = req;

  if (body && body.message && body.message.text === '/start') {
    const chatId = body.message.chat.id;
    
    // Отправляем вам (админу) ваш Chat ID
    await bot.telegram.sendMessage(chatId, 
      `🛡 Панель администратора активна.\n\n` +
      `Ваш Chat ID: \`${chatId}\`\n\n` +
      `Сообщите этот ID разработчику.`,
      { parse_mode: 'Markdown' }
    );
  }
  
  res.status(200).send('OK');
};
