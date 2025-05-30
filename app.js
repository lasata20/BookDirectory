const path = require('path');
const express = require ('express');
const morgan = require ('morgan');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const dirRouter = require('./routes/dirRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));

}
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    // console.log(req.cookies);
    next();
})


app.use('/', viewRouter);
app.use('/api/v1/books', dirRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`${req.originalUrl} not found.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
