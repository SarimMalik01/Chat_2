const mongoose=require("mongoose");
const bcrypt=require('bcrypt');

const UserSchema=new mongoose.Schema({
   username:{type:String,unique:true},
   password:String,
},{timestamps:true});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); 
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

const UserModel=mongoose.model('User',UserSchema);

module.exports=UserModel;