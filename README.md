# rest-test-bootstrap
[![Build Status](https://travis-ci.org/guanbo/loopback-rest-test.svg?branch=master)](https://travis-ci.org/guanbo/loopback-rest-test)

restful api test bootstrap

## Quick Start

```js
const rest = require('loopback-rest-test');
rest.boot(require('../../server/server'));

describe('Promise', () => {
  const user = new rest.Request({
    credential: { username: '18199999999', password: '123456' },
    userModel: 'users',
  });

  before(async () => await user.login());
  after(async () => await user.logout());

  it('should get ok', async () => {
    const orders = await user.get('/api/orders');
    orders.should.be.Array().and.not.empty();
  });

  it('should post ok', async () => {
    const order = {id:2};
    const res = await user.post('/api/orders', order);
    res.should.have.property('id', order.id);
  });
});

describe('Callback', () => {
  const user = new rest.Request({
    credential: { username: '18199999999', password: '123456' },
    userModel: 'users',
  });

  before((done) => user.login(done));
  after((done) => user.logout(done));
  
  it('should get ok', (done) => {
    user.get('/api/orders', (err, res)=>{
      res.body.should.be.Array().and.not.empty();
      done();
    });
  });

  it('should post ok', (done) => {
    const order = {id:2};
    user.post('/api/orders', order, (err, res)=>{
      res.body.should.have.property('id', order.id);
      done();
    });
  });
});

```
