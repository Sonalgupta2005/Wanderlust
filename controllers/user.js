const User=require("../models/user.js");
const Listing=require("../models/listing.js");

module.exports.signupForm=(req,res)=>{
    res.render("./users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
        let{username,email,password}=req.body;
        let newUser=new User({email,username});
        let registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }req.flash("success","Welcome to Wanderlust");
            res.redirect("/listings");
        })
        
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }
    
};

module.exports.loginForm=(req,res)=>{
    res.render("./users/login.ejs");
};

module.exports.login=async(req,res)=>{
    req.flash("success","You are logged in!");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
    
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    });
};

module.exports.home=async(req,res)=>{
    let listings=await Listing.find({});
    res.render("listings/index.ejs",{listings});
};