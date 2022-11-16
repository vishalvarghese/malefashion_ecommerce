var express = require('express');
var router = express.Router();

var multer = require('multer');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/productimages')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname)
  }
})

const upload = multer({ storage: fileStorageEngine })


const user = require('./modal/userschema');
const category = require('./modal/categoryschema');
const product = require('./modal/productschema');

const orders = require('./modal/orderschema');
const { findByIdAndUpdate } = require('./modal/userschema');

const ObjectId = require("mongodb").ObjectId;

const coupon = require('./modal/couponschema');
const couponone = require('./modal/couponschema');

const admincredential = {
  email: "admin@gmail.com",
  password: "admin123"
}

/* GET users listing. */
router.get('/admin', function (req, res) {
  console.log(req.session.user);
  if (req.session.user) {
    res.redirect('/admindashboard')
  }
  else {
    res.render('adminlogin')
  }
});

router.post('/adminlogin', function (req, res) {
  if (req.body.adminemail == admincredential.email && req.body.adminpassword == admincredential.password) {
    req.session.user = admincredential.email;
    console.log(req.session.user);


    res.redirect('/admindashboard');
  }
  else {
    res.render('adminlogin', { type: 'invalid user' })
  }
});


router.get('/admindashboard', async function (req, res) {
  if (req.session.user) {
    let CODcount = await orders.find({ paymentmode: 'COD' }).count();
    let paypalcount = await orders.find({ paymentmode: 'Paypal' }).count();
    let razorpaycount = await orders.find({ paymentmode: 'Razorpay' }).count();

    let categorydata = await product.aggregate([{
      $group: {
        _id: "$productcategory",
        quantity: { $sum: '$quantity' }
      }
    }])

    console.log(categorydata);

    let b = categorydata.map(function (element) {
      return element.quantity
    })
    let a = categorydata.map(function (element) {
      return (element._id)
    })

    console.log(a);
    console.log(b);
    res.render('admindashboard', { CODcount, paypalcount, razorpaycount, categorydetails: categorydata, a, b });
  }
  else {
    res.redirect('/admin');
  }
})

router.get('/admin_customerlist', async function (req, res) {
  if (req.session.user) {
    await user.find(function (err, data) {
      res.render('customerlist', { userdetails: data })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
})
router.get('/block', async (req, res) => {
  await user.findByIdAndUpdate(req.query.id, { userstatus: "blocked" }, function (err, data) {
    if (err) {
      console.log('failed to update')
    }
    else {
      res.redirect('/admin_customerlist')
    }
  }).clone()

})

router.get('/adminlogout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      res.send('Error')
    }
    else {

      res.redirect('/admin');
    }

  })
})

router.get('/unblock', async (req, res) => {
  await user.findByIdAndUpdate(req.query.id, { userstatus: "active" }, function (err, data) {
    if (err) {
      console.log('failed to update')
    }
    else {
      res.redirect('/admin_customerlist')
    }

  }).clone()
})

