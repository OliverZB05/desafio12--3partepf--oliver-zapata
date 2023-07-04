import passport from 'passport';
import { create, getId, erase, getAll,  addProductToCart, updateProductToCart, updateCart, deleteProdsOneToCart, deleteProdsToCart } from "../services/carts.service.js";
import { cartsModel } from "../dao/dbManagers/models/carts.model.js";
import { productModel } from "../dao/dbManagers/models/products.model.js";

//======== { getAll_Carts / mostrar todos los carritos } ========
const getAll_Carts = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({ status: "error", error: "Unauthorized" });
        }
        req.user = user;
        try {
            // Obtenga solo los carritos asociados con el usuario actual
            const cartIds = req.user.carts.map(c => c.cart);
            const carts = await getAll(cartIds);

            // Transforma la respuesta
            const transformedCarts = carts.map(cart => {
                cart.products = cart.products.map(p => ({
                    id: p.product,
                    quantity: p.quantity
                }));
                return cart;
            });
            

            res.send({ status: 'success', payload: transformedCarts });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: error.message });
        }
    })(req, res, next);
};
//======== { getAll_Carts / mostrar todos los carritos } ========

//======== { getID_Carts / mostrar por ID los carritos } ========
const getID_Carts = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({ status: "error", error: "Unauthorized" });
        }
        req.user = user;
        const { cid } = req.params;
        try {
            // Compruebe si el carrito pertenece al usuario actual.
            const cartIds = req.user.carts.map(c => c.cart.toString());
            if (!cartIds.includes(cid)) {
                return res.status(404).send({ error: 'Cart not found' });
            }

            // Consigue el carrito
            const cart = await getId(cid);
            if (!cart) {
                console.log("No existe: " + cart);
                return res.status(404).send({ error: 'Cart not found' });
            }

            // Transforma la respuesta
            const transformedCart = cart.products.map(p => ({
                id: p.product,
                quantity: p.quantity
            }));

            res.send({ status: "success", payload: [cart] });
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "error", error });
        }
    })(req, res, next);
};
//======== { getID_Carts / mostrar por ID los carritos } =======

//======== { post_Carts / crear los carritos } =======
const post_Carts = async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        console.log('user:', user); // Agrega esta línea para imprimir el valor de user
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({ status: "error", error: "Unauthorized" });
        }
        req.user = user;
        const { cart } = req.body;
        try {
            // Crea el carrito
            const result = await create({ cart });

            // Asociar el carrito con el usuario actual
            req.user.carts.push({ cart: result._id });
            await req.user.save();

            res.send({ status: "success", payload: result });
        } catch (error) {
            res.status(500).send({ status: "error", error });
        }
    })(req, res, next);
};
//======== { post_Carts / crear los carritos } =======

//======== { postProds_Carts / pasar productos a los carritos } =======
const postProds_Carts = async (req, res) => {
    const cartId = req.params.cid;
    const prodId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const result = await addProductToCart(cartId, prodId, quantity);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};
//======== { postProds_Carts / pasar productos a los carritos } =======

//======== { put_Carts / actualizar los carritos } =======
const put_Carts = async (req, res) => {
    const cartId = req.params.cid;
    const sort = req.query.sort;

    try {
        const result = await updateCart(cartId, sort, req.query.page, req.query.limit);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};
//======== { put_Carts / actualizar los carritos } =======

//======== { putProds_Carts / actualizar los productos de los carritos } =======
const putProds_Carts = async (req, res) => {
    const cartId = req.params.cid;
    const prodId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const result = await updateProductToCart(cartId, prodId, quantity);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
};
//======== { putProds_Carts / actualizar los productos de los carritos } =======

//======== { deleteProdsOne_Carts / borrar un solo producto del carrito según su ID } =======
const deleteProdsOne_Carts = async (req, res) => {

    const cartId = req.params.cid;
    const prodId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
    const remainingQuantity = await deleteProdsOneToCart(cartId, prodId, quantity);
    res.send({ status: 'success', payload: { id: prodId, quantity: remainingQuantity } });
    }
    catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
    }
};
//======== { deleteProdsOne_Carts / borrar un solo producto del carrito según su ID } =======

//======== { delete_Carts / eliminar un carrito } =======
const delete_Carts = async (req, res) => {
    const { cid } = req.params; 

    try {
        const result = await erase(cid);
        res.send({ status: "success", payload: result });
    }
    catch (error){
        console.log(error)
        res.status(500).send({ status: "error", error});
    }
};
//======== { delete_Carts / eliminar un carrito } =======

//======== { deleteProds_Carts / borrar todos los productos de un carrito } =======
const deleteProds_Carts = async (req, res) => {
    const cartId = req.params.cid;

    try {
    const result = await deleteProdsToCart(cartId);

    // Enviar respuesta al cliente
    res.send({ status: 'success', payload: { products: [] } });
    } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
    }
};
//======== { deleteProds_Carts / borrar todos los productos de un carrito } =======

export { getAll_Carts, getID_Carts, post_Carts, postProds_Carts, put_Carts, putProds_Carts, deleteProdsOne_Carts, delete_Carts, deleteProds_Carts };