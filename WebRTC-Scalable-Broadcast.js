// Muaz Khan   - www.MuazKhan.com
// MIT License - www.WebRTC-Experiment.com/licence

module.exports = exports = WebRTC_Scalable_Broadcast;

function WebRTC_Scalable_Broadcast(app) {
    var io = require('socket.io').listen(app, {
        log: false,
        origins: '*:*'
    });
/*
    io.set('transports', [
        'websocket', // 'disconnect' EVENT will work only with 'websocket'
        'xhr-polling',
        'jsonp-polling'
    ]);
*/
    var listOfBroadcasts = {};

    io.on('connection', function(socket) {
        var currentUser;
		
        socket.on('join-broadcast', function(user, msg) {
            currentUser = user;

            user.numberOfViewers =0;
            if (!listOfBroadcasts[user.broadcastid]) {
                listOfBroadcasts[user.broadcastid] = {
                    broadcasters: {},
                    allusers: {},
                    typeOfStreams: user.typeOfStreams // object-booleans: audio, video, screen
                };
            }

            var firstAvailableBroadcaster = getFirstAvailableBraodcater(user);
            if (firstAvailableBroadcaster) {
                listOfBroadcasts[user.broadcastid].broadcasters[firstAvailableBroadcaster.userid].numberOfViewers++;
                socket.emit('join-broadcaster', firstAvailableBroadcaster, listOfBroadcasts[user.broadcastid].typeOfStreams);

                console.log('User <', user.userid, '> is trying to get stream from user <', firstAvailableBroadcaster.userid, '>');
            } else {
                currentUser.isInitiator = true;
                socket.emit('start-broadcasting', listOfBroadcasts[user.broadcastid].typeOfStreams);

                console.log('User <', user.userid, '> will be next to serve broadcast.');
					
            }

			
            listOfBroadcasts[user.broadcastid].broadcasters[user.userid] = user;
            listOfBroadcasts[user.broadcastid].allusers[user.userid] = user;
			//menampilkan nama user//
			//console.log(listOfBroadcasts[user.broadcastid].allusers);
			//console.log(listOfBroadcasts[user.broadcastid].broadcasters);
			//console.log(listOfBroadcasts[user.broadcastid].broadcasters[user.userid]);
			//console.log(currentUser.broadcastid);
			
        });

        socket.on('message', function(message, userid) {
            socket.broadcast.emit('message', message, userid);
        });
		
		/*
		socket.on('chat message', function(msg){
			//socket.join(broadcastid.broadcastid);
			//socket.emit('chat message', msg);
			//socket.to(broadcastid.broadcastid).emit('chat message', msg);
			//socket.emit(broadcastid.broadcastid, msg);
			//io.to(broadcastid.broadcastid).emit('chat message');
			socket.emit('chat message', msg);
			//socket.leave(broadcastid.broadcastid);

			//console.log(broadcastid.broadcastid + msg);
		});
		*/
		socket.on('socketCustomEvent', function(msg) {
				
				 socket.emit('socketCustomEvent', msg);
			});
			
		socket.on('chat message', function(roomid, msg){
			//console.log(roomid);
			 socket.join(roomid);
			io.sockets.in(roomid).emit('chat message', roomid, msg);
			//console.log('end ' + roomid);
		  });
				 
        socket.on('disconnect', function() {
            if (!currentUser) return;
            if (!listOfBroadcasts[currentUser.broadcastid]) return;
            if (!listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid]) return;

            delete listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid];
            if (currentUser.isInitiator) {
                delete listOfBroadcasts[currentUser.broadcastid];
            }
        });
		
    });
/*	
var nsp = io.of(broadcastid);
nsp.on('connection', function(socket){
  console.log('someone connected');
  	socket.on('chat message', function(msg, user){
			//currentUser = user;
			io.emit('chat message', msg);
			//console.log(chatroom);
		});
});
*/
	
	//socket.on(currentUser.broadcastid, function(msg, user){
			
			//io.emit(currentUser.broadcastid, msg);
			//console.log(chatroom);
		//});
		

    function getFirstAvailableBraodcater(user) {
        var broadcasters = listOfBroadcasts[user.broadcastid].broadcasters;
		//console.log(listOfBroadcasts[user.broadcastid].broadcasters);
		//console.log(broadcasters);
        var firstResult;
        for (var userid in broadcasters) {
            if (broadcasters[userid].numberOfViewers <= 40) {
                firstResult = broadcasters[userid];
				
				break;
                //continue;
            } //else delete listOfBroadcasts[user.broadcastid].broadcasters[userid];
        }
		
		console.log(firstResult);
        return firstResult;
		
    }
}
