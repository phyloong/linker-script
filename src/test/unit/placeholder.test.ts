//
// Trivial pure-Node test: runs under Mocha without an extension host and
// without downloading VS Code.
//

import * as assert from 'assert';

suite('Unit Tests', function () {

    test('pure logic runs without the extension host', function () {
        assert.equal(-1, [1, 2, 3].indexOf(5));
    });
});
