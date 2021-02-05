const express = require('express');
const router = express.Router();
const passport = require('passport');
// Load User model
const User = require('../models/user');
const bcrypt = require('bcrypt')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
 // res.render('users/dashboard', {
  //  user: req.user
  //})
  let query = User.find()
  if (req.query.name != null && req.query.name != '') {
    query = query.regex('name', new RegExp(req.query.name, 'i'))
  }   
  try {
    const users= await query.exec()
    res.render('users/dashboard', {
      user: req.user,
      users: users,
      searchOptions: req.query
      })
       
  } catch {
      res.redirect('/')
      console.log("Erro ao Pequisar")   
  }
})


// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('users/login')
});

// Register Page - forwardAuthenticated,
router.get('/register', forwardAuthenticated, (req, res) => {  
  res.render('users/register')
})

// Register
//router.post('/register', async (req, res) => { 
  router.post('/register', async (req, res) => { 
  let user

  if (!req.body.name || !req.body.email || !req.body.password || !req.body.password2) {
      res.render('users/register', {
      user: user,
      errorMessage: 'Por favor, preenche todos os campos'})
  }

  else if (req.body.password != req.body.password2) {
        res.render('users/register', {
        errorMessage: 'Passwords não combinam'})
  }

  else if (req.body.password.length < 6) {
    res.render('users/register', {
     errorMessage: 'Password deve ter pelo menos 6 caracteres'})
  }/*
  else if (User.find(req.body.email)) {
    res.render('users/register', {
      errorMessage: 'Usuario já existe'})   
  } */
  else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      name : req.body.name,      
      email :  req.body.email,
      password : hashedPassword
      })
      try {
        const newUser = await user.save()
        res.redirect(`users/${newUser.id}`)     
        
      } catch {
        res.redirect(`/`)
        
      }
  }   
})

// Login
router.post('/login', (req, res, next) => {
  try{
    passport.authenticate('local', {
      successRedirect: '/users/dashboard',
      fairlueRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  }catch(e){
      console.log(e)
  }
 
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

//editar user
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const user= await User.findById(req.params.id)
    res.render('users/edit', { user: user })    
  } catch {
    res.redirect('/users')
  }
})

  // Show User
  router.get('/:id', ensureAuthenticated, async (req, res) => {   
    try {
      const users = await User.find({ name: req.params.id}).limit(6).exec()
      res.render('users/show', { users: users })
    } catch(e) {
      res.redirect('/')
      //console.log(e)
     
    }
  })
  // Update Place Route
router.put('/:id',  ensureAuthenticated, async (req, res) => {

  let user= await User.findById(req.params.id)

      if (!req.body.name || !req.body.email || !req.body.password || !req.body.password2) {
        res.render('users/edit', { user: user ,
        errorMessage: 'Por favor, preenche todos os campos'})
    }
  
    else if (req.body.password != req.body.password2) {
      res.render('users/edit', { user: user ,
          errorMessage: 'Passwords não combinam'})
    }
  
    else if (req.body.password.length < 6) {
      res.render('users/edit', { user: user ,      
       errorMessage: 'Password deve ter pelo menos 6 caracteres'})
    }/*
    else if (User.find(req.body.email)) {
      res.render('users/register', {
        errorMessage: 'Usuario já existe'})   
    } */
    else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
       
        user= await User.findById(req.params.id)
        user.name = req.body.name,      
        user.mail = req.body.mail,        
        user.password = req.body.password
        try {
          const newUser = await user.save()
          res.redirect(`users/${newUser.id}`)     
          
        } catch {
          res.redirect(`/`)
          
        }
        }
        
  })
     
 // Delete Place Page
 router.delete('/:id',  ensureAuthenticated, async (req, res) => {
  let user
  try {
    user = await User.findById(req.params.id)
    await user.remove()
    res.redirect('/users')
  } catch {
    if (user!= null) {
      res.render('user/show', {
        user: user,
        errorMessage: 'Não pode remover o Utilizador'
      })
    } else {
      res.redirect('/')
    }
  }
})

module.exports = router;
