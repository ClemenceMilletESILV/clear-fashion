
const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://waa:mdp@cluster0.zhdnkvq.mongodb.net/?retryWrites=true&w=majority';

const my_brands = {
    './eshops/dedicatedbrand' : 'https://www.dedicatedbrand.com/en/men/t-shirts', 
    './eshops/montlimartbrand' : 'https://www.montlimart.com/101-t-shirts', 
    './eshops/circlesportswearbrand' : 'https://shop.circlesportswear.com/collections/t-shirts-homme'
}

let products = [];

async function connection (brands) {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  db = client.db('clearfashion');
  const collection = db.collection('products');
  let result = [];

  for (let i in my_brands) {
    const brand = require(i)
    const eshop = my_brands[i]
    console.log('brand:', brand);
    console.log('eshop:', eshop);
  
    try {
      console.log(`🕵️‍♀️  browsing ${eshop} eshop`);

      const p = await brand.scrape(eshop);   
      result = collection.insertMany(p);

      console.log('inserted', brand)
        
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  console.log('done')
  process.exit(0);
}

connection();