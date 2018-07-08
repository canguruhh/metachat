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

    function onevent(args) {
        args.forEach(message => {
            if (message.text)
                $scope.messages.push(message);
            else
                console.log(message);
            $timeout(function() {
                $location.hash('end');
                $anchorScroll();
            });
        });
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
    $scope.send = (text) => {
        let message = {
            text: text,
            time: Math.floor(new Date() / 1000)
        };
        $wamp.publish(CHANNEL, [message], {}, {})
            .then(ack => {
                message.mine = true;
                $scope.messages.push(message);
                $scope.text = "";
                $timeout(function() {
                    $location.hash('end');
                    $anchorScroll();
                });
            }, console.error);
    };
}]);

app.run(['$wamp', '$rootScope', function($wamp, $rootScope) {
    $wamp.open();

    $wamp.connection.onclose(error => {
        console.error(error);
        $rootScope.connected = false;
    });

}]);
