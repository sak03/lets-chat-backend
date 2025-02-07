const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/lets-chat`)
        .then(() => console.log("Successfully connected to DB"))
        .catch((err) => console.log("DB Connection Error: ", err))