const mongoose = require('mongoose');
const { Schema } = mongoose;

var sitioSchema=new Schema({
    codigo: {type: Number, required: true},
    nombre: {type: String, required: true},
    descripcion: {type: String, required:true},
    repartidores: {type: Number, required:true},
    direccion: {type: String, required:true},
    coordenadas: {type: String, required:true}
});

module.exports = mongoose.model('Sitio',sitioSchema);