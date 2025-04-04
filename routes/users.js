var express = require('express');
var router = express.Router();

const user = require('./modal/userschema');
const product = require('./modal/productschema');
const cart = require('./modal/cartschema');
const order = require('./modal/orderschema')
const ObjectId = require("mongodb").ObjectId;
const category = require('./modal/categoryschema')
const coupon = require('./modal/couponschema')
const wishlist = require('./modal/wishlistschema')
/* GET users listing. */
const ids = require('./IDS');
const { response } = require('express');
const { count } = require('./modal/userschema');

//Razorpay  
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.razorkey, key_secret: process.env.razorsecretkey })

//paypal
const paypal = require('paypal-rest-sdk');
const wishlistone = require('./modal/wishlistschema');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.paypalclientid,
  'client_secret': process.env.paypalclientsecretkey
});

//mobile otp
const client = require('twilio')(process.env.twilioA, process.env.twilioB)
router.get('/userdashboard', function (req, res) {
  res.render('userdashboard');
})

router.post('/login', async (req, res) => {
  // await user.find({ useremail: req.body.customeremail, userpassword: req.body.customerpassword }, (err, docs) => {


  //   if (docs == '') {
  //     console.log("invalid user " + docs.useremail)
  //     res.render('logintry', { type: "invalid user" })
  //   }
  //   else if (docs[0].userstatus == 'blocked') {
  //     res.render('logintry', { type: "blocked" })
  //   }
  //   else {
  //     console.log('logged in ' + docs[0].username)
  //     req.session.userA = req.body.customeremail;
  //     res.redirect('/shop');
  //   }

  // }).clone()
  user.find({ useremail: req.body.customeremail, userpassword: req.body.customerpassword })
  .then(docs => {
    if (docs.length === 0) {  // Check if no user found
      console.log("Invalid user");
      res.render('logintry', { type: "invalid user" });
    } else if (docs[0].userstatus === 'blocked') {  // Check if user is blocked
      res.render('logintry', { type: "blocked" });
    } else {
      console.log('Logged in: ' + docs[0].username);
      req.session.userA = req.body.customeremail;
      res.redirect('/shop');
    }
  })
  .catch(err => {
    console.error("Error while fetching user:", err);
    res.render('logintry', { type: "error" });  // Handle any errors
  });

});



router.get('/shop', async function (req, res) {
  try {
      let categorydetails = await category.find();

      let query = req.query.id ? { productcategory: req.query.id } : {};
      
      product.find(query)
          .then(data => {
              res.render('shop', { productdetails: data, categorydetails });
          })
          .catch(err => {
              console.error(err);
              res.status(500).send("Internal Server Error");
          });

  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
});



router.get('/productdetails', async function (req, res) {
  try {
    const aid = req.query.id;

    // Fetch the product by ID
    const productDetails = await product.findById(aid);

    if (!productDetails) {
      console.log('Product not found');
      return res.status(404).send('Product not found');  // Send a proper 404 response
    }

    // Fetch related products
    const relatedProducts = await product.find({ productcategory: productDetails.productcategory });

    // Render the product details page
    res.render('product-details', { product: productDetails, relatedproducts: relatedProducts });
  } catch (err) {
    console.error('Error finding product:', err);
    res.status(500).send('Internal Server Error');  // Send proper error response
  }
});


router.get('/OTPlogin', (req, res) => {
  res.render('logintry', { display: "otpform" })
})

// router.post('/generateOTP', async (req, res) => {
//   var Mobilenumber = req.body.otpmobilenumber;

//   await user.find({ usermobile: Mobilenumber }, (err, docs) => {


//     if (docs == '') {
//       res.render('logintry', { type: "Incorrect-mobile" })
//     }
//     else {
//       console.log(Mobilenumber);
//       let serviceid = ids.SERVICE_ID;
//       console.log(serviceid);
//       client.verify.v2.services(process.env.twilioverify).verifications
//         .create({ to: '+91' + Mobilenumber, channel: 'sms' })
//         .then((data) => {
//           res.render('logintry', { display: "otpgenerated", number: Mobilenumber })
//         })
//         .catch((err) => console.log('it an error', err))


//     }

//   }).clone()

// })

// router.post('/validateOTP', async (req, res) => {

//   const Mobilenumber = req.body.number;
//   const otp = req.body.generatedotp;
//   client.verify.v2.services(process.env.twilioverify).verificationChecks
//     .create({ to: '+91' + Mobilenumber, code: otp })
//     .then(async (verification_check) => {
//       if (verification_check.valid) {
//         let data = await user.findOne({ usermobile: req.body.number })

//         req.session.userA = data.useremail;
//         res.redirect('/shop')
//       }

//     })

// })


router.get('/contact', (req, res) => {
  res.render('contact');

})

router.get('/userlogout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      res.send('Error')
    }
    else {

      res.redirect('/');
    }

  })
})

