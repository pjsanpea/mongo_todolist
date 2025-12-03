const mongoose = require("mongoose");
const {itemsSchema} = require("./item");

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

module.exports = List;