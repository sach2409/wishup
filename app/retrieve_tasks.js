var mongoose = require('mongoose');
var Todo = require('../app/models/tasks');

module.exports.index = function ( req, res, next ){
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;

  Todo.
    find({ user_id : user_id }).
    sort( '-due_time' ).
    exec( function ( err, todos ){
      if( err ) return next( err );

      res.render( '/addtask', {
          user : req.user
      });
    });
};

module.exports.create = function ( req, res, next ){
  new Todo({
      user_id    : req.cookies.user_id,
      task_detail: req.body.task_detail,
      location   : req.body.location,
      due_time	 : req.body.due_time
  }).save( function ( err, todo, count ){
    if( err ) return next( err );

    res.redirect('/addtask');
  });
};

// module.exports.destroy = function ( req, res, next ){
//   Todo.findById( req.params.id, function ( err, todo ){
//     var user_id = req.cookies ?
//       req.cookies.user_id : undefined;

//     todo.remove( function ( err, todo ){
//       if( err ) return next( err );

//       res.redirect( '/profile' );
//     });
//   });
// };
