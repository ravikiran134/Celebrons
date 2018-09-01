var express = require("express");
var ejs = require("ejs");
// var app = express();
const app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require('passport');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var methodOverride = require("method-override");
var Schema = mongoose.Schema;
var LocalStrategy = require('passport-local');
var passportLocalMongoose=require("passport-local-mongoose");
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const xoauth2 = require('xoauth2');

app.use(methodOverride("_method"));//for update i.e app.put
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

//db connection
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/users");


app.use(bodyParser.urlencoded({ extended : true})); //set up body parser for forms
// app.use( express.static( "public" ) );
// app.set("view engine","ejs");

// Public Folder
app.use(express.static("public"));
// EJS
app.set('view engine', 'ejs');
  


var ImageSchema = new mongoose.Schema({ 
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number
 });
var Image =  mongoose.model("Image" , ImageSchema );

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/transport',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Init Upload
  const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }
  
  // Init app
  
  
  
  
//schema=============================================
var CustomerSchema = new mongoose.Schema({
    name     : {type:String, required: true},
    email    : String,
    phno     : String,
    location : String,
    Address  : String,
   
    createdTime : { type : Date , default : Date.now }
});
var Customer =  mongoose.model("Customer" , CustomerSchema );

CustomerSchema.plugin(passportLocalMongoose);


var UserSchema = new mongoose.Schema({
    username : String,
    name     : String,
    password : String,
    type     : String,
    servetype: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
UserSchema.plugin(passportLocalMongoose);
var Auth =  mongoose.model("Auth" , UserSchema );

var OwnerSchema = new mongoose.Schema({
    name            : String,
    servtype        : String,
    servname       : String,
    email           : String,
    phno            : String,
    location        : String,
    Address         : String,
    createdTime     : { type : Date , default : Date.now }
});

var Owner =  mongoose.model("Owner" , OwnerSchema );
// OwnerSchema.plugin(passportLocalMongoose);

//Transport Schema
var TransportSchema = new mongoose.Schema({
    name         : String,
    email        : String,
    owner        :[{
        type :mongoose.Schema.Types.ObjectId,
        ref  :"Owner"
    }],
    images       :[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref  :"Image"
        }
    ] ,     
    location     : String,
    Address      : String,
    cost         : String,
    capacity     : String,
    Desc         : String,
    Availability : String,
    Reviews      : String,
    bookings       :[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref  :"TransportBook"
        }
    ] ,   
    createdTime : { type : Date , default : Date.now }
});
var Transport =  mongoose.model("Transport" , TransportSchema );

//Tent House Schema
var TentHouseSchema = new mongoose.Schema({
    name         : String,
    email        : String,
    owner        :[{
        type :mongoose.Schema.Types.ObjectId,
        ref  :"Owner"
    }],
    images       :[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref  :"Image"
        }
    ] ,     
    location     : String,
    Address      : String,
    cost         : String,
    Desc         : String,
    Availability : String,
    Reviews      : String,
    createdTime : { type : Date , default : Date.now }
});
var TentHouse =  mongoose.model("TentHouse" , TentHouseSchema );


//Invitation Schema
var InvitationSchema = new mongoose.Schema({
    name         : String,
    email        : String,
    owner        :[{
        type :mongoose.Schema.Types.ObjectId,
        ref  :"Owner"
    }],
    images       :[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref  :"Image"
        }
    ] ,     
    location     : String,
    Address      : String,
    cost         : String,
    Desc         : String,
    Availability : String,
    Reviews      : String,
    createdTime : { type : Date , default : Date.now }
});
var Invitation =  mongoose.model("Invitation" , InvitationSchema );


//Banner Schema
var BannerSchema = new mongoose.Schema({
    name         : String,
    email        : String,
    owner        :[{
        type :mongoose.Schema.Types.ObjectId,
        ref  :"Owner"
    }],
    images       :[
        {
            type :mongoose.Schema.Types.ObjectId,
            ref  :"Image"
        }
    ] ,     
    location     : String,
    Address      : String,
    cost         : String,
    Desc         : String,
    Availability : String,
    Reviews      : String,
    createdTime : { type : Date , default : Date.now }
});
var Banner =  mongoose.model("Banner" , BannerSchema );
//Transport Book Schema
var BookSchema = new mongoose.Schema({
    customer :[String],
    owner    :[String],
    service  :[String],
    type    : String, 
    NoOfPassengers: [Number],
    FromDate :[Date],
    NumOfDays:Number,
    createdTime : { type : Date , default : Date.now }
});
var Book =  mongoose.model("Book" , BookSchema );

