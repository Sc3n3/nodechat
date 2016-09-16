var io = require('socket.io').listen(3000);

var $channels = [ "İstanbul", "İzmir", "Ankara", "Antalya" ];
var $users = [];
var $channelUsers = [];
var $sockets = {};

function clearText(text){
	return text.replace(/(<)/ig, "&lt;").replace(/(>)/ig, "&gt;");
}

io.sockets.on('connection',function(socket){

	var $nick = "";
	var $messages = [];
	var $active = "";
	
	socket.on('nickname', function(request){
		request = clearText(request);
		if($users.indexOf(request) == -1){
			$nick = request;
			$users.push($nick);
			$sockets[$nick] = socket.id;
			socket.emit('channelList', $channels);
		}
	});
	socket.on('enterChannel', function(request){
		if($nick != ""){
			if($channelUsers[request] == undefined){ $channelUsers[request] = []; }
			$channelUsers[request].push($nick);
			socket.emit('enterChannel', $channels[request]);
			socket.emit('updateUsers', $channelUsers[request]);
			socket.emit('msg', "<i style='color: green'><strong>"+ $nick +"</strong> has joined!</i>");
			socket.broadcast.emit('updateUsers', $channelUsers[request]);
			socket.broadcast.emit('msg', "<i style='color: green'><strong>"+ $nick +"</strong> has joined!</i>");
			$active = request;
		}
	});
	socket.on('close', function(){
		$users.splice($users.indexOf($nick), 1);
		
		if($channelUsers[$active] != undefined){
			$channelUsers[$active].splice($channelUsers[$active].indexOf($nick), 1);
			socket.broadcast.emit('updateUsers', $channelUsers[$active]);
			socket.broadcast.emit('msg', "<i style='color: red'><strong>"+ $nick +"</strong> has left!</i>");
		}
	});
	socket.on('sendMsg', function(request){
		request = clearText(request);
		socket.emit('msg', "<strong>"+ $nick +":</strong> "+ request);
		socket.broadcast.emit('msg', "<strong>"+ $nick +":</strong> "+ request);
		io.sockets.socket($sockets[$nick]).emit('msg', "test");
	});
});
