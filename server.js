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

res.send(createdLocation);
});


// app.get('/weather'(request, respond) => {
//   const weatherObj = require('./data/location.json');
//   const weatherForLocations = new Location(jsonObject);
// })
// response.send(weatherForLocations);



//CONSTRUCTORS

function Location(obj) {
  this.search_query = 'seattle'; // how do we get this out of our location.json
  this.formatted_query = 'Seattle, WA, USA';
  this.latitude = 47.606210;
  this.longitude =122.332071;
}






//start the server

app.listen(PORT,() => console.log(`listening on port ${PORT}`));
