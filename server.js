// packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// global vars
const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());




//start the server

app.listen(PORT,() => console.log(`listening on port ${PORT}`));
