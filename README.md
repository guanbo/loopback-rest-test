# rest-test-bootstrap
restful api test bootstrap

## Quick Start

```js
const rest = require('loopback-rest-test');
rest.boot(require('../../server/server'));

describe('Find orders', ()=>{
  const request = new rest.Request({
    credential: { username: '18199999999', password: '123456' },
    userModel: 'users',
  });

  before((done) => { request.login(done); });
  after((done) => { request.logout(done); });

  it('should ok', (done)=>{
    request.get('/api/orders', {
      filter: {
        where: {title: 'abc'},
        include: ['operator']
      }
    }, (err, res)=>{
      res.should.have.status(200);
      done();
    });
  });
});


```
