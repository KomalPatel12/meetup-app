const model = require('../models/user');
const Connection = require('../models/connection'); 
const rsvpModel = require("../models/rsvp");
const { connection } = require('mongoose');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
        let user = new model(req.body);//create a new connection document
        if(user.email){
            user.email = user.email.toLowerCase();
        }
    user.save()//insert the document to the database
    .then(user=> {
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('back');
        }
        next(err);
    });  
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    if(email){
        email = email.toLowerCase();
    }
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Incorrect email address');  
            res.redirect('back');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.userName = user.firstName + ' '+user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'Incorrect password');      
                res.redirect('back');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

listOfTopic = function(connections){
    let names = undefined;
    connections.forEach(element=>{
        let tName =  element.topic;
        if(names === undefined){
            names = [];
            names.push(tName);
        }
        else if(names.findIndex(name => name === tName) == -1)
        {
            names.push(tName);
        }
    });
    return names;
} 

exports.profile = (req, res, next)=>{
    let id = req.session.user;

    Promise.all([model.findById(id),Connection.find({author:id})])
    .then(results=>{
        const [user,connections] = results;
        let topicNames = listOfTopic(connections);
        rsvpModel.find({user: id}).populate('connection', connections._id)
        .then(rsvpArray =>{
            res.render('./user/profile', {connections, topicNames, user, rsvpArray});
        })
        .catch(err => next(err));
    })
    .catch(err=>next(err))
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
 };