const router = require('express').Router();
const c = require('../controllers/products.controller');

router.get('/', c.listProductsByShop);
router.get('/:id', c.getProduct);
router.post('/', c.createProduct);

module.exports = router;
