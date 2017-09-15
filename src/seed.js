const faker = require('faker')
const randomstring = require('randomstring')

const knex = require('./knex')

knex('user')
  .insert({
    id: 'fast',
    password: 'campus'
  })
  .then(() => {
    for (var i = 0; i < 20; i++) {
      knex('url_entry')
        .insert({
          id: randomstring.generate(8),
          long_url: faker.internet.url(),
          user_id: 'fast'
        }).then(console.log)
    }
  })
