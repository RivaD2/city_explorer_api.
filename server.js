// packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');


// global vars
const PORT = process.env.PORT || 3003;
const app = express();
const GEOCODE = process.env.GEOCODE_API_KEY;
const MASTER_KEY = process.env.MASTER_API_KEY;
const TRAIL_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const YELP_API_KEY = process.env.YELP_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;


//library that allows js to talk to pg
// this will help us run commands back and forth to database
// we created the client and we told the client to tell us when an error occurs
app.use(cors());
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.error(error));


//************************ROUTE ONE*/
app.get('/location',(req, res) => {
  // The request parameter for endpoint's callback contains info from frontend in request.query
  // request.query contains all query info in any app
  //console.log(request.query.city:request.query.city);
  const thingToSearch = req.query.city; // this would be the city
  const apiLink = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE}&q=${thingToSearch}&format=json`;
  //this will come from request.query so use api with $request.query.latitude

  //call database function here
  //if else statement here that would include the api

  // this function will return data from database or null
  // If response from database is not null, then we get a response, if null, nothing (falsy)
  //const responseFromDatabase = checkLocationInformation(thingToSearch);

  // telling our table we want everything back if it matches said city name
  const sqlTable = `SELECT * FROM locations WHERE search_query='${thingToSearch}';`;
  client.query(sqlTable)
  //If the location record already exists in the database, send the location object in the response to the client.
    .then(sendObj => {
      //rowCount is built into SQL
      if(sendObj.rowCount > 0) {
        //want to return sendObject.rows[0] since Rows in the database in an arra
        const storedResult = sendObj.rows[0];
        res.send(storedResult);
      } else {
        superagent.get(apiLink)
          .then(whateverComesBack => {
            const superAgentResultArray = whateverComesBack.body;
            const locationConstructor = new Location(superAgentResultArray, thingToSearch);
            //need to save the information from API to database before responding
            const sql = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)`;
            const valuesofLocationObj = [locationConstructor.search_query, locationConstructor.formatted_query, locationConstructor.latitude, locationConstructor.longitude];
            client.query(sql, valuesofLocationObj)
            //don't want to send response until it is in the database
              .then(()=>{
                res.send(locationConstructor);
              });

          })
          .catch(error => {
            console.log(error);
            res.status(500).send(error, 'Bad Request, Internal Server Error');
          });
      }
    })
    .catch(error => {
      console.error(error);
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

/*********************************ROUTE FOUR */
app.get('/yelp',(req, res) => {
  const searchToYelp = req.query.search_query; // this would be the city
  const yelpApi = `https://api.yelp.com/v3/businesses/search?location=${searchToYelp}&start=20`;
  // Credit to Amelia for the .set (Amelia helped to realize the header)
  superagent.get(yelpApi).set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(infoFromYelpReturn => {
      const yelpArray = infoFromYelpReturn.body.businesses.map( res => {
        return new Yelp(res);
      });
      res.send(yelpArray);
    })
    .catch(error => {
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});

/****************************ROUTE FIVE */

app.get('/movies',(req, res) => {
  const movieSearch = req.query.search_query;
  console.log('starting movies route');
  const movieApi = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${movieSearch}`;
  superagent.get(movieApi)
    .then(movieSearchReturn => {
      console.log('starting to process results');
      console.log(movieSearchReturn);
      const movieArray = movieSearchReturn.body.results.map( res => {
        return new Movie(res);
        //need INSERT INTO here?
      });
      console.log('movie array',movieArray);
      res.send(movieArray);
    })
    .catch(error => {
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});




/*****************************CONSTRUCTORS*/

function Location(obj, thingToSearch) { // our constructor only uses index 0
  // LocationsIQ doesn't send back the searchQuery or what the user typed in
  // we used thingToSearch which is what the customer typed in, and passed in through the constructor
  this.search_query = thingToSearch; // how do we get this out of our location.json
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

function Yelp(yelpData) {
  this.name = yelpData.name;
  this.url = yelpData.url;
  this.rating = yelpData.rating;
  this.price = yelpData.price;
  this.image_url = yelpData.image_url;
}

function Movie(movieData) {
  this.title = movieData.title;
  this.overview = movieData.overview;
  this.average_votes = movieData.average_votes;
  this.total_votes = movieData.total_votes;
  this.image_url - movieData.image_url;
  this.popularity = movieData.popularity;
  this.released_on = movieData.released_on;
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
