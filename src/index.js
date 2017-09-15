const express = require('express')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')

const query = require('./query')

const app = express()
const urlencodedMiddleware = bodyParser.urlencoded({ extended: false })

app.use(cookieSession({
  name: 'session',
  keys: ['mysecret']
}))
app.use(flash())
app.set('view engine', 'ejs')

function authMiddleware(req, res, next) {
  if (req.session.id) {
    query.getUserById(req.session.id)
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
  query.getUrlEntriesByUserId(req.user.id)
    .then(rows => {
      res.render('index.ejs', {rows})
    })
})

app.get('/login', (req, res) => {
  res.render('login.ejs', {errors: req.flash('error')})
})

app.post('/login', urlencodedMiddleware, (req, res) => {
  query.getUserById(req.body.username)
    .then(matched => {
      if (matched && bcrypt.compareSync(req.body.password, matched.password)) {
        req.session.id = matched.id
        res.redirect('/')
      } else {
        req.flash('error', '아이디 혹은 비밀번호가 일치하지 않습니다.')
        res.redirect('/login')
      }
    })
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.post('/url_entry', authMiddleware, urlencodedMiddleware, (req, res) => {
  const long_url = req.body.long_url
  query.createUrlEntry(long_url, req.user.id)
    .then(() => {
      res.redirect('/')
    })
    .catch(err => {
      res.status(400)
      res.send(err.message)
    })
})

app.get('/:id', (req, res, next) => {
  query.getUrlById(req.params.id)
    .then(entry => {
      if (entry) {
        query.incrementClickCountById(entry.id)
          .then(() => {
            res.redirect(entry.long_url)
          })
      } else {
        next()
      }
    })
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.post('/register', urlencodedMiddleware, (req, res) => {
  query.createUser(req.body.id, req.body.password)
    .then(() => {
      // 로그인
      req.session.id = req.body.id
      res.redirect('/')
    })
})

app.listen(3000, () => {
  console.log('listening...')
})
