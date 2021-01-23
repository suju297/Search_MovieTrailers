var express = require('express')
var config = require('./config')
var db = require('./config/cache_config')
app = express();
var bodyParser = require('body-parser');


process.on('SIGTERM', signal => {
    console.log(`Process ${process.pid} received a SIGTERM signal`)
    process.exit(0)
  })
  
  process.on('SIGINT', signal => {
    console.log(`Process ${process.pid} has been interrupted`)
    process.exit(0)
  })

  process.on('uncaughtException', (err,rr) => {
    console.log('Uncaught Exception:',err)
    process.exit(1)
  })

  process.on('unhandledRejection', (promise, reason) => {
    console.log('Unhandled rejection at ', promise, `reason:`, reason)
    process.exit(1)
  })

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    app.use(express.static('public'));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    next();
})

require('./api/routes/movietraviler_Routes')(app);

app.set('port', config.httpPort);

var server = app.listen(config.httpPort, function () {
    console.log('Server started, listening on port ' + app.get('port'));
});

var loggers = require('express-logger');
app.use(loggers({ path: "./logfile.txt" }));
module.exports = app;
