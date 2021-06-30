const path = require("path");

// Order the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Order this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//! Helper FUNCTION 

// checking body of Order is valid
function bodyHasValidOrder (req, res, next) {
  const { data = {deliverTo, mobileNumber, dishes} } = req.body;
   // Validate the Client data
    if (!deliverTo || typeof deliverTo !== "string")
     next({ status: 400, message: `Order must include a deliverTo` });

    if (!mobileNumber || typeof deliverTo !== "string")
     next({ status: 400, message: `Order must include a mobileNumber` });

    if (!dishes || Array.isArray(dishes) === false || dishes.length <= 0)
     next({ status: 400, message: "Order must include at least one dish" });

     let errorIndex;
     const hasQuantity = dishes.every((dish, index) => {
         if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== "number") {
             errorIndex = index;
             return false
         }
         return true
     })
 
     if (hasQuantity === false) next({ status: 400, message: `Dish ${errorIndex} must have a quantity that is an integer greater than 0` });
     next();
 };

 const checkStatus = (req, res, next) => {
  const { data: { status } = {} } = req.body;

  if (!status || typeof status !== "string") next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` });
  if (status === "delivered") next({ status: 400, message: `A delivered order cannot be changed` });
  if (status === "pending" || status === "preparing" || status === "out-for-delivery") {
      next();
  } else {
      next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` });
  }
};

const pendingStatus = (req, res, next) => {
  const { matchedOrder } = res.locals;
  if (matchedOrder.status !== "pending") next({ status: 400, message: `An order cannot be deleted unless it is pending` });
  next();
}

function orderExist(req, res, next) {
  const {orderId} = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder === undefined) {
    return next({
      status: 404,
      message: `order does not exist: ${orderId}.`,
    });
  }
  res.locals.foundOrder = foundOrder;
  next();
}

//! Route FUNCTION
//list
function list(req, res) {
  res.json({data: orders});
};

//create order
function create(req, res) {
  const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body;
  //save the client data to our data store
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber, 
    status, 
    dishes,
  };
  //Return appropriate response
  orders.push(newOrder);
  res.status(201).json({ data: newOrder});
};

//read order
function read(req, res) {
  
    res.join({data: res.locals.order})
    
  };

//update order
function update(req, res) {
  const {updateOrder} = res.locals;
  const {foundOrder} = res.locals;
  // if dish does not exist, error
  if (updateOrder.id !== foundOrder.id) {
    return next({
      status: 400,
      message: `You can not change existing dish id ${foundOrder.id} to ${updateOrder.id}`,
    });
  }
  //update found foundOrder with updateOrder in newDish
  const newDish = { ...foundOrder, ...updateOrder }
  res.json({ data: newOrder });
  
};

//delete
function destroy(req, res) {
    // using the locals property attached to the response instead of grabbing the orderId from req.params
    const index = orders.findIndex((order) => order.id === res.locals.order.id);
    const deletedOrder = orders.splice(index, 1);
    console.log("the following was deleted: ", deletedOrder);
    res.sendStatus(204);
  }

  module.exports = {
    list,
    create: [bodyHasValidOrder, create],
  update: [orderExist, bodyHasValidOrder, checkStatus, update],
    read: [orderExist, read],
    delete: [pendingStatus, orderExist, destroy],
  };