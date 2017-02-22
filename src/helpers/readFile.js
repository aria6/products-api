//@flow
import fs from 'fs';
import denodeify from './denodeify';

let readFilePromise = denodeify((filePath, callback) => {
  fs.readFile(filePath, callback);
});

export default readFilePromise;
