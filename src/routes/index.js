const router=require('express').Router();



router.get('/',async (req,res)=> {
    var login=true;
    res.render('index',{login});
});


module.exports=router;