import test from 'tape';
import nameNormalizer from '../src/lib/nameNormalizer';

test('nameNormalizer', (assert) => {

    assert.equal(typeof nameNormalizer, 'function', `
        should be a function
    `);

    assert.equal(nameNormalizer(), null, `
        should convert undefined to null
    `);

    assert.equal(nameNormalizer(null), null, `
        should convert null to null
    `);

    assert.equal(nameNormalizer({}), null, `
        should convert object to null
    `);

    assert.equal(nameNormalizer([]), null, `
        should convert array to null
    `);

    assert.equal(nameNormalizer(5), null, `
        should convert number to null
    `);

    assert.equal(nameNormalizer('whatever'), 'whatever', `
        should pass non-prefixed strings through unchanged
    `);

    assert.equal(nameNormalizer('get.whatever'), 'whatever', `
        should remove 'get.' prefix
    `);

    assert.equal(nameNormalizer('act.whatever'), 'whatever', `
        should remove 'act.' prefix
    `);

    assert.end()
});