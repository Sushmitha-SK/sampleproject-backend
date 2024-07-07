const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');

require("dotenv").config();

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once("open", () => {
    console.log("MongoDB Connected");
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Expensia backend listening at ${port}`)
});

module.exports = app