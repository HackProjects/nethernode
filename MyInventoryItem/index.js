const Inventory = require("../shared/models").Inventory;
const Item = require("../shared/models").Item;

module.exports = function(context, req) {
  if (req.params && !req.params.id) {
    context.res = {
      status: 400,
      body: "Error, append the inventory id in the path"
    };
    return context.done();
  }

  var inventoryId = req.params.id;
  context.log("inventory id:", inventoryId);

  // validate inventory id
  Inventory.findById(inventoryId, (error, doc) => {
    if (error || !doc) {
      context.res = {
        status: 404,
        body: { error: "inventory id not found" }
      };
      context.done();
    } else {
      // action depends on http method used...
      switch (req.method) {
        case "GET":
            // get inventory item(s)
            GET(context, req, doc);
          break;
        case "POST":
            // add item, or update item if exists 
            POST(context, req, doc);
          break;
        case "DELETE":
            // remove item
            DELETE(context, req, doc);
        break;
          
        default:
          context.res = {
            status: 405,
            body: { error: req.method + " method not supported" }
          };
          context.done();
      }
    }
  });

};

const checkForExistingItem = (context, req, inventoryDoc) => {
    var itemId = req.params.itemId || null;
    var itemName = req.query._name || null;
    var existingItem = null;
    if (itemName && itemName.length > 0) {
      existingItem = inventoryDoc.items.find(x => x._name === itemName) || null;
      if (existingItem) {
          itemId = existingItem._id;
      }
      context.log("* found item by _name:", itemName, itemId, existingItem );
    } else if (itemId) {
      existingItem = inventoryDoc.items.id(itemId);
    }
    return { itemId, itemName, existingItem };
}

const GET = (context, req, inventoryDoc) => {
    var {itemId, itemName, existingItem} = checkForExistingItem(context, req, inventoryDoc);
    context.log("* GET *", "item id:", itemId, "item name:", itemName);
    if ((itemId || itemName) && !existingItem) {
        context.res = {
            status: 404,
            body: {error: "Item not found"}
        };
    } else if (!existingItem) {
        context.res = {
            body: inventoryDoc
        };
    } else {
        context.res = {
            body: existingItem
        };
    }
      context.done();
}

const POST = (context, req, inventoryDoc) => {
    var {itemId, itemName, existingItem} = checkForExistingItem(context, req, inventoryDoc);
    context.log("* POST *", "item id:", itemId, "item name:", itemName);
    if (itemName && req.body && req.body.count >= 0 && req.body.description) {
        // check if item id exists
        if (itemId && !existingItem) {
          // item not found
          context.res = {
              status: 404,
              body: {error: "Item id not found to update"}
          };
          context.done();
        } else if (!existingItem) {
            // create new item
            var item = new Item();
            item.set(req.body);
            item._name = itemName || 'default';
          inventoryDoc.items.push(item);
          inventoryDoc.save((error,doc) => {
              if (!error) {
                  var newItem = doc.items[doc.items.length-1];
                  context.res = {
                      status: 201,
                      body: newItem
                  };
                  context.log("successfully added item:", newItem._id);
              } else {
                  context.res = {
                      status: 400,
                      body: { error : "Failed to add item" }
                  };
              }
              context.done();
          });
        } else {
            // update item payload
            existingItem.set(req.body);
            
            inventoryDoc.save().then((updatedDoc) => {
              var updatedSubDoc = updatedDoc.items.find(x => x._id === itemId);
              context.res = {
                  status: 200,
                  body: updatedSubDoc
              };
              context.log("ok update item:", itemId, updatedSubDoc);
              context.done();
            }).catch((error) => {
              context.res = {
                  status: 400,
                  body: { error : "Failed to update item" }
              };
              context.done();
            });

        }
      
    } else {
      context.res = {
          status: 400,
          body: { error: "Item '_name' param required with item payload '{count, description}'." }
      };
      context.done();
    }
}

const DELETE = (context, req, inventoryDoc) => {
    var {itemId, itemName, existingItem} = checkForExistingItem(context, req, inventoryDoc);
    context.log("* DELETE *", "item id:", itemId, "item name:", itemName);
    if (itemId && existingItem) {
        existingItem.remove();
        inventoryDoc.save((error, doc) => {
            if (error) {
                context.res = {
                    status: 400,
                    body: { error : "Failed to delete item" }
                };
                context.done();
            } else {
                // item deleted
                context.res = {
                    status: 204,
                    body: {}
                };
                context.done();
            }
          });
    } else if (!itemId) {
        context.res = {
            status: 400,
            body: { error : "Requires item id to delete" }
        };
        context.done();
    } else {
        context.res = {
            status: 404,
            body: { error : "Failed to find item to delete" }
        };
        context.done();
    }
}