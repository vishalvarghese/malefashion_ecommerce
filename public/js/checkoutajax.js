$("#checkout-form").submit((event)=>{
    event.preventDefault()
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            if(response.status=='COD')
            {
                // alert('COD')
            location.href='/purchase'
            }
            else if(response.status=='wallet')
            {
                location.href='/purchase'
            }
            else if(response.status=="paypal")
            {     

       for(let i = 0;i < (response.obj).links.length;i++)
       {
       if((response.obj).links[i].rel === 'approval_url')
       {
    //    res.redirect((response.obj).links[i].href);
       location.href=(response.obj).links[i].href
        
       }
       }

            }

            else if(response.Status== "razorpay")
            {
                var orderinfo=response.orde
                var options = {
                    "key": "rzp_test_54CTZl9H3Y9CPS", // Enter the Key ID generated from the Dashboard
                    "amount": response.orde.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                    "currency": "INR",
                    "name": "Male fashion",
                    "description": "Test Transaction",
                    "image": "https://example.com/your_logo",
                    "order_id": response.orde.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                    "handler": function (response){
                        // alert(response.razorpay_payment_id);
                        // alert(response.razorpay_order_id);
                        // alert(response.razorpay_signature)
                       
                        verifypayment(response,orderinfo)
                        
                    },
                    "prefill": {
                        "name": "Gaurav Kumar",
                        "email": "gaurav.kumar@example.com",
                        "contact": "9999999999"
                    },
                    "notes": {
                        "address": "Razorpay Corporate Office"
                    },
                    "theme": {
                        "color": "#3399cc"
                    }
                };
                var rzp1 = new Razorpay(options);
                // rzp1.on('payment.failed', function (response){
                //         alert(response.error.code);
                //         alert(response.error.description);
                //         alert(response.error.source);
                //         alert(response.error.step);
                //         alert(response.error.reason);
                //         alert(response.error.metadata.order_id);
                //         alert(response.error.metadata.payment_id);
                // });
                rzp1.open();
                // document.getElementById('rzp-button1').onclick = function(e){
                 
                //     e.preventDefault();
                // }
            }
         
        }
    })
})

function verifypayment(payment,order)
{
$.ajax({
    url:'/verify-payment',
    data:{
        payment,order
    },
    method:'post',
     success:(response)=>{
      if(response.payresult=='paid')
      {
        console.log('payment successfull in ajax');
         location.href='/purchase'
      }
     else
     {
        console.log('payment failed in ajax');
        locationbar.href='/payment-failed'
     }
    }
})
}

// function changeQuantity(event,cartId,proid,count,position,quanti,productprice,subtotal)    
// {         
//   let quanttti=parseInt(document.getElementById(proid).value)  
//   event.preventDefault();  
    

//     $.ajax({
//      url:'/changeCartquantity',  
//      data:{  
//          cartId:cartId,         
//          productId:proid
//      },           
//      method:"post",             
//      success:(response)=>{    
//         console.log("response",response.quantnumb*productprice);
//         //  location.reload();
        
//         document.getElementById(proid).value =(quanttti+count); 
        
//     }  
//  })
// }  
      
  
