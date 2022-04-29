'use strict';

import { afterEach, beforeEach, describe, it } from 'mocha';

import assert = require('assert/strict');
import path = require('path');
import Inspector from '../../../src/lib/inspector';

let inspector;

beforeEach(async () => {
  inspector = new Inspector();
  await inspector.start();
});

afterEach(async () => {
  inspector.stop();
});

describe('inspector unit test', () => {
  it('getRemoteGlobal', async () => {
    const g = await inspector.getRemoteGlobal();
    assert.equal(g.type, 'object');
    assert.equal(g.className, 'global');
    assert.equal(g.description, 'global');
    assert.ok(g.objectId.length > 0);
  });

  it('getGlobalNames', async () => {
    const gn = await inspector.getGlobalNames();
    [
      'global',
      'clearInterval',
      'Function',
      'Array',
      'Infinity',
      'undefined',
      'constructor',
      'require',
      'ls',
      'cd',
      'util',
      '__proto__',
    ].forEach((name) => assert.ok(gn.includes(name), `Expected ${name}`));
  });

  it('evaluate 1 + 1', async () => {
    const source = '1 + 1';
    const actual = await inspector.evaluate(source, true);
    assert.deepStrictEqual(
      actual,
      {
        result: {
          description: '2',
          type: 'number',
          value: 2,
        },
      },
    );
  });

  it('execute 1 + 1', async () => {
    const source = '1 + 1';
    const actual = await inspector.execute(source);
    assert.deepStrictEqual(actual, '2');
  });

  it('evaluate somethingThatDoesNotExist', async () => {
    const { result: actual } = await inspector.evaluate('somethingThatDoesNotExist', true);
    // ReferenceError only when throwOnSideEffect is true
    // FIXME Fails on local windows machine
    assert.ok(actual.description.includes('EvalError: Possible side-effect in debug-evaluate'));
  });

  it('evaluate with syntax error', async () => {
    const res = await inspector.evaluate('"', true);
    assert.equal(res.result.type, 'object');
    assert.equal(res.result.className, 'SyntaxError');
  });

  it('evaluate load module', async () => {
    await inspector.loadModule('fs');
    const { result } = await inspector.evaluate('fs');
    assert.equal(result.type, 'object');
  });

  it('callFunctionOn', async () => {
    const f = 'function foo(a, b) { return a + b; }';
    const actual = await inspector.callFunctionOn(f, [{ value: 'abc' }, { value: 'def' }]);
    assert.deepStrictEqual(
      actual,
      {
        result: {
          type: 'string',
          value: 'abcdef',
        },
      },
    );
  });

  describe('preview', () => {
    it('should not throw side effect with array', async () => {
      const actual = await inspector.preview('[1,2,3].map(x => x * x)');
      assert.deepStrictEqual(actual, '[ 1, 4, 9 ]');
    });

    it('should throw side effect this ls', async () => {
      const actual = await inspector.preview('[\'src\', \'test\'].map(e => ls(e))');
      assert.equal(actual, undefined);
    });
  });

  describe('auto require', () => {
    // eslint-disable-next-line func-names
    it('should load fakemodule', async function () {
      if (process.platform === 'win32') {
        // FIXME: should work
        this.skip();
      }
      const moduleAbsPath = path.join(__dirname, 'fixtures', 'inspector', 'node_modules', 'fakemodule');
      const load = await inspector.loadModule(moduleAbsPath);
      assert.ok(load.result);
      const evaluation = await inspector.evaluate('fakemodule');
      assert.equal(evaluation.result.value, 'module loaded!');
    });

    it('should not load a module that does not exist', async () => {
      const unknownModule = 'moduleThatDoesNotExist';
      const moduleAbsPath = path.join(__dirname, 'fixtures', 'inspector', 'node_modules', unknownModule);
      const load = await inspector.loadModule(moduleAbsPath);
      assert.ok(load.result);
      const evaluation = await inspector.evaluate(unknownModule, false);
      assert.equal(evaluation.result.className, 'ReferenceError');
    });
  });
});
