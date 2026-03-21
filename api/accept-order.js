
// api/accept-order.js
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { orderId, driverId } = req.body;
        
        // Здесь будет логика принятия заказа
        // Пока просто имитируем успех
        
        res.status(200).json({
            success: true,
            message: `Заказ #${orderId} принят водителем ${driverId}`
        });
        
    } catch (error) {
        console.error('Error accepting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
