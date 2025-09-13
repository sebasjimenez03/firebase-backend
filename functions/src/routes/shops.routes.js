const router = require('express').Router();
const c = require('../controllers/shops.controller');

router.get('/', c.listShops);
router.get('/:id', c.getShop);
router.post('/', c.createShop)

module.exports = router;