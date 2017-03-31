var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next)
{
  req.task_col.find({completed:false}).toArray(function (err, tasks) {
    if (err) {
      return next(err);
    }
    res.render('index', { title: 'TODO list' , tasks: tasks });

  })
});

router.post('/add', function (req, res, next)
{
    if(!req.body || !req.body.text){
        req.flash('error', 'Please enter some text');
        res.redirect('/');
    }
    else {
        // Save new task with text provided, and completed = false
        var task = {text: req.body.text, completed: false};
        req.task_col.insertOne(task, function (err)

        {
            if (err) {
                return next(err)
            }
            res.redirect('/');
        })
    }
});
// ids have to be an objectid object
router.post('/done', function (req, res,next)
{
    req.task_col.updateOne(
        { _id:ObjectID(req.body._id)},
        {$set: { completed: true}},
        function (err, result) {
            if(err){
                return next(err);
            }
            if(result.result.n ==0)
            {
                var req_err = new Error('Task not found');
                req_err.status =404;
                return next(req_err);
        }
        req.flash('info', 'Market as completed');
        return res.redirect('/');
    })

});

router.get('/completed', function (req, res,next ) {
    req.task_col.find({completed:true}).toArray(function(err, tasks) {
        if (err) {
            return next(err);
        }
        res.render('tasks_completed', {title: 'Completed Tasks', tasks: tasks});
    })
    
});
router.post('/delete', function(req, res,next){

    req.task_col.deleteOne({ _id : ObjectID(req.body._id) }, function(err, result){

        if (err) {
            return next(err);    //Database errors
        }

        if (result.result.n == 0) {
            var req_err = new Error('Task not found');
            req_err.status = 404;
            return next(req_err);     // Task not found error
        }

        req.flash('info', 'Deleted');
        return res.redirect('/')

    })

});

module.exports = router;
