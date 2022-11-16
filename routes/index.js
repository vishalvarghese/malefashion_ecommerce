var express = require('express');
const { render } = require('../app');
var router = express.Router();

const user = require('./modal/userschema');
const product = require('./modal/productschema')
/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.userA) {
    res.redirect('/shop')
  }
  else {
    let data = await product.find()
    console.log(data);
    res.render('index', { data });
  }
});

router.get('/signuplogin', function (req, res) {
  res.render('logintry');
})

//router.post('/adduser')  
router.get('/signup', (req, res) => {
  res.render('signuppage')
})

router.post('/signuplogin', async function (req, res) {
  var personinfo = req.body;//get the parsed info

  if (!personinfo.username || !personinfo.useremail || !personinfo.userpassword || !personinfo.usermobile) {
    res.render('signuppage', {
      message: "Details incomplete", type: "error"
    })
  }
  else if (((personinfo.username).length < 4) || (personinfo.username).match(' ' + ' ') || !(personinfo.username).match(/^[a-zA-Z]+( [a-zA-Z]+)+$/)) {
    res.render('signuppage', {
      type: "username rule"
    })
  }

  else if (!(personinfo.useremail).match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
    res.render('signuppage', {
      type: "email rule"
    })
  }
  else if (((personinfo.usermobile).length !== 10) || (!(personinfo.usermobile).match(/^[0-9]{10}$/))) {
    res.render('signuppage', {
      type: "mobile number rule"
    })
  }
  else if (((personinfo.userpassword).length < 8)) {
    res.render('signuppage', {
      type: "password rule"
    })
  }

  else {
    let data = await user.find({ userreferralcode: personinfo.referralcode })

    //first condition
    if (data != '') {
      let bal = data[0].userwallet + 150
      user.findByIdAndUpdate(data[0]._id, { userwallet: bal }, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("Updated wallet User : ");
        }
      })

      console.log('success with active referal')
      var newuser = new user({
        username: personinfo.username,
        useremail: personinfo.useremail,
        usermobile: personinfo.usermobile,
        userpassword: personinfo.userpassword,
        userstatus: "active",
        userwallet: 100,
        userreferralcode: 'ABC' + (Math.round((Math.random() * 90000)) + 10000)

      })
      newuser.save(function (err, person) {
        if (err) {
          res.render('signuppage', { message: "Database error", type: "error" })
          console.log('Db error in ')
        }
        else
          res.render('logintry', { message: "new person added", type: "referralsuccess" })
      })

    }

    //seconnd condition
    else if ((data == '') && (personinfo.referralcode != '')) {
      console.log('wrong referal')

      res.render('signuppage', {
        type: "incorrect referral"
      })
    }
    //third condition
    else if ((personinfo.referralcode == '') && (data == '')) {
      console.log(personinfo.referralcode)
      console.log('success with out referral')

      var newuser = new user({
        username: personinfo.username,
        useremail: personinfo.useremail,
        usermobile: personinfo.usermobile,
        userpassword: personinfo.userpassword,
        userstatus: "active",
        userwallet: 0,
        userreferralcode: 'ABC' + (Math.round((Math.random() * 90000)) + 10000)

      })
      newuser.save(function (err, person) {
        if (err) {
          res.render('signuppage', { message: "Database error", type: "error" })
          console.log('Db error in ')
        }
        else
          res.render('logintry', { message: "new person added", type: "success" })
      })

    }


  }
})




module.exports = router;
