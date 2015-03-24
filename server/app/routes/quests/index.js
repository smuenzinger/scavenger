'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

router.post('/', function (req, res, next) {
    mongoose.model('Quest').findOne({
        title: req.body.title
    }, function(err, quest) {
        console.log('question:', quest);
        if (err) return next(err);
        if (quest !== null) return res.send("This Quest already exists!"); //q exists. Don't create
        else {
            //question doesn't already exist, so we can save it.
            console.log('In the save part');

            mongoose.model('Quest').create(req.body).then(function(data) {

                mongoose.model('User').findById(req.body.owner, function(err, userObj){
                    if (err) {
                        console.log(err);
                    } else {
                        userObj.created.push(data._id);
                        userObj.save(); 
                    }
                });
                res.send(data._id);
            });

        }
    });

});

router.get('/', function (req, res) {
    mongoose.model('Quest').find({}).exec(function(err, quests) {
        if (err) res.send(err);
        res.json(quests);
    });
});

router.get('/user/:id',function(req,res,next){
    console.log(req.params);
    var user = req.params.id;
    mongoose.model('Quest').find({owner:user},function(err,quests){
        res.send(quests);
    })
})

router.get('/:id', function (req, res) {
    var questId = req.params.id;
    mongoose.model('Quest').find({_id: questId}).exec(function(err,quest) {
        if(err) res.send(err);
        res.json(quest);
    });
});

// when a user "joins" a quest
// router.post('/:id/join', function (req, res) {
router.post('/participants', function (req, res) {
    console.log("req.body", req.body);

    async.parallel([
        function() {
            mongoose.model('User').findById(req.body.participants[req.body.participants.length - 1], function (err, user) {
                var alreadyParticipating = _.findIndex(user.participating, function (questPlaying) {
                    return questPlaying.questId == req.body._id;
                });
                console.log("alreadyParticipating", alreadyParticipating);
                if (alreadyParticipating !== -1) res.json(req.body);
                else {
                   user.addQuestToUser(req.body._id, function(err, data){
                        if (err) console.log(err);
                        console.log(data);
                   })
                }
            });
        },
        function() {
            mongoose.model('Quest').findById(req.body._id, function (err, quest) {
                console.log("quest.participants.indexOf(req.body._id)", quest.participants.indexOf(req.body._id));
                if (quest.participants.indexOf(req.user._id) !== -1) return res.json(req.body);
                else {
                    quest.addUserFromQuest(req.user._id, function(err, data) {
                        if (err) console.log(err);
                        console.log(data);
                    });
                }
            });
        }], function() {
            res.json(req.body);
    });
});

// when a user "leaves" a quest
// router.post('/:id/leave', function (req, res) {
router.delete('/participants/:id', function (req, res) {
    console.log("req.user", req.user);
    // console.log("FUNNAY TIMES", req.body)
    async.parallel([
        function() {
            req.user.removeQuestFromUser(req.params.id, function(err, data){
                if (err) console.log(err)
                console.log(data);
            });
        }
        ,
        function() {
            mongoose.model('Quest').findById(req.params.id, function (err, singleQuest) {
               singleQuest.removeUserFromQuest(req.user._id,function(err, data){
                    if(err) console.log(err);
                    console.log(data);
               });
            });
        }]
        , function() {
            res.json();
    });

    
});

