import test from 'tape';
import camelToUpperSnake from '../src/lib/camelToUpperSnake';

test('camelToUpperSnake', ({equal, end}) => {
    equal(camelToUpperSnake('somethingInCamelCase'), 'SOMETHING_IN_CAMEL_CASE')
    end();
})