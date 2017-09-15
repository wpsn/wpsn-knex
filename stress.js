const axios = require('axios')

function stress(count) {
  if (count > 0) {
    axios.get('http://localhost:3000/P0vtwX0M')
    setTimeout(() => stress(count - 1))
  }
}

stress(1000)
