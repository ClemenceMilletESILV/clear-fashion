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

const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://waa:mdp@cluster0.zhdnkvq.mongodb.net/?retryWrites=true&w=majority';

async function connect () {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  db = client.db('clearfashion');
  const collection = db.collection('products');

  app.get('/', (request, response) => {
    response.send({'ack': true});
  });
  
  app.get('/products', (request, response) => {
    response.send({'ack': false});
  });
  
  app.get('/products/all', (request, response) => {
    response.send(collection.find());
  });

  app.get('/products/:id', (request, response) => {
    const id = new ObjectID(request.params.id);
    response.send(collection.find({_id : id}));
  });

  app.get('/products/search', (request, response) => {
    const limit = parseInt(request.params.limit) || 12;
    const brand = parseInt(request.params.brand);
    const price = parseInt(request.params.price);

    const result = collection.find({brand : brand}, {price : price}).limit(limit); 

    response.send(result);
  });

}

connect()

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
