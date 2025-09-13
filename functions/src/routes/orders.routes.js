
const router = require('express').Router();
const c = require('../controllers/orders.controller');

router.get('/', c.getAllOrders);

module.exports = router;