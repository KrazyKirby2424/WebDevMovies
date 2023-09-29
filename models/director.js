const mongoose = require('mongoose')
const Movie = require('./movie')

const directorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

//need to work on delete check for movies
//{document: true, query: false},
directorSchema.pre('deleteOne',  async function(next) {
    /*
    console.log("insdie pre") 
    
    Movie.find({ director: this.id }, (err, movies) => {
        console.log("insdie find")
        if (err) {
            console.log("err")
          next(err)
        } else if (movies.length > 0) {
            console.log("movies")
          next(new Error('This director has movies still'))
        } else {
            console.log("next")
          next()
        }
      })
      console.log("pre end") 
      */
    
    try {
        //console.log(this.id)
        const query = this.getFilter();
        const hasMovie = await Movie.exists({ director: query._id  })  
        if (hasMovie) {
            //console.log("has movies error")
            next(new Error("This director still has movies."));
        } else {
            next();
        }
    } catch (err) {
        console.log(err)
        next(err);
    } 
    
})

module.exports = mongoose.model('Director', directorSchema)
