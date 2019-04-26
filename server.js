// server.js
const uuidv1 = require('uuid/v1');
const bodyParser = require('body-parser')
const unirest = require('unirest');
const geoip = require('geoip-lite');

// create application/json parser
const jsonParser = bodyParser.json()
// where  node app starts, if you go to the root endpoint of the url you will see the lat, long with HTML5API
//lets require/import the mongodb native drivers.
const mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
const MongoClient = mongodb.MongoClient;
//init project
const express = require('express');
const app = express();
const address = process.env.SECRET;
const API_Endpoints = {
  add: '/addRestaurant',
  delete: '/deleteRestaurant',
  edit: '/editRestaurant',
  list: '/listRestaurants',
  rate: '/addReview/',
  addOrder: '/addOrder',
  trafficBaseUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json?',
  apikey: 'key=' + process.env.API_KEY
};


//we've started you off with Express,
app.use(express.static('public'));
//app.use(expressip().getIpInfoMiddleware);

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.post(API_Endpoints.add, jsonParser, (req, res, next) => {
  const writeToDatabasePromise = writeToDatabase(req.body, 'restaurants')
  .then((value) => {res.json(value);})
  .catch((err) => {res.send(err.errmsg)});
});
app.patch(API_Endpoints.edit, jsonParser, (req, res) => {
  const writeToDatabasePromise = updateDatabase(req.body)
  .then((value) => {res.json(value);})
  .catch((err) => {res.send(err.errmsg)});
});
app.get(API_Endpoints.list, (req, res) => {
  const writeToDatabasePromise = readDatabase(req)
  .then((value) => {
    console.log('value is', value);
    res.json(value);
  })
  .catch((err) => {
    res.send(err.errmsg)
  });

});
app.patch(API_Endpoints.rate, jsonParser, (req, res) => {
  if (req.body.update.rating !== undefined && req.body.update.rating >= 1 &&
    req.body.update.rating <= 5) {
    const writeToDatabasePromise = addReview(req.body)
    .then((value) => {
      const id = value;
      const getRatingPromise = getRatingAvg(value);
      getRatingPromise.then((value) => {
        const mapeo = value.map((el) => el.rating);
        const sumatoria = mapeo.reduce(function (a, b) {
          return a + b; 
        }, 0); 
        let promedio = sumatoria / mapeo.length;
        const body = {
          "selector": id,
          "update": { "rating": promedio.toFixed(2)}
        }
        const writeAvgRatingToDatabasePromise = updateDatabase(body)
        .then((value) => res.json({ "the rating average is ": body.update.rating }))
        .catch((err) => res.send(err));

      });
      getRatingPromise.catch((err) => res.send(err));
    })
    .catch((err) => {
      console.log('err is', err);
      res.send(err.errmsg)
      //"Problem with request!"
    });
  } else { res.send('Rating must be between 1 and 5') }
});
app.post(API_Endpoints.addOrder, jsonParser, (req, res) => {
  const ans = Object.keys(req.body.selector).length === 0 && req.body.selector.constructor === Object ? true : false;
  if (req.body.update.length >= 1 && ans === false) {
    const readPromise = readDatabase(req);
    readPromise.then((value) => {
      if (value.length > 0) {
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        ip = ip.replace('::ffff:', '').substr(0, ip.indexOf(','));
        const geo = geoip.lookup(ip);
        const url = API_Endpoints.trafficBaseUrl + 'origins=' + geo.ll.join() + '&destinations=' + value[0].address +
          '&departure_time=now&' + API_Endpoints.apikey;

        unirest.get(url)
          .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
          .end(function (response) {
            const totalCost = req.body.update.reduce((vi, vs) => {
              let sum1 = vi.quantity * vi.price;
              let sum2 = vs.quantity * vs.price;
              return sum1 + sum2;
            });

            let info = {
              meals: req.body.update
              ,
              retaurant_id: value[0]._id,
              addresss: value[0].address,
              location: value[0].location,
              userLocation: geo.ll,
              totalCost: totalCost,
              orderTime: new Date(),
              ETA: response.body.rows[0].elements[0].duration.text
            }
            writeToDatabase(info, 'orders').then((val) => console.log(val)).catch((err) => console.log(err))
            res.json(info)
            //res.json({ ETA : response.body.rows[0].elements[0].duration.text});
            return;
            //res.send({ ETA : 'HORAS, MINUTOS', info})

          });
      }
      else { res.send('Please check your parameters. Document might not exist.') }
    })
    readPromise.catch((err) => { console.log('error es', err); res.send(err) })
  } else {
    console.log(ans)
    let error = ans ? 'Selector must have a body.' : 'Selector has a body, but you must order at least one meal.'
    res.send(error)
  }
});
app.delete(API_Endpoints.delete, (req, res, next) => {
  const writeToDatabasePromise = deleteDatabase(req.query);
  writeToDatabasePromise.then((value) => {
    console.log('value is', value);
    res.send(value);
    // "Success!"
  });
  writeToDatabasePromise.catch((err) => {
    console.log('err is', err);
    res.send(err.errmsg)
    //"Problem with request!"
  });

});

