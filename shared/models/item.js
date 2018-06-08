const m = require('../connection').mongoose;
const Schema = m.Schema;

const Item = new Schema({
  _name: { type: String, required: true, trim: true },
  description: String,
  count: { type: Number, required: true, default: 0 }
},{
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

module.exports = Item;