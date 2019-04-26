const restaurantTemplate = {
  "_id" : "any",
  "logo" : "url",
  "commercialName" : "",
  "legalName" : "",
  "rating" : "'(float max 5 min 1)'",
  "reviews" : [
    {
      "name" : "",
      "review" : "",
      "rating" : 0
    }
  ],
  "meals" : [
    {
      "name" : "",
      "description" : "",
      "price" : 0
    }
  ],
  "commercialEmail" : "",
  "adminNumber" : "",
  "address" : "",
  "location" : ""
}


const orderTemplate = {
 meals : [
    {
      name : '',
      description : '',
      price : 0
    }
  ],
  totalCost : 0,
  retaurant_id: '0',
  adresss : '',
  location : 'latLng',
  userLocation : 'latLng',
  orderTime : 'date'
}

module.exports = {
restaurantTemplate, orderTemplate
}