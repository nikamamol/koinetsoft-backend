const mongoose = require("mongoose");
const InvoiceSchema = new mongoose.Schema({
    logo: String,
    date: String,
    invoiceNumber: String,
    clientName: String,
    clientAddress: String,
    items: [{
        qty: Number,
        description: String,
        details: String,
        price: Number,
        total: Number,
    }, ],
    subTotal: Number,
    tax: Number,
    grandTotal: Number,
    paymentMethod: String,
    terms: String,
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
module.exports = Invoice;