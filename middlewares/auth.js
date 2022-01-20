const { connection } = require('mongoose');
const Connection = require('../models/connection')

//check if user is a guest
exports.isGuest = (req,res,next)=>{
    if(!req.session.user){
    return next();
    }
    else{
        req.flash('error','You are already logged in');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req,res,next)=>{
    if(req.session.user){
    return next();
    }
    else{
        req.flash('error','You need to login first');
        return res.redirect('/users/login');
    }
}

//check if user is author of connection
exports.isAuthor = (req,res,next)=>{
    let id = req.params.id;
    Connection.findById(id)
    .then(connection=>{
        if(connection){
            if(connection.host._id == req.session.user){
                return next();
            } else{
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
}

exports.isNotAuthor = (req,res,next)=>{
    let id = req.params.id;
    Connection.findById(id)
    .then(connection =>{
        if (connection){
            if(connection.hostName == req.session.user){
                let err = new Error('Unauthorized action');
                err.status = 401;
                return next(err); 
            }else{
                 next();
            }
        }else{
            let err = new Error('cannot find connection with id '+id);
            err.status = 404
            next(err);
        }
    })
    .catch(err => next(err));
};