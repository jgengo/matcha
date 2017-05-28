let fs = require('fs');


// Model
//-----------------------------------------------------------------------------------------------
let User = require('../models/user')
let Checker = require('../models/checker')

// Functions
//-----------------------------------------------------------------------------------------------
function isAuth(req, res, next) {
  if (req.session.user === undefined) {
      req.toastr('error', 'You need to be logged', 'Forbidden')
      res.redirect('/login')
  } else {
   next()
  }
}
function isValidated(req, res, next) {
  if (req.session.user !== undefined && req.session.user.validate_step !== undefined) {
    if (req.session.user.validate_step !== 0)
      res.redirect('/register/step/')
  } else {
    next()
  }
}

// Routes
//-----------------------------------------------------------------------------------------------
module.exports = (app) => {

    app.get('/', isAuth, isValidated, (req, res) => {
        res.render('index')
    })
    // Users
    //-------------------------------------------------------------------------------------------
    app
    .get('/register', (req, res) => {
        res.render('users/register')
    })
    .post('/register', (req, res) => {  
        Checker.register(req.body, (callback) => {
            if (callback !== 'ok') {
                req.flash('error', callback)
                res.redirect('register')
            } else {
                User.create(req.body, (callback) => {
                    if (callback === 'success')
                        req.flash('success', "Welcome to matcha site!")
                    res.redirect('register')
                })
            }
        })
    })
    // app.get('/users/:id', (req, res) => {
    //     let id = req.params.id;
    //     if (parseInt(id, 10)) {
    //       
    //       User.find(id, (user) => {
    //           res.render('users/index', {
    //               user: user

    //           })
    //       })
    //     } else {
    //       res.render('users/index', {user: 'invalid'})    
    //     }
    // })
    app
    .get('/login', (req, res) => {
        res.render('users/login')
    })
    .post('/login', (req, res) => {
        Checker.login(req.body, (callback) => {
            if (callback !== 'ok') {
                req.flash('error', callback)
                res.redirect('login')
            } else {
                User.sign_in(req.body, (callback) => {
                    if (callback.constructor.name !== 'User') {
                        req.flash('error', callback)
                        res.redirect('login')
                    } else {
                        if (req.session.user === undefined) {
                          req.session.user = {
                            id: callback.id,
                            validate_step: callback.validate_step
                          }
                          res.redirect('/')
                        }
                    }
                })
            }
        })
    })

    // Step registeration
    //-------------------------------------------------------------------------------------------
    app.get('/register/step/', isAuth, (req, res) => {
      res.render('users/step', {user: req.session.user})
    })
    app.post('/register/step', isAuth, (req, res) => {
      if (req.session.user.validate_step == 1) {
        Checker.register_step_1(req.body, (callback) => {
          if (callback !== 'ok') {
            req.flash('error', callback)
            res.redirect('step')
          } else {
            if (req.body.interested_by.length == 2 || req.body.interested_by.length == 0)
              req.body.interested_by = 'both'
            User.update(req, (callback) => {
              if (callback === 'success') {
                req.session.user.validate_step = 2
                res.redirect('step')
              }
            })
          }
       })
      }
      else if (req.session.user.validate_step == 2) {
        console.log('2');
      } else {
        res.redirect('/')
      }

  })


}