app.use(require("express-session")({
    secret:"Welcome to secret world",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Auth.authenticate()));
passport.serializeUser(Auth.serializeUser());
passport.deserializeUser(Auth.deserializeUser());

//for flassh
var flash = require("connect-flash");
app.use(flash());
app.use(function(req , res, next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
});


// /search
// /login
// /signUp
 
app.get("/" , function(req,res){
    res.render("index", { currentUser : req.user });
});
app.get("/services" , function(req,res){
    res.render("services", { currentUser : req.user });
});
app.get("/login" , function(req,res){
    res.render("login");
});
app.get("/signUp",function(req,res){
    res.render("signUp");
});
app.get("/photos",function(req,res){
    res.render("photos");
});

app.get("/registerOwner" ,function(req,res){
    res.render("registerOwner");
});

app.get("/customer" ,function(req,res){
    res.render("customer");
});

app.get("/transbook" ,function(req,res){
    res.render("transbook");
});

app.get("/bookedcustomers" ,function(req,res){
    res.render("booked_services");
});

app.get("/reset" ,function(req,res){
    res.render("reset");
});

// app.get("/owner" ,function(req,res){
//     res.render("owner");
// });

// app.get("/transport" ,function(req,res){
//     res.render("transport");
// });
app.get("/images" ,function(req,res){
    res.render("images" , { currentUser : req.user });
});

app.get('/forgot', function(req, res) {
    res.render('forgot', {
      user: req.user
    });
  });

  

  app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        Auth.findOne({ username: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgotPassword');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail', 
          auth: {
            user: 'celebrons.bookmyhall@gmail.com',
            pass: 'celebrons@bookmyhall'
          }
        });
        var mailOptions = {
          to: user.username,
          from: 'celebrons.bookmyhall@gmail.com',
          subject: 'BookMyHall Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  app.get('/reset/:token', function(req, res) {
    Auth.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        Auth.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('/forgot');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail', 
          auth: {
            user: 'celebrons.bookmyhall@gmail.com',
            pass: 'celebrons@bookmyhall'
          }
        });
        var mailOptions = {
          to: user.username,
          from: 'celebrons.bookmyhall@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\t\t This is From BookMyHall\n\n' + 
            'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
        if(req.user.type == "C"){
            res.redirect("/customer");
        }else if(req.user.type == "O"){
            res.redirect("/owner");
        }
    });
  });
//transport search page
app.get("/transportsearch" ,isLoggedIn, function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Transport.find({ $or: [ { location: regex }, { name :  regex } ] }).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("images" , { currentUser : req.user , transport : user } ) ;
            }
        });
    }
    else{
        Transport.find({}).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                console.log(user);
                res.render("images" , { currentUser : req.user , transport : user } ) ;
            }
        });
    }
        
});


//tenthouse search 
app.get("/tenthousesearch" , isLoggedIn, function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        TentHouse.find({location : regex }).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("tentimages" , { currentUser : req.user , tents : user } ) ;
            }
        });
    }
        TentHouse.find({}).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                console.log(user);
                res.render("tentimages" , { currentUser : req.user , tents : user } ) ;
            }
        });
});

//Invitation Search
app.get("/invitationsearch" ,isLoggedIn, function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Invitation.find({ $or: [ { location: regex }, { name :  regex } ] }).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("inviteimages" , { currentUser : req.user , invitation : user } ) ;
            }
        });
    }
    else{
        Invitation.find({}).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                console.log(user);
                res.render("inviteimages" , { currentUser : req.user , invitation : user } ) ;
            }
        });
    }
        
});


//Banner search page
app.get("/bannersearch" ,isLoggedIn, function(req,res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Banner.find({location : regex }).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("bannerimages" , { currentUser : req.user , banner : user } ) ;
            }
        });
    }
    else{
        Banner.find({}).populate("images").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                console.log(user);
                res.render("bannerimages" , { currentUser : req.user , banner : user } ) ;
            }
        });
    }
        
});


//Get Hall Details By Id
app.get("/transport/:id/view",function(req,res){
    // res.send("HALL BY ID COMING SPOON \n" + req.params.id );
    Transport.findById( req.params.id).populate("images").exec(function(err,found){
        if(err){
            console.log(err);
        }else{
            console.log(found);
            res.render("service_detail_view", { currentUser : req.user ,owner:req.params.id, hall : found });
        }
    });
    
});

