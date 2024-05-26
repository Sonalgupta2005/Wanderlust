const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");


const {validateReview,isReviewAuthor,isLoggedIn}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js")


  //Post Route
router.post("/",validateReview,wrapAsync(reviewController.createReview));
  
  //Destroy review Route
  router.delete("/:reviewid",isLoggedIn,isReviewAuthor,wrapAsync(
   reviewController.destroyReview
  ));
  
  module.exports=router;