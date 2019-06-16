const helpers={}

helpers.isAuthenticated=(req,res,next)=>{
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg','Debe entrar a la aplicación');
    res.redirect('/');
};

module.exports=helpers;