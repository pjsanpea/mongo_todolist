const mongoose = require("mongoose");

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please check your data entry, no name specified!"]
    }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Bienvenido a tu ToDo List!" });
const item2 = new Item({ name: "Dale al botón + para añadir una tarea." });
const item3 = new Item({ name: "<-- Marca la casilla para borrar." });

const defaultItems = [item1, item2, item3];

module.exports = { Item, itemsSchema, defaultItems };