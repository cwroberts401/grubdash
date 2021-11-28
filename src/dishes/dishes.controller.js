const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function list (req, res) {
    res.status(200).json({data: dishes});
};

function dishHasName (req, res, next) {
    const {data: {name} = {} } = req.body;
    if(name){
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a name`,
    });
};

function dishHasDescription (req, res, next) {
    const {data: {description} = {} } = req.body;
    if(description){
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a description`
    });
};

function dishHasPrice (req, res, next) {
    const {data: {price} = {} } = req.body;
    if(typeof price === "number" && price > 0){
        return next();
    }
    next({
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    });
};

function dishHasImage (req, res, next) {
    const {data: {image_url} = {} } = req.body;
    if(image_url){
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a image_url`
    });
};


function create (req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const id = nextId();
    const newDish = {
      id, name, description, price, image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
};

function dishExists (req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
};

function read (req, res) {
    res.status(200).json({ data: res.locals.dish });
};

function idMatch (req, res, next) {
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;
    
    if (dishId === id || !id){
        next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${dishId}.`
      });
};

function update (req, res) {
    const id = res.locals.dish.id;
    const { data: { name, description, price, image_url } = {} } = req.body;
    const updatedDish = { id, name, description, price, image_url }
    const indexOfDishToUpdate = dishes.findIndex(i => i.id === id)
    
    dishes.splice(indexOfDishToUpdate, 1, updatedDish);
    res.json({data: updatedDish});

};

module.exports = {
    list,
    create: [dishHasName, dishHasDescription, dishHasPrice, dishHasImage, create],
    read: [dishExists, read],
    update: [dishExists, dishHasName, dishHasDescription, dishHasPrice, dishHasImage, idMatch, update],
}