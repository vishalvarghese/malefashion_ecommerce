const mongoose= require('mongoose');
  

var categoryschema =mongoose.Schema({
 categoryname:String
});
var categoryone =mongoose.model("category",categoryschema)
module.exports=categoryone              