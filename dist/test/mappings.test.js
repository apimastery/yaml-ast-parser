"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./testUtil");
suite('YAML mappings', () => {
    test('should not produce error if flow mapping used as keys in mapping', function () {
        const content = `
    foo:
      { bar: baz }:
        - value
      { qux: quux }:
        - value
    `;
        util.testErrors(content, []);
    });
    test('should not produce error if more complex flow mappings used as keys in mapping', function () {
        const content = `
    foo:
      { bar: baz, foo: fuzz }:
        - value
      { qux: quux, bax: bazz }:
        - value
    `;
        util.testErrors(content, []);
    });
});
//# sourceMappingURL=mappings.test.js.map