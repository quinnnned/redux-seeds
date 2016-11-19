import test from 'tape';
import supermock from '../src/lib/supermock';

test('supermock', (assert) => {

    assert.equal(supermock(), supermock, `
        should be a function that returns itself.
    `)

    const randomKey = `${Math.random()}`;
    assert.equal(supermock[randomKey], supermock, `
        should be an object where every property is supermock
    `);

    assert.end();
});