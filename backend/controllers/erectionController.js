const pool = require('../config/db');

const getErectionCost = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ error: "Missing 'id' parameter" });
        }

        const result = await pool.query(`SELECT * FROM erection_commissioning_pricing WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No erection and commissioning cost found" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getErectionCost };
