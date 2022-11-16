const mongoose= require('mongoose');
  
var couponschema =mongoose.Schema({
 couponname:String,
 percentage:Number,
 cap:Number
});
var couponone =mongoose.model("coupon",couponschema)
module.exports=couponone      