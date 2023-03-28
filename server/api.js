const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());



app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

fetch('./tshirts.json')
  .then((response) => response.json())
  .then((json) => console.log(json)); 

console.log(`📡 Running on port ${PORT}`);