app.get("/tenthouse/:id/view",function(req,res){
    // res.send("HALL BY ID COMING SPOON \n" + req.params.id );
    TentHouse.findById( req.params.id).populate("images").exec(function(err,found){
        if(err){
            console.log(err);
        }else{
            console.log(found);
            res.render("service_detail_view", { currentUser : req.user , hall : found });
        }
    });
    
});

app.get("/invitation/:id/view",function(req,res){
    // res.send("HALL BY ID COMING SPOON \n" + req.params.id );
    Invitation.findById( req.params.id).populate("images").exec(function(err,found){
        if(err){
            console.log(err);
        }else{
            console.log(found);
            res.render("service_detail_view", { currentUser : req.user , hall : found });
        }
    });
    
});

app.get("/book/:oemail/:oname/view",function(req,res){
    // res.send("HALL BY ID COMING SPOON \n" + req.params.id );
    res.render("transbook", { currentUser : req.user , omail : req.params.oemail , osname : req.params.oname });
    
});

app.get("/book/:oemail/:oname/view",function(req,res){
    // res.send("HALL BY ID COMING SPOON \n" + req.params.id );
    res.render("transbook", { currentUser : req.user , omail : req.params.oemail , osname : req.params.oname });
    
});
//add booking details
app.post("/bookform/:omail/:osname" , function(req,res){
    //     customer :[String],
    //     owner    :[String],
    //     service  :[String], 
    //    FromDate :[Date],
    //    NumOfDays:Number,
    //    EventName:String,  
        var newBook = {
            customer : req.user.username,
            owner    : req.params.omail,
            service  : req.params.osname,
            type     : req.body.type,
            NoOfPassengers     : req.body.capacity, 
            FromDate : req.body.fromdate,
            NumOfDays:req.body.days
            
        }
        Book.create(newBook,function(err,data){
            if(err){
                console.log(err);
            }else{
                console.log(data);
                res.redirect("/bookedcustomers");
            }
        });
    
    });


    app.post("/tentform/:omail/:osname" , function(req,res){
        //     customer :[String],
        //     owner    :[String],
        //     service  :[String], 
        //    FromDate :[Date],
        //    NumOfDays:Number,
        //    EventName:String,  
            var newBook = {
                customer : req.user.username,
                owner    : req.params.omail,
                service  : req.params.osname,
                type     : req.body.type,
                NoOfPassengers     : req.body.capacity, 
                FromDate : req.body.fromdate,
                NumOfDays:req.body.days
                
            }
            Book.create(newBook,function(err,data){
                if(err){
                    console.log(err);
                }else{
                    console.log(data);
                    res.redirect("/bookedcustomers");
                }
            });
        
        });
//view customers
    app.get("/viewCustomers/:omail" , function(req,res){
        Book.find({owner : req.params.omail} , function(err,data){
            if(err){
                console.log(err);
            }else{
                console.log(data);
                res.render("viewCustomers" , {currentUser : req.user, data : data });
            }
        });
        
    });

    app.get("/bookedservices",function(req,res){
        Book.find({customer : req.user.username } , function(err,book){
            if(err){
                console.log(err);
            }else{
                // console.log(book);
                Customer.find({email:req.user.username},function(err,cust){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(cust);
                        res.render("booked_services", {currentUser:req.user  , data : book , cust : cust } );
                    }
                });
               
            }
        });
       
    })
