var l = function(o) {console.log(o); return o;},
		require = require || undefined,
		module = module || {};
		
if(require) var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = CtxConnection;

function CtxConnection(base, user) {
	this.base = base;
	this.user = user;
	this.root = new CtxContext(this, '');
}

CtxConnection.prototype.getUrl = function() {
	return (this.base.startsWith('http') ? '' : 'http://') + this.base + '/ctx/' + this.user;	
}

CtxConnection.prototype.getText = function() {
	return '';	
}

function CtxContext(parent, text) {
	this.parent = parent;
	this.setText(text);
}

CtxContext.prototype.setText = function(text) {
	this.text = (text || '').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

CtxContext.prototype.getUrl = function() {
	return this.parent.getUrl();
}

CtxContext.prototype.getText = function() {
	return this.parent.getText() + ' ' + this.text;
}

CtxContext.prototype.get = function(text, cb) {
	this.ajax(this.getUrl() + '/get/' + encodeURIComponent(this.getText() + ' ' + text), cb, this);
}

CtxContext.prototype.put = function(text, cb) {
	this.ajax(this.getUrl() + '/put/' + encodeURIComponent(this.getText() + ' ' + text), cb, this);
}

CtxContext.prototype.sub = function(text) {
	return new CtxContext(this, text);
}

CtxContext.prototype.ajax = function(url, cb, ctx) {
	var xhr = new XMLHttpRequest();

	xhr.open('GET', url, true);
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4)
			cb(xhr.responseText, ctx);
	}
	
	xhr.send();
}
