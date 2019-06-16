const mongoose=require('mongoose');


mongoose.connect('mongodb://localhost/FADSI',{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
})
  .then(db => console.log("DB Conectada"))
  .catch(err => console.error(err));


