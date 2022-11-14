var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const Book = require('../models').Book;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const limit = 10;

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
  res.redirect("/books/page1")
});

/* GET home page. */
router.get('/books/', (req, res, next) => {
  res.redirect("/books/page1")
});

/* GET books */
router.get('/books/page:number', asyncHandler(async (req, res, next) => {
  let currentPage = req.params.number;
  let offset = 0 + (currentPage - 1) * limit;
  const pageTotal = Math.ceil(((await Book.findAll({order:[["title"]]})).length) / 10);
  const books = await Book.findAll({order:[["title"]], limit: limit, offset: offset,});
  let pages = [];
  for (i=1; i <= pageTotal; i++ ) {
    pages += i;
  }
  res.render('index', {books, pages} );
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
    res.redirect("/books/page1");
  } else {
    next(createError(404));
  }
}));




/* Search */

router.get('/books/page:number/:search', asyncHandler(async (req ,res) => {
  const value = req.params.search;
  let currentPage = req.params.number;
  const total = await Book.findAll({where: {
    [Op.or]: [
      {author: {
        [Op.like]: `%${value}%`
        }
      },
      {genre: {
        [Op.like]: `%${value}%`
        }
      },
      {title: {
        [Op.like]: `%${value}%`
        }
      },
      {year: {
        [Op.like]: `%${value}%`
        }
      },
    ]
    }});
    let pageTotal = Math.ceil((total.length) /10);
    let pages = [];
    let offset = 0 + (currentPage - 1) * limit;
    console.log(pageTotal);
    for (i=1; i <=pageTotal; i++ ) {
      pages += i;
    }
    const books = await Book.findAll({where: {
    [Op.or]: [
      {author: {
        [Op.like]: `%${value}%`
        }
      },
      {genre: {
        [Op.like]: `%${value}%`
        }
      },
      {title: {
        [Op.like]: `%${value}%`
        }
      },
      {year: {
        [Op.like]: `%${value}%`
        }
      },
    ]
    }, order:[["title"]], limit: limit, offset:offset });
    console.log(pages);
    res.render('index', {books, pages, value} );
  
}));

// Search post
router.post('/books/page:number/:search', asyncHandler(async (req ,res) => {
  search = req.body.search;
  res.redirect("/books/page"+ 1 + "/" + search);
}));

module.exports = router;
