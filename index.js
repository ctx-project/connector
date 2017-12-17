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

CtxConnection.prototype.getUrl = function(verb, payload) {
	return `${this.base.startsWith('http') ? '' : 'http://'}${this.base}/ctx/${this.user}/${verb}/${encodeURIComponent(payload)}`;	
}

CtxConnection.fetch = async function(url) {
	var r = await fetch(url),
			t = await r.text();
	return t;
}

CtxConnection.flags = function(verb, flags) {
	return [verb].concat(Object.entries(flags).filter(e => e[1]).map(e => e[0])).join('-');
}

CtxConnection.prototype.hints = async function(text) {
	return await CtxConnection.fetch(this.getUrl('hints', text));
}

CtxConnection.prototype.get = async function(query, flags = {}) {
	return await CtxConnection.fetch(this.getUrl(CtxConnection.flags('get', flags), query));
}

CtxConnection.prototype.head = async function(query, flags = {}) {
	return await CtxConnection.fetch(this.getUrl(CtxConnection.flags('head', flags), query));
}

CtxConnection.prototype.put = async function(item) {
	return await CtxConnection.fetch(this.getUrl('put', item));
}

CtxConnection.prototype.getPath = function() {	return []; }
CtxConnection.prototype.sub = function(query) {
	return new CtxContext(this, query);
}

function CtxContext(parent, query) {
	this.parent = parent;
	this.connection = parent.connection || parent;
	this.depth = parent.depth + 1;
	this.setQuery(query);
}

CtxContext.prototype.setQuery = function(query) {
	//casing needed for put - context query should be tags
	this.query = (query || '').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).trim();
	return this;
}

CtxContext.prototype.getQuery = function() {
	return this.getPath().join(' ');
}

CtxContext.prototype.getPath = function() {
	if(this.isOoc()) return [this.query.slice(1)];
	
	var p = this.parent.getPath();
	p.push(this.query);
	return p;
}

CtxContext.prototype.isOoc = function() {
	return this.query.startsWith('\\');
}

CtxContext.prototype.get = async function() {
	return await this.connection.get(this.getQuery());
}

CtxContext.prototype.put = async function(item) {
	//to avoid casing
	var sub = this.sub();
	sub.query = item;
	return await this.connection.put(sub.getQuery());
}

CtxContext.prototype.sub = function(query) {
	return new CtxContext(this, query);
}
