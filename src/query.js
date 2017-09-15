const knex = require('./knex')
const randomstring = require('randomstring')
const validator = require('validator')

module.exports = {
  getUserById(id) {
    return knex('user')
      .where({id})
      .first()
  },
  getUrlEntriesByUserId(user_id) {
    return knex('url_entry')
      .where({user_id})
      .orderBy('created_at', 'desc')
  },
  createUrlEntry(long_url, user_id) {
    const valid = validator.isURL(long_url)
    if (!valid) {
      return Promise.reject(new Error('url이 올바르지 않습니다.'))
    }
    const id = randomstring.generate(8)
    return knex('url_entry')
      .insert({
        id,
        long_url,
        user_id
      })
  },
  getUrlById(id) {
    return knex('url_entry')
      .where({id})
      .first()
  },
  incrementClickCountById(id) {
    return knex('url_entry')
      .where({id})
      .increment('click_count', 1)
  },
  createUser(id, password) {
    return knex('user')
      .insert({id, password})
  }
}
