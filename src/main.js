// @flow
import {createServer} from 'http';
import createRouter from './helpers/createRouter';
import parseRequestBody from './helpers/parseRequestBody';

import {createReadStream} from 'fs';

const PORT_NUM = 8000;

let server = createServer();

let products = [
  {
    id: '111',
    name: 'Pisang',
    desc: 'Pisang is healty fruit',
    price: '2000',
  }, {
    id: '112',
    name: 'Jeruk',
    desc: 'Jeruk is healty fruit',
    price: '3000',
  }, {
    id: '113',
    name: 'Apel',
    desc: 'Apel is healty fruit',
    price: '4000',
  },
];

server.on('listening', () => {
  console.log(`The HTTP server listening on http://127.0.0.1:${PORT_NUM}`);
});

server.on('request', (request, response) => {
  let router = createRouter();
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  router.addRoute('/image', () => {
    response.setHeader('Content-Type', 'image/png');
    let readStream = createReadStream('./doflaminggo_icon.png');

    readStream.on('open', () => {
      readStream.pipe(response);
    });

    // readStream.on('data', (chunk: Buffer) => {
    //   response.write(chunk, (error) => {
    //     console.error(error);
    //   });
    //   response.end();
    // });

    readStream.on('error', (error) => {
      response.end(error);
    });

    readStream.on('end', () => {
      response.end();
    });
  });

  router.addRoute('/products', () => {
    // response.end(products.join('\n') + '\n');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(products) + '\n');
  });

  router.addRoute('/products/create', () => {
    parseRequestBody(request, (error, data) => {
      if (error) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({success: false, errorMessage: error.message}) + '\n');
      }
      if (data) {
        console.log(data);
        products.push(
          {
            id: Math.random().toString().slice(-3),
            name: data.name,
            desc: data.desc,
            price: data.price,
          }
        );
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({success: true}) + '\n');
      }
    });
  });

  router.addRoute('/products/delete/:id', (id) => {
    let newProducts = products.filter((product) => {
      if (product) {
        return product.id !== id;
      }
    });
    if (newProducts.length === products.length) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: false, errorMessage: 'ID of product not found, Failed to delete product..!!'}) + '\n');
      return;
    }
    products = newProducts;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({success: true}) + '\n');
  });

  router.addRoute('/products/change', () => {
    parseRequestBody(request, (error, data) => {
      if (error) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({success: false, errorMessage: error.message}) + '\n');
      }
      if (data) {
        console.log(data);
        let newProduct = products.map((product) => {
          if (data && product) {
            if (product.id === data.id) {
              let desc = data.desc || product.desc;
              let price = data.price || product.price;

              return {
                id: data.id,
                name: data.name,
                desc: desc,
                price: price,
              };
            }
            return product;
          }
        });
        console.log(`new product is :`, newProduct);
        products = newProduct;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({success: true}) + '\n');
      }
    });
  });

  router.onNotFound(() => {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Resource not found.');
  });

  router.route(request.url);
});

server.listen(PORT_NUM);
