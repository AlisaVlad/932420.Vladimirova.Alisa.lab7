const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite (orders.db)');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'new'
        )
    `);
});

function getOrders(status) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM orders';
        const params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function createOrder(customer_name, total_amount) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO orders (customer_name, total_amount, status) VALUES (?, ?, 'new')`;
        db.run(sql, [customer_name, total_amount], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    customer_name,
                    total_amount,
                    status: 'new'
                });
            }
        });
    });
}

function updateOrderStatus(id, status) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        db.run(sql, [status, id], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null);
            } else {
                db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
}

function deleteOrder(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM orders WHERE id = ?';
        db.run(sql, [id], function (err) {
            if (err) reject(err);
            else resolve(this.changes > 0);
        });
    });
}

module.exports = {
    getOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder
};
