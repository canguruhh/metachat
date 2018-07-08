var app = angular.module('app', ['vxWamp']);

app.config(function ($wampProvider) {
     $wampProvider.init({
        url: 'ws://127.0.0.1:8080/ws',
        realm: 'realm1'
     });
});

app.controller('MyCtrl', ['$scope', '$wamp', function($scope, $wamp) {
    $scope.messages = [];
    function onevent(args) {
        args.forEach(message=>$scope.messages.push(message));
    }
    $wamp.subscribe('com.myetpwallet.chat', onevent).then(
        function (subscriptionObject) {
            console.log("Got subscription object : " + subscriptionObject);
        },
        function (err) {
            console.log("Error while subscribing : " + err);
        }
    );
    $scope.send = (text) => {
        $wamp.publish('com.myetpwallet.chat', [text]);
        $scope.messages.push(text);
    };
}]);

app.run(function($wamp){
    $wamp.open();
});
