//
// Pure-Node test: runs under Mocha without an extension host and without
// downloading VS Code. It asserts real project data rather than built-in
// JavaScript behaviour.
//

import * as assert from 'assert';
import { SUPPORTED_LANGUAGE_IDS } from '../../languages';

suite('Unit Tests', function () {

    test('the supported language ids cover the contributed and compatibility ids', function () {
        assert.ok(SUPPORTED_LANGUAGE_IDS.indexOf('linker-script') !== -1,
            'linker-script is the contributed language id');
        assert.ok(SUPPORTED_LANGUAGE_IDS.indexOf('ld') !== -1,
            'ld is the compatibility language id');
    });
});
