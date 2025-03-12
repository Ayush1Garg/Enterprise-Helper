const express = require('express');
const { getErectionCost } = require('../controllers/erectionController');
const router = express.Router();

router.get('/erection_and_commissioning_cost', getErectionCost);

module.exports = router;