//Owner Image upload
app.post("/image/:id/edit" , isLoggedIn ,function(req,res){
    stype=req.user.servetype;
    if(stype=="transport")
    {
        Transport.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log("found hall \n"+found+"\n");
                // res.render("hall_form" , { hall : found });
                upload(req,res,(err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("req.file \n"+ req.file + "\n");
                        Image.create(req.file,function(err,newlyCreated){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("newlycreated image\n"+newlyCreated+"\n");
                                found.images.push(newlyCreated);
                                console.log("found.images.push\n"+found+"\n");
                                found.save(function(err,final){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("final is \n" + final + "\n");
                                        res.redirect("/owner");
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        });
    }
    else if(stype=="tenthouse")
    {
        TentHouse.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log("found hall \n"+found+"\n");
                // res.render("hall_form" , { hall : found });
                upload(req,res,(err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("req.file \n"+ req.file + "\n");
                        Image.create(req.file,function(err,newlyCreated){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("newlycreated image\n"+newlyCreated+"\n");
                                found.images.push(newlyCreated);
                                console.log("found.images.push\n"+found+"\n");
                                found.save(function(err,final){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("final is \n" + final + "\n");
                                        res.redirect("/owner");
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        });
    }
    else if(stype=="invitation")
    {
        Invitation.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log("found hall \n"+found+"\n");
                // res.render("hall_form" , { hall : found });
                upload(req,res,(err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("req.file \n"+ req.file + "\n");
                        Image.create(req.file,function(err,newlyCreated){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("newlycreated image\n"+newlyCreated+"\n");
                                found.images.push(newlyCreated);
                                console.log("found.images.push\n"+found+"\n");
                                found.save(function(err,final){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("final is \n" + final + "\n");
                                        res.redirect("/owner");
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        });
    }
    else
    {
        Banner.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log("found hall \n"+found+"\n");
                // res.render("hall_form" , { hall : found });
                upload(req,res,(err) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("req.file \n"+ req.file + "\n");
                        Image.create(req.file,function(err,newlyCreated){
                            if(err){
                                console.log(err);
                            }else{
                                console.log("newlycreated image\n"+newlyCreated+"\n");
                                found.images.push(newlyCreated);
                                console.log("found.images.push\n"+found+"\n");
                                found.save(function(err,final){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log("final is \n" + final + "\n");
                                        res.redirect("/owner");
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        });
    }
    
});
//get images for owner
app.get("/image/:id/edit" , isLoggedIn ,function(req,res){
    var stype=req.user.servetype;
    if(stype=="transport")
    {
        Transport.findById( req.params.id).populate("images").exec(function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("owner_gallery", { currentUser : req.user , halls : found });
            }
        });
    }
    else if(stype=="tenthouse")
    {
        TentHouse.findById( req.params.id).populate("images").exec(function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("owner_gallery", { currentUser : req.user , halls : found });
            }
        });
    }
    else if(stype=="invitation")
    {
        Invitation.findById( req.params.id).populate("images").exec(function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("owner_gallery", { currentUser : req.user , halls : found });
            }
        });
    }
    else
    {
        Banner.findById( req.params.id).populate("images").exec(function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("owner_gallery", { currentUser : req.user , halls : found });
            }
        });
    }
});
//owner dashboard page
app.get("/owner" ,isLoggedIn,function(req,res){
    console.log(req.user.username);
    console.log(req.user.servetype);

    var Oemail =  req.user.username;
    stype=req.user.servetype;
    if(stype=="transport")
    {
        Transport.findOne({email: Oemail}).populate("owner").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("owner" , { currentUser : req.user , user : user });
            }
        });
    }
    else if(stype=="tenthouse")
    {
        TentHouse.findOne({email: Oemail}).populate("owner").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("owner" , { currentUser : req.user , user : user });
            }
        });
    }
    else if(stype=="invitation")
    {
        Invitation.findOne({email: Oemail}).populate("owner").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("owner" , { currentUser : req.user , user : user });
            }
        });
    }
    else
    {
        Banner.findOne({email: Oemail}).populate("owner").exec(function(err,user){
            if(err){
                console.log(err);
                // res.redirect("/");
            }else{
                res.render("owner" , { currentUser : req.user , user : user });
            }
        });
    }
    
    
});

//Owner details update get
app.get("/owner/:id/edit" ,isLoggedIn , function(req,res){
    Owner.findById(req.params.id , function(err,found){
        if(err){
            console.log(err);
        }else{
            // res.send("ID :"+req.params.id + " data " + found ) ;
            res.render("owner_form" , { currentUser : req.user , owner : found });
        }
    }); 
});

//Owner details update put
app.put("/owner/:id/edit" , isLoggedIn ,function(req,res){
    //find and update owner and redirect
    var newOwner = {
        name     : req.body.name,
        email    : req.body.username,
        phno     : req.body.number,
        location : req.body.location
    };
    Owner.findByIdAndUpdate( req.params.id , newOwner , function(err,updated){
        if(err){
            console.log(err);
            res.send("ERROR OCCURED"+err);
        }else{
            console.log(updated);
            res.redirect("/owner");
        }
    });
});
//Hall Details  update get
app.get("/hall/:type/:id/edit" , isLoggedIn ,function(req,res){
    var stype=req.params.type;
    
    if(stype=="transport")
    {
        Transport.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                
                res.render("service_form" , { currentUser : req.user , service : found });
            }
        });
    }
    else if(stype=="tenthouse")
    {
        TentHouse.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("service_form" , { currentUser : req.user , service : found });
            }
        });
    }
    else if(stype=="invitation")
    {
        Invitation.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("service_form" , { currentUser : req.user , service : found });
            }
        });
    }
    else 
    {
        Banner.findById(req.params.id , function(err,found){
            if(err){
                console.log(err);
            }else{
                console.log(found);
                res.render("service_form" , { currentUser : req.user , service : found });
            }
        });
    }
    
});


