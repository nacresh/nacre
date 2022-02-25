'use strict';

const {
  readFileSync,
  appendFileSync,
  writeFileSync,
} = require('fs');

// Open file for reading. An exception occurs if the file does not exist.
const cat = (filepath) => {
  return readFileSync(filepath, {
    encoding: 'utf-8',
    flag: 'r',
  });
};

cat.read = (filepath) => {
  return cat(filepath);
};

// Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
cat.write = (filepath, string) => {
  writeFileSync(filepath, string, {
    encoding: 'utf8',
    flag: 'w'
  });
  return string;
};

// Appends in synchronous mode. The file is created if it does not exist.
cat.append = (filepath, string) => {
  appendFileSync(filepath, string, {
    encoding: 'utf8',
    flag: 'as+'
  });
  return cat(filepath);
};

module.exports = cat;