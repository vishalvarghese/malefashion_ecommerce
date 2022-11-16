const mongoose= require('mongoose');
  

var productschema =mongoose.Schema({
 productname:String,
 productdescription:String,
 productprice:Number,
 productimage:Array,  
 offerprice:Number,
 quantity:Number,
 productcategory:String
});
var productone =mongoose.model("product",productschema)
module.exports=productone            