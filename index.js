import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import validateJSON from "./middleware/JSON.middleware.js";
import cartsRouter from "./routes/carts.router.js";
import productsRouter from "./routes/products.router.js";
import viewsRouter from "./routes/views.router.js";
import connectToDB from "./utils/connectToDB.js";

const app = express();
const port = process.env.port || 8080;

const httpServer = app.listen(port, () => {});
export const io = new Server(httpServer);

// handlebars config
app.engine("handlebars", handlebars.engine());
app.set("views", "./views");
app.set("view engine", "handlebars");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(validateJSON); // To validate the JSON format in the request body
app.use(express.static("public"));

// database connection
await connectToDB();

// routes
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// error handling
app.use("/", (err, req, res, next) => {
  console.error(err.stack);
  return res
    .status(500)
    .send("An internal error occurred. Please try again later.");
});