// router.get('/wishlist', async (req, res) => {
//   if (req.session.userA) {
//     let docs = await user.find({ useremail: req.session.userA }).clone()
//     let userid = docs[0]._id
//     const wishProduct = await wishlistone.aggregate([{ $match: { UserId: userid } }, { $unwind: '$Product' }, {
//       $project: {
//         wishid: '$_id', ItemId: '$Product.ItemId',
//         Quantity: '$Product.Quantity'
//       }
//     }, {
//       $lookup: {
//         from: 'products',
//         localField: 'ItemId',
//         foreignField: '_id',
//         as: 'wishdisplayproduct'
//       }
//     }, {
//       $project: {
//         wishid: 1, ItemId: 1, Quantity: 1, wishdisplayproduct: { $arrayElemAt: ['$wishdisplayproduct', 0] }
//       }
//     }])

//     console.log(wishProduct)

//     res.render('wishlist', { wishdetails: wishProduct })
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

router.get('/wishlist', (req, res) => {
  if (req.session.userA) {
    user.find({ useremail: req.session.userA }).then(docs => {
      const userid = docs[0]._id;

      wishlistone.aggregate([
        { $match: { UserId: userid } },
        { $unwind: '$Product' },
        {
          $project: {
            wishid: '$_id',
            ItemId: '$Product.ItemId',
            Quantity: '$Product.Quantity'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'ItemId',
            foreignField: '_id',
            as: 'wishdisplayproduct'
          }
        },
        {
          $project: {
            wishid: 1,
            ItemId: 1,
            Quantity: 1,
            wishdisplayproduct: { $arrayElemAt: ['$wishdisplayproduct', 0] }
          }
        }
      ]).then(wishProduct => {
        console.log(wishProduct);
        res.render('wishlist', { wishdetails: wishProduct });
      }).catch(err => {
        console.error("Error in wishlist aggregation:", err);
        res.status(500).send("Internal Server Error");
      });

    }).catch(err => {
      console.error("Error fetching user:", err);
      res.status(500).send("Internal Server Error");
    });

  } else {
    res.redirect('/signuplogin');
  }
});



// router.get('/addtowishlist', async (req, res) => {
//   if (req.session.userA) {
//     let docs = await user.find({ useremail: req.session.userA })
//     let id = docs[0]._id

//     let wishlist = await wishlistone.find({ UserId: id })

//     if (wishlist == '') {
//       //creat cart and store userid in cart  
//       const wish_schema = new wishlistone({
//         UserId: id,
//         Product: [{
//           ItemId: req.query.id,
//           Quantity: 1
//         }]
//       })
//       wish_schema.save();
//       //correction to avoid lag
//       var wishnew = await wishlistone.find({ UserId: id }).clone()
//       console.log("new wishlist formmed:" + wishnew)
//     }
//     else {
//       await wishlistone.findOne({ $and: [{ UserId: id }, { Product: { $elemMatch: { ItemId: req.query.id } } }] }, (err, data) => {
//         if (data) {

