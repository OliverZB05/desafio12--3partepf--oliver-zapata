import { productModel } from "../dao/dbManagers/models/products.model.js";

const get_Products = async (filter, options) => {
    const products = await productModel.find(filter, null, options);
    return products;
}

const getID_Products = async (pid) => {
    const products = await productModel.find({ _id: pid });
    return products.map(prod => prod.toObject());
}

const post_Products = async (prod) => {
    const result = await productModel.create(prod);
    return result;
}

const put_Products = async (pid, prod) => {
    const result = await productModel.updateOne({ _id: pid }, prod);
    return result;
}

const delete_Products = async (pid) => {
    const result = await productModel.deleteOne({ _id: pid });
    return result;
}

export { get_Products, getID_Products, post_Products, put_Products, delete_Products };