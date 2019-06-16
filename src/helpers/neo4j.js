var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','123'));
var session = driver.session();

var neo4j=new Object();

neo4j.addUsuario= function (cedula,usuario,correo) {
    session.run(
    'CREATE (c:Usuarios { cedula: '+cedula+
    ', usuario: "'+usuario+
    '" , correo: "'+correo+'"})') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.addSitio= function (codigo,nombre,coordenadas) {
    session.run(
    'CREATE (c:Sitios { codigo: '+codigo+
    ', nombre: "'+nombre+
    '" , coordenadas: "'+coordenadas+'"})') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.addProducto= function (codigo,id,nombre,precio) {
    session.run(
    'CREATE (c:Productos { codigo: '+codigo+
    ', id: '+id+
    ', nombre: "'+nombre+
    '" , precio: '+precio+'})') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.addPedido= function (idPedido,idUsuario,cantidad) {
    session.run(
    'CREATE (c:Pedidos { idpedido: "'+idPedido+
    '", idusuario: '+idUsuario+
    ' , cantidad: '+cantidad+'})') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.addProducto_Pedido= function (idpedido,idproducto,nombre,precio) {
    session.run(
    'CREATE (c:Producto_Pedidos { idpedido: "'+idpedido+
    '", idproducto: "'+idproducto+
    '", nombre: "'+nombre+
    '" , precio: '+precio+'})') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.limpiarBase= function (){
    session.run('MATCH (n) DETACH DELETE n') //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.aristaPedidos_Cliente=function (){
    
    session.run("MATCH (a:Usuarios),(b:Pedidos) WHERE a.cedula = b.idusuario CREATE (a)-[r:Pidio]->(b) RETURN r") //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.aristaProducto_Pedidos=function (){
    
    session.run("MATCH (a:Pedidos),(b:Producto_Pedidos) WHERE a.idpedido = b.idpedido CREATE (a)-[r:Contiene]->(b) RETURN r") //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

neo4j.aristaSitio_Productos=function (){
    
    session.run("MATCH (a:Sitios),(b:Productos) WHERE a.codigo = b.codigo CREATE (a)-[r:Vende]->(b) RETURN r") //Esta línea se usa para usarse como query
    .then(function(result){
        result.records.forEach(function(record){
        console.log(record._fields[0].properties);
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

module.exports=neo4j;