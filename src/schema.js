const knex = require('./knex')

knex.schema.createTable('user', t => {
  t.increments()
  t.string('username').unique().notNullable()
  t.string('password').notNullable()
  t.timestamp('created_at').defaultTo(knex.fn.now())
}).then(() => knex.schema.createTable('url_entry', t => {
  t.increments()
  t.string('short_url', 8).notNullable().unique()
  t.string('long_url').notNullable()
  t.integer('user_id').unsigned()
  t.foreign('user_id').references('user.id')
  t.timestamp('created_at').defaultTo(knex.fn.now())
})).then(process.exit)
