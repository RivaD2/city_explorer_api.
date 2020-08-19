// packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');



// global vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());
const GEOCODE = process.env.GEOCODE_API_KEY;
const MASTER_KEY = process.env.MASTER_API_KEY;
const TRAIL_KEY = process.env.TRAIL_API_KEY;


//routes
//ROUTE ONE
app.get('/location',(req, res) => {
  // The request parameter for endpoint's callback contains infor from frontend in request.query
  // request.query contains all query info in any app
  //console.log(request.query.city:request.query.city);
  const thingToSearch = req.query.city; // this would be the city

  const apiLink = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE}&q=${thingToSearch}&format=json`;
  superagent.get(apiLink) //this will come from request.query so use api with $request.query.latitude
    .then(whateverComesBack => { // change var names
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


app.get('/trails', (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const api = `https://www.hikingproject.com/data/get-trails?&lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_KEY}`;
  superagent.get(api)
    .then(dataReturn => {
      // talk to TA about formatting and how to find body.trails (what is the best way to format the dataReturn.body);
      const superAgentArrayTrail = dataReturn.body.trails.map(res => {
        return new Trail(res);
      });
      res.send(superAgentArrayTrail);
    })
    .catch(error => {
      res.status(500).send(error, 'Bad Request, Internal Server Error');
    });
});



//CONSTRUCTORS // iterate using .map today

function Location(obj) { // our constructor only uses index 0
  this.search_query = obj[0].icon; // how do we get this out of our location.json
  this.formatted_query = obj[0].display_name;
  this.latitude = obj[0].lat;
  this.longitude = obj[0].lon;
}

function Weather(weatherJson) {
  this.forecast = weatherJson.weather.description; // how do we get this out of our location.json
  this.time = weatherJson.valid_date;
}

function Trail(obj) {
  this.name = obj.name;
  this.length = obj.length;
  this.summary = obj.summary;
}

//start the server

app.listen(PORT,() => console.log(`listening on port ${PORT}`));


//function to handle errors from any API calls
//HTTP status for response


// function errorHandler (req, res) {
//   if(request.query.city !== 'Lynnwood'){
//   return res.status(500).send('Bad Request, Internal Server Error');
// }