//           console.log('already in wishlist');
//         }
//         else {
//           // Push product to cart
//           console.log(data)
//           console.log('push to wishlist')
//           wishlistone.updateOne({ UserId: id }, { $push: { Product: { ItemId: req.query.id, Quantity: 1 } } }, (err, up) => {
//             if (err) {
//               console.log('not added')
//             }
//             else {
//               console.log('added')
//             }
//           })

//         }

//       }).clone()

//     }

//     res.redirect('/wishlist')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }

// })

router.get('/addtowishlist', (req, res) => {
  if (req.session.userA) {
    user.find({ useremail: req.session.userA }).then(docs => {
      const id = docs[0]._id;

      wishlistone.find({ UserId: id }).then(wishlist => {
        if (wishlist.length === 0) {
          // Create new wishlist for the user
          const wish_schema = new wishlistone({
            UserId: id,
            Product: [{
              ItemId: req.query.id,
              Quantity: 1
            }]
          });

          wish_schema.save().then(() => {
            return wishlistone.find({ UserId: id });
          }).then(wishnew => {
            console.log("New wishlist formed:", wishnew);
            res.redirect('/wishlist');
          }).catch(err => {
            console.error("Error creating wishlist:", err);
            res.status(500).send("Internal Server Error");
          });

        } else {
          wishlistone.findOne({
            $and: [
              { UserId: id },
              { Product: { $elemMatch: { ItemId: req.query.id } } }
            ]
          }).then(data => {
            if (data) {
              console.log('Already in wishlist');
              res.redirect('/wishlist');
            } else {
              // Add product to wishlist
              wishlistone.updateOne(
                { UserId: id },
                { $push: { Product: { ItemId: req.query.id, Quantity: 1 } } }
              ).then(() => {
                console.log('Product added to wishlist');
                res.redirect('/wishlist');
              }).catch(err => {
                console.error("Failed to update wishlist:", err);
                res.status(500).send("Internal Server Error");
              });
            }
          }).catch(err => {
            console.error("Error checking if item exists:", err);
            res.status(500).send("Internal Server Error");
          });
        }
      }).catch(err => {
        console.error("Error finding wishlist:", err);
        res.status(500).send("Internal Server Error");
      });

    }).catch(err => {
      console.error("Error finding user:", err);
      res.status(500).send("Internal Server Error");
    });

  } else {
    res.redirect('/signuplogin');
  }
});


// router.get('/addtocart', async (req, res) => {
//   if (req.session.userA) {

//     let docs = await user.find({ useremail: req.session.userA })
//     let id = docs[0]._id


//     let cartpresent = await cart.find({ UserId: id })

//     if (cartpresent == '') {
//       //creat cart and store userid in cart  
//       const cart_schema = new cart({
//         UserId: id,
//         Product: [{
//           ItemId: req.query.id,
//           Quantity: 1
//         }]
//       })
//       cart_schema.save();
//       //correction to avoid lag
//       var cartnew = await cart.find({ UserId: id }).clone()
//       console.log("new cart formmed:" + cartnew)
//     }
//     else {
//       await cart.findOne({ $and: [{ UserId: id }, { Product: { $elemMatch: { ItemId: req.query.id } } }] }, (err, data) => {
//         if (data) {


//           console.log('already in cart');
//         }
//         else {
//           // Push product to cart
//           console.log(data)
//           console.log('push to cart')
//           cart.updateOne({ UserId: id }, { $push: { Product: { ItemId: req.query.id, Quantity: 1 } } }, (err, up) => {
//             if (err) {
//               console.log('not added')
//             }
//             else {
//               console.log('added')
//             }
//           })

//         }

//       }).clone()

//     }

//     res.redirect('/cart')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }

// })

// router.get('/cart', async (req, res) => {
//   if (req.session.userA) {
//     let docs = await user.find({ useremail: req.session.userA }).clone()
//     let userid = docs[0]._id


