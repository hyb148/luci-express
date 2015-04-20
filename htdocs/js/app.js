/*global angular*/

$.jsonRPC.setup({
  endPoint: '/ubus',
  namespace: 'luci'
});

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

angular.module("luci", [
	"ui.bootstrap",
	"ui.router", 
	"gettext"
	])
	.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
		//$locationProvider.otherwise({ redirectTo: "/" });
		$locationProvider.hashPrefix('!');
		//$stateProvider.otherwise("login"); 
		//$urlRouterProvider.otherwise("/otherwise"); 
		$stateProvider.state("home", {
			url: "", 
			views: {
				"content": {
					templateUrl: "pages/overview.html"
				}
			}, 
			luci_config: {}
		}); 
	})
	.run(function($rootScope, $state, $session, gettextCatalog, $rpc, $navigation){
		// set current language
		gettextCatalog.currentLanguage = "se"; 
		//gettextCatalog.debug = true; 
		
		// get the menu navigation
		$rpc.luci2.ui.menu().done(function(data){
			//console.log(JSON.stringify(data)); 
			Object.keys(data.menu).map(function(key){
				var view = data.menu[key].view; 
				var path = key.replace("/", "."); 
				var obj = {
					path: path, 
					text: data.menu[key].title, 
					index: data.menu[key].index || 0
				}; 
				if(view){
					obj.page = "/pages/"+view.replace("/", ".")+".html"; 
				}
				$navigation.register(obj); 
			}); 
			$rootScope.$apply(); 
		}); 
	})
	
angular.module("luci").controller("BodyCtrl", function ($scope, $state, $session, $location, $window, $rootScope, $config) {
	$scope.menuClass = function(page) {
		var current = $location.path().substring(1);
		return page === current ? "active" : "";
	};
	$scope.mode = ""; 
	$scope.modeList = [{
		id: 0, 
		label: "Basic Mode"
	}]; 
	$("#guiMode").on("change", function(){
		var selected = $(this).find("option:selected").val();
		console.log(selected); 
		if(selected == "logout") {
			$session.logout().always(function(){
				$window.location.href="/"; 
			}); 
		} else {
			$config.mode = selected; 
		}
	}); 
	$session.init().done(function(){
		// make browser refresh work
		$state.transitionTo($location.path().replace("/", "").replace(".", "_")); 
		//$rootScope.$apply(); 
	}).fail(function(){
		$location.path("/login"); 
		$state.transitionTo($location.path().replace("/", "").replace(".", "_")); 
	}); 
})

$(document).ready(function(){
	
	$("#loading-indicator").hide(); 
}); 
