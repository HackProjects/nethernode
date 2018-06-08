const m = require('../connection').mongoose;
const Schema = m.Schema;

const Player = new Schema({
  username: { type: String, default: "anon" },
},{
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

module.exports = Player;