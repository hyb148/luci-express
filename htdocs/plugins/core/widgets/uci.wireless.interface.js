$juci.module("core")
.directive("uciWirelessInterface", function($compile){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.wireless.interface.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "WifiInterfaceController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiInterfaceController", function($scope, $uci){
	$scope.$watch("interface", function(value){
		$scope.devices = $uci.wireless["@wifi-device"].map(function(x){
			return x[".name"]; 
		}); 
		$scope.title = $scope.interface[".name"] + ".edit.title"; 
	}); 
}); 
