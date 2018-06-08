const Inventory = require("../shared/models").Inventory;
const Item = require("../shared/models").Item;
const Player = require("../shared/models").Player;

module.exports = function(context, req) {
  if (!req.query.playerId && !(req.body && req.body.playerId)) {
    context.res = {
      status: 400,
      body: { error: "playerId required" }
    };
    return context.done();
  }

  var playerId = req.query.playerId || req.body.playerId;

  // validate playerId
  Player.findById(playerId, (error, record) => {
    if (error || !record) {
      context.res = {
        status: 404,
        body: { error: "playerId not found" }
      };
      context.done();
    } else {
      // return player inventory if exists or create new one
      readInventory(context, playerId);
    }
  });
};

const readInventory = (context, playerId) => {
  Inventory.findOne({ _playerId: playerId }, (error, record) => {
    if (error) {
      context.res = {
        status: 400,
        body: { error }
      };
    } else if (!record) {
      // if no record exists, create it
      return createInventory(context, playerId);
    } else {
      // return the player's inventory
      context.res = {
        status: 200,
        body: record
      };
    }
    context.done();
  });
};

const createInventory = (context, playerId) => {
  var inventory = new Inventory();
  inventory._playerId = playerId;

  inventory.save((error, doc) => {
    if (!error) {
      context.res = {
        status: 201,
        body: doc
      };
      context.log("successfully created player inventory: ", doc._id);
    } else {
      context.res = {
        status: 400,
        body: error
      };
    }
    context.done();
  });
};
