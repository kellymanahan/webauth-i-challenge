const knex = require('knex');
const dbConfig = require('../knexfile');

const db = knex(dbConfig.development);

module.exports = {
    add: function(user) {
        return db('users').insert(user);
    },

    get: function(user) {
        return db('users').where('username', user.username)
    },
    
    findBy: () => {
        return db('users').select("username");
    }
}