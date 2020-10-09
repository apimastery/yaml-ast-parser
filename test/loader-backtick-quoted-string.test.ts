import * as YAML from '../src'
import { AbstractVisitor } from './visitor'

import * as chai from 'chai'
const assert = chai.assert

function structure(node) {
  return new DuplicateStructureBuilder().accept(node);
}

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

  test('test_EndsWithNewLine_FollowedByMoreSameLevelFields', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `\n" +
      "{\n" +
      "  \"status\": \"OK\"\n" + "}\n" +
      // ends on new line
      "`\n" +
      // ...and followed by a field at the same indentation level
      "  status: 200\n" + 
      "rank: 1" + 
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n}\n"),
            ),
            YAML.newMapping(
              YAML.newScalar("status"),
              YAML.newScalar("200"),
            ),
          ])
        ),
        YAML.newMapping(
          YAML.newScalar("rank"),
          YAML.newScalar("1"),
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  test('test_EndsWithNewLine_FollowedByFieldAtOuterLevel', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" + 
      "  body: `\n" + "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "}\n" +
        // ends on new line
      "`\n" +
      // ...and followed by a field at the parent's (outer) indentation level
      "rank: 1" + "";

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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n}\n"),
            ),
          ])
        ),
        YAML.newMapping(
          YAML.newScalar("rank"),
          YAML.newScalar("1"),
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  test('test_EndsWithNewLine_NothingAfterIt', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" + 
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "}\n" +
      // ends on new line
      "`" +
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n}\n"),
            ),
          ])
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  test('test_EndsOnLastLine_FollowedByFieldAtSameLevel', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" + 
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "} `\n" +
      // ...and followed by a field at the same indentation level
      "  status: 200\n" + 
      "rank: 1" + 
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n} "),
            ),
            YAML.newMapping(
              YAML.newScalar("status"),
              YAML.newScalar("200"),
            ),
          ])
        ),
        YAML.newMapping(
          YAML.newScalar("rank"),
          YAML.newScalar("1"),
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });
  
  test('test_EndsOnLastLine_FollowedByFieldAtOuterLevel', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" + 
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "} `\n" +
      // ...and followed by a field at the parent's (outer) indentation level
      "rank: 1" + 
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n} "),
            ),
          ])
        ),
        YAML.newMapping(
          YAML.newScalar("rank"),
          YAML.newScalar("1"),
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

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
              YAML.newScalar("{\n  \"status\": \"OK\"\n} "),
            ),
          ]),
        ),
      ]);
    
    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  test('test_EndsOnLastLine_FollowedBy', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" + 
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "} `\n" +
      // ...and followed by a field at the same indentation level
      "  status: 200\n" + 
      "rank: 1" + 
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"OK\"\n} "),
            ),
            YAML.newMapping(
              YAML.newScalar("status"),
              YAML.newScalar("200"),
            ),
          ])
        ),
        YAML.newMapping(
          YAML.newScalar("rank"),
          YAML.newScalar("1"),
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

  test('test_FirstCharIsRightAfterTheQuotes', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `{\n  \"status\": \"OK\"\n}` \n" +
      "";

    const doc = YAML.safeLoad(input)
    assert.lengthOf(doc.errors, 1, `Expected 1 error but got ${doc.errors.length}`)
    const err = doc.errors[0];
    assert.include(
      err.message,
      'expected end of line after start of backtick quoted string but got { (123) at line 3, column 10'
    );
  });

  test('test_EndsOnSameLineWhereItStarts', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `{ \"status\": \"OK\" }`\n" + 
      "";

    const doc = YAML.safeLoad(input)
    assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`)
    const err = doc.errors[0];
    assert.include(
      err.message,
      'expected end of line after start of backtick quoted string but got { (123) at line 3, column 10'
    );
  });

  test('test_NothingAfterItAndMissingEndQuotes', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" +
      "  body: `\n" + 
      "{\n" + 
      "  \"status\": \"OK\"\n" + 
      "}" + 
      "";

    const doc = YAML.safeLoad(input)
    assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`)
    const err = doc.errors[0];
    assert.include(
      err.message,
      'unexpected end of the stream within a backtick quoted string at line 7, column 1'
    );
  });

  test('test_EndOfStreamAfterOpeningQuotes', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      // EOF right after the backtip quote
      "  body: `" +
      "";

    const doc = YAML.safeLoad(input)
    assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`)
    const err = doc.errors[0];
    // The error message is different than the one in the Java implementation 
    // ("expected end of line but got end of stream") because this parser
    // always adds a new line character 0x10 at the end of the input
    assert.include(
      err.message,
      'unexpected end of the stream within a backtick quoted string at line 4, column 1'
    );
  });

  test('test_EndOfStreamAfterOpeningQuotesFollowedByNewLine', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" + 
      "  from: stub\n" +
      // EOF right after the new line that follows the opening triple quotes
      "  body: `\n" + 
      "";

    const doc = YAML.safeLoad(input)

    assert.lengthOf(doc.errors, 1, `Expected 1 errors but got ${doc.errors.length}`)

    const err = doc.errors[0];
    assert.include(
      err.message,
      'unexpected end of the stream within a backtick quoted string at line 4, column 1'
    );
  });

  test('test_ContainsEscapedBacktickCharacter', () => {
    // Using the same quoting as in the equivalent test in Java
    const input = "" +
      "response:\n" +
      "  from: stub\n" +
      "  body: `\n" +
      "{\n" +
      "  \"status\": \"\\`OK\\`\"\n" +
      "} `\n" +
      "" +
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
              // TODO this fails the test. Fix the code to make this pass. See
              // also the test above test_EndsOnLastLine_NothingAfterIt - change it, 
              // make sure it passes
              YAML.newScalar("{\n  \"status\": \"`OK`\"\n} "),
            ),
          ])
        ),
      ]);

    assert.deepEqual(actual_structure, expected_structure)

    assert.lengthOf(doc.errors, 0,
      `Found error(s): ${doc.errors.toString()} when expecting none.`)
  });

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
