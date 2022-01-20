const express = require('express');
const router = express.Router();
const controller = require('../controllers/connectionController');
const {isLoggedIn, isAuthor, isNotAuthor} = require('../middlewares/auth');
const {validateId,validateResult, validateConnection} = require('../middlewares/validator');

//7 RESTful routes for requests associated with connections.

router.get('/',controller.connections); 

router.get('/newConnection',isLoggedIn,controller.newConnection);

router.post('/',isLoggedIn,validateConnection, validateResult, controller.create);
// router.post('/',isLoggedIn, validateResult, controller.create);

router.get('/:id',controller.show);

router.get('/:id/edit',isLoggedIn,isAuthor,controller.edit);

router.put('/:id',isLoggedIn,validateId,isAuthor, validateConnection, validateResult,controller.update);

router.delete('/:id',isLoggedIn,validateId, isAuthor,controller.delete);

router.post("/:id/rsvp/", isLoggedIn, validateId, isNotAuthor, controller.createRsvp);

router.delete("/:id/rsvp",isLoggedIn, validateId, controller.deleteRsvp);

module.exports = router;