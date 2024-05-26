const { response } = require("express");
const Listing=require("../models/listing.js");
const ExpressError=require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});


module.exports.index=async(req,res)=>{
    let listings=await Listing.find({});
    res.render("listings/index.ejs",{listings});

  };

module.exports.createNewListingForm=(req,res)=>{
    res.render("listings/new.ejs");
  };

module.exports.createListing=async(req,res)=>{
  
  let response=await geocodingClient.forwardGeocode({
    query:req.body.listing.location,
    limit: 1
  })
    .send();
  
  let url=req.file.path;
  let filename=req.file.filename;
    let newListing=new Listing(req.body.listing);
    newListing.owner=req.user;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!")
    res.redirect("/listings");
  };

module.exports.showListings=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate({
      path:"reviews",populate:{path:"author"}
    }).populate("owner");
    if(!listing){
      req.flash("error","Listing you requested for does not exist!");
      res.redirect("/listings");
    }else{
      res.render("listings/show.ejs",{listing});
    }
   
  };

module.exports.editForm=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing you requested for does not exist!");
      res.redirect("/listings");
    }else{
      let originalImg=listing.image.url.replace("/upload","/upload/w_250");
      res.render("listings/edit.ejs",{listing,originalImg});
    }
   
  };

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    if(!req.body.listing){
      throw new ExpressError(400,"Send a valid data for listing");
    }
    
    let newListing=await Listing.findByIdAndUpdate(id,req.body.listing,{runValidators:true,new:true});
    console.log(newListing);
    if(newListing.location){
      let response=await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit: 1
      })
        .send();
        newListing.geometry=response.body.features[0].geometry;
        await newListing.save();
    }

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    newListing.image={url,filename};
    await newListing.save();}
    req.flash("success","Listing Updated!")
    res.redirect(`/listings/${id}`);
  };
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!")
    res.redirect("/listings");
  };
module.exports.categorywiselisting=async(req,res)=>{
  let category=req.params;
  let listings=await Listing.find(category);
  res.render("listings/index.ejs",{listings});
  
}
module.exports.searchListing=async(req,res)=>{
  let place=req.query;

  let listings=await Listing.find({location:place.search});
  res.render("listings/index.ejs",{listings});
  
  //console.log(place);
}