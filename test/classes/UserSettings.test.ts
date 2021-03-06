import * as assert from 'assert';
import {UserSettings, SetSettingEntry, MarkersSettingEntry} from '../../src/classes/all';
var Chance = require('chance');

const chance = new Chance();

function randomInt(): number {
  return chance.integer();
}

function randomIntRange(min, max): number {
  return chance.integer({ "min": min, "max": max });
}

suite("Classes - UserSettings", function () {
  test("[a, b] -> [a, b]", () => {
    let value = ["a", "b"];
    let entry = new SetSettingEntry<any[]>("entryName", []);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      value.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let v of value) {
      assert.ok(
        entry.contains(v), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[a, a] -> [a]", () => {
    const size = 2, base = 1;
    let value = ["a", "a"];
    let entry = new SetSettingEntry<any[]>("entryName", []);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, base, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < base; ++i) {
      assert.ok(
        entry.contains(value[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[a, b, a, b] -> [a, b]", () => {
    const size = 4, base = 2;
    let value = ["a", "b", "a", "b"];
    let entry = new SetSettingEntry<any[]>("entryName", []);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, base, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < base; ++i) {
      assert.ok(
        entry.contains(value[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[] -> []", () => {
    let value = [];
    let entry = new SetSettingEntry<any[]>("entryName", []);
    entry.setValue(value);

    assert.equal(entry.getValue().length, 0);
  });

  test("undefined -> []", () => {
    let value = undefined;
    let entry = new SetSettingEntry<any[]>("entryName", []);
    entry.setValue(value);

    assert.ok(entry.getValue());
    assert.equal(entry.getValue().length, 0);
  });

  const _default = ["def"];
  test("[_default, a] -> [_default, a]", () => {
    let value = _default.concat(["a"]);
    let entry = new MarkersSettingEntry("markerEntryName", _default);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      value.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let v of value) {
      assert.ok(
        entry.contains(v), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[_default, _default] -> [_default]", () => {
    let value = _default.concat(_default);
    let entry = new MarkersSettingEntry("markerEntryName", _default);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      _default.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < _default.length; ++i) {
      assert.ok(
        entry.contains(_default[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[a, b] -> [_default, a, b]", () => {
    let value = ["a", "b"];
    let merged = _default.concat(value);
    let entry = new MarkersSettingEntry("markerEntryName", _default);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      merged.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < merged.length; ++i) {
      assert.ok(
        entry.contains(merged[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("[] -> [_default]", () => {
    let value = [];
    let entry = new MarkersSettingEntry("markerEntryName", _default);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      _default.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < _default.length; ++i) {
      assert.ok(
        entry.contains(_default[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  test("undefined -> [_default]", () => {
    let value = undefined;
    let entry = new MarkersSettingEntry("markerEntryName", _default);
    entry.setValue(value);

    assert.equal(
      entry.getValue().length, 
      _default.length, 
      `\nExpected: ${value}\nGot: ${entry.getValue()}`
    );
    for(let i = 0; i < _default.length; ++i) {
      assert.ok(
        entry.contains(_default[i]), 
        `\nExpected: ${value}\nGot: ${entry.getValue()}`
      );
    }
  });

  /**
   * File inclusion and exclusion
   */

  test("File include [a, b] -> [a, b]", () => {
    let st = UserSettings.getInstance();
    let inc = st.Inclusions;
    let oldInc = inc.getValue();

    let value = ["a", "b"];
    inc.setValue(value);
    st.mergeSettings();

    for(let v of value) {
      assert.ok(st.isFileEligible(v));
    }

    inc.setValue(oldInc);
  });

  test("File exclude [a, b] -> [a, b]", () => {
    let st = UserSettings.getInstance();
    let exc = st.Exclusions;
    let oldExc = exc.getValue();

    let value = ["a", "b"];
    exc.setValue(value);
    st.mergeSettings();

    for(let v of value) {
      assert.ok(!st.isFileEligible(v));
    }

    exc.setValue(oldExc);
  });

  test("File include [a, b], exclude [a] -> [a, b]", () => {
    let st = UserSettings.getInstance();
    let inc = st.Inclusions, exc = st.Exclusions;
    let oldInc = inc.getValue(), oldExc = exc.getValue();

    let incValue = ["a", "b"], excValue = ["a"];
    inc.setValue(incValue);
    exc.setValue(excValue);
    st.mergeSettings();

    for(let v of incValue) {
      assert.ok(st.isFileEligible(v));
    }

    inc.setValue(oldInc);
    exc.setValue(oldExc);
  });

  test("File include [a], exclude [a, b] -> [a]", () => {
    let st = UserSettings.getInstance();
    let inc = st.Inclusions, exc = st.Exclusions;
    let oldInc = inc.getValue(), oldExc = exc.getValue();

    let incValue = ["a"], excValue = ["a", "b"];
    inc.setValue(incValue);
    exc.setValue(excValue);
    st.mergeSettings();

    assert.ok(st.isFileEligible(incValue[0]));
    assert.ok(!st.isFileEligible(excValue[1]));

    inc.setValue(oldInc);
    exc.setValue(oldExc);
  });

  test("File include [a, b], exclude [a, b] -> [a, b]", () => {
    let st = UserSettings.getInstance();
    let inc = st.Inclusions, exc = st.Exclusions;
    let oldInc = inc.getValue(), oldExc = exc.getValue();

    let incValue = ["a", "b"], excValue = ["a", "b"];
    inc.setValue(incValue);
    exc.setValue(excValue);
    st.mergeSettings();

    for(let v of incValue) {
      assert.ok(st.isFileEligible(v));
    }

    inc.setValue(oldInc);
    exc.setValue(oldExc);
  });

  /**
   * The 'only' entry and folder exclusion entry
   */
  
  test("Folder exclude [a, b] -> cannot use [a, b]", () => {
    let st = UserSettings.getInstance();
    let exc = st.FolderExclusions;
    let oldExc = exc.getValue();

    let excValue = ["a", "b"];
    exc.setValue(excValue);

    for(let v of excValue) {
      assert.ok(!st.isFolderEligible(v));
    }

    exc.setValue(oldExc);
  });

});