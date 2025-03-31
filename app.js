var createError = require('http-errors');
var express = require('express');
require('dotenv').config()
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session=require("express-session");
const {v4:uuidv4}=require('uuid');
const cookie=require('cookie-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminrouter =require('./routes/admin');
var app = express();
 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie());
app.use(express.static(path.join(__dirname, 'public')));

 //cookie
 const maxAge=24*60*60*1000;
 app.use(session({
   secret:uuidv4(),// 'ib9d6bcd-bbfd-4b2d-9b5d'
   resave:false,
   saveUninitialized:true,
   cookie:{maxAge:maxAge}
 }));

 app.use((req,res,next)=>{
  if(!req.user){
    res.header("cache-control","private,no-cache,no-store,must revalidate");
    res.header("Express","-3");
  }  
  next();
});

app.use('/', indexRouter);  
app.use('/', usersRouter); 
app.use('/',adminrouter);

const mongoose= require('mongoose');
const { config } = require('dotenv');
//  mongoose.connect('mongodb://localhost:27017/Malefashion',{
mongoose.connect('mongodb+srv://vishalvjdeveloper:nEX0dEMOp1VQYgAx@cluster0male.fe1msci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0Male',{ 
useNewUrlParser:true,
},(err,data)=>{    
 if(err){
   console.log("Db Error");
 }else{
   console.log('Db Connected...');
 }
});    

//const user=require('./routes/userschema');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('errorpage');
});

module.exports = app;
