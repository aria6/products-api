//@flow

function pipe(readStream: Object, writeStream: Object) {
  readStream.on('data', (chunk: Buffer) => {
    writeStream.write(chunk);
  });

  readStream.on('end', () => {
    writeStream.end();
  });
}

export default pipe;
