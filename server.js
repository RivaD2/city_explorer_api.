// packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');


// global vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());
const GEOCODE = process.env.GEOCODE_API_KEY;
const MASTER_KEY = process.env.MASTER_API_KEY;
const TRAIL_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;


//library that allows js to talk to pg
// this will help us run commands back and forth to database
// we created the client and we told the client to tell us when an error occurs
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.error(error));


//************************ROUTE ONE*/
app.get('/location',(req, res) => {
  // The request parameter for endpoint's callback contains infor from frontend in request.query
  // request.query contains all query info in any app
  //console.log(request.query.city:request.query.city);
  const thingToSearch = req.query.city; // this would be the city


  //call database function here
  //if else statement here that would include the api
  if (checkLocationInformation === undefined) {
    checkLocationInformation(thingToSearch);
  } else {
    client.query(thingToSearch); //with the object from the function call
    console.log(thingToSearch);
  }
  const apiLink = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE}&q=${thingToSearch}&format=json`;
  //this will come from request.query so use api with $request.query.latitude
  superagent.get(apiLink) 
    .then(whateverComesBack => { 
      const superAgentResultArray = whateverComesBack.body; //use token here along with console.log the body
      const locationConstructor = new Location(superAgentResultArray);
      res.send(locationConstructor);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});

//catch happens after promise and only gets triggered if result of promise is error

/******************************ROUTE TWO*/
app.get('/weather', (req, res) => {
  const lat = req.query.latitude;
  const lon = req.query.longitude;
  const linktoApi = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${MASTER_KEY}`;
  superagent.get(linktoApi)
    .then(dataComeBack => {
      const superAgentArrayWeather = dataComeBack.body.data.map(day => {
        return new Weather(day);
      });
      res.send(superAgentArrayWeather);
    })
    .catch(error => {
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});

/*******************************ROUTE THREE */

app.get('/trails', (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const api = `https://www.hikingproject.com/data/get-trails?&lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_KEY}`;
  superagent.get(api)
    .then(dataReturn => {
      // talk to TA about formatting and how to find body.trails (what is the best way to format the dataReturn.body);
      //we are passing individual items using maps, so I shouldn't use access notation on constructor (any constructors)
      const superAgentArrayTrail = dataReturn.body.trails.map(res => {
        return new Trail(res);
      });
      res.send(superAgentArrayTrail);
    })
    .catch(error => {
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});


//ADD function to check the database for the location information

function checkLocationInformation (str) {
  console.log(str);
  // telling our table we want everything back if it matches said city name
  const sqlTable = `SELECT * FROM locations WHERE search_query='${str}';`;
  client.query(sqlTable)
  //If the location record already exists in the database, send the location object in the response to the client.
    .then(sendObj => {
      console.log(sendObj);
      //rowCount is built into SQL
      if(sendObj.rowCount > 0); {
        //want to return sendObject.rows[0] since Rows in the database in an array
        return (sendObj.rows[0]);
      }
    })
    .catch(error => {
      console.error(error);
    });
}
//checkLocationInformation();


/*****************************CONSTRUCTORS*/

function Location(obj) { // our constructor only uses index 0
  this.search_query = obj[0].icon; // how do we get this out of our location.json
  this.formatted_query = obj[0].display_name;
  this.latitude = obj[0].lat;
  this.longitude = obj[0].lon;
}

function Weather(weatherJson) {
  this.forecast = weatherJson.weather.description;
  this.time = weatherJson.valid_date;
}

function Trail(obj) {
  this.name = obj.name;
  this.length = obj.length;
  this.summary = obj.summary;
}

/*************************STARTSERVER*/
//start the server and database
// we need database to start first and then we can listen

//Here we tell the client to make the connection to the database
// Don't let express connect to port until client has connected to database
client.connect()
  .then(() => {
    app.listen(PORT,() => console.log(`listening on port ${PORT}`));
  });



//function to handle errors from any API calls
//HTTP status for response


// function errorHandler (req, res) {
//   if(request.query.city !== 'Lynnwood'){
//   return res.status(500).send('Bad Request, Internal Server Error');
// }
