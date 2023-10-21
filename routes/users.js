var express = require('express');
var router = express.Router();
const authenticate = require('../models/authenticator');
const table_crud = require('../models/table_crud');
const table_director = require('../models/table_director');
const admin_crud = require('../models/admin_crud');
const product_crud = require('../models/product_crud');

// GET the login page
router.get('/login', function(req, res, next) {
  res.render('login', { title : "Login page", message : ""});
});

//POST by the login form
router.post('/login', async function(req, res, next) {
  let user_name = req.body.username;
  let pass_word = req.body.password;
  let user = await authenticate(user_name, pass_word)
  if(user)
  {
    //store user's shop in session after login
    req.session.username = user_name;
    req.session.role = user.role;
    req.session.department_id = user.department_id;
    // console.log("Session data:", req.session);
    if(req.session.role == 'admin')
    {
      res.redirect('/users/admin');
    }
    else if(req.session.role == 'director')
    {
      res.redirect('/users/director');
    }
    else if(req.session.role == 'staff')
    { 
      res.redirect('/users/shop_info');
    }
  }
  else
  res.render('login', { 
    title : "Login page", 
    message : "Wrong username and password, please login again."});
});

/* GET logout. */
router.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});


/* GET admin page */
router.get('/admin', async function(req, res, next) {
  // check username in session to make sure that user logged in.
  if (req.session.username)
  {
    let user_name = req.session.username;
    let role = req.session.role;
    let table_string = await table_crud('users', role);
    res.render('admin', { title : "Admin page", user_cells: table_string, uname: user_name});
  } else {
    res.redirect('/users/login')
  }
});
// /* POST crud for admin page */
// router.post('/admin_crud', async function(req, res, next) {
//   let req_body = req.body;
//   await admin_crud(req_body);
//   res.redirect('/users/admin');
// });

/* GET director page */
router.get('/director', async function(req, res, next) {
  // check username in session to make sure that user logged in.
  let user_name = req.session.username;
  // let role = req.session.role;
  // let department_id = req.session.department_id;
  let table_string = await table_director('productsToy');
  // let form_string = await select_form();
  // console.log(table_string)
  if (user_name)
  {
    res.render('director', {title: "Director",
      uname: user_name, 
      product_cells: table_string, 
      // select_form: form_string,
    });
  } else {
    res.redirect('/users/login')
  }
});


/* GET shop page */
router.get('/shop_info', async function(req, res, next) {
  // check username in session
  if (req.session.username)
  {
    let user_name = req.session.username;
    let role = req.session.role;
    let department_id = req.session.department_id;
    // console.log("User's Shop from session:", department_id);
    console.log("Session data:", req.session);
    let table_string = null;
    if (department_id == 2)
    {
    table_string = await table_crud('productsToy', role, department_id);
    } else if (department_id == 3)
    {
    table_string = await table_crud('productsBook', role, department_id);
    } else if (department_id == 4)
    {
    table_string = await table_crud('productsClothes', role, department_id);
    }
    res.render('profile', { title : "Shop page", product_cell: table_string, uname: user_name});
  }else {
    res.redirect('/users/login')
  }
});
/* POST crud for shop page */
// Handle CRUD operations for both admin and product tables
router.post('/crud', async function(req, res, next) {
  const req_body = req.body;
  const btn = req_body.btn;
  let role = req.session.role;
  let department_id = req.session.department_id;

  if (btn === 'Update' || btn === 'Delete' || btn === 'Create') {
    // Determine the table name based on your application logic.
    // You can use a condition to switch between admin and product tables.
    let table_name;
    if (role == 'admin') {
      table_name = 'users'; // Adjust the table name for admin.
      await admin_crud(req_body, table_name);
    } else if (department_id == 2) {
      table_name = 'productsToy';
      await product_crud(req_body, table_name);
    } else if (department_id == 3) {
      table_name = 'productsBook';
      await product_crud(req_body, table_name);
    } else if (department_id == 4) {
      table_name = 'productsClothes';
      await product_crud(req_body, table_name);
    }
  }

  // Redirect back to the appropriate page after the operation
  if (role === 'admin') {
    res.redirect('/users/admin');
  } else {
    res.redirect('/users/shop_info');
  }
});


module.exports = router;
