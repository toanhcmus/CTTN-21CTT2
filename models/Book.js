const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  userID: String,
  title: String,
  type: String,
  category: String,
  link: String,
  statusBook: String,
  uploadDate: { type: Date, default: Date.now }
})

const Book = new mongoose.model("Book", bookSchema);

module.exports = Book;