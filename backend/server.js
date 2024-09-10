require("dotenv").config();
const express = require("express");
const connectDb = require("./db");
const cors = require("cors");
const app = express();
app.use(cors());
const PORT = process.env.PORT;
const invoiceGeneratorRoute = require("./routes/invoice.routes");
app.use(express.json());

app.use("/", invoiceGeneratorRoute);
app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on ${PORT}`);
});
