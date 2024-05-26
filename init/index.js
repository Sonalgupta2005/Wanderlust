const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken="pk.eyJ1IjoiZGVsdGEtc3R1ZHVlbnQiLCJhIjoiY2xvMDk0MTVhMTJ3ZDJrcGR5ZDFkaHl4ciJ9.Gj2VU1wvxc7rFVt5E4KLOQ";

const geocodingClient = mbxGeocoding({accessToken:mapToken});

main().then(()=>{
    console.log("connected to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  }

  async function insertData(){
   
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'6644eac8ad0a794ff4a7064e',geometry:{type:"Point",coordinates:[77.61,28.644]}}));
    await Listing.insertMany(initData.data);
    let listings=await Listing.find({});
    for(listing of listings){
  
    
    let response=await geocodingClient.forwardGeocode({
      
      query:listing.location,
      limit:1
    })
      .send();
      await Listing.updateOne({title:listing.title},{$set:{geometry:response.body.features[0].geometry}});
    }
  }



insertData().then(()=>{
  console.log("data inserted");
}).catch((err)=>{
  console.log(err);
})
// setCoordinates().then(()=>{
//   console.log("Updated coordinates");
// }).catch((err)=>{
//   console.log(err);
// })
