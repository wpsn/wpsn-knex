const knex = require('./knex')

knex.schema.createTable('user', t => {

}).then(() => knex.schema.createTable('url_entry', t => {

})).then(process.exit)
