const router=require('express').Router();


const {isAuthenticated}= require('../helpers/autenticacion');

// Require esquema
const Usuario=require('../models/usuario.model');
const Sitio=require('../models/sitio.model');
const Producto=require('../models/producto.model');
const Pedido=require('../models/pedido.model');
const Producto_Pedido=require('../models/producto_pedido.model');
const passport=require('passport');

// Require neo4j
const neo4j= require('../helpers/neo4j');


//POST - GET

router.get('/administracion/entrarUsuario',(req,res)=> {
    res.render('administracion/entrar');
});

router.post('/administracion/entrarUsuario',async (req,res,next)=>{
    var verificar=await Usuario.find({'usuario': req.body.usuario});
    if(verificar.length>0 && 
        (verificar[0].esAgente || verificar[0].esAdministrador || verificar[0].esGerente)){
        return next();
    } else {
        req.flash('error_msg','Usuario no registrado.');
        res.redirect('/administracion/entrarUsuario');
    }
},
    passport.authenticate('local',{
        successRedirect: '/administracion/menu',
        failureRedirect: '/administracion/entrarUsuario',
        failureFlash: true,
    })
);

router.get('/administracion/registrarUsuario',(req,res)=> {
    res.render('administracion/registrar');
});

router.post('/administracion/registrarUsuario', async (req,res) =>{
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
        res.render('administracion/registrar',
        { errores, cedula, nombre, fechaNacimiento, usuario, correo, 
        telefono,contraseña, contraseñaC});
    } else{
        var newUsuario;

        newUsuario=new Usuario({cedula,nombre,fechaNacimiento, usuario, 
        correo, telefono, contraseña,esCliente:false,esAdministrador:true});
        
        newUsuario.contraseña=await newUsuario.encryptarContraseña(contraseña);
        await newUsuario.save();
        req.flash('success_msg','Administrador Registrado');
        res.redirect('/administracion/menu');
    }
});

router.get('/administracion/consultar/clientes', isAuthenticated, async (req,res)=> {
    var Clientes=await Usuario.find({'esCliente': true});
    res.render('administracion/consultas/usuarios',{Clientes});
});

router.get('/administracion/consultar/personal', isAuthenticated, async (req,res)=> {
    var Clientes=await Usuario.find({$or:[{esAdministrador:true}]});
    res.render('administracion/consultas/usuarios',{Clientes});
});

router.get('/administracion/menu', isAuthenticated, (req,res)=> {
    res.render('administracion/menu');
});



//   MIGRACION

router.get('/administracion/migrar', isAuthenticated, async (req,res)=> {
    neo4j.limpiarBase();
    //Agregar Usuarios
    var Usuarios=await Usuario.find({'esCliente': true});
    for (var i=0;i<Usuarios.length;i++){
        neo4j.addUsuario(Usuarios[i].cedula,Usuarios[i].nombre,Usuarios[i].correo);
    }

    //Agregar Sitios
    var Sitios=await Sitio.find({});
    for (var i=0;i<Sitios.length;i++){
        neo4j.addSitio(Sitios[i].codigo,Sitios[i].nombre,Sitios[i].coordenadas);
    }
    //Agregar Productos
    var Productos=await Producto.find({});
    for (var i=0;i<Productos.length;i++){
        neo4j.addProducto(Productos[i].codigo,Productos[i].id,Productos[i].nombre,Productos[i].precio);
    }

    //Agregar Pedidos
    var Pedidos=await Pedido.find({});
    for (var i=0;i<Pedidos.length;i++){
        neo4j.addPedido(Pedidos[i].id,Pedidos[i].cedula,Pedidos[i].cantidad);
    }

    //Agregar Pedidos
    var lista=await Producto_Pedido.find({});
    for (var i=0;i<lista.length;i++){
        neo4j.addProducto_Pedido(lista[i].idpedido,lista[i].idproducto,lista[i].nombre,lista[i].precio);
    }
    
    neo4j.aristaPedidos_Cliente();
    neo4j.aristaProducto_Pedidos();
    neo4j.aristaSitio_Productos();

    req.flash('success_msg','Base de datos migrada.');
    res.render('administracion/menu');
});





module.exports=router;