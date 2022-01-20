const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

//routes for the general site navigation
router.get('/',controller.index);
router.get('/contact',controller.contact);
router.get('/about',controller.about);

module.exports = router;
 