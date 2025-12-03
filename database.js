const mongoose = require('mongoose');
require('dotenv').config(); // Carga las variables del .env a process.env

class Database {
    constructor() {
        this.connection = null;
    }

    getInstance() {
        if (!this.connection) {
            this.connection = this._connect();
        }
        return this.connection;
    }

    async _connect() {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error("ERROR: MONGODB_URI not found in .env file");
            process.exit(1);
        }

        try {
            await mongoose.connect(uri);
            console.log();
        } catch (error) {
            console.error("ERROR: Could not connect to MongoDB", error);
            process.exit(1);
        }
    }
}

module.exports = new Database();