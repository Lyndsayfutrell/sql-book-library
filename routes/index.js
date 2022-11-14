var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const Book = require('../models').Book;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect("/books")
});


/* GET books */
router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll({order:[["title"]]});
  res.render('index', {books});
}));

/* Create a new book */
router.get('/new', (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

/* POST create book. */
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

/* GET book */
router.get("/books/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("view-book", { book, title: book.title });  
  } else {
    next(createError(404));
  }
}));

/* Update book form */
router.get("/books/:id/update", asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: "Update Book" });      
  } else {
    next(createError(404));
  }
}));

/* Update book */
router.post('/books/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id); 
    } else {
      next(createError(404));
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));


/* Delete individual book */
router.post('/books/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books/");
  } else {
    next(createError(404));
  }
}));


module.exports = router;
