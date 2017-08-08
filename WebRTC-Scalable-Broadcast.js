
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
        });

        socket.on('message', function(message, userid) {
            socket.broadcast.emit('message', message, userid);
        });
			
		socket.on('chat message', function(roomid, idchat, msg){
			 socket.join(roomid);
			io.sockets.in(roomid).emit('chat message', roomid, idchat, msg);
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

    function getFirstAvailableBraodcater(user) {
        var broadcasters = listOfBroadcasts[user.broadcastid].broadcasters;
        var firstResult;
        for (var userid in broadcasters) {
            if (broadcasters[userid].numberOfViewers <= 40) {
                firstResult = broadcasters[userid];
				break;
            }
        }
		
		console.log(firstResult);
        return firstResult;
		
    }
}