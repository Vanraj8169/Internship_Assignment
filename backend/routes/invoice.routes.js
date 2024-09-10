const express = require("express");
const {
  createInvoice,
  deleteInvoice,
} = require("../controller/invoiceController");
const router = express.Router();

router.post("/generate-invoice", createInvoice);
router.delete("/delete", deleteInvoice);
module.exports = router;
