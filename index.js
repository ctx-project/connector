var l = function(o) {console.log(o); return o;},
		require = require || undefined;
		
if(require) { 
	var fetch = require("node-fetch");
	module.exports = CtxConnection;
}	

function CtxConnection(base, user) {
	this.base = base;
	this.user = user;
	this.depth = -1;
}

CtxConnection.prototype.getUrl = function() {
	return (this.base.startsWith('http') ? '' : 'http://') + this.base + '/ctx/' + this.user;	
}

CtxConnection.fetch = async function(url) {
	var r = await fetch(url),
			t = await r.text();
	return t;
}

CtxConnection.prototype.hints = async function(text) {
	return await CtxConnection.fetch(this.getUrl() + '/hints/' + encodeURIComponent(text));
}

CtxConnection.prototype.getQuery = function() {	return ''; }
CtxConnection.prototype.getPath = function() {	return []; }
CtxConnection.prototype.sub = function(query) {
	return new CtxContext(this, query);
}

function CtxContext(parent, query) {
	this.parent = parent;
	this.depth = parent.depth + 1;
	this.setQuery(query);
}

CtxContext.prototype.getUrl = function() {
	return this.parent.getUrl();
}

CtxContext.prototype.setQuery = function(query) {
	this.query = (query || '').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	return this;
}

CtxContext.prototype.getQuery = function() {
	return this.parent.getQuery() + ' ' + this.query;
}

CtxContext.prototype.getPath = function() {
	var p = this.parent.getPath();
	p.push(this.query);
	return p;
}

CtxContext.prototype.get = async function() {
	return await CtxConnection.fetch(this.getUrl() + '/get/' + encodeURIComponent(this.getQuery()));
}

CtxContext.prototype.put = async function(item) {
	return await CtxConnection.fetch(this.getUrl() + '/put/' + encodeURIComponent(this.getQuery() + ' ' + item));
}

CtxContext.prototype.sub = function(query) {
	return new CtxContext(this, query);
}
