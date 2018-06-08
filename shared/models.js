const connection = require('./connection').connection;

// hook up models to an active db connection for saving
// See https://www.npmjs.com/package/mongoose
const Item = require('./models/item');
const Inventory = require('./models/inventory');
const Player = require('./models/player');

module.exports = {
    Item: connection.model('Item', Item),
    Inventory: connection.model('Inventory', Inventory),
    Player: connection.model('Player', Player)
}

