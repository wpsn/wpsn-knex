const express = require('express')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const validator = require('validator')
const csurf = require('csurf')

const query = require('./query')

const app = express()
app.use(cookieSession({
  name: 'session',
  keys: ['mysecret']
}))
app.use(flash())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(csurf())
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

function flashLocalsMiddleware(req, res, next) {
  res.locals.errors = req.flash('error')
  next()
}

app.get('/', authMiddleware, flashLocalsMiddleware, (req, res) => {
  query.getUrlEntriesByUserId(req.user.id)
    .then(rows => {
      res.render('index.ejs', {rows, csrfToken: req.csrfToken()})
    })
})

app.get('/login', flashLocalsMiddleware, (req, res) => {
  res.render('login.ejs', {csrfToken: req.csrfToken()})
})

app.post('/login', (req, res) => {
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

app.post('/url_entry', authMiddleware, (req, res) => {
  const long_url = req.body.long_url
  query.createUrlEntry(long_url, req.user.id)
    .then(() => {
      res.redirect('/')
    })
    .catch(err => {
      req.flash('error', err.message)
      res.redirect('/')
    })
})

app.get('/:id', (req, res, next) => {
  query.getUrlById(req.params.id)
    .then(entry => {
      if (entry) {
        query.incrementClickCountById(entry.id)
          .then(() => {
            const {long_url} = entry
            if (long_url.match(/https?:\/\//)) {
              res.redirect(entry.long_url)
            } else {
              res.redirect('http://' + entry.long_url)
            }
          })
      } else {
        next()
      }
    })
})

app.get('/register', flashLocalsMiddleware, (req, res) => {
  res.render('register.ejs', {csrfToken: req.csrfToken()})
})

app.post('/register', (req, res) => {
  new Promise((resolve, reject) => {
    const {id, password} = req.body
    if (!id || !password) {
      reject(new Error('아이디와 비밀번호를 입력하셔야 합니다.'))
    } else if (id.length > 20) {
      reject(new Error('아이디는 20자까지만 입력할 수 있습니다.'))
    } else if (!validator.isAlphanumeric(req.body.id)) {
      reject(new Error('아이디는 영문자 혹은 숫자만 입력 가능합니다.'))
    } else if (password.length < 8) {
      reject(new Error('비밀번호는 8자 이상 입력해야 합니다.'))
    } else {
      resolve(bcrypt.hash(req.body.password, 10))
    }
  })
    .then(hash => query.createUser(req.body.id, hash))
    .then(() => {
      req.session.id = req.body.id
      res.redirect('/')
    })
    .catch(err => {
      req.flash('error', err.message)
      res.redirect('/register')
    })
})

app.listen(3000, () => {
  console.log('listening...')
})
