const mongoose=require('mongoose');
const{Schema}=mongoose;
var pedidoSchema=new Schema({
    cedula:{type: String},
    fechapedido:{type: String},
    estado:{type:String, default:'carrito'},
    cantidad:{type:Number,default:0},
});

module.exports=mongoose.model('Pedido',pedidoSchema);