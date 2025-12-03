const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const db = require("./database");
const {Item, defaultItems} = require("./list_module/item");
const List = require("./list_module/list");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.getInstance();

app.use(async (req, res, next) => {
    try {
        // Buscamos todas las listas, pero solo queremos el campo 'name'
        const foundLists = await List.find({}, 'name');

        // 'res.locals' es una forma de pasar variables a TODAS las plantillas EJS automáticamente
        res.locals.savedLists = foundLists;

        next(); // Continúa hacia la ruta solicitada (ej: /, /about, etc.)
    } catch (err) {
        console.error("Error cargando el menú:", err);
        res.locals.savedLists = []; // Si falla, pasamos una lista vacía para que no rompa la web
        next();
    }
});

// --- RUTAS ---

app.get("/", async (req, res) => {
    try {
        const foundItems = await Item.find({});

        if (foundItems.length === 0) {
            await Item.insertMany(defaultItems);
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error recuperando las taeas.");
    }
});

app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    try {
        const foundList = await List.findOne({ name: customListName });

        if (!foundList) {
            // Crear nueva lista
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            await list.save();
            res.redirect("/" + customListName);
        } else {
            // Mostrar lista existente
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error buscando la lista personalizada.");
    }
});

app.post("/", async (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({ name: itemName });

    if (listName === "Today") {
        await item.save();
        res.redirect("/");
    } else {
        try {
            const foundList = await List.findOne({ name: listName });
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error guardando el item en la lista personalizada.");
        }
    }
});

app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    try {
        if (listName === "Today") {
            await Item.findByIdAndDelete(checkedItemId);
            res.redirect("/");
        } else {
            await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedItemId } } }
            );
            res.redirect("/" + listName);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error borrando el item.");
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

// --- SERVIDOR ---

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server started on port", PORT);
});