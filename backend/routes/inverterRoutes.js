const express = require('express');
const { getInverterBrands, getInverterCost, getAllInverterBrands } = require('../controllers/inverterController');
const router = express.Router();

router.get('/invBrand', getInverterBrands);
router.get('/inverter_cost', getInverterCost);
router.get('/allInverterBrands', getAllInverterBrands);

module.exports = router;
