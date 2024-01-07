import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Conectado a la base de datos MongoDB ${conn.connection.host}`.bgMagenta
        .white
    );
  } catch (error) {
    console.log(`Hubo un error en la Conexion ${error}`.bgRed.white);
  }
};

export default connectDB;
