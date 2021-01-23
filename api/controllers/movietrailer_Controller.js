var movies = require('../helpers/').movies;

exports.trailers = function (req, res) {
    movies.trailers(req).then(function (result) {
        res.json(result);
    }, function (error) {
        res.json(error);
        throw error;
    });
};