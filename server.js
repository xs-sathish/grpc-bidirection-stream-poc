const PROTO_PATH = __dirname + '/poc.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
var clc = require("cli-color");
const redis = require('./redis');

let packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });


let pocProto = grpc.loadPackageDefinition(packageDefinition).poc;

let SESSION_NAMESPACE = "dummy-sample::"
let SESSION_VARIABLE = "session::"
let COUNTERS_META = {
  '1': 0,
  '2': 0,
  '3': 0
}

async function incrementUserCounter(sessionId, counter) {
  console.log(sessionId);
  redis.GET(sessionId, (err, data) => {
    data = JSON.parse(data)
    console.log(data);
    data[counter] += 1
    redis.SET(sessionId, JSON.stringify(data), (err, res) => {
      console.log(res);
    });
  })
}

async function sendCounters(sessionId, call) {
  console.log(sessionId);
  redis.GET(sessionId, (err, data) => {
    call.write({ type: "status", data: data })
  })
}

function practiceSession(call) {
  call.on('data', async function (message) {
    console.log(clc.red('GOT MESSAGE FROM CLIENT -> '), clc.yellow(JSON.stringify(message)));
    switch (message.type) {
      case "1": await incrementUserCounter(message.user, message.type);
        break;
      case "2": await incrementUserCounter(message.user, message.type);
        break;
      case "3": await incrementUserCounter(message.user, message.type);
        break;
      case "4": await sendCounters(message.user, call);
        break;
      case "5": call.write({ type: "terminate", data: "terminate" });
        call.end();
        break;
    }
    // message.data = "[[ RECEIVED ]]" + message.data
    // call.write(message)
  });
  call.on('end', function () {
    call.end();
  });
}

function createPracticeSession(call, callback) {
  let userName = call.request.name;
  let sessionToken = `${SESSION_NAMESPACE}${SESSION_VARIABLE}${userName}`
  let sessionData = Object.assign({}, COUNTERS_META);
  console.log(sessionData);
  console.log(sessionToken);
  redis.SET(sessionToken, JSON.stringify(sessionData), () => {
    callback(null, { token: sessionToken });
  })

}

function main() {
  let server = new grpc.Server();
  server.addService(pocProto.PracticeSessionService.service, { practiceSession: practiceSession, createPracticeSession: createPracticeSession });
  server.bindAsync('0.0.0.0:4500', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
  
}

main();