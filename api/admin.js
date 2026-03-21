const { Telegraf } = require('telegraf');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Admin bot works!');
  }

  try {
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
    const ADMIN_ID = process.env.ADMIN_ID;

    if (!ADMIN_TOKEN) {
      return res.status(500).send('Admin token not configured');
    }

    const bot = new Telegraf(ADMIN_TOKEN);
    const body = req.body;

    if (body && body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      
      // Проверяем, админ ли это
      if (chatId.toString() === ADMIN_ID) {
        await bot.telegram.sendMessage(chatId,
          `🛡 *Панель администратора*\n\n` +
          `Доступные команды:\n` +
          `/stats - статистика\n` +
          `/drivers - список водителей\n` +
          `/broadcast - рассылка`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await bot.telegram.sendMessage(chatId, "У вас нет доступа к панели администратора.");
      }
    }
    
    // Статистика
    if (body && body.message && body.message.text === '/stats') {
      const chatId = body.message.chat.id;
      if (chatId.toString() === ADMIN_ID) {
        await bot.telegram.sendMessage(chatId,
          `📊 *Статистика*\n\n` +
          `Заказов сегодня: 0\n` +
          `Водителей онлайн: 0\n` +
          `Выручка: 0 ₽`,
          { parse_mode: 'Markdown' }
        );
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Admin bot error:', error);
    res.status(500).send('Error');
  }
};
