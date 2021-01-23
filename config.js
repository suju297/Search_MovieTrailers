/*
* Create configuration variables
*
*/

var environment = {};

//Staging environment
environment.staging = {
    'httpPort' : 3000,
    'envName' : 'staging'
}

//Staging environment
environment.production = {
    'httpPort' : 3002,
    'envName' : 'production'
}

 // Determine which environment was passed as a command-line argument
 var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

 //Check that the current environment is one of the environments above, if not, default to staging
 var environmentToExport = typeof(environment[currentEnvironment]) == 'object' ? environment[currentEnvironment] : environment.staging;

 module.exports = environmentToExport