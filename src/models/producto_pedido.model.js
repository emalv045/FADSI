const mongoose=require('mongoose');
const{Schema}=mongoose;
var pedidoSchema=new Schema({
    idpedido:{type: String},
    idproducto:{type: Number},
    nombre:{type:String},
    precio:{type: Number}
});

module.exports=mongoose.model('Producto_Pedido',pedidoSchema);