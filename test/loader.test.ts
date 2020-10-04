import * as YAML from '../src/'
import { AbstractVisitor } from './visitor'

import * as chai from 'chai'
const assert = chai.assert

function structure(node) {
  return new DuplicateStructureBuilder().accept(node);
}

suite('Loading a single document', () => {
  test('should work with document-end delimiters', function () {
    const input = `---
whatever: true
...`
    const doc = YAML.safeLoad(input)
    const expected_structure =
      YAML.newMap(
        [YAML.newMapping(
          YAML.newScalar('whatever'),
          YAML.newScalar('true'))]);

    assert.deepEqual(structure(doc), expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
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
    const docs = []
    YAML.loadAll(`---
whatever: true
...
---
whatever: false
...`, d => docs.push(d))

    const expected_structure = [
      YAML.newMap(
        [YAML.newMapping(
          YAML.newScalar('whatever'),
          YAML.newScalar('true'))]),
      YAML.newMap(
        [YAML.newMapping(
          YAML.newScalar('whatever'),
          YAML.newScalar('false'))])
    ];

    assert.deepEqual(docs.map(d => structure(d)), expected_structure)

    docs.forEach(doc =>
      assert.lengthOf(doc.errors, 0,
        `Found error(s): ${doc.errors.toString()} when expecting none.`))
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
    const documents: YAML.YAMLDocument[] = [];
    YAML.loadAll(input, x => documents.push(x));
    const doc2 = documents[1];
    assert.deepEqual(doc2.endPosition, input.length);
  });
});

// These are the same tests as in the custom "extended" Java snakeyaml library
suite('Backtick quoted multi-line string', () => {

  test('should report duplicate keys after parsing', () => {
    const input = 'kind: a\ncwd: b\nkind: c';

    const yamlNodes: YAML.YAMLNode[] = [];
    YAML.loadAll(input, (d) => yamlNodes.push(d), {});
    
    assert.lengthOf(yamlNodes, 1, `Expected a single YAML root but got ${yamlNodes.length}`);
    
    const doc = yamlNodes[0];
    assert.lengthOf(doc.errors, 2, `Expected 2 errors but got ${doc.errors.length}`);

    assert.include(doc.errors[0].message, 'duplicate key');
    assert.include(doc.errors[1].message, 'duplicate key');
  });

  // test_EndsWithNewLine_FollowedByMoreSameLevelFields
  // test_EndsWithNewLine_FollowedByFieldAtOuterLevel
  // test_EndsWithNewLine_NothingAfterIt
  // test_EndsOnLastLine_FollowedByFieldAtSameLevel
  // test_EndsOnLastLine_FollowedByFieldAtOuterLevel

  test('test_EndsOnLastLine_NothingAfterIt', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `\n" +
      "{\n" +
      "  \"status\": \"OK\"\n" +
      "} `" +
      // ...and nothing after it
      "";

    const doc = YAML.safeLoad(input)
    const actual_structure = structure(doc);
    
    const expected_structure =
      YAML.newMap([
        YAML.newMapping(
          YAML.newScalar("response"),
          YAML.newMap([
            YAML.newMapping(
              YAML.newScalar("from"),
              YAML.newScalar("stub"),
            ),
            YAML.newMapping(
              YAML.newScalar("body"),
              YAML.newScalar("{ \"status\": \"OK\" } "),
            ),
          ])
        )
      ]);
    
    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  // test_EndsOnLastLine_FollowedBy

  test('test_FirstCharIsRightAfterTheQuotes', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `{\n  \"status\": \"OK\"\n}` \n" +
      "";

    try {
      YAML.safeLoad(input)
      assert.fail('Expected an error to be thrown but got none');
    } catch (e) {
      // This is expected
      assert.include(
        e.message,
        'expected end of line after start of backtick quoted string but got { (123) at line 3, column 11'
      );
    }
  });
    
  test('test_EndsOnSameLineWhereItStarts', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `{\n  \"status\": \"OK\"\n}`\n" + 
      "";

    try {
      YAML.safeLoad(input)
      assert.fail('Expected an error to be thrown but got none');
    } catch (e) {
      // This is expected
      assert.include(
        e.message, 
        'expected end of line after start of backtick quoted string but got { (123) at line 3, column 11'
      );
    }
  });

  test('test_NothingAfterItAndMissingEndQuotes', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" +
      // The text starts right after the triple quotes instead of a new line
      // after that
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "}" + 
      "";

    try {
      YAML.safeLoad(input)
      assert.fail('Expected an error to be thrown but got none');
    } catch (e) {
      // This is expected
      assert.include(
        e.message,
        'unexpected end of the stream within a backtick quoted string at line 7, column 1'
      );
    }
  });

  // test_EndOfStreamAfterOpeningQuotes
  // test_EndOfStreamAfterOpeningQuotesFollowedByNewLine
  // test_ContainsEscapedBacktickCharacter

  //   test('Document end position should be equal to input length', function () {
  //     const input = `
  // outer:
  // inner:
  //     `;
  //     const doc1 = YAML.load(input);
  //     assert.deepEqual(doc1.endPosition, input.length);
  //   });
});

class DuplicateStructureBuilder extends AbstractVisitor {
  visitScalar(node: YAML.YAMLScalar) {
    return YAML.newScalar(node.value)
  }
  visitMapping(node: YAML.YAMLMapping) {
    const key = this.visitScalar(<YAML.YAMLScalar>node.key);
    const value = this.accept(node.value);
    return YAML.newMapping(key , value);
  }
  visitSequence(node: YAML.YAMLSequence) {
    const seq = YAML.newSeq()
    seq.items = node.items.map(n => this.accept(n))
    return seq
  }
  visitMap(node: YAML.YamlMap) {
    return YAML.newMap(node.mappings.map(n => this.accept(n)));
  }
  visitAnchorRef(node: YAML.YAMLAnchorReference) {
    throw new Error("Method not implemented.");
  }
  visitIncludeRef(node: YAML.YAMLNode) {
    throw new Error("Method not implemented.");
  }
}
