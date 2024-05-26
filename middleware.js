const Listing = require("./models/listing");
const {listingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");
const Review=require("./models/reviews");


module.exports.isLoggedIn=(req,res,next)=>{
if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You are not logged in! Please login");
    return res.redirect("/login");
  
}  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        
    }next();
}

module.exports.isOwner=async(req,res,next)=>{
let {id}=req.params;
let listing=await Listing.findById(id);
if(!listing.owner._id.equals(res.locals.newUser._id)){
    req.flash("error","You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
}next();

}
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    
    if(error){
      throw new ExpressError(400,error.details.map((el)=>(el.message)).join(","));
    }else{
      next();
    }
  }

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
      throw new ExpressError(400,error.details.map((el)=>(el.message)).join(","));
    }else{
      next();
    }
  }

  module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewid}=req.params;
    let review=await Review.findById(reviewid);
    if(!review.author._id.equals(res.locals.newUser._id)){
        req.flash("error","You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }next();
    
    }