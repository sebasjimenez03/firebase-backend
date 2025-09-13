const router = require('express').Router();
const c = require('../controllers/collaborators.controller');

router.get('/', c.listAllCollaborators);

module.exports = router;
