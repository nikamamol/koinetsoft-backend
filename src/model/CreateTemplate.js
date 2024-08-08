const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    template_title: { type: String, required: true },
    logo: { type: String, required: true },
    banner: { type: String, required: true },
    form_type: { type: String, required: true },
    form_link: { type: String, required: true },
    receive_comminication: { type: String, required: true },
    document: { type: String, required: true },
    html_content: { type: String, required: false },
});

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;