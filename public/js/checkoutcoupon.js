
    
function Applycoupon(event,subtotal,task)    
{
 console.log(subtotal);
let couponcode=document.getElementById('couponcode').value        
console.log(couponcode);
// let quanttti=parseInt(document.getElementById(proid).value) 
// console.log(quanttti);
// let subtt=parseInt(document.getElementById('Subtotal').innerHTML)      
// console.log((subtt+(count*productprice)));
// console.log(subtt);
// console.log(count);
// console.log(productprice);

 if(task=='check')
{
    event.preventDefault();  
    $.ajax({
     url:'/checkcoupon',  
     data:{  
         code:couponcode,               
        subtotal:subtotal  
        },           
     method:"post",             
     success:(response)=>{    
        console.log(response);
        if(response.status=='valid')
        {
            document.getElementById('infopoint').innerHTML = 'Successfull Applied';
            document.getElementById('close').innerHTML = 'x';
            document.getElementById("Sub").innerHTML =response.Newsubtotal;
            document.getElementById("Gst").innerHTML =Math.round((response.Newsubtotal)*(.18));
            document.getElementById("Tot").innerHTML =Math.round((response.Newsubtotal)*(1.18));            
           
            document.getElementById("coupon").value =response.couponcode

        }
         if(response.status=='invalid')
        {
            document.getElementById('infopoint').innerHTML = 'Invalid Coupon code';
        }
        if(response.status=='used')
        {
            document.getElementById('infopoint').innerHTML = 'Already used Coupon code';
        }
        
        //  location.reload();
      
        // document.getElementById(proid).value =(quanttti+count);    
        // document.getElementById(position).innerHTML = (quanttti+count)*productprice;
        // document.getElementById("Subtotal").innerHTML =parseInt(subtt+(count*productprice)); 
        // document.getElementById("tax").innerHTML =parseInt((0.18*(subtt+(count*productprice))));
        // document.getElementById("Totalamount").innerHTML =parseInt(1.18*(subtt+(count*productprice)));
  
        // document.getElementById("totalproductprice").innerHTML = response.total;
    }  
    })
}
else
{
  //used for closing  
    location.reload();
}
}    
  
