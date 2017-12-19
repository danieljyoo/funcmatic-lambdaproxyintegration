const lambda = require('../lib/lambda')
var createError = require('http-errors')

describe('Lambda Callback Errors', () => {
  it ('should format a plain error', done => {
    var err = new Error('my message')
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 500,
        body: JSON.stringify({
          message: 'my message'
        })
      })
      done()
    })
    callback(err)
  })
  it ('should format a plain error with options', done => {
    var err = new Error('my message')
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 501,
        headers: {
          'my-header': 'val'
        },
        body: JSON.stringify({
          message: 'my message'
        })
      })
      done()
    })
    callback(err, 501, { 'my-header': 'val' })
  })
  it ('should format a http-error', done => {
    var err = createError.NotFound()
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 404,
        body: JSON.stringify({
          message: 'Not Found'
        })
      })
      done()
    })
    callback(err)
  })
})

describe('Lambda Callback Object', () => {
  it ('should format a plain object', done => {
    var obj = {
      "hello": "world"
    }
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 200,
        body: JSON.stringify(obj)
      })
      done()
    })
    callback(obj)
  })
  it ('should format a plain object with options', done => {
    var obj = {
      "hello": "world"
    }
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 201,
        headers: {
          'my-header': 'val'
        },
        body: JSON.stringify(obj)
      })
      done()
    })
    callback(obj, 201, { 'my-header': 'val' })
  })
})

describe('Lambda Callback Literals', () => {
  it ('should format a number', done => {
    var val = 1
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: val.toString()
      })
      done()
    })
    callback(val)
  })
  it ('should format a string', done => {
    var val = "hello world!"
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 201,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: val.toString()
      })
      done()
    })
    callback(val, 201)
  })
  it ('should format a boolean', done => {
    var val = false
    var callback = lambda.callback((err, data) => {
      expect(data).toMatchObject({
        statusCode: 202,
        headers: {
          'Content-Type': 'text/plain',
          'my-header': 'val'
        },
        body: val.toString()
      })
      done()
    })
    callback(val, 202, { 'my-header': 'val' })
  })
})

describe('Lambda Proxy Params', () => {
  it ('should merge pathParameters and queryStringParameters', done => {
    var event = {
      "queryStringParameters": {
        "unique": "unique-val",
        "fid": "TEST-FUNCTION-UUID"
      },
      "pathParameters": {
        "fid": "TEST-FUNCTION-UUID-2",
        "new": "new-value"
      }
    }
    var params = lambda.params(event)
    expect(params).toMatchObject({
      "unique": "unique-val",
      "fid": "TEST-FUNCTION-UUID-2",
      "new": "new-value"
    })
    done()
  })
})