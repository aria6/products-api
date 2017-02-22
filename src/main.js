// @flow
import {createServer} from 'http';
import createRouter from './helpers/createRouter';

import readFile from './helpers/readFile';
import readRequest from './helpers/readRequest';

import {createReadStream, writeFile} from 'fs';

const PORT_NUM = 8000;

let server = createServer();
let dbPath = `./data/product.json`;

server.on('listening', () => {
  console.log(`The HTTP server listening on http://127.0.0.1:${PORT_NUM}`);
});

server.on('request', (request, response) => {
  let router = createRouter();
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  router.addRoute('/getFile/:fileName', async (fileName) => {
    let pathName = `./data/${fileName}`;
    let data = await readFile(pathName);

    response.setHeader('Content-Type', 'image/jpeg');
    response.write(data);
    response.end();
  });

  router.addRoute('/images/:nameImg', (nameImg) => {
    if (!nameImg) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: false, errorMessage: 'Image not exist..'}) + '\n');
    }
    response.setHeader('Content-Type', 'image/jpg');
    let readStream = createReadStream(`./images/${nameImg}`);

    // readStream.on('open', () => {
    //   readStream.pipe(response);
    //   // console.log(readStream.pipe(response));
    // });

    readStream.on('data', (chunk: Buffer) => {
      response.write(chunk, (error) => {
        if (error) {
          console.error(error);
        }
      });
    });

    readStream.on('error', (error) => {
      console.log(error);
      response.end();
    });

    readStream.on('end', () => {
      response.end();
    });
  });

  router.addRoute('/products', async () => {
    let data = await readFile(dbPath);
    let dataJSON = JSON.parse(data.toString());
    // response.end(products.join('\n') + '\n');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(dataJSON.products) + '\n');
  });

  router.addRoute('/products/create', async () => {
    try {
      let requestBuffer = await readRequest(request);
      let objectData = JSON.parse(requestBuffer.toString());

      let dbData = await readFile(dbPath);
      let dbJSON = JSON.parse(dbData.toString());

      dbJSON.products.push(
        {
          id: Math.random().toString().slice(-3),
          name: objectData.name,
          desc: objectData.desc,
          price: objectData.price,
          imagePath: objectData.imagePath,
          // imageBase64: data.imageBase64,
        }
      );

      writeFile(dbPath, JSON.stringify(dbJSON), (error) => {
        if (error) {
          console.log(`write db error`, error);
        }
      });

      if (objectData.imagePath && objectData.imageBase64) {
        let dataImage = objectData.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        writeFile(`images/${objectData.imagePath}`, dataImage, {encoding: 'base64'}, (error) => {
          if (error) {
            console.error(error);
          }
        });
      }

      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: true}) + '\n');

    } catch (error) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: 'false', errorMessage: error}) + '\n');
    }
  });

  router.addRoute('/products/delete/:id', async (id) => {
    let dbData = await readFile(dbPath);
    let dbJSON = JSON.parse(dbData.toString());

    let newProducts = dbJSON.products.filter((product) => {
      if (product) {
        return product.id !== id;
      }
    });
    if (newProducts.length === dbJSON.products.length) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: false, errorMessage: 'ID of product not found, Failed to delete product..!!'}) + '\n');
      return;
    }
    dbJSON.products = newProducts;

    writeFile(dbPath, JSON.stringify(dbJSON), (error) => {
      if (error) {
        console.log(`write db error`, error);
      }
    });

    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({success: true}) + '\n');
  });

  router.addRoute('/products/change', async () => {
    try {
      let requestBuffer = await readRequest(request);
      let objectData = JSON.parse(requestBuffer.toString());

      let dbData = await readFile(dbPath);
      let dbJSON = JSON.parse(dbData.toString());

      let newProduct = dbJSON.products.map((product) => {
        if (objectData && product) {
          if (product.id === objectData.id) {
            let desc = objectData.desc || product.desc;
            let price = objectData.price || product.price;

            return {
              id: objectData.id,
              name: objectData.name,
              desc: desc,
              price: price,
              imagePath: product.imagePath,
            };
          }
          return product;
        }
      });
      console.log(`new product is :`, newProduct);
      dbJSON.products = newProduct;

      writeFile(dbPath, JSON.stringify(dbJSON), (error) => {
        console.log('Error db write :', error);
      });

      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: true}) + '\n');
    } catch (error) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({success: false, errorMessage: error}) + '\n');
    }

  });

  router.onNotFound(() => {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Resource not found.');
  });

  router.route(request.url);
});

server.listen(PORT_NUM);
