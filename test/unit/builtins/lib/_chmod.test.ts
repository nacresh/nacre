'use strict';

import {describe, it} from "mocha";
import * as assert from 'assert/strict'

import {modeToOctal} from "../../../../src/builtins/lib/_chmod";

describe('chmod lib unit test', () => {
  it('modeToOctal', () => {
    assert.deepStrictEqual(modeToOctal({
      user: { read: false, write: false, execute: false },
      group: { read: false, write: false, execute: false },
      others: { read: false, write: false, execute: false },
    }), 0o000);

    assert.deepStrictEqual(modeToOctal({
      user: { read: true, write: false, execute: false },
      group: { read: false, write: true, execute: false },
      others: { read: false, write: false, execute: true },
    }), 0o421);

    assert.deepStrictEqual(modeToOctal({
      user: { read: true, write: true, execute: true },
      group: { read: true, write: true, execute: true },
      others: { read: true, write: true, execute: true },
    }), 0o777);
  });
});
