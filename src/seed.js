const faker = require('faker')
const randomstring = require('randomstring')

const knex = require('./knex')

knex('user')
  .insert({
    username: 'fast',
    password: 'campus'
  })
  .then(async ([user_id]) => {
    for (var i = 0; i < 10; i++) {
      await knex('url_entry')
        .insert({
          user_id,
          short_url: randomstring.generate(8),
          long_url: faker.internet.url()
        })
    }
  })
  .then(() => {
    console.log('done!')
  })
