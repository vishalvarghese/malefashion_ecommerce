const { text } = require('express');
const mongoose= require('mongoose');  

var wishlistschema =mongoose.Schema({
    UserId:mongoose.ObjectId,
    Product:[{
    ItemId:mongoose.ObjectId,
    Quantity:Number
    }]
});  
var wishlistone =mongoose.model("wishlist",wishlistschema)
module.exports=wishlistone