JUCI.app.factory("$network", function($rpc, $uci){
	function _refreshClients(self){
		var deferred = $.Deferred(); 
		$rpc.router.clients().done(function(clients){
			self.clients = Object.keys(clients).map(function(x){
				return clients[x]; 
			}); 
			deferred.resolve(self.clients);  
		}).fail(function(){ deferred.reject(); });
		return deferred.promise(); 
	}
	
	function NetworkBackend() {
		this.clients = []; 
	}
	
	NetworkBackend.prototype.getConnectedClients = function(){
		var deferred = $.Deferred(); 
		var self = this; 
		_refreshClients(self).done(function(clients){
			
			deferred.resolve(clients.filter(function(x){ return x.connected; })); 
		}); 
		
		return deferred.promise(); 
	}
	
	return new NetworkBackend(); 
}); 

UCI.validators.IPAddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match(/^\b(?:\d{1,3}\.){3}\d{1,3}\b$/)) return gettext("IP Address must be a valid ipv4 address!"); 
		return null;
	}
}; 

UCI.validators.MACAddressValidator = function(){
	this.validate = function(field){
		if(!(typeof field.value == "string") ||
			!field.value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/)) 
			return gettext("Value must be a valid MAC-48 address"); 
		return null; 
	}
}; 

UCI.validators.MACListValidator = function(){
	this.validate = function(field){
		if(field.value instanceof Array){
			var errors = []; 
			field.value.map(function(value){
				if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
					errors.push(gettext("value must be a valid MAC-48 address")+": "+value); 
			}); 
			if(errors.length) return errors.join(", "); 
		}
		return null; 
	}
}; 

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":					{ dvalue: false, type: Boolean }, 
	"ifname":					{ dvalue: '', type: String }, 
	"proto":					{ dvalue: 'dhcp', type: String }, 
	"ipaddr":					{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask":				{ dvalue: '', type: String }, 
	"type":						{ dvalue: '', type: String }, 
	"ip6assign":			{ dvalue: 60, type: Number }, 
	"bridge_instance": { dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"hostname":				{ dvalue: '', type: String }, 
	"ipv6":						{ dvalue: false, type: Boolean },
	"peerdns": 				{ dvalue: false, type: String }, 
	"dns": 						{ dvalue: [], type: Array }
}); 

UCI.$registerConfig("dhcp"); 
UCI.dhcp.$registerSectionType("dnsmasq", {
	"domainneeded":		{ dvalue: true, type: Boolean },
	"boguspriv":		{ dvalue: true, type: Boolean },
	"localise_queries":	{ dvalue: true, type: Boolean },
	"rebind_protection":	{ dvalue: false, type: Boolean },
	"local":		{ dvalue: "/lan/", type: String, required: true},
	"domain":		{ dvalue: "lan", type: String, required: true},
	"expandhosts":		{ dvalue: true, type: Boolean },
	"authoritative":	{ dvalue: true, type: Boolean },
	"readethers":		{ dvalue: true, type: Boolean },
	"leasefile":		{ dvalue: "/tmp/dhcp.leases", type: String, required: true},
	"resolvfile":		{ dvalue: "/tmp/resolv.conf.auto", type: String, required: true}
});
UCI.dhcp.$registerSectionType("dhcp", {
	"interface":		{ dvalue: "lan", type: String, required: true},
	"start":		{ dvalue: 100, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"limit":		{ dvalue: 150, type: Number, validator: UCI.validators.NumberLimitValidator(1, 255) },
	"leasetime":		{ dvalue: "12h", type: String, required: true},
	"ignore":		{ dvalue: false, type: Boolean }
});
UCI.dhcp.$registerSectionType("domain", {
	"name":		{ dvalue: "", type: String, required: true},
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator }  // TODO: change to ip address
});
UCI.dhcp.$registerSectionType("host", {
	"name":		{ dvalue: "", type: String, required: false},
	"network": { dvalue: "lan", type: String, required: true }, 
	"mac":		{ dvalue: "", type: String, required: true, validator: UCI.validators.MACAddressValidator },
	"ip":		{ dvalue: "", type: String, required: true, validator: UCI.validators.IPAddressValidator }  // TODO: change to ip address
}); 

UCI.$registerConfig("ddns");
UCI.ddns.$registerSectionType("service", {
	"enabled":              { dvalue: 0, type: Number },
	"interface":            { dvalue: "", type: String },
	"use_syslog":           { dvalue: 0, type: Number },
	"service_name":         { dvalue: "", type: String },
	"domain":               { dvalue: "", type: String },
	"username":             { dvalue: "", type: String },
	"password":             { dvalue: "", type: String }
});
			
UCI.$registerConfig("firewall"); 
UCI.firewall.$registerSectionType("defaults", {
	"syn_flood":		{ dvalue: true, type: Boolean }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }
}); 
UCI.firewall.$registerSectionType("zone", {
	"name":					{ dvalue: "", type: String }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }, 
	"network": 			{ dvalue: [], type: Array }, 
	"masq":					{ dvalue: true, type: Boolean }, 
	"mtu_fix": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("redirect", {
	"name":					{ dvalue: "", type: String }, 
	"src":					{ dvalue: "", type: String }, 
	"dest":					{ dvalue: "", type: String }, 
	"src_ip":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  },
	"src_dport":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator },
	"proto":				{ dvalue: "", type: String }, 
	"dest_ip":			{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  }, 
	"dest_port":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator }
}); 
UCI.firewall.$registerSectionType("include", {
	"path": 				{ dvalue: "", type: String }, 
	"type": 				{ dvalue: "", type: String }, 
	"family": 			{ dvalue: "", type: String }, 
	"reload": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("dmz", {
	"enabled": 			{ dvalue: false, type: Boolean }, 
	"host": 				{ dvalue: "", type: String } // TODO: change to ip address
}); 
UCI.firewall.$registerSectionType("rule", {
	"type": 				{ dvalue: "generic", type: String }, 
	"name":					{ dvalue: "", type: String }, 
	"src":					{ dvalue: "lan", type: String }, 
	"src_ip":				{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
	"src_port":			{ dvalue: 0, type: Number }, 
	"proto":				{ dvalue: "tcp", type: String }, 
	"dest":					{ dvalue: "*", type: String }, 
	"dest_ip":			{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"dest_port":		{ dvalue: 0, type: Number }, 
	"target":				{ dvalue: "REJECT", type: String }, 
	"family": 			{ dvalue: "ipv4", type: String }, 
	"icmp_type": 		{ dvalue: [], type: Array },
	"enabled": 			{ dvalue: true, type: Boolean },
	"hidden": 			{ dvalue: true, type: Boolean }, 
	"limit":				{ dvalue: "", type: String }, 
	// scheduling
	"parental": 			{ dvalue: false, type: String }, 
	"weekdays":				{ dvalue: "", type: String }, 
	"start_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
	"stop_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
}); 
UCI.firewall.$registerSectionType("settings", {
	"disabled":			{ dvalue: false, type: Boolean },
	"ping_wan":			{ dvalue: false, type: Boolean }
}); 
UCI.firewall.$registerSectionType("urlblock", {
	"enabled": { dvalue: false, type: Boolean }, 
	"url": 					{ dvalue: [], type: Array }, 
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
}); 

