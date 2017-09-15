const knex = require('./knex')
const randomstring = require('randomstring')

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
  getUser(id, password) {
    return knex('user')
      .where({id, password})
      .first()
  },
  createUrlEntry(long_url, user_id) {
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
