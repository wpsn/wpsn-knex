const knex = require('./knex')

module.exports = {
  getUserById(id) {
    return knex('user')
      .where({id})
      .first()
  },
  getUrlEntriesByUserId(user_id) {
    return knex('url_entry')
      .where({user_id})
  },
  getUser(id, password) {
    return knex('user')
      .where({id, password})
      .first()
  }
}
