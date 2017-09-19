const faker = require('faker')
const randomstring = require('randomstring')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user')
    .insert({
      id: 'fast',
      password: 'campus'
    })
    .then(() => {
      const arr = []
      for (var i = 0; i < 20; i++) {
        arr.push(
          knex('url_entry')
            .insert({
              id: randomstring.generate(8),
              long_url: faker.internet.url(),
              user_id: 'fast'
            })
        )
      }

      return Promise.all(arr)
    })

};
