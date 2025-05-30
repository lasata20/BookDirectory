const mongoose = require('mongoose');


const dirSchema = new mongoose.Schema({
    name: {
        type:  String,
        required: [true, 'Name required'],
        unique: true
    },
    author: {
        type: String,
        required: [true, 'Author required']
    },   
    genre: {
        type: String
    },    
    description: {
        type: String
    },
    slug: {
        type: String
    },
    image: {
        type: String
    }
});

dirSchema.index({ slug: 1 });

const Book = mongoose.model('Book', dirSchema);

module.exports = Book;