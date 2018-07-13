'use strict';

const superagent = require('superagent'),
      fs = require('fs'),
      path = require('path'),
      formstream = require('formstream')

let server, prefix

class Request {
  constructor(options) {
    prefix = require('superagent-prefix')(options.stream || 'http://0.0.0.0:3000');
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
    const p = new Promise((resolve, reject)=>{
      req.end((err, res)=>{
        if(done) return done(err, res);
        if(err) return reject(err);
        resolve(res.body);
      });
    });
    if (!done) return p;
  }

  jsonp(req, json, done) {
    this.setAuthorization(req);
    const p = new Promise((resolve, reject)=>{
      req.send(json||{}).end((err, res)=>{
        if(done) return done(err, res);
        if(err) return reject(err);
        resolve(res.body);
      });
    });
    if (!done) return p;
  }

  post(route, json, done) {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.post(route).use(prefix);
    return this.jsonp(req, json, done);
  }

  put(route, json, done) {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.put(route).use(prefix);
    return this.jsonp(req, json, done);
  }

  patch(route, json, done) {
    if (typeof json === 'function') {
      done = json;
      json = null;
    }
    let req = superagent.patch(route).use(prefix);
    return this.jsonp(req, json, done);
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
    const p = new Promise((resolve, reject)=>{
      this.post('/api/' + this.userModel + '/login?include=user', credential, (err, res)=>{
        if(err) {
          if(done) return done(err); 
          reject(err);
        } else {
          this.accessToken = {id: res.body.id};
          if(done) return done();
          resolve(res);
        }
      });
    });
    if(!done) return p;
  }

  logout(done) {
    let _promise;
    if (this.accessToken) {
      _promise = this.post('/api/' + this.userModel + '/logout', done);
      this.accessToken = null;
    } else {
      _promise = Promise.resolve();
      if (done) return done();
    }
    return _promise;
  }

}

module.exports.boot = (app) => {
  before((done) => {
    server = app.start();
    app.on('started', done);
  });

  after(() => {
    server.close(()=> {
      // process.exit(0);
    });
  });
}
module.exports.Request = Request;
