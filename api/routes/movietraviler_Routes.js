module.exports = function (app) {

    var movietrailer_Controller = require('../controllers/movietrailer_Controller');

    app.post('/trailers', movietrailer_Controller.trailers)

}