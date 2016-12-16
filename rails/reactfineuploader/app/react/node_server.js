require('babel-core/register');
require('./index');

const fs = require('fs');
const path = require('path');
const http = require('http');
const dispatcher = require('httpdispatcher');
const { integrationsManager } = require('react-webpack-rails');

const PORT = 8081;
const ASSETS_MAPPING_PATH = 'tmp/cache/assets-mapping.json';

global.__RWR_ENV__ = {};
global.__RWR_VIEW_HELPERS__ = { imagePaths: {} };

fs.readFile(ASSETS_MAPPING_PATH, (err, data) => {
  if (err) { return err; }
  const imagePaths = data.toString('utf-8');
  global.__RWR_VIEW_HELPERS__.imagePaths = JSON.parse(imagePaths);
});

const handleRequest = (req, res) => {
  const { method, url } = req;
  const reqStartTime = (new Date()).toLocaleTimeString();

  console.log(`${method} "${url}" - ${reqStartTime}`);
  dispatcher.dispatch(req, res);
}

dispatcher.onPost('/run', (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const result = integrationsManager.runNodeIntegration(data);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(result);
  } catch(e) {
    console.error(e);

    res.writeHead(500);
    res.end(`nodeRun failed:\n ${e.name}: ${e.message}`);
  }
});

http
  .createServer(handleRequest)
  .listen(PORT, () => {
    console.log(`Server listening on: http://localhost:${PORT}`)
  });
