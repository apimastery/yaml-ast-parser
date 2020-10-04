"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Kind;
(function (Kind) {
    Kind[Kind["SCALAR"] = 0] = "SCALAR";
    Kind[Kind["MAPPING"] = 1] = "MAPPING";
    Kind[Kind["MAP"] = 2] = "MAP";
    Kind[Kind["SEQ"] = 3] = "SEQ";
    Kind[Kind["ANCHOR_REF"] = 4] = "ANCHOR_REF";
    Kind[Kind["INCLUDE_REF"] = 5] = "INCLUDE_REF";
})(Kind = exports.Kind || (exports.Kind = {}));
function newMapping(key, value) {
    var end = (value ? value.endPosition : key.endPosition + 1);
    var node = {
        key: key,
        value: value,
        startPosition: key.startPosition,
        endPosition: end,
        kind: Kind.MAPPING,
        parent: null,
        errors: []
    };
    return node;
}
exports.newMapping = newMapping;
function newAnchorRef(key, start, end, value) {
    return {
        errors: [],
        referencesAnchor: key,
        value: value,
        startPosition: start,
        endPosition: end,
        kind: Kind.ANCHOR_REF,
        parent: null
    };
}
exports.newAnchorRef = newAnchorRef;
function newScalar(v = "") {
    const result = {
        errors: [],
        startPosition: -1,
        endPosition: -1,
        value: "" + v,
        kind: Kind.SCALAR,
        parent: null,
        doubleQuoted: false,
        backtickQuoted: false,
        rawValue: "" + v,
    };
    if (typeof v !== "string") {
        result.valueObject = v;
    }
    return result;
}
exports.newScalar = newScalar;
function newItems() {
    return {
        errors: [],
        startPosition: -1,
        endPosition: -1,
        items: [],
        kind: Kind.SEQ,
        parent: null
    };
}
exports.newItems = newItems;
function newSeq() {
    return newItems();
}
exports.newSeq = newSeq;
function newMap(mappings) {
    return {
        errors: [],
        startPosition: -1,
        endPosition: -1,
        mappings: mappings ? mappings : [],
        kind: Kind.MAP,
        parent: null
    };
}
exports.newMap = newMap;
function isNodesEqual(a, b) {
    if (!a || !b) {
        return false;
    }
    if (a.kind !== b.kind) {
        return false;
    }
    if (a.kind === Kind.SCALAR) {
        return a.value === b.value;
    }
    if (a.kind === Kind.SEQ) {
        const aSeq = a;
        const bSeq = b;
        if (aSeq.items.length !== bSeq.items.length) {
            return false;
        }
        for (let i = 0; i < aSeq.items.length; i++) {
            const elementA = aSeq.items[i];
            const elementB = bSeq.items[i];
            if (!isNodesEqual(elementA, elementB)) {
                return false;
            }
        }
        return true;
    }
    if (a.kind === Kind.MAP) {
        const aMap = a;
        const bMap = b;
        if (aMap.mappings.length !== bMap.mappings.length) {
            return false;
        }
        for (const mapA of aMap.mappings) {
            const keyA = mapA.key;
            const valA = mapA.value;
            const mapB = bMap.mappings.find(mapB => isNodesEqual(keyA, mapB.key));
            if (mapB) {
                if (!isNodesEqual(valA, mapB.value)) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        return true;
    }
    return false;
}
exports.isNodesEqual = isNodesEqual;
//# sourceMappingURL=yamlAST.js.map