//     const CartProduct = await cart.aggregate([{ $match: { UserId: userid } }, { $unwind: '$Product' }, {
//       $project: {
//         cardtid: '$_id', ItemId: '$Product.ItemId',
//         Quantity: '$Product.Quantity'
//       }
//     }, {
//       $lookup: {
//         from: 'products',
//         localField: 'ItemId',
//         foreignField: '_id',
//         as: 'Cartdisplayproduct'
//       }
//     }, {
//       $project: {
//         cartid: 1, ItemId: 1, Quantity: 1, Cartdisplayproduct: { $arrayElemAt: ['$Cartdisplayproduct', 0] }
//       }
//     }])

//     var subtotal = 0;
//     for (let k = 0; k < CartProduct.length; k++) {
//       subtotal = subtotal + (CartProduct[k].Cartdisplayproduct.offerprice * CartProduct[k].Quantity)
//     }



//     res.render('shopping-cart', { cartdetails: CartProduct, Subtotal: subtotal })



//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.get('/removeproductfromwishlist', async (req, res) => {
//   if (req.session.userA) {
//     console.log(req.query.id)
//     let docs = await user.find({ useremail: req.session.userA })
//     let id = docs[0]._id
//     await wishlistone.updateOne({ UserId: id }, { $pull: { Product: { ItemId: req.query.id } } }, (err, up) => {
//       if (err) {
//         console.log('not removed')
//       }
//       else {
//         console.log('removed')
//       }
//     }).clone()

//     console.log('deleted product');
//     res.redirect('/wishlist')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })


// router.get('/removeproductfromcart', async (req, res) => {
//   if (req.session.userA) {
//     console.log(req.query.id)
//     let docs = await user.find({ useremail: req.session.userA })
//     let id = docs[0]._id
//     await cart.updateOne({ UserId: id }, { $pull: { Product: { ItemId: req.query.id } } }, (err, up) => {
//       if (err) {
//         console.log('not removed')
//       }
//       else {
//         console.log('removed')
//       }
//     }).clone()

//     console.log('deleted product');
//     res.redirect('/cart')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.post('/changeCartquantity', async (req, res) => {

//   let checkquant = await cart.findOne({ $and: [{ _id: ObjectId(req.body.cartId) }, { Product: { $elemMatch: { ItemId: ObjectId(req.body.productId) } } }] }).clone()
//   console.log(checkquant.Product[req.body.pos].Quantity);
//   //updating in data base 
//   var q = checkquant.Product[req.body.pos].Quantity
//   if ((q > 1) || ((q == 1) && (req.body.count == 1))) {
//     cart.updateOne({ _id: ObjectId(req.body.cartId), 'Product.ItemId': ObjectId(req.body.productId) }, { $inc: { 'Product.$.Quantity': req.body.count } }, (err, success) => {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log('succcess');
//       }
//     })
//   }

//   let responses = {};

//   //data to calculate total

//   const CartProduct = await cart.aggregate([{ $match: { _id: ObjectId(req.body.cartId) } }, { $unwind: '$Product' }, {
//     $project: {
//       cardtid: '$_id', ItemId: '$Product.ItemId',
//       Quantity: '$Product.Quantity'
//     }
//   }, {
//     $lookup: {
//       from: 'products',
//       localField: 'ItemId',
//       foreignField: '_id',
//       as: 'Cartdisplayproduct'
//     }
//   }, {
//     $project: {
//       cartid: 1, ItemId: 1, Quantity: 1, Cartdisplayproduct: { $arrayElemAt: ['$Cartdisplayproduct', 0] }
//     }
//   }])
//   console.log(CartProduct)


//   var subtot = 0;
//   for (let g = 0; g < CartProduct.length; g++) {
//     subtot = subtot + ((CartProduct[g].Cartdisplayproduct.offerprice) * (CartProduct[g].Quantity))

//   }

//   responses.subtotal = subtot;

//   for (var h = 0; h < CartProduct.length; h++) {
//     if ((CartProduct[h].ItemId) == (req.body.productId)) {
//       console.log(typeof (CartProduct[h].Quantity));
//       responses.quantnumb = CartProduct[h].Quantity;
//     }
//   }
//   res.json(responses)
// })

// router.get('/checkout', async (req, res) => {
//   if (req.session.userA) {
//     let docs = await user.find({ useremail: req.session.userA }).clone()
//     let userid = docs[0]._id


