const assert = require('assert');
const path = require('path');

const testFolder = path.resolve('./tmp/tmpNacreTest');
let exitCode = 0;

/**
 * The test uses the Nacre version installed on your system.
 * Make sure you have installed the version you work on.
 */

try {
  mkdir.intermediate(testFolder);
  const location = cd(testFolder);
  console.log({ location });

  assert.equal(location, pwd());

  const filename = 'aFile';
  touch(filename);

  cat.append(filename, 'This is content');
  cat.append(filename, 'This is also data');
  cat.append(filename, 'That is enough');

  const filtered = cat.lines(filename)
    .filter(grep(/data/));
  assert.equal(filtered.length, 1);

  if (process.platform !== 'win32') {
    const perm = chmod.add.read.user(filename);
    console.log('new perm', perm);
    assert.ok(perm !== undefined);
  }

  console.log(stat(filename));
} catch (e) {
  console.error(e);
  exitCode = -1;
} finally {
  console.log('Cleaning...');
  try {
    require('fs')
      .rmdirSync(testFolder, { recursive: true });
  } catch (e) {
    // seems to always fail under windows github action
    if (e.code === 'EBUSY') {
      console.error(e);
      console.log('SKIPPING ERROR');
    }
  }
  console.log(`Exiting with code ${exitCode}`);
  process.exit(exitCode);
}
