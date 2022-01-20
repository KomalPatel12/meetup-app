const express = require('express');
const controller = require('../controllers/userController');
const {isGuest,isLoggedIn} = require('../middlewares/auth');
const {logInLimiter} = require('../middlewares/rateLimiters');
const {validateSignUp, validateLogin, validateResult} = require('../middlewares/validator'); 

const router = express.Router();

//GET /users/new: send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/', validateSignUp, validateResult, isGuest, controller.create);

//GET /users/login: send html for logging in
router.get('/login', isGuest, controller.getUserLogin);

//POST /users/login: authenticate user's login
router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, controller.login);

//GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

//POST /users/logout: logout a user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;