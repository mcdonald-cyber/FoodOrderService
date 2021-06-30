const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function bodyHasValidDish(req, res, next) {
   const { data = {} } = req.body;
    // Validate the Client data
  const requiredFields= ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
    if (!data[field]) {
      return next({
        status: 400,
        message:`Dish must include a ${field}`
      });
    }
  };
  //Check if Price is less than Zero
  const {name, description, price, image_url} = data
  if (!Number.isInteger(price) || price<=0) {
      return next({
      status:400,
      message:`Dish price must be greater than zero`
      });
  };
}

function create(req, res, next) {
   const { data: {name, description, price, image_url} = {} } = req.body;
  //save the client data to our data store
  const newDish = {
    id: nextId(),
    name,
    description, 
    price, 
    image_url,
  };
  //Return appropriate response
  dishes.push(newDish);
  res.status(201).json({ data: newDish});
};

function dishExist(req, res, next) {
  const {dishId} = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish === undefined) {
    return next({
      status: 404,
      message: `Dish does not exist: ${dishId}.`,
    });
  }
  res.locals.foundDish = foundDish;
  next();
}

function read(req, res) {
  
  res.json({data: res.locals.foundDish})
  
};


function update(req, res) {
  const {updateDish} = res.locals;
  const {foundDish} = res.locals;
  // if dish does not exist, error
  if (updateDish.id !== foundDish.id) {
    return next({
      status: 400,
      message: `You can not change existing dish id ${foundDish.id} to ${updateDish.id}`,
    });
  }
  //update found foundDish with updateDish in newDish
  const newDish = { ...foundDish, ...updateDish }
  res.json({ data: newDish });
  
};


function list(req, res) {
  res.json({data: dishes});
};

module.exports = {
  create: [bodyHasValidDish, create],
  update: [dishExist, bodyHasValidDish, update],
  read: [dishExist, read],
  list,
};
