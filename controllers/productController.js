import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//CREACION DE PRODUCTO OKEY :)
export const createProductController = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, cantidad } = req.fields;
    const { foto } = req.files;
    //alidation
    switch (true) {
      case !nombre:
        return res.status(500).send({ error: "El Nombre es Requerido" });
      case !descripcion:
        return res.status(500).send({ error: "La descripcion es Requerida" });
      case !precio:
        return res.status(500).send({ error: "El Precio es Requerido" });
      case !categoria:
        return res.status(500).send({ error: "La Categoria es Requerida" });
      case !cantidad:
        return res.status(500).send({ error: "La Cantidad es Requerida" });
      case foto && foto.size > 1000000:
        return res.status(500).send({
          error: "La foto es requerida y tiene que pesar menos de 1mb",
        });
    }

    const products = new productModel({ ...req.fields, slug: slugify(nombre) });
    if (foto) {
      products.foto.data = fs.readFileSync(foto.path);
      products.foto.contentType = foto.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Producto Creado Correctamente",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Hubo un Error mientras se Creaba el Producto",
    });
  }
};

//Obtencion de Productos OKEY :)
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("categoria")
      .select("-foto")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "Todos los Productos",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error en la Obtencion de los Productos",
      error: error.message,
    });
  }
};

//Obtencion de un Producto Simple OKEY :)
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-foto")
      .populate("categoria");
    res.status(200).send({
      success: true,
      message: "Unico producto Obtenido",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error al obtener un Producto Unico",
      error,
    });
  }
};

//OBTENCION DE LA FOTO DEL  PRODUCTO OKEY :)
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("foto");
    if (product.foto.data) {
      res.set("Content-type", product.foto.contentType);
      return res.status(200).send(product.foto.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error en la obtencion de la foto",
      error,
    });
  }
};

//BORRADO DEL PRODUCTO OKEY :)
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("foto");
    res.status(200).send({
      success: true,
      message: "Producto borrado Correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error Mientras se Borraba el Producto",
      error,
    });
  }
};

//ACTUALIZACION DE PRODUCTO OKEY :)
export const updateProductController = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, cantidad, envio } =
      req.fields;
    const { foto } = req.files;

    switch (true) {
      case !nombre:
        return res
          .status(500)
          .send({ error: "El nombre del Producto es Requerido" });
      case !descripcion:
        return res.status(500).send({ error: "La Descripcion es Requerida" });
      case !precio:
        return res.status(500).send({ error: "El Precio es Requerido" });
      case !categoria:
        return res.status(500).send({ error: "La Categoria es Requerida" });
      case !cantidad:
        return res.status(500).send({ error: "La Cantidad es Requerida" });
      case foto && foto.size > 1000000:
        return res.status(500).send({
          error: "La foto es requerida y tiene que pesar menos de 1mb",
        });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(nombre) },
      { new: true }
    );
    if (photo) {
      products.foto.data = fs.readFileSync(foto.path);
      products.foto.contentType = foto.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Producto Actualizado Correctamente",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Hubo un error mientras se Actulizaba el Producto",
    });
  }
};

// FILTROS OKEY :)
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.categoria = checked;
    if (radio.length) args.precio = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Hubo un error mientras se Filtraba los Productos",
      error,
    });
  }
};

// CONTAR LOS PRODUCTOS OKEY :)
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Hubo un error en la Cuenta de los productos",
      error,
      success: false,
    });
  }
};

//LISTA DE PRODUCTOS BASADO POR PAGINA OKEY :)
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-foto")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Hubo un error en el Control por Pagina",
      error,
    });
  }
};

//BUSQUEDA DE PRODUCTOS OKEY :)
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { nombre: { $regex: keyword, $options: "i" } },
          { descripcion: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-foto");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Hubo un error en la Busqueda del Producto por el API",
      error,
    });
  }
};

//PRODUCTOS SIMILARES OKEY :)
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        categoria: cid,
        _id: { $ne: pid },
      })
      .select("-foto")
      .limit(3)
      .populate("categoria");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Hubo un error Mientras se Obtenia los Productos Relacionados",
      error,
    });
  }
};

//OBTENER PRODUCTOS POR CATEGORIA OKEY :)
export const productCategoryController = async (req, res) => {
  try {
    const categoria = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel
      .find({ categoria })
      .populate("categoria");
    res.status(200).send({
      success: true,
      categoria,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Hubo un error mientras se Obtenia los Productos",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    console.log("esta es cart:", cart);
    let total = 0;
    cart.map((i) => {
      total += i.precio;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            productos: cart,
            pago: result,
            comprador: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
