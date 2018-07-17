var app = angular.module('app', ['vxWamp']);

const CHANNEL = 'com.myetpwallet.chat';

app.config(['$wampProvider', function($wampProvider) {
    $wampProvider.init({
        url: 'wss://chat.myetpwallet.com/ws',
        realm: 'realm1'
    });
}]);

app.controller('ChatCtrl', ['$scope', '$wamp', '$anchorScroll', '$location', '$timeout', function($scope, $wamp, $anchorScroll, $location, $timeout) {
    $scope.messages = [];

    let lightwallet = null;

    angular.element(document).ready(function() {
        lightwallet = new Lightwallet();
        lightwallet.unlock()
            .then(() => lightwallet.getAvatars())
            .then(avatars => {
                if (avatars.length) {
                    $scope.avatar = avatars[0];
                }
            })
            .catch(error => {
                console.error(error);
            });
    });

    function addMessage(message){
        if (message.signature) {
            console.info('check signature', message.signature);
            message.check = verify(message);
            $scope.messages.push(message);
        } else {
            $scope.messages.push(message);
        }
    }

    function onevent(args) {
        args.forEach(message => {
            if (message.text) {
                addMessage(message);
            } else
                console.log(message);
            $timeout(function() {
                $location.hash('end');
                $anchorScroll();
            });
        });
    }

    function verify(message){
        return Metaverse.message.verify(JSON.stringify({
            text: message.text,
            time: message.time,
            avatar: message.avatar
        }), message.avatar.address, message.signature);
    }

    $wamp.subscribe(CHANNEL, onevent).then(
        function(subscriptionObject) {
            $scope.messages.push({
                text: 'joined channel',
                system: true,
                time: Math.floor(new Date() / 1000)
            });
            $scope.connected = true;
        },
        function(err) {
            $scope.messages.push({
                text: 'error connecting to channel',
                system: true,
                time: Math.floor(new Date() / 1000)
            });
            $scope.connected = false;
        }
    );

    function publish(message) {
        $wamp.publish(CHANNEL, [message], {}, {})
            .then(ack => {
                message.mine = true;
                addMessage(message);
                $scope.text = "";
                $timeout(function() {
                    $location.hash('end');
                    $anchorScroll();
                });
            }, console.error);
    }

    $scope.send = (text) => {
        let message = {
            text: text,
            time: Math.floor(new Date() / 1000)
        };
        if (lightwallet != null && $scope.avatar) {
            message.avatar = $scope.avatar;
            lightwallet.sign(JSON.stringify(message), $scope.avatar.symbol)
                .then(signature => {
                    message.signature = signature;
                    publish(message);
                });
        } else {
            publish(message);
        }
    };
}]);

app.run(['$wamp', '$rootScope', function($wamp, $rootScope) {
    $wamp.open();

    $wamp.connection.onclose(error => {
        console.error(error);
        $rootScope.connected = false;
    });

}]);
