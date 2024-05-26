const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage });




router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));


//New Route
router.get("/new",isLoggedIn,listingController.createNewListingForm);

//Search Route
router.get("/search",wrapAsync(listingController.searchListing));

router.route("/:id")
.get(wrapAsync(listingController.showListings))
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

  
//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editForm));
  
router.get("/category/:category",wrapAsync(listingController.categorywiselisting))

module.exports=router;