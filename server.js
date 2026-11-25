const express = require('express');
const path = require('path');
const ordersDb = require('./database');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'AboutMe.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'info.html'));
});

app.get('/api/convert', (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const amount = Number(req.query.amount);

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Неверная сумма' });
    }

    let rate = 0;

    if (from === 'USD' && to === 'EUR') {
        rate = 0.92;
    } else if (from === 'EUR' && to === 'RUB') {
        rate = 105;
    } else if (from === 'USD' && to === 'RUB') {
        rate = 92;
    } else {
        return res.status(400).json({ error: 'Неизвестная валюта' });
    }

    const result = amount * rate;

    res.json({
        from: from,
        to: to,
        amount: amount,
        result: result,
        rate: rate
    });
});

const ALLOWED_STATUSES = ['new', 'paid', 'shipped', 'delivered'];

app.get('/api/orders', async (req, res) => {
    try {
        const { status } = req.query;

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Недопустимый статус для фильтрации' });
        }

        const orders = await ordersDb.getOrders(status);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера при получении заказов' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, total_amount } = req.body;

        if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
            return res.status(400).json({ error: 'Поле customer_name обязательно' });
        }

        if (typeof total_amount !== 'number' || Number.isNaN(total_amount) || total_amount < 0) {
            return res.status(400).json({ error: 'total_amount должен быть числом >= 0' });
        }

        const newOrder = await ordersDb.createOrder(customer_name.trim(), total_amount);
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера при создании заказа' });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!status || !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                error: `Неизвестный статус. Допустимые значения: ${ALLOWED_STATUSES.join(', ')}`
            });
        }

        const updatedOrder = await ordersDb.updateOrderStatus(id, status);

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера при обновлении статуса' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isDeleted = await ordersDb.deleteOrder(id);

        if (!isDeleted) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json({ message: 'Заказ успешно удалён', id });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера при удалении заказа' });
    }
});

app.listen(PORT, () => {
    console.log('Сервер работает на http://localhost:3000');
});
