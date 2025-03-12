const pool = require('../config/db');

const getInverterBrands = async (req, res) => {
    try {
        const panelBrand = req.query.panelBrand;

        const panelBrandIdResult = await pool.query(`
            SELECT brand_id FROM panel_brands WHERE brand_name = $1
        `, [panelBrand]);

        const panelBrandIds = panelBrandIdResult.rows.map(row => row.brand_id);
        if (panelBrandIds.length === 0) return res.json([]);

        const inverterBrandIdResult = await pool.query(`
            SELECT inverter_brand_id FROM inverters_with_panels WHERE panel_brand_id = ANY($1)
        `, [panelBrandIds]);

        const inverterBrandIds = inverterBrandIdResult.rows.map(row => row.inverter_brand_id);
        if (inverterBrandIds.length === 0) return res.json([]);

        const inverterBrandNameResult = await pool.query(`
            SELECT DISTINCT ib.brand_name FROM inverter_brands ib WHERE ib.brand_id = ANY($1)
        `, [inverterBrandIds]);

        res.json(inverterBrandNameResult.rows.map(row => row.brand_name));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getAllInverterBrands = async (req, res) => {
    try {
        const inverterBrandNameResult = await pool.query(`
            SELECT DISTINCT brand_name AS "Inverter_Brand" FROM inverter_brands
            `);
        res.json(inverterBrandNameResult.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}

const getInverterCost = async (req, res) => {
    try {
        const { inverterBrand, inverterCapacity } = req.query;
        const result = await pool.query(`
            SELECT ip.price 
            FROM inverters_pricing ip
            JOIN inverter_brands ib ON ip.brand_id = ib.brand_id
            WHERE ib.brand_name = $1 AND ip.capacity = $2
        `, [inverterBrand, Number(inverterCapacity)]);

        if (result.rows.length === 0) return res.status(404).json({ error: "No inverter cost found" });

        res.json(Number(result.rows[0].price));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getInverterBrands, getAllInverterBrands, getInverterCost };
