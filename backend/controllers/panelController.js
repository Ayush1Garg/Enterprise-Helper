const pool = require('../config/db');

const getPanelBrands = async (req, res) => {
    try {
        const isDCR = req.query.isDCR === 'true';
        const result = await pool.query(`
            SELECT DISTINCT pb.brand_name 
            FROM panel_brands pb
            JOIN panels_pricing pp ON pb.brand_id = pp.brand_id
            WHERE pp.is_dcr = $1
        `, [isDCR]);
        const brands = result.rows.map(row => row.brand_name)
        res.json(brands);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getAllPanelBrands = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT brand_name AS "Panel_Brand"
            FROM panel_brands
            `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelCapacityVariants = async (req, res) => {
    try {
        const isDCR = req.query.isDCR === 'true';
        const panelBrand = req.query.panelBrand;
        const result = await pool.query(`
            SELECT DISTINCT pp.capacity_variant
            FROM panels_pricing pp
            JOIN panel_brands pb ON pp.brand_id = pb.brand_id
            WHERE pp.is_dcr = $1 AND pb.brand_name = $2
        `, [isDCR, panelBrand]);

        res.json(result.rows.map(row => row.capacity_variant));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelCost = async (req, res) => {
    try {
        const { isDCR, panelBrand, capacity_variant } = req.query;
        const result = await pool.query(`
            SELECT pp.price_per_watt 
            FROM panels_pricing pp
            JOIN panel_brands pb ON pp.brand_id = pb.brand_id
            WHERE pp.is_dcr = $1 AND pb.brand_name = $2 AND pp.capacity_variant = $3
        `, [isDCR === 'true', panelBrand, Number(capacity_variant)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No panel cost found" });
        }

        res.json(Number(result.rows[0].price_per_watt));
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelPriceTable = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
            pp.panel_id AS "id", 
            pp.is_dcr AS "is_DCR", 
            pb.brand_name AS "Panel_Brand", 
            pp.capacity_variant AS "Panel_Capacity", 
            pp.price_per_watt AS "Price_per_Watt"
            FROM panels_pricing pp
            JOIN panel_brands pb ON pp.brand_id = pb.brand_id;`)
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const getPanelBrandTable = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT brand_id AS "id", brand_name AS "Panel_Brand" FROM panel_brands`)
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
};

const updatePanelDetails = async (req, res) => {
    try {
        const { isDCR, panelBrand, capacity_variant, price_per_watt } = req.body;
        const id = req.params.id;

        const result = await pool.query(`
            WITH updated AS (
                UPDATE panels_pricing
                SET is_dcr = $1,
                    brand_id = (SELECT brand_id FROM panel_brands WHERE brand_name = $2),
                    capacity_variant = $3,
                    price_per_watt = $4
                WHERE panel_id = $5
                RETURNING *
            )
            SELECT 
                updated.panel_id AS "id",
                updated.is_dcr AS "is_DCR",
                pb.brand_name AS "Panel_Brand",
                updated.capacity_variant AS "Panel_Capacity",
                updated.price_per_watt AS "Price_per_Watt"
            FROM updated
            JOIN panel_brands pb ON updated.brand_id = pb.brand_id;
        `, [isDCR === "Yes", panelBrand, Number(capacity_variant), Number(price_per_watt), Number(id)]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const addPanelDetails = async (req, res) => {
    try {
        const { isDCR, panelBrand, capacity_variant, price_per_watt } = req.body;

        const result = await pool.query(`
            WITH inserted AS (
                INSERT INTO panels_pricing (is_dcr, brand_id, capacity_variant, price_per_watt)
                VALUES ($1, (SELECT brand_id FROM panel_brands WHERE brand_name = $2), $3, $4)
                RETURNING *
            )
            SELECT 
                inserted.panel_id AS "id",
                inserted.is_dcr AS "is_DCR",
                pb.brand_name AS "Panel_Brand",
                inserted.capacity_variant AS "Panel_Capacity",
                inserted.price_per_watt AS "Price_per_Watt"
            FROM inserted
            JOIN panel_brands pb ON inserted.brand_id = pb.brand_id;
        `, [isDCR === "Yes", panelBrand, Number(capacity_variant), Number(price_per_watt)]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};



const deletePanelDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(`
            DELETE FROM panels_pricing
            WHERE panel_id = $1
            RETURNING panel_id AS "id", is_dcr AS "is_DCR", brand_id AS "Brand_Id", capacity_variant AS "Panel_Capacity", price_per_watt AS "Price_per_Watt";
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel not found" });
        }

        res.status(200).json({ message: "Panel deleted successfully", data: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const addPanelBrand = async (req, res) => {
    try {
        const { panelBrand } = req.body;
        const result = await pool.query(`
            INSERT INTO panel_brands (brand_name) 
            VALUES ($1) 
            RETURNING brand_id AS "id", brand_name AS "Panel_Brand";
        `, [panelBrand]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const updatePanelBrand = async (req, res) => {
    try {
        const { panelBrand } = req.body;
        const id = req.params.id;
        const result = await pool.query(`
            UPDATE panel_brands 
            SET brand_name = $1 
            WHERE brand_id = $2
            RETURNING brand_id AS "id", brand_name AS "Panel_Brand";
        `, [panelBrand, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel brand not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


const deletePanelBrand = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid brand ID" });
        }
        const result = await pool.query(
            `DELETE FROM panel_brands WHERE brand_id = $1 
            RETURNING brand_id AS id, brand_name AS "Panel_Brand"`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Panel brand not found" });
        }

        res.json({ message: "Panel brand deleted successfully", data: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    getPanelBrands,
    getAllPanelBrands,
    getPanelCapacityVariants,
    getPanelCost,
    getPanelPriceTable,
    getPanelBrandTable,
    updatePanelDetails,
    addPanelDetails,
    deletePanelDetails,
    addPanelBrand,
    updatePanelBrand,
    deletePanelBrand
};