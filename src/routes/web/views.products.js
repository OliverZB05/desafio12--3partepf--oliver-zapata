import {Router} from 'express';
import { productModel } from "../../dao/dbManagers/models/products.model.js";
import { cartsModel } from "../../dao/dbManagers/models/carts.model.js";
import passport from 'passport';

const router = Router();

// Función para obtener productos con paginación
async function getProducts(page = 1, limit = 3) {
    const skip = (page - 1) * limit;
    const products = await productModel.find().skip(skip).limit(limit);
    const productsArray = products.map(product => product.toObject());
    const totalProducts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    return {
    products: productsArray,
    page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null
    };
}

// Ruta para obtener productos con autenticación JWT
router.get('/products', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    const data = await getProducts(page, limit);
    if (req.user) {
    data.user = req.user.toObject();
    data.user.name = `${data.user.first_name} ${data.user.last_name}`;
    } else {
    data.user = null;
    }
    res.render("products", data);
});

// Función para obtener el carrito de compras con paginación
async function getCart(cartId, page = 1, limit = 3) {
    const skip = (page - 1) * limit;
    const cart = await cartsModel.findById(cartId).populate('products.product');
    if (!cart) {
    throw new Error('Cart not found');
    }

    const products = cart.products.map(p => ({
    id: p.product.id,
    title: p.product.title,
    price: p.product.price,
    quantity: p.quantity
    }));
    const paginatedProducts = products.slice(skip, skip + limit);
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    return {
    products: paginatedProducts,
    page,
    totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null
    };
}

// Ruta para obtener el carrito de compras
router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    try {
        const data = await getCart(cartId, page, limit);
        res.render("cart", data);
        } catch (error) {
        res.status(404).send({ error: error.message });
        }
});

export default router;
export {getProducts};
export {getCart};

