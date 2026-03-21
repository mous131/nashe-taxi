module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Пока возвращаем тестовые данные
    // В будущем здесь будет запрос к базе данных
    
    const testOrders = [
        {
            id: 'ORD001',
            from: 'ул. Пушкина, 10',
            to: 'ул. Лермонтова, 25',
            price: '350 ₽',
            lat: 55.75,
            lon: 37.61,
            status: 'pending'
        }
    ];
    
    res.status(200).json({ 
        success: true, 
        orders: testOrders 
    });
};
