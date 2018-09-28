'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const multiparty = require('connect-multiparty');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

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
});

app.post('/api/upload', auth, (req, res)=>{
  var files = {};
  for (var k in req.files) {
    var f = req.files[k];
    files[k] = {
      size: f.size || f.length,
      mime: f.type || f.mime,
      filename: f.name || f.filename,
      path: f.path
    };
  }
  res.send({
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    files: files
  });
});

app.delete('/api/orders', auth, (req, res)=>{
  res.status(200).json(req.body);
})

let server
function boot(done) {
  server = app.listen(3000, (err)=>{
    console.log('Listen on http://localhost:'+server.address().port);
    done(err);
  });
}

module.exports.boot = boot;
