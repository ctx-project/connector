var l = function(o) {console.log(o); return o;},
		require = require || undefined,
		module = module || {};
		
if(require) var fetch = require("node-fetch");

module.exports = CtxConnection;

function CtxConnection(base, user) {
	this.base = base;
	this.user = user;
	this.depth = -1;
}

CtxConnection.prototype.getUrl = function() {
	return (this.base.startsWith('http') ? '' : 'http://') + this.base + '/ctx/' + this.user;	
}

CtxConnection.prototype.hints = async function(text) {
	return await CtxConnection.fetch(this.getUrl() + '/hints/' + encodeURIComponent(text));
}

CtxConnection.prototype.getQuery = function() {
	return '';	
}

CtxConnection.prototype.getPath = function() {
	return [];	
}

CtxConnection.prototype.sub = function(query) {
	return new CtxContext(this, query);
}

CtxConnection.fetch = async function(url) {
	var r = await fetch(url),
			t = await r.text();
	return t;
}

function CtxContext(parent, query) {
	this.parent = parent;
	this.depth = parent.depth + 1;
	this.setQuery(query);
}

CtxContext.prototype.setQuery = function(query) {
	this.query = (query || '').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	return this;
}

CtxContext.prototype.getPath = function() {
	var p = this.parent.getPath();
	p.push(this.query);
	return p;
}

CtxContext.prototype.getUrl = function() {
	return this.parent.getUrl();
}

CtxContext.prototype.getQuery = function() {
	return this.parent.getQuery() + ' ' + this.query;
}

CtxContext.prototype.get = async function(query) {
	return await CtxConnection.fetch(this.getUrl() + '/get/' + encodeURIComponent(this.getQuery() + ' ' + query));
}

CtxContext.prototype.put = async function(query) {
	return await CtxConnection.fetch(this.getUrl() + '/put/' + encodeURIComponent(this.getQuery() + ' ' + query));
}

CtxContext.prototype.sub = function(query) {
	return new CtxContext(this, query);
}
