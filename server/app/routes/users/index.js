'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');

router.get('/points/', function (req,res,next){
  var total = req.user.totalPoints;
  if (req.user.pointsSpent){
    total -= req.user.pointsSpent;
  }
  res.json(total);
});

router.put('/points/:id', function (req,res,next){
  console.log("trying to add points on the backend right now");
  var stepId = req.params.id;
  console.log("stepId", stepId)
  //get the step object to get point worth
  mongoose.model('Step').findOne({_id: stepId}, function(err, stepObject) {
    console.log('found the step', stepObject)
      var points = stepObject.pointValue;
      //find the quest in req.user which has a current step that matches our stepid
      req.user.participating.forEach(function(quest, idx, arr){

        if (quest.currentStep == stepId){
        //push the new point worth to pointsfromQuest on the participating array in users
          console.log("BEFORE quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest)
          console.log("points we are trying to add", points)
          req.user.participating[idx].pointsFromQuest += points;
          console.log("After quest.pointsFromQuest", req.user.participating[idx].pointsFromQuest)
          req.user.save(function(afterSave){
            res.end();
          });
        };
      });
    });

})

router.put('/participating/currentStep/:id', function(req, res){
  var stepId = req.params.id;
  //find the entire step object associated with the step id
  mongoose.model('Step').findOne({_id: stepId}, function(err, oldStepObject) {
    //find the stepNum of the current step object that we just found
        
        var oldStepNum = oldStepObject.stepNum;
        var currentQuest = oldStepObject.quest;
    //find the other steps associated with the quest of the oldStepObject    
    mongoose.model('Step').find({quest: oldStepObject.quest}, function(err, allStepsFromQuest) {
      
      allStepsFromQuest.forEach(function(step) {
        if(step.stepNum == oldStepNum+1) {
          var newCurrentStep = step;
          req.user.participating.forEach(function(quest) {
            if (String(quest.questId) === String(currentQuest)){
              quest.currentStep=newCurrentStep._id;
              req.user.save();
              res.json(newCurrentStep);
            }
          })
        }
      });
    })
  })
});
router.get('/:id', function(req, res, next) {
    mongoose.model('User').findOne({_id: req.params.id})
        .populate('created participating')
        .exec(function (err, userInfo) {
            if (err) return res.json(err);
            // if (userInfo.participating.length) {
	            mongoose.model('User').populate(userInfo, 'participating.questId participating.currentStep', function (err, userFullyPopulated) {
	            	if (err) return res.json(err);
                console.log('STEPS THINGS',userFullyPopulated)
                res.json(userFullyPopulated);
	            });	
    		// }
    		// res.json(userInfo);

    		// MAYBE??? eventually we will need to do async stuff so that both "participating" and "pastQuests"
       //      async.parallel([
       //      	function(done) {
       //      		if (userInfo.participating.length) {
       //      			console.log("running participating");
			    //         mongoose.model('User').populate(userInfo, 'participating.questId', function (err, userI) {
			    //         	if (err) return res.json(err);
			    //         	console.log("ran participating");
			    //         });	
       //      		}
       //      		done();
       //      		console.log("not / after running participating.questid populate");
       //      	},
       //      	function(done) {
       //      		if (userInfo.pastQuests.length) {
       //      			console.log("running pastQuests");
			    //         mongoose.model('User').populate(userInfo, 'pastQuests.questId', function (err, singleUser) {
			    //         	if (err) return res.json(err);
			    //         	console.log("ran pastQuests");
			    //         });
       //      		}
       //      		done();
       //      		console.log("not / after running userinfo.questid populate");
       //      	}
 		   	// ], function(err, results) {
 		   	// 	console.log("success?", results);
 		   	// 	res.json(results);
 		   	// });
        });

});