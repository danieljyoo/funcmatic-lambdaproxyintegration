'use strict';

const utils = require('./utils')

function defaultHeaders() {
  return { 
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin" : "*",
    "Content-Type": "application/json"
  }
}

function lambdaProxyCallback(callback) {
  return (data, status, headers) => {
    if (data instanceof Error) {
      callback(null, formatError(data, status, headers))
      return
    }
    var datatype = typeof data
    if (datatype === 'object') {
      callback(null, formatObject(data, status, headers))
      return
    }
    if (datatype === 'boolean' || datatype === 'string' || datatype == 'number' ) {
      callback(null, formatLiteral(data, status, headers))
    }
    if (datatype === 'undefined') {
      callback(null, formatUndefined(data, status, headers))
    }
    if (datatype === 'function') {
      callback(null, formatFunction(data, status, headers))
    }
  }
}

function lambdaProxyRequestParams(event) {
  var queryStringParameters = event.queryStringParameters || { }
  var pathParameters = event.pathParameters || { }
  return utils.merge(queryStringParameters, pathParameters)
}


/*
http-errors lib uses the following conventions in their Error object

expose - can be used to signal if message should be sent to the client, defaulting to false when status >= 500
headers - can be an object of header names to values to be sent to the client, defaulting to undefined. When defined, the key names should all be lower-cased
message - the traditional error message, which should be kept short and all single line
status - the status code of the error, mirroring statusCode for general compatibility
statusCode - the status code of the error, defaulting to 500
*/
function formatError(err, status, headers) {
  var statusCode = status || err.status || err.statusCode || 500
  var headers = utils.merge(defaultHeaders(), headers || err.headers || {})
  var body = JSON.stringify({
    message: err.message
  })
  return { statusCode, headers, body }
}

function formatObject(obj, status, headers) {
  var statusCode = status || 200
  var headers = utils.merge(defaultHeaders(), headers || {})
  var body = '{}'
  try {
    body = JSON.stringify(obj)
  } catch (err) {
    body = JSON.stringify({
      message: `ERROR: Unable to convert response to JSON '${err.message}'`
    })
  }
  return { statusCode, headers, body }
}

function formatLiteral(val, status, headers) {
  var statusCode = status || 200
  var headers = utils.merge(defaultHeaders(), headers || { })
  headers['Content-Type'] = 'text/plain'
  var body = val.toString()
  return { statusCode, headers, body }
}

function formatFunction(func, status, headers) {
  var statusCode = 502 // Bad Gateway
  var headers = utils.merge(defaultHeaders(), headers || { })
  var body = JSON.stringify({
    message: 'ERROR: Unable to convert function to JSON'
  })
  return { statusCode, headers, body }
}

module.exports = {
  callback: lambdaProxyCallback,
  params: lambdaProxyRequestParams
}