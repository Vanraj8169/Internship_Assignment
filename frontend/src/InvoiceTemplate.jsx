import React from "react";
import { Button } from "@/components/ui/button";
const InvoiceTemplate = ({ formData }) => {
  const handlePrint = () => {
    window.print();
    const element = document.getElementById("print");
    element.style.display = "hidden";
  };
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">amazon.in</h1>
          <p className="text-sm text-gray-600">
            Tax Invoice/Bill of Supply/Cash Memo
          </p>
          <p className="text-sm text-gray-600">(Original for Recipient)</p>
        </div>
        <Button onClick={handlePrint} className="mt-4" id="print">
          Print / Save as PDF
        </Button>
      </div>

      {/* Seller and Buyer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Sold By:</h2>
          <p>{formData.seller.name}</p>
          <p>{formData.seller.address.line1}</p>
          <p>
            {formData.seller.address.city}, {formData.seller.address.state},{" "}
            {formData.seller.address.pincode}
          </p>
          <p>PAN No: {formData.seller.panNo}</p>
          <p>GST Registration No: {formData.seller.gstRegNo}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Billing Address:</h2>
          <p>{formData.billingDetails.name}</p>
          <p>{formData.billingDetails.address.line1}</p>
          <p>
            {formData.billingDetails.address.city},{" "}
            {formData.billingDetails.address.state},{" "}
            {formData.billingDetails.address.pincode}
          </p>
          <p>State/UT Code: {formData.billingDetails.statecode}</p>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Shipping Address:</h2>
        <p>{formData.shippingDetails.name}</p>
        <p>{formData.shippingDetails.address.line1}</p>
        <p>
          {formData.shippingDetails.address.city},{" "}
          {formData.shippingDetails.address.state},{" "}
          {formData.shippingDetails.address.pincode}
        </p>
        <p>State/UT Code: {formData.shippingDetails.stateCode}</p>
      </div>

      {/* Order and Invoice Details */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p>
            <span className="font-semibold">Order Number:</span>{" "}
            {formData.orderDetails.orderNo}
          </p>
          <p>
            <span className="font-semibold">Order Date:</span>{" "}
            {formData.orderDetails.orderDate}
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Invoice Number:</span>{" "}
            {formData.invoiceDetails.invoiceNo}
          </p>
          <p>
            <span className="font-semibold">Invoice Date:</span>{" "}
            {formData.invoiceDetails.invoiceDate}
          </p>
        </div>
      </div>

      {/* Invoice Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Sl No</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-right">Unit Price</th>
            <th className="py-2 px-4 text-right">Qty</th>
            <th className="py-2 px-4 text-right">Net Amount</th>
            <th className="py-2 px-4 text-right">Tax Rate</th>
            <th className="py-2 px-4 text-right">Tax Amount</th>
            <th className="py-2 px-4 text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => {
            const netAmount = item.unitPrice * item.quantity - item.discount;
            const taxAmount = (netAmount * item.taxRate) / 100;
            const totalAmount = netAmount + taxAmount;
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4 text-right">
                  {item.unitPrice.toFixed(2)}
                </td>
                <td className="py-2 px-4 text-right">{item.quantity}</td>
                <td className="py-2 px-4 text-right">{netAmount.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">{item.taxRate}%</td>
                <td className="py-2 px-4 text-right">{taxAmount.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2">
          <div className="flex justify-between border-b py-2">
            <span className="font-semibold">Total Net Amount:</span>
            <span>${formData.totalRow.totalNetAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="font-semibold">Total Tax:</span>
            <span>${formData.totalRow.totalTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Grand Total:</span>
            <span>${formData.totalRow.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-8">
        <p className="font-semibold">Amount in Words:</p>
        <p>{formData.amountInWords}</p>
      </div>

      {/* Signature */}
      <div className="flex justify-end">
        <div className="text-center">
          <img
            src={formData.signatureImage}
            alt="Signature"
            className="h-16 mb-2"
          />
          <p>Authorized Signatory</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-600">
        <p>
          Whether tax is payable under reverse charge -{" "}
          {formData.reverseCharge ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
