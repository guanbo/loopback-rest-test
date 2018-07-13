'use strict';

const rest = require('..');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/users/login', (req, res)=>{
  app.token = Date.now();
  res.status(200).json({id: app.token});
});
app.post('/api/users/logout', (req, res)=>{
  app.token = null;
  res.status(200).send('ok');
});
function auth(req, res, next) {
  if(!app.token) return res.sendStatus(401);
  if(app.token.toString() !== req.headers['authorization']) return res.sendStatus(403);
  next();
}
app.get('/api/orders', auth, (req, res)=>{
  res.status(200).json([{id:1}]);
});

app.post('/api/orders', auth, (req, res)=>{
  res.status(200).json(req.body);
})

let server
before((done) => {
  server = app.listen(3000, (err)=>{
    console.log('Listen on http://localhost:'+server.address().port);
    done(err);
  });
});


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