const {body, validationResult} = require('express-validator');
const { DateTime } = require("luxon");

//checks if the route parameter is a valid ObjectId type value
exports.validateId = (req,res,next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
}

exports.validateSignUp = [body('firstName','First name cannot be empty').notEmpty().isLength({min:3}).trim().escape(),
body('lastName','Last name cannot be empty').notEmpty().isLength({min:3}).trim().escape(),
body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','Password must be atleast 8 characters & atmost 64 characters').isLength({min:8,max:64})];

exports.validateLogin = [body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','Password must be atleast 8 characters & atmost 64 characters').isLength({min:8,max:64})];

exports.validateConnection = [body('topic','Topic of the connection cannot be empty').notEmpty().trim().escape(),
body('topic','Topic must have 3 or more characters').isLength({min:3}),
body('title','Title of the connection cannot be empty').notEmpty().trim().escape(),
body('title','Title must have 3 or more characters').isLength({min:3}),
body('detail','Detail of the connection cannot be empty').trim().escape(),
body('detail','Detail must have 10 or more characters').isLength({min:10}),
body('where','Location of the connection cannot be empty').notEmpty().trim().escape(),
body('when','Date of the connection cannot be empty').notEmpty().trim().escape(),
body('when','Date must be a valid date').isDate(),
body('when','Date of the connection must be after today').custom((value, {req}) => checkDate(value)),
body('start','Start-time of the connection cannot be empty').notEmpty().trim().escape(),
body('start','Start-time of the connection cannot be empty').notEmpty().trim().escape().custom((startTime, {req}) => checkValidTime(startTime)),
body('end','End-time of the connection cannot be empty').notEmpty().trim().escape().custom((endTime, {req}) => checkValidTime(endTime)),
body('end','End-time must be after start-time').custom((value, {req}) => checkValidTime(value)).custom((endTime, {req}) => checkValidEndTime(req.body.start,endTime)),
body('imageUrl','Image URL of the connection cannot be empty').notEmpty().trim().escape()];

exports.validateResult = (req,res,next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error',error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}

function checkValidTime(startEndTime){
    let timeValue = DateTime.fromFormat(startEndTime, "HH:mm");
    if (timeValue.isValid){
        return true;
    }
    throw new Error(startEndTime +' is not a valid time format');
}

function checkDate(dateFromUI){
    let CurrentDate = new Date();
    dateFromUI = new Date(dateFromUI);

    if(dateFromUI > CurrentDate){
        return true;
    }return false;
};

function checkValidEndTime(start,end){
    let startTime = DateTime.fromFormat(start, "hh:mm");
    let endTime = DateTime.fromFormat(end,"hh:mm");
    if(startTime && endTime){
        if (startTime >= endTime || (endTime - startTime)<=300000){
            return false;
        }
    }
    return true;
};