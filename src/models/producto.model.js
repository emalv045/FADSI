const mongoose = require('mongoose');
const { Schema } = mongoose;

var productoSchema=new Schema({
    codigo: {type: Number},
    id: {type: Number},
    nombre: {type: String},
    descripcion: {type: String},
    precio: {type: Number},
});

module.exports = mongoose.model('Producto',productoSchema);