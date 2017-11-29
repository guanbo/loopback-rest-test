'use strict';

const superagent = require('superagent');
const prefix = require('superagent-prefix')('http://0.0.0.0:3000');
const fs = require('fs');
const path = require('path');
const formstream = require('formstream');

let server;

class Request {
  constructor(options) {
    this.credential = options.credential || {
      username: 'weixin.oV5Yms7LX0RPudwkz1X6G2Kilj9w',
      password: '123456',
    };
    this.userModel = options.userModel || 'users';
    this.tokenKey = options.tokenKey || 'id';
    this.accessToken = null;
  }

  setAuthorization(req) {
    let token = this.accessToken && this.accessToken[this.tokenKey];
    if (token) req.set({ 'Authorization': token });
  }

  get(route, query, done) {
    if (typeof query === 'function') {
      done = query;
      query = null;
    }
    let req = superagent.get(route).use(prefix);
    this.setAuthorization(req);
    if (query) req.query(query);
    req.end(done);
  }

  post(route, json, done) {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.post(route).use(prefix);
    this.setAuthorization(req);
    req.send(json).end(done);
  }

  put(route, json, done) {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.put(route).use(prefix);
    this.setAuthorization(req);
    req.send(json).end(done);
  }

  upload(route, filepath, done) {
    var req = superagent.post(route).use(prefix).accept('*/*');
    this.setAuthorization(req);

    req.on('response', function (res) {
      done(null, res);
    });

    fs.stat(filepath, function (err, stat) {
      if (err) return done(err);
      var form = formstream();
      form.file('buffer', filepath, path.basename(filepath), stat.size);
      req.set(form.headers());
      form.pipe(req);
    });
  }

  login(credential, done) {
    if (typeof credential === 'function') {
      done = credential;
      credential = null;
    }
    credential = credential || this.credential;
    let that = this;
    this.post('/api/' + this.userModel + '/login?include=user', credential, (err, res) => {
      that.accessToken = res.body;
      done(err);
    });
  }

  logout(done) {
    if (this.accessToken) {
      this.post('/api/' + this.userModel + '/logout');
    }
    this.accessToken = null;
    done();
  }

}

module.exports.boot = (app) => {
  before((done) => {
    server = app.start();
    app.on('started', done);
  });

  after(() => {
    server.close(()=> {
      process.exit(0);
    });
  });
}
module.exports.Request = Request;