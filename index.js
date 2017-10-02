'use strict';

const superagent = require('superagent');
const prefix = require('superagent-prefix')('http://0.0.0.0:3000');
const app = require('../../server/server');

let server, accessToken;

before((done) => {
  server = app.start();
  app.on('started', done);
});

after((done) => {
  server.close();
  done();
});

let request = {
  credential: {
    username: 'weixin.oV5Yms7LX0RPudwkz1X6G2Kilj9w',
    password: '123456',
  },
  get: (route, query, done) => {
    if (typeof query === 'function') {
      done = query;
      query = null;
    }
    let req = superagent.get(route).use(prefix);
    if (accessToken) req.set({ 'Authorization': accessToken.id });
    if (query) req.query(query);
    req.end(done);
  },
  post: (route, json, done) => {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.post(route).use(prefix);
    if (accessToken) req.set({ 'Authorization': accessToken.id });
    req.send(json).end(done);
  },
  put: (route, json, done) => {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.put(route).use(prefix);
    if (accessToken) req.set({ 'Authorization': accessToken.id });
    req.send(json).end(done);
  },
  login: (credential, done) => {
    if (typeof credential === 'function') {
      done = credential;
      credential = null;
    }
    credential = credential||request.credential;
    request.post('/api/users/login?include=user', credential, (err, res) => {
      accessToken = res.body;
      done(err);
    });
  },
  logout: (done) => {
    if (accessToken) {
      request.post('/api/users/logout', done);
      accessToken = null;
    } else {
      done();
    }
  },
};

module.exports.accessToken = () => { return accessToken; };
module.exports.request = (options) => { 
  if (!options||!options.credential) {
    throw new Error('credential must provider!');
  }
  return Object.assign(request, options);
}