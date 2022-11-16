const { text } = require('express');
const mongoose= require('mongoose');  

var cartschema =mongoose.Schema({
    UserId:mongoose.ObjectId,
    Product:[{
    ItemId:mongoose.ObjectId,
    Quantity:Number
    }]
    
});  
var cartone =mongoose.model("cart",cartschema)
module.exports=cartone   