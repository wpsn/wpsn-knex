const express = require('express')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')

const query = require('./query')
const knex = require('./knex')

const app = express()
const urlencodedMiddleware = bodyParser.urlencoded({ extended: false })

app.use(cookieSession({
  name: 'session',
  keys: ['mysecret']
}))
app.set('view engine', 'ejs')

function authMiddleware(req, res, next) {
  if (req.session.id) {
    knex('user')
      .where({id: req.session.id})
      .first()
      .then(matched => {
        req.user = matched
        res.locals.user = matched
        next()
      })
  } else {
    res.redirect('/login')
  }
}

app.get('/', authMiddleware, (req, res) => {
  knex('url_entry')
    .where({
      user_id: req.user.id
    })
    .then(rows => {
      res.render('index.ejs', {rows})
    })
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.post('/login', urlencodedMiddleware, (req, res) => {
  knex('user')
    .where({
      id: req.body.username,
      password: req.body.password
    })
    .first()
    .then(matched => {
      if (matched) {
        req.session.id = matched.id
        res.redirect('/')
      } else {
        res.status(400)
        res.send('400 Bad Request')
      }
    })
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.listen(3000, () => {
  console.log('listening...')
})
