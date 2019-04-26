# Muestra para TrueLogicSoftware

## TrueLogicCodeTest
Author: Juan Carlos Cancela / Juan David Tabares

[GIT HOMEPAGE](https://github.com/juandata/restaurantsApi/)

[GLITCH EDIT HOME PROJECT](https://glitch.com/edit/#!/restaurants-api)

### Description
Develop a Rest API for restaurant/delivery, each restaurant should follow the following
data structure:

````js
{ 
  "_id" : "any",
  "logo" : "url",
  "commercialName" : "",
  "legalName" : "",
  "rating" : "'(float max 5 min 1)' *average of all reviews rating",
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
````
## User Stories

- Provide endpoints to delete, list (with the possibility of filtering by rating), edit information

- Provide an endpoint to rate each restaurant (the total rate of the place should be an
average of all user ratings)

- Provide an endpoint to create an order, should have one or more meals, total cost,
address and a latLng position of the place, this endpoint should save the order on a
different table/document and return ETA (estimated time of arrival) based on user
location and restaurant location (transport media being a motorcycle), this time should
have in count traffic at the moment.
----
**API DOC**
----
  This API uses node.js to get the sender ip. It is designed to get request via  postman, cURl or similar. You can also get the lat, long of sender from a client (via the HTML5 Geolocation) going to the base url of the app.
  
  ##### *Remember to allow location clicking on the lock icon of your broswer

* **BASE URL**

  https://restaurants-api.glitch.me

* **Method:**
  `GET` 
  
*  **URL Params**
  No Params

* **Success Response:**
  There is not success response in the form of a body as this request is in the client side, the response should be your lat and log pos using HTML5 Geolocation.

 ----
# ENDPOINTS

# /listRestaurants
You can get all the restaurants or filter via rating value. 

* **URL**

  https://restaurants-api.glitch.me/listRestaurants

* **Method:**
  `GET`  

   **Optional params:**
 
   `rating=5`

* **Example**

   https://restaurants-api.glitch.me/listRestaurants?rating=4.5
* **Success Response:**
  
  Reply with the restaurants that match the rating param:

  * **Code:** 200 <br />
    **Content:** Your lat, long  on the browser. *Accept location and reload if necessary.  
 
* **Error Response:**

  ````"Document does not exist. Try another rating number."````

  * **Code:** 200 OK
----

 # /addRestaurant
You can post a restaurant to the mongoDB. 

* **URL**

  https://restaurants-api.glitch.me/addRestaurant

* **Method:**
  `POST`  

   **Required body:**
 
   ````js
    {
  "_id" : "1",
  "logo" : "https://www.ilatinabuenosaires.com/images/layout/ilatina.png",
  "commercialName" : "Restaurante i Latina Buenos Aires",
  "legalName" : "Restaurante i Latina Buenos Aires",
  "rating" : null,
  "reviews" : [
  ],
  "meals" : [
    {
      "name" : "Oda al Maíz",
      "description" : "Arepita, buñuelo, empanadita",
      "price" : 500
    },
    {
      "name" : "Milanesas con guarnición",
      "description" : " milanesas de pollo, berenjena, saetan, zucchini, soja y pescado",
      "price" : 800
    },
    {
      "name" : "Ensalada Cesar",
      "description" : "La mejor ensalada de la Argentina",
      "price" : 450
    }
  ],
  "commercialEmail" : "latina@gmail.com",
  "adminNumber" : "+54 11 4857-9095",
  "address" : "Murillo 725, C1414 AFE, Buenos Aires, Argentina",
  "location" : "-34.6038612,-58.4810822,12"
  }   
   ````

* **Example**

   https://restaurants-api.glitch.me/addRestaurant
* **Success Response:**
  
  Reply with the default mongoDB answer:

  * **Code:** 200 <br />
    **Content:** 
    ````js
      {
    "result": {
        "ok": 1,
        "n": 1,
        "opTime": {
            "ts": "6684071540486569985",
            "t": 1
        }
    },
    "ops": [
        {
            "_id": "1",
            "logo": "https://www.ilatinabuenosaires.com/images/layout/ilatina.png",
            "commercialName": "Restaurante i Latina Buenos Aires",
            "legalName": "Restaurante i Latina Buenos Aires",
            "rating": null,
            "reviews": [],
            "meals": [
                {
                    "name": "Oda al Maíz",
                    "description": "Arepita, buñuelo, empanadita",
                    "price": 500
                },
                {
                    "name": "Milanesas con guarnición",
                    "description": " milanesas de pollo, berenjena, saetan, zucchini, soja y pescado",
                    "price": 800
                },
                {
                    "name": "Ensalada Cesar",
                    "description": "La mejor ensalada de la Argentina",
                    "price": 450
                }
            ],
            "commercialEmail": "latina@gmail.com",
            "adminNumber": "+54 11 4857-9095",
            "address": "Murillo 725, C1414 AFE, Buenos Aires, Argentina",
            "location": "-34.6038612,-58.4810822,12"
        }
    ],
    "insertedCount": 1,
    "insertedIds": {
        "0": "1"
       }
    }
    ````
* **Error Response:**
  
  When you try to add an object with a duplicated key.
  ````"E11000 duplicate key error index: restaurantsapi.restaurants.$_id_ dup key: { : "1" }."````

  * **Code:** 200 OK

----

 # /addReview
You can post a review to a restaurant and save it in mongoDB. The API answers with the rating average.

* **URL**

  https://restaurants-api.glitch.me/addReview

* **Method:**
  `PATCH`  

   **Required body:**
 
   ````js
    {
    "selector" : {"_id" : "1"},
    "update" : {  
      "name" : "juan david tabares arce",
      "review" : "me encantó la comida del restaurante. Llegó  rápido y caliente!",
          "rating" : 4}
    }
   ````

* **Example**

   https://restaurants-api.glitch.me/addReview
* **Success Response:**
  
  Reply with the default mongoDB answer:

  * **Code:** 200 <br />
    **Content:** 
    ````js
    {
    "the rating average is ": 4.3
    }
    ````
* **Error Response:**
  
  When you try to add a rating less than 1 or higher than 5.
  ````"Rating must be between 1 and 5}."````

  * **Code:** 200 OK

----
 # /addOrder
You can add an order to a restaurant and get the ETA and other useful info about the order. I am using the google maps api, specifically the distancematrix API.

* **URL**

  https://restaurants-api.glitch.me/addOrder

* **Method:**
  `POST`  

   **Required body:**
 
   ````js
       {
      "selector" : {"_id" : "1"},
      "update" : [
        {
            "name" : "Oda al Maíz",
            "description" : "Arepita, buñuelo, empanadita",
            "price" : 500,
            "quantity" : 2
          },
          {
            "name" : "Milanesas con guarnición",
            "description" : " milanesas de pollo, berenjena, saetan, zucchini, soja y pescado",
            "price" : 800,
            "quantity" : 1
          }
        
      ]
    }
   ````

* **Example**

   https://restaurants-api.glitch.me/addOrder
* **Success Response:**
  
  I know you told me to show only ETA, but I wanted to add also some other info like the total price, the meals that were ordered and other useful info. I can change this if you want. 
  Reply with the default mongoDB answer:

  * **Code:** 200 <br />
    **Content:** 
    ````js
    {
    "meals": [
        {
            "name": "Oda al Maíz",
            "description": "Arepita, buñuelo, empanadita",
            "price": "500",
            "quantity": 2
        },
        {
            "name": "Milanesas con guarnición",
            "description": " milanesas de pollo, berenjena, saetan, zucchini, soja y pescado",
            "price": 800,
            "quantity": 1
        }
    ],
    "retaurant_id": "1",
    "addresss": "Murillo 725, C1414 AFE, Buenos Aires, Argentina",
    "location": "-34.6038612,-58.4810822,12",
    "userLocation": [
        10.9711,
        -74.7837
    ],
    "totalCost": 1800,
    "orderTime": "2019-04-26T06:20:13.666Z",
    "ETA": "4 days 14 hours"
    }
    ````
* **Error Response:**
  
  When you try to add an order with an invalid id restaurant parameter. 
  ````"Please check your parameters. Document might not exist."````

  * **Code:** 200 OK
----
 # /editRestaurant
You can edit a restaurant, at this point you can change any data, this can be modified if you require it.

* **URL**

  https://restaurants-api.glitch.me/editRestaurant

* **Method:**
  `PATCH`  

   **Required body:**
 
   ````js
     {
      "selector" : {"_id" : "1"},
      "update" : {"commercialName" : "nombre editado"}
      }
   ````

* **Example**

   https://restaurants-api.glitch.me/editRestaurant
* **Success Response:**
  
  You can get the mongodb default answer:

  * **Code:** 200 <br />
    **Content:** 
    ````js
      {
          "n": 1,
          "nModified": 1,
          "opTime": {
              "ts": "6684086010231390209",
              "t": 1
          },
          "electionId": "7fffffff0000000000000001",
          "ok": 1,
          "operationTime": "6684086010231390209",
          "$clusterTime": {
              "clusterTime": "6684086010231390209",
              "signature": {
                  "hash": "bGFal6wUZnvjZnyG4TXE54yxPuU=",
                  "keyId": "6667985509278547969"
              }
          }
      }
    ````
* **Error Response:**
  
  When you try to edit a restaurant with an invalid id restaurant parameter. In this case the 'nModified' property has a value of 0 items modifed. MongoDB default. 
    ````js
    {
      "n": 0,
      "nModified": 0,
      "opTime": {
          "ts": "6684086323764002817",
          "t": 1
      },
      "electionId": "7fffffff0000000000000001",
      "ok": 1,
      "operationTime": "6684086323764002817",
      "$clusterTime": {
          "clusterTime": "6684086323764002817",
          "signature": {
              "hash": "gHz+Hmi88B/GEmky2Ft3rOqN0lY=",
              "keyId": "6667985509278547969"
          }
      }
  }
  ````

  * **Code:** 200 OK

----

# /deleteRestaurant
You can delet a restaurant adding the _id as an url parameter.

* **URL**

  https://restaurants-api.glitch.me/deleteRestaurant

* **Method:**
  `DELETE`  

   **Required url parameters:**
 
   ````js
     '_id=1'
   ````

* **Example**

   https://restaurants-api.glitch.me/deleteRestaurant?_id=1
* **Success Response:**
  
  Default mongodb answer, if the document was deleted 'n' value will be 1:

  * **Code:** 200 <br />
    **Content:** 
    ````js
     {
    "n": 1,
    "opTime": {
        "ts": "6684090206414438401",
        "t": 1
    },
    "electionId": "7fffffff0000000000000001",
    "ok": 1,
    "operationTime": "6684090206414438401",
    "$clusterTime": {
        "clusterTime": "6684090206414438401",
        "signature": {
            "hash": "vTQ0aIRAIU+cPjG5bKHpE2uPytk=",
            "keyId": "6667985509278547969"
        }
      }
    }
    ````
* **Error Response:**
  
  When you try delete a restaurant with an invalid id restaurant parameter. In this case the 'n' property has a value of 0 items modifed. MongoDB default. 
    ````
    {
      "n": 0,
      "nModified": 0,
      "opTime": {
          "ts": "6684086323764002817",
          "t": 1
      },
      "electionId": "7fffffff0000000000000001",
      "ok": 1,
      "operationTime": "6684086323764002817",
      "$clusterTime": {
          "clusterTime": "6684086323764002817",
          "signature": {
              "hash": "gHz+Hmi88B/GEmky2Ft3rOqN0lY=",
              "keyId": "6667985509278547969"
          }
      }
  }
  ````

  * **Code:** 200 OK

----

## Authors:
 Juan Carlos Cancela | Juan David Tabares Arce 