const express = require('express');
const router = express.Router();
const Producto = require('../models/producto.model');
const Sitio = require('../models/sitio.model');
const mongoose=require('mongoose');

const {isAuthenticated}= require('../helpers/autenticacion');


router.get('/administracion/agregar/producto', isAuthenticated, (req, res) => {
  res.render('administracion/productos/agregarProducto');
});

router.post('/administracion/agregar/producto', isAuthenticated,async (req, res) => {
  
  const { codigo, id, nombre, descripcion, precio} = req.body;
      const errors = [];
      if (!codigo ) {
        errors.push({text: 'Ingrese un id válido'});
      }
      if (!id ) {
        errors.push({text: 'Ingrese un id válido'});
      }
      if (!nombre ) {
        errors.push({text: 'Ingrese un nombre válido'});
      }
      if (!descripcion) {
        errors.push({text: 'Ingrese una descripción válida'});
      }
      if (!precio) {
        errors.push({text: 'Ingrese un precio válido'});
      }
      
      
      if (errors.length > 0) {
        res.render('administracion/productos/agregarProducto', {
          errors,codigo, id, nombre, descripcion, precio
          
          
        });
      }  
      else {
        Producto.find({'id':req.body.id},{'id':1,'_id':0},function callback(error, verificar){
          if(Object.entries(verificar).length === 0){   
                       
            Sitio.find({'codigo':req.body.codigo},{'codigo':1,'_id':0},function callback(error, verificarL){
              if(Object.entries(verificarL).length === 0){                

                errors.push({text: 'No se ha registrado un sitio con este id'});
                if (errors.length > 0) {
                  res.render('administracion/productos/agregarProducto', {
                    errors,codigo, id, nombre, descripcion, precio              
                  });
                }
              }
              else{
                const newL = new Producto({codigo, id, nombre, descripcion, precio});             
                newL.save();                       
                res.redirect("/administracion/consultar/producto");
              }
            }); 
          }
          else{
            errors.push({text: 'Ya se registró un producto con este id'});
            if (errors.length > 0) {
              res.render('administracion/productos/agregarProducto', {
                errors,codigo, id, nombre, descripcion, precio              
              });
            }
          }
        });     
    };
});
    

router.get('/administracion/consultar/producto', isAuthenticated, async(req, res) => {
  
  const consulta=await Producto.find();
  res.render('administracion/productos/consultarProducto', { consulta });
  
});

router.get('/administracion/editar/producto/:id', isAuthenticated, async (req, res) => {
  const consulta = await Producto.findById(req.params.id);
  res.render('administracion/productos/editarProducto', { consulta });
});
router.put('/administracion/editar/productos/:id', isAuthenticated, async (req, res) => {
  const {id, nombre, descripcion, precio} =req.body;
  await Producto.findByIdAndUpdate(req.params.id,{id, nombre, descripcion, precio});
    res.redirect('/administracion/consultar/producto');
});

router.delete('/administracion/eliminar/producto/:id', isAuthenticated, async (req, res) => {
  console.log(req.params.id);
  await Producto.findByIdAndDelete(req.params.id);
  res.redirect('/administracion/consultar/producto');;
});


router.get('/administracion/ver/producto/:id', isAuthenticated, async (req, res) => {
  const consulta = await Producto.find({'codigo':req.params.id});
  res.render('administracion/sitios/mostrarProductos', { consulta });
});

module.exports = router;