//     const CartProduct = await cart.aggregate([{ $match: { UserId: userid } }, { $unwind: '$Product' }, {
//       $project: {
//         cardtid: '$_id', ItemId: '$Product.ItemId',
//         Quantity: '$Product.Quantity'
//       }
//     }, {
//       $lookup: {
//         from: 'products',
//         localField: 'ItemId',
//         foreignField: '_id',
//         as: 'Cartdisplayproduct'
//       }
//     }, {
//       $project: {
//         cartid: 1, ItemId: 1, Quantity: 1, Cartdisplayproduct: { $arrayElemAt: ['$Cartdisplayproduct', 0] }
//       }
//     }])

//     var subtotal = 0;
//     for (let k = 0; k < CartProduct.length; k++) {
//       subtotal = subtotal + (CartProduct[k].Cartdisplayproduct.offerprice * CartProduct[k].Quantity)
//     }


//     if (subtotal == 0) { res.redirect('/shop') }
//     else { res.render('checkout', { subtotal: subtotal, cartdetails: CartProduct, userdetails: docs }) }
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })
// router.get('/addaddresscheckout', (req, res) => {
//   if (req.session.userA) {
//     res.render('addaddresscheckout');
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.post('/addaddresscheckout', async (req, res) => {
//   let docu = await user.find({ useremail: req.session.userA }).clone()
//   let userID = docu[0]._id




//   user.findByIdAndUpdate(ObjectId(userID), {
//     $push: {
//       useraddress: {
//         name: req.body.addressname,
//         address: req.body.Address,
//         city: req.body.town_city,
//         state: req.body.state,
//         Country: req.body.country,
//         Pin: req.body.Pin,
//         Phone: req.body.phonenumber,
//         email: req.body.emailaddress
//       }
//     }
//   }, (err, addr) => {
//     if (err) {
//       console.log("not able to add address");
//       var type = 'failed to add address'
//     }
//     else {
//       console.log(" added billing address");

//       res.redirect('/checkout')
//     }
//   })
// })


// router.post('/checkout', async (req, res) => {

//   var data = await user.find({ useremail: req.session.userA })
//   var ide = data[0]._id;


//   let cartinfo = await cart.find({ UserId: ide })


//   //calculating amount here for security
//   const CartProd = await cart.aggregate([{ $match: { UserId: ide } }, { $unwind: '$Product' }, {
//     $project: {
//       cardtid: '$_id', ItemId: '$Product.ItemId',
//       Quantity: '$Product.Quantity'
//     }
//   }, {
//     $lookup: {
//       from: 'products',
//       localField: 'ItemId',
//       foreignField: '_id',
//       as: 'Cartdisplayproduct'
//     }
//   }, {
//     $project: {
//       cartid: 1, ItemId: 1, Quantity: 1, Cartdisplayproduct: { $arrayElemAt: ['$Cartdisplayproduct', 0] }
//     }
//   }])

//   var subtotal = 0;
//   for (let k = 0; k < CartProd.length; k++) {
//     subtotal = subtotal + (CartProd[k].Cartdisplayproduct.offerprice * CartProd[k].Quantity)
//   }
//   var total = Math.round(1.18 * subtotal);

//   // Coupon calculation start
//   let dataofcoupon = await coupon.find({ couponname: req.body.coupon })
//   if (dataofcoupon == '') {
//     console.log('NO coupon')
//   }
//   else {

//     console.log(dataofcoupon);

//     let discount = subtotal * (dataofcoupon[0].percentage / 100)
//     if (discount > dataofcoupon[0].cap) {
//       discount = dataofcoupon[0].cap
//     }
//     let newsubtotal = Math.round(subtotal - discount)
//     total = Math.round(1.18 * newsubtotal)

//     //storing used coupon
//     await user.findByIdAndUpdate(data[0]._id,
//       {
//         $push: {
//           usedcoupon: dataofcoupon[0]._id
//         }
//       })
//   }
//   //coupon calculation end


//   // create first order
//   const order_schema = new order({
//     OdruserId: ide,
//     OrderedProduct: cartinfo[0].Product,
//     subtotal: total,
//     orderstatus: "Failed",
//     paymentmode: req.body.pay,
//     orderedaddress: [{
//       ordname: data[0].useraddress[req.body.position].name,
//       ordaddress: data[0].useraddress[req.body.position].address,
//       ordcity: data[0].useraddress[req.body.position].city,
//       ordstate: data[0].useraddress[req.body.position].state,
//       ordCountry: data[0].useraddress[req.body.position].Country,
//       ordPin: data[0].useraddress[req.body.position].Pin,
//       ordPhone: data[0].useraddress[req.body.position].Phone,
//       ordemail: data[0].useraddress[req.body.position].email
//     }],
//     date: new Date()
//   })

//   order_schema.save();
//   console.log("order sAVED");


//   //start of wallet  
//   if (req.body.usewallet == 'use') {
//     req.session.walletuse = 'use'
//     if (total >= data[0].userwallet) {
//       total = total - data[0].userwallet

//       req.session.walletupdate = 0

//     }
//     else {
//       //update user wallet-total
//       let a = data[0].userwallet - total
//       req.session.walletupdate = a


//     }

//   }
//   //end of wallet

//   if (req.body.pay == "COD") {
//     var status = "COD"
//     res.json({ status })



//   }
//   else if (req.body.pay == 'wallet') {
//     //fully from wallet
//     var status = "wallet"
//     res.json({ status })
//   }
//   else if (req.body.pay == "Razorpay") {

//     instance.orders.create({
//       amount: total * 100,
//       currency: "INR",
//       receipt: '' + CartProd[0]._id
//     },   //passing cartid        
//       function (err, orde) {
//         if (err) {
//           console.log(err)
//         }
//         else {
//           let Responses = {}

//           Responses.Status = "razorpay"
//           Responses.orde = orde
//           res.json(Responses)

//         }
//       })

//   }
//   else if (req.body.pay == "Paypal") {
//     const create_payment_json = {
//       "intent": "sale",
//       "payer": {
//         "payment_method": "paypal"
//       },
//       "redirect_urls": {
//         "return_url": "http://malefashion.ml/purchase",
//         "cancel_url": "http://malefashion.ml/payment-failed"
//       },
//       "transactions": [{
//         "item_list": {
//           "items": [{
//             "name": "Red Sox Hat",
//             "sku": "001",
//             "price": total,
//             "currency": "USD",
//             "quantity": 1
//           }]
//         },
//         "amount": {
//           "currency": "USD",
//           "total": total
//         },
//         "description": "Hat for the best team ever"
//       }]
//     };


//     paypal.payment.create(create_payment_json, function (error, payment) {
//       if (error) {
//         throw error;
//       } else {
//         let Responses = {}
//         Responses.status = "paypal"
//         Responses.obj = payment
//         res.json(Responses)
//       }
//     });
//   }



// })

// router.post('/verify-payment', (req, res) => {
//   console.log(req.body);


//   const crypto = require('crypto')
//   let hmac = crypto.createHmac('sha256', 'SdKQjYtRr8iGwSAAbiYyxnPk')
//   hmac.update(req.body['payment[razorpay_order_id]'] + '|' + req.body['payment[razorpay_payment_id]']);
//   console.log(hmac);
//   hmac = hmac.digest('hex')
//   console.log(req.body['payment[razorpay_signature]'])


//   if (hmac == req.body['payment[razorpay_signature]']) {
//     // accept

//     console.log('payment successfull');
//     var payresult = 'paid'
//     res.json({ payresult })


//   }
//   else {
//     console.log('payment failed')
//     //   reject
//     var payresult = 'failed'
//     res.json({ payresult })
//   }

// })

// router.get('/payment-failed', (req, res) => {
//   if (req.session.userA) {
//     res.render('payment-failed')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }


// })

// router.get('/purchase', async (req, res) => {
//   //clear cart
//   if (req.session.userA) {
//     var userinfo = await user.find({ useremail: req.session.userA })
//     var userid = userinfo[0]._id;
//     console.log(userid);

//     let orderdetail = await order.find({ OdruserId: userid })
//     let position = orderdetail.length - 1
//     console.log(orderdetail[position]);

//     order.findByIdAndUpdate(orderdetail[position]._id, { orderstatus: 'successfull' }, function (err, doc) {
//       if (err) { console.log(err); }
//       else { console.log('order status updated'); }
//     })

//     cart.deleteOne({ UserId: userid }).then(function () {
//       console.log("Data deleted"); // Success
//     }).catch(function (error) {
//       console.log(error); // Failure  
//     });

//     if (req.session.walletuse == 'use') {
//       let currentuser = await user.find({ useremail: req.session.userA })
//       console.log(currentuser);
//       user.findByIdAndUpdate(currentuser[0]._id, { userwallet: req.session.walletupdate }, (err, doc) => {
//         if (err) {
//           console.log('error in updating in wallet');
//         }
//         else {
//           console.log('successfull in updating in wallet');
//           req.session.walletuse = ''
//         }
//       })

//     }
//     res.render('purchasesuccess')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }

// })
// router.get('/userprofile', async (req, res) => {
//   if (req.session.userA) {
//     var Userinfo = await user.find({ useremail: req.session.userA })
//     console.log(Userinfo[0].username)

//     res.render('profilepage', { userdetails: Userinfo })
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })
// router.get('/userorderdetail', async (req, res) => {
//   if (req.session.userA) {
//     var Userinfo = await user.find({ useremail: req.session.userA })
//     await order.find({ OdruserId: Userinfo[0]._id }, function (err, data) {
//       console.log(data);

