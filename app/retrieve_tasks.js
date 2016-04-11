var mongoose = require('mongoose');
var Todo = require('../app/models/tasks');

module.exports.index = function ( req, res, next ){
  // var user_id = req.cookies ?
  //   req.cookies.user_id : undefined;

  Todo.
    find({ user_id : req.user }).
    sort( '-due_time' ).
    exec( function ( err, todos ){
      if( err ) return next( err );

      res.render( '/profile', {
          user : req.user,
          todos: todos
      });
    });
};

module.exports.create = function ( req, res, next ){
  new Todo({
      user_id    : req.user,//req.cookies.user_id,
      task_detail: req.body.task_detail,
      location   : req.body.location,
      due_time	 : req.body.due_time
  }).save( function ( err, todo, count ){
    if( err ) return next( err );

    console.log("stored data");
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
