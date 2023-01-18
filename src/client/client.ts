import express from 'express';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
require('dotenv').config()
import pg from 'pg';

class Client {

    port = '3000'
    app = express();

    db = new pg.Client({
        host: process.env.DB_HOST,
        // @ts-ignore
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    })
    viewPath = path.join(__dirname, '..', 'views');
    routePath = (name: string) => `../routes/${name}`;

    debugApp = (msg: String) => console.log('\x1b[36m[DEBUG]\x1b[0m\x1b[33m social-network-api:app\x1b[0m ' + msg)
    debugDb = (msg: String) => console.log('\x1b[36m[DEBUG]\x1b[0m\x1b[33m social-network-api:db\x1b[0m ' + msg)

    public init() {
        this.initDB()
        this.app.set('views', this.viewPath);
        this.app.set('view engine', 'ejs');

        this.app.use(logger('dev'))
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, 'public')));

        this.app.get('/', (req, res, next) => {
            require(this.routePath('main')).route(req, res, next)
            // res.render('main', { title: 'Express' });
        });
        this.routes();

        this.app.use(function(req, res, next) {
            next(createError(404));
        });

        this.app.use(function(err, req, res, next) {
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            res.status(err.status || 500);
            res.render('error');
        });

        this.startSite();

    }

    private initDB() {
        this.db.connect(err => {
            if (err) {
                this.debugApp('connection error' + err.stack)
            } else {
                this.debugDb('Database connected')
            }
        })
    }

    private startSite() {
        this.app.listen(this.port,() => {
            this.debugApp(`Server start`)
            this.debugApp(`url: http://localhost:${this.port}/`)
        });
    }


    private routes() {
        //mainRouter
        this.app.get('/api', (req, res, next) => {
            require(this.routePath('main')).route(req, res, next)
        });
        //usersRouter
        this.app.get('/api/users', (req, res, next) => {
            require(this.routePath('users')).route(req, res, next, this.db)
        });
    }
}

export default Client;