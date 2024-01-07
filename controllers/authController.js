import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";
//CONTROLADOR DE REGISTRO OKEY :)
export const registerController = async (req, res) => {
  try {
    const {
      nombre,
      correo_electronico,
      contraseña,
      telefono,
      direccion,
      respuesta,
    } = req.body;
    //validations
    if (!nombre) {
      return res.send({ error: "El nombre es requerido" });
    }
    if (!correo_electronico) {
      return res.send({ message: "El correo es requerido" });
    }
    if (!contraseña) {
      return res.send({ message: "La contraseña es requerida" });
    }
    if (!telefono) {
      return res.send({ message: "El telefono es requerida" });
    }
    if (!direccion) {
      return res.send({ message: "La direccion es requerida" });
    }
    if (!respuesta) {
      return res.send({ message: "La pregunta es requerida" });
    }

    const exisitingUser = await userModel.findOne({ correo_electronico });

    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Ya esta registrado porfavor Inicie Sesión",
      });
    }
    //register user
    const hashedPassword = await hashPassword(contraseña);
    //save
    const user = await new userModel({
      nombre,
      correo_electronico,
      telefono,
      direccion,
      contraseña: hashedPassword,
      respuesta,
    }).save();

    res.status(201).send({
      success: true,
      message: "Usuario Registrado Correctamente",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      message: "Hubo un error en el Registro",
      error,
    });
  }
};

//CONTROLADOR LOGIN OKEY:)
export const loginController = async (req, res) => {
  try {
    const { correo_electronico, contraseña } = req.body;
    //validation
    if (!correo_electronico || !contraseña) {
      return res.status(404).send({
        success: false,
        message: "Contraseña o Correo electronico Invalido",
      });
    }
    //check user
    const user = await userModel.findOne({ correo_electronico });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Correo Electronico no Registrado",
      });
    }
    const match = await comparePassword(contraseña, user.contraseña);
    if (!match) {
      return res.status(404).send({
        success: false,
        message: "Contraseña Incorrecta",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Inicio de Sesión Correcto",
      user: {
        _id: user._id,
        name: user.nombre,
        email: user.correo_electronico,
        phone: user.telefono,
        address: user.direccion,
        role: user.rol,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error al Iniciar Sesión",
      error,
    });
  }
};

//CONTROLADOR DE REINICIO DE CONTRASEÑA OKEY :)

export const forgotPasswordController = async (req, res) => {
  try {
    const { correo_electronico, respuesta, newPassword } = req.body;
    if (!correo_electronico) {
      res.status(400).send({ message: "El Correo Electronico es Requerido" });
    }
    if (!respuesta) {
      res.status(400).send({ message: "La Respuesta es Requerida" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "La Nueva Contraseña es Requerida" });
    }
    //check
    const user = await userModel.findOne({ correo_electronico, respuesta });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Correo Electronico o Respuesta Incorrecta",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { contraseña: hashed });
    res.status(200).send({
      success: true,
      message: "Contraseña Reiniciada Correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Algo Salio Mal",
      error,
    });
  }
};

//CONTROLADOR TEST OKEY :)
export const testController = (req, res) => {
  try {
    res.send("Rutas Protejidas");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//ACTUALIZACION DE PERFIL OKEY :)
export const updateProfileController = async (req, res) => {
  try {
    const { nombre, correo_electronico, contraseña, direccion, telefono } =
      req.body;
    const user = await userModel.findById(req.user._id);

    if (contraseña && contraseña.length < 6) {
      return res.json({
        error:
          "La Contraseña es Requerida y tiene que tner 6 caracteres de Longitud",
      });
    }
    const hashedPassword = contraseña
      ? await hashPassword(contraseña)
      : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        nombre: nombre || user.nombre,
        contraseña: hashedPassword || user.contraseña,
        correo_electronico: correo_electronico || user.correo_electronico,
        telefono: telefono || user.telefono,
        direccion: direccion || user.direccion,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Perfil Actualizado Correctamente",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Hubo un Error mientras la Actulizacion del Perfil",
      error,
    });
  }
};

//CONTROLADOR DE ORDENES - CLIENTE OKEY :)
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ comprador: req.user._id })
      .populate("productos", "-foto")
      .populate("comprador", "nombre");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

export const getAllProductsForOrdenController = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orden = await orderModel
      .findById(orderId)
      .populate("productos", "-foto")
      .populate("comprador"); // Poblar el campo comprador para obtener los detalles del comprador

    if (!orden) {
      return res
        .status(404)
        .json({ success: false, message: "Orden no encontrada" });
    }

    const ordenProducts = orden.productos;
    const buyerId = orden.comprador._id; // Obtener directamente el _id del comprador

    res.json({ success: true, products: ordenProducts, compradorId: buyerId });
  } catch (error) {
    console.error("Error al obtener productos de la orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos de la orden",
      error,
    });
  }
};

//CONTROLADOR DE ORDENES DEL ADMIN OKEY :)
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({
        path: "productos",
        select: "-foto",
      })
      .populate({
        path: "comprador",
        select: "nombre direccion", // Seleccionar nombre y dirección del comprador
      })
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error mientras se Obtenia las Ordenes",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estado } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { estado },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error mientras de Actualizaban las Ordenes",
      error,
    });
  }
};
