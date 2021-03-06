JUCI.app
.directive("uciFirewallRuleEdit", function($compile, $parse){
	return {
		templateUrl: plugin_root+"/widgets/uci.firewall.rule.edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "uciFirewallRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallRuleEdit", function($scope, $uci, $rpc, $log){
	$scope.$watch("ngModel", function(value){
		if(!value) return; 
		var ngModel = value; 
		if(ngModel && ngModel.src_dport && ngModel.dest_port && ngModel.src_dport.value && ngModel.dest_port.value){
			
			$scope.portIsRange = (ngModel.src_dport.value.indexOf("-") != -1) || (ngModel.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"}, 
		{ label: "TCP", value: "tcp"}, 
		{ label: "TCP + UDP", value: "tcpudp" }
	]; 
	$scope.deviceChoices = [];
	$rpc.router.clients().done(function(clients){
		var choices = []; 
		Object.keys(clients).map(function(x) {
			var c = clients[x]; 
			if(c.connected){
				choices.push({
					label: (c.hostname && c.hostname.length)?c.hostname:c.ipaddr, 
					value: c.ipaddr
				}); 
			} 
		}); 
		$scope.deviceChoices = choices; 
		$scope.$apply(); 
	});
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 
