const express = require('express');
const router = express.Router();
const Sitio = require('../models/sitio.model');
const Producto = require('../models/producto.model');

const mongoose=require('mongoose');

router.get('/administracion/agregar/sitio', (req, res) => {
  res.render('administracion/sitios/agregarSitio');
});

router.post('/administracion/sitios/agregarSitio', async (req, res) => {
  console.log(req.body);
  var lista=["2"] ;
  const { codigo, nombre, descripcion, repartidores, coordenadas, direccion} = req.body;
      const errors = [];
      if (!codigo ) {
        errors.push({text: 'Ingrese un id'});
      }
      if (!nombre ) {
        errors.push({text: 'Ingrese un nombre'});
      }
      if (!descripcion) {
        errors.push({text: 'Ingrese una descripción'});
      }
      if (!repartidores) {
        errors.push({text: 'Ingrese la cantidad de repartidores'});
      }
      if (!coordenadas) {
        errors.push({text: 'Ingrese las coordenadas'});
      }
      if (!direccion) {
        errors.push({text: 'Ingrese la dirección exacta'});
      }
      
      if (errors.length > 0) {
        res.render('administracion/sitios/agregarSitio', {
          errors,codigo, nombre, descripcion, repartidores, coordenadas, direccion
          
        });
      }  
      else {

        Sitio.find({'codigo':req.body.id},{'codigo':1,'_id':0},function callback(error, verificar){
          if(Object.entries(verificar).length === 0){   
                   
            const newL = new Sitio({codigo, nombre, descripcion, repartidores, coordenadas, direccion});             
            newL.save();                       
            res.redirect("/administracion/consultar/sitio");
            
          }
          else{
            errors.push({text: 'El id está en uso'});
            if (errors.length > 0) {
              res.render('administracion/sitios/agregarSitio', {
                errors,codigo, nombre, descripcion, repartidores, coordenadas, direccion
                
                
              });
            }
          }
          });              
      }
});

router.get('/administracion/consultar/sitio', async(req, res) => {
  const consulta=await Sitio.find();
  res.render('administracion/sitios/consultarSitio', { consulta });
});

router.get('/usuario/consultar/sitio', async(req, res) => {
  const consulta=await Sitio.find();
  res.render('usuarios/sitios/consultarSitio', { consulta });
});

router.get('/administracion/editar/sitio/:id', async (req, res) => {
  const consulta = await Sitio.findById(req.params.id);
  res.render('administracion/sitios/editarSitio', { consulta });
});


router.put('/administracion/editar/sitio/:id', async (req, res) => {
  const {codigo, nombre, descripcion, repartidores, coordenadas, direccion} =req.body;

  await Sitio.findByIdAndUpdate(req.params.id,{codigo, nombre, descripcion, repartidores, direccion, coordenadas});
  res.redirect('/administracion/consultar/sitio');
});

router.delete('/administracion/eliminar/sitio/:id', async (req, res) => {
  await Sitio.findByIdAndDelete(req.params.id);
  res.redirect('/administracion/consultar/sitio');;
});

router.get('/administracion/Consultar/sitios/verProductos/:id', async (req, res) => {
  const consulta = await Producto.find({'codigo':req.params.id});
  res.render('administracion/sitios/mostrarProductos', { consulta });
});

module.exports = router;