'use strict';

const rest = require('..');
const server = require('./fixtures/server');
before((done) => {
  server.boot(done);
});

const path = require('path');
const fileOpts = {
  name: 'card',
  filepath: path.resolve(__dirname, 'fixtures', 'server.js')
}

describe('Promise', () => {
  const user = new rest.Request({
    credential: { username: '18199999999', password: '123456' },
    userModel: 'users',
    tokenKey: 'id'
  });

  before(async () => await user.login());
  after(async () => await user.logout());

  it('should get ok', async () => {
    const res = await user.get('/api/orders');
    res.body.should.be.Array().and.not.empty();
  });

  it('should post ok', async () => {
    const order = {id:2};
    const res = await user.post('/api/orders', order);
    res.body.should.have.property('id', order.id);
  });

  it('should upload ok', async() => {
    const res = await user.upload('/api/upload', fileOpts);
    res.should.have.status(200);
  });

  it('should delete ok', async() => {
    const res = await user.del('/api/orders');
    res.should.have.status(200);
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

  it('should upload ok', (done) => {
    user.upload('/api/upload', fileOpts.filepath, (err, res)=>{
      res.should.have.status(200);
      done();
    })
  });

  it('should delete ok', (done) => {
    user.del('/api/orders', (err, res)=>{
      res.should.have.status(200);
      done();
    })
  });
});