//@flow

function parseRequestBody(request: any, callback: (error: ?Error, data: ?Object) => void) {
  let chunkList = [];

  let onDone = (data: Object) => {
    callback(null, data);
  };
  let onError = (error: Error) => {
    callback(error, null);
  };

  request.on('data', (chunk: Buffer) => {
    chunkList.push(chunk);
  });
  request.on('end', () => {
    let jsonString = Buffer.concat(chunkList).toString();
    let data;
    try {
      data = JSON.parse(jsonString);
      onDone(data);
    } catch (error) {
      onError(error);
    }
  });
}

export default parseRequestBody;