//Hall details update put
app.put("/hall/:id/:oid/edit" , isLoggedIn , function(req,res){
    //find and update hall and redirect
    Owner.findById(req.params.oid , function(err,found){
        if(err){
            console.log(err);
        }else{
            
            var stype=found.servtype;
            console.log(stype);
            if(stype=="transport")
            {
                var newTransport = {
                    name         : req.body.name,
                    email        : req.body.username,
                    location     : req.body.location,
                    Address      : req.body.Address,
                    cost         : req.body.cost,
                    capacity     : req.body.capacity,
                    Desc         : req.body.Desc,
                    Events       : req.body.Events
                };
                Transport.findByIdAndUpdate( req.params.id , newTransport , function(err,updated){
                    if(err){
                        console.log(err);
                        res.send("ERROR OCCURED"+err);
                    }else{
                        console.log(updated);
                        res.redirect("/owner");
                    }
                });
            }
            else if(stype=="tenthouse")
            {
                var newTenthouse = {
                    name         : req.body.name,
                    email        : req.body.username,
                    location     : req.body.location,
                    Address      : req.body.Address,
                    cost         : req.body.cost,
                    capacity     : req.body.capacity,
                    Desc         : req.body.Desc,
                    Events       : req.body.Events
                };
                TentHouse.findByIdAndUpdate( req.params.id , newTenthouse , function(err,updated){
                    if(err){
                        console.log(err);
                        res.send("ERROR OCCURED"+err);
                    }else{
                        console.log(updated);
                        res.redirect("/owner");
                    }
                });
            }
            else if(stype=="invitation")
            {
                var newInvitation = {
                    name         : req.body.name,
                    email        : req.body.username,
                    location     : req.body.location,
                    Address      : req.body.Address,
                    cost         : req.body.cost,
                    capacity     : req.body.capacity,
                    Desc         : req.body.Desc,
                    Events       : req.body.Events
                };
                Invitation.findByIdAndUpdate( req.params.id , newInvitation , function(err,updated){
                    if(err){
                        console.log(err);
                        res.send("ERROR OCCURED"+err);
                    }else{
                        console.log(updated);
                        res.redirect("/owner");
                    }
                });
            }
            else if(stype=="banner")
            {
                var newBanner = {
                    name         : req.body.name,
                    email        : req.body.username,
                    location     : req.body.location,
                    Address      : req.body.Address,
                    cost         : req.body.cost,
                    capacity     : req.body.capacity,
                    Desc         : req.body.Desc,
                    Events       : req.body.Events
                };
                Banner.findByIdAndUpdate( req.params.id , newBanner , function(err,updated){
                    if(err){
                        console.log(err);
                        res.send("ERROR OCCURED"+err);
                    }else{
                        console.log(updated);
                        res.redirect("/owner");
                    }
                });
            }
            
        }
    });
    
});
//==========================================
//Auth Routs
//==========================================
app.get("/form" , function(req,res){
    res.render("form");
});
app.get("/secret" ,isLoggedIn, function(req,res){
    res.render("secret");
});

//Register Rout
app.post("/adduser", function(req, res) 
{

    var name = req.body.name;
    var email = req.body.username;
    var password = req.body.password;
    var mobile = req.body.number;
    var location = req.body.location;

    var newCustomer  = { 
        name     : name,
        email    : email,
        phno     : mobile,
        location : location
    };
    
    Auth.register(new Auth({username:req.body.username,name:req.body.name,type:"C"}),req.body.password, function(err,user)
    {

        if(err)
        {
            console.log(err);
            req.flash("error" , "Email Already exist!!");
            return res.redirect('/signup');
        }else{
            passport.authenticate("local")(req, res, function(){
                Customer.create(newCustomer,function(err,newlyCreated){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(newlyCreated);
                    }
            });
            
            res.redirect("/services");
            
        });
        }
        
    });
});

