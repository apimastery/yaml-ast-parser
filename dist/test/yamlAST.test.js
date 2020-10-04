"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const chai_1 = require("chai");
suite('YAML AST', () => {
    suite('AST Node Equality', () => {
        test('should not be equal when nodes has different kind', () => {
            const a = src_1.newScalar('a');
            const b = src_1.newSeq();
            const result = src_1.isNodesEqual(a, b);
            chai_1.expect(result).is.false;
        });
        suite('Scalar Nodes', () => {
            test('should be equal if both has same value', () => {
                const a = src_1.newScalar('a');
                const b = src_1.newScalar('a');
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.true;
            });
            test('should not be equal when the Scalar Nodes do not equal each other', () => {
                const a = src_1.newScalar('a');
                const b = src_1.newScalar('b');
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
        });
        suite('Seq Nodes', () => {
            test('should not be equal if they has different size', () => {
                const a = src_1.newSeq();
                a.items = [src_1.newScalar('a'), src_1.newScalar('b')];
                const b = src_1.newSeq();
                b.items = [src_1.newScalar('a')];
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
            test('should be equal if they has same values ', () => {
                const a = src_1.newSeq();
                a.items = [src_1.newScalar('a')];
                const b = src_1.newSeq();
                b.items = [src_1.newScalar('a')];
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.true;
            });
            test('should not be equal if seq contains different items', () => {
                const a = src_1.newSeq();
                a.items = [src_1.newScalar('a')];
                const b = src_1.newSeq();
                b.items = [src_1.newScalar('b')];
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
        });
        suite('Map Nodes', () => {
            test('should be equal', () => {
                const a = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA'))]);
                const b = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA'))]);
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.true;
            });
            test('should not be equal if map has different size', () => {
                const a = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA'))]);
                const b = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA')), src_1.newMapping(src_1.newScalar('keyB'), src_1.newScalar('valB'))]);
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
            test('should not be equal if map has different key', () => {
                const a = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA'))]);
                const b = src_1.newMap([src_1.newMapping(src_1.newScalar('keyB'), src_1.newScalar('valA'))]);
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
            test('should not be equal if map has different value for same key', () => {
                const a = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valA'))]);
                const b = src_1.newMap([src_1.newMapping(src_1.newScalar('keyA'), src_1.newScalar('valB'))]);
                const result = src_1.isNodesEqual(a, b);
                chai_1.expect(result).is.false;
            });
        });
    });
});
//# sourceMappingURL=yamlAST.test.js.map