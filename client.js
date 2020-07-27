const PROTO_PATH = __dirname + '/poc.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
var clc = require("cli-color");
const { cli } = require('cli-ux')


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

async function main() {
  let client = new pocProto.PracticeSessionService('localhost:4500',
    grpc.credentials.createInsecure());
  var call = client.practiceSession();

  call.on('data', function (message) {
    console.log("\n");
    // console.log(clc.red('GOT MESSAGE FROM SERVER -> '), message);
    switch (message.type) {
      case "status": let counters = JSON.parse(message.data);
        console.log(
          clc.green("GREEN") + `--->  ${counters['1']}\n` +
          clc.red("RED") + `--->  ${counters['2']}\n` +
          clc.blue("BLUE") + `--->  ${counters['3']}\n`
        );
        break;
      case "terminate": call.end();
        break;
    }
  });

  call.on('end', () => call.end());
  let user = await cli.prompt(clc.cyanBright("ENTER YOUR NAME:"))
  call.write({
    type: "initialize",
    user: user,
    data: "register",
    error: "NA"
  });
  while (true) {
    input = await cli.prompt(clc.yellow('What do you want to do?') +
      "\n" + clc.yellowBright(`1. Increment ${clc.green("GREEN")}`) +
      "\n" + clc.yellowBright(`2. Increment ${clc.red("RED")}`) +
      "\n" + clc.yellowBright(`3. Increment ${clc.blue("BLUE")}`) +
      "\n" + clc.yellowBright(`4. Get Counters`) +
      "\n" + clc.yellowBright(`5. End Session`) +
      "\n"
    )

    switch (input) {
      case "1": call.write({
        type: "1",
        user: user,
        data: "Increment",
        error: "NA"
      });
        break;
      case "2": call.write({
        type: "2",
        user: user,
        data: "Increment",
        error: "NA"
      });
        break;
      case "3": call.write({
        type: "3",
        user: user,
        data: "Increment",
        error: "NA"
      });
        break;
      case "4": call.write({
        type: "4",
        user: user,
        data: "require info",
        error: "NA"
      });
        break;
      case "5": console.log(clc.red("TERMINATING CONNECTION!!!"));
        call.write({
          type: "5",
          user: user,
          data: "Stop",
          error: "NA"
        });
        break;
    }

  }
}

main();
