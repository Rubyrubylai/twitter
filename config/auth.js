const helpers = require('../_helpers')

module.exports = {
  authenticated: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'admin') {
        req.flash('error_messages', '賬號類型錯誤，請使用一般賬號登入')
        return res.redirect('/admin/tweets')
      }
      return next()
    }
    return res.redirect('/signin')
  },

  authenticatedAdmin: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'admin') {
        return next()
      }
      req.flash('error_messages', '賬號類型錯誤，請使用後台賬號登入')
      return res.redirect('/admin/signin')
    }
    res.redirect('/admin/signin')
  },

  apiAuthenticated: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    } else {
      return res.json({ status: 'error', message: 'permission denied' })
    }
  },

  apiAuthenticatedAdmin: (req, res, next) => {
    if (helpers.getUser(req)) {
      if (helpers.getUser(req).role === 'admin') { return next() }
      return res.json({ status: 'error', message: 'permission denied' })
    } else {
      return res.json({ status: 'error', message: 'permission denied' })
    }
  }
}