const writeToDatabase = (body, coll) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');

        let dbo = db.db("restaurantsapi");
        dbo.collection(coll).insert(body, function (err, ok) {
          if (err) { rejected(err); }
          if (ok) { console.log('document inserted!', ok); fulfilled(ok) }
        });

        //Close connection
        db.close();
      }
    });
  })


}
const updateDatabase = (body) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');

        let dbo = db.db("restaurantsapi");
        let n = body.update;

        dbo.collection('restaurants').update(
          body.selector, { $set: n }, function (err, ok) {
            if (err) { rejected(err); }
            if (ok) { console.log('document updated!', ok); fulfilled(ok) }
          }
        )
        db.close();
      }
    });
  })


}
const addReview = (body) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');

        let dbo = db.db("restaurantsapi");
        dbo.collection('restaurants').updateOne(
          body.selector, { $push: { "reviews": body.update } }, function (err, ok) {
            if (err) { rejected(err); }
            if (ok) {
              console.log('document updated!'); fulfilled(body.selector)
              //getAverageRating(body.selector).then((v)=>console.log(v)).catch((e)=>console.log(e));
              //getRatingAvg(body.selector);
            }
          }
        )
        db.close();
      }
    });
  })


}
const readDatabase = (req) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');
        let dbo = db.db("restaurantsapi"), rating = req.query.rating, query, ans;
        ans = req.body !== undefined ? Object.keys(req.body).length === 0 && req.body.constructor === Object ? true : false : true;
        if (rating === undefined && ans === true) { 
          query = {};
          dbo.collection('restaurants').find(query).toArray(function (err, ok) {
            if (err) { rejected(err); }
            if (ok) { fulfilled(ok); db.close(); }
          });
        } else if (rating === undefined && ans === false) {
          query = req.body.selector;
          dbo.collection('restaurants').find(query).toArray((err, ok) => {
            if (err) { console.log(err); rejected(err) }
            fulfilled(ok);
          });
          db.close();
          return;
        }
        else if (query === undefined){ 
          let  query = req.query; query.rating = parseFloat(req.query.rating);
          console.log(typeof query)
           dbo.collection('restaurants').find(query).toArray(function (err, ok) {
            if (err) { rejected(err); }
            if (ok && ok.length !== 0) {
              fulfilled(ok); db.close(); } else {fulfilled('Document does not exist. Try another rating number.')}
          });
          
                                     }
        else {
          
         let querycopy = req.query; query.rating = parseInt(query.rating)
          dbo.collection('restaurants').find(query).toArray(function (err, ok) {
            if (err) { rejected(err); }
            if (ok) { console.log('ok es', ok); fulfilled(ok); db.close(); }
          });
        }
        //Close connection

      }
    });
  })


}
const getRatingAvg = (req) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');

        let dbo = db.db("restaurantsapi");
        dbo.collection("restaurants").findOne(req, function (err, result) {
          if (err) { rejected(err); } else {
            if (result !== null) {
              fulfilled(result.reviews)
            } else { rejected('Document does not exist') }
          }
          db.close();
        });
        //Close connection
        db.close();
      }
    });
  })


}
const deleteDatabase = (body) => {
  return new Promise(function (fulfilled, rejected) {
    MongoClient.connect(address, function (err, db) {
      //(Focus on This Variable)
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        rejected(err);
      } else {
        console.log('Connection established to mlab.com');

        let dbo = db.db("restaurantsapi");
        dbo.collection('restaurants').remove(
          body, function (err, ok) {
            if (err) { rejected(err); }
            if (ok) { console.log('document deleted!!!!!', ok); fulfilled(ok) }
          }
        )
        db.close();
      }
    });
  })


}

// listen for requests :)
const PORT = process.env.PORT || 5000;
const listener = app.listen(PORT,  () => {
  console.log('Your app is listening on port ' + listener.address().port);
});