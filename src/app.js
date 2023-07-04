//========={ Dependencias }=========
import express from 'express';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import initializePassport from './config/passport.config.js';
import passport from 'passport';
import flash from 'connect-flash';
import bodyParser from 'body-parser';
//========={ Dependencias }=========

// Importar el archivo config.js
import config from './config/config.js';

// Conectar a la base de datos MongoDB
mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//========={ Dirname }=========
import __dirname from './utils.js';
//========={ Dirname }=========

//========={ Routers }=========
import productsRouter from './routes/api/products.router.js';
import cartsRouter from './routes/api/carts.router.js';
import viewsProductRouter from './routes/web/views.products.js';
import sessionsRouter from './routes/api/sessions.router.js';
import viewsRouter from './routes/web/views.router.js';
//========={ Routers }=========

import { Server } from "socket.io";
import { getProducts } from './routes/web/views.products.js';
import { getCart } from './routes/web/views.products.js';

const app = express();

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(flash());

const hbs = exphbs.create({
helpers: {
debug: function (value) {
console.log("Current Context");
console.log("====================");
console.log(this);

if (value) {
console.log("Value");
console.log("====================");
console.log(value);
}
},
},
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.set("view engine", "handlebars");
app.use(express.static(`${__dirname}/rendered/public`));  // Aquí se especifica el nuevo directorio del js de las vistas
app.set('views', `${__dirname}/rendered/views`); // Aquí se especifica el nuevo directorio de vistas

app.use(session({
    secret: 'Coder39760',
    resave: true,
    saveUninitialized: true
}))


//========={ Inicialización de passport }=========
initializePassport();
app.use(passport.initialize());
app.use(passport.session());
//========={ Inicialización de passport }=========


//========={ Usando de routers }=========
app.use("/", viewsProductRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);
//========={ Usando de routers }========


//========={ Usando socket.io }========
const server = app.listen(8080,()=>console.log("Listening on 8080"));
const io = new Server(server);

app.on('cartUpdated', async cartId => {
const productsData = await getProducts();
io.emit('products', productsData.products);

const cartData = await getCart(cartId);
io.emit('cart', cartData.products);
});

app.set('socketio', io);
io.sockets.setMaxListeners(20);
//========={ Usando socket.io }========

