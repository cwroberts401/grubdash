const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list (req, res) {
    res.status(200).json({data: orders});
};

function orderHasDeliverTo (req, res, next) {
    const {data: {deliverTo} = {} } = req.body;
    if(deliverTo){
        return next();
    }
    next({
        status: 400,
        message: `Order must include a deliverTo`,
    });
};

function orderHasMobileNumber (req, res, next) {
    const {data: {mobileNumber} = {} } = req.body;
    if(mobileNumber){
        return next();
    }
    next({
        status: 400,
        message: `Order must include a mobileNumber`,
    });
};

function orderHasDishes (req, res, next) {
    const {data: {dishes} = {} } = req.body;
    if(typeof dishes === "object" && dishes.length){
        return next();
    }
    next({
        status: 400,
        message: `Order must include at least one dish`,
    });
};

function orderHasQuantity (req, res, next) {
    const {data: {dishes} = {} } = req.body;
    console.log(dishes[0].quantity)
    const index = dishes.findIndex(i => i.quantity < 1 || typeof i.quantity !== "number")

    if(dishes.every((dish) => dish.quantity > 0 && typeof dish.quantity === "number")){
      return next();
    }
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`
    });
};

function orderStatus (req, res, next) {
      const { data: { status } = {} } = req.body;
      const validStatus = ['pending', 'preparing', 'out-for-delivery', 'delivered']
      if(validStatus.includes(status)){
        return next();
      }
      next({
        status: 400,
        message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
      });
};

function create (req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const id = nextId();
    const newOrder = {
      id, deliverTo, mobileNumber, status, dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
};

function orderExists (req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `order id not found: ${orderId}`,
    });
};

function read (req, res) {
    res.status(200).json({ data: res.locals.order });
};

function idMatch (req, res, next) {
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;
    
    if (orderId === id || !id){
        next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
      });
};

function update (req, res, next) {
    const id = res.locals.order.id;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const updatedOrder = { id, deliverTo, mobileNumber, status, dishes }
    const indexOfOrderToUpdate = orders.findIndex(i => i.id === id)
    
    orders.splice(indexOfOrderToUpdate, 1, updatedOrder);
    res.json({data: updatedOrder});
};

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (orders[index].status === 'pending'){
      const deletedOrders = orders.splice(index, 1);
      return next({
        status: 204
      })
  }
  next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`
  });
};

module.exports = {
    list,
    create: [orderHasDeliverTo, orderHasMobileNumber, orderHasDishes, orderHasQuantity, create],
    read: [orderExists, read],
    update: [orderExists, orderHasDeliverTo, orderHasMobileNumber, orderHasDishes, orderHasQuantity, orderStatus, idMatch, update],
    delete: [orderExists, destroy]
}