router.get('/admincategorymanage', async function (req, res) {
  if (req.session.user) {
    await category.find(function (err, data) {
      res.render('admincategorymanage', { categorydetails: data })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
})


router.post('/addcategory', function (req, res) {

  var addcategory = new category({ categoryname: req.body.newcategory })
  addcategory.save()
  res.redirect('/admincategorymanage')

})

router.get('/adminproductlist', async function (req, res) {
  if (req.session.user) {
    var categdata;
    await category.find(function (err, data) {
      categdata = data;
    }).clone()
    console.log(categdata);
    await product.find(function (err, data) {

      res.render('adminproductlist', { productdetails: data, categorydetails: categdata, message: "" })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
})

router.get('/adminADDproducts', async function (req, res) {
  if (req.session.user) {
    await category.find(function (err, data) {
      res.render('Addproducts', { categorydetails: data })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
})

router.post('/adminADDproducts', upload.array('image', 3), function (req, res) {

  var filename = req.files.map(function (file) {
    return file.filename;
  })
  req.body.image = filename;
  var addproduct = new product({
    productname: req.body.newproductname,
    productdescription: req.body.newproductdescription,
    productprice: req.body.newproductprice,
    productimage: req.body.image,
    offerprice: req.body.newofferprice,
    quantity: req.body.newquantity,
    productcategory: req.body.newproductcategory
  })

  addproduct.save()

  res.redirect('/adminproductlist')
})

router.get('/questiondelete', async (req, res) => {
  if (req.session.user) {
    await category.find(function (err, data) {
      categdata = data;
    }).clone()

    await product.find({ _id: req.query.id }, function (err, data) {
      console.log(data);

      res.render('adminproductlist', { productdetails: data, categorydetails: categdata, message: "confirm" })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
  //  res.render('adminproductlist',{productdetails:x,message:"confirm"})
})
router.get('/deleteproduct', async (req, res) => {
  if (req.session.user) {
    await product.findByIdAndDelete(req.query.id)
    console.log('deleted');
    res.redirect('/adminproductlist')
  }
  else {
    res.redirect('/admin')
  }
})

router.get('/deletecategory', async (req, res) => {
  if (req.session.user) {
    await category.findByIdAndDelete(req.query.id)
    console.log('deleted category');
    res.redirect('/admincategorymanage')
  }
  else {
    res.redirect('/admin')
  }
})

router.get('/productupdate', async (req, res) => {
  if (req.session.user) {
    await product.find({ _id: req.query.id }, function (err, data) {
      //console.log(data);
      res.render('adminproductlist', { productdetails: data, message: "change" })
    }).clone()
  }
  else {
    res.redirect('/admin')
  }
})
router.post('/storeupdatedproduct', upload.array('upimage', 3), async (req, res) => {
  // console.log(req.query.id)
  var filename = req.files.map(function (file) {
    return file.filename;
  })
  req.body.upimage = filename;

  await product.findByIdAndUpdate(req.query.id, {
    productname: req.body.updateproductname,
    productdescription: req.body.updateproductdescription,
    productprice: req.body.updateproductprice,
    offerprice: req.body.updateofferprice,
    quantity: req.body.updatequantity,
    productcategory: req.body.updatecategory,
    productimage: req.body.upimage
  }, function (err, data) {
    if (err) {
      console.log('failed to update')
    }
    else {
      res.redirect('/adminproductlist')
    }

  }).clone()

})

router.get('/admin_orderlist', async function (req, res) {
  if (req.session.user) {
    await orders.find(function (err, data) {

      res.render('orders', { orderdetails: data })
    }).sort({ date: -1 }).clone()
  }
  else {
    res.redirect('/admin')
  }
})

router.get('/singleorderdetails', async (req, res) => {
  console.log(req.query.id)
  if (req.session.user) {
    const singleorder = await orders.aggregate([
      {
        $match: { _id: ObjectId(req.query.id) }
      },
      {
        $unwind: '$OrderedProduct'
      },
      {
        $project: {
          subtotal: 1,
          date: 1,
          orderstatus: 1,
          _id: 1,
          item: '$OrderedProduct.ItemId',
          Quantity: '$OrderedProduct.Quantity'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'item',
          foreignField: '_id',
          as: 'product'
        }
      },

      {
        $project: {
          subtotal: 1, date: 1, orderstatus: 1, _id: 1, item: 1, Quantity: 1, product: { $arrayElemAt: ['$product', 0] }
        }
      }
    ])



    res.render('adminorderdetail', { orderdetails: singleorder, ID: req.query.id });
  }
  else {
    res.redirect('/admin')
  }
})

router.post('/cancelorder', (req, res) => {
  console.log(req.body.action)
  console.log(req.body.orderid);
  if (req.body.action == 'cancelled') {
    // orderstatus
    orders.findByIdAndUpdate(req.body.orderid, { orderstatus: 'cancelled' }, function (err, doc) {
      if (err) { console.log(err); }
      else { console.log('order updated'); }
    })
  }
  else if (req.body.action == 'Pending') {
    // orderstatus
    orders.findByIdAndUpdate(req.body.orderid, { orderstatus: 'Pending' }, function (err, doc) {
      if (err) { console.log(err); }
      else { console.log('order updated'); }
    })
  }
  else if (req.body.action == 'Shipped') {
    // orderstatus
    orders.findByIdAndUpdate(req.body.orderid, { orderstatus: 'Shipped' }, function (err, doc) {
      if (err) { console.log(err); }
      else { console.log('order updated'); }
    })
  }
  else if (req.body.action == 'Delivered') {
    // orderstatus
    orders.findByIdAndUpdate(req.body.orderid, { orderstatus: 'Delivered' }, function (err, doc) {
      if (err) { console.log(err); }
      else { console.log('order updated'); }
    })
  }
  res.redirect('back');
})

router.post('/dayreport', async (req, res) => {
  console.log(req.body.DAY)

  const daysales = await orders.aggregate([{ $match: { 'orderstatus': { $nin: ['cancelled'] } } },
  { $project: { order: '$OdruserId', date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, paymentmode: '$paymentmode', subtotal: '$subtotal' } },

  {
    $match: { date: req.body.DAY }
  }
  ])

  console.log(daysales);

  res.render('daysalesReport', { daysales })
})
router.post('/monthlyreport', async (req, res) => {

  let matchkey = req.body.m_YEAR + "-" + req.body.m_MONTH
  console.log(matchkey);
  const monthsales = await orders.aggregate([{ $match: { 'orderstatus': { $nin: ['cancelled'] } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },

      yearmonth: { $first: { $dateToString: { format: "%Y-%m", date: "$date" } } },
      total: { $sum: '$subtotal' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 },
  },
  {
    $match: { yearmonth: matchkey }
  }
  ])

  console.log(monthsales);

  res.render('monthsalesReport', { monthsales })
})
router.post('/yearlyreport', async (req, res) => {
  console.log(req.body.YEAR)

  const yearsales = await orders.aggregate([{ $match: { 'orderstatus': { $nin: ['cancelled'] } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
      year: { $first: { $dateToString: { format: "%Y", date: "$date" } } },
      total: { $sum: '$subtotal' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 },
  },
  {
    $match: { year: req.body.YEAR }
  }
  ])
  console.log(yearsales)
  res.render('yearsalesReport', { yearsales })
})

router.get('/couponmanagement', async (req, res) => {
  if (req.session.user) {
    let data = await couponone.find()
    console.log(data);
    res.render('admincoupon', { coupondetails: data })
  }
  else {
    res.redirect('/admin')
  }
})
router.post('/addcoupon', (req, res) => {

  var coupon = new couponone({ couponname: req.body.newcoupon, percentage: req.body.percentage, cap: req.body.capamount })
  coupon.save()
  res.redirect('back')
})
router.get('/removecoupon', (req, res) => {
  console.log(req.query.id);
  if (req.session.user) {
    coupon.findByIdAndRemove(req.query.id, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        console.log("Removed coupon : ", docs);
      }
    });
    res.redirect('/couponmanagement')
  }
  else {
    res.redirect('/admin')
  }
})

router.get('/productdiscountmanage', async (req, res) => {
  if (req.session.user) {
    let productlist = await product.find()
    let categorylist = await category.find()
    res.render('admindiscount', { productlist, categorylist, message: '' })
  }
  else {
    res.redirect('/admin')
  }
})
router.post('/productdiscountupdate', async (req, res) => {
  if (req.body.productselect != 'none') {
    let data = await product.findById(req.body.productselect)
    let newprice = Math.round((data.productprice) * ((100 - req.body.productdiscount) / 100))
    product.findByIdAndUpdate(req.body.productselect, { offerprice: newprice },
      function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("Updated offerprice : ", docs);
        }
      });
    let productlist = await product.find()
    let categorylist = await category.find()
    res.render('admindiscount', { productlist, categorylist, message: 'update product' })
  }
  else {
    res.redirect('back')
  }
})
router.post('/categorydiscountupdate', async (req, res) => {
  if (req.body.categoryselect != 'none') {
    console.log(req.body.categoryselect)
    console.log(req.body.categorydiscount)
    let cat = req.body.categoryselect
    let dis = req.body.categorydiscount
    let productlist = await product.find()
    console.log(productlist.length)
    for (i = 0; i < productlist.length; i++) {
      if ((productlist[i].productcategory) == cat) {
        let newprice = Math.round((productlist[i].productprice) * ((100 - dis) / 100))
        product.findByIdAndUpdate(productlist[i]._id, { offerprice: newprice },
          function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              console.log("Updated offerprice : ");
            }
          });
      }
    }
    let categorylist = await category.find()
    res.render('admindiscount', { productlist, categorylist, message: 'update category' })
  }
  else {
    res.redirect('back')
  }
})
module.exports = router;
