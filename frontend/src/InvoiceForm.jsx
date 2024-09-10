import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, FileSignature } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import InvoiceTemplate from "./InvoiceTemplate";

const InvoiceForm = () => {
  const { toast } = useToast();
  const [showInvoice, setShowInvoice] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [formData, setFormData] = useState({
    seller: {
      name: "",
      address: { line1: "", city: "", state: "", pincode: "" },
      panNo: "",
      gstRegNo: "",
    },
    placeOfSupply: "",
    billingDetails: {
      name: "",
      address: { line1: "", city: "", state: "", pincode: "" },
      statecode: "",
    },
    shippingDetails: {
      name: "",
      address: { line1: "", city: "", state: "", pincode: "" },
      stateCode: "",
    },
    placeOfDelivery: "",
    orderDetails: { orderNo: "", orderDate: "" },
    invoiceDetails: { invoiceNo: "", invoiceDate: "", invoiceNotes: "" },
    reverseCharge: false,
    items: [
      { description: "", unitPrice: 0, quantity: 1, discount: 0, taxRate: 0 },
    ],
    totalRow: { totalNetAmount: 0, totalTax: 0, grandTotal: 0 },
    amountInWords: "",
    // signatureImage: "",
  });

  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const handleChange = (e, section, field, subfield = null) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [section]: subfield
        ? {
            ...prevData[section],
            [field]: {
              ...prevData[section][field],
              [subfield]: type === "checkbox" ? checked : value,
            },
          }
        : {
            ...prevData[section],
            [field]: type === "checkbox" ? checked : value,
          },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] =
      field === "description" ? value : Number(value);
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", unitPrice: 0, quantity: 1, discount: 0, taxRate: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotals = () => {
    let totalNetAmount = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const netAmount = item.unitPrice * item.quantity - item.discount;
      const taxAmount = (netAmount * item.taxRate) / 100;
      totalNetAmount += netAmount;
      totalTax += taxAmount;
    });

    const grandTotal = totalNetAmount + totalTax;

    setFormData((prevData) => ({
      ...prevData,
      totalRow: {
        totalNetAmount,
        totalTax,
        grandTotal,
      },
      amountInWords: numberToWords(grandTotal),
    }));
  };

  const numberToWords = (num) => {
    if (num === 0) return "zero";

    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    const teens = [
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "ten",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const thousands = ["", "thousand", "million", "billion", "trillion"];

    const convertHundreds = (n) => {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " hundred ";
        n %= 100;
      }
      if (n > 10 && n < 20) {
        str += teens[n - 11] + " ";
      } else {
        str += tens[Math.floor(n / 10)] + " ";
        str += ones[n % 10] + " ";
      }
      return str.trim();
    };

    let result = "";
    let i = 0;
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        result = convertHundreds(chunk) + " " + thousands[i] + " " + result;
      }
      num = Math.floor(num / 1000);
      i++;
    }

    return result.trim();
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET); // Replace with your Cloudinary upload preset

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`, // Replace YOUR_CLOUD_NAME with your Cloudinary cloud name
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        setSignatureUrl(url);
        setFormData({
          ...formData,
          signatureImage: url,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload signature. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting form data:", formData); // Log the form data being sent
      const response = await axios.post(
        "http://localhost:3000/generate-invoice",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response received:", response); // Log the entire response

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Invoice created successfully!",
        });
        // Optionally, reset the form or redirect the user
      } else {
        throw new Error(response.data.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error submitting form:", error); // Log any errors
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while creating the invoice.",
        variant: "destructive",
      });
    }
    setShowInvoice(true);
  };

  const renderAddressFields = (section, field) => (
    <>
      <Input
        placeholder="Address Line 1"
        value={formData[section][field].line1}
        onChange={(e) => handleChange(e, section, field, "line1")}
        className="mb-2"
      />
      <Input
        placeholder="City"
        value={formData[section][field].city}
        onChange={(e) => handleChange(e, section, field, "city")}
        className="mb-2"
      />
      <Input
        placeholder="State"
        value={formData[section][field].state}
        onChange={(e) => handleChange(e, section, field, "state")}
        className="mb-2"
      />
      <Input
        placeholder="Pincode"
        value={formData[section][field].pincode}
        onChange={(e) => handleChange(e, section, field, "pincode")}
      />
    </>
  );

  return (
    <div>
      {showInvoice ? (
        <InvoiceTemplate formData={formData} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto p-6 space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Create Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Seller Details</h3>
                  <Input
                    placeholder="Seller Name"
                    value={formData.seller.name}
                    onChange={(e) => handleChange(e, "seller", "name")}
                    className="mb-2"
                  />
                  {renderAddressFields("seller", "address")}
                  <Input
                    placeholder="PAN Number"
                    value={formData.seller.panNo}
                    onChange={(e) => handleChange(e, "seller", "panNo")}
                    className="mb-2 mt-2"
                  />
                  <Input
                    placeholder="GST Registration Number"
                    value={formData.seller.gstRegNo}
                    onChange={(e) => handleChange(e, "seller", "gstRegNo")}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Billing Details
                  </h3>
                  <Input
                    placeholder="Billing Name"
                    value={formData.billingDetails.name}
                    onChange={(e) => handleChange(e, "billingDetails", "name")}
                    className="mb-2"
                  />
                  {renderAddressFields("billingDetails", "address")}
                  <Input
                    placeholder="State Code"
                    value={formData.billingDetails.statecode}
                    onChange={(e) =>
                      handleChange(e, "billingDetails", "statecode")
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Shipping Name"
                value={formData.shippingDetails.name}
                onChange={(e) => handleChange(e, "shippingDetails", "name")}
                className="mb-2"
              />
              {renderAddressFields("shippingDetails", "address")}
              <Input
                placeholder="State Code"
                value={formData.shippingDetails.stateCode}
                onChange={(e) =>
                  handleChange(e, "shippingDetails", "stateCode")
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order & Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNo">Order Number</Label>
                  <Input
                    id="orderNo"
                    value={formData.orderDetails.orderNo}
                    onChange={(e) => handleChange(e, "orderDetails", "orderNo")}
                  />
                </div>
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDetails.orderDate}
                    onChange={(e) =>
                      handleChange(e, "orderDetails", "orderDate")
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    value={formData.invoiceDetails.invoiceNo}
                    onChange={(e) =>
                      handleChange(e, "invoiceDetails", "invoiceNo")
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDetails.invoiceDate}
                    onChange={(e) =>
                      handleChange(e, "invoiceDetails", "invoiceDate")
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="invoiceNotes">Invoice Notes</Label>
                <Textarea
                  id="invoiceNotes"
                  value={formData.invoiceDetails.invoiceNotes}
                  onChange={(e) =>
                    handleChange(e, "invoiceDetails", "invoiceNotes")
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-lg relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Discount"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(index, "discount", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Tax Rate (%)"
                      value={item.taxRate}
                      onChange={(e) =>
                        handleItemChange(index, "taxRate", e.target.value)
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Net Amount: $
                    {(item.unitPrice * item.quantity - item.discount).toFixed(
                      2
                    )}
                  </p>
                </div>
              ))}
              <Button onClick={addItem} className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  Total Net Amount: $
                  {formData.totalRow.totalNetAmount.toFixed(2)}
                </p>
                <p>Total Tax: ${formData.totalRow.totalTax.toFixed(2)}</p>
                <p className="font-bold">
                  Grand Total: ${formData.totalRow.grandTotal.toFixed(2)}
                </p>
                <p>Amount in Words: {formData.amountInWords}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="reverseCharge"
                  checked={formData.reverseCharge}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, reverseCharge: checked })
                  }
                />
                <Label htmlFor="reverseCharge">Reverse Charge</Label>
              </div>
              <div className="mt-4">
                <Label htmlFor="signatureUpload" className="block mb-2">
                  Signature Upload
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="signatureUpload"
                    type="file"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      document.getElementById("signatureUpload").click()
                    }
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Upload Signature
                  </Button>
                  {signatureUrl && (
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="h-12 border rounded p-1"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Submit Invoice
          </Button>
        </form>
      )}
    </div>
  );
};

export default InvoiceForm;
