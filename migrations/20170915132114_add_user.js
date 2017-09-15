
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', t => {
    t.string('id').primary()
    t.string('password').notNullable()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user')
};
