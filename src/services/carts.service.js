import { productModel } from "../dao/dbManagers/models/products.model.js";
import { cartsModel } from "../dao/dbManagers/models/carts.model.js";

const create = async (crt) => {
    const result = await cartsModel.create(crt);
    return result;
}

const getId = async (cid) => {
    const products = await cartsModel.findOne({ _id: cid }).lean();
    return products;
}

const erase = async (cid) => {
    const result = await cartsModel.deleteOne({ _id: cid });
    return result;
}

const getAll = async (cartIds) => {
    const carts = await cartsModel.find({ _id: { $in: cartIds } }).lean();
    return carts
}

const addProductToCart = async (cartId, prodId, quantity) => {
    const cartData = await cartsModel.findById(cartId);
    if (!cartData) {
        throw new Error('Cart not found');
    }

    // verifica si el campo products está definido
    if (!cartData.products) {
        cartData.products = [];
    }

    // busca si el producto ya está en el carrito
    const cartProductIndex = cartData.products.findIndex(p => p.product.equals(prodId));

    let updatedQuantity = quantity;

    // si el producto ya está en el carrito, actualiza su cantidad
    if (cartProductIndex !== -1) {
        cartData.products[cartProductIndex].quantity += quantity;
        updatedQuantity = cartData.products[cartProductIndex].quantity;
    }
    // si el producto no está en el carrito, agrégalo con la cantidad especificada
    else {
        cartData.products.push({ product: prodId, quantity });
    }

    await cartData.save();
    return { id: prodId, quantity: updatedQuantity };
}


const updateProductToCart = async (cartId, prodId, quantity) => {
    const cartData = await cartsModel.findById(cartId);
    if (!cartData) {
        throw new Error('Cart not found');
    }

    // verifica si el campo products está definido
    if (!prodId) {
        throw new Error('Product not found');
    }

    if (!cartData.products) {
        cartData.products = [];
    }

    // busca si el producto ya está en el carrito
    const cartProductIndex = cartData.products.findIndex(p => p.product.equals(prodId));

    let updatedQuantity = quantity;

    // si el producto ya está en el carrito, actualiza su cantidad
    if (cartProductIndex !== -1) {
        cartData.products[cartProductIndex].quantity += quantity;
        updatedQuantity = cartData.products[cartProductIndex].quantity;
    }
    // si el producto no está en el carrito, agrégalo con la cantidad especificada
    else {
        cartData.products.push({ product: prodId, quantity });
    }

    await cartData.save();
    return { id: prodId, quantity: updatedQuantity };
}


const updateCart = async (cartId, sort, page, limit) => {
    const cartData = await cartsModel.findById(cartId).populate('products.product');
    if (!cartData) {
        throw new Error('Cart not found');
    }

    // Ordenar los productos según la dirección especificada
    if (sort === 'asc') {
        // Ordenar los productos en orden ascendente según su cantidad
        cartData.products.sort((a, b) => a.quantity - b.quantity);
    } else if (sort === 'desc') {
        // Ordenar los productos en orden descendente según su cantidad
        cartData.products.sort((a, b) => b.quantity - a.quantity);
    }

    // Paginación
    page = parseInt(page) || 1; // Número de página actual
    limit = parseInt(limit) || 3; // Número de documentos por página
    const skip = (page - 1) * limit; // Número de documentos a omitir

    const products = cartData.products.map(p => ({
        id: p.product.id,
        quantity: p.quantity
    }));
    const paginatedProducts = products.slice(skip, skip + limit);
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
        status: 'success',
        payload: paginatedProducts,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
    };
}

const deleteProdsOneToCart = async (cartId, prodId, quantity) => {
    const cartData = await cartsModel.findById(cartId);
    if (!cartData) {
        throw new Error('Cart not found');
    }

    const product = await productModel.findById(prodId);
    if (!product) {
        throw new Error('Product not found');
    }

    // verifica si el campo products está definido
    if (!cartData.products) {
        cartData.products = [];
    }

    // busca si el producto ya está en el carrito
    const cartProductIndex = cartData.products.findIndex(p => p.product.equals(prodId));

    let remainingQuantity = 0;

    // si el producto ya está en el carrito, reduce su cantidad
    if (cartProductIndex !== -1) {
        cartData.products[cartProductIndex].quantity -= quantity;
        remainingQuantity = cartData.products[cartProductIndex].quantity;

        // si la cantidad es menor o igual a cero, elimina el producto del carrito
        if (cartData.products[cartProductIndex].quantity <= 0) {
        cartData.products.splice(cartProductIndex, 1);
        remainingQuantity = 0;
        }
    }
    else {
        throw new Error('Product not found in cart' );
    }

    await cartData.save();
    return remainingQuantity;
}

const deleteProdsToCart = async (cartId) => {
    const cartData = await cartsModel.findById(cartId);
    if (!cartData) {
        throw new Error('Cart not found');
    }

    // Vaciar el arreglo de productos del carrito
    cartData.products = [];

    // Actualizar el carrito en la base de datos
    await cartData.save();
}

export { create, getId, erase, getAll, addProductToCart, updateProductToCart, updateCart, deleteProdsOneToCart, deleteProdsToCart };