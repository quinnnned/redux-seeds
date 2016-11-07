import test from 'tape';

import { placeholder } from '../src';

test('placeholder', ({equal, end}) => {
    equal( placeholder(), 'travis-test');
    end();
});