"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YAML = require("../src/");
const visitor_1 = require("./visitor");
const chai = require("chai");
const assert = chai.assert;
function structure(node) {
    return new DuplicateStructureBuilder().accept(node);
}
suite('Loading a single document', () => {
    test('should work with document-end delimiters', function () {
        const input = `---
whatever: true
...`;
        const doc = YAML.safeLoad(input);
        const expected_structure = YAML.newMap([YAML.newMapping(YAML.newScalar('whatever'), YAML.newScalar('true'))]);
        assert.deepEqual(structure(doc), expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('Document end position should be equal to input length', function () {
        const input = `
outer:
inner:
    `;
        const doc1 = YAML.load(input);
        assert.deepEqual(doc1.endPosition, input.length);
    });
});
suite('Loading multiple documents', () => {
    test('should work with document-end delimiters', function () {
        const docs = [];
        YAML.loadAll(`---
whatever: true
...
---
whatever: false
...`, d => docs.push(d));
        const expected_structure = [
            YAML.newMap([YAML.newMapping(YAML.newScalar('whatever'), YAML.newScalar('true'))]),
            YAML.newMap([YAML.newMapping(YAML.newScalar('whatever'), YAML.newScalar('false'))])
        ];
        assert.deepEqual(docs.map(d => structure(d)), expected_structure);
        docs.forEach(doc => assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`));
    });
    test('Last document end position should be equal to input length', function () {
        const input = `
outer1:
inner1:
...
---
outer2:
inner2:
    `;
        const documents = [];
        YAML.loadAll(input, x => documents.push(x));
        const doc2 = documents[1];
        assert.deepEqual(doc2.endPosition, input.length);
    });
});
suite('Backtick quoted multi-line string', () => {
    test('should report duplicate keys after parsing', () => {
        const input = 'kind: a\ncwd: b\nkind: c';
        const yamlNodes = [];
        YAML.loadAll(input, (d) => yamlNodes.push(d), {});
        assert.lengthOf(yamlNodes, 1, `Expected a single YAML root but got ${yamlNodes.length}`);
        const doc = yamlNodes[0];
        assert.lengthOf(doc.errors, 2, `Expected 2 errors but got ${doc.errors.length}`);
        assert.include(doc.errors[0].message, 'duplicate key');
        assert.include(doc.errors[1].message, 'duplicate key');
    });
    test('test_EndsWithNewLine_FollowedByMoreSameLevelFields', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" + "}\n" +
            "`\n" +
            "  status: 200\n" +
            "rank: 1" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n}\n")),
                YAML.newMapping(YAML.newScalar("status"), YAML.newScalar("200")),
            ])),
            YAML.newMapping(YAML.newScalar("rank"), YAML.newScalar("1")),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsWithNewLine_FollowedByFieldAtOuterLevel', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" + "{\n" +
            "  \"status\": \"OK\"\n" +
            "}\n" +
            "`\n" +
            "rank: 1" + "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n}\n")),
            ])),
            YAML.newMapping(YAML.newScalar("rank"), YAML.newScalar("1")),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsWithNewLine_NothingAfterIt', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "}\n" +
            "`" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n}\n")),
            ])),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsOnLastLine_FollowedByFieldAtSameLevel', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "} `\n" +
            "  status: 200\n" +
            "rank: 1" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n} ")),
                YAML.newMapping(YAML.newScalar("status"), YAML.newScalar("200")),
            ])),
            YAML.newMapping(YAML.newScalar("rank"), YAML.newScalar("1")),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsOnLastLine_FollowedByFieldAtOuterLevel', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "} `\n" +
            "rank: 1" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n} ")),
            ])),
            YAML.newMapping(YAML.newScalar("rank"), YAML.newScalar("1")),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsOnLastLine_NothingAfterIt', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "} `" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n} ")),
            ])),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_EndsOnLastLine_FollowedBy', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "} `\n" +
            "  status: 200\n" +
            "rank: 1" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"OK\"\n} ")),
                YAML.newMapping(YAML.newScalar("status"), YAML.newScalar("200")),
            ])),
            YAML.newMapping(YAML.newScalar("rank"), YAML.newScalar("1")),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
    test('test_FirstCharIsRightAfterTheQuotes', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `{\n  \"status\": \"OK\"\n}` \n" +
            "";
        const doc = YAML.safeLoad(input);
        assert.lengthOf(doc.errors, 1, `Expected 1 error but got ${doc.errors.length}`);
        const err = doc.errors[0];
        assert.include(err.message, 'expected end of line after start of backtick quoted string but got { (123) at line 3, column 10');
    });
    test('test_EndsOnSameLineWhereItStarts', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `{ \"status\": \"OK\" }`\n" +
            "";
        const doc = YAML.safeLoad(input);
        assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`);
        const err = doc.errors[0];
        assert.include(err.message, 'expected end of line after start of backtick quoted string but got { (123) at line 3, column 10');
    });
    test('test_NothingAfterItAndMissingEndQuotes', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"OK\"\n" +
            "}" +
            "";
        const doc = YAML.safeLoad(input);
        assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`);
        const err = doc.errors[0];
        assert.include(err.message, 'unexpected end of the stream within a backtick quoted string at line 7, column 1');
    });
    test('test_EndOfStreamAfterOpeningQuotes', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `" +
            "";
        const doc = YAML.safeLoad(input);
        assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`);
        const err = doc.errors[0];
        assert.include(err.message, 'unexpected end of the stream within a backtick quoted string at line 4, column 1');
    });
    test('test_EndOfStreamAfterOpeningQuotesFollowedByNewLine', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "";
        const doc = YAML.safeLoad(input);
        assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`);
        const err = doc.errors[0];
        assert.include(err.message, 'unexpected end of the stream within a backtick quoted string at line 4, column 1');
    });
    test('test_ContainsEscapedBacktickCharacter', () => {
        const input = "" +
            "response:\n" +
            "  from: stub\n" +
            "  body: `\n" +
            "{\n" +
            "  \"status\": \"\\`OK\\`\"\n" +
            "} `\n" +
            "" +
            "";
        const doc = YAML.safeLoad(input);
        const actual_structure = structure(doc);
        const expected_structure = YAML.newMap([
            YAML.newMapping(YAML.newScalar("response"), YAML.newMap([
                YAML.newMapping(YAML.newScalar("from"), YAML.newScalar("stub")),
                YAML.newMapping(YAML.newScalar("body"), YAML.newScalar("{\n  \"status\": \"`OK`\"\n} ")),
            ])),
        ]);
        assert.deepEqual(actual_structure, expected_structure);
        assert.lengthOf(doc.errors, 0, `Found error(s): ${doc.errors.toString()} when expecting none.`);
    });
});
class DuplicateStructureBuilder extends visitor_1.AbstractVisitor {
    visitScalar(node) {
        return YAML.newScalar(node.value);
    }
    visitMapping(node) {
        const key = this.visitScalar(node.key);
        const value = this.accept(node.value);
        return YAML.newMapping(key, value);
    }
    visitSequence(node) {
        const seq = YAML.newSeq();
        seq.items = node.items.map(n => this.accept(n));
        return seq;
    }
    visitMap(node) {
        return YAML.newMap(node.mappings.map(n => this.accept(n)));
    }
    visitAnchorRef(node) {
        throw new Error("Method not implemented.");
    }
    visitIncludeRef(node) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=loader.test.js.map