'use strict';

const { execSync } = require('child_process');
const { CommandFailedError } = require('./lib/errors');

const sh = (command) => {
  if (!command) {
    return undefined;
  }
  try {
    const res = execSync(command);
    return res.toString();
  } catch (e) {
    // console.log(e);
    // console.log(e.output.toString());
    if (e.stack.startsWith('Error: Command failed')) {
      throw new CommandFailedError(e);
    }
  }
};

module.exports = sh;
