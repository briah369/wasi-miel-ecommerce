import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    correo_electronico: {
      type: String,
      required: true,
      unique: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    direccion: {
      type: {},
      required: true,
    },
    respuesta: {
      type: String,
      required: true,
    },
    rol: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("usuarios", userSchema);
