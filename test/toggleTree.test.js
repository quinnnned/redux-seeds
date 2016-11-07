import test from 'tape';
import {toggleTree} from '../src/';

test('toggleTree', ({equal, end}) => {
    equal(typeof toggleTree, 'function', 'should be a function');
    end();
})