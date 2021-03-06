http = require 'http'
express = require 'express'
WebSocket = require 'ws'
WebSocketServer = WebSocket.Server
Espruino = require 'node-espruino'

start = (o) ->
  console.log "Starting #{o}"
  if err?
    console.dir err
    process.exit 1

  device = new class
    constructor: ->
      @sockets = []
      @state = {}
      @getState()
    getState: =>
      done = =>
        setTimeout @getState, 10
        clearTimeout watchdog
        done = ->
      watchdog = setTimeout done, 200
      espruino.command 'getState()', (result) =>
        done()
        try
          @state = JSON.parse(result)
          @broadcastState()
    addWebsocket: (ws) =>
      console.log "Got websocket connection"
      @sockets.push ws
      ws.on 'close', => @removeWebsocket(ws)
      @sendState(ws)
    removeWebsocket: (ws) =>
      console.log "Lost websocket connection"
      # Should definitely exist, unless there's a bug somewhere.
      @sockets.splice(@sockets.indexOf(ws), 1)
    sendState: (ws) ->
      ws.send JSON.stringify(@state), -> # ignore errors
    broadcastState: ->
      @sendState(ws) for ws in @sockets

  app = express()
  server = http.createServer app
  app.use express.static __dirname
  wss = new WebSocketServer server:server
  wss.on 'connection', device.addWebsocket

  server.listen 1337
  console.log "Listening"

espruino = Espruino.espruino comPort: process.env.TTY
espruino.open (err) ->
  console.log "OPEN"
  throw err if err?
  setup = ->
    pinMode(C6, 'input_pullup')
    return true
  getState = ->
    P0: 1 - analogRead(A1)
    P1: 1 - analogRead(A0)
    P2: 1 - analogRead(C3)
    P3: 1 - analogRead(C2)
    P4: 1 - analogRead(C1)
    VOL: 1 - analogRead(C0)
    L0: analogRead(A3)
    C6: digitalRead(C6)

  sig = getState.toString()
  sig = sig.replace /^function ?/, "function getState"
  espruino.command "#{setup.toString().replace(/^function ?/, "function setup")}; setup();#{sig}", start
