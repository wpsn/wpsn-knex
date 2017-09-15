
exports.up = function(knex, Promise) {
  return knex.schema.table('url_entry', t => {
    t.integer('click_count').unsigned().defaultTo(0)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('url_entry', t => {
    t.dropColumn('click_count')
  })
};
