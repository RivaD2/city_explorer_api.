// packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();



// global vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());




//routes
//ROUTE ONE
app.get('/location',(req, res) => {
  const jsonFromFile = require('./data/location.json');
  const createdLocation = new Location(jsonFromFile);
  console.log(createdLocation);
  res.send(createdLocation);
});


app.get('/weather', weatherData);
function weatherData(req, res) {
  const weatherJson = require('./data/weather.json');
  const array = [];
  const arrayFromJson = weatherJson.data;

  arrayFromJson.forEach(objectinJson => {
    const weatherConstructor = new Weather(objectinJson);
    array.push(weatherConstructor);
  });
  res.send(array);
}

//CONSTRUCTORS

function Location(obj) {
  this.search_query = obj[0].icon; // how do we get this out of our location.json
  this.formatted_query = obj[0].display_name;
  this.latitude = obj[0].lat;
  this.longitude = obj[0].lon;
}

function Weather(weatherJson) {
  this.forecast = weatherJson.weather.description; // how do we get this out of our location.json
  this.time = weatherJson.valid_data;
}


//start the server

app.listen(PORT,() => console.log(`listening on port ${PORT}`));
