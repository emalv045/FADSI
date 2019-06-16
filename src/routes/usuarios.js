const router=require('express').Router();
const {isAuthenticated}= require('../helpers/autenticacion');

// Require esquema
const Usuario=require('../models/usuario.model');
const Producto=require('../models/producto.model');
const Pedido=require('../models/pedido.model');
const Producto_Pedido=require('../models/producto_pedido.model');
const passport=require('passport');

router.get('/usuario/registrarUsuario',(req,res)=> {
    res.render('usuarios/registrar');
});

router.post('/usuario/registrarUsuario', async (req,res) =>{
    const {cedula,nombre, fechaNacimiento, usuario, correo, telefono, 
        contraseña, contraseñaC}=req.body;
    var errores=[];
    if (contraseña!=contraseñaC){
        errores.push({text:'Las contraseñas no coinciden.'})
    }
    if (nombre=='' || correo=='' || usuario=='' || contraseña=='' ){
        errores.push({text:'Debe llenar al menos los espacios obligatorios.'})
    }
    var verificar=await Usuario.find({'cedula': cedula});
    if(verificar.length>0){
        errores.push({text:'Este número de cedula ya ha sido registrado.'});
    }
    verificar=await Usuario.find({'correo': correo});
    if(verificar.length>0){
        errores.push({text:'Este correo ya ha sido registrado.'});
    }
    verificar=await Usuario.find({'usuario': usuario});
    if(verificar.length>0){
        errores.push({text:'Este nombre de usuario ya esta siendo usado.'});
    }
    if (errores.length>0){
        res.render('usuarios/registrar',
        { errores, cedula, nombre, fechaNacimiento, usuario, correo, 
        telefono, contraseña, contraseñaC});
    } else{
        const newUsuario=new Usuario({cedula,nombre,fechaNacimiento, usuario, correo, telefono, contraseña,esCliente:true});
        newUsuario.contraseña=await newUsuario.encryptarContraseña(contraseña);
        await newUsuario.save();
        req.flash('success_msg','Usuario registrado.');
        res.redirect('/usuario/entrarUsuario');
    }
});

router.post('/usuario/consultar/producto',isAuthenticated,(req,res)=>{
    var busqueda={};
    var precio={};

    if(req.body.sitio!=""){
        busqueda['codigo']=req.body.sitio;   
    }
    if(req.body.nombre!=""){
        busqueda['nombre']=req.body.nombre;
    }
    if(req.body.tema!=""){
        busqueda['descripcion']=req.body.descripcion;
    }
    if(req.body.precio1!=""&&req.body.precio2!=""){
        precio['$gte']=req.body.precio1;
        precio['$lte']=req.body.precio2;
        busqueda['precio']=precio;
    }


    Producto.find(busqueda,(err,docs)=>{
        if(!err){
            res.render("usuarios/consultas/consultaProductos",{
                list: docs
            })
        }
        else{
            console.log("Error en la busqueda de productos: "+err);
        }
    });
});

router.get('/usuario/consultar/todo',isAuthenticated,(req,res)=>{
    Producto.find({},(err,docs)=>{
        if(!err){
            res.render("usuarios/consultas/consultaProductos",{
                list: docs
            })
        }
        else{
            console.log("Error en la busqueda de productos: "+err);
        }
    });
});

router.post('/usuario/consultar/pedidos',isAuthenticated, async (req,res)=>{
    var busqueda={};
    var busqueda2={};
    var listaProductos_Pedidos=[];
    var b;
    if(req.body.estado!="Seleccione un estado"){
        busqueda['estado']=req.body.estado;
    }
    if (req.body.fechaI!='' && req.body.fechaF!=''){
        b=true;
    } else {b=false}
    busqueda['idusuario']=res.locals.usuarioLog.id;
    
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
    res.render('usuarios/consultas/consultaPedidos',{listaProductos_Pedidos});
});

router.get('/usuario/consultar/producto/:id',isAuthenticated,(req,res)=>{

    Producto.findById(req.params.id,(err,doc)=>{
        if(!err){
            res.render("usuarios/consultas/verProducto",{
               viewTittle:"Detalles del producto",
               producto: doc
            });
        }
    });
});

