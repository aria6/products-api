//@flow
//parseRequestBodyPromise

function readRequest<T: Object>(request: T): Promise<Buffer> {
  let promise = new Promise((resolve, reject) => {
    let chunkList = [];

    request.on('data', (chunk: Buffer) => {
      chunkList.push(chunk);
    });

    request.on('error', (error: Error) => {
      reject(error);
    });

    request.on('end', () => {
      let jsonBuffer = Buffer.concat(chunkList);
      resolve(jsonBuffer);
    });
  });

  return promise;
}

export default readRequest;
