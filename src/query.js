const knex = require('./knex')

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

module.exports = {
  user: {
    get(id) {
      return knex('user')
        .where({id})
        .first()
    },
    login(username, password) {
      return knex('user')
        .where({username, password})
        .first()
    }
  },
  url_entry: {
    list(user_id) {
      return knex('url_entry')
        .limit()
    },
    create({user_id, short_url, long_url}) {
      return knex('url_entry')
        .insert({
          user_id,
          short_url,
          long_url
        })
    },
    getByShortUrl(short_url) {
      return knex('url_entry')
        .where({short_url})
        .first()
    }
  }
}
