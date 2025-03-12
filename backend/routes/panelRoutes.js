const express = require('express');
const {
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
} = require('../controllers/panelController');

const router = express.Router();

// GET Routes
router.get('/panelBrands', getPanelBrands);
router.get('/allPanelBrands', getAllPanelBrands);
router.get('/panelCapacityVariants', getPanelCapacityVariants);
router.get('/panel_cost', getPanelCost);
router.get('/panelDetailsTable', getPanelPriceTable)
router.get('/panelBrandsTable', getPanelBrandTable)

// POST Routes (Adding new data)
router.post('/panelBrandsTable', addPanelBrand);
router.post('/panelDetailsTable', addPanelDetails);

// PUT Routes (Updating existing data)
router.put('/panelBrandsTable/:id', updatePanelBrand);
router.put('/panelDetailsTable/:id', updatePanelDetails);

// DELETE Routes (Removing data)
router.delete('/panelBrandsTable/:id', deletePanelBrand);
router.delete('/panelDetailsTable/:id', deletePanelDetails);

module.exports = router;
