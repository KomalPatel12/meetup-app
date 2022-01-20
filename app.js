//Require modules
const express = require('express');
const ejs = require('ejs');
const morgan = require('morgan');
const methodOverride = require('method-override');
const connectionRoutes = require('./routes/connectionRoutes');
const mainRoutes = require('./routes/mainRoutes');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');

const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

//create app
const app = express();

//configure app
const port = 3000;
let host='localhost';
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost:27017/project3DB',
    {useUnifiedTopology: true,useNewUrlParser:true})
.then(()=>{
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })})
.catch(e=>console.log(e.message));

//mount middleware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/project3DB'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.userName = req.session.userName||null;
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use('/',mainRoutes);
app.use('/users', userRoutes);
app.use('/connections',connectionRoutes);

app.use((req,res,next)=>{
    let error = new Error(' The server cannot locate '+req.url);
    error.status = 404;
    next(error);
});

//this should be last middleware in stack
app.use((err,req,res,next)=>{
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server error");
    }
    res.status(err.status);
    res.render('error',{error:err});
});