var Carrito=[]
router.get('/usuario/agregarCarrito/producto/:id',isAuthenticated,async (req,res)=>{
    const newProducto=await Producto.findByIdAndUpdate(req.params.id,{ $inc:{ 'cantidadVendida':1}})
    Carrito.push(newProducto);
});

router.get('/usuario/agregarCarrito/guardar',isAuthenticated,async (req,res)=>{
    const usuario=res.locals.usuarioLog
    const newPedido= new Pedido({cedula:usuario.cedula,cantidad:Carrito.length});
    await newPedido.save();
    for (var i=0; i<Carrito.length;i++){
        const newProducto_Pedido= new Producto_Pedido({idpedido:newPedido.id,idproducto:Carrito[i].id,nombre:Carrito[i].nombre,precio:Carrito[i].precio});
        await newProducto_Pedido.save();
    }
    Carrito=[];
    res.redirect('/usuario/menu');
});

router.get('/usuario/entrarUsuario',(req,res)=> {
    res.render('usuarios/entrar');
});

router.post('/usuario/entrarUsuario',async (req,res,next)=>{
        var verificar=await Usuario.find({'usuario': req.body.usuario});
        if(verificar.length>0 && verificar[0].esCliente){
            return next();
        } else {
            req.flash('error_msg','Usuario no registrado.');
            res.redirect('/usuario/entrarUsuario');
        }
    },
    passport.authenticate('local',{
        successRedirect: '/usuario/menu',
        failureRedirect: '/usuario/entrarUsuario',
        failureFlash: true,
    })
);

router.get('/usuario/salir', async (req,res)=> {
    req.logout();
    res.redirect('/');
});

router.get('/usuario/menu', isAuthenticated, async (req,res)=> {
    res.render('usuarios/menu');
});

router.get('/usuario/eliminarCuenta/:id', isAuthenticated, async (req,res)=> {
    Usuario.findByIdAndRemove(req.params.id,(err,doc)=>{
        if(!err){
            res.redirect('/usuario/salir');
        }        
        else{
            console.log("Ocurrio un error: "+err);
        }
    });
});

router.get('/usuario/actualizarUsuario',isAuthenticated,(req,res)=> {
    res.render('usuarios/actualizar');
});

router.post('/usuario/actualizarUsuario/:id',isAuthenticated, async (req,res)=> {
    const {cedula,nombre, fechaNacimiento, usuario, correo, telefono, 
        contraseña, contraseñaC}=req.body
    var errores=[]
    if (contraseña!=contraseñaC){
        errores.push({text:'Las contraseñas no coinciden.'})
    }
    if (cedula=='' || nombre=='' || correo=='' || usuario=='' || contraseña=='' ){
        errores.push({text:'Debe llenar los espacios obligatorios.'})
    }
    var verificar=await Usuario.find({'correo': correo});
    if(verificar.length>0 && req.params.id!=verificar[0].id){
        errores.push({text:'Este número de cedula ya ha sido registrado.'});
    }
    verificar=await Usuario.find({'correo': correo});
    if(verificar.length>0 && req.params.id!=verificar[0].id){
        errores.push({text:'Este correo ya ha sido registrado.'});
    }
    verificar=await Usuario.find({'usuario': usuario});
    if(verificar.length>0 && req.params.id!=verificar[0].id){
        errores.push({text:'Este nombre de usuario ya esta siendo usado.'});
    }
    if (errores.length>0){
        res.render('usuarios/actualizar',
        { errores, cedula, nombre, fechaNacimiento, usuario, correo, 
        telefono, contraseña, contraseñaC});
    } else{
        const newUsuario=new Usuario({cedula,nombre,fechaNacimiento, usuario, correo, telefono, contraseña});
        const contraseñaEncryptada=await newUsuario.encryptarContraseña(contraseña);
        console.log(contraseñaEncryptada,req.params.id,req.body)
        await Usuario.findOneAndUpdate({_id:req.params.id},
            {cedula,nombre,fechaNacimiento, usuario, correo, telefono, contraseñaEncryptada},
            {new:true},(err,doc)=>{
            if(!err){
                req.flash('success_msg','Datos actualizados.');
                res.redirect('/usuario/menu');
            }
        });
}});

router.get('/usuario/consultar/lugaresCercanos',(req,res)=> {
    res.render('usuarios/consultas/consultaLugaresCercanos');
});

module.exports=router;
