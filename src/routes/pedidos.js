const router=require('express').Router();
const {isAuthenticated}= require('../helpers/autenticacion');

// Require esquema
const Pedido=require('../models/pedido.model');
const Producto_Pedido=require('../models/producto_pedido.model');


// Gestion de pedidos Cliente

router.get('/usuario/carrito',isAuthenticated,async (req,res)=> {
    var listaProductos_Pedidos=[];
    const usuario=res.locals.usuarioLog;
    const Pedidos=await Pedido.find({cedula:usuario.cedula,estado:'carrito'});
    for (var i=0;i<Pedidos.length;i++){ 
        const Producto_Pedidos=await Producto_Pedido.find({idpedido:Pedidos[i].id});
        var Total=0
        for(var x=0;x<Producto_Pedidos.length;x++){
            Total+=Producto_Pedidos[x].precio;
        }
        var P_L={pedido:Pedidos[i],productos:Producto_Pedidos,total:Total}
        listaProductos_Pedidos.push(P_L);
    }
    res.render('usuarios/pedidos/carrito',{listaProductos_Pedidos});

});

router.get('/usuario/carrito/eliminar/Pedido/:id',isAuthenticated,async (req,res)=> {
    await Pedido.findByIdAndRemove(req.params.id);
    await Producto_Pedido.deleteMany({idpedido:req.params.id});
    res.redirect('/usuario/carrito');

});

router.get('/usuario/carrito/eliminar/Producto/:id',isAuthenticated,async (req,res)=> {
    await Producto_Pedido.findByIdAndRemove(req.params.id);
    res.redirect('/usuario/carrito');
});

router.get('/usuario/carrito/procesar/:id',isAuthenticated,async (req,res)=> {
    const fecha=new Date();
    await Pedido.findByIdAndUpdate(req.params.id,{estado:'espera',fechapedido:fecha.toJSON().split('T')[0]});
    res.redirect('/usuario/carrito');
});


router.get('/usuario/proceso',isAuthenticated,async (req,res)=> {
    var listaProductos_Pedidos=[];
    const usuario=res.locals.usuarioLog;
    const Pedidos=await Pedido.find({idusuario:usuario.id,estado:'espera'});
    for (var i=0;i<Pedidos.length;i++){ 
        const Producto_Pedidos=await Producto_Pedido.find({idpedido:Pedidos[i].id});
        var Total=0
        for(var x=0;x<Producto_Pedidos.length;x++){
            Total+=Producto_Pedidos[x].precio;
        }
        var P_L={pedido:Pedidos[i],productos:Producto_Pedidos,total:Total}
        listaProductos_Pedidos.push(P_L);
    }
    res.render('usuarios/pedidos/proceso',{listaProductos_Pedidos});

});

router.get('/usuario/procesado',isAuthenticated,async (req,res)=> {
    var listaProductos_Pedidos=[];
    const usuario=res.locals.usuarioLog;
    const Pedidos=await Pedido.find({idusuario:usuario.id,estado:'procesado'});
    for (var i=0;i<Pedidos.length;i++){ 
        const Producto_Pedidos=await Producto_Pedido.find({idpedido:Pedidos[i].id});
        var Total=0
        for(var x=0;x<Producto_Pedidos.length;x++){
            Total+=Producto_Pedidos[x].precio;
        }
        var P_L={pedido:Pedidos[i],productos:Producto_Pedidos,total:Total}
        listaProductos_Pedidos.push(P_L);
    }
    res.render('usuarios/pedidos/procesados',{listaProductos_Pedidos});

});


// Gestion de pedidos Adminsitracion

router.get('/administracion/proceso',isAuthenticated,async (req,res)=> {
    var listaProductos_Pedidos=[];
    const Pedidos=await Pedido.find({estado:'espera'});
    for (var i=0;i<Pedidos.length;i++){ 
        const Producto_Pedidos=await Producto_Pedido.find({idpedido:Pedidos[i].id});
        var P_L={pedido:Pedidos[i],productos:Producto_Pedidos}
        listaProductos_Pedidos.push(P_L);
    }
    res.render('administracion/pedidos/proceso',{listaProductos_Pedidos});
});

router.get('/administracion/procesar/:id',isAuthenticated,async (req,res)=> {

    const pedido=await Pedido.findByIdAndUpdate(req.params.id,{estado:'procesado'});
    res.redirect('/administracion/proceso');
});

router.get('/administracion/procesados',isAuthenticated,async (req,res)=> {
    var listaProductos_Pedidos=[];
    const Pedidos=await Pedido.find({estado:'procesado'});
    for (var i=0;i<Pedidos.length;i++){ 
        const Producto_Pedidos=await Producto_Pedido.find({idpedido:Pedidos[i].id});
        var P_L={pedido:Pedidos[i],productos:Producto_Pedidos}
        listaProductos_Pedidos.push(P_L);
    }
    res.render('administracion/pedidos/procesados',{listaProductos_Pedidos});
});


router.post('/administracion/consultar/pedidos',isAuthenticated, async (req,res)=>{
    var busqueda={};
    var busqueda2={};
    var listaProductos_Pedidos=[];
    var b;
    if(req.body.tema!="Seleccione un tema"){
        busqueda2['tema']=req.body.tema;   
    }
    if(req.body.estado!="Seleccione un estado"){
        busqueda['estado']=req.body.estado;
    }
    if (req.body.fechaI!='' && req.body.fechaF!=''){
        b=true;
    } else {b=false}
    if(req.body.correo!=''){
        busqueda['correo']=req.body.correo;
    }  
    const Pedidos=await Pedido.find(busqueda);
    for (var i=0;i<Pedidos.length;i++){ 
        busqueda2["idpedido"]=Pedidos[i].id;
        const Producto_Pedidos=await Producto_Pedido.find(busqueda2);
        if ( b && req.body.fechaI<=Pedidos[i].fechapedido && req.body.fechaF>=Pedidos[i].fechapedido){
            var P_L={pedido:Pedidos[i],productos:Producto_Pedidos}
            listaProductos_Pedidos.push(P_L);
        }else if (b==false){
            var P_L={pedido:Pedidos[i],productos:Producto_Pedidos}
            listaProductos_Pedidos.push(P_L);

        }
    }
    const cantidad=await Pedido.find().countDocuments();

    const clientesMP=await Pedido.aggregate([{$group : {_id : "$correo", sum_cantidad : {$sum : 1}}}, {$sort: {
        'sum_cantidad': -1}},{ $limit : 3 }]);
    res.render('usuarios/consultas/consultaPedidos',{listaProductos_Pedidos,cantidad,clientesMP});
});

module.exports=router;