const m = require('../connection').mongoose;
const Schema = m.Schema;

const Item = require('./item');

const Inventory = new Schema({
  _playerId: Schema.Types.ObjectId,
  items: [Item]
},{
  timestamps: { 
      createdAt: 'created_at', 
      updatedAt: 'updated_at' 
  }
});

module.exports = Inventory;