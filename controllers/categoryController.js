import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

//CREAR CATEGORIA OKEY :)
export const createCategoryController = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(401).send({ message: "El Nombre es Requerido" });
    }
    const existingCategory = await categoryModel.findOne({ nombre });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Esta Categoria ya Existe",
      });
    }
    const category = await new categoryModel({
      nombre,
      slug: slugify(nombre),
    }).save();
    res.status(201).send({
      success: true,
      message: "Nueva Categoria Creada Correctamente",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error en la Categoria",
    });
  }
};

//ACTUALIZACION DE CATEGORIA OKEY :)
export const updateCategoryController = async (req, res) => {
  try {
    const { nombre } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { nombre, slug: slugify(nombre) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      messsage: "Categoria actualiza correctamente",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Hubo un error mientras se actulizaba la Categoria",
    });
  }
};

//OBTENER TODAS LAS CATEGORIAS OKEY :)
export const categoryControlller = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "Lista de Todas las categorias",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Hubo un error mientras se Obtenia Todas las Categorias",
    });
  }
};

// single category
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Categoria SIMPLE Obtenida Correctamente",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Hubo un error Mientras se obtenia La Categoria",
    });
  }
};

//BORRADO DE CATEGORIA OKEY :)
export const deleteCategoryCOntroller = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Categoria Borrada Correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Hubo un error mientras se Borraba la Categoria",
      error,
    });
  }
};
