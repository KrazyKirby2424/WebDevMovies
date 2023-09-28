const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Movie = require('../models/movie')
const uploadPath = path.join('public', Movie.coverImageBasePath)
const Director = require('../models/director')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//All Movies Route
router.get('/', async (req, res) => {
    let query = Movie.find()
    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.releasedBefore != null && req.query.releasedBefore != '') {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if(req.query.releasedAfter != null && req.query.releasedAfter != '') {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try {
        const movies = await query.exec()
        res.render('movies/index', {
            movies: movies,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
    

})

//New Movie Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Movie())
})

//Create Movie Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        releaseDate: new Date(req.body.releaseDate),
        movieLength: req.body.movieLength,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newMovie = await movie.save()
        //res.redirect(`movies/${newMovie.id}`)
        res.redirect(`movies`)
    } catch {
        if(movie.coverImageName != null)
        {
            removeMovieCover(movie.coverImageName)
        }
        renderNewPage(res, movie, true)
    }
})

function removeMovieCover(fileName) {
    fs.unlink(path.join(uploadPath,fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, movie, hasError = false)
{
    try {
        const directors = await Director.find({})
        const params = {
            directors: directors,
            movie: movie
        }
        if (hasError) params.errorMessage = 'Error Creating Movie'
        res.render('movies/new', params)
    } catch {
        res.redirect('/movies')
    }
}

module.exports = router
