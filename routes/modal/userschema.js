const { text } = require('express');
const mongoose= require('mongoose');
  

var userschema =mongoose.Schema({
 username:String,
 useremail:String,
 usermobile:Number,
 userpassword:String,
 userstatus:String,
 usedcoupon:Array,
 userreferralcode:String,
 userwallet:Number,
 useraddress:[{
    name:String,
    address:String,
    city:String,
    state:String,
    Country:String,
    Pin:Number,
    Phone:Number,
    email:String
    }]  
});
var userone =mongoose.model("user",userschema)
module.exports=userone        