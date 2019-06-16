const express=require('express');
const path = require('path');
const exphbs=require('express-handlebars');
const methodOverride=require('method-override');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');


// Inicializaciones
const app=express();
require('./database');
require('./config/passport');

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir:path.join(app.get('views'),'partials'),
    extname: '.hbs'
}));


app.set('view engine','.hbs');

//Middlewares
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'isaac',
    resave:true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Variables Globales
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('succes_msg');
    res.locals.error_msg=req.flash('error_msg');
    res.locals.error=req.flash('error');
    res.locals.usuarioLog=req.user || null;
    next();
});

// Rutas
app.use(require('./routes/index'));
app.use(require('./routes/administracion'));
app.use(require('./routes/usuarios'));
app.use(require('./routes/productos'));
app.use(require('./routes/sitios'));
app.use(require('./routes/pedidos'));

// Archivos estaticos
app.use(express.static(path.join(__dirname,'public')));


// Servidor escuchando
app.listen(app.get('port'),() => {
    console.log('Server on port',app.get('port'));
});