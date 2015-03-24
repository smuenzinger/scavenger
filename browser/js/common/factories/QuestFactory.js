'use strict';
app.factory('QuestFactory', function($http, AuthService){
	return {
		sendStep: function(step) {
            //saves the quest
            return $http.post('/api/step/save', step).then(function(response) {
                return response.data;
            });
        },
        sendQuest: function(quest) {
            //saves the quest, returns its ID
            return $http.post('/api/quests/save', quest).then(function(response) {
                return response.data;
            });
        },
		getAllQuests: function() {
			return $http.get('/api/quests').then(function(res) {
				return res.data;
			});
		},
		getQuestById: function(questId){
			return $http.get('/api/quests/'+questId).then(function(res) {
				return res.data;
			});
		},
		joinQuest: function (questInfo) {
			return $http.post('/api/quests/' + questInfo._id + "/join", questInfo).then(function (response) {
				console.log(response);
			});
		}, 
		leaveQuest: function (questId, userId) {

			return $http.post('/api/quests/' + questId + "/leave", {
				quest: questId,
				user: userId
			}).then(function (response) {
				console.log(response);
			}); 
		}
	};

});