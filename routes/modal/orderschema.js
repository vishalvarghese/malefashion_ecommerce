const { text } = require('express');
const mongoose= require('mongoose');  

var orderschema =mongoose.Schema({
    OdruserId:mongoose.ObjectId,
    subtotal:Number,
    orderstatus:String,
    paymentmode:String,
    date:Date,
    OrderedProduct:[{
    ItemId:mongoose.ObjectId,
    Quantity:Number,
    }],
     
    orderedaddress:[{    
    ordname:String,
    ordaddress:String,
    ordcity:String,
    ordstate:String,
    ordCountry:String,
    ordPin:Number,
    ordPhone:Number,
    ordemail:String
    }]  
});  
var orderone =mongoose.model("order",orderschema)
module.exports=orderone   