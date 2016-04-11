var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({

    task             : {
        user_id      : String,
        task_detail  : String,
        location     : String,
        due_time     : String,
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Tasks', taskSchema);