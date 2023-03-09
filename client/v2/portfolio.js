// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};


// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbBrands = document.querySelector('#nbBrands');
const spanRecent = document.querySelector('#nbRecent');
const selectBrand = document.querySelector('#brand-select');
const sort = document.querySelector("#sort-select");

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = '') => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products // Feature 12
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank" rel="noopener noreferrer">${product.name}</a>
        <span>${product.price}</span>
        <input type="checkbox" id="fav" name="fav"/> Add to favorites
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbProducts.innerHTML = ': ' + count; // Feature 8

};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};



/**
 * Declaration of all Listeners
 */

// let allProducts = [];
/* const getAll = () => {
    const response = fetch(`https://clear-fashion-api.vercel.app?page=1&size=222`)
    console.log(response);
    console.log();
}

getAll(); */

let allProducts = []
let currentPage = 1;
let currentShow = 12;
let reasonablePriceChecked = false;
let recentChecked = false;
let filterSelected = false;
let filter = '';
let brandSelected = false;
let brand = ''

const fetchAll = async() => {
  const response = await fetch(`https://clear-fashion-api.vercel.app?page=1&size=222`)
  const body = await response.json()
  return body.data
}

const productPage = (prod, page, show) => {
  prod.result = prod.result.splice((page-1)*show,show);
  prod.meta.currentPage = page;
  prod.meta.pageSize = show;
  prod.meta.pageCount = Math.ceil(prod.meta.count / show)
  return prod
}