//       res.render('userorder', { orderdetails: data })
//     }).sort({ date: -1 }).clone()
//   }
//   else {
//     res.redirect('/signuplogin')
//   }


// })




// router.get('/userorderdetails', async (req, res) => {
//   if (req.session.userA) {
//     await order.find({ _id: ObjectId(req.query.id) }, async function (err, data) {

//       const singleorder = await order.aggregate([
//         {
//           $match: { _id: ObjectId(req.query.id) }
//         },
//         {
//           $unwind: '$OrderedProduct'
//         },
//         {
//           $project: {
//             subtotal: 1,
//             date: 1,
//             orderstatus: 1,
//             _id: 1,
//             item: '$OrderedProduct.ItemId',
//             Quantity: '$OrderedProduct.Quantity'
//           }
//         },
//         {
//           $lookup: {
//             from: 'products',
//             localField: 'item',
//             foreignField: '_id',
//             as: 'product'
//           }
//         },

//         {
//           $project: {
//             subtotal: 1, date: 1, orderstatus: 1, _id: 1, item: 1, Quantity: 1, product: { $arrayElemAt: ['$product', 0] }
//           }
//         }
//       ])

//       res.render('userorderreview', { orderdetails: data, productdetails: singleorder })
//     }).clone()
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.get('/userordercancel', async (req, res) => {
//   if (req.session.userA) {

//     let data = await order.findById(req.query.id)

//     if (data.orderstatus == 'successfull') {
//       order.findByIdAndUpdate(req.query.id, { orderstatus: 'cancelled' }, async function (err, doc) {
//         if (err) { console.log(err); }
//         else { console.log('order status updated'); }
//       })

//       let userdata = await user.find({ useremail: req.session.userA })
//       console.log(userdata);
//       let newBal = data.subtotal + userdata[0].userwallet
//       if (data.paymentmode != 'COD') {
//         user.findByIdAndUpdate(userdata[0]._id, { userwallet: newBal }, (err, docs) => {
//           if (err) {
//             console.log(err);
//           }
//           else {
//             console.log('updated user wallet on cancel')
//           }
//         })
//       }
//     }
//     res.redirect('back');
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.get('/edituserinfo', async (req, res) => {
//   if (req.session.userA) {
//     var Userinfo = await user.find({ useremail: req.session.userA })
//     res.render('Editprofilepage', { userdetails: Userinfo })
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })
// router.post('/updateuserinfo', (req, res) => {
//   console.log(req.body.newmobile);
//   console.log(req.body.newemail);
//   console.log(req.body.newname);
//   console.log(req.body.userid);
//   user.findByIdAndUpdate(req.body.userid, { username: req.body.newname, useremail: req.body.newemail, usermobile: req.body.newmobile }, (err, docs) => {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log('updated user info')
//     }
//   })
//   res.redirect('/userprofile')
// })
// router.get('/useraddresses', async (req, res) => {
//   if (req.session.userA) {
//     var Userinfo = await user.find({ useremail: req.session.userA })
//     console.log(Userinfo[0].username)
//     res.render('useraddresslist', { userdetails: Userinfo })
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })

