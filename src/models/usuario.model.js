const mongoose=require('mongoose');
const {Schema}=mongoose;
const bcrypt=require('bcryptjs');

const Usuario=new Schema({
    cedula:{type: Number},
    nombre:{type: String},
    fechaNacimiento:{type: String},
    usuario:{type:String},
    correo:{type:String},
    telefono:{type:String},
    contraseña:{type: String},
    esCliente:{
        type:Boolean,
        default:false
    },
    esAdministrador:{
        type:Boolean,
        default:false
    }
});

Usuario.methods.encryptarContraseña = async (contraseña) => {
    const salt = await bcrypt.genSalt(10);
    const hash=bcrypt.hash(contraseña,salt);
    return hash;
};

Usuario.methods.compararContraseña = async function (contraseña){
    return await bcrypt.compare(contraseña,this.contraseña);
};

module.exports=mongoose.model('Usuarios',Usuario);