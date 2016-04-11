var geohash = require("geohash").GeoHash;
var Todo = require('../app/models/tasks');
module.exports = function(app,passport,mongoose){
	app.get('/',function(req,res){
		res.render('index.ejs');
	});
	app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    app.post('/signup',passport.authenticate('local-signup', {
        successRedirect : '/profile', //success
        failureRedirect : '/signup', //error
        failureFlash : true // allow flash messages
    }));
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });
    app.get('/addtask',isLoggedIn, function(req, res) {
        res.render('addtask.ejs',{
            user : req.user
        });//, { message: req.flash('signupMessage') });
    });
    app.post('/addtask',isLoggedIn, function ( req, res, next ){
      new Todo({
          user_id    : req.user,//req.cookies.user_id,
          task_detail: req.body.task_detail,
          location   : req.body.location,
          due_time   : req.body.due_time
      }).save( function ( err, todo, count ){
        if( err ) return next( err );

        console.log("stored data");
        res.redirect('/addtask');
      });
    });
    app.post('/profile',isLoggedIn, function ( req, res, next ){
      // var user_id = req.cookies ?
      //   req.cookies.user_id : undefined;

      Todo.
        find({ user_id : req.user }).
        sort( '-due_time' ).
        exec( function ( err, todo ){
          if( err ) return next( err );

          res.render( '/profile', {
              user : req.user,
              todos: todo
          });
        });
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/'); //redirect to home
    });
    app.get("/addtask/:id", isLoggedIn, function (req,res){
        //decode the geohash with geohash module
        var latlon = geohash.decodeGeoHash(req.params["id"]);
        console.log("latlon : " + latlon);
        var lat = latlon.latitude[2];
        console.log("lat : " + lat);
        var lon = latlon.longitude[2];
        console.log("lon : " + lon);
        zoom = req.params["id"].length + 2;
        console.log("zoom : " + zoom);
                // now we use the templating capabilities of express and call our template to render the view, and pass a few parameters to it
        res.render("gmaps.ejs", { layout: false, lat:lat, lon:lon, zoom:zoom, geohash:req.params["id"]});
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}