// router.get('/usereditaddress', async (req, res) => {
//   if (req.session.userA) {
//     console.log(req.query.id)
//     var Userinfo = await user.find({ useremail: req.session.userA })

//     var position = req.query.id
//     res.render('usereditaddress', { position: position, editaddress: Userinfo[0].useraddress[req.query.id] });
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })
// router.post('/usereditaddress', async (req, res) => {
//   var Userinfo = await user.find({ useremail: req.session.userA })
//   console.log(Userinfo[0].useraddress[req.body.position].name);

//   user.updateOne({
//     _id: Userinfo[0]._id
//   }, {
//     $push: {
//       useraddress: {
//         name: req.body.addressname,
//         address: req.body.Address,
//         city: req.body.town_city,
//         state: req.body.state,
//         Country: req.body.country,
//         Pin: req.body.Pin,
//         Phone: req.body.phonenumber,
//         email: req.body.emailaddress
//       }
//     }
//   }, (err, doc) => {
//     if (err) { console.log(err); }
//     else { console.log(doc) }
//   });

//   user.updateOne({
//     _id: Userinfo[0]._id
//   }, {
//     $pull: {
//       useraddress: {
//         name: Userinfo[0].useraddress[req.body.position].name
//       }
//     }
//   }, (err, doc) => {
//     if (err) { console.log(err); }
//     else { console.log(doc) }
//   });


