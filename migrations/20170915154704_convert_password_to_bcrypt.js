const bcrypt = require('bcrypt')

exports.up = function(knex, Promise) {
  return knex('user')
    .then(users => {
      const promises = users.map(user => {
        const hash = bcrypt.hashSync(user.password, 10)
        return knex('user')
          .where({id: user.id})
          .update({password: hash})
      })
      return Promise.all(promises)
    })
};

exports.down = function(knex, Promise) {
  return Promise.resolve(1)
};
