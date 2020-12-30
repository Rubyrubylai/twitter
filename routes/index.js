module.exports = (app) => {
  app.use('/', require('./routes'))
  app.use('/admin', require('./admin'))
  app.use('/users', require('./users'))
  app.use('/tweets', require('./tweets'))
  app.use('/replies', require('./replies'))
}