//   res.redirect('/useraddresses')
// })
// router.get('/userdeleteaddress', async (req, res) => {
//   if (req.session.userA) {
//     var Userinfo = await user.find({ useremail: req.session.userA })
//     user.updateOne({
//       _id: Userinfo[0]._id
//     }, {
//       $pull: {
//         useraddress: {
//           name: Userinfo[0].useraddress[req.query.id].name
//         }
//       }
//     }, (err, doc) => {
//       if (err) { console.log(err); }
//       else { console.log(doc) }
//     });

//     res.redirect('/useraddresses')
//   }
//   else {
//     res.redirect('/signuplogin')
//   }
// })
// router.post('/checkcoupon', async (req, res) => {
//   console.log(req.body.code)
//   let data = await coupon.find({ couponname: req.body.code })
//   if (data == '') {
//     let Responses = {}
//     Responses.status = "invalid"
//     res.json(Responses)
//   }
//   else {
//     console.log(data);
//     console.log(data[0].percentage);
//     let discount = req.body.subtotal * (data[0].percentage / 100)
//     if (discount > data[0].cap) {
//       discount = data[0].cap
//     }
//     let newsubtotal = Math.round(req.body.subtotal - discount)
//     console.log(newsubtotal)

//     let Responses = {}

//     var Userinfo = await user.find({ useremail: req.session.userA })

//     let usedcheck = await user.find({ _id: Userinfo[0]._id, usedcoupon: data[0]._id })
//     console.log(usedcheck);
//     if (usedcheck == '') {
//       Responses.status = "valid"
//     }
//     else {
//       Responses.status = "used"
//     }
//     console.log(Responses.status);
//     Responses.Newsubtotal = newsubtotal
//     Responses.couponcode = data[0].couponname
//     res.json(Responses)
//   }
// })


module.exports = router;
