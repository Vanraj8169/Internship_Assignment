const Invoice = require("../model/invoice.model");

const createInvoice = async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    await Invoice.deleteMany();
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {createInvoice, deleteInvoice};
