
    
function changeQuantity(event,cartId,proid,count,position,quanti,productprice,subtotal)    
{
         
  let quanttti=parseInt(document.getElementById(proid).value) 
  console.log(quanttti);
  let subtt=parseInt(document.getElementById('Subtotal').innerHTML)
      
console.log((subtt+(count*productprice)));
console.log(subtt);
console.log(count);
console.log(productprice);

  event.preventDefault();  
    // prevent quantity to zero and below
 if(quanttti>1) 
{  
    $.ajax({
     url:'/changeCartquantity',  
     data:{  
         cartId:cartId,         
         productId:proid,
         count:count,
         pos:position,     
         Quantity:quanti,
         subtot:subtotal,
         prodprice:productprice   
     },           
     method:"post",             
     success:(response)=>{    
        console.log("response",response.quantnumb*productprice);
        //  location.reload();
        
        document.getElementById(proid).value =(quanttti+count); 
          
        document.getElementById(position).innerHTML = (quanttti+count)*productprice;

        document.getElementById("Subtotal").innerHTML =parseInt(subtt+(count*productprice)); 
        document.getElementById("tax").innerHTML =parseInt((0.18*(subtt+(count*productprice))));
       document.getElementById("Totalamount").innerHTML =parseInt(1.18*(subtt+(count*productprice)));
  
        // document.getElementById("totalproductprice").innerHTML = response.total;
    }  
 })
}  
else if(count==1)
{
   
    $.ajax({
        url:'/changeCartquantity',  
        data:{  
            cartId:cartId,         
            productId:proid,
            count:count,
            pos:position,     
            Quantity:quanti,
            subtot:subtotal,
            prodprice:productprice   
        },  
        method:"post",             
        success:(response)=>{    
           console.log("response",response.quantnumb*productprice);
           //  location.reload();
           
           document.getElementById(proid).value =(quanttti+count);   
             
           document.getElementById(position).innerHTML = (quanttti+count)*productprice;
   
          
        document.getElementById("Subtotal").innerHTML =parseInt(subtt+(count*productprice)); 
        document.getElementById("tax").innerHTML =parseInt((0.18*(subtt+(count*productprice))));
       document.getElementById("Totalamount").innerHTML =parseInt(1.18*(subtt+(count*productprice)));

           // document.getElementById("totalproductprice").innerHTML = response.total;
       }     
    })
    
}
      
}  