document.addEventListener('DOMContentLoaded', async() => {
  let products = await fetchAll();
  products = productPage(products,1,12);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

const fetchProd2 = async() => {
  console.log(currentProducts, currentPagination);
  if (reasonablePriceChecked == true) {
    let products = await fetchReasonable();
    products.meta.count = products.result.length
    return products
  }
  else if (filterSelected == true) {
    let products = await fetchAll();
    products = applyFilter(products, filter)
    return products;
  }
  else {
    return await fetchAll();
  } 
}



// check is reasonable price is checked 

const fetchProd = async() => {
  let allProducts = await fetchAll();
  currentProducts = allProducts.result;
  currentPagination = allProducts.meta;
  
  // check if reasonable price is checked 
  if (reasonablePriceChecked == true) {
    console.log("Reasonable is checked");
    let products = await fetchReasonable();
    currentProducts = products.result;
    currentPagination = products.meta;
  }

  // check if recently released is checked 
  if (recentChecked == true) {
    console.log("Recently released is checked");
    let products = await fetchAll();
    products.result = currentProducts;
    products.meta = currentPagination;
    products = filterRecent(products);
    currentProducts = products.result;
    currentPagination = products.meta;

  }

  // check if a brand is selected
  if(brandSelected == true) {
    console.log("A brand is selected");
    let products = await fetchAll();
    products.result = currentProducts;
    products.meta = currentPagination;
    products = fetchBrands(products);
    currentProducts = products.result;
    currentPagination = products.meta;
  }

  // check if a filter is selected
  if(filterSelected == true) {
    console.log("A filter is selected");
    let products = await fetchAll();
    products.result = currentProducts;
    products.meta = currentPagination;
    products = applyFilter(products);
    currentProducts = products.result;
    currentPagination = products.meta;
  }

  let products = await fetchAll();
  products.result = currentProducts;
  products.meta = currentPagination;
  return products

}






/**
 * --------------------------------- Feature 0 - Show more ---------------------------------
 * Select the number of products to display
 */

selectShow.addEventListener('change', async (event) => {
  let products = await fetchProd();
  currentShow = parseInt(event.target.value);
  products = productPage(products,currentPage,currentShow);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



/**
 * --------------------------------- Feature 1 - Browse pages ---------------------------------
 * Select the number of products to display
 */

selectPage.addEventListener('change', async (event) => {
  let products = await fetchProd();
  currentPage = parseInt(event.target.value);
  products = productPage(products,currentPage,currentShow);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



/**
 * --------------------------------- Feature 2 - Filter by brands -----------------------------
 * Select the number of products to display
 */

const getBrands = async() => {
  const response = await fetch(`https://clear-fashion-api.vercel.app/brands`)
  const body = await response.json()
  spanNbBrands.innerHTML = ': ' + body.data.result.length
  return body.data.result
}

const setBrands = async() => {
  const brands = await getBrands();
  var options = '<option value="">All</option>';
  for(var brand of brands) {
    options += `<option value="${brand}">${brand}</option>`;
  }
  selectBrand.innerHTML = options;
}

const fetchBrands = (products) => {
  let prodBrand = [];
  for(var a = 0 ; a < products.result.length ; a++) {
    if(products.result[a].brand == brand) {
      prodBrand.push(products.result[a]);
    }    
  }
  products.result = prodBrand;
  products.meta.count = prodBrand.length;
  return products
}

setBrands();

selectBrand.addEventListener('change', async(event) => {
  if(event.target.value == "") {
    brand = "";
    brandSelected = false;
    const products = await fetchProd();
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else {   
    brand = event.target.value;
    brandSelected = true; 
    let products = await fetchProd();
    products = productPage(products,currentPage,currentShow);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }  
})



/*
--------------------------------- Feature 3 - Filter by recent products ---------------------------------
As a user
I want to filter by recent products
So that I can browse the new released products (less than 2 weeks) 
*/

const recentProducts = document.querySelector("#recent-products");
recentProducts.innerHTML = '<input type="checkbox" id="recent" name="filter" />By recently released';
const recent = document.querySelector("#recent");

function filterRecent(products) {
  let d = new Date();
  var newProducts = [];
  d.setDate(d.getDate() - 14);
  for(var a = 0 ; a < products.result.length ; a++) {
    const date_released = new Date(products.result[a].released);
    if(d.toLocaleString() > date_released) {
      newProducts.push(products.result[a]);
    }    
  }
  products.result = newProducts;
  products.meta.count = newProducts.length
  spanRecent.innerHTML = ': ' + newProducts.length // Feature 9
  return products
}

recent.addEventListener('change', async(event) => {
  if(recent.checked) {
    recentChecked = true;
    var products = await fetchProd();
    products = filterRecent(products);
    
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else {
    recentChecked = false;
    const products = await fetchProd();
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
})



/* 
--------------------------------- Feature 4 - Filter by reasonable price ---------------------------------
As a user
I want to filter by reasonable price
So that I can buy affordable product i.e less than 50€ 
*/

const reasonablePrice = document.querySelector("#reasonable-price");
reasonablePrice.innerHTML = '<input type="checkbox" id="reasonable" name="filter" />By reasonable price';
const reasonable = document.querySelector("#reasonable");

function filterReasonable(prod) {
  var reasonableProducts = [];
  for(var a = 0 ; a < prod.result.length ; a++) {
    if(prod.result[a].price < 50) {
      reasonableProducts.push(prod.result[a]);
    }
  }
  prod.result = reasonableProducts
  prod.meta.count = reasonableProducts.length
  return prod;
}

const fetchReasonable = async() => {
  let products = await fetchAll();
  products = filterReasonable(products);
  return products;  
}

reasonable.addEventListener('change', async(event) => {
  if(recentChecked == true) { 
    if(reasonable.checked) { reasonablePriceChecked = true; }
    render(currentProducts, currentPagination);
  }
  else if(reasonable.checked) {
    reasonablePriceChecked = true;
    let products = await fetchProd();
    products = productPage(products,currentPage,currentShow);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else {
    reasonablePriceChecked = false;
    let products = await fetchProd();
    products = productPage(products,currentPage,currentShow);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
})



/* 
--------------------------------- Feature 5 - Sort by price ---------------------------------
As a user
I want to sort by price
So that I can easily identify cheapest and expensive products
*/



const applyFilter = (products) => {  
  if(filter == 'price-asc') {
    products.result.sort(function(a,b){return a.price - b.price});
    return products;
  }  
  if(filter == 'price-desc') {
    products.result.sort(function(a,b){return b.price - a.price});
    return products;
  }   



/* 
--------------------------------- Feature 6 - Sort by date ---------------------------------
As a user
I want to sort by price
So that I can easily identify recent and old products
*/

  if(filter == 'date-asc') {
    products.result.sort(function(a,b) {
      const date_a = new Date(a.released);
      const date_b = new Date(b.released);
      return date_a - date_b});
    return products;
  }
  if(filter == 'date-desc') {
    products.result.sort(function(a,b) {
      const date_a = new Date(a.released);
      const date_b = new Date(b.released);
      return date_b - date_a});
    return products;
  }
}

sort.addEventListener('change', async(event) => {
  if(event.target.value == 'select') {
    filterSelected = false;
    filter = '';
    let products = await fetchProd();
    products = productPage(products,currentPage,currentShow);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else {
    filterSelected = true;
    filter = event.target.value;
    let products = await fetchProd();
    products = applyFilter(products)
    products = productPage(products,currentPage,currentShow);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }  
})



/* 
--------------------------------- Feature 8 - Number of products indicator ---------------------------------
As a user
I want to indicate the total number of products
So that I can understand how many products is available
*/

// line 116



/* 
--------------------------------- Feature 9 - Number of recent products indicator ---------------------------------
As a user
I want to indicate the total number of recent products
So that I can understand how many new products are available
*/

// line 292



/* 
--------------------------------- Feature 10 - p50, p90 and p95 price value indicator ---------------------------------
As a user
I want to indicate the p50, p90 and p95 price value
So that I can understand the price values of the products
*/

const spanp50 = document.querySelector("#p50");
const spanp90 = document.querySelector("#p90");
const spanp95 = document.querySelector("#p95");

const pvalues = async() => {
  const products = await fetchAll();
  const all = products.result.sort(function(a,b) {return b.price - a.price});
  const l = products.result.length;
  const l50 = l*0.5;
  const l90 = l*0.9;
  const l95 = l*0.95;
  spanp50.innerHTML = ': ' + all[Math.round(l50)].price + '€';
  spanp90.innerHTML = ': ' + all[Math.round(l90)].price + '€';
  spanp95.innerHTML = ': ' + all[Math.round(l95)].price + '€';
}

pvalues();



/* 
--------------------------------- Feature 11 - Last released date indicator ---------------------------------
As a user
I want to indicate the last released date
So that I can understand if we have new products
*/

const lastReleasedDate = document.querySelector("#last-released-date");

const lastDate = async() => {
  const products = await fetchAll();
  products.result.sort(function(a,b) {
    const date_a = new Date(a.released);
    const date_b = new Date(b.released);
    return date_b - date_a});  
  lastReleasedDate.innerHTML = ': ' + products.result[0].released;
}
lastDate();



/* 
--------------------------------- Feature 12 - Open product link ---------------------------------
As a user
I want to open product link in a new page
So that I can buy the product easily 
*/

// line 82



/* 
--------------------------------- Feature 13 - Save as favorite ---------------------------------
As a user
I want to save a product as favorite
So that I can retreive this product later
*/

const favorites = document.querySelector("#fav");
/*
console.log(selectShow)
console.log(favorites)

 favorites.addEventListener('change', async(event) => {
  console.log(event.currentTarget);



  
  // let id = event.currentTarget.parentNode.parentNode.getElementsByTagName("td")[2].textContent;
   if (event.currentTarget.checked){
    fav.push(currentProducts.filter(x => x.name ==  id)[0]);
  }
  else{
    fav.splice(fav.findIndex(item => item.name == id), 1);
  }
  window.localStorage["favorites"] = JSON.stringify(fav);
})

 */

/* 
--------------------------------- Feature 14 - Filter by favorite ---------------------------------
As a user
I want to filter by favorite products
So that I can load only my favorite products
*/




/* 
--------------------------------- Feature 15 - Usable and pleasant UX ---------------------------------
As a user
I want to parse a usable and pleasant web page
So that I can find valuable and useful content
*/

// go to styles.css















