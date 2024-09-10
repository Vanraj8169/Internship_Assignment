const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  seller: {
    name: { type: String, required: true },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    panNo: String,
    gstRegNo: String,
  },
  placeOfSupply: String,
  billingDetails: {
    name: {
      type: String,
      required: true,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    statecode: String,
  },
  shippingDetails: {
    name: {
      type: String,
      required: true,
    },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    stateCode: String,
  },
  placeOfDelivery: String,
  orderDetails: {
    orderNo: { type: String, required: true },
    orderDate: { type: Date, required: true },
  },
  invoiceDetails: {
    invoiceNo: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    invoiceNotes: String,
  },
  reverseCharge: { type: Boolean, default: false },
  items: [
    {
      description: String,
      unitPrice: Number,
      quantity: Number,
      discount: { type: Number, default: 0 },
      netAmount: Number,
      taxRate: Number,
      taxAmount: Number,
      totalAmount: Number,
    },
  ],
  totalRow: {
    totalNetAmount: Number,
    totalTax: Number,
    grandTotal: Number,
  },
  amountInWords: String,
  signatureImage: String,
});

// Pre-save hook to calculate invoice totals and tax amounts
invoiceSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.netAmount = item.unitPrice * item.quantity - item.discount;
    if (this.placeOfSupply === this.placeOfDelivery) {
      const halfTaxRate = item.taxRate / 2;
      item.taxAmount = item.netAmount * halfTaxRate;
      item.totalAmount = item.netAmount + item.taxAmount * 2;
    } else {
      item.taxAmount = item.netAmount * item.taxRate;
      item.totalAmount = item.netAmount + item.taxAmount;
    }
  });

  this.totalRow.totalNetAmount = this.items.reduce(
    (acc, item) => acc + item.netAmount,
    0
  );
  this.totalRow.totalTax = this.items.reduce(
    (acc, item) => acc + item.taxAmount,
    0
  );
  this.totalRow.grandTotal = this.items.reduce(
    (acc, item) => acc + item.totalAmount,
    0
  );

  // You can add a function here to convert `grandTotal` to words.
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