//Owner Register Rout
app.post("/addowner", function(req, res) 
{

    var name = req.body.name;
    var servType=req.body.servtype;
    var servName=req.body.servname;
    var email = req.body.username;
    var password = req.body.password;
    var mobile = req.body.number;
    var location = req.body.location;
    
    
        var newOwner  = { 
            name     : name,
            servtype : servType,
            servname : servName,
            email    : email,
            phno     : mobile,
            location : location
        };
        Owner.create(newOwner,function(err,newOwnerCreated){
            if(err){
                console.log(err);
            }else
            {
                console.log(newOwnerCreated);
                if(servType=="transport")
                {
                    var newTransport = 
                    {
                        name         : servName,
                        email        : email,
                        location     : "",
                        Address      : "",
                        cost         : "",
                        capacity     : "",
                        Desc         : "",
                        Availability : "",
                        Reviews      : "",
                    }
                    Transport.create(newTransport,function(err,newtrans)
                    {
                        if(err)
                        {
                            console.log(err);

                        }
                        else{
                            newtrans.owner.push(newOwnerCreated);
                            newtrans.save(function(err, data){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{
                                    console.log("Data Details\n" + data + "\n");
                                }
                            });
                        }
                    });
                }
                else if(servType=="tenthouse")
                {
                    var newTent = 
                    {
                        name         : servName,
                        email        : email,
                        location     : "",
                        Address      : "",
                        cost         : "",
                        capacity     : "",
                        Desc         : "",
                        Availability : "",
                        Reviews      : "",
                    }
                    TentHouse.create(newTent,function(err,newtent)
                    {
                        if(err)
                        {
                            console.log(err);

                        }
                        else{
                            newtent.owner.push(newOwnerCreated);
                            newtent.save(function(err, data){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{
                                    console.log("Data Details\n" + data + "\n");
                                }
                            });
                        }
                    });
                }
                else if(servType=="invitation")
                {
                    var newInvitation = 
                    {
                        name         : servName,
                        email        : email,
                        location     : "",
                        Address      : "",
                        cost         : "",
                        capacity     : "",
                        Desc         : "",
                        Availability : "",
                        Reviews      : "",
                    }
                    Invitation.create(newInvitation,function(err,newinvit)
                    {
                        if(err)
                        {
                            console.log(err);

                        }
                        else{
                            newinvit.owner.push(newOwnerCreated);
                            newinvit.save(function(err, data){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{
                                    console.log("Data Details\n" + data + "\n");
                                }
                            });
                        }
                    });
                }
                else(servType=="banner")
                {
                    var newBanner = 
                    {
                        name         : servName,
                        email        : email,
                        location     : "",
                        Address      : "",
                        cost         : "",
                        capacity     : "",
                        Desc         : "",
                        Availability : "",
                        Reviews      : "",
                    }
                    Banner.create(newBanner,function(err,newbanner)
                    {
                        if(err)
                        {
                            console.log(err);

                        }
                        else{
                            newbanner.owner.push(newOwnerCreated);
                            newbanner.save(function(err, data){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else{
                                    console.log("Data Details\n" + data + "\n");
                                }
                            });
                        }
                    });
                }

            }
        });
        Auth.register(new Auth({username:req.body.username,type:"O",servetype:servType}),req.body.password, function(err,Owner)
        {
            if(err)
            {
                console.log(err);
                return res.render('registerOwner');
            }
            passport.authenticate("local")(req, res, function()
            {
                return res.render("secret");
            });
        });
    
});


//Login logic
app.post("/authuser",passport.authenticate("local"),function(req,res){
    Auth.findOne({username:req.body.username},function(err,user){
        if(err)
        {
            console.log(err);
            res.render("index");

        }
        else{
            if(user.type=="C"){
                
                  res.render('services',{user:
                    user.name})
                  
            }
            else if(user.type=="O"){
                res.redirect("/owner");
            }
        }
    });
    
});
//=================================================

//=================================================

app.get("/logout", function(req,res){
    req.logout();
    res.render("index");
});

function isLoggedIn(req,res, next)
{
    if(req.isAuthenticated()){
        return next();

    }
    req.flash("error" , "Please , Log in First!!");
    res.redirect("/login");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// app.listen("3000","localhost",function(){
//     console.log("localhost:3000 CLICK4SERVE SERVER STARTED");
// });
app.listen(process.env.PORT,process.env.IP);

