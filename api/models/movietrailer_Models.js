var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var movieTrailerSchema = new mongoose.Schema({

    Search: { type: String },
    Title: { type: String },
    Year: { type: String },
    imdbID: { type: String },
    Type: { type: String },
    Poster: { type: String },
    Page: { type: Number, default: 1 },
    createdOn: { type: Date, default: Date.now() },
    YoutubeLink: { type: String }
})

mongoose.model('movieTrailer', movieTrailerSchema);

module.exports = mongoose.model('movieTrailer', movieTrailerSchema)