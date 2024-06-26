if(process.env.NODE_ENV!="production"){
  require("dotenv").config()
}

const express=require("express");
const mongoose=require("mongoose");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")
const session=require("express-session");
const mongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const dbUrl=process.env.ATLASDB_URL;


app.set("views engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);

const store=mongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
res.locals.success=req.flash("success");
res.locals.error=req.flash("error");
res.locals.newUser=req.user;
next();
})

// app.use((req,res,next)=>{
//   let reqtime=new Date(Date.now()).toString().split(" ").slice(0,4).join("-");
//   console.log(req.method,req.hostname,req.path,reqtime);
//   next();
// })

main().then(()=>{
    console.log("connected to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);}


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
});
app.use((err,req,res,next)=>{
  let {status=500,message="Something Went Wrong"}=err;
  res.status(status).render("error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
});