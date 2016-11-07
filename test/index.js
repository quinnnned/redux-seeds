import test from 'tape';

import { placeholder } from '../src';

test('placeholder', ({equal, end}) => {
    equal( placeholder(), 'coveralls-test');
    end();
});