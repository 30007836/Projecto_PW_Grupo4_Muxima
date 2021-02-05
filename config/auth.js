module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    console.log('Aqui')
    req.flash('error_msg', 'Please log in to view that resource')
    res.redirect('/users/login')
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }    
      res.redirect('/users/dashboard')         
  }
}
