const PROTO_PATH = __dirname + '/poc.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
var clc = require("cli-color");


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

let COUNTERS = {}
let COUNTERS_META = {
  '1': 0,
  '2': 0,
  '3': 0
}

function practiceSession(call) {
  call.on('data', function (message) {
    console.log(clc.red('GOT MESSAGE FROM CLIENT -> '), clc.yellow(JSON.stringify(message)));
    switch (message.type) {
      case "initialize": COUNTERS[message.user] = Object.assign({}, COUNTERS_META);
        break;
      case "1": COUNTERS[message.user]["1"] += 1;
        break;
      case "2": COUNTERS[message.user]["2"] += 1;
        break;
      case "3": COUNTERS[message.user]["3"] += 1;
        break;
      case "4": call.write({ type: "status", data: JSON.stringify(COUNTERS[message.user]) })
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


function main() {
  let server = new grpc.Server();
  server.addService(pocProto.PracticeSessionService.service, { practiceSession: practiceSession });
  server.bind('0.0.0.0:4500', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();