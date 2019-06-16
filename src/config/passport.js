const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;

const Usuario= require('../models/usuario.model');

passport.use(new LocalStrategy({
    usernameField:'usuario',
    passwordField: 'contraseña' 
}, async (usuario, contraseña,done)=>{
    const usuarioLog= await Usuario.findOne({usuario: usuario});
    if (!usuarioLog){
        return done(null,false,{message:'El usuario no existe.'});
    } else{
        const resultado= await usuarioLog.compararContraseña(contraseña);
        if (resultado){
            return done(null,usuarioLog);
        } else{
            return done(null,false,{message:'La contraseña es incorrecta.'});
        }
    }
}));

passport.serializeUser((usuarioLog,done)=>{
    done(null,usuarioLog.id);
});

passport.deserializeUser((id,done)=>{
    Usuario.findById(id,(err,usuarioLog)=>{
        done(err,usuarioLog);
    });
});