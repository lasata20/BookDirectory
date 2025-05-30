const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../../models/dirModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => 
    console.log('DB connection successful'));

const books = JSON.parse(fs.readFileSync(`${__dirname}/books-simple.json`, 'utf-8')); //READ JSON FILE

const importData = async () => {
    try{
        await Book.create(books);
        console.log('Data loaded Successfully!!');
    } catch (err) {
      console.log(err);  
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Book.deleteMany();
        console.log('Data deleted Successfully!!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}