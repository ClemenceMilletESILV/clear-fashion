/* eslint-disable no-console, no-process-exit */
var fs = require("fs");

const brands = {
  './eshops/dedicatedbrand' : 'https://www.dedicatedbrand.com/en/men/t-shirts', 
  './eshops/montlimartbrand' : 'https://www.montlimart.com/101-t-shirts', 
  './eshops/circlesportswearbrand' : 'https://shop.circlesportswear.com/collections/t-shirts-homme'
}

let allProducts = [];

async function sandbox (brands) {
  for (let i in brands) {
    const brand = require(i)
    const eshop = brands[i]
    console.log('brand:', brand);
    console.log('eshop:', eshop);

    try {
      console.log(`🕵️‍♀️  browsing ${eshop} eshop`);

      const products = await brand.scrape(eshop);
      
      allProducts.push(products)
      
      console.log('done');
      //process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
  console.log(allProducts);
  fs.writeFile("./tshirts.json", JSON.stringify(allProducts), (err) => {
    if (err) { console.error(err); return; };
    console.log("Created a json file");
  });
}


sandbox(brands);
