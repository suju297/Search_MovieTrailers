var request = require("request");
var movieTrailer = require("movie-trailer");
const { response } = require("express");
var async = require("async");
var SearchCache = require("../models/movietrailer_Models");

module.exports = {
    trailers: function (req, res) {
        return new Promise(function (resolve, reject) {


            var searchKeyword = req.body.search ? req.body.search.split(" ").join("+") : "";
            var page = req.body.page ? req.body.page : 1;
            var res = {};

            var today = new Date();
            var curM = today.getMonth() + 1;
            var curD = today.getDate();
            var saveToday = new Date(today.getFullYear(), curM, curD, 0, 0, 0, 0);

            SearchCache.aggregate(
                [
                    {

                        $match: {
                            "Search": searchKeyword,
                            "createdOn": saveToday,
                            "Page": page
                        }
                        
                    }
                   
                ],
                function (ee, rr) {
                    if (rr && rr.length > 0) {
                        res["authCode"] = 200;
                        res["status"] = true;
                        res["data_params"] = rr;
                        resolve(res);
                    } else {
                        async.parallel(
                            {
                                movieSearch: function (callback) {
                                    var options = {
                                        method: "POST",
                                        url: `http://www.omdbapi.com/?i=tt3896198&apikey=e713273f&s=${searchKeyword}&r=json&page=${page}`,
                                        headers: {
                                            Accept: "application/json",
                                            "Content-Type": "application/json",
                                            token:
                                                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1OSwiYWNjb3VudF90eXBlIjoiIiwibnVtYmVyT2ZBY2NvdW50cyI6MCwiYWNjb3VudF9uYW1lIjoiIiwiYWNjb3VudE51bWJlciI6IiIsInVzZXJuYW1lIjoidWhidm5fZGVtbzIiLCJpYXQiOjE2MTA5NjQ3Mjd9.SJfPrZsePjD8ysse_k_5o6guayaOFkdNwPdrHY1B2GM",
                                        },
                                    };
                                    request(options, function (error, response) {
                                        if (response) {
                                            var newString = JSON.parse(response.body);
                                            callback(null, newString);
                                        } else {
                                            callback(null, {});
                                        }
                                    });
                                },
                                movietrailer: function (callback) {
                                    movieTrailer(searchKeyword, function (err, res) {
                                        if (res) {
                                            callback(null, res);
                                        } else {
                                            callback(null, {});
                                        }
                                    });
                                },
                            },
                            function (err, results) {
                                
                                if (err) {
                                    res["authcode"] = 100;
                                    res["status"] = false;
                                    res["error"] = "Some error in data fetching";
                                    reject(res);
                                } else {
                                    const deleteCache = new Promise((res, rej) => {
                                        SearchCache.deleteMany(
                                            {
                                                Search: searchKeyword,
                                            },
                                            function (err, rrr) {
                                                if (rrr.ok === 1) {
                                                    res(rrr);
                                                } else {
                                                    rej(err);
                                                }
                                            }
                                        );
                                    });

                                    async function execute() {
                                        try {
                                            await deleteCache;
                                        } catch (error) {
                                            res["authCode"] = 100;
                                            res["status"] = false;
                                            res["msg"] = "Something went wrong. Please try again!";
                                            reject(res);
                                        }

                                        var array = results.movieSearch.Search;
                                        for (let i = 0; i < array.length; i++) {
                                            await new Promise((next) => {
                                                SearchCache.find(
                                                    {
                                                        Search: searchKeyword,
                                                        createdOn: saveToday,
                                                        Page: page,
                                                        imdbID: array[i].imdbID
                                                    },
                                                    function (ee, rr) {
                                                        if (rr && rr.length > 0) {
                                                            next();
                                                        } else if (ee) {
                                                            next();
                                                        } else {
                                                            var movieData = {
                                                                Search: searchKeyword,
                                                                Title: array[i].Title,
                                                                Year: array[i].Year,
                                                                imdbID: array[i].imdbID,
                                                                Type: array[i].Type,
                                                                Poster: array[i].Poster,
                                                                Page: page,
                                                                createdOn: saveToday,
                                                                YoutubeLink: results.movietrailer,
                                                            };

                                                            var SearchCaches = new SearchCache(movieData);

                                                            SearchCaches.save((ee, rr) => {
                                                                if (ee) {
                                                                    res["authcode"] = 100;
                                                                    res["status"] = false;
                                                                    res["error"] = "Some error in data saving";
                                                                    reject(res)
                                                                } else {
                                                                    next();
                                                                }
                                                            });
                                                            next();
                                                        }
                                                    }
                                                );
                                            });
                                        }
                                    }
                                    execute().then(() => {
                                        SearchCache.aggregate(
                                            [
                                                {

                                                    $match: {
                                                        "Search": searchKeyword,
                                                        "createdOn": saveToday,
                                                        "Page": page
                                                    }

                                                }
                                               
                                            ],
                                            function (ee, rr) {
                                                res["authCode"] = 200;
                                                res["status"] = true;
                                                res["data_params"] = rr;
                                                resolve(res);
                                            }
                                        );
                                    });
                                }
                            }
                        );
                    }
                }
            );
        });
    },
};
