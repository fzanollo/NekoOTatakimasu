(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,matchedPos: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.remove = function(a,obj) {
	var i = a.indexOf(obj);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.array = function(it) {
	var a = [];
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
};
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
var Std = function() { };
Std.__name__ = true;
Std["is"] = function(v,t) {
	return js_Boot.__instanceof(v,t);
};
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var flambe_util_Disposable = function() { };
flambe_util_Disposable.__name__ = true;
flambe_util_Disposable.prototype = {
	__class__: flambe_util_Disposable
};
var flambe_Component = function() {
	this._flags = 0;
	this.next = null;
	this.owner = null;
};
flambe_Component.__name__ = true;
flambe_Component.__interfaces__ = [flambe_util_Disposable];
flambe_Component.prototype = {
	onAdded: function() {
	}
	,onRemoved: function() {
	}
	,onStart: function() {
	}
	,onStop: function() {
	}
	,onUpdate: function(dt) {
	}
	,dispose: function() {
		if(this.owner != null) this.owner.remove(this);
	}
	,get_name: function() {
		return null;
	}
	,__class__: flambe_Component
};
var flambe_Entity = function() {
	this.firstComponent = null;
	this.next = null;
	this.firstChild = null;
	this.parent = null;
	this._compMap = { };
};
flambe_Entity.__name__ = true;
flambe_Entity.__interfaces__ = [flambe_util_Disposable];
flambe_Entity.prototype = {
	add: function(component) {
		if(component.owner != null) component.owner.remove(component);
		var name = component.get_name();
		var prev = this._compMap[name];
		if(prev != null) this.remove(prev);
		this._compMap[name] = component;
		var tail = null;
		var p = this.firstComponent;
		while(p != null) {
			tail = p;
			p = p.next;
		}
		if(tail != null) tail.next = component; else this.firstComponent = component;
		component.owner = this;
		component.next = null;
		component.onAdded();
		return this;
	}
	,remove: function(component) {
		var prev = null;
		var p = this.firstComponent;
		while(p != null) {
			var next = p.next;
			if(p == component) {
				if(prev == null) this.firstComponent = next; else {
					prev.owner = this;
					prev.next = next;
				}
				delete(this._compMap[p.get_name()]);
				if((p._flags & 1) != 0) {
					p.onStop();
					p._flags = p._flags & -2;
				}
				p.onRemoved();
				p.owner = null;
				p.next = null;
				return true;
			}
			prev = p;
			p = next;
		}
		return false;
	}
	,addChild: function(entity,append) {
		if(append == null) append = true;
		if(entity.parent != null) entity.parent.removeChild(entity);
		entity.parent = this;
		if(append) {
			var tail = null;
			var p = this.firstChild;
			while(p != null) {
				tail = p;
				p = p.next;
			}
			if(tail != null) tail.next = entity; else this.firstChild = entity;
		} else {
			entity.next = this.firstChild;
			this.firstChild = entity;
		}
		return this;
	}
	,removeChild: function(entity) {
		var prev = null;
		var p = this.firstChild;
		while(p != null) {
			var next = p.next;
			if(p == entity) {
				if(prev == null) this.firstChild = next; else prev.next = next;
				p.parent = null;
				p.next = null;
				return;
			}
			prev = p;
			p = next;
		}
	}
	,disposeChildren: function() {
		while(this.firstChild != null) this.firstChild.dispose();
	}
	,dispose: function() {
		if(this.parent != null) this.parent.removeChild(this);
		while(this.firstComponent != null) this.firstComponent.dispose();
		this.disposeChildren();
	}
	,__class__: flambe_Entity
};
var flambe_util_PackageLog = function() { };
flambe_util_PackageLog.__name__ = true;
var flambe_platform_Platform = function() { };
flambe_platform_Platform.__name__ = true;
flambe_platform_Platform.prototype = {
	__class__: flambe_platform_Platform
};
var flambe_platform_html_HtmlPlatform = function() {
};
flambe_platform_html_HtmlPlatform.__name__ = true;
flambe_platform_html_HtmlPlatform.__interfaces__ = [flambe_platform_Platform];
flambe_platform_html_HtmlPlatform.prototype = {
	init: function() {
		var _g = this;
		flambe_platform_html_HtmlUtil.fixAndroidMath();
		var canvas = null;
		try {
			canvas = window.flambe.canvas;
		} catch( error ) {
			if (error instanceof js__$Boot_HaxeError) error = error.val;
		}
		canvas.setAttribute("tabindex","0");
		canvas.style.outlineStyle = "none";
		canvas.style.webkitTapHighlightColor = "transparent";
		canvas.setAttribute("moz-opaque","true");
		this._stage = new flambe_platform_html_HtmlStage(canvas);
		this._pointer = new flambe_platform_BasicPointer();
		this._mouse = new flambe_platform_html_HtmlMouse(this._pointer,canvas);
		this._renderer = this.createRenderer(canvas);
		this.mainLoop = new flambe_platform_MainLoop();
		this.musicPlaying = false;
		this._canvas = canvas;
		this._container = canvas.parentElement;
		this._container.style.overflow = "hidden";
		this._container.style.position = "relative";
		this._container.style.msTouchAction = "none";
		var lastTouchTime = 0;
		var onMouse = function(event) {
			if(event.timeStamp - lastTouchTime < 1000) return;
			var bounds = canvas.getBoundingClientRect();
			var x = _g.getX(event,bounds);
			var y = _g.getY(event,bounds);
			var _g1 = event.type;
			switch(_g1) {
			case "mousedown":
				if(event.target == canvas) {
					event.preventDefault();
					_g._mouse.submitDown(x,y,event.button);
					canvas.focus();
				}
				break;
			case "mousemove":
				_g._mouse.submitMove(x,y);
				break;
			case "mouseup":
				_g._mouse.submitUp(x,y,event.button);
				break;
			case "mousewheel":case "DOMMouseScroll":
				var velocity;
				if(event.type == "mousewheel") velocity = event.wheelDelta / 40; else velocity = -event.detail;
				if(_g._mouse.submitScroll(x,y,velocity)) event.preventDefault();
				break;
			}
		};
		window.addEventListener("mousedown",onMouse,false);
		window.addEventListener("mousemove",onMouse,false);
		window.addEventListener("mouseup",onMouse,false);
		canvas.addEventListener("mousewheel",onMouse,false);
		canvas.addEventListener("DOMMouseScroll",onMouse,false);
		canvas.addEventListener("contextmenu",function(event1) {
			event1.preventDefault();
		},false);
		var standardTouch = typeof(window.ontouchstart) != "undefined";
		var msTouch = 'msMaxTouchPoints' in window.navigator && (window.navigator.msMaxTouchPoints > 1);
		if(standardTouch || msTouch) {
			var basicTouch = new flambe_platform_BasicTouch(this._pointer,standardTouch?4:window.navigator.msMaxTouchPoints);
			this._touch = basicTouch;
			var onTouch = function(event2) {
				var changedTouches;
				if(standardTouch) changedTouches = event2.changedTouches; else changedTouches = [event2];
				var bounds1 = event2.target.getBoundingClientRect();
				lastTouchTime = event2.timeStamp;
				var _g2 = event2.type;
				switch(_g2) {
				case "touchstart":case "MSPointerDown":case "pointerdown":
					event2.preventDefault();
					if(flambe_platform_html_HtmlUtil.SHOULD_HIDE_MOBILE_BROWSER) flambe_platform_html_HtmlUtil.hideMobileBrowser();
					var _g11 = 0;
					while(_g11 < changedTouches.length) {
						var touch = changedTouches[_g11];
						++_g11;
						var x1 = _g.getX(touch,bounds1);
						var y1 = _g.getY(touch,bounds1);
						var id;
						id = (standardTouch?touch.identifier:touch.pointerId) | 0;
						basicTouch.submitDown(id,x1,y1);
					}
					break;
				case "touchmove":case "MSPointerMove":case "pointermove":
					event2.preventDefault();
					var _g12 = 0;
					while(_g12 < changedTouches.length) {
						var touch1 = changedTouches[_g12];
						++_g12;
						var x2 = _g.getX(touch1,bounds1);
						var y2 = _g.getY(touch1,bounds1);
						var id1;
						id1 = (standardTouch?touch1.identifier:touch1.pointerId) | 0;
						basicTouch.submitMove(id1,x2,y2);
					}
					break;
				case "touchend":case "touchcancel":case "MSPointerUp":case "pointerup":
					var _g13 = 0;
					while(_g13 < changedTouches.length) {
						var touch2 = changedTouches[_g13];
						++_g13;
						var x3 = _g.getX(touch2,bounds1);
						var y3 = _g.getY(touch2,bounds1);
						var id2;
						id2 = (standardTouch?touch2.identifier:touch2.pointerId) | 0;
						basicTouch.submitUp(id2,x3,y3);
					}
					break;
				}
			};
			if(standardTouch) {
				canvas.addEventListener("touchstart",onTouch,false);
				canvas.addEventListener("touchmove",onTouch,false);
				canvas.addEventListener("touchend",onTouch,false);
				canvas.addEventListener("touchcancel",onTouch,false);
			} else {
				canvas.addEventListener("MSPointerDown",onTouch,false);
				canvas.addEventListener("MSPointerMove",onTouch,false);
				canvas.addEventListener("MSPointerUp",onTouch,false);
			}
		} else this._touch = new flambe_platform_DummyTouch();
		var oldErrorHandler = window.onerror;
		window.onerror = function(message,url,line) {
			flambe_System.uncaughtError.emit(message);
			if(oldErrorHandler != null) return oldErrorHandler(message,url,line); else return false;
		};
		var hiddenApi = flambe_platform_html_HtmlUtil.loadExtension("hidden",window.document);
		if(hiddenApi.value != null) {
			var onVisibilityChanged = function(_) {
				flambe_System.hidden.set__(Reflect.field(window.document,hiddenApi.field));
			};
			onVisibilityChanged(null);
			window.document.addEventListener(hiddenApi.prefix + "visibilitychange",onVisibilityChanged,false);
		} else {
			var onPageTransitionChange = function(event3) {
				flambe_System.hidden.set__(event3.type == "pagehide");
			};
			window.addEventListener("pageshow",onPageTransitionChange,false);
			window.addEventListener("pagehide",onPageTransitionChange,false);
		}
		flambe_System.hidden.get_changed().connect(function(hidden,_1) {
			if(!hidden) _g._skipFrame = true;
		});
		this._skipFrame = false;
		this._lastUpdate = Date.now();
		var requestAnimationFrame = flambe_platform_html_HtmlUtil.loadExtension("requestAnimationFrame").value;
		if(requestAnimationFrame != null) {
			var performance = window.performance;
			var hasPerfNow = performance != null && flambe_platform_html_HtmlUtil.polyfill("now",performance);
			if(hasPerfNow) this._lastUpdate = performance.now(); else null;
			var updateFrame = null;
			updateFrame = function(now) {
				_g.update(hasPerfNow?performance.now():now);
				requestAnimationFrame(updateFrame,canvas);
			};
			requestAnimationFrame(updateFrame,canvas);
		} else window.setInterval(function() {
			_g.update(Date.now());
		},16);
		flambe_Log.info("Initialized HTML platform",["renderer",this._renderer.get_type()]);
	}
	,loadAssetPack: function(manifest) {
		return new flambe_platform_html_HtmlAssetPackLoader(this,manifest).promise;
	}
	,getStage: function() {
		return this._stage;
	}
	,getLocale: function() {
		var locale = window.navigator.language;
		if(locale == null) locale = window.navigator.userLanguage;
		return locale;
	}
	,update: function(now) {
		var dt = (now - this._lastUpdate) / 1000;
		this._lastUpdate = now;
		if(flambe_System.hidden._value) return;
		if(this._skipFrame) {
			this._skipFrame = false;
			return;
		}
		this.mainLoop.update(dt);
		this.mainLoop.render(this._renderer);
	}
	,getPointer: function() {
		return this._pointer;
	}
	,getKeyboard: function() {
		var _g1 = this;
		if(this._keyboard == null) {
			this._keyboard = new flambe_platform_BasicKeyboard();
			var onKey = function(event) {
				var _g = event.type;
				switch(_g) {
				case "keydown":
					if(_g1._keyboard.submitDown(event.keyCode)) event.preventDefault();
					break;
				case "keyup":
					_g1._keyboard.submitUp(event.keyCode);
					break;
				}
			};
			this._canvas.addEventListener("keydown",onKey,false);
			this._canvas.addEventListener("keyup",onKey,false);
		}
		return this._keyboard;
	}
	,getRenderer: function() {
		return this._renderer;
	}
	,getX: function(event,bounds) {
		return (event.clientX - bounds.left) * this._stage.get_width() / bounds.width;
	}
	,getY: function(event,bounds) {
		return (event.clientY - bounds.top) * this._stage.get_height() / bounds.height;
	}
	,createRenderer: function(canvas) {
		try {
			var gl = js_html__$CanvasElement_CanvasUtil.getContextWebGL(canvas,{ alpha : false, depth : false, failIfMajorPerformanceCaveat : true});
			if(gl != null) {
				if(flambe_platform_html_HtmlUtil.detectSlowDriver(gl)) null; else return new flambe_platform_html_WebGLRenderer(this._stage,gl);
			}
		} catch( _ ) {
			if (_ instanceof js__$Boot_HaxeError) _ = _.val;
		}
		return new flambe_platform_html_CanvasRenderer(canvas);
		return null;
	}
	,__class__: flambe_platform_html_HtmlPlatform
};
var flambe_util_Value = function(value,listener) {
	this._value = value;
	if(listener != null) this._changed = new flambe_util_Signal2(listener); else this._changed = null;
};
flambe_util_Value.__name__ = true;
flambe_util_Value.prototype = {
	watch: function(listener) {
		listener(this._value,this._value);
		return this.get_changed().connect(listener);
	}
	,set__: function(newValue) {
		var oldValue = this._value;
		if(newValue != oldValue) {
			this._value = newValue;
			if(this._changed != null) this._changed.emit(newValue,oldValue);
		}
		return newValue;
	}
	,get_changed: function() {
		if(this._changed == null) this._changed = new flambe_util_Signal2();
		return this._changed;
	}
	,__class__: flambe_util_Value
};
var flambe_util_SignalConnection = function(signal,listener) {
	this._next = null;
	this._signal = signal;
	this._listener = listener;
	this.stayInList = true;
};
flambe_util_SignalConnection.__name__ = true;
flambe_util_SignalConnection.__interfaces__ = [flambe_util_Disposable];
flambe_util_SignalConnection.prototype = {
	once: function() {
		this.stayInList = false;
		return this;
	}
	,dispose: function() {
		if(this._signal != null) {
			this._signal.disconnect(this);
			this._signal = null;
		}
	}
	,__class__: flambe_util_SignalConnection
};
var flambe_util_SignalBase = function(listener) {
	if(listener != null) this._head = new flambe_util_SignalConnection(this,listener); else this._head = null;
	this._deferredTasks = null;
};
flambe_util_SignalBase.__name__ = true;
flambe_util_SignalBase.prototype = {
	connectImpl: function(listener,prioritize) {
		var _g = this;
		var conn = new flambe_util_SignalConnection(this,listener);
		if(this._head == flambe_util_SignalBase.DISPATCHING_SENTINEL) this.defer(function() {
			_g.listAdd(conn,prioritize);
		}); else this.listAdd(conn,prioritize);
		return conn;
	}
	,disconnect: function(conn) {
		var _g = this;
		if(this._head == flambe_util_SignalBase.DISPATCHING_SENTINEL) this.defer(function() {
			_g.listRemove(conn);
		}); else this.listRemove(conn);
	}
	,defer: function(fn) {
		var tail = null;
		var p = this._deferredTasks;
		while(p != null) {
			tail = p;
			p = p.next;
		}
		var task = new flambe_util__$SignalBase_Task(fn);
		if(tail != null) tail.next = task; else this._deferredTasks = task;
	}
	,willEmit: function() {
		var snapshot = this._head;
		this._head = flambe_util_SignalBase.DISPATCHING_SENTINEL;
		return snapshot;
	}
	,didEmit: function(head) {
		this._head = head;
		var snapshot = this._deferredTasks;
		this._deferredTasks = null;
		while(snapshot != null) {
			snapshot.fn();
			snapshot = snapshot.next;
		}
	}
	,listAdd: function(conn,prioritize) {
		if(prioritize) {
			conn._next = this._head;
			this._head = conn;
		} else {
			var tail = null;
			var p = this._head;
			while(p != null) {
				tail = p;
				p = p._next;
			}
			if(tail != null) tail._next = conn; else this._head = conn;
		}
	}
	,listRemove: function(conn) {
		var prev = null;
		var p = this._head;
		while(p != null) {
			if(p == conn) {
				var next = p._next;
				if(prev == null) this._head = next; else prev._next = next;
				return;
			}
			prev = p;
			p = p._next;
		}
	}
	,__class__: flambe_util_SignalBase
};
var flambe_util_Signal2 = function(listener) {
	flambe_util_SignalBase.call(this,listener);
};
flambe_util_Signal2.__name__ = true;
flambe_util_Signal2.__super__ = flambe_util_SignalBase;
flambe_util_Signal2.prototype = $extend(flambe_util_SignalBase.prototype,{
	connect: function(listener,prioritize) {
		if(prioritize == null) prioritize = false;
		return this.connectImpl(listener,prioritize);
	}
	,emit: function(arg1,arg2) {
		var _g = this;
		if(this._head == flambe_util_SignalBase.DISPATCHING_SENTINEL) this.defer(function() {
			_g.emitImpl(arg1,arg2);
		}); else this.emitImpl(arg1,arg2);
	}
	,emitImpl: function(arg1,arg2) {
		var head = this.willEmit();
		var p = head;
		while(p != null) {
			p._listener(arg1,arg2);
			if(!p.stayInList) p.dispose();
			p = p._next;
		}
		this.didEmit(head);
	}
	,__class__: flambe_util_Signal2
});
var flambe_util_Signal1 = function(listener) {
	flambe_util_SignalBase.call(this,listener);
};
flambe_util_Signal1.__name__ = true;
flambe_util_Signal1.__super__ = flambe_util_SignalBase;
flambe_util_Signal1.prototype = $extend(flambe_util_SignalBase.prototype,{
	connect: function(listener,prioritize) {
		if(prioritize == null) prioritize = false;
		return this.connectImpl(listener,prioritize);
	}
	,emit: function(arg1) {
		var _g = this;
		if(this._head == flambe_util_SignalBase.DISPATCHING_SENTINEL) this.defer(function() {
			_g.emitImpl(arg1);
		}); else this.emitImpl(arg1);
	}
	,emitImpl: function(arg1) {
		var head = this.willEmit();
		var p = head;
		while(p != null) {
			p._listener(arg1);
			if(!p.stayInList) p.dispose();
			p = p._next;
		}
		this.didEmit(head);
	}
	,__class__: flambe_util_Signal1
});
var flambe_animation_AnimatedFloat = function(value,listener) {
	this._behavior = null;
	flambe_util_Value.call(this,value,listener);
};
flambe_animation_AnimatedFloat.__name__ = true;
flambe_animation_AnimatedFloat.__super__ = flambe_util_Value;
flambe_animation_AnimatedFloat.prototype = $extend(flambe_util_Value.prototype,{
	set__: function(value) {
		this._behavior = null;
		return flambe_util_Value.prototype.set__.call(this,value);
	}
	,update: function(dt) {
		if(this._behavior != null) {
			flambe_util_Value.prototype.set__.call(this,this._behavior.update(dt));
			if(this._behavior.isComplete()) this._behavior = null;
		}
	}
	,animate: function(from,to,seconds,easing) {
		this.set__(from);
		this.animateTo(to,seconds,easing);
	}
	,animateTo: function(to,seconds,easing) {
		this.set_behavior(new flambe_animation_Tween(this._value,to,seconds,easing));
	}
	,set_behavior: function(behavior) {
		this._behavior = behavior;
		this.update(0);
		return behavior;
	}
	,__class__: flambe_animation_AnimatedFloat
});
var flambe_System = function() { };
flambe_System.__name__ = true;
flambe_System.init = function() {
	if(!flambe_System._calledInit) {
		flambe_System._platform.init();
		flambe_System._calledInit = true;
	}
};
flambe_System.loadAssetPack = function(manifest) {
	return flambe_System._platform.loadAssetPack(manifest);
};
var flambe_Log = function() { };
flambe_Log.__name__ = true;
flambe_Log.info = function(text,args) {
	null;
};
flambe_Log.__super__ = flambe_util_PackageLog;
flambe_Log.prototype = $extend(flambe_util_PackageLog.prototype,{
	__class__: flambe_Log
});
var flambe_SpeedAdjuster = function() {
	this._realDt = 0;
};
flambe_SpeedAdjuster.__name__ = true;
flambe_SpeedAdjuster.__super__ = flambe_Component;
flambe_SpeedAdjuster.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "SpeedAdjuster_5";
	}
	,onUpdate: function(dt) {
		if(this._realDt > 0) {
			dt = this._realDt;
			this._realDt = 0;
		}
		this.scale.update(dt);
	}
	,__class__: flambe_SpeedAdjuster
});
var flambe_animation_Behavior = function() { };
flambe_animation_Behavior.__name__ = true;
flambe_animation_Behavior.prototype = {
	__class__: flambe_animation_Behavior
};
var flambe_animation_Ease = function() { };
flambe_animation_Ease.__name__ = true;
flambe_animation_Ease.linear = function(t) {
	return t;
};
flambe_animation_Ease.quadOut = function(t) {
	return t * (2 - t);
};
flambe_animation_Ease.backOut = function(t) {
	return 1 - --t * t * (-2.70158 * t - 1.70158);
};
var flambe_animation_Tween = function(from,to,seconds,easing) {
	this._from = from;
	this._to = to;
	this._duration = seconds;
	this.elapsed = 0;
	if(easing != null) this._easing = easing; else this._easing = flambe_animation_Ease.linear;
};
flambe_animation_Tween.__name__ = true;
flambe_animation_Tween.__interfaces__ = [flambe_animation_Behavior];
flambe_animation_Tween.prototype = {
	update: function(dt) {
		this.elapsed += dt;
		if(this.elapsed >= this._duration) return this._to; else return this._from + (this._to - this._from) * this._easing(this.elapsed / this._duration);
	}
	,isComplete: function() {
		return this.elapsed >= this._duration;
	}
	,__class__: flambe_animation_Tween
};
var flambe_asset_Asset = function() { };
flambe_asset_Asset.__name__ = true;
flambe_asset_Asset.__interfaces__ = [flambe_util_Disposable];
flambe_asset_Asset.prototype = {
	__class__: flambe_asset_Asset
};
var flambe_asset_AssetFormat = { __ename__ : true, __constructs__ : ["WEBP","JXR","PNG","JPG","GIF","DDS","PVR","PKM","MP3","M4A","OPUS","OGG","WAV","Data"] };
flambe_asset_AssetFormat.WEBP = ["WEBP",0];
flambe_asset_AssetFormat.WEBP.toString = $estr;
flambe_asset_AssetFormat.WEBP.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.JXR = ["JXR",1];
flambe_asset_AssetFormat.JXR.toString = $estr;
flambe_asset_AssetFormat.JXR.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.PNG = ["PNG",2];
flambe_asset_AssetFormat.PNG.toString = $estr;
flambe_asset_AssetFormat.PNG.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.JPG = ["JPG",3];
flambe_asset_AssetFormat.JPG.toString = $estr;
flambe_asset_AssetFormat.JPG.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.GIF = ["GIF",4];
flambe_asset_AssetFormat.GIF.toString = $estr;
flambe_asset_AssetFormat.GIF.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.DDS = ["DDS",5];
flambe_asset_AssetFormat.DDS.toString = $estr;
flambe_asset_AssetFormat.DDS.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.PVR = ["PVR",6];
flambe_asset_AssetFormat.PVR.toString = $estr;
flambe_asset_AssetFormat.PVR.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.PKM = ["PKM",7];
flambe_asset_AssetFormat.PKM.toString = $estr;
flambe_asset_AssetFormat.PKM.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.MP3 = ["MP3",8];
flambe_asset_AssetFormat.MP3.toString = $estr;
flambe_asset_AssetFormat.MP3.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.M4A = ["M4A",9];
flambe_asset_AssetFormat.M4A.toString = $estr;
flambe_asset_AssetFormat.M4A.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.OPUS = ["OPUS",10];
flambe_asset_AssetFormat.OPUS.toString = $estr;
flambe_asset_AssetFormat.OPUS.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.OGG = ["OGG",11];
flambe_asset_AssetFormat.OGG.toString = $estr;
flambe_asset_AssetFormat.OGG.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.WAV = ["WAV",12];
flambe_asset_AssetFormat.WAV.toString = $estr;
flambe_asset_AssetFormat.WAV.__enum__ = flambe_asset_AssetFormat;
flambe_asset_AssetFormat.Data = ["Data",13];
flambe_asset_AssetFormat.Data.toString = $estr;
flambe_asset_AssetFormat.Data.__enum__ = flambe_asset_AssetFormat;
var flambe_asset_AssetEntry = function(name,url,format,bytes) {
	this.name = name;
	this.url = url;
	this.format = format;
	this.bytes = bytes;
};
flambe_asset_AssetEntry.__name__ = true;
flambe_asset_AssetEntry.prototype = {
	__class__: flambe_asset_AssetEntry
};
var flambe_asset_AssetPack = function() { };
flambe_asset_AssetPack.__name__ = true;
flambe_asset_AssetPack.__interfaces__ = [flambe_util_Disposable];
flambe_asset_AssetPack.prototype = {
	__class__: flambe_asset_AssetPack
};
var flambe_asset_File = function() { };
flambe_asset_File.__name__ = true;
flambe_asset_File.__interfaces__ = [flambe_asset_Asset];
flambe_asset_File.prototype = {
	__class__: flambe_asset_File
};
var flambe_asset_Manifest = function() {
	this._remoteBase = null;
	this._localBase = null;
	this._entries = [];
};
flambe_asset_Manifest.__name__ = true;
flambe_asset_Manifest.fromAssets = function(packName,required) {
	if(required == null) required = true;
	var packData = Reflect.field(haxe_rtti_Meta.getType(flambe_asset_Manifest).assets[0],packName);
	if(packData == null) {
		if(required) throw new js__$Boot_HaxeError(flambe_util_Strings.withFields("Missing asset pack",["name",packName]));
		return null;
	}
	var manifest = new flambe_asset_Manifest();
	manifest.set_localBase("assets");
	var _g = 0;
	while(_g < packData.length) {
		var asset = packData[_g];
		++_g;
		var name = asset.name;
		var path = packName + "/" + name + "?v=" + Std.string(asset.md5);
		var format = flambe_asset_Manifest.inferFormat(name);
		if(format != flambe_asset_AssetFormat.Data) name = flambe_util_Strings.removeFileExtension(name);
		manifest.add(name,path,asset.bytes,format);
	}
	return manifest;
};
flambe_asset_Manifest.fromAssetsLocalized = function(packName,locale,required) {
	if(required == null) required = true;
	if(locale == null) locale = flambe_System._platform.getLocale();
	if(locale != null) {
		var parts = locale.split("-");
		while(parts.length > 0) {
			var manifest = flambe_asset_Manifest.fromAssets(packName + "_" + parts.join("-"),false);
			if(manifest != null) return manifest;
			parts.pop();
		}
	}
	return flambe_asset_Manifest.fromAssets(packName,required);
};
flambe_asset_Manifest.inferFormat = function(url) {
	var extension = flambe_util_Strings.getUrlExtension(url);
	if(extension != null) {
		var _g = extension.toLowerCase();
		switch(_g) {
		case "gif":
			return flambe_asset_AssetFormat.GIF;
		case "jpg":case "jpeg":
			return flambe_asset_AssetFormat.JPG;
		case "jxr":case "wdp":
			return flambe_asset_AssetFormat.JXR;
		case "png":
			return flambe_asset_AssetFormat.PNG;
		case "webp":
			return flambe_asset_AssetFormat.WEBP;
		case "dds":
			return flambe_asset_AssetFormat.DDS;
		case "pvr":
			return flambe_asset_AssetFormat.PVR;
		case "pkm":
			return flambe_asset_AssetFormat.PKM;
		case "m4a":
			return flambe_asset_AssetFormat.M4A;
		case "mp3":
			return flambe_asset_AssetFormat.MP3;
		case "ogg":
			return flambe_asset_AssetFormat.OGG;
		case "opus":
			return flambe_asset_AssetFormat.OPUS;
		case "wav":
			return flambe_asset_AssetFormat.WAV;
		}
	} else null;
	return flambe_asset_AssetFormat.Data;
};
flambe_asset_Manifest.prototype = {
	add: function(name,url,bytes,format) {
		if(bytes == null) bytes = 0;
		if(format == null) format = flambe_asset_Manifest.inferFormat(url);
		var entry = new flambe_asset_AssetEntry(name,url,format,bytes);
		this._entries.push(entry);
		return entry;
	}
	,iterator: function() {
		return HxOverrides.iter(this._entries);
	}
	,getFullURL: function(entry) {
		var basePath;
		if(this.get_remoteBase() != null && flambe_asset_Manifest._supportsCrossOrigin) basePath = this.get_remoteBase(); else basePath = this.get_localBase();
		if(basePath != null) return flambe_util_Strings.joinPath(basePath,entry.url); else return entry.url;
	}
	,get_localBase: function() {
		return this._localBase;
	}
	,set_localBase: function(localBase) {
		if(localBase != null) flambe_util_Assert.that(!StringTools.startsWith(localBase,"http://") && !StringTools.startsWith(localBase,"https://"),"localBase must be a path on the same domain, NOT starting with http(s)://",null);
		return this._localBase = localBase;
	}
	,get_remoteBase: function() {
		return this._remoteBase;
	}
	,__class__: flambe_asset_Manifest
};
var flambe_display_BlendMode = { __ename__ : true, __constructs__ : ["Normal","Add","Multiply","Screen","Mask","Copy"] };
flambe_display_BlendMode.Normal = ["Normal",0];
flambe_display_BlendMode.Normal.toString = $estr;
flambe_display_BlendMode.Normal.__enum__ = flambe_display_BlendMode;
flambe_display_BlendMode.Add = ["Add",1];
flambe_display_BlendMode.Add.toString = $estr;
flambe_display_BlendMode.Add.__enum__ = flambe_display_BlendMode;
flambe_display_BlendMode.Multiply = ["Multiply",2];
flambe_display_BlendMode.Multiply.toString = $estr;
flambe_display_BlendMode.Multiply.__enum__ = flambe_display_BlendMode;
flambe_display_BlendMode.Screen = ["Screen",3];
flambe_display_BlendMode.Screen.toString = $estr;
flambe_display_BlendMode.Screen.__enum__ = flambe_display_BlendMode;
flambe_display_BlendMode.Mask = ["Mask",4];
flambe_display_BlendMode.Mask.toString = $estr;
flambe_display_BlendMode.Mask.__enum__ = flambe_display_BlendMode;
flambe_display_BlendMode.Copy = ["Copy",5];
flambe_display_BlendMode.Copy.toString = $estr;
flambe_display_BlendMode.Copy.__enum__ = flambe_display_BlendMode;
var flambe_math_Point = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
flambe_math_Point.__name__ = true;
flambe_math_Point.prototype = {
	__class__: flambe_math_Point
};
var flambe_display_Sprite = function() {
	this.scissor = null;
	this.blendMode = null;
	var _g = this;
	flambe_Component.call(this);
	this._flags = this._flags | 54;
	this._localMatrix = new flambe_math_Matrix();
	var dirtyMatrix = function(_,_1) {
		_g._flags = _g._flags | 24;
	};
	this.x = new flambe_animation_AnimatedFloat(0,dirtyMatrix);
	this.y = new flambe_animation_AnimatedFloat(0,dirtyMatrix);
	this.rotation = new flambe_animation_AnimatedFloat(0,dirtyMatrix);
	this.scaleX = new flambe_animation_AnimatedFloat(1,dirtyMatrix);
	this.scaleY = new flambe_animation_AnimatedFloat(1,dirtyMatrix);
	this.anchorX = new flambe_animation_AnimatedFloat(0,dirtyMatrix);
	this.anchorY = new flambe_animation_AnimatedFloat(0,dirtyMatrix);
	this.alpha = new flambe_animation_AnimatedFloat(1);
};
flambe_display_Sprite.__name__ = true;
flambe_display_Sprite.hitTest = function(entity,x,y) {
	var sprite = entity._compMap.Sprite_2;
	if(sprite != null) {
		if(!((sprite._flags & 6) == 6)) return null;
		if(sprite.getLocalMatrix().inverseTransform(x,y,flambe_display_Sprite._scratchPoint)) {
			x = flambe_display_Sprite._scratchPoint.x;
			y = flambe_display_Sprite._scratchPoint.y;
		}
		var scissor = sprite.scissor;
		if(scissor != null && !scissor.contains(x,y)) return null;
	}
	var result = flambe_display_Sprite.hitTestBackwards(entity.firstChild,x,y);
	if(result != null) return result;
	if(sprite != null && sprite.containsLocal(x,y)) return sprite; else return null;
};
flambe_display_Sprite.getBounds = function(entity,result) {
	if(result == null) result = new flambe_math_Rectangle();
	result.set(1.79769313486231e+308,1.79769313486231e+308,-1.79769313486231e+308,-1.79769313486231e+308);
	flambe_display_Sprite.getBoundsImpl(entity,null,result);
	result.width -= result.x;
	result.height -= result.y;
	return result;
};
flambe_display_Sprite.render = function(entity,g) {
	var sprite = entity._compMap.Sprite_2;
	if(sprite != null) {
		var alpha = sprite.alpha._value;
		if(!((sprite._flags & 2) != 0) || alpha <= 0) return;
		g.save();
		if(alpha < 1) g.multiplyAlpha(alpha);
		if(sprite.blendMode != null) g.setBlendMode(sprite.blendMode);
		var matrix = sprite.getLocalMatrix();
		var m02 = matrix.m02;
		var m12 = matrix.m12;
		if((sprite._flags & 32) != 0) {
			m02 = Math.round(m02);
			m12 = Math.round(m12);
		}
		g.transform(matrix.m00,matrix.m10,matrix.m01,matrix.m11,m02,m12);
		var scissor = sprite.scissor;
		if(scissor != null) g.applyScissor(scissor.x,scissor.y,scissor.width,scissor.height);
		sprite.draw(g);
	}
	var director = entity._compMap.Director_4;
	if(director != null) {
		var scenes = director.occludedScenes;
		var _g = 0;
		while(_g < scenes.length) {
			var scene = scenes[_g];
			++_g;
			flambe_display_Sprite.render(scene,g);
		}
	}
	var p = entity.firstChild;
	while(p != null) {
		var next = p.next;
		flambe_display_Sprite.render(p,g);
		p = next;
	}
	if(sprite != null) g.restore();
};
flambe_display_Sprite.hitTestBackwards = function(entity,x,y) {
	if(entity != null) {
		var result = flambe_display_Sprite.hitTestBackwards(entity.next,x,y);
		if(result != null) return result; else return flambe_display_Sprite.hitTest(entity,x,y);
	}
	return null;
};
flambe_display_Sprite.getBoundsImpl = function(entity,matrix,result) {
	var sprite = entity._compMap.Sprite_2;
	if(sprite != null) {
		if(matrix != null) matrix = flambe_math_Matrix.multiply(matrix,sprite.getLocalMatrix()); else matrix = sprite.getLocalMatrix();
		var x1 = 0.0;
		var y1 = 0.0;
		var x2 = sprite.getNaturalWidth();
		var y2 = sprite.getNaturalHeight();
		if(x2 > x1 && y2 > y1) {
			flambe_display_Sprite.extendRect(matrix,x1,y1,result);
			flambe_display_Sprite.extendRect(matrix,x2,y1,result);
			flambe_display_Sprite.extendRect(matrix,x2,y2,result);
			flambe_display_Sprite.extendRect(matrix,x1,y2,result);
		}
	}
	var director = entity._compMap.Director_4;
	if(director != null) {
		var scenes = director.occludedScenes;
		var ii = 0;
		var ll = scenes.length;
		while(ii < ll) {
			flambe_display_Sprite.getBoundsImpl(scenes[ii],matrix,result);
			++ii;
		}
	}
	var p = entity.firstChild;
	while(p != null) {
		var next = p.next;
		flambe_display_Sprite.getBoundsImpl(p,matrix,result);
		p = next;
	}
};
flambe_display_Sprite.extendRect = function(matrix,x,y,rect) {
	var p = matrix.transform(x,y,flambe_display_Sprite._scratchPoint);
	x = p.x;
	y = p.y;
	if(x < rect.x) rect.x = x;
	if(y < rect.y) rect.y = y;
	if(x > rect.width) rect.width = x;
	if(y > rect.height) rect.height = y;
};
flambe_display_Sprite.__super__ = flambe_Component;
flambe_display_Sprite.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "Sprite_2";
	}
	,getNaturalWidth: function() {
		return 0;
	}
	,getNaturalHeight: function() {
		return 0;
	}
	,containsLocal: function(localX,localY) {
		return localX >= 0 && localX < this.getNaturalWidth() && localY >= 0 && localY < this.getNaturalHeight();
	}
	,getLocalMatrix: function() {
		if((this._flags & 8) != 0) {
			this._flags = this._flags & -9;
			this._localMatrix.compose(this.x._value,this.y._value,this.scaleX._value,this.scaleY._value,this.rotation._value * 3.141592653589793 / 180);
			this._localMatrix.translate(-this.anchorX._value,-this.anchorY._value);
		}
		return this._localMatrix;
	}
	,centerAnchor: function() {
		this.anchorX.set__(this.getNaturalWidth() / 2);
		this.anchorY.set__(this.getNaturalHeight() / 2);
		return this;
	}
	,setXY: function(x,y) {
		this.x.set__(x);
		this.y.set__(y);
		return this;
	}
	,setScale: function(scale) {
		this.scaleX.set__(scale);
		this.scaleY.set__(scale);
		return this;
	}
	,onAdded: function() {
		if((this._flags & 64) != 0) this.connectHover();
	}
	,onRemoved: function() {
		if(this._hoverConnection != null) {
			this._hoverConnection.dispose();
			this._hoverConnection = null;
		}
	}
	,onUpdate: function(dt) {
		this.x.update(dt);
		this.y.update(dt);
		this.rotation.update(dt);
		this.scaleX.update(dt);
		this.scaleY.update(dt);
		this.alpha.update(dt);
		this.anchorX.update(dt);
		this.anchorY.update(dt);
	}
	,draw: function(g) {
	}
	,getParentSprite: function() {
		if(this.owner == null) return null;
		var entity = this.owner.parent;
		while(entity != null) {
			var sprite = entity._compMap.Sprite_2;
			if(sprite != null) return sprite;
			entity = entity.parent;
		}
		return null;
	}
	,get_pointerDown: function() {
		if(this._pointerDown == null) this._pointerDown = new flambe_util_Signal1();
		return this._pointerDown;
	}
	,connectHover: function() {
		var _g = this;
		if(this._hoverConnection != null) return;
		this._hoverConnection = flambe_System._platform.getPointer().move.connect(function(event) {
			var hit = event.hit;
			while(hit != null) {
				if(hit == _g) return;
				hit = hit.getParentSprite();
			}
			if(_g._pointerOut != null && (_g._flags & 64) != 0) _g._pointerOut.emit(event);
			_g._flags = _g._flags & -65;
			_g._hoverConnection.dispose();
			_g._hoverConnection = null;
		});
	}
	,onPointerDown: function(event) {
		this.onHover(event);
		if(this._pointerDown != null) this._pointerDown.emit(event);
	}
	,onPointerMove: function(event) {
		this.onHover(event);
		if(this._pointerMove != null) this._pointerMove.emit(event);
	}
	,onHover: function(event) {
		if((this._flags & 64) != 0) return;
		this._flags = this._flags | 64;
		if(this._pointerIn != null || this._pointerOut != null) {
			if(this._pointerIn != null) this._pointerIn.emit(event);
			this.connectHover();
		}
	}
	,onPointerUp: function(event) {
		{
			var _g = event.source;
			switch(_g[1]) {
			case 1:
				var point = _g[2];
				if(this._pointerOut != null && (this._flags & 64) != 0) this._pointerOut.emit(event);
				this._flags = this._flags & -65;
				if(this._hoverConnection != null) {
					this._hoverConnection.dispose();
					this._hoverConnection = null;
				}
				break;
			default:
			}
		}
		if(this._pointerUp != null) this._pointerUp.emit(event);
	}
	,__class__: flambe_display_Sprite
});
var flambe_display_FillSprite = function(color,width,height) {
	flambe_display_Sprite.call(this);
	this.color = color;
	this.width = new flambe_animation_AnimatedFloat(width);
	this.height = new flambe_animation_AnimatedFloat(height);
};
flambe_display_FillSprite.__name__ = true;
flambe_display_FillSprite.__super__ = flambe_display_Sprite;
flambe_display_FillSprite.prototype = $extend(flambe_display_Sprite.prototype,{
	draw: function(g) {
		g.fillRect(this.color,0,0,this.width._value,this.height._value);
	}
	,getNaturalWidth: function() {
		return this.width._value;
	}
	,getNaturalHeight: function() {
		return this.height._value;
	}
	,onUpdate: function(dt) {
		flambe_display_Sprite.prototype.onUpdate.call(this,dt);
		this.width.update(dt);
		this.height.update(dt);
	}
	,__class__: flambe_display_FillSprite
});
var flambe_display_Glyph = function(charCode) {
	this._kernings = null;
	this.xAdvance = 0;
	this.yOffset = 0;
	this.xOffset = 0;
	this.page = null;
	this.height = 0;
	this.width = 0;
	this.y = 0;
	this.x = 0;
	this.charCode = charCode;
};
flambe_display_Glyph.__name__ = true;
flambe_display_Glyph.prototype = {
	draw: function(g,destX,destY) {
		if(this.width > 0) g.drawSubTexture(this.page,destX + this.xOffset,destY + this.yOffset,this.x,this.y,this.width,this.height);
	}
	,getKerning: function(nextCharCode) {
		if(this._kernings != null) return Std["int"](this._kernings.h[nextCharCode]); else return 0;
	}
	,setKerning: function(nextCharCode,amount) {
		if(this._kernings == null) this._kernings = new haxe_ds_IntMap();
		this._kernings.h[nextCharCode] = amount;
	}
	,__class__: flambe_display_Glyph
};
var flambe_display_Font = function(pack,name) {
	this.name = name;
	this._pack = pack;
	this._file = pack.getFile(name + ".fnt");
	this.reload();
};
flambe_display_Font.__name__ = true;
flambe_display_Font.prototype = {
	layoutText: function(text,align,wrapWidth,letterSpacing,lineSpacing) {
		if(lineSpacing == null) lineSpacing = 0;
		if(letterSpacing == null) letterSpacing = 0;
		if(wrapWidth == null) wrapWidth = 0;
		if(align == null) align = flambe_display_TextAlign.Left;
		return new flambe_display_TextLayout(this,text,align,wrapWidth,letterSpacing,lineSpacing);
	}
	,reload: function() {
		this._glyphs = new haxe_ds_IntMap();
		this._glyphs.h[flambe_display_Font.NEWLINE.charCode] = flambe_display_Font.NEWLINE;
		var parser = new flambe_display__$Font_ConfigParser(this._file.toString());
		var pages = new haxe_ds_IntMap();
		var idx = this.name.lastIndexOf("/");
		var basePath;
		if(idx >= 0) basePath = HxOverrides.substr(this.name,0,idx + 1); else basePath = "";
		var $it0 = parser.keywords();
		while( $it0.hasNext() ) {
			var keyword = $it0.next();
			switch(keyword) {
			case "info":
				var $it1 = parser.pairs();
				while( $it1.hasNext() ) {
					var pair = $it1.next();
					var _g = pair.key;
					switch(_g) {
					case "size":
						this.size = pair.getInt();
						break;
					}
				}
				break;
			case "common":
				var $it2 = parser.pairs();
				while( $it2.hasNext() ) {
					var pair1 = $it2.next();
					var _g1 = pair1.key;
					switch(_g1) {
					case "lineHeight":
						this.lineHeight = pair1.getInt();
						break;
					}
				}
				break;
			case "page":
				var pageId = 0;
				var file = null;
				var $it3 = parser.pairs();
				while( $it3.hasNext() ) {
					var pair2 = $it3.next();
					var _g2 = pair2.key;
					switch(_g2) {
					case "id":
						pageId = pair2.getInt();
						break;
					case "file":
						file = pair2.getString();
						break;
					}
				}
				var value = this._pack.getTexture(basePath + flambe_util_Strings.removeFileExtension(file));
				pages.h[pageId] = value;
				break;
			case "char":
				var glyph = null;
				var $it4 = parser.pairs();
				while( $it4.hasNext() ) {
					var pair3 = $it4.next();
					var _g3 = pair3.key;
					switch(_g3) {
					case "id":
						glyph = new flambe_display_Glyph(pair3.getInt());
						break;
					case "x":
						glyph.x = pair3.getInt();
						break;
					case "y":
						glyph.y = pair3.getInt();
						break;
					case "width":
						glyph.width = pair3.getInt();
						break;
					case "height":
						glyph.height = pair3.getInt();
						break;
					case "page":
						var key = pair3.getInt();
						glyph.page = pages.h[key];
						break;
					case "xoffset":
						glyph.xOffset = pair3.getInt();
						break;
					case "yoffset":
						glyph.yOffset = pair3.getInt();
						break;
					case "xadvance":
						glyph.xAdvance = pair3.getInt();
						break;
					}
				}
				this._glyphs.h[glyph.charCode] = glyph;
				break;
			case "kerning":
				var first = null;
				var second = 0;
				var amount = 0;
				var $it5 = parser.pairs();
				while( $it5.hasNext() ) {
					var pair4 = $it5.next();
					var _g4 = pair4.key;
					switch(_g4) {
					case "first":
						var key1 = pair4.getInt();
						first = this._glyphs.h[key1];
						break;
					case "second":
						second = pair4.getInt();
						break;
					case "amount":
						amount = pair4.getInt();
						break;
					}
				}
				if(first != null && amount != 0) first.setKerning(second,amount);
				break;
			}
		}
	}
	,__class__: flambe_display_Font
};
var flambe_display_TextAlign = { __ename__ : true, __constructs__ : ["Left","Center","Right"] };
flambe_display_TextAlign.Left = ["Left",0];
flambe_display_TextAlign.Left.toString = $estr;
flambe_display_TextAlign.Left.__enum__ = flambe_display_TextAlign;
flambe_display_TextAlign.Center = ["Center",1];
flambe_display_TextAlign.Center.toString = $estr;
flambe_display_TextAlign.Center.__enum__ = flambe_display_TextAlign;
flambe_display_TextAlign.Right = ["Right",2];
flambe_display_TextAlign.Right.toString = $estr;
flambe_display_TextAlign.Right.__enum__ = flambe_display_TextAlign;
var flambe_display_TextLayout = function(font,text,align,wrapWidth,letterSpacing,lineSpacing) {
	this.lines = 0;
	var _g = this;
	this._font = font;
	this._glyphs = [];
	this._offsets = [];
	this._lineOffset = Math.round(font.lineHeight + lineSpacing);
	this.bounds = new flambe_math_Rectangle();
	var lineWidths = [];
	var ll = text.length;
	var _g1 = 0;
	while(_g1 < ll) {
		var ii2 = _g1++;
		var charCode = text.charCodeAt(ii2);
		var glyph = font._glyphs.h[charCode];
		if(glyph != null) this._glyphs.push(glyph); else null;
	}
	var lastSpaceIdx = -1;
	var lineWidth = 0.0;
	var lineHeight = 0.0;
	var newline = font._glyphs.h[10];
	var addLine = function() {
		_g.bounds.width = flambe_math_FMath.max(_g.bounds.width,lineWidth);
		_g.bounds.height += lineHeight;
		lineWidths[_g.lines] = lineWidth;
		lineWidth = 0;
		lineHeight = 0;
		++_g.lines;
	};
	var ii = 0;
	while(ii < this._glyphs.length) {
		var glyph1 = this._glyphs[ii];
		this._offsets[ii] = Math.round(lineWidth);
		var wordWrap = wrapWidth > 0 && lineWidth + glyph1.width > wrapWidth;
		if(wordWrap || glyph1 == newline) {
			if(wordWrap) {
				if(lastSpaceIdx >= 0) {
					this._glyphs[lastSpaceIdx] = newline;
					lineWidth = this._offsets[lastSpaceIdx];
					ii = lastSpaceIdx;
				} else this._glyphs.splice(ii,0,newline);
			}
			lastSpaceIdx = -1;
			lineHeight = this._lineOffset;
			addLine();
		} else {
			if(glyph1.charCode == 32) lastSpaceIdx = ii;
			lineWidth += glyph1.xAdvance + letterSpacing;
			lineHeight = flambe_math_FMath.max(lineHeight,glyph1.height + glyph1.yOffset);
			if(ii + 1 < this._glyphs.length) {
				var nextGlyph = this._glyphs[ii + 1];
				lineWidth += glyph1.getKerning(nextGlyph.charCode);
			}
		}
		++ii;
	}
	addLine();
	var lineY = 0.0;
	var alignOffset = flambe_display_TextLayout.getAlignOffset(align,lineWidths[0],wrapWidth);
	var top = 1.79769313486231e+308;
	var bottom = -1.79769313486231e+308;
	var line = 0;
	var ii1 = 0;
	var ll1 = this._glyphs.length;
	while(ii1 < ll1) {
		var glyph2 = this._glyphs[ii1];
		if(glyph2.charCode == 10) {
			lineY += this._lineOffset;
			++line;
			alignOffset = flambe_display_TextLayout.getAlignOffset(align,lineWidths[line],wrapWidth);
		}
		this._offsets[ii1] += alignOffset;
		var glyphY = lineY + glyph2.yOffset;
		top = top < glyphY?top:glyphY;
		bottom = flambe_math_FMath.max(bottom,glyphY + glyph2.height);
		++ii1;
	}
	this.bounds.x = flambe_display_TextLayout.getAlignOffset(align,this.bounds.width,wrapWidth);
	this.bounds.y = top;
	this.bounds.height = bottom - top;
};
flambe_display_TextLayout.__name__ = true;
flambe_display_TextLayout.getAlignOffset = function(align,lineWidth,totalWidth) {
	switch(align[1]) {
	case 0:
		return 0;
	case 2:
		return totalWidth - lineWidth;
	case 1:
		return Math.round((totalWidth - lineWidth) / 2);
	}
};
flambe_display_TextLayout.prototype = {
	draw: function(g) {
		var y = 0.0;
		var ii = 0;
		var ll = this._glyphs.length;
		while(ii < ll) {
			var glyph = this._glyphs[ii];
			if(glyph.charCode == 10) y += this._lineOffset; else {
				var x = this._offsets[ii];
				glyph.draw(g,x,y);
			}
			++ii;
		}
	}
	,__class__: flambe_display_TextLayout
};
var flambe_display__$Font_ConfigParser = function(config) {
	this._configText = config;
	this._keywordPattern = new EReg("([A-Za-z]+)(.*)","");
	this._pairPattern = new EReg("([A-Za-z]+)=(\"[^\"]*\"|[^\\s]+)","");
};
flambe_display__$Font_ConfigParser.__name__ = true;
flambe_display__$Font_ConfigParser.advance = function(text,expr) {
	var m = expr.matchedPos();
	return HxOverrides.substr(text,m.pos + m.len,text.length);
};
flambe_display__$Font_ConfigParser.prototype = {
	keywords: function() {
		var _g = this;
		var text = this._configText;
		return { next : function() {
			text = flambe_display__$Font_ConfigParser.advance(text,_g._keywordPattern);
			_g._pairText = _g._keywordPattern.matched(2);
			return _g._keywordPattern.matched(1);
		}, hasNext : function() {
			return _g._keywordPattern.match(text);
		}};
	}
	,pairs: function() {
		var _g = this;
		var text = this._pairText;
		return { next : function() {
			text = flambe_display__$Font_ConfigParser.advance(text,_g._pairPattern);
			return new flambe_display__$Font_ConfigPair(_g._pairPattern.matched(1),_g._pairPattern.matched(2));
		}, hasNext : function() {
			return _g._pairPattern.match(text);
		}};
	}
	,__class__: flambe_display__$Font_ConfigParser
};
var flambe_display__$Font_ConfigPair = function(key,value) {
	this.key = key;
	this._value = value;
};
flambe_display__$Font_ConfigPair.__name__ = true;
flambe_display__$Font_ConfigPair.prototype = {
	getInt: function() {
		return Std.parseInt(this._value);
	}
	,getString: function() {
		if(this._value.charCodeAt(0) != 34) return null;
		return HxOverrides.substr(this._value,1,this._value.length - 2);
	}
	,__class__: flambe_display__$Font_ConfigPair
};
var flambe_display_Graphics = function() { };
flambe_display_Graphics.__name__ = true;
flambe_display_Graphics.prototype = {
	__class__: flambe_display_Graphics
};
var flambe_display_ImageSprite = function(texture) {
	flambe_display_Sprite.call(this);
	this.texture = texture;
};
flambe_display_ImageSprite.__name__ = true;
flambe_display_ImageSprite.__super__ = flambe_display_Sprite;
flambe_display_ImageSprite.prototype = $extend(flambe_display_Sprite.prototype,{
	draw: function(g) {
		if(this.texture != null) g.drawTexture(this.texture,0,0);
	}
	,getNaturalWidth: function() {
		if(this.texture != null) return this.texture.get_width(); else return 0;
	}
	,getNaturalHeight: function() {
		if(this.texture != null) return this.texture.get_height(); else return 0;
	}
	,__class__: flambe_display_ImageSprite
});
var flambe_display_Orientation = { __ename__ : true, __constructs__ : ["Portrait","Landscape"] };
flambe_display_Orientation.Portrait = ["Portrait",0];
flambe_display_Orientation.Portrait.toString = $estr;
flambe_display_Orientation.Portrait.__enum__ = flambe_display_Orientation;
flambe_display_Orientation.Landscape = ["Landscape",1];
flambe_display_Orientation.Landscape.toString = $estr;
flambe_display_Orientation.Landscape.__enum__ = flambe_display_Orientation;
var flambe_display_PatternSprite = function(texture,width,height) {
	if(height == null) height = -1;
	if(width == null) width = -1;
	flambe_display_Sprite.call(this);
	this.texture = texture;
	if(width < 0) if(texture != null) width = texture.get_width(); else width = 0;
	this.width = new flambe_animation_AnimatedFloat(width);
	if(height < 0) if(texture != null) height = texture.get_height(); else height = 0;
	this.height = new flambe_animation_AnimatedFloat(height);
};
flambe_display_PatternSprite.__name__ = true;
flambe_display_PatternSprite.__super__ = flambe_display_Sprite;
flambe_display_PatternSprite.prototype = $extend(flambe_display_Sprite.prototype,{
	draw: function(g) {
		if(this.texture != null) g.drawPattern(this.texture,0,0,this.width._value,this.height._value);
	}
	,getNaturalWidth: function() {
		return this.width._value;
	}
	,getNaturalHeight: function() {
		return this.height._value;
	}
	,onUpdate: function(dt) {
		flambe_display_Sprite.prototype.onUpdate.call(this,dt);
		this.width.update(dt);
		this.height.update(dt);
	}
	,__class__: flambe_display_PatternSprite
});
var flambe_display_Texture = function() { };
flambe_display_Texture.__name__ = true;
flambe_display_Texture.__interfaces__ = [flambe_asset_Asset];
flambe_display_Texture.prototype = {
	__class__: flambe_display_Texture
};
var flambe_display_SubTexture = function() { };
flambe_display_SubTexture.__name__ = true;
flambe_display_SubTexture.__interfaces__ = [flambe_display_Texture];
var flambe_display_TextSprite = function(font,text) {
	if(text == null) text = "";
	this._layout = null;
	var _g = this;
	flambe_display_Sprite.call(this);
	this._font = font;
	this._text = text;
	this._align = flambe_display_TextAlign.Left;
	this._flags = this._flags | 128;
	var dirtyText = function(_,_1) {
		_g._flags = _g._flags | 128;
	};
	this.wrapWidth = new flambe_animation_AnimatedFloat(0,dirtyText);
	this.letterSpacing = new flambe_animation_AnimatedFloat(0,dirtyText);
	this.lineSpacing = new flambe_animation_AnimatedFloat(0,dirtyText);
};
flambe_display_TextSprite.__name__ = true;
flambe_display_TextSprite.__super__ = flambe_display_Sprite;
flambe_display_TextSprite.prototype = $extend(flambe_display_Sprite.prototype,{
	draw: function(g) {
		this.updateLayout();
		this._layout.draw(g);
	}
	,getNaturalWidth: function() {
		this.updateLayout();
		if(this.wrapWidth._value > 0) return this.wrapWidth._value; else return this._layout.bounds.width;
	}
	,getNaturalHeight: function() {
		this.updateLayout();
		var paddedHeight = this._layout.lines * (this._font.lineHeight + this.lineSpacing._value);
		var boundsHeight = this._layout.bounds.height;
		return paddedHeight > boundsHeight?paddedHeight:boundsHeight;
	}
	,containsLocal: function(localX,localY) {
		this.updateLayout();
		return this._layout.bounds.contains(localX,localY);
	}
	,setWrapWidth: function(wrapWidth) {
		this.wrapWidth.set__(wrapWidth);
		return this;
	}
	,setAlign: function(align) {
		this.set_align(align);
		return this;
	}
	,set_text: function(text) {
		if(text != this._text) {
			this._text = text;
			this._flags = this._flags | 128;
		}
		return text;
	}
	,set_align: function(align) {
		if(align != this._align) {
			this._align = align;
			this._flags = this._flags | 128;
		}
		return align;
	}
	,updateLayout: function() {
		if((this._flags & 128) != 0) {
			this._flags = this._flags & -129;
			this._layout = this._font.layoutText(this._text,this._align,this.wrapWidth._value,this.letterSpacing._value,this.lineSpacing._value);
		}
	}
	,onUpdate: function(dt) {
		flambe_display_Sprite.prototype.onUpdate.call(this,dt);
		this.wrapWidth.update(dt);
		this.letterSpacing.update(dt);
		this.lineSpacing.update(dt);
	}
	,__class__: flambe_display_TextSprite
});
var flambe_input_Key = { __ename__ : true, __constructs__ : ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Number0","Number1","Number2","Number3","Number4","Number5","Number6","Number7","Number8","Number9","Numpad0","Numpad1","Numpad2","Numpad3","Numpad4","Numpad5","Numpad6","Numpad7","Numpad8","Numpad9","NumpadAdd","NumpadDecimal","NumpadDivide","NumpadEnter","NumpadMultiply","NumpadSubtract","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","Left","Up","Right","Down","Alt","Backquote","Backslash","Backspace","CapsLock","Comma","Command","Control","Delete","End","Enter","Equals","Escape","Home","Insert","LeftBracket","Minus","PageDown","PageUp","Period","Quote","RightBracket","Semicolon","Shift","Slash","Space","Tab","Menu","Search","Unknown"] };
flambe_input_Key.A = ["A",0];
flambe_input_Key.A.toString = $estr;
flambe_input_Key.A.__enum__ = flambe_input_Key;
flambe_input_Key.B = ["B",1];
flambe_input_Key.B.toString = $estr;
flambe_input_Key.B.__enum__ = flambe_input_Key;
flambe_input_Key.C = ["C",2];
flambe_input_Key.C.toString = $estr;
flambe_input_Key.C.__enum__ = flambe_input_Key;
flambe_input_Key.D = ["D",3];
flambe_input_Key.D.toString = $estr;
flambe_input_Key.D.__enum__ = flambe_input_Key;
flambe_input_Key.E = ["E",4];
flambe_input_Key.E.toString = $estr;
flambe_input_Key.E.__enum__ = flambe_input_Key;
flambe_input_Key.F = ["F",5];
flambe_input_Key.F.toString = $estr;
flambe_input_Key.F.__enum__ = flambe_input_Key;
flambe_input_Key.G = ["G",6];
flambe_input_Key.G.toString = $estr;
flambe_input_Key.G.__enum__ = flambe_input_Key;
flambe_input_Key.H = ["H",7];
flambe_input_Key.H.toString = $estr;
flambe_input_Key.H.__enum__ = flambe_input_Key;
flambe_input_Key.I = ["I",8];
flambe_input_Key.I.toString = $estr;
flambe_input_Key.I.__enum__ = flambe_input_Key;
flambe_input_Key.J = ["J",9];
flambe_input_Key.J.toString = $estr;
flambe_input_Key.J.__enum__ = flambe_input_Key;
flambe_input_Key.K = ["K",10];
flambe_input_Key.K.toString = $estr;
flambe_input_Key.K.__enum__ = flambe_input_Key;
flambe_input_Key.L = ["L",11];
flambe_input_Key.L.toString = $estr;
flambe_input_Key.L.__enum__ = flambe_input_Key;
flambe_input_Key.M = ["M",12];
flambe_input_Key.M.toString = $estr;
flambe_input_Key.M.__enum__ = flambe_input_Key;
flambe_input_Key.N = ["N",13];
flambe_input_Key.N.toString = $estr;
flambe_input_Key.N.__enum__ = flambe_input_Key;
flambe_input_Key.O = ["O",14];
flambe_input_Key.O.toString = $estr;
flambe_input_Key.O.__enum__ = flambe_input_Key;
flambe_input_Key.P = ["P",15];
flambe_input_Key.P.toString = $estr;
flambe_input_Key.P.__enum__ = flambe_input_Key;
flambe_input_Key.Q = ["Q",16];
flambe_input_Key.Q.toString = $estr;
flambe_input_Key.Q.__enum__ = flambe_input_Key;
flambe_input_Key.R = ["R",17];
flambe_input_Key.R.toString = $estr;
flambe_input_Key.R.__enum__ = flambe_input_Key;
flambe_input_Key.S = ["S",18];
flambe_input_Key.S.toString = $estr;
flambe_input_Key.S.__enum__ = flambe_input_Key;
flambe_input_Key.T = ["T",19];
flambe_input_Key.T.toString = $estr;
flambe_input_Key.T.__enum__ = flambe_input_Key;
flambe_input_Key.U = ["U",20];
flambe_input_Key.U.toString = $estr;
flambe_input_Key.U.__enum__ = flambe_input_Key;
flambe_input_Key.V = ["V",21];
flambe_input_Key.V.toString = $estr;
flambe_input_Key.V.__enum__ = flambe_input_Key;
flambe_input_Key.W = ["W",22];
flambe_input_Key.W.toString = $estr;
flambe_input_Key.W.__enum__ = flambe_input_Key;
flambe_input_Key.X = ["X",23];
flambe_input_Key.X.toString = $estr;
flambe_input_Key.X.__enum__ = flambe_input_Key;
flambe_input_Key.Y = ["Y",24];
flambe_input_Key.Y.toString = $estr;
flambe_input_Key.Y.__enum__ = flambe_input_Key;
flambe_input_Key.Z = ["Z",25];
flambe_input_Key.Z.toString = $estr;
flambe_input_Key.Z.__enum__ = flambe_input_Key;
flambe_input_Key.Number0 = ["Number0",26];
flambe_input_Key.Number0.toString = $estr;
flambe_input_Key.Number0.__enum__ = flambe_input_Key;
flambe_input_Key.Number1 = ["Number1",27];
flambe_input_Key.Number1.toString = $estr;
flambe_input_Key.Number1.__enum__ = flambe_input_Key;
flambe_input_Key.Number2 = ["Number2",28];
flambe_input_Key.Number2.toString = $estr;
flambe_input_Key.Number2.__enum__ = flambe_input_Key;
flambe_input_Key.Number3 = ["Number3",29];
flambe_input_Key.Number3.toString = $estr;
flambe_input_Key.Number3.__enum__ = flambe_input_Key;
flambe_input_Key.Number4 = ["Number4",30];
flambe_input_Key.Number4.toString = $estr;
flambe_input_Key.Number4.__enum__ = flambe_input_Key;
flambe_input_Key.Number5 = ["Number5",31];
flambe_input_Key.Number5.toString = $estr;
flambe_input_Key.Number5.__enum__ = flambe_input_Key;
flambe_input_Key.Number6 = ["Number6",32];
flambe_input_Key.Number6.toString = $estr;
flambe_input_Key.Number6.__enum__ = flambe_input_Key;
flambe_input_Key.Number7 = ["Number7",33];
flambe_input_Key.Number7.toString = $estr;
flambe_input_Key.Number7.__enum__ = flambe_input_Key;
flambe_input_Key.Number8 = ["Number8",34];
flambe_input_Key.Number8.toString = $estr;
flambe_input_Key.Number8.__enum__ = flambe_input_Key;
flambe_input_Key.Number9 = ["Number9",35];
flambe_input_Key.Number9.toString = $estr;
flambe_input_Key.Number9.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad0 = ["Numpad0",36];
flambe_input_Key.Numpad0.toString = $estr;
flambe_input_Key.Numpad0.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad1 = ["Numpad1",37];
flambe_input_Key.Numpad1.toString = $estr;
flambe_input_Key.Numpad1.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad2 = ["Numpad2",38];
flambe_input_Key.Numpad2.toString = $estr;
flambe_input_Key.Numpad2.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad3 = ["Numpad3",39];
flambe_input_Key.Numpad3.toString = $estr;
flambe_input_Key.Numpad3.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad4 = ["Numpad4",40];
flambe_input_Key.Numpad4.toString = $estr;
flambe_input_Key.Numpad4.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad5 = ["Numpad5",41];
flambe_input_Key.Numpad5.toString = $estr;
flambe_input_Key.Numpad5.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad6 = ["Numpad6",42];
flambe_input_Key.Numpad6.toString = $estr;
flambe_input_Key.Numpad6.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad7 = ["Numpad7",43];
flambe_input_Key.Numpad7.toString = $estr;
flambe_input_Key.Numpad7.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad8 = ["Numpad8",44];
flambe_input_Key.Numpad8.toString = $estr;
flambe_input_Key.Numpad8.__enum__ = flambe_input_Key;
flambe_input_Key.Numpad9 = ["Numpad9",45];
flambe_input_Key.Numpad9.toString = $estr;
flambe_input_Key.Numpad9.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadAdd = ["NumpadAdd",46];
flambe_input_Key.NumpadAdd.toString = $estr;
flambe_input_Key.NumpadAdd.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadDecimal = ["NumpadDecimal",47];
flambe_input_Key.NumpadDecimal.toString = $estr;
flambe_input_Key.NumpadDecimal.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadDivide = ["NumpadDivide",48];
flambe_input_Key.NumpadDivide.toString = $estr;
flambe_input_Key.NumpadDivide.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadEnter = ["NumpadEnter",49];
flambe_input_Key.NumpadEnter.toString = $estr;
flambe_input_Key.NumpadEnter.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadMultiply = ["NumpadMultiply",50];
flambe_input_Key.NumpadMultiply.toString = $estr;
flambe_input_Key.NumpadMultiply.__enum__ = flambe_input_Key;
flambe_input_Key.NumpadSubtract = ["NumpadSubtract",51];
flambe_input_Key.NumpadSubtract.toString = $estr;
flambe_input_Key.NumpadSubtract.__enum__ = flambe_input_Key;
flambe_input_Key.F1 = ["F1",52];
flambe_input_Key.F1.toString = $estr;
flambe_input_Key.F1.__enum__ = flambe_input_Key;
flambe_input_Key.F2 = ["F2",53];
flambe_input_Key.F2.toString = $estr;
flambe_input_Key.F2.__enum__ = flambe_input_Key;
flambe_input_Key.F3 = ["F3",54];
flambe_input_Key.F3.toString = $estr;
flambe_input_Key.F3.__enum__ = flambe_input_Key;
flambe_input_Key.F4 = ["F4",55];
flambe_input_Key.F4.toString = $estr;
flambe_input_Key.F4.__enum__ = flambe_input_Key;
flambe_input_Key.F5 = ["F5",56];
flambe_input_Key.F5.toString = $estr;
flambe_input_Key.F5.__enum__ = flambe_input_Key;
flambe_input_Key.F6 = ["F6",57];
flambe_input_Key.F6.toString = $estr;
flambe_input_Key.F6.__enum__ = flambe_input_Key;
flambe_input_Key.F7 = ["F7",58];
flambe_input_Key.F7.toString = $estr;
flambe_input_Key.F7.__enum__ = flambe_input_Key;
flambe_input_Key.F8 = ["F8",59];
flambe_input_Key.F8.toString = $estr;
flambe_input_Key.F8.__enum__ = flambe_input_Key;
flambe_input_Key.F9 = ["F9",60];
flambe_input_Key.F9.toString = $estr;
flambe_input_Key.F9.__enum__ = flambe_input_Key;
flambe_input_Key.F10 = ["F10",61];
flambe_input_Key.F10.toString = $estr;
flambe_input_Key.F10.__enum__ = flambe_input_Key;
flambe_input_Key.F11 = ["F11",62];
flambe_input_Key.F11.toString = $estr;
flambe_input_Key.F11.__enum__ = flambe_input_Key;
flambe_input_Key.F12 = ["F12",63];
flambe_input_Key.F12.toString = $estr;
flambe_input_Key.F12.__enum__ = flambe_input_Key;
flambe_input_Key.F13 = ["F13",64];
flambe_input_Key.F13.toString = $estr;
flambe_input_Key.F13.__enum__ = flambe_input_Key;
flambe_input_Key.F14 = ["F14",65];
flambe_input_Key.F14.toString = $estr;
flambe_input_Key.F14.__enum__ = flambe_input_Key;
flambe_input_Key.F15 = ["F15",66];
flambe_input_Key.F15.toString = $estr;
flambe_input_Key.F15.__enum__ = flambe_input_Key;
flambe_input_Key.Left = ["Left",67];
flambe_input_Key.Left.toString = $estr;
flambe_input_Key.Left.__enum__ = flambe_input_Key;
flambe_input_Key.Up = ["Up",68];
flambe_input_Key.Up.toString = $estr;
flambe_input_Key.Up.__enum__ = flambe_input_Key;
flambe_input_Key.Right = ["Right",69];
flambe_input_Key.Right.toString = $estr;
flambe_input_Key.Right.__enum__ = flambe_input_Key;
flambe_input_Key.Down = ["Down",70];
flambe_input_Key.Down.toString = $estr;
flambe_input_Key.Down.__enum__ = flambe_input_Key;
flambe_input_Key.Alt = ["Alt",71];
flambe_input_Key.Alt.toString = $estr;
flambe_input_Key.Alt.__enum__ = flambe_input_Key;
flambe_input_Key.Backquote = ["Backquote",72];
flambe_input_Key.Backquote.toString = $estr;
flambe_input_Key.Backquote.__enum__ = flambe_input_Key;
flambe_input_Key.Backslash = ["Backslash",73];
flambe_input_Key.Backslash.toString = $estr;
flambe_input_Key.Backslash.__enum__ = flambe_input_Key;
flambe_input_Key.Backspace = ["Backspace",74];
flambe_input_Key.Backspace.toString = $estr;
flambe_input_Key.Backspace.__enum__ = flambe_input_Key;
flambe_input_Key.CapsLock = ["CapsLock",75];
flambe_input_Key.CapsLock.toString = $estr;
flambe_input_Key.CapsLock.__enum__ = flambe_input_Key;
flambe_input_Key.Comma = ["Comma",76];
flambe_input_Key.Comma.toString = $estr;
flambe_input_Key.Comma.__enum__ = flambe_input_Key;
flambe_input_Key.Command = ["Command",77];
flambe_input_Key.Command.toString = $estr;
flambe_input_Key.Command.__enum__ = flambe_input_Key;
flambe_input_Key.Control = ["Control",78];
flambe_input_Key.Control.toString = $estr;
flambe_input_Key.Control.__enum__ = flambe_input_Key;
flambe_input_Key.Delete = ["Delete",79];
flambe_input_Key.Delete.toString = $estr;
flambe_input_Key.Delete.__enum__ = flambe_input_Key;
flambe_input_Key.End = ["End",80];
flambe_input_Key.End.toString = $estr;
flambe_input_Key.End.__enum__ = flambe_input_Key;
flambe_input_Key.Enter = ["Enter",81];
flambe_input_Key.Enter.toString = $estr;
flambe_input_Key.Enter.__enum__ = flambe_input_Key;
flambe_input_Key.Equals = ["Equals",82];
flambe_input_Key.Equals.toString = $estr;
flambe_input_Key.Equals.__enum__ = flambe_input_Key;
flambe_input_Key.Escape = ["Escape",83];
flambe_input_Key.Escape.toString = $estr;
flambe_input_Key.Escape.__enum__ = flambe_input_Key;
flambe_input_Key.Home = ["Home",84];
flambe_input_Key.Home.toString = $estr;
flambe_input_Key.Home.__enum__ = flambe_input_Key;
flambe_input_Key.Insert = ["Insert",85];
flambe_input_Key.Insert.toString = $estr;
flambe_input_Key.Insert.__enum__ = flambe_input_Key;
flambe_input_Key.LeftBracket = ["LeftBracket",86];
flambe_input_Key.LeftBracket.toString = $estr;
flambe_input_Key.LeftBracket.__enum__ = flambe_input_Key;
flambe_input_Key.Minus = ["Minus",87];
flambe_input_Key.Minus.toString = $estr;
flambe_input_Key.Minus.__enum__ = flambe_input_Key;
flambe_input_Key.PageDown = ["PageDown",88];
flambe_input_Key.PageDown.toString = $estr;
flambe_input_Key.PageDown.__enum__ = flambe_input_Key;
flambe_input_Key.PageUp = ["PageUp",89];
flambe_input_Key.PageUp.toString = $estr;
flambe_input_Key.PageUp.__enum__ = flambe_input_Key;
flambe_input_Key.Period = ["Period",90];
flambe_input_Key.Period.toString = $estr;
flambe_input_Key.Period.__enum__ = flambe_input_Key;
flambe_input_Key.Quote = ["Quote",91];
flambe_input_Key.Quote.toString = $estr;
flambe_input_Key.Quote.__enum__ = flambe_input_Key;
flambe_input_Key.RightBracket = ["RightBracket",92];
flambe_input_Key.RightBracket.toString = $estr;
flambe_input_Key.RightBracket.__enum__ = flambe_input_Key;
flambe_input_Key.Semicolon = ["Semicolon",93];
flambe_input_Key.Semicolon.toString = $estr;
flambe_input_Key.Semicolon.__enum__ = flambe_input_Key;
flambe_input_Key.Shift = ["Shift",94];
flambe_input_Key.Shift.toString = $estr;
flambe_input_Key.Shift.__enum__ = flambe_input_Key;
flambe_input_Key.Slash = ["Slash",95];
flambe_input_Key.Slash.toString = $estr;
flambe_input_Key.Slash.__enum__ = flambe_input_Key;
flambe_input_Key.Space = ["Space",96];
flambe_input_Key.Space.toString = $estr;
flambe_input_Key.Space.__enum__ = flambe_input_Key;
flambe_input_Key.Tab = ["Tab",97];
flambe_input_Key.Tab.toString = $estr;
flambe_input_Key.Tab.__enum__ = flambe_input_Key;
flambe_input_Key.Menu = ["Menu",98];
flambe_input_Key.Menu.toString = $estr;
flambe_input_Key.Menu.__enum__ = flambe_input_Key;
flambe_input_Key.Search = ["Search",99];
flambe_input_Key.Search.toString = $estr;
flambe_input_Key.Search.__enum__ = flambe_input_Key;
flambe_input_Key.Unknown = function(keyCode) { var $x = ["Unknown",100,keyCode]; $x.__enum__ = flambe_input_Key; $x.toString = $estr; return $x; };
var flambe_input_KeyboardEvent = function() {
	this.init(0,null);
};
flambe_input_KeyboardEvent.__name__ = true;
flambe_input_KeyboardEvent.prototype = {
	init: function(id,key) {
		this.id = id;
		this.key = key;
	}
	,__class__: flambe_input_KeyboardEvent
};
var flambe_input_MouseButton = { __ename__ : true, __constructs__ : ["Left","Middle","Right","Unknown"] };
flambe_input_MouseButton.Left = ["Left",0];
flambe_input_MouseButton.Left.toString = $estr;
flambe_input_MouseButton.Left.__enum__ = flambe_input_MouseButton;
flambe_input_MouseButton.Middle = ["Middle",1];
flambe_input_MouseButton.Middle.toString = $estr;
flambe_input_MouseButton.Middle.__enum__ = flambe_input_MouseButton;
flambe_input_MouseButton.Right = ["Right",2];
flambe_input_MouseButton.Right.toString = $estr;
flambe_input_MouseButton.Right.__enum__ = flambe_input_MouseButton;
flambe_input_MouseButton.Unknown = function(buttonCode) { var $x = ["Unknown",3,buttonCode]; $x.__enum__ = flambe_input_MouseButton; $x.toString = $estr; return $x; };
var flambe_input_MouseCursor = { __ename__ : true, __constructs__ : ["Default","Button","None"] };
flambe_input_MouseCursor.Default = ["Default",0];
flambe_input_MouseCursor.Default.toString = $estr;
flambe_input_MouseCursor.Default.__enum__ = flambe_input_MouseCursor;
flambe_input_MouseCursor.Button = ["Button",1];
flambe_input_MouseCursor.Button.toString = $estr;
flambe_input_MouseCursor.Button.__enum__ = flambe_input_MouseCursor;
flambe_input_MouseCursor.None = ["None",2];
flambe_input_MouseCursor.None.toString = $estr;
flambe_input_MouseCursor.None.__enum__ = flambe_input_MouseCursor;
var flambe_input_MouseEvent = function() {
	this.init(0,0,0,null);
};
flambe_input_MouseEvent.__name__ = true;
flambe_input_MouseEvent.prototype = {
	init: function(id,viewX,viewY,button) {
		this.id = id;
		this.viewX = viewX;
		this.viewY = viewY;
		this.button = button;
	}
	,__class__: flambe_input_MouseEvent
};
var flambe_input_EventSource = { __ename__ : true, __constructs__ : ["Mouse","Touch"] };
flambe_input_EventSource.Mouse = function(event) { var $x = ["Mouse",0,event]; $x.__enum__ = flambe_input_EventSource; $x.toString = $estr; return $x; };
flambe_input_EventSource.Touch = function(point) { var $x = ["Touch",1,point]; $x.__enum__ = flambe_input_EventSource; $x.toString = $estr; return $x; };
var flambe_input_PointerEvent = function() {
	this.init(0,0,0,null,null);
};
flambe_input_PointerEvent.__name__ = true;
flambe_input_PointerEvent.prototype = {
	init: function(id,viewX,viewY,hit,source) {
		this.id = id;
		this.viewX = viewX;
		this.viewY = viewY;
		this.hit = hit;
		this.source = source;
		this._stopped = false;
	}
	,__class__: flambe_input_PointerEvent
};
var flambe_input_TouchPoint = function(id) {
	this.id = id;
	this._source = flambe_input_EventSource.Touch(this);
};
flambe_input_TouchPoint.__name__ = true;
flambe_input_TouchPoint.prototype = {
	init: function(viewX,viewY) {
		this.viewX = viewX;
		this.viewY = viewY;
	}
	,__class__: flambe_input_TouchPoint
};
var flambe_math_FMath = function() { };
flambe_math_FMath.__name__ = true;
flambe_math_FMath.max = function(a,b) {
	if(a > b) return a; else return b;
};
flambe_math_FMath.min = function(a,b) {
	if(a < b) return a; else return b;
};
var flambe_math_Matrix = function() {
	this.identity();
};
flambe_math_Matrix.__name__ = true;
flambe_math_Matrix.multiply = function(lhs,rhs,result) {
	if(result == null) result = new flambe_math_Matrix();
	var a = lhs.m00 * rhs.m00 + lhs.m01 * rhs.m10;
	var b = lhs.m00 * rhs.m01 + lhs.m01 * rhs.m11;
	var c = lhs.m00 * rhs.m02 + lhs.m01 * rhs.m12 + lhs.m02;
	result.m00 = a;
	result.m01 = b;
	result.m02 = c;
	a = lhs.m10 * rhs.m00 + lhs.m11 * rhs.m10;
	b = lhs.m10 * rhs.m01 + lhs.m11 * rhs.m11;
	c = lhs.m10 * rhs.m02 + lhs.m11 * rhs.m12 + lhs.m12;
	result.m10 = a;
	result.m11 = b;
	result.m12 = c;
	return result;
};
flambe_math_Matrix.prototype = {
	set: function(m00,m10,m01,m11,m02,m12) {
		this.m00 = m00;
		this.m01 = m01;
		this.m02 = m02;
		this.m10 = m10;
		this.m11 = m11;
		this.m12 = m12;
	}
	,identity: function() {
		this.set(1,0,0,1,0,0);
	}
	,compose: function(x,y,scaleX,scaleY,rotation) {
		var sin = Math.sin(rotation);
		var cos = Math.cos(rotation);
		this.set(cos * scaleX,sin * scaleX,-sin * scaleY,cos * scaleY,x,y);
	}
	,translate: function(x,y) {
		this.m02 += this.m00 * x + this.m01 * y;
		this.m12 += this.m11 * y + this.m10 * x;
	}
	,invert: function() {
		var det = this.determinant();
		if(det == 0) return false;
		this.set(this.m11 / det,-this.m01 / det,-this.m10 / det,this.m00 / det,(this.m01 * this.m12 - this.m11 * this.m02) / det,(this.m10 * this.m02 - this.m00 * this.m12) / det);
		return true;
	}
	,transform: function(x,y,result) {
		if(result == null) result = new flambe_math_Point();
		result.x = x * this.m00 + y * this.m01 + this.m02;
		result.y = x * this.m10 + y * this.m11 + this.m12;
		return result;
	}
	,transformArray: function(points,length,result) {
		var ii = 0;
		while(ii < length) {
			var x = points[ii];
			var y = points[ii + 1];
			result[ii++] = x * this.m00 + y * this.m01 + this.m02;
			result[ii++] = x * this.m10 + y * this.m11 + this.m12;
		}
	}
	,determinant: function() {
		return this.m00 * this.m11 - this.m01 * this.m10;
	}
	,inverseTransform: function(x,y,result) {
		var det = this.determinant();
		if(det == 0) return false;
		x -= this.m02;
		y -= this.m12;
		result.x = (x * this.m11 - y * this.m01) / det;
		result.y = (y * this.m00 - x * this.m10) / det;
		return true;
	}
	,clone: function(result) {
		if(result == null) result = new flambe_math_Matrix();
		result.set(this.m00,this.m10,this.m01,this.m11,this.m02,this.m12);
		return result;
	}
	,__class__: flambe_math_Matrix
};
var flambe_math_Rectangle = function(x,y,width,height) {
	if(height == null) height = 0;
	if(width == null) width = 0;
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.set(x,y,width,height);
};
flambe_math_Rectangle.__name__ = true;
flambe_math_Rectangle.prototype = {
	set: function(x,y,width,height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	,contains: function(x,y) {
		x -= this.x;
		if(this.width >= 0) {
			if(x < 0 || x > this.width) return false;
		} else if(x > 0 || x < this.width) return false;
		y -= this.y;
		if(this.height >= 0) {
			if(y < 0 || y > this.height) return false;
		} else if(y > 0 || y < this.height) return false;
		return true;
	}
	,clone: function(result) {
		if(result == null) result = new flambe_math_Rectangle();
		result.set(this.x,this.y,this.width,this.height);
		return result;
	}
	,equals: function(other) {
		return this.x == other.x && this.y == other.y && this.width == other.width && this.height == other.height;
	}
	,__class__: flambe_math_Rectangle
};
var flambe_platform_BasicAsset = function() {
	this._disposed = false;
};
flambe_platform_BasicAsset.__name__ = true;
flambe_platform_BasicAsset.__interfaces__ = [flambe_asset_Asset];
flambe_platform_BasicAsset.prototype = {
	dispose: function() {
		if(!this._disposed) {
			this._disposed = true;
			this.onDisposed();
		}
	}
	,onDisposed: function() {
		null;
	}
	,__class__: flambe_platform_BasicAsset
};
var flambe_platform_BasicAssetPackLoader = function(platform,manifest) {
	var _g = this;
	this.manifest = manifest;
	this._platform = platform;
	this.promise = new flambe_util_Promise();
	this._bytesLoaded = new haxe_ds_StringMap();
	this._pack = new flambe_platform__$BasicAssetPackLoader_BasicAssetPack(manifest,this);
	var entries = Lambda.array(manifest);
	if(entries.length == 0) this.handleSuccess(); else {
		var groups = new haxe_ds_StringMap();
		var _g1 = 0;
		while(_g1 < entries.length) {
			var entry = entries[_g1];
			++_g1;
			var group = groups.get(entry.name);
			if(group == null) {
				group = [];
				groups.set(entry.name,group);
			}
			group.push(entry);
		}
		this._assetsRemaining = Lambda.count(groups);
		var $it0 = new haxe_ds__$StringMap_StringMapIterator(groups,groups.arrayKeys());
		while( $it0.hasNext() ) {
			var group1 = $it0.next();
			var group2 = [group1];
			this.pickBestEntry(group2[0],(function(group2) {
				return function(bestEntry) {
					if(bestEntry != null) {
						var url = manifest.getFullURL(bestEntry);
						try {
							_g.loadEntry(url,bestEntry);
						} catch( error ) {
							if (error instanceof js__$Boot_HaxeError) error = error.val;
							_g.handleError(bestEntry,"Unexpected error: " + Std.string(error));
						}
						var _g11 = _g.promise;
						_g11.set_total(_g11._total + bestEntry.bytes);
					} else {
						var badEntry = group2[0][0];
						if(flambe_platform_BasicAssetPackLoader.isAudio(badEntry.format)) _g.handleLoad(badEntry,flambe_platform_DummySound.getInstance()); else _g.handleError(badEntry,"Could not find a supported format to load");
					}
				};
			})(group2));
		}
	}
};
flambe_platform_BasicAssetPackLoader.__name__ = true;
flambe_platform_BasicAssetPackLoader.isAudio = function(format) {
	switch(format[1]) {
	case 8:case 9:case 10:case 11:case 12:
		return true;
	default:
		return false;
	}
};
flambe_platform_BasicAssetPackLoader.prototype = {
	onDisposed: function() {
	}
	,pickBestEntry: function(entries,fn) {
		var onFormatsAvailable = function(formats) {
			var _g = 0;
			while(_g < formats.length) {
				var format = formats[_g];
				++_g;
				var _g1 = 0;
				while(_g1 < entries.length) {
					var entry = entries[_g1];
					++_g1;
					if(entry.format == format) {
						fn(entry);
						return;
					}
				}
			}
			fn(null);
		};
		this.getAssetFormats(onFormatsAvailable);
	}
	,loadEntry: function(url,entry) {
		null;
	}
	,getAssetFormats: function(fn) {
		null;
	}
	,handleLoad: function(entry,asset) {
		if(this._pack.disposed) return;
		this.handleProgress(entry,entry.bytes);
		var map;
		var _g = entry.format;
		switch(_g[1]) {
		case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:
			map = this._pack.textures;
			break;
		case 8:case 9:case 10:case 11:case 12:
			map = this._pack.sounds;
			break;
		case 13:
			map = this._pack.files;
			break;
		}
		map.set(entry.name,asset);
		this._assetsRemaining -= 1;
		if(this._assetsRemaining == 0) this.handleSuccess();
	}
	,handleProgress: function(entry,bytesLoaded) {
		this._bytesLoaded.set(entry.name,bytesLoaded);
		var bytesTotal = 0;
		var $it0 = this._bytesLoaded.iterator();
		while( $it0.hasNext() ) {
			var bytes = $it0.next();
			bytesTotal += bytes;
		}
		this.promise.set_progress(bytesTotal);
	}
	,handleSuccess: function() {
		this.promise.set_result(this._pack);
	}
	,handleError: function(entry,message) {
		this.promise.error.emit(flambe_util_Strings.withFields(message,["url",entry.url]));
	}
	,handleTextureError: function(entry) {
		this.handleError(entry,"Failed to create texture. Is the GPU context unavailable?");
	}
	,__class__: flambe_platform_BasicAssetPackLoader
};
var flambe_platform__$BasicAssetPackLoader_BasicAssetPack = function(manifest,loader) {
	this.disposed = false;
	this._manifest = manifest;
	this.loader = loader;
	this.textures = new haxe_ds_StringMap();
	this.sounds = new haxe_ds_StringMap();
	this.files = new haxe_ds_StringMap();
};
flambe_platform__$BasicAssetPackLoader_BasicAssetPack.__name__ = true;
flambe_platform__$BasicAssetPackLoader_BasicAssetPack.__interfaces__ = [flambe_asset_AssetPack];
flambe_platform__$BasicAssetPackLoader_BasicAssetPack.prototype = {
	getTexture: function(name,required) {
		if(required == null) required = true;
		var texture = this.textures.get(name);
		if(texture == null && required) throw new js__$Boot_HaxeError(flambe_util_Strings.withFields("Missing texture",["name",name]));
		return texture;
	}
	,getSound: function(name,required) {
		if(required == null) required = true;
		var sound = this.sounds.get(name);
		if(sound == null && required) throw new js__$Boot_HaxeError(flambe_util_Strings.withFields("Missing sound",["name",name]));
		return sound;
	}
	,getFile: function(name,required) {
		if(required == null) required = true;
		var file = this.files.get(name);
		if(file == null && required) throw new js__$Boot_HaxeError(flambe_util_Strings.withFields("Missing file",["name",name]));
		return file;
	}
	,dispose: function() {
		if(!this.disposed) {
			this.disposed = true;
			var $it0 = this.textures.iterator();
			while( $it0.hasNext() ) {
				var texture = $it0.next();
				texture.dispose();
			}
			this.textures = null;
			var $it1 = this.sounds.iterator();
			while( $it1.hasNext() ) {
				var sound = $it1.next();
				sound.dispose();
			}
			this.sounds = null;
			var $it2 = this.files.iterator();
			while( $it2.hasNext() ) {
				var file = $it2.next();
				file.dispose();
			}
			this.files = null;
			this.loader.onDisposed();
		}
	}
	,__class__: flambe_platform__$BasicAssetPackLoader_BasicAssetPack
};
var flambe_platform_BasicFile = function(content) {
	flambe_platform_BasicAsset.call(this);
	this._content = content;
};
flambe_platform_BasicFile.__name__ = true;
flambe_platform_BasicFile.__interfaces__ = [flambe_asset_File];
flambe_platform_BasicFile.__super__ = flambe_platform_BasicAsset;
flambe_platform_BasicFile.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	toString: function() {
		return this._content;
	}
	,onDisposed: function() {
		this._content = null;
	}
	,__class__: flambe_platform_BasicFile
});
var flambe_subsystem_KeyboardSystem = function() { };
flambe_subsystem_KeyboardSystem.__name__ = true;
flambe_subsystem_KeyboardSystem.prototype = {
	__class__: flambe_subsystem_KeyboardSystem
};
var flambe_platform_BasicKeyboard = function() {
	this.down = new flambe_util_Signal1();
	this.up = new flambe_util_Signal1();
	this.backButton = new flambe_util_Signal0();
	this._keyStates = new haxe_ds_IntMap();
};
flambe_platform_BasicKeyboard.__name__ = true;
flambe_platform_BasicKeyboard.__interfaces__ = [flambe_subsystem_KeyboardSystem];
flambe_platform_BasicKeyboard.prototype = {
	submitDown: function(keyCode) {
		if(keyCode == 16777238) {
			if(this.backButton._head != null) {
				this.backButton.emit();
				return true;
			}
			return false;
		}
		if(!this._keyStates.h.hasOwnProperty(keyCode)) {
			this._keyStates.h[keyCode] = true;
			flambe_platform_BasicKeyboard._sharedEvent.init(flambe_platform_BasicKeyboard._sharedEvent.id + 1,flambe_platform_KeyCodes.toKey(keyCode));
			this.down.emit(flambe_platform_BasicKeyboard._sharedEvent);
		}
		return true;
	}
	,submitUp: function(keyCode) {
		if(this._keyStates.h.hasOwnProperty(keyCode)) {
			this._keyStates.remove(keyCode);
			flambe_platform_BasicKeyboard._sharedEvent.init(flambe_platform_BasicKeyboard._sharedEvent.id + 1,flambe_platform_KeyCodes.toKey(keyCode));
			this.up.emit(flambe_platform_BasicKeyboard._sharedEvent);
		}
	}
	,__class__: flambe_platform_BasicKeyboard
};
var flambe_subsystem_MouseSystem = function() { };
flambe_subsystem_MouseSystem.__name__ = true;
flambe_subsystem_MouseSystem.prototype = {
	__class__: flambe_subsystem_MouseSystem
};
var flambe_platform_BasicMouse = function(pointer) {
	this._pointer = pointer;
	this._source = flambe_input_EventSource.Mouse(flambe_platform_BasicMouse._sharedEvent);
	this.down = new flambe_util_Signal1();
	this.move = new flambe_util_Signal1();
	this.up = new flambe_util_Signal1();
	this.scroll = new flambe_util_Signal1();
	this._x = 0;
	this._y = 0;
	this._cursor = flambe_input_MouseCursor.Default;
	this._buttonStates = new haxe_ds_IntMap();
};
flambe_platform_BasicMouse.__name__ = true;
flambe_platform_BasicMouse.__interfaces__ = [flambe_subsystem_MouseSystem];
flambe_platform_BasicMouse.prototype = {
	submitDown: function(viewX,viewY,buttonCode) {
		if(!this._buttonStates.h.hasOwnProperty(buttonCode)) {
			this._buttonStates.h[buttonCode] = true;
			this.prepare(viewX,viewY,flambe_platform_MouseCodes.toButton(buttonCode));
			this._pointer.submitDown(viewX,viewY,this._source);
			this.down.emit(flambe_platform_BasicMouse._sharedEvent);
		}
	}
	,submitMove: function(viewX,viewY) {
		this.prepare(viewX,viewY,null);
		this._pointer.submitMove(viewX,viewY,this._source);
		this.move.emit(flambe_platform_BasicMouse._sharedEvent);
	}
	,submitUp: function(viewX,viewY,buttonCode) {
		if(this._buttonStates.h.hasOwnProperty(buttonCode)) {
			this._buttonStates.remove(buttonCode);
			this.prepare(viewX,viewY,flambe_platform_MouseCodes.toButton(buttonCode));
			this._pointer.submitUp(viewX,viewY,this._source);
			this.up.emit(flambe_platform_BasicMouse._sharedEvent);
		}
	}
	,submitScroll: function(viewX,viewY,velocity) {
		this._x = viewX;
		this._y = viewY;
		if(!(this.scroll._head != null)) return false;
		this.scroll.emit(velocity);
		return true;
	}
	,prepare: function(viewX,viewY,button) {
		this._x = viewX;
		this._y = viewY;
		flambe_platform_BasicMouse._sharedEvent.init(flambe_platform_BasicMouse._sharedEvent.id + 1,viewX,viewY,button);
	}
	,__class__: flambe_platform_BasicMouse
};
var flambe_subsystem_PointerSystem = function() { };
flambe_subsystem_PointerSystem.__name__ = true;
flambe_subsystem_PointerSystem.prototype = {
	__class__: flambe_subsystem_PointerSystem
};
var flambe_platform_BasicPointer = function(x,y,isDown) {
	if(isDown == null) isDown = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.down = new flambe_util_Signal1();
	this.move = new flambe_util_Signal1();
	this.up = new flambe_util_Signal1();
	this._x = x;
	this._y = y;
	this._isDown = isDown;
};
flambe_platform_BasicPointer.__name__ = true;
flambe_platform_BasicPointer.__interfaces__ = [flambe_subsystem_PointerSystem];
flambe_platform_BasicPointer.prototype = {
	submitDown: function(viewX,viewY,source) {
		if(this._isDown) return;
		this.submitMove(viewX,viewY,source);
		this._isDown = true;
		var chain = [];
		var hit = flambe_display_Sprite.hitTest(flambe_System.root,viewX,viewY);
		if(hit != null) {
			var entity = hit.owner;
			do {
				var sprite = entity._compMap.Sprite_2;
				if(sprite != null) chain.push(sprite);
				entity = entity.parent;
			} while(entity != null);
		}
		this.prepare(viewX,viewY,hit,source);
		var _g = 0;
		while(_g < chain.length) {
			var sprite1 = chain[_g];
			++_g;
			sprite1.onPointerDown(flambe_platform_BasicPointer._sharedEvent);
			if(flambe_platform_BasicPointer._sharedEvent._stopped) return;
		}
		this.down.emit(flambe_platform_BasicPointer._sharedEvent);
	}
	,submitMove: function(viewX,viewY,source) {
		if(viewX == this._x && viewY == this._y) return;
		var chain = [];
		var hit = flambe_display_Sprite.hitTest(flambe_System.root,viewX,viewY);
		if(hit != null) {
			var entity = hit.owner;
			do {
				var sprite = entity._compMap.Sprite_2;
				if(sprite != null) chain.push(sprite);
				entity = entity.parent;
			} while(entity != null);
		}
		this.prepare(viewX,viewY,hit,source);
		var _g = 0;
		while(_g < chain.length) {
			var sprite1 = chain[_g];
			++_g;
			sprite1.onPointerMove(flambe_platform_BasicPointer._sharedEvent);
			if(flambe_platform_BasicPointer._sharedEvent._stopped) return;
		}
		this.move.emit(flambe_platform_BasicPointer._sharedEvent);
	}
	,submitUp: function(viewX,viewY,source) {
		if(!this._isDown) return;
		this.submitMove(viewX,viewY,source);
		this._isDown = false;
		var chain = [];
		var hit = flambe_display_Sprite.hitTest(flambe_System.root,viewX,viewY);
		if(hit != null) {
			var entity = hit.owner;
			do {
				var sprite = entity._compMap.Sprite_2;
				if(sprite != null) chain.push(sprite);
				entity = entity.parent;
			} while(entity != null);
		}
		this.prepare(viewX,viewY,hit,source);
		var _g = 0;
		while(_g < chain.length) {
			var sprite1 = chain[_g];
			++_g;
			sprite1.onPointerUp(flambe_platform_BasicPointer._sharedEvent);
			if(flambe_platform_BasicPointer._sharedEvent._stopped) return;
		}
		this.up.emit(flambe_platform_BasicPointer._sharedEvent);
	}
	,prepare: function(viewX,viewY,hit,source) {
		this._x = viewX;
		this._y = viewY;
		flambe_platform_BasicPointer._sharedEvent.init(flambe_platform_BasicPointer._sharedEvent.id + 1,viewX,viewY,hit,source);
	}
	,__class__: flambe_platform_BasicPointer
};
var flambe_platform_BasicTexture = function(root,width,height) {
	this._parent = null;
	this.rootY = 0;
	this.rootX = 0;
	flambe_platform_BasicAsset.call(this);
	this.root = root;
	this._width = width;
	this._height = height;
};
flambe_platform_BasicTexture.__name__ = true;
flambe_platform_BasicTexture.__interfaces__ = [flambe_display_SubTexture];
flambe_platform_BasicTexture.__super__ = flambe_platform_BasicAsset;
flambe_platform_BasicTexture.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	onDisposed: function() {
		if(this._parent == null) this.root.dispose();
	}
	,get_width: function() {
		return this._width;
	}
	,get_height: function() {
		return this._height;
	}
	,__class__: flambe_platform_BasicTexture
});
var flambe_subsystem_TouchSystem = function() { };
flambe_subsystem_TouchSystem.__name__ = true;
var flambe_platform_BasicTouch = function(pointer,maxPoints) {
	if(maxPoints == null) maxPoints = 4;
	this._pointer = pointer;
	this._maxPoints = maxPoints;
	this._pointMap = new haxe_ds_IntMap();
	this._points = [];
	this.down = new flambe_util_Signal1();
	this.move = new flambe_util_Signal1();
	this.up = new flambe_util_Signal1();
};
flambe_platform_BasicTouch.__name__ = true;
flambe_platform_BasicTouch.__interfaces__ = [flambe_subsystem_TouchSystem];
flambe_platform_BasicTouch.prototype = {
	submitDown: function(id,viewX,viewY) {
		if(!this._pointMap.h.hasOwnProperty(id)) {
			var point = new flambe_input_TouchPoint(id);
			point.init(viewX,viewY);
			this._pointMap.h[id] = point;
			this._points.push(point);
			if(this._pointerTouch == null) {
				this._pointerTouch = point;
				this._pointer.submitDown(viewX,viewY,point._source);
			}
			this.down.emit(point);
		}
	}
	,submitMove: function(id,viewX,viewY) {
		var point = this._pointMap.h[id];
		if(point != null) {
			point.init(viewX,viewY);
			if(this._pointerTouch == point) this._pointer.submitMove(viewX,viewY,point._source);
			this.move.emit(point);
		}
	}
	,submitUp: function(id,viewX,viewY) {
		var point = this._pointMap.h[id];
		if(point != null) {
			point.init(viewX,viewY);
			this._pointMap.remove(id);
			HxOverrides.remove(this._points,point);
			if(this._pointerTouch == point) {
				this._pointerTouch = null;
				this._pointer.submitUp(viewX,viewY,point._source);
			}
			this.up.emit(point);
		}
	}
	,__class__: flambe_platform_BasicTouch
};
var flambe_sound_Sound = function() { };
flambe_sound_Sound.__name__ = true;
flambe_sound_Sound.__interfaces__ = [flambe_asset_Asset];
flambe_sound_Sound.prototype = {
	__class__: flambe_sound_Sound
};
var flambe_platform_DummySound = function() {
	flambe_platform_BasicAsset.call(this);
	this._playback = new flambe_platform_DummyPlayback(this);
};
flambe_platform_DummySound.__name__ = true;
flambe_platform_DummySound.__interfaces__ = [flambe_sound_Sound];
flambe_platform_DummySound.getInstance = function() {
	if(flambe_platform_DummySound._instance == null) flambe_platform_DummySound._instance = new flambe_platform_DummySound();
	return flambe_platform_DummySound._instance;
};
flambe_platform_DummySound.__super__ = flambe_platform_BasicAsset;
flambe_platform_DummySound.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	play: function(volume) {
		if(volume == null) volume = 1.0;
		return this._playback;
	}
	,onDisposed: function() {
	}
	,__class__: flambe_platform_DummySound
});
var flambe_sound_Playback = function() { };
flambe_sound_Playback.__name__ = true;
flambe_sound_Playback.__interfaces__ = [flambe_util_Disposable];
flambe_sound_Playback.prototype = {
	__class__: flambe_sound_Playback
};
var flambe_platform_DummyPlayback = function(sound) {
	this._sound = sound;
	this.volume = new flambe_animation_AnimatedFloat(0);
	this._complete = new flambe_util_Value(true);
};
flambe_platform_DummyPlayback.__name__ = true;
flambe_platform_DummyPlayback.__interfaces__ = [flambe_sound_Playback];
flambe_platform_DummyPlayback.prototype = {
	dispose: function() {
	}
	,__class__: flambe_platform_DummyPlayback
};
var flambe_platform_DummyTouch = function() {
	this.down = new flambe_util_Signal1();
	this.move = new flambe_util_Signal1();
	this.up = new flambe_util_Signal1();
};
flambe_platform_DummyTouch.__name__ = true;
flambe_platform_DummyTouch.__interfaces__ = [flambe_subsystem_TouchSystem];
flambe_platform_DummyTouch.prototype = {
	__class__: flambe_platform_DummyTouch
};
var flambe_platform_EventGroup = function() {
	this._entries = [];
};
flambe_platform_EventGroup.__name__ = true;
flambe_platform_EventGroup.__interfaces__ = [flambe_util_Disposable];
flambe_platform_EventGroup.prototype = {
	addListener: function(dispatcher,type,listener) {
		dispatcher.addEventListener(type,listener,false);
		this._entries.push(new flambe_platform__$EventGroup_Entry(dispatcher,type,listener));
	}
	,addDisposingListener: function(dispatcher,type,listener) {
		var _g = this;
		this.addListener(dispatcher,type,function(event) {
			_g.dispose();
			listener(event);
		});
	}
	,dispose: function() {
		var _g = 0;
		var _g1 = this._entries;
		while(_g < _g1.length) {
			var entry = _g1[_g];
			++_g;
			entry.dispatcher.removeEventListener(entry.type,entry.listener,false);
		}
		this._entries = [];
	}
	,__class__: flambe_platform_EventGroup
};
var flambe_platform__$EventGroup_Entry = function(dispatcher,type,listener) {
	this.dispatcher = dispatcher;
	this.type = type;
	this.listener = listener;
};
flambe_platform__$EventGroup_Entry.__name__ = true;
flambe_platform__$EventGroup_Entry.prototype = {
	__class__: flambe_platform__$EventGroup_Entry
};
var flambe_platform_InternalGraphics = function() { };
flambe_platform_InternalGraphics.__name__ = true;
flambe_platform_InternalGraphics.__interfaces__ = [flambe_display_Graphics];
flambe_platform_InternalGraphics.prototype = {
	__class__: flambe_platform_InternalGraphics
};
var flambe_subsystem_RendererSystem = function() { };
flambe_subsystem_RendererSystem.__name__ = true;
flambe_subsystem_RendererSystem.prototype = {
	__class__: flambe_subsystem_RendererSystem
};
var flambe_platform_InternalRenderer = function() { };
flambe_platform_InternalRenderer.__name__ = true;
flambe_platform_InternalRenderer.__interfaces__ = [flambe_subsystem_RendererSystem];
flambe_platform_InternalRenderer.prototype = {
	__class__: flambe_platform_InternalRenderer
};
var flambe_platform_KeyCodes = function() { };
flambe_platform_KeyCodes.__name__ = true;
flambe_platform_KeyCodes.toKey = function(keyCode) {
	switch(keyCode) {
	case 65:
		return flambe_input_Key.A;
	case 66:
		return flambe_input_Key.B;
	case 67:
		return flambe_input_Key.C;
	case 68:
		return flambe_input_Key.D;
	case 69:
		return flambe_input_Key.E;
	case 70:
		return flambe_input_Key.F;
	case 71:
		return flambe_input_Key.G;
	case 72:
		return flambe_input_Key.H;
	case 73:
		return flambe_input_Key.I;
	case 74:
		return flambe_input_Key.J;
	case 75:
		return flambe_input_Key.K;
	case 76:
		return flambe_input_Key.L;
	case 77:
		return flambe_input_Key.M;
	case 78:
		return flambe_input_Key.N;
	case 79:
		return flambe_input_Key.O;
	case 80:
		return flambe_input_Key.P;
	case 81:
		return flambe_input_Key.Q;
	case 82:
		return flambe_input_Key.R;
	case 83:
		return flambe_input_Key.S;
	case 84:
		return flambe_input_Key.T;
	case 85:
		return flambe_input_Key.U;
	case 86:
		return flambe_input_Key.V;
	case 87:
		return flambe_input_Key.W;
	case 88:
		return flambe_input_Key.X;
	case 89:
		return flambe_input_Key.Y;
	case 90:
		return flambe_input_Key.Z;
	case 48:
		return flambe_input_Key.Number0;
	case 49:
		return flambe_input_Key.Number1;
	case 50:
		return flambe_input_Key.Number2;
	case 51:
		return flambe_input_Key.Number3;
	case 52:
		return flambe_input_Key.Number4;
	case 53:
		return flambe_input_Key.Number5;
	case 54:
		return flambe_input_Key.Number6;
	case 55:
		return flambe_input_Key.Number7;
	case 56:
		return flambe_input_Key.Number8;
	case 57:
		return flambe_input_Key.Number9;
	case 96:
		return flambe_input_Key.Numpad0;
	case 97:
		return flambe_input_Key.Numpad1;
	case 98:
		return flambe_input_Key.Numpad2;
	case 99:
		return flambe_input_Key.Numpad3;
	case 100:
		return flambe_input_Key.Numpad4;
	case 101:
		return flambe_input_Key.Numpad5;
	case 102:
		return flambe_input_Key.Numpad6;
	case 103:
		return flambe_input_Key.Numpad7;
	case 104:
		return flambe_input_Key.Numpad8;
	case 105:
		return flambe_input_Key.Numpad9;
	case 107:
		return flambe_input_Key.NumpadAdd;
	case 110:
		return flambe_input_Key.NumpadDecimal;
	case 111:
		return flambe_input_Key.NumpadDivide;
	case 108:
		return flambe_input_Key.NumpadEnter;
	case 106:
		return flambe_input_Key.NumpadMultiply;
	case 109:
		return flambe_input_Key.NumpadSubtract;
	case 112:
		return flambe_input_Key.F1;
	case 113:
		return flambe_input_Key.F2;
	case 114:
		return flambe_input_Key.F3;
	case 115:
		return flambe_input_Key.F4;
	case 116:
		return flambe_input_Key.F5;
	case 117:
		return flambe_input_Key.F6;
	case 118:
		return flambe_input_Key.F7;
	case 119:
		return flambe_input_Key.F8;
	case 120:
		return flambe_input_Key.F9;
	case 121:
		return flambe_input_Key.F10;
	case 122:
		return flambe_input_Key.F11;
	case 123:
		return flambe_input_Key.F12;
	case 37:
		return flambe_input_Key.Left;
	case 38:
		return flambe_input_Key.Up;
	case 39:
		return flambe_input_Key.Right;
	case 40:
		return flambe_input_Key.Down;
	case 18:
		return flambe_input_Key.Alt;
	case 192:
		return flambe_input_Key.Backquote;
	case 220:
		return flambe_input_Key.Backslash;
	case 8:
		return flambe_input_Key.Backspace;
	case 20:
		return flambe_input_Key.CapsLock;
	case 188:
		return flambe_input_Key.Comma;
	case 15:
		return flambe_input_Key.Command;
	case 17:
		return flambe_input_Key.Control;
	case 46:
		return flambe_input_Key.Delete;
	case 35:
		return flambe_input_Key.End;
	case 13:
		return flambe_input_Key.Enter;
	case 187:
		return flambe_input_Key.Equals;
	case 27:
		return flambe_input_Key.Escape;
	case 36:
		return flambe_input_Key.Home;
	case 45:
		return flambe_input_Key.Insert;
	case 219:
		return flambe_input_Key.LeftBracket;
	case 189:
		return flambe_input_Key.Minus;
	case 34:
		return flambe_input_Key.PageDown;
	case 33:
		return flambe_input_Key.PageUp;
	case 190:
		return flambe_input_Key.Period;
	case 222:
		return flambe_input_Key.Quote;
	case 221:
		return flambe_input_Key.RightBracket;
	case 186:
		return flambe_input_Key.Semicolon;
	case 16:
		return flambe_input_Key.Shift;
	case 191:
		return flambe_input_Key.Slash;
	case 32:
		return flambe_input_Key.Space;
	case 9:
		return flambe_input_Key.Tab;
	case 16777234:
		return flambe_input_Key.Menu;
	case 16777247:
		return flambe_input_Key.Search;
	}
	return flambe_input_Key.Unknown(keyCode);
};
var flambe_platform_MainLoop = function() {
	this._tickables = [];
};
flambe_platform_MainLoop.__name__ = true;
flambe_platform_MainLoop.updateEntity = function(entity,dt) {
	var speed = entity._compMap.SpeedAdjuster_5;
	if(speed != null) {
		speed._realDt = dt;
		dt *= speed.scale._value;
		if(dt <= 0) {
			speed.onUpdate(dt);
			return;
		}
	}
	var p = entity.firstComponent;
	while(p != null) {
		var next = p.next;
		if(!((p._flags & 1) != 0)) {
			p._flags = p._flags | 1;
			p.onStart();
		}
		p.onUpdate(dt);
		p = next;
	}
	var p1 = entity.firstChild;
	while(p1 != null) {
		var next1 = p1.next;
		flambe_platform_MainLoop.updateEntity(p1,dt);
		p1 = next1;
	}
};
flambe_platform_MainLoop.prototype = {
	update: function(dt) {
		if(dt <= 0) return;
		if(dt > 1) dt = 1;
		var ii = 0;
		while(ii < this._tickables.length) {
			var t = this._tickables[ii];
			if(t == null || t.update(dt)) this._tickables.splice(ii,1); else ++ii;
		}
		flambe_System.volume.update(dt);
		flambe_platform_MainLoop.updateEntity(flambe_System.root,dt);
	}
	,render: function(renderer) {
		var graphics = renderer.graphics;
		if(graphics != null) {
			renderer.willRender();
			flambe_display_Sprite.render(flambe_System.root,graphics);
			renderer.didRender();
		}
	}
	,addTickable: function(t) {
		this._tickables.push(t);
	}
	,__class__: flambe_platform_MainLoop
};
var flambe_platform_MathUtil = function() { };
flambe_platform_MathUtil.__name__ = true;
flambe_platform_MathUtil.nextPowerOfTwo = function(n) {
	var p = 1;
	while(p < n) p <<= 1;
	return p;
};
var flambe_platform_MouseCodes = function() { };
flambe_platform_MouseCodes.__name__ = true;
flambe_platform_MouseCodes.toButton = function(buttonCode) {
	switch(buttonCode) {
	case 0:
		return flambe_input_MouseButton.Left;
	case 1:
		return flambe_input_MouseButton.Middle;
	case 2:
		return flambe_input_MouseButton.Right;
	}
	return flambe_input_MouseButton.Unknown(buttonCode);
};
var flambe_platform_TextureRoot = function() { };
flambe_platform_TextureRoot.__name__ = true;
var flambe_platform_Tickable = function() { };
flambe_platform_Tickable.__name__ = true;
flambe_platform_Tickable.prototype = {
	__class__: flambe_platform_Tickable
};
var flambe_platform_html_CanvasGraphics = function(canvas,alpha) {
	this._firstDraw = false;
	this._canvasCtx = canvas.getContext("2d",{ alpha : alpha});
};
flambe_platform_html_CanvasGraphics.__name__ = true;
flambe_platform_html_CanvasGraphics.__interfaces__ = [flambe_platform_InternalGraphics];
flambe_platform_html_CanvasGraphics.prototype = {
	save: function() {
		this._canvasCtx.save();
	}
	,transform: function(m00,m10,m01,m11,m02,m12) {
		this._canvasCtx.transform(m00,m10,m01,m11,m02,m12);
	}
	,restore: function() {
		this._canvasCtx.restore();
	}
	,drawTexture: function(texture,destX,destY) {
		this.drawSubTexture(texture,destX,destY,0,0,texture.get_width(),texture.get_height());
	}
	,drawSubTexture: function(texture,destX,destY,sourceX,sourceY,sourceW,sourceH) {
		if(this._firstDraw) {
			this._firstDraw = false;
			this._canvasCtx.globalCompositeOperation = "copy";
			this.drawSubTexture(texture,destX,destY,sourceX,sourceY,sourceW,sourceH);
			this._canvasCtx.globalCompositeOperation = "source-over";
			return;
		}
		var texture1 = texture;
		var root = texture1.root;
		this._canvasCtx.drawImage(root.image,texture1.rootX + sourceX | 0,texture1.rootY + sourceY | 0,sourceW | 0,sourceH | 0,destX | 0,destY | 0,sourceW | 0,sourceH | 0);
	}
	,drawPattern: function(texture,x,y,width,height) {
		if(this._firstDraw) {
			this._firstDraw = false;
			this._canvasCtx.globalCompositeOperation = "copy";
			this.drawPattern(texture,x,y,width,height);
			this._canvasCtx.globalCompositeOperation = "source-over";
			return;
		}
		var texture1 = texture;
		var root = texture1.root;
		this._canvasCtx.fillStyle = texture1.getPattern();
		this._canvasCtx.fillRect(x | 0,y | 0,width | 0,height | 0);
	}
	,fillRect: function(color,x,y,width,height) {
		if(this._firstDraw) {
			this._firstDraw = false;
			this._canvasCtx.globalCompositeOperation = "copy";
			this.fillRect(color,x,y,width,height);
			this._canvasCtx.globalCompositeOperation = "source-over";
			return;
		}
		var hex = (16777215 & color).toString(16);
		while(hex.length < 6) hex = "0" + Std.string(hex);
		this._canvasCtx.fillStyle = "#" + Std.string(hex);
		this._canvasCtx.fillRect(x | 0,y | 0,width | 0,height | 0);
	}
	,multiplyAlpha: function(factor) {
		this._canvasCtx.globalAlpha *= factor;
	}
	,setBlendMode: function(blendMode) {
		var op;
		switch(blendMode[1]) {
		case 0:
			op = "source-over";
			break;
		case 1:
			op = "lighter";
			break;
		case 2:
			op = "multiply";
			break;
		case 3:
			op = "screen";
			break;
		case 4:
			op = "destination-in";
			break;
		case 5:
			op = "copy";
			break;
		}
		this._canvasCtx.globalCompositeOperation = op;
	}
	,applyScissor: function(x,y,width,height) {
		this._canvasCtx.beginPath();
		this._canvasCtx.rect(x | 0,y | 0,width | 0,height | 0);
		this._canvasCtx.clip();
	}
	,willRender: function() {
		this._firstDraw = true;
	}
	,didRender: function() {
	}
	,onResize: function(width,height) {
	}
	,__class__: flambe_platform_html_CanvasGraphics
};
var flambe_platform_html_CanvasRenderer = function(canvas) {
	this.graphics = new flambe_platform_html_CanvasGraphics(canvas,false);
	this._hasGPU = new flambe_util_Value(true);
};
flambe_platform_html_CanvasRenderer.__name__ = true;
flambe_platform_html_CanvasRenderer.__interfaces__ = [flambe_platform_InternalRenderer];
flambe_platform_html_CanvasRenderer.prototype = {
	get_type: function() {
		return flambe_subsystem_RendererType.Canvas;
	}
	,createTextureFromImage: function(image) {
		var root = new flambe_platform_html_CanvasTextureRoot(flambe_platform_html_CanvasRenderer.CANVAS_TEXTURES?flambe_platform_html_HtmlUtil.createCanvas(image):image);
		return root.createTexture(root.width,root.height);
	}
	,getCompressedTextureFormats: function() {
		return [];
	}
	,createCompressedTexture: function(format,data) {
		return null;
	}
	,willRender: function() {
		this.graphics.willRender();
	}
	,didRender: function() {
		this.graphics.didRender();
	}
	,__class__: flambe_platform_html_CanvasRenderer
};
var flambe_platform_html_CanvasTexture = function(root,width,height) {
	this._rootUpdateCount = 0;
	this._pattern = null;
	flambe_platform_BasicTexture.call(this,root,width,height);
};
flambe_platform_html_CanvasTexture.__name__ = true;
flambe_platform_html_CanvasTexture.__super__ = flambe_platform_BasicTexture;
flambe_platform_html_CanvasTexture.prototype = $extend(flambe_platform_BasicTexture.prototype,{
	getPattern: function() {
		if(this._rootUpdateCount != this.root.updateCount || this._pattern == null) {
			this._rootUpdateCount = this.root.updateCount;
			this._pattern = this.root.createPattern(this.rootX,this.rootY,this._width,this._height);
		}
		return this._pattern;
	}
	,__class__: flambe_platform_html_CanvasTexture
});
var flambe_platform_html_CanvasTextureRoot = function(image) {
	this._graphics = null;
	this.updateCount = 0;
	flambe_platform_BasicAsset.call(this);
	this.image = image;
	this.width = image.width;
	this.height = image.height;
};
flambe_platform_html_CanvasTextureRoot.__name__ = true;
flambe_platform_html_CanvasTextureRoot.__interfaces__ = [flambe_platform_TextureRoot];
flambe_platform_html_CanvasTextureRoot.__super__ = flambe_platform_BasicAsset;
flambe_platform_html_CanvasTextureRoot.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	createTexture: function(width,height) {
		return new flambe_platform_html_CanvasTexture(this,width,height);
	}
	,createPattern: function(x,y,width,height) {
		var ctx2d = this.getContext2d();
		var source = this.image;
		if(x != 0 || y != 0 || width != this.width || height != this.height) {
			source = flambe_platform_html_HtmlUtil.createEmptyCanvas(width,height);
			var crop = source.getContext("2d",null);
			crop.globalCompositeOperation = "copy";
			crop.drawImage(this.image,-x,-y);
		}
		return ctx2d.createPattern(source,"repeat");
	}
	,getContext2d: function() {
		if(!js_Boot.__instanceof(this.image,HTMLCanvasElement)) this.image = flambe_platform_html_HtmlUtil.createCanvas(this.image);
		var canvas = this.image;
		return canvas.getContext("2d",null);
	}
	,onDisposed: function() {
		this.image = null;
		this._graphics = null;
	}
	,__class__: flambe_platform_html_CanvasTextureRoot
});
var flambe_platform_html_HtmlAssetPackLoader = function(platform,manifest) {
	flambe_platform_BasicAssetPackLoader.call(this,platform,manifest);
};
flambe_platform_html_HtmlAssetPackLoader.__name__ = true;
flambe_platform_html_HtmlAssetPackLoader.detectImageFormats = function(fn) {
	var formats = [flambe_asset_AssetFormat.PNG,flambe_asset_AssetFormat.JPG,flambe_asset_AssetFormat.GIF];
	var formatTests = 2;
	var checkRemaining = function() {
		--formatTests;
		if(formatTests == 0) fn(formats);
	};
	var webp;
	var _this = window.document;
	webp = _this.createElement("img");
	webp.onload = webp.onerror = function(_) {
		if(webp.width == 1) formats.unshift(flambe_asset_AssetFormat.WEBP);
		checkRemaining();
	};
	webp.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
	var jxr;
	var _this1 = window.document;
	jxr = _this1.createElement("img");
	jxr.onload = jxr.onerror = function(_1) {
		if(jxr.width == 1) formats.unshift(flambe_asset_AssetFormat.JXR);
		checkRemaining();
	};
	jxr.src = "data:image/vnd.ms-photo;base64,SUm8AQgAAAAFAAG8AQAQAAAASgAAAIC8BAABAAAAAQAAAIG8BAABAAAAAQAAAMC8BAABAAAAWgAAAMG8BAABAAAAHwAAAAAAAAAkw91vA07+S7GFPXd2jckNV01QSE9UTwAZAYBxAAAAABP/gAAEb/8AAQAAAQAAAA==";
};
flambe_platform_html_HtmlAssetPackLoader.detectAudioFormats = function() {
	var audio;
	var _this = window.document;
	audio = _this.createElement("audio");
	if(audio == null || $bind(audio,audio.canPlayType) == null) return [];
	var blacklist = new EReg("\\b(iPhone|iPod|iPad|Android|Windows Phone)\\b","");
	var userAgent = window.navigator.userAgent;
	if(!flambe_platform_html_WebAudioSound.get_supported() && blacklist.match(userAgent)) return [];
	var types = [{ format : flambe_asset_AssetFormat.M4A, mimeType : "audio/mp4; codecs=mp4a"},{ format : flambe_asset_AssetFormat.MP3, mimeType : "audio/mpeg"},{ format : flambe_asset_AssetFormat.OPUS, mimeType : "audio/ogg; codecs=opus"},{ format : flambe_asset_AssetFormat.OGG, mimeType : "audio/ogg; codecs=vorbis"},{ format : flambe_asset_AssetFormat.WAV, mimeType : "audio/wav"}];
	var result = [];
	var _g = 0;
	while(_g < types.length) {
		var type = types[_g];
		++_g;
		var canPlayType = "";
		try {
			canPlayType = audio.canPlayType(type.mimeType);
		} catch( _ ) {
			if (_ instanceof js__$Boot_HaxeError) _ = _.val;
		}
		if(canPlayType != "") result.push(type.format);
	}
	return result;
};
flambe_platform_html_HtmlAssetPackLoader.supportsBlob = function() {
	if(flambe_platform_html_HtmlAssetPackLoader._detectBlobSupport) {
		flambe_platform_html_HtmlAssetPackLoader._detectBlobSupport = false;
		if(new EReg("\\bSilk\\b","").match(window.navigator.userAgent)) return false;
		if(window.Blob == null) return false;
		var xhr = new XMLHttpRequest();
		xhr.open("GET",".",true);
		if(xhr.responseType != "") return false;
		xhr.responseType = "blob";
		if(xhr.responseType != "blob") return false;
		flambe_platform_html_HtmlAssetPackLoader._URL = flambe_platform_html_HtmlUtil.loadExtension("URL").value;
	}
	return flambe_platform_html_HtmlAssetPackLoader._URL != null && flambe_platform_html_HtmlAssetPackLoader._URL.createObjectURL != null;
};
flambe_platform_html_HtmlAssetPackLoader.__super__ = flambe_platform_BasicAssetPackLoader;
flambe_platform_html_HtmlAssetPackLoader.prototype = $extend(flambe_platform_BasicAssetPackLoader.prototype,{
	loadEntry: function(url,entry) {
		var _g1 = this;
		var _g = entry.format;
		switch(_g[1]) {
		case 0:case 1:case 2:case 3:case 4:
			var image;
			var _this = window.document;
			image = _this.createElement("img");
			var events = new flambe_platform_EventGroup();
			events.addDisposingListener(image,"load",function(_) {
				if(flambe_platform_html_HtmlAssetPackLoader.supportsBlob()) flambe_platform_html_HtmlAssetPackLoader._URL.revokeObjectURL(image.src);
				var texture = _g1._platform.getRenderer().createTextureFromImage(image);
				if(texture != null) _g1.handleLoad(entry,texture); else _g1.handleTextureError(entry);
			});
			events.addDisposingListener(image,"error",function(_1) {
				_g1.handleError(entry,"Failed to load image");
			});
			if(flambe_platform_html_HtmlAssetPackLoader.supportsBlob()) this.download(url,entry,"blob",function(blob) {
				image.src = flambe_platform_html_HtmlAssetPackLoader._URL.createObjectURL(blob);
			}); else image.src = url;
			break;
		case 5:case 6:case 7:
			this.download(url,entry,"arraybuffer",function(buffer) {
				var texture1 = _g1._platform.getRenderer().createCompressedTexture(entry.format,null);
				if(texture1 != null) _g1.handleLoad(entry,texture1); else _g1.handleTextureError(entry);
			});
			break;
		case 8:case 9:case 10:case 11:case 12:
			if(flambe_platform_html_WebAudioSound.get_supported()) this.download(url,entry,"arraybuffer",function(buffer1) {
				flambe_platform_html_WebAudioSound.ctx.decodeAudioData(buffer1,function(decoded) {
					_g1.handleLoad(entry,new flambe_platform_html_WebAudioSound(decoded));
				},function() {
					_g1.handleLoad(entry,flambe_platform_DummySound.getInstance());
				});
			}); else {
				var audio;
				var _this1 = window.document;
				audio = _this1.createElement("audio");
				audio.preload = "auto";
				var ref = ++flambe_platform_html_HtmlAssetPackLoader._mediaRefCount;
				if(flambe_platform_html_HtmlAssetPackLoader._mediaElements == null) flambe_platform_html_HtmlAssetPackLoader._mediaElements = new haxe_ds_IntMap();
				flambe_platform_html_HtmlAssetPackLoader._mediaElements.h[ref] = audio;
				var events1 = new flambe_platform_EventGroup();
				events1.addDisposingListener(audio,"canplaythrough",function(_2) {
					flambe_platform_html_HtmlAssetPackLoader._mediaElements.remove(ref);
					_g1.handleLoad(entry,new flambe_platform_html_HtmlSound(audio));
				});
				events1.addDisposingListener(audio,"error",function(_3) {
					flambe_platform_html_HtmlAssetPackLoader._mediaElements.remove(ref);
					var code = audio.error.code;
					if(code == 3 || code == 4) _g1.handleLoad(entry,flambe_platform_DummySound.getInstance()); else _g1.handleError(entry,"Failed to load audio: " + audio.error.code);
				});
				events1.addListener(audio,"progress",function(_4) {
					if(audio.buffered.length > 0 && audio.duration > 0) {
						var progress = audio.buffered.end(0) / audio.duration;
						_g1.handleProgress(entry,progress * entry.bytes | 0);
					}
				});
				audio.src = url;
				audio.load();
			}
			break;
		case 13:
			this.download(url,entry,"text",function(text) {
				_g1.handleLoad(entry,new flambe_platform_BasicFile(text));
			});
			break;
		}
	}
	,getAssetFormats: function(fn) {
		var _g = this;
		if(flambe_platform_html_HtmlAssetPackLoader._supportedFormats == null) {
			flambe_platform_html_HtmlAssetPackLoader._supportedFormats = new flambe_util_Promise();
			flambe_platform_html_HtmlAssetPackLoader.detectImageFormats(function(imageFormats) {
				flambe_platform_html_HtmlAssetPackLoader._supportedFormats.set_result(_g._platform.getRenderer().getCompressedTextureFormats().concat(imageFormats).concat(flambe_platform_html_HtmlAssetPackLoader.detectAudioFormats()).concat([flambe_asset_AssetFormat.Data]));
			});
		}
		flambe_platform_html_HtmlAssetPackLoader._supportedFormats.get(fn);
	}
	,download: function(url,entry,responseType,onLoad) {
		var _g = this;
		var xhr = null;
		var start = null;
		var intervalId = 0;
		var hasInterval = false;
		var clearRetryInterval = function() {
			if(hasInterval) {
				hasInterval = false;
				window.clearInterval(intervalId);
			}
		};
		var retries = 3;
		var maybeRetry = function() {
			--retries;
			if(retries >= 0) {
				start();
				return true;
			}
			return false;
		};
		start = function() {
			clearRetryInterval();
			if(xhr != null) xhr.abort();
			xhr = new XMLHttpRequest();
			xhr.open("GET",url,true);
			xhr.responseType = responseType;
			var lastProgress = 0.0;
			xhr.onprogress = function(event) {
				if(!hasInterval) {
					hasInterval = true;
					intervalId = window.setInterval(function() {
						if(xhr.readyState != 4 && Date.now() - lastProgress > 5000) {
							if(!maybeRetry()) {
								clearRetryInterval();
								_g.handleError(entry,"Download stalled");
							}
						}
					},1000);
				}
				lastProgress = Date.now();
				_g.handleProgress(entry,event.loaded);
			};
			xhr.onerror = function(_) {
				if(xhr.status != 0 || !maybeRetry()) {
					clearRetryInterval();
					_g.handleError(entry,"HTTP error " + xhr.status);
				}
			};
			xhr.onload = function(_1) {
				var response = xhr.response;
				if(response == null) response = xhr.responseText;
				clearRetryInterval();
				onLoad(response);
			};
			xhr.send();
		};
		start();
	}
	,__class__: flambe_platform_html_HtmlAssetPackLoader
});
var flambe_platform_html_HtmlMouse = function(pointer,canvas) {
	flambe_platform_BasicMouse.call(this,pointer);
	this._canvas = canvas;
};
flambe_platform_html_HtmlMouse.__name__ = true;
flambe_platform_html_HtmlMouse.__super__ = flambe_platform_BasicMouse;
flambe_platform_html_HtmlMouse.prototype = $extend(flambe_platform_BasicMouse.prototype,{
	__class__: flambe_platform_html_HtmlMouse
});
var flambe_platform_html_HtmlSound = function(audioElement) {
	flambe_platform_BasicAsset.call(this);
	this.audioElement = audioElement;
};
flambe_platform_html_HtmlSound.__name__ = true;
flambe_platform_html_HtmlSound.__interfaces__ = [flambe_sound_Sound];
flambe_platform_html_HtmlSound.__super__ = flambe_platform_BasicAsset;
flambe_platform_html_HtmlSound.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	play: function(volume) {
		if(volume == null) volume = 1.0;
		return new flambe_platform_html__$HtmlSound_HtmlPlayback(this,volume,false);
	}
	,onDisposed: function() {
		this.audioElement = null;
	}
	,__class__: flambe_platform_html_HtmlSound
});
var flambe_platform_html__$HtmlSound_HtmlPlayback = function(sound,volume,loop) {
	var _g = this;
	this._sound = sound;
	this._tickableAdded = false;
	var _this = window.document;
	this._clonedElement = _this.createElement("audio");
	this._clonedElement.loop = loop;
	this._clonedElement.src = sound.audioElement.src;
	this.volume = new flambe_animation_AnimatedFloat(volume,function(_,_1) {
		_g.updateVolume();
	});
	this.updateVolume();
	this._complete = new flambe_util_Value(false);
	this.playAudio();
	if(flambe_System.hidden._value) this.set_paused(true);
};
flambe_platform_html__$HtmlSound_HtmlPlayback.__name__ = true;
flambe_platform_html__$HtmlSound_HtmlPlayback.__interfaces__ = [flambe_platform_Tickable,flambe_sound_Playback];
flambe_platform_html__$HtmlSound_HtmlPlayback.prototype = {
	set_paused: function(paused) {
		if(this._clonedElement.paused != paused) {
			if(paused) this._clonedElement.pause(); else this.playAudio();
		}
		return paused;
	}
	,update: function(dt) {
		this.volume.update(dt);
		this._complete.set__(this._clonedElement.ended);
		if(this._complete._value || this._clonedElement.paused) {
			this._tickableAdded = false;
			this._volumeBinding.dispose();
			this._hideBinding.dispose();
			return true;
		}
		return false;
	}
	,dispose: function() {
		this.set_paused(true);
		this._complete.set__(true);
	}
	,playAudio: function() {
		var _g = this;
		this._clonedElement.play();
		if(!this._tickableAdded) {
			flambe_platform_html_HtmlPlatform.instance.mainLoop.addTickable(this);
			this._tickableAdded = true;
			this._volumeBinding = flambe_System.volume.get_changed().connect(function(_,_1) {
				_g.updateVolume();
			});
			this._hideBinding = flambe_System.hidden.get_changed().connect(function(hidden,_2) {
				if(hidden) {
					_g._wasPaused = _g._clonedElement.paused;
					_g.set_paused(true);
				} else _g.set_paused(_g._wasPaused);
			});
		}
	}
	,updateVolume: function() {
		this._clonedElement.volume = flambe_System.volume._value * this.volume._value;
	}
	,__class__: flambe_platform_html__$HtmlSound_HtmlPlayback
};
var flambe_subsystem_StageSystem = function() { };
flambe_subsystem_StageSystem.__name__ = true;
flambe_subsystem_StageSystem.prototype = {
	__class__: flambe_subsystem_StageSystem
};
var flambe_platform_html_HtmlStage = function(canvas) {
	var _g = this;
	this._canvas = canvas;
	this.resize = new flambe_util_Signal0();
	this.scaleFactor = flambe_platform_html_HtmlStage.computeScaleFactor();
	if(this.scaleFactor != 1) {
		flambe_platform_html_HtmlUtil.setVendorStyle(this._canvas,"transform-origin","top left");
		flambe_platform_html_HtmlUtil.setVendorStyle(this._canvas,"transform","scale(" + 1 / this.scaleFactor + ")");
	}
	if(flambe_platform_html_HtmlUtil.SHOULD_HIDE_MOBILE_BROWSER) {
		window.addEventListener("orientationchange",function(_) {
			flambe_platform_html_HtmlUtil.callLater($bind(_g,_g.hideMobileBrowser),200);
		},false);
		this.hideMobileBrowser();
	}
	window.addEventListener("resize",$bind(this,this.onWindowResize),false);
	this.onWindowResize(null);
	this.orientation = new flambe_util_Value(null);
	if(window.orientation != null) {
		window.addEventListener("orientationchange",$bind(this,this.onOrientationChange),false);
		this.onOrientationChange(null);
	}
	this.fullscreen = new flambe_util_Value(false);
	flambe_platform_html_HtmlUtil.addVendorListener(window.document,"fullscreenchange",function(_1) {
		_g.updateFullscreen();
	},false);
	this.updateFullscreen();
};
flambe_platform_html_HtmlStage.__name__ = true;
flambe_platform_html_HtmlStage.__interfaces__ = [flambe_subsystem_StageSystem];
flambe_platform_html_HtmlStage.computeScaleFactor = function() {
	var devicePixelRatio = window.devicePixelRatio;
	if(devicePixelRatio == null) devicePixelRatio = 1;
	var canvas;
	var _this = window.document;
	canvas = _this.createElement("canvas");
	var ctx = canvas.getContext("2d",null);
	var backingStorePixelRatio = flambe_platform_html_HtmlUtil.loadExtension("backingStorePixelRatio",ctx).value;
	if(backingStorePixelRatio == null) backingStorePixelRatio = 1;
	var scale = devicePixelRatio / backingStorePixelRatio;
	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	if(scale * screenWidth > 1136 || scale * screenHeight > 1136) return 1;
	return scale;
};
flambe_platform_html_HtmlStage.prototype = {
	get_width: function() {
		return this._canvas.width;
	}
	,get_height: function() {
		return this._canvas.height;
	}
	,onWindowResize: function(_) {
		var container = this._canvas.parentElement;
		var rect = container.getBoundingClientRect();
		this.resizeCanvas(rect.width,rect.height);
	}
	,resizeCanvas: function(width,height) {
		var scaledWidth = this.scaleFactor * width;
		var scaledHeight = this.scaleFactor * height;
		if(this._canvas.width == scaledWidth && this._canvas.height == scaledHeight) return false;
		this._canvas.width = scaledWidth | 0;
		this._canvas.height = scaledHeight | 0;
		this.resize.emit();
		return true;
	}
	,hideMobileBrowser: function() {
		var _g = this;
		var mobileAddressBar = 100;
		var htmlStyle = window.document.documentElement.style;
		htmlStyle.height = window.innerHeight + mobileAddressBar + "px";
		htmlStyle.width = window.innerWidth + "px";
		htmlStyle.overflow = "visible";
		flambe_platform_html_HtmlUtil.callLater(function() {
			flambe_platform_html_HtmlUtil.hideMobileBrowser();
			flambe_platform_html_HtmlUtil.callLater(function() {
				htmlStyle.height = window.innerHeight + "px";
				_g.onWindowResize(null);
			},100);
		});
	}
	,onOrientationChange: function(_) {
		var value = flambe_platform_html_HtmlUtil.orientation(window.orientation);
		this.orientation.set__(value);
	}
	,updateFullscreen: function() {
		var state = flambe_platform_html_HtmlUtil.loadFirstExtension(["fullscreen","fullScreen","isFullScreen"],window.document).value;
		this.fullscreen.set__(state == true);
	}
	,__class__: flambe_platform_html_HtmlStage
};
var flambe_platform_html_HtmlUtil = function() { };
flambe_platform_html_HtmlUtil.__name__ = true;
flambe_platform_html_HtmlUtil.callLater = function(func,delay) {
	if(delay == null) delay = 0;
	window.setTimeout(func,delay);
};
flambe_platform_html_HtmlUtil.hideMobileBrowser = function() {
	window.scrollTo(1,0);
};
flambe_platform_html_HtmlUtil.loadExtension = function(name,obj) {
	if(obj == null) obj = window;
	var extension = Reflect.field(obj,name);
	if(extension != null) return { prefix : "", field : name, value : extension};
	var capitalized = name.charAt(0).toUpperCase() + HxOverrides.substr(name,1,null);
	var _g = 0;
	var _g1 = flambe_platform_html_HtmlUtil.VENDOR_PREFIXES;
	while(_g < _g1.length) {
		var prefix = _g1[_g];
		++_g;
		var field = prefix + capitalized;
		var extension1 = Reflect.field(obj,field);
		if(extension1 != null) return { prefix : prefix, field : field, value : extension1};
	}
	return { prefix : null, field : null, value : null};
};
flambe_platform_html_HtmlUtil.loadFirstExtension = function(names,obj) {
	var _g = 0;
	while(_g < names.length) {
		var name = names[_g];
		++_g;
		var extension = flambe_platform_html_HtmlUtil.loadExtension(name,obj);
		if(extension.field != null) return extension;
	}
	return { prefix : null, field : null, value : null};
};
flambe_platform_html_HtmlUtil.polyfill = function(name,obj) {
	if(obj == null) obj = window;
	var value = flambe_platform_html_HtmlUtil.loadExtension(name,obj).value;
	if(value == null) return false;
	obj[name] = value;
	return true;
};
flambe_platform_html_HtmlUtil.setVendorStyle = function(element,name,value) {
	var style = element.style;
	var _g = 0;
	var _g1 = flambe_platform_html_HtmlUtil.VENDOR_PREFIXES;
	while(_g < _g1.length) {
		var prefix = _g1[_g];
		++_g;
		style.setProperty("-" + prefix + "-" + name,value);
	}
	style.setProperty(name,value);
};
flambe_platform_html_HtmlUtil.addVendorListener = function(dispatcher,type,listener,useCapture) {
	var _g = 0;
	var _g1 = flambe_platform_html_HtmlUtil.VENDOR_PREFIXES;
	while(_g < _g1.length) {
		var prefix = _g1[_g];
		++_g;
		dispatcher.addEventListener(prefix + type,listener,useCapture);
	}
	dispatcher.addEventListener(type,listener,useCapture);
};
flambe_platform_html_HtmlUtil.orientation = function(angle) {
	switch(angle) {
	case -90:case 90:
		return flambe_display_Orientation.Landscape;
	default:
		return flambe_display_Orientation.Portrait;
	}
};
flambe_platform_html_HtmlUtil.createEmptyCanvas = function(width,height) {
	var canvas;
	var _this = window.document;
	canvas = _this.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
};
flambe_platform_html_HtmlUtil.createCanvas = function(source) {
	var canvas = flambe_platform_html_HtmlUtil.createEmptyCanvas(source.width,source.height);
	var ctx = canvas.getContext("2d",null);
	ctx.save();
	ctx.globalCompositeOperation = "copy";
	ctx.drawImage(source,0,0);
	ctx.restore();
	return canvas;
};
flambe_platform_html_HtmlUtil.detectSlowDriver = function(gl) {
	var windows = window.navigator.platform.indexOf("Win") >= 0;
	if(windows) {
		var chrome = window.chrome != null;
		if(chrome) {
			var _g = 0;
			var _g1 = gl.getSupportedExtensions();
			while(_g < _g1.length) {
				var ext = _g1[_g];
				++_g;
				if(ext.indexOf("WEBGL_compressed_texture") >= 0) return false;
			}
			return true;
		}
	}
	return false;
};
flambe_platform_html_HtmlUtil.fixAndroidMath = function() {
	if(window.navigator.userAgent.indexOf("Linux; U; Android 4") >= 0) {
		var sin = Math.sin;
		var cos = Math.cos;
		Math.sin = function(x) {
			if(x == 0) return 0; else return sin(x);
		};
		Math.cos = function(x1) {
			if(x1 == 0) return 1; else return cos(x1);
		};
	}
};
var flambe_platform_html_WebAudioSound = function(buffer) {
	flambe_platform_BasicAsset.call(this);
	this.buffer = buffer;
};
flambe_platform_html_WebAudioSound.__name__ = true;
flambe_platform_html_WebAudioSound.__interfaces__ = [flambe_sound_Sound];
flambe_platform_html_WebAudioSound.get_supported = function() {
	if(flambe_platform_html_WebAudioSound._detectSupport) {
		flambe_platform_html_WebAudioSound._detectSupport = false;
		var AudioContext = flambe_platform_html_HtmlUtil.loadExtension("AudioContext").value;
		if(AudioContext != null) {
			flambe_platform_html_WebAudioSound.ctx = new AudioContext();
			flambe_platform_html_WebAudioSound.gain = flambe_platform_html_WebAudioSound.createGain();
			flambe_platform_html_WebAudioSound.gain.connect(flambe_platform_html_WebAudioSound.ctx.destination);
			flambe_System.volume.watch(function(volume,_) {
				flambe_platform_html_WebAudioSound.gain.gain.value = volume;
			});
		}
	}
	return flambe_platform_html_WebAudioSound.ctx != null;
};
flambe_platform_html_WebAudioSound.createGain = function() {
	if(flambe_platform_html_WebAudioSound.ctx.createGain != null) return flambe_platform_html_WebAudioSound.ctx.createGain(); else return flambe_platform_html_WebAudioSound.ctx.createGainNode();
};
flambe_platform_html_WebAudioSound.start = function(node,time) {
	if(node.start != null) node.start(time); else node.noteOn(time);
};
flambe_platform_html_WebAudioSound.__super__ = flambe_platform_BasicAsset;
flambe_platform_html_WebAudioSound.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	play: function(volume) {
		if(volume == null) volume = 1.0;
		return new flambe_platform_html__$WebAudioSound_WebAudioPlayback(this,volume,false);
	}
	,get_duration: function() {
		return this.buffer.duration;
	}
	,onDisposed: function() {
		this.buffer = null;
	}
	,__class__: flambe_platform_html_WebAudioSound
});
var flambe_platform_html__$WebAudioSound_WebAudioPlayback = function(sound,volume,loop) {
	var _g = this;
	this._sound = sound;
	this._head = flambe_platform_html_WebAudioSound.gain;
	this._complete = new flambe_util_Value(false);
	this._sourceNode = flambe_platform_html_WebAudioSound.ctx.createBufferSource();
	this._sourceNode.buffer = sound.buffer;
	this._sourceNode.loop = loop;
	this._sourceNode.onended = function() {
		_g._complete.set__(true);
	};
	flambe_platform_html_WebAudioSound.start(this._sourceNode,0);
	this.playAudio();
	this.volume = new flambe_animation_AnimatedFloat(volume,function(v,_) {
		_g.setVolume(v);
	});
	if(volume != 1) this.setVolume(volume);
	if(flambe_System.hidden._value) this.set_paused(true);
};
flambe_platform_html__$WebAudioSound_WebAudioPlayback.__name__ = true;
flambe_platform_html__$WebAudioSound_WebAudioPlayback.__interfaces__ = [flambe_platform_Tickable,flambe_sound_Playback];
flambe_platform_html__$WebAudioSound_WebAudioPlayback.prototype = {
	set_paused: function(paused) {
		if(paused != this._pausedAt >= 0) {
			if(paused) {
				this._sourceNode.disconnect();
				this._pausedAt = this.get_position();
			} else this.playAudio();
		}
		return paused;
	}
	,get_position: function() {
		if(this._complete._value) return this._sound.get_duration(); else if(this._pausedAt >= 0) return this._pausedAt; else {
			var elapsed = flambe_platform_html_WebAudioSound.ctx.currentTime - this._startedAt;
			return elapsed % this._sound.get_duration();
		}
	}
	,update: function(dt) {
		this.volume.update(dt);
		if(this._sourceNode.playbackState == 3) this._complete.set__(true);
		if(this._complete._value || this._pausedAt >= 0) {
			this._tickableAdded = false;
			this._hideBinding.dispose();
			return true;
		}
		return false;
	}
	,dispose: function() {
		this.set_paused(true);
		this._complete.set__(true);
	}
	,setVolume: function(volume) {
		if(this._gainNode == null) {
			this._gainNode = flambe_platform_html_WebAudioSound.createGain();
			this.insertNode(this._gainNode);
		}
		this._gainNode.gain.value = volume;
	}
	,insertNode: function(head) {
		if(!(this._pausedAt >= 0)) {
			this._sourceNode.disconnect();
			this._sourceNode.connect(head);
		}
		head.connect(this._head);
		this._head = head;
	}
	,playAudio: function() {
		var _g = this;
		this._sourceNode.connect(this._head);
		this._startedAt = flambe_platform_html_WebAudioSound.ctx.currentTime;
		this._pausedAt = -1;
		if(!this._tickableAdded) {
			flambe_platform_html_HtmlPlatform.instance.mainLoop.addTickable(this);
			this._tickableAdded = true;
			this._hideBinding = flambe_System.hidden.get_changed().connect(function(hidden,_) {
				if(hidden) {
					_g._wasPaused = _g._pausedAt >= 0;
					_g.set_paused(true);
				} else _g.set_paused(_g._wasPaused);
			});
		}
	}
	,__class__: flambe_platform_html__$WebAudioSound_WebAudioPlayback
};
var flambe_platform_html_WebGLBatcher = function(gl) {
	this._backbufferHeight = 0;
	this._backbufferWidth = 0;
	this._dataOffset = 0;
	this._maxQuads = 0;
	this._quads = 0;
	this._pendingSetScissor = false;
	this._currentRenderTarget = null;
	this._currentTexture = null;
	this._currentShader = null;
	this._currentBlendMode = null;
	this._lastScissor = null;
	this._lastTexture = null;
	this._lastShader = null;
	this._lastRenderTarget = null;
	this._lastBlendMode = null;
	this._gl = gl;
	gl.clearColor(0,0,0,0);
	gl.enable(3042);
	gl.pixelStorei(37441,1);
	this._vertexBuffer = gl.createBuffer();
	gl.bindBuffer(34962,this._vertexBuffer);
	this._quadIndexBuffer = gl.createBuffer();
	gl.bindBuffer(34963,this._quadIndexBuffer);
	this._drawTextureShader = new flambe_platform_shader_DrawTextureGL(gl);
	this._drawPatternShader = new flambe_platform_shader_DrawPatternGL(gl);
	this._fillRectShader = new flambe_platform_shader_FillRectGL(gl);
	this.resize(16);
};
flambe_platform_html_WebGLBatcher.__name__ = true;
flambe_platform_html_WebGLBatcher.prototype = {
	resizeBackbuffer: function(width,height) {
		this._gl.viewport(0,0,width,height);
		this._backbufferWidth = width;
		this._backbufferHeight = height;
	}
	,willRender: function() {
	}
	,didRender: function() {
		this.flush();
	}
	,bindTexture: function(texture) {
		this.flush();
		this._lastTexture = null;
		this._currentTexture = null;
		this._gl.bindTexture(3553,texture);
	}
	,deleteTexture: function(texture) {
		if(this._lastTexture != null && this._lastTexture.root == texture) {
			this.flush();
			this._lastTexture = null;
			this._currentTexture = null;
		}
		this._gl.deleteTexture(texture.nativeTexture);
	}
	,deleteFramebuffer: function(texture) {
		if(texture == this._lastRenderTarget) {
			this.flush();
			this._lastRenderTarget = null;
			this._currentRenderTarget = null;
		}
		this._gl.deleteFramebuffer(texture.framebuffer);
	}
	,prepareDrawTexture: function(renderTarget,blendMode,scissor,texture) {
		if(texture != this._lastTexture) {
			this.flush();
			this._lastTexture = texture;
		}
		return this.prepareQuad(5,renderTarget,blendMode,scissor,this._drawTextureShader);
	}
	,prepareDrawPattern: function(renderTarget,blendMode,scissor,texture) {
		if(texture != this._lastTexture) {
			this.flush();
			this._lastTexture = texture;
		}
		return this.prepareQuad(5,renderTarget,blendMode,scissor,this._drawPatternShader);
	}
	,prepareFillRect: function(renderTarget,blendMode,scissor) {
		return this.prepareQuad(6,renderTarget,blendMode,scissor,this._fillRectShader);
	}
	,prepareQuad: function(elementsPerVertex,renderTarget,blendMode,scissor,shader) {
		if(renderTarget != this._lastRenderTarget) {
			this.flush();
			this._lastRenderTarget = renderTarget;
		}
		if(blendMode != this._lastBlendMode) {
			this.flush();
			this._lastBlendMode = blendMode;
		}
		if(shader != this._lastShader) {
			this.flush();
			this._lastShader = shader;
		}
		if(scissor != null || this._lastScissor != null) {
			if(scissor == null || this._lastScissor == null || !this._lastScissor.equals(scissor)) {
				this.flush();
				if(scissor != null) this._lastScissor = scissor.clone(this._lastScissor); else this._lastScissor = null;
				this._pendingSetScissor = true;
			}
		}
		if(this._quads >= this._maxQuads) this.resize(2 * this._maxQuads);
		++this._quads;
		var offset = this._dataOffset;
		this._dataOffset += 4 * elementsPerVertex;
		return offset;
	}
	,flush: function() {
		if(this._quads < 1) return;
		if(this._lastRenderTarget != this._currentRenderTarget) this.bindRenderTarget(this._lastRenderTarget);
		if(this._lastBlendMode != this._currentBlendMode) {
			var _g = this._lastBlendMode;
			switch(_g[1]) {
			case 0:
				this._gl.blendFunc(1,771);
				break;
			case 1:
				this._gl.blendFunc(1,1);
				break;
			case 2:
				this._gl.blendFunc(774,771);
				break;
			case 3:
				this._gl.blendFunc(1,769);
				break;
			case 4:
				this._gl.blendFunc(0,770);
				break;
			case 5:
				this._gl.blendFunc(1,0);
				break;
			}
			this._currentBlendMode = this._lastBlendMode;
		}
		if(this._pendingSetScissor) {
			if(this._lastScissor != null) {
				this._gl.enable(3089);
				this._gl.scissor(this._lastScissor.x | 0,this._lastScissor.y | 0,this._lastScissor.width | 0,this._lastScissor.height | 0);
			} else this._gl.disable(3089);
			this._pendingSetScissor = false;
		}
		if(this._lastTexture != this._currentTexture) {
			this._gl.bindTexture(3553,this._lastTexture.root.nativeTexture);
			this._currentTexture = this._lastTexture;
		}
		if(this._lastShader != this._currentShader) {
			this._lastShader.useProgram();
			this._lastShader.prepare();
			this._currentShader = this._lastShader;
		}
		if(this._lastShader == this._drawPatternShader) {
			var texture = this._lastTexture;
			var root = texture.root;
			this._drawPatternShader.setRegion(texture.rootX / root.width,texture.rootY / root.height,texture._width / root.width,texture._height / root.height);
		}
		this._gl.bufferData(34962,this.data.subarray(0,this._dataOffset),35040);
		this._gl.drawElements(4,6 * this._quads,5123,0);
		this._quads = 0;
		this._dataOffset = 0;
	}
	,resize: function(maxQuads) {
		this.flush();
		if(maxQuads > 1024) return;
		this._maxQuads = maxQuads;
		this.data = new Float32Array(maxQuads * 4 * 6);
		this._gl.bufferData(34962,this.data.length * 4,35040);
		var indices = new Uint16Array(6 * maxQuads);
		var _g = 0;
		while(_g < maxQuads) {
			var ii = _g++;
			indices[ii * 6] = ii * 4;
			indices[ii * 6 + 1] = ii * 4 + 1;
			indices[ii * 6 + 2] = ii * 4 + 2;
			indices[ii * 6 + 3] = ii * 4 + 2;
			indices[ii * 6 + 4] = ii * 4 + 3;
			indices[ii * 6 + 5] = ii * 4;
		}
		this._gl.bufferData(34963,indices,35044);
	}
	,bindRenderTarget: function(texture) {
		if(texture != null) {
			this._gl.bindFramebuffer(36160,texture.framebuffer);
			this._gl.viewport(0,0,texture.width,texture.height);
		} else {
			this._gl.bindFramebuffer(36160,null);
			this._gl.viewport(0,0,this._backbufferWidth,this._backbufferHeight);
		}
		this._currentRenderTarget = texture;
		this._lastRenderTarget = texture;
	}
	,__class__: flambe_platform_html_WebGLBatcher
};
var flambe_platform_html_WebGLGraphics = function(batcher,renderTarget) {
	this._stateList = null;
	this._inverseProjection = null;
	if(flambe_platform_html_WebGLGraphics._scratchQuadArray == null) flambe_platform_html_WebGLGraphics._scratchQuadArray = new Float32Array(8);
	this._batcher = batcher;
	this._renderTarget = renderTarget;
};
flambe_platform_html_WebGLGraphics.__name__ = true;
flambe_platform_html_WebGLGraphics.__interfaces__ = [flambe_platform_InternalGraphics];
flambe_platform_html_WebGLGraphics.prototype = {
	save: function() {
		var current = this._stateList;
		var state = this._stateList.next;
		if(state == null) {
			state = new flambe_platform_html__$WebGLGraphics_DrawingState();
			state.prev = current;
			current.next = state;
		}
		current.matrix.clone(state.matrix);
		state.alpha = current.alpha;
		state.blendMode = current.blendMode;
		if(current.scissor != null) state.scissor = current.scissor.clone(state.scissor); else state.scissor = null;
		this._stateList = state;
	}
	,transform: function(m00,m10,m01,m11,m02,m12) {
		var state = this._stateList;
		flambe_platform_html_WebGLGraphics._scratchMatrix.set(m00,m10,m01,m11,m02,m12);
		flambe_math_Matrix.multiply(state.matrix,flambe_platform_html_WebGLGraphics._scratchMatrix,state.matrix);
	}
	,restore: function() {
		this._stateList = this._stateList.prev;
	}
	,drawTexture: function(texture,x,y) {
		this.drawSubTexture(texture,x,y,0,0,texture.get_width(),texture.get_height());
	}
	,drawSubTexture: function(texture,destX,destY,sourceX,sourceY,sourceW,sourceH) {
		var state = this._stateList;
		var texture1 = texture;
		var root = texture1.root;
		var pos = this.transformQuad(destX,destY,sourceW,sourceH);
		var rootWidth = root.width;
		var rootHeight = root.height;
		var u1 = (texture1.rootX + sourceX) / rootWidth;
		var v1 = (texture1.rootY + sourceY) / rootHeight;
		var u2 = u1 + sourceW / rootWidth;
		var v2 = v1 + sourceH / rootHeight;
		var alpha = state.alpha;
		var offset = this._batcher.prepareDrawTexture(this._renderTarget,state.blendMode,state.scissor,texture1);
		var data = this._batcher.data;
		data[offset] = pos[0];
		data[++offset] = pos[1];
		data[++offset] = u1;
		data[++offset] = v1;
		data[++offset] = alpha;
		data[++offset] = pos[2];
		data[++offset] = pos[3];
		data[++offset] = u2;
		data[++offset] = v1;
		data[++offset] = alpha;
		data[++offset] = pos[4];
		data[++offset] = pos[5];
		data[++offset] = u2;
		data[++offset] = v2;
		data[++offset] = alpha;
		data[++offset] = pos[6];
		data[++offset] = pos[7];
		data[++offset] = u1;
		data[++offset] = v2;
		data[++offset] = alpha;
	}
	,drawPattern: function(texture,x,y,width,height) {
		var state = this._stateList;
		var texture1 = texture;
		var root = texture1.root;
		var pos = this.transformQuad(x,y,width,height);
		var u2 = width / root.width;
		var v2 = height / root.height;
		var alpha = state.alpha;
		var offset = this._batcher.prepareDrawPattern(this._renderTarget,state.blendMode,state.scissor,texture1);
		var data = this._batcher.data;
		data[offset] = pos[0];
		data[++offset] = pos[1];
		data[++offset] = 0;
		data[++offset] = 0;
		data[++offset] = alpha;
		data[++offset] = pos[2];
		data[++offset] = pos[3];
		data[++offset] = u2;
		data[++offset] = 0;
		data[++offset] = alpha;
		data[++offset] = pos[4];
		data[++offset] = pos[5];
		data[++offset] = u2;
		data[++offset] = v2;
		data[++offset] = alpha;
		data[++offset] = pos[6];
		data[++offset] = pos[7];
		data[++offset] = 0;
		data[++offset] = v2;
		data[++offset] = alpha;
	}
	,fillRect: function(color,x,y,width,height) {
		var state = this._stateList;
		var pos = this.transformQuad(x,y,width,height);
		var r = (color & 16711680) / 16711680;
		var g = (color & 65280) / 65280;
		var b = (color & 255) / 255;
		var a = state.alpha;
		var offset = this._batcher.prepareFillRect(this._renderTarget,state.blendMode,state.scissor);
		var data = this._batcher.data;
		data[offset] = pos[0];
		data[++offset] = pos[1];
		data[++offset] = r;
		data[++offset] = g;
		data[++offset] = b;
		data[++offset] = a;
		data[++offset] = pos[2];
		data[++offset] = pos[3];
		data[++offset] = r;
		data[++offset] = g;
		data[++offset] = b;
		data[++offset] = a;
		data[++offset] = pos[4];
		data[++offset] = pos[5];
		data[++offset] = r;
		data[++offset] = g;
		data[++offset] = b;
		data[++offset] = a;
		data[++offset] = pos[6];
		data[++offset] = pos[7];
		data[++offset] = r;
		data[++offset] = g;
		data[++offset] = b;
		data[++offset] = a;
	}
	,multiplyAlpha: function(factor) {
		this._stateList.alpha *= factor;
	}
	,setBlendMode: function(blendMode) {
		this._stateList.blendMode = blendMode;
	}
	,applyScissor: function(x,y,width,height) {
		var state = this._stateList;
		var rect = flambe_platform_html_WebGLGraphics._scratchQuadArray;
		rect[0] = x;
		rect[1] = y;
		rect[2] = x + width;
		rect[3] = y + height;
		state.matrix.transformArray(rect,4,rect);
		this._inverseProjection.transformArray(rect,4,rect);
		x = rect[0];
		y = rect[1];
		width = rect[2] - x;
		height = rect[3] - y;
		if(width < 0) {
			x += width;
			width = -width;
		}
		if(height < 0) {
			y += height;
			height = -height;
		}
		state.applyScissor(x,y,width,height);
	}
	,willRender: function() {
		this._batcher.willRender();
	}
	,didRender: function() {
		this._batcher.didRender();
	}
	,onResize: function(width,height) {
		this._stateList = new flambe_platform_html__$WebGLGraphics_DrawingState();
		var flip;
		if(this._renderTarget != null) flip = -1; else flip = 1;
		this._stateList.matrix.set(2 / width,0,0,flip * -2 / height,-1,flip);
		this._inverseProjection = new flambe_math_Matrix();
		this._inverseProjection.set(2 / width,0,0,2 / height,-1,-1);
		this._inverseProjection.invert();
	}
	,transformQuad: function(x,y,width,height) {
		var x2 = x + width;
		var y2 = y + height;
		var pos = flambe_platform_html_WebGLGraphics._scratchQuadArray;
		pos[0] = x;
		pos[1] = y;
		pos[2] = x2;
		pos[3] = y;
		pos[4] = x2;
		pos[5] = y2;
		pos[6] = x;
		pos[7] = y2;
		this._stateList.matrix.transformArray(pos,8,pos);
		return pos;
	}
	,__class__: flambe_platform_html_WebGLGraphics
};
var flambe_platform_html__$WebGLGraphics_DrawingState = function() {
	this.next = null;
	this.prev = null;
	this.scissor = null;
	this.matrix = new flambe_math_Matrix();
	this.alpha = 1;
	this.blendMode = flambe_display_BlendMode.Normal;
};
flambe_platform_html__$WebGLGraphics_DrawingState.__name__ = true;
flambe_platform_html__$WebGLGraphics_DrawingState.prototype = {
	applyScissor: function(x,y,width,height) {
		if(this.scissor != null) {
			var x1 = flambe_math_FMath.max(this.scissor.x,x);
			var y1 = flambe_math_FMath.max(this.scissor.y,y);
			var x2 = flambe_math_FMath.min(this.scissor.x + this.scissor.width,x + width);
			var y2 = flambe_math_FMath.min(this.scissor.y + this.scissor.height,y + height);
			x = x1;
			y = y1;
			width = x2 - x1;
			height = y2 - y1;
		} else this.scissor = new flambe_math_Rectangle();
		this.scissor.set(Math.round(x),Math.round(y),Math.round(width),Math.round(height));
	}
	,__class__: flambe_platform_html__$WebGLGraphics_DrawingState
};
var flambe_platform_html_WebGLRenderer = function(stage,gl) {
	var _g = this;
	this._hasGPU = new flambe_util_Value(true);
	this.gl = gl;
	gl.canvas.addEventListener("webglcontextlost",function(event) {
		event.preventDefault();
		_g._hasGPU.set__(false);
	},false);
	gl.canvas.addEventListener("webglcontextrestore",function(event1) {
		_g.init();
		_g._hasGPU.set__(true);
	},false);
	stage.resize.connect($bind(this,this.onResize));
	this.init();
};
flambe_platform_html_WebGLRenderer.__name__ = true;
flambe_platform_html_WebGLRenderer.__interfaces__ = [flambe_platform_InternalRenderer];
flambe_platform_html_WebGLRenderer.prototype = {
	get_type: function() {
		return flambe_subsystem_RendererType.WebGL;
	}
	,createTextureFromImage: function(image) {
		if(this.gl.isContextLost()) return null;
		var root = new flambe_platform_html_WebGLTextureRoot(this,image.width,image.height);
		root.uploadImageData(image);
		return root.createTexture(image.width,image.height);
	}
	,getCompressedTextureFormats: function() {
		return [];
	}
	,createCompressedTexture: function(format,data) {
		if(this.gl.isContextLost()) return null;
		return null;
	}
	,willRender: function() {
		this.graphics.willRender();
	}
	,didRender: function() {
		this.graphics.didRender();
	}
	,onResize: function() {
		var width = this.gl.canvas.width;
		var height = this.gl.canvas.height;
		this.batcher.resizeBackbuffer(width,height);
		this.graphics.onResize(width,height);
	}
	,init: function() {
		this.batcher = new flambe_platform_html_WebGLBatcher(this.gl);
		this.graphics = new flambe_platform_html_WebGLGraphics(this.batcher,null);
		this.onResize();
	}
	,__class__: flambe_platform_html_WebGLRenderer
};
var flambe_platform_html_WebGLTexture = function(root,width,height) {
	flambe_platform_BasicTexture.call(this,root,width,height);
};
flambe_platform_html_WebGLTexture.__name__ = true;
flambe_platform_html_WebGLTexture.__super__ = flambe_platform_BasicTexture;
flambe_platform_html_WebGLTexture.prototype = $extend(flambe_platform_BasicTexture.prototype,{
	__class__: flambe_platform_html_WebGLTexture
});
var flambe_platform_html_WebGLTextureRoot = function(renderer,width,height) {
	this._graphics = null;
	this.framebuffer = null;
	flambe_platform_BasicAsset.call(this);
	this._renderer = renderer;
	this.width = flambe_math_FMath.max(2,flambe_platform_MathUtil.nextPowerOfTwo(width));
	this.height = flambe_math_FMath.max(2,flambe_platform_MathUtil.nextPowerOfTwo(height));
	var gl = renderer.gl;
	this.nativeTexture = gl.createTexture();
	renderer.batcher.bindTexture(this.nativeTexture);
	gl.texParameteri(3553,10242,33071);
	gl.texParameteri(3553,10243,33071);
	gl.texParameteri(3553,10240,9729);
	gl.texParameteri(3553,10241,9728);
};
flambe_platform_html_WebGLTextureRoot.__name__ = true;
flambe_platform_html_WebGLTextureRoot.__interfaces__ = [flambe_platform_TextureRoot];
flambe_platform_html_WebGLTextureRoot.drawBorder = function(canvas,width,height) {
	var ctx = canvas.getContext("2d",null);
	ctx.drawImage(canvas,width - 1,0,1,height,width,0,1,height);
	ctx.drawImage(canvas,0,height - 1,width,1,0,height,width,1);
};
flambe_platform_html_WebGLTextureRoot.__super__ = flambe_platform_BasicAsset;
flambe_platform_html_WebGLTextureRoot.prototype = $extend(flambe_platform_BasicAsset.prototype,{
	createTexture: function(width,height) {
		return new flambe_platform_html_WebGLTexture(this,width,height);
	}
	,uploadImageData: function(image) {
		if(this.width != image.width || this.height != image.height) {
			var resized = flambe_platform_html_HtmlUtil.createEmptyCanvas(this.width,this.height);
			resized.getContext("2d",null).drawImage(image,0,0);
			flambe_platform_html_WebGLTextureRoot.drawBorder(resized,image.width,image.height);
			image = resized;
		}
		this._renderer.batcher.bindTexture(this.nativeTexture);
		var gl = this._renderer.gl;
		gl.texImage2D(3553,0,6408,6408,5121,image);
	}
	,onDisposed: function() {
		var batcher = this._renderer.batcher;
		batcher.deleteTexture(this);
		if(this.framebuffer != null) batcher.deleteFramebuffer(this);
		this.nativeTexture = null;
		this.framebuffer = null;
		this._graphics = null;
	}
	,__class__: flambe_platform_html_WebGLTextureRoot
});
var flambe_platform_shader_ShaderGL = function(gl,vertSource,fragSource) {
	fragSource = ["#ifdef GL_ES","precision mediump float;","#endif"].join("\n") + "\n" + fragSource;
	this._gl = gl;
	this._program = gl.createProgram();
	gl.attachShader(this._program,flambe_platform_shader_ShaderGL.createShader(gl,35633,vertSource));
	gl.attachShader(this._program,flambe_platform_shader_ShaderGL.createShader(gl,35632,fragSource));
	gl.linkProgram(this._program);
	gl.useProgram(this._program);
};
flambe_platform_shader_ShaderGL.__name__ = true;
flambe_platform_shader_ShaderGL.createShader = function(gl,type,source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader,source);
	gl.compileShader(shader);
	return shader;
};
flambe_platform_shader_ShaderGL.prototype = {
	useProgram: function() {
		this._gl.useProgram(this._program);
	}
	,prepare: function() {
		null;
	}
	,getAttribLocation: function(name) {
		var loc = this._gl.getAttribLocation(this._program,name);
		return loc;
	}
	,getUniformLocation: function(name) {
		var loc = this._gl.getUniformLocation(this._program,name);
		return loc;
	}
	,__class__: flambe_platform_shader_ShaderGL
};
var flambe_platform_shader_DrawPatternGL = function(gl) {
	flambe_platform_shader_ShaderGL.call(this,gl,["attribute highp vec2 a_pos;","attribute mediump vec2 a_uv;","attribute lowp float a_alpha;","varying mediump vec2 v_uv;","varying lowp float v_alpha;","void main (void) {","v_uv = a_uv;","v_alpha = a_alpha;","gl_Position = vec4(a_pos, 0, 1);","}"].join("\n"),["varying mediump vec2 v_uv;","varying lowp float v_alpha;","uniform lowp sampler2D u_texture;","uniform mediump vec4 u_region;","void main (void) {","gl_FragColor = texture2D(u_texture, u_region.xy + mod(v_uv, u_region.zw)) * v_alpha;","}"].join("\n"));
	this.a_pos = this.getAttribLocation("a_pos");
	this.a_uv = this.getAttribLocation("a_uv");
	this.a_alpha = this.getAttribLocation("a_alpha");
	this.u_texture = this.getUniformLocation("u_texture");
	this.u_region = this.getUniformLocation("u_region");
	this.setTexture(0);
};
flambe_platform_shader_DrawPatternGL.__name__ = true;
flambe_platform_shader_DrawPatternGL.__super__ = flambe_platform_shader_ShaderGL;
flambe_platform_shader_DrawPatternGL.prototype = $extend(flambe_platform_shader_ShaderGL.prototype,{
	setTexture: function(unit) {
		this._gl.uniform1i(this.u_texture,unit);
	}
	,setRegion: function(x,y,width,height) {
		this._gl.uniform4f(this.u_region,x,y,width,height);
	}
	,prepare: function() {
		this._gl.enableVertexAttribArray(this.a_pos);
		this._gl.enableVertexAttribArray(this.a_uv);
		this._gl.enableVertexAttribArray(this.a_alpha);
		var bytesPerFloat = 4;
		var stride = 5 * bytesPerFloat;
		this._gl.vertexAttribPointer(this.a_pos,2,5126,false,stride,0 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_uv,2,5126,false,stride,2 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_alpha,1,5126,false,stride,4 * bytesPerFloat);
	}
	,__class__: flambe_platform_shader_DrawPatternGL
});
var flambe_platform_shader_DrawTextureGL = function(gl) {
	flambe_platform_shader_ShaderGL.call(this,gl,["attribute highp vec2 a_pos;","attribute mediump vec2 a_uv;","attribute lowp float a_alpha;","varying mediump vec2 v_uv;","varying lowp float v_alpha;","void main (void) {","v_uv = a_uv;","v_alpha = a_alpha;","gl_Position = vec4(a_pos, 0, 1);","}"].join("\n"),["varying mediump vec2 v_uv;","varying lowp float v_alpha;","uniform lowp sampler2D u_texture;","void main (void) {","gl_FragColor = texture2D(u_texture, v_uv) * v_alpha;","}"].join("\n"));
	this.a_pos = this.getAttribLocation("a_pos");
	this.a_uv = this.getAttribLocation("a_uv");
	this.a_alpha = this.getAttribLocation("a_alpha");
	this.u_texture = this.getUniformLocation("u_texture");
	this.setTexture(0);
};
flambe_platform_shader_DrawTextureGL.__name__ = true;
flambe_platform_shader_DrawTextureGL.__super__ = flambe_platform_shader_ShaderGL;
flambe_platform_shader_DrawTextureGL.prototype = $extend(flambe_platform_shader_ShaderGL.prototype,{
	setTexture: function(unit) {
		this._gl.uniform1i(this.u_texture,unit);
	}
	,prepare: function() {
		this._gl.enableVertexAttribArray(this.a_pos);
		this._gl.enableVertexAttribArray(this.a_uv);
		this._gl.enableVertexAttribArray(this.a_alpha);
		var bytesPerFloat = 4;
		var stride = 5 * bytesPerFloat;
		this._gl.vertexAttribPointer(this.a_pos,2,5126,false,stride,0 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_uv,2,5126,false,stride,2 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_alpha,1,5126,false,stride,4 * bytesPerFloat);
	}
	,__class__: flambe_platform_shader_DrawTextureGL
});
var flambe_platform_shader_FillRectGL = function(gl) {
	flambe_platform_shader_ShaderGL.call(this,gl,["attribute highp vec2 a_pos;","attribute lowp vec3 a_rgb;","attribute lowp float a_alpha;","varying lowp vec4 v_color;","void main (void) {","v_color = vec4(a_rgb*a_alpha, a_alpha);","gl_Position = vec4(a_pos, 0, 1);","}"].join("\n"),["varying lowp vec4 v_color;","void main (void) {","gl_FragColor = v_color;","}"].join("\n"));
	this.a_pos = this.getAttribLocation("a_pos");
	this.a_rgb = this.getAttribLocation("a_rgb");
	this.a_alpha = this.getAttribLocation("a_alpha");
};
flambe_platform_shader_FillRectGL.__name__ = true;
flambe_platform_shader_FillRectGL.__super__ = flambe_platform_shader_ShaderGL;
flambe_platform_shader_FillRectGL.prototype = $extend(flambe_platform_shader_ShaderGL.prototype,{
	prepare: function() {
		this._gl.enableVertexAttribArray(this.a_pos);
		this._gl.enableVertexAttribArray(this.a_rgb);
		this._gl.enableVertexAttribArray(this.a_alpha);
		var bytesPerFloat = 4;
		var stride = 6 * bytesPerFloat;
		this._gl.vertexAttribPointer(this.a_pos,2,5126,false,stride,0 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_rgb,3,5126,false,stride,2 * bytesPerFloat);
		this._gl.vertexAttribPointer(this.a_alpha,1,5126,false,stride,5 * bytesPerFloat);
	}
	,__class__: flambe_platform_shader_FillRectGL
});
var flambe_scene_Director = function() {
	this._height = -1;
	this._width = -1;
	this._transitor = null;
	flambe_Component.call(this);
	this.scenes = [];
	this.occludedScenes = [];
	this._root = new flambe_Entity();
};
flambe_scene_Director.__name__ = true;
flambe_scene_Director.__super__ = flambe_Component;
flambe_scene_Director.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "Director_4";
	}
	,pushScene: function(scene,transition) {
		var _g = this;
		this.completeTransition();
		var oldTop = this.get_topScene();
		if(oldTop != null) this.playTransition(oldTop,scene,transition,function() {
			_g.hide(oldTop);
		}); else {
			this.add(scene);
			this.invalidateVisibility();
		}
	}
	,unwindToScene: function(scene,transition) {
		var _g = this;
		this.completeTransition();
		var oldTop = this.get_topScene();
		if(oldTop != null) {
			if(oldTop == scene) return;
			this.scenes.pop();
			while(this.scenes.length > 0 && this.scenes[this.scenes.length - 1] != scene) this.scenes.pop().dispose();
			this.playTransition(oldTop,scene,transition,function() {
				_g.hideAndDispose(oldTop);
			});
		} else this.pushScene(scene,transition);
	}
	,onAdded: function() {
		this.owner.addChild(this._root);
	}
	,onRemoved: function() {
		this.completeTransition();
		var _g = 0;
		var _g1 = this.scenes;
		while(_g < _g1.length) {
			var scene = _g1[_g];
			++_g;
			scene.dispose();
		}
		this.scenes = [];
		this.occludedScenes = [];
		this._root.dispose();
	}
	,onUpdate: function(dt) {
		if(this._transitor != null && this._transitor.update(dt)) this.completeTransition();
	}
	,get_topScene: function() {
		var ll = this.scenes.length;
		if(ll > 0) return this.scenes[ll - 1]; else return null;
	}
	,add: function(scene) {
		var oldTop = this.get_topScene();
		if(oldTop != null) this._root.removeChild(oldTop);
		HxOverrides.remove(this.scenes,scene);
		this.scenes.push(scene);
		this._root.addChild(scene);
	}
	,hide: function(scene) {
		var events = scene._compMap.Scene_6;
		if(events != null) events.hidden.emit();
	}
	,hideAndDispose: function(scene) {
		this.hide(scene);
		scene.dispose();
	}
	,show: function(scene) {
		var events = scene._compMap.Scene_6;
		if(events != null) events.shown.emit();
	}
	,invalidateVisibility: function() {
		var ii = this.scenes.length;
		while(ii > 0) {
			var scene1 = this.scenes[--ii];
			var comp = scene1._compMap.Scene_6;
			if(comp == null || comp.opaque) break;
		}
		if(this.scenes.length > 0) this.occludedScenes = this.scenes.slice(ii,this.scenes.length - 1); else this.occludedScenes = [];
		var scene = this.get_topScene();
		if(scene != null) this.show(scene);
	}
	,completeTransition: function() {
		if(this._transitor != null) {
			this._transitor.complete();
			this._transitor = null;
			this.invalidateVisibility();
		}
	}
	,playTransition: function(from,to,transition,onComplete) {
		this.completeTransition();
		this.add(to);
		if(transition != null) {
			this.occludedScenes.push(from);
			this._transitor = new flambe_scene__$Director_Transitor(from,to,transition,onComplete);
			this._transitor.init(this);
		} else {
			onComplete();
			this.invalidateVisibility();
		}
	}
	,get_width: function() {
		if(this._width < 0) return flambe_System._platform.getStage().get_width(); else return this._width;
	}
	,get_height: function() {
		if(this._height < 0) return flambe_System._platform.getStage().get_height(); else return this._height;
	}
	,__class__: flambe_scene_Director
});
var flambe_scene__$Director_Transitor = function(from,to,transition,onComplete) {
	this._from = from;
	this._to = to;
	this._transition = transition;
	this._onComplete = onComplete;
};
flambe_scene__$Director_Transitor.__name__ = true;
flambe_scene__$Director_Transitor.prototype = {
	init: function(director) {
		this._transition.init(director,this._from,this._to);
	}
	,update: function(dt) {
		return this._transition.update(dt);
	}
	,complete: function() {
		this._transition.complete();
		this._onComplete();
	}
	,__class__: flambe_scene__$Director_Transitor
};
var flambe_scene_Scene = function(opaque) {
	if(opaque == null) opaque = true;
	flambe_Component.call(this);
	this.opaque = opaque;
	this.shown = new flambe_util_Signal0();
	this.hidden = new flambe_util_Signal0();
};
flambe_scene_Scene.__name__ = true;
flambe_scene_Scene.__super__ = flambe_Component;
flambe_scene_Scene.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "Scene_6";
	}
	,__class__: flambe_scene_Scene
});
var flambe_scene_Transition = function() { };
flambe_scene_Transition.__name__ = true;
flambe_scene_Transition.prototype = {
	init: function(director,from,to) {
		this._director = director;
		this._from = from;
		this._to = to;
	}
	,update: function(dt) {
		return true;
	}
	,complete: function() {
	}
	,__class__: flambe_scene_Transition
};
var flambe_scene_TweenTransition = function(duration,ease) {
	this._duration = duration;
	if(ease != null) this._ease = ease; else this._ease = flambe_animation_Ease.linear;
};
flambe_scene_TweenTransition.__name__ = true;
flambe_scene_TweenTransition.__super__ = flambe_scene_Transition;
flambe_scene_TweenTransition.prototype = $extend(flambe_scene_Transition.prototype,{
	init: function(director,from,to) {
		flambe_scene_Transition.prototype.init.call(this,director,from,to);
		this._elapsed = 0;
	}
	,update: function(dt) {
		this._elapsed += dt;
		return this._elapsed >= this._duration;
	}
	,interp: function(from,to) {
		return from + (to - from) * this._ease(this._elapsed / this._duration);
	}
	,__class__: flambe_scene_TweenTransition
});
var flambe_scene_SlideTransition = function(duration,ease) {
	this._direction = 2;
	flambe_scene_TweenTransition.call(this,duration,ease);
};
flambe_scene_SlideTransition.__name__ = true;
flambe_scene_SlideTransition.__super__ = flambe_scene_TweenTransition;
flambe_scene_SlideTransition.prototype = $extend(flambe_scene_TweenTransition.prototype,{
	init: function(director,from,to) {
		flambe_scene_TweenTransition.prototype.init.call(this,director,from,to);
		var _g = this._direction;
		switch(_g) {
		case 0:
			this._x = 0;
			this._y = -this._director.get_height();
			break;
		case 1:
			this._x = 0;
			this._y = this._director.get_height();
			break;
		case 2:
			this._x = -this._director.get_width();
			this._y = 0;
			break;
		case 3:
			this._x = this._director.get_width();
			this._y = 0;
			break;
		}
		var sprite = this._from._compMap.Sprite_2;
		if(sprite == null) this._from.add(sprite = new flambe_display_Sprite());
		sprite.setXY(0,0);
		var sprite1 = this._to._compMap.Sprite_2;
		if(sprite1 == null) this._to.add(sprite1 = new flambe_display_Sprite());
		sprite1.setXY(-this._x,-this._y);
	}
	,update: function(dt) {
		var done = flambe_scene_TweenTransition.prototype.update.call(this,dt);
		this._from._compMap.Sprite_2.setXY(this.interp(0,this._x),this.interp(0,this._y));
		this._to._compMap.Sprite_2.setXY(this.interp(-this._x,0),this.interp(-this._y,0));
		return done;
	}
	,complete: function() {
		this._from._compMap.Sprite_2.setXY(0,0);
		this._to._compMap.Sprite_2.setXY(0,0);
	}
	,__class__: flambe_scene_SlideTransition
});
var flambe_script_Action = function() { };
flambe_script_Action.__name__ = true;
flambe_script_Action.prototype = {
	__class__: flambe_script_Action
};
var flambe_script_CallFunction = function(fn) {
	this._fn = fn;
};
flambe_script_CallFunction.__name__ = true;
flambe_script_CallFunction.__interfaces__ = [flambe_script_Action];
flambe_script_CallFunction.prototype = {
	update: function(dt,actor) {
		this._fn();
		return 0;
	}
	,__class__: flambe_script_CallFunction
};
var flambe_script_Delay = function(seconds) {
	this._duration = seconds;
	this._elapsed = 0;
};
flambe_script_Delay.__name__ = true;
flambe_script_Delay.__interfaces__ = [flambe_script_Action];
flambe_script_Delay.prototype = {
	update: function(dt,actor) {
		this._elapsed += dt;
		if(this._elapsed >= this._duration) {
			var overtime = this._elapsed - this._duration;
			this._elapsed = 0;
			return dt - overtime;
		}
		return -1;
	}
	,__class__: flambe_script_Delay
};
var flambe_script_Repeat = function(action,count) {
	if(count == null) count = -1;
	this._action = action;
	this._count = count;
	this._remaining = count;
};
flambe_script_Repeat.__name__ = true;
flambe_script_Repeat.__interfaces__ = [flambe_script_Action];
flambe_script_Repeat.prototype = {
	update: function(dt,actor) {
		if(this._count == 0) return 0;
		var spent = this._action.update(dt,actor);
		if(this._count > 0 && spent >= 0 && --this._remaining == 0) {
			this._remaining = this._count;
			return spent;
		}
		return -1;
	}
	,__class__: flambe_script_Repeat
};
var flambe_script_Script = function() {
	flambe_Component.call(this);
	this.stopAll();
};
flambe_script_Script.__name__ = true;
flambe_script_Script.__super__ = flambe_Component;
flambe_script_Script.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "Script_3";
	}
	,run: function(action) {
		var handle = new flambe_script__$Script_Handle(action);
		this._handles.push(handle);
		return handle;
	}
	,stopAll: function() {
		this._handles = [];
	}
	,onUpdate: function(dt) {
		var ii = 0;
		while(ii < this._handles.length) {
			var handle = this._handles[ii];
			if(handle.removed || handle.action.update(dt,this.owner) >= 0) this._handles.splice(ii,1); else ++ii;
		}
	}
	,__class__: flambe_script_Script
});
var flambe_script__$Script_Handle = function(action) {
	this.removed = false;
	this.action = action;
};
flambe_script__$Script_Handle.__name__ = true;
flambe_script__$Script_Handle.__interfaces__ = [flambe_util_Disposable];
flambe_script__$Script_Handle.prototype = {
	dispose: function() {
		this.removed = true;
		this.action = null;
	}
	,__class__: flambe_script__$Script_Handle
};
var flambe_script_Sequence = function(actions) {
	this._idx = 0;
	if(actions != null) this._runningActions = actions.slice(); else this._runningActions = [];
};
flambe_script_Sequence.__name__ = true;
flambe_script_Sequence.__interfaces__ = [flambe_script_Action];
flambe_script_Sequence.prototype = {
	update: function(dt,actor) {
		var total = 0.0;
		while(true) {
			var action = this._runningActions[this._idx];
			if(action != null) {
				var spent = action.update(dt - total,actor);
				if(spent >= 0) total += spent; else return -1;
			}
			++this._idx;
			if(this._idx >= this._runningActions.length) {
				this._idx = 0;
				break;
			} else if(total > dt) return -1;
		}
		return total;
	}
	,__class__: flambe_script_Sequence
};
var flambe_subsystem_RendererType = { __ename__ : true, __constructs__ : ["Stage3D","WebGL","Canvas"] };
flambe_subsystem_RendererType.Stage3D = ["Stage3D",0];
flambe_subsystem_RendererType.Stage3D.toString = $estr;
flambe_subsystem_RendererType.Stage3D.__enum__ = flambe_subsystem_RendererType;
flambe_subsystem_RendererType.WebGL = ["WebGL",1];
flambe_subsystem_RendererType.WebGL.toString = $estr;
flambe_subsystem_RendererType.WebGL.__enum__ = flambe_subsystem_RendererType;
flambe_subsystem_RendererType.Canvas = ["Canvas",2];
flambe_subsystem_RendererType.Canvas.toString = $estr;
flambe_subsystem_RendererType.Canvas.__enum__ = flambe_subsystem_RendererType;
var flambe_util_Assert = function() { };
flambe_util_Assert.__name__ = true;
flambe_util_Assert.that = function(condition,message,fields) {
};
var flambe_util_Config = function() {
	this.mainSection = new haxe_ds_StringMap();
	this.sections = new haxe_ds_StringMap();
};
flambe_util_Config.__name__ = true;
flambe_util_Config.parse = function(text) {
	var config = new flambe_util_Config();
	var commentPattern = new EReg("^\\s*;","");
	var sectionPattern = new EReg("^\\s*\\[\\s*([^\\]]*)\\s*\\]","");
	var pairPattern = new EReg("^\\s*([\\w\\.\\-_]+)\\s*=\\s*(.*)","");
	var currentSection = config.mainSection;
	var _g = 0;
	var _g1 = new EReg("\r\n|\r|\n","g").split(text);
	while(_g < _g1.length) {
		var line = _g1[_g];
		++_g;
		if(commentPattern.match(line)) {
		} else if(sectionPattern.match(line)) {
			var name = sectionPattern.matched(1);
			if(config.sections.exists(name)) currentSection = config.sections.get(name); else {
				currentSection = new haxe_ds_StringMap();
				config.sections.set(name,currentSection);
			}
		} else if(pairPattern.match(line)) {
			var key = pairPattern.matched(1);
			var value = pairPattern.matched(2);
			var quote = value.charCodeAt(0);
			if((quote == 34 || quote == 39) && value.charCodeAt(value.length - 1) == quote) value = HxOverrides.substr(value,1,value.length - 2);
			var value1 = StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(value,"\\n","\n"),"\\r","\r"),"\\t","\t"),"\\'","'"),"\\\"","\""),"\\\\","\\");
			if(__map_reserved[key] != null) currentSection.setReserved(key,value1); else currentSection.h[key] = value1;
		}
	}
	return config;
};
flambe_util_Config.prototype = {
	get: function(path) {
		var idx = path.indexOf(".");
		if(idx < 0) return this.mainSection.get(path);
		var section;
		var key = HxOverrides.substr(path,0,idx);
		section = this.sections.get(key);
		if(section != null) {
			var key1 = HxOverrides.substr(path,idx + 1,null);
			return __map_reserved[key1] != null?section.getReserved(key1):section.h[key1];
		} else return null;
	}
	,__class__: flambe_util_Config
};
var flambe_util_MessageBundle = function(config) {
	this.config = config;
	this.missingTranslation = new flambe_util_Signal1();
};
flambe_util_MessageBundle.__name__ = true;
flambe_util_MessageBundle.parse = function(text) {
	return new flambe_util_MessageBundle(flambe_util_Config.parse(text));
};
flambe_util_MessageBundle.prototype = {
	get: function(path,params) {
		var value = this.config.get(path);
		if(value == null) {
			this.missingTranslation.emit(path);
			return path;
		}
		if(params != null) return flambe_util_Strings.substitute(value,params); else return value;
	}
	,__class__: flambe_util_MessageBundle
};
var flambe_util_Promise = function() {
	this.success = new flambe_util_Signal1();
	this.error = new flambe_util_Signal1();
	this.progressChanged = new flambe_util_Signal0();
	this.hasResult = false;
	this._progress = 0;
	this._total = 0;
};
flambe_util_Promise.__name__ = true;
flambe_util_Promise.prototype = {
	set_result: function(result) {
		if(this.hasResult) throw new js__$Boot_HaxeError("Promise result already assigned");
		this._result = result;
		this.hasResult = true;
		this.success.emit(result);
		return result;
	}
	,get: function(fn) {
		if(this.hasResult) {
			fn(this._result);
			return null;
		}
		return this.success.connect(fn).once();
	}
	,set_progress: function(progress) {
		if(this._progress != progress) {
			this._progress = progress;
			this.progressChanged.emit();
		}
		return progress;
	}
	,set_total: function(total) {
		if(this._total != total) {
			this._total = total;
			this.progressChanged.emit();
		}
		return total;
	}
	,__class__: flambe_util_Promise
};
var flambe_util_Signal0 = function(listener) {
	flambe_util_SignalBase.call(this,listener);
};
flambe_util_Signal0.__name__ = true;
flambe_util_Signal0.__super__ = flambe_util_SignalBase;
flambe_util_Signal0.prototype = $extend(flambe_util_SignalBase.prototype,{
	connect: function(listener,prioritize) {
		if(prioritize == null) prioritize = false;
		return this.connectImpl(listener,prioritize);
	}
	,emit: function() {
		var _g = this;
		if(this._head == flambe_util_SignalBase.DISPATCHING_SENTINEL) this.defer(function() {
			_g.emitImpl();
		}); else this.emitImpl();
	}
	,emitImpl: function() {
		var head = this.willEmit();
		var p = head;
		while(p != null) {
			p._listener();
			if(!p.stayInList) p.dispose();
			p = p._next;
		}
		this.didEmit(head);
	}
	,__class__: flambe_util_Signal0
});
var flambe_util__$SignalBase_Task = function(fn) {
	this.next = null;
	this.fn = fn;
};
flambe_util__$SignalBase_Task.__name__ = true;
flambe_util__$SignalBase_Task.prototype = {
	__class__: flambe_util__$SignalBase_Task
};
var flambe_util_Strings = function() { };
flambe_util_Strings.__name__ = true;
flambe_util_Strings.getFileExtension = function(fileName) {
	var dot = fileName.lastIndexOf(".");
	if(dot > 0) return HxOverrides.substr(fileName,dot + 1,null); else return null;
};
flambe_util_Strings.removeFileExtension = function(fileName) {
	var dot = fileName.lastIndexOf(".");
	if(dot > 0) return HxOverrides.substr(fileName,0,dot); else return fileName;
};
flambe_util_Strings.getUrlExtension = function(url) {
	var question = url.lastIndexOf("?");
	if(question >= 0) url = HxOverrides.substr(url,0,question);
	var slash = url.lastIndexOf("/");
	if(slash >= 0) url = HxOverrides.substr(url,slash + 1,null);
	return flambe_util_Strings.getFileExtension(url);
};
flambe_util_Strings.joinPath = function(base,relative) {
	if(base.length > 0 && base.charCodeAt(base.length - 1) != 47) base += "/";
	return base + relative;
};
flambe_util_Strings.substitute = function(str,values) {
	var _g1 = 0;
	var _g = values.length;
	while(_g1 < _g) {
		var ii = _g1++;
		str = StringTools.replace(str,"{" + ii + "}",values[ii]);
	}
	return str;
};
flambe_util_Strings.withFields = function(message,fields) {
	var ll = fields.length;
	if(ll > 0) {
		if(message.length > 0) message += " ["; else message += "[";
		var ii = 0;
		while(ii < ll) {
			if(ii > 0) message += ", ";
			var name = fields[ii];
			var value = fields[ii + 1];
			if(Std["is"](value,Error)) {
				var stack = value.stack;
				if(stack != null) value = stack;
			}
			message += name + "=" + Std.string(value);
			ii += 2;
		}
		message += "]";
	}
	return message;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,__class__: haxe_ds_IntMap
};
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
haxe_ds__$StringMap_StringMapIterator.__name__ = true;
haxe_ds__$StringMap_StringMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Bytes = function() { };
haxe_io_Bytes.__name__ = true;
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var haxe_rtti_Meta = function() { };
haxe_rtti_Meta.__name__ = true;
haxe_rtti_Meta.getType = function(t) {
	var meta = haxe_rtti_Meta.getMeta(t);
	if(meta == null || meta.obj == null) return { }; else return meta.obj;
};
haxe_rtti_Meta.getMeta = function(t) {
	return t.__meta__;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var js_html__$CanvasElement_CanvasUtil = function() { };
js_html__$CanvasElement_CanvasUtil.__name__ = true;
js_html__$CanvasElement_CanvasUtil.getContextWebGL = function(canvas,attribs) {
	var _g = 0;
	var _g1 = ["webgl","experimental-webgl"];
	while(_g < _g1.length) {
		var name = _g1[_g];
		++_g;
		var ctx = canvas.getContext(name,attribs);
		if(ctx != null) return ctx;
	}
	return null;
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var urgame_HomeScene = function() { };
urgame_HomeScene.__name__ = true;
urgame_HomeScene.create = function(ctx) {
	var scene = new flambe_Entity();
	var background = new flambe_display_FillSprite(2105376,flambe_System._platform.getStage().get_width(),flambe_System._platform.getStage().get_height());
	scene.addChild(new flambe_Entity().add(background));
	var play = new flambe_display_ImageSprite(ctx.pack.getTexture("buttons/PlayBig"));
	play.centerAnchor().setXY(flambe_System._platform.getStage().get_width() / 2,flambe_System._platform.getStage().get_height() / 2);
	play.get_pointerDown().connect(function(_) {
		ctx.pack.getSound("sounds/Coin").play();
		ctx.enterPlayingScene();
	});
	scene.addChild(new flambe_Entity().add(play));
	return scene;
};
var urgame_LevelModel = function(ctx) {
	this.currentInput = "";
	this.nekoMaxSpeed = 2;
	this.nekoSpawnTime = 4;
	flambe_Component.call(this);
	this.ctx = ctx;
	this.nekoArray = [];
	this.score = new flambe_util_Value(0);
};
urgame_LevelModel.__name__ = true;
urgame_LevelModel.__super__ = flambe_Component;
urgame_LevelModel.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "LevelModel_0";
	}
	,onAdded: function() {
		var _g1 = this;
		this.owner.addChild(this.worldLayer = new flambe_Entity());
		this.backgroundLayer = new flambe_Entity().add(new flambe_display_ImageSprite(this.ctx.pack.getTexture("wood_background")));
		this.worldLayer.addChild(this.backgroundLayer);
		this.backgroundLayer.addChild(this.nekoLayer = new flambe_Entity());
		this.backgroundLayer.addChild(this.kanaLayer = new flambe_Entity());
		var spawnScript = new flambe_script_Script();
		this.worldLayer.add(spawnScript);
		spawnScript.run(new flambe_script_Repeat(new flambe_script_Sequence([new flambe_script_Delay(this.nekoSpawnTime),new flambe_script_CallFunction($bind(this,this.nekoMaker))])));
		flambe_System._platform.getKeyboard().up.connect(function(keyboardEvent) {
			{
				var _g = keyboardEvent.key;
				switch(_g[1]) {
				case 81:
					if(_g1.currentInput.length > 0) {
						_g1.checkForCoincidence(_g1.currentInput);
						_g1.currentInput = "";
						null;
					}
					break;
				case 74:
					if(_g1.currentInput.length > 0) {
						var deleted = _g1.currentInput.substring(_g1.currentInput.length - 1,_g1.currentInput.length);
						_g1.currentInput = _g1.currentInput.substring(0,_g1.currentInput.length - 1);
						null;
					}
					break;
				case 100:
					var keyCode = _g[2];
					break;
				default:
					_g1.currentInput += keyboardEvent.key[0];
					null;
				}
			}
		});
	}
	,checkForCoincidence: function(input) {
		var _g1 = 0;
		var _g = this.nekoArray.length;
		while(_g1 < _g) {
			var i = _g1++;
			var neko = this.nekoArray[i];
			var nekoComponent = neko._compMap.NekoComponent_1;
			if(nekoComponent.getRomaji() == input) {
				this.nekoArray.splice(i,1);
				neko.dispose();
				var _g2 = this.score;
				_g2.set__(_g2._value + 10);
				break;
			}
		}
	}
	,onUpdate: function(dt) {
		var _g1 = 0;
		var _g = this.nekoArray.length;
		while(_g1 < _g) {
			var i = _g1++;
			null;
		}
	}
	,nekoMaker: function() {
		var nekoComponent = new urgame_neko_NekoComponent(this.nekoMaxSpeed,this.ctx);
		var neko = new flambe_Entity().add(nekoComponent);
		this.nekoArray.push(neko);
		this.nekoLayer.addChild(neko);
		nekoComponent.move();
	}
	,__class__: urgame_LevelModel
});
var urgame_Main = function() { };
urgame_Main.__name__ = true;
urgame_Main.main = function() {
	flambe_System.init();
	var director = new flambe_scene_Director();
	flambe_System.root.add(director);
	var manifest = flambe_asset_Manifest.fromAssets("bootstrap");
	flambe_System._platform.loadAssetPack(manifest).get(function(bootstrapPack) {
		flambe_System.loadAssetPack(flambe_asset_Manifest.fromAssetsLocalized("locale")).get(function(localePack) {
			var promise = flambe_System.loadAssetPack(flambe_asset_Manifest.fromAssets("main"));
			promise.get(function(mainPack) {
				var ctx = new urgame_NekoContext(mainPack,localePack,director);
				ctx.enterHomeScene(false);
				bootstrapPack.dispose();
			});
			var preloader = urgame_PreloaderScene.create(bootstrapPack,promise);
			director.unwindToScene(preloader);
		});
	});
};
var urgame_NekoContext = function(mainPack,localePack,director) {
	this.pack = mainPack;
	this.director = director;
	this.messages = flambe_util_MessageBundle.parse(localePack.getFile("messages.ini").toString());
	this.lightFont = new flambe_display_Font(this.pack,"fonts/Light");
	this.darkFont = new flambe_display_Font(this.pack,"fonts/Dark");
	this.japanFont = new flambe_display_Font(this.pack,"fonts/japanFont");
};
urgame_NekoContext.__name__ = true;
urgame_NekoContext.prototype = {
	enterHomeScene: function(animate) {
		if(animate == null) animate = true;
		this.director.unwindToScene(urgame_HomeScene.create(this),animate?new flambe_scene_SlideTransition(0.5,flambe_animation_Ease.quadOut):null);
	}
	,enterPlayingScene: function(animate) {
		if(animate == null) animate = true;
		this.director.unwindToScene(urgame_PlayingScene.create(this),animate?new flambe_scene_SlideTransition(0.5,flambe_animation_Ease.quadOut):null);
	}
	,showPrompt: function(text,buttons) {
		this.director.pushScene(urgame_PromptScene.create(this,text,buttons));
	}
	,__class__: urgame_NekoContext
};
var urgame_PlayingScene = function() { };
urgame_PlayingScene.__name__ = true;
urgame_PlayingScene.create = function(ctx) {
	var scene = new flambe_Entity();
	var level = new urgame_LevelModel(ctx);
	ctx.level = level;
	scene.add(level);
	var scoreLabel = new flambe_display_TextSprite(ctx.lightFont);
	scoreLabel.setXY(5,5);
	level.score.watch(function(score,_) {
		scoreLabel.set_text("" + score);
	});
	scene.addChild(new flambe_Entity().add(scoreLabel));
	var pause = new flambe_display_ImageSprite(ctx.pack.getTexture("buttons/Pause"));
	pause.setXY(flambe_System._platform.getStage().get_width() - pause.texture.get_width() - 5,5);
	pause.get_pointerDown().connect(function(_1) {
		ctx.showPrompt(ctx.messages.get("paused"),["Play",function() {
			ctx.director.unwindToScene(scene);
		},"Home",function() {
			ctx.director.unwindToScene(scene);
			ctx.enterHomeScene();
		}]);
	});
	scene.addChild(new flambe_Entity().add(pause));
	return scene;
};
var urgame_PreloaderScene = function() { };
urgame_PreloaderScene.__name__ = true;
urgame_PreloaderScene.create = function(pack,promise) {
	var scene = new flambe_Entity();
	var background = new flambe_display_FillSprite(2105376,flambe_System._platform.getStage().get_width(),flambe_System._platform.getStage().get_height());
	scene.addChild(new flambe_Entity().add(background));
	var left = new flambe_display_ImageSprite(pack.getTexture("progress/Left"));
	var right = new flambe_display_ImageSprite(pack.getTexture("progress/Right"));
	var padding = 20;
	var progressWidth = flambe_System._platform.getStage().get_width() - left.texture.get_width() - right.texture.get_width() - 2 * padding;
	var y = flambe_System._platform.getStage().get_height() / 2 - left.texture.get_height();
	left.setXY(padding,y);
	scene.addChild(new flambe_Entity().add(left));
	var background1 = new flambe_display_PatternSprite(pack.getTexture("progress/Background"),progressWidth);
	background1.setXY(left.x._value + left.texture.get_width(),y);
	scene.addChild(new flambe_Entity().add(background1));
	var fill = new flambe_display_PatternSprite(pack.getTexture("progress/Fill"));
	fill.setXY(background1.x._value,y);
	promise.progressChanged.connect(function() {
		fill.width.set__(promise._progress / promise._total * progressWidth);
	});
	scene.addChild(new flambe_Entity().add(fill));
	right.setXY(fill.x._value + progressWidth,y);
	scene.addChild(new flambe_Entity().add(right));
	return scene;
};
var urgame_PromptScene = function() { };
urgame_PromptScene.__name__ = true;
urgame_PromptScene.create = function(ctx,text,buttons) {
	var scene = new flambe_Entity();
	scene.add(new flambe_scene_Scene(false));
	var background = new flambe_display_FillSprite(0,flambe_System._platform.getStage().get_width(),flambe_System._platform.getStage().get_height());
	background.alpha.animate(0,0.5,0.5);
	scene.addChild(new flambe_Entity().add(background));
	var label = new flambe_display_TextSprite(ctx.lightFont,text);
	label.setWrapWidth(flambe_System._platform.getStage().get_width()).setAlign(flambe_display_TextAlign.Center);
	label.x.animate(-flambe_System._platform.getStage().get_width(),0,0.5,flambe_animation_Ease.backOut);
	label.y.set__(flambe_System._platform.getStage().get_height() / 2 - 150);
	var labelBackground = new flambe_display_FillSprite(0,flambe_System._platform.getStage().get_width(),label.getNaturalHeight() + 5);
	labelBackground.alpha.animate(0,0.5,0.5);
	labelBackground.y.set__(label.y._value);
	scene.addChild(new flambe_Entity().add(labelBackground));
	scene.addChild(new flambe_Entity().add(label));
	var row = new flambe_Entity();
	var x = 0.0;
	var ii = 0;
	while(ii < buttons.length) {
		var name = buttons[ii++];
		var handler = [buttons[ii++]];
		var button = new flambe_display_ImageSprite(ctx.pack.getTexture("buttons/" + name));
		button.setXY(x,0);
		button.get_pointerDown().connect((function(handler) {
			return function(_) {
				ctx.pack.getSound("sounds/Coin").play();
				handler[0]();
			};
		})(handler));
		x += button.getNaturalWidth() + 20;
		row.addChild(new flambe_Entity().add(button));
	}
	var bounds = flambe_display_Sprite.getBounds(row);
	var sprite = new flambe_display_Sprite();
	sprite.x.animate(flambe_System._platform.getStage().get_width(),flambe_System._platform.getStage().get_width() / 2 - bounds.width / 2,0.5,flambe_animation_Ease.backOut);
	sprite.y.set__(label.y._value + label.getNaturalHeight() + 50);
	scene.addChild(row.add(sprite));
	return scene;
};
var urgame_neko_KanaManager = function() { };
urgame_neko_KanaManager.__name__ = true;
urgame_neko_KanaManager.getRandomKana = function() {
	if(urgame_neko_KanaManager.kanasInUse == "HIRAGANA") return urgame_neko_KanaManager.getRandomElement(urgame_neko_KanaManager.romanjiToHiragana); else return urgame_neko_KanaManager.getRandomElement(urgame_neko_KanaManager.romanjiToKatakana);
};
urgame_neko_KanaManager.getRomanji = function(kana) {
	var romaji;
	if(urgame_neko_KanaManager.kanasInUse == "HIRAGANA") romaji = urgame_neko_KanaManager.hiraganaToRomanji.get(kana); else romaji = urgame_neko_KanaManager.katakanaToRomanji.get(kana);
	if(romaji.charAt(romaji.length - 1) == "*") return romaji.substring(0,romaji.length - 1); else return romaji;
};
urgame_neko_KanaManager.getRandomElement = function(map) {
	var mapArray = Lambda.array(map);
	return mapArray[Std.random(mapArray.length)];
};
var urgame_neko_NekoComponent = function(maxSpeed,ctx) {
	this.moving = false;
	flambe_Component.call(this);
	this.ctx = ctx;
	this.entity = new flambe_Entity();
	this.imageSprite = new flambe_display_ImageSprite(ctx.pack.getTexture("neko"));
	this.maxY = flambe_System._platform.getStage().get_height() - Math.floor(this.imageSprite.getNaturalHeight() / 2);
	this.imageSprite.setScale(0.6).setXY(flambe_System._platform.getStage().get_width(),Std.random(this.maxY));
	this.textSprite = new flambe_display_TextSprite(ctx.japanFont,urgame_neko_KanaManager.getRandomKana());
	this.textSprite.centerAnchor().setXY(this.imageSprite.getNaturalWidth() / 2,this.imageSprite.getNaturalHeight() / 2);
	this.romaji = urgame_neko_KanaManager.getRomanji(this.textSprite._text);
	this.speed = Std.random(maxSpeed) + 1;
};
urgame_neko_NekoComponent.__name__ = true;
urgame_neko_NekoComponent.__super__ = flambe_Component;
urgame_neko_NekoComponent.prototype = $extend(flambe_Component.prototype,{
	get_name: function() {
		return "NekoComponent_1";
	}
	,move: function() {
		this.moving = true;
	}
	,getRomaji: function() {
		return this.romaji;
	}
	,onAdded: function() {
		flambe_Component.prototype.onAdded.call(this);
		this.owner.addChild(this.entity);
		this.entity.add(this.imageSprite);
		this.entity.addChild(new flambe_Entity().add(this.textSprite));
	}
	,onUpdate: function(dt) {
		flambe_Component.prototype.onUpdate.call(this,dt);
		if(this.moving) {
			var _g = this.imageSprite.x;
			_g.set__(_g._value - this.speed);
		}
	}
	,__class__: urgame_neko_NekoComponent
});
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
flambe_platform_html_HtmlPlatform.instance = new flambe_platform_html_HtmlPlatform();
flambe_util_SignalBase.DISPATCHING_SENTINEL = new flambe_util_SignalConnection(null,null);
flambe_System.root = new flambe_Entity();
flambe_System.uncaughtError = new flambe_util_Signal1();
flambe_System.hidden = new flambe_util_Value(false);
flambe_System.volume = new flambe_animation_AnimatedFloat(1);
flambe_System._platform = flambe_platform_html_HtmlPlatform.instance;
flambe_System._calledInit = false;
flambe_asset_Manifest.__meta__ = { obj : { assets : [{ locale_pt : [{ bytes : 111, md5 : "6123b1afc417347b496b411995d04730", name : "messages.ini"}], locale_es : [{ bytes : 114, md5 : "6f6f738f15dfdb91158e42ca91deea93", name : "messages.ini"}], bootstrap : [{ bytes : 236, md5 : "39270899fe8d72dbace04ff22a880986", name : "progress/Background.png"},{ bytes : 233, md5 : "c6c9901883e4775f6a3628d8cdc3dae9", name : "progress/Fill.png"},{ bytes : 1802, md5 : "faf83a7352d4f0e97cfa53e1d39e079e", name : "progress/Left.png"},{ bytes : 1812, md5 : "e437406653b6b0473600c0e45fbef0a7", name : "progress/Right.png"}], locale : [{ bytes : 109, md5 : "c8c097d325d285219f666a8b0ce60bfa", name : "messages.ini"}], main : [{ bytes : 12613, md5 : "9671a8b71d2d78710f507fcc81a1a88d", name : "buttons/Home.png"},{ bytes : 3224, md5 : "9f8d3a4f8cb58e76ee0c3506da631bbb", name : "buttons/Pause.png"},{ bytes : 11533, md5 : "b59cdcb396427e323707f8374b28e70c", name : "buttons/Play.png"},{ bytes : 22389, md5 : "122533058ee29c9b9c3646f7d3f02aa1", name : "buttons/PlayBig.png"},{ bytes : 13530, md5 : "0b948a042a62f1d82204eaab62efc66c", name : "buttons/Replay.png"},{ bytes : 12515, md5 : "fee5bd38c164ab48e5073703e187f842", name : "buttons/Tweet.png"},{ bytes : 22640, md5 : "06b36bc435bdcb5dd36661448107decd", name : "buttons/Volume.png"},{ bytes : 11645, md5 : "b687be6b49d0460ed35930d0177b7254", name : "fonts/Dark.fnt"},{ bytes : 5456, md5 : "4bd084e77f1f1e075a971d4a1b428c34", name : "fonts/Dark.png"},{ bytes : 54862, md5 : "0a815d4835c4ee2c532624e4883cee29", name : "fonts/japanFont.fnt"},{ bytes : 223411, md5 : "47e7f408cab24413626583f33d46e974", name : "fonts/japanFont.png"},{ bytes : 11646, md5 : "60cb9d33b8089291276f0e999abd5646", name : "fonts/Light.fnt"},{ bytes : 7009, md5 : "a3576efee2a052c8bed6d277e7b9e097", name : "fonts/Light.png"},{ bytes : 13453, md5 : "6cb61c02d44ba37fb05721c7177457e0", name : "neko.png"},{ bytes : 4596, md5 : "20e8d7db296f31325bdd08b38b85b2b6", name : "sounds/Coin.mp3"},{ bytes : 6677, md5 : "3145c135ecf88b16456c50c6128218de", name : "sounds/Coin.ogg"},{ bytes : 5223, md5 : "2aa5a0a04c1e2640c17122f340758ee8", name : "sounds/Explode.mp3"},{ bytes : 8614, md5 : "5871e545c2932379bcaf32eca7c595e4", name : "sounds/Explode.ogg"},{ bytes : 1043, md5 : "d38cbfa6fda881ad0565338ab6f1618f", name : "sounds/Hurt.mp3"},{ bytes : 4184, md5 : "4412af33d0d28b975f65c131590654fd", name : "sounds/Hurt.ogg"},{ bytes : 89234, md5 : "ab44706d9f66ab634b886485da16796d", name : "wood_background.jpg"}]}]}};
flambe_asset_Manifest._supportsCrossOrigin = (function() {
	var detected = (function() {
		if(window.navigator.userAgent.indexOf("Linux; U; Android") >= 0) return false;
		var xhr = new XMLHttpRequest();
		return xhr.withCredentials != null;
	})();
	if(!detected) null;
	return detected;
})();
flambe_display_Sprite._scratchPoint = new flambe_math_Point();
flambe_display_Font.NEWLINE = new flambe_display_Glyph(10);
flambe_platform_BasicKeyboard._sharedEvent = new flambe_input_KeyboardEvent();
flambe_platform_BasicMouse._sharedEvent = new flambe_input_MouseEvent();
flambe_platform_BasicPointer._sharedEvent = new flambe_input_PointerEvent();
flambe_platform_html_CanvasRenderer.CANVAS_TEXTURES = (function() {
	var pattern = new EReg("(iPhone|iPod|iPad)","");
	return pattern.match(window.navigator.userAgent);
})();
flambe_platform_html_HtmlAssetPackLoader._mediaRefCount = 0;
flambe_platform_html_HtmlAssetPackLoader._detectBlobSupport = true;
flambe_platform_html_HtmlUtil.VENDOR_PREFIXES = ["webkit","moz","ms","o","khtml"];
flambe_platform_html_HtmlUtil.SHOULD_HIDE_MOBILE_BROWSER = window.top == window && new EReg("Mobile(/.*)? Safari","").match(window.navigator.userAgent);
flambe_platform_html_WebAudioSound._detectSupport = true;
flambe_platform_html_WebGLGraphics._scratchMatrix = new flambe_math_Matrix();
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
urgame_neko_KanaManager.kanasInUse = "HIRAGANA";
urgame_neko_KanaManager.romanjiToHiragana = (function($this) {
	var $r;
	var _g = new haxe_ds_StringMap();
	if(__map_reserved.A != null) _g.setReserved("A","あ"); else _g.h["A"] = "あ";
	if(__map_reserved.I != null) _g.setReserved("I","い"); else _g.h["I"] = "い";
	if(__map_reserved.U != null) _g.setReserved("U","う"); else _g.h["U"] = "う";
	if(__map_reserved.E != null) _g.setReserved("E","え"); else _g.h["E"] = "え";
	if(__map_reserved.O != null) _g.setReserved("O","お"); else _g.h["O"] = "お";
	if(__map_reserved.KA != null) _g.setReserved("KA","か"); else _g.h["KA"] = "か";
	if(__map_reserved.KI != null) _g.setReserved("KI","き"); else _g.h["KI"] = "き";
	if(__map_reserved.KU != null) _g.setReserved("KU","く"); else _g.h["KU"] = "く";
	if(__map_reserved.KE != null) _g.setReserved("KE","け"); else _g.h["KE"] = "け";
	if(__map_reserved.KO != null) _g.setReserved("KO","こ"); else _g.h["KO"] = "こ";
	if(__map_reserved.SA != null) _g.setReserved("SA","さ"); else _g.h["SA"] = "さ";
	if(__map_reserved.SHI != null) _g.setReserved("SHI","し"); else _g.h["SHI"] = "し";
	if(__map_reserved.SU != null) _g.setReserved("SU","す"); else _g.h["SU"] = "す";
	if(__map_reserved.SE != null) _g.setReserved("SE","せ"); else _g.h["SE"] = "せ";
	if(__map_reserved.SO != null) _g.setReserved("SO","そ"); else _g.h["SO"] = "そ";
	if(__map_reserved.TA != null) _g.setReserved("TA","た"); else _g.h["TA"] = "た";
	if(__map_reserved.CHI != null) _g.setReserved("CHI","ち"); else _g.h["CHI"] = "ち";
	if(__map_reserved.TSU != null) _g.setReserved("TSU","つ"); else _g.h["TSU"] = "つ";
	if(__map_reserved.TE != null) _g.setReserved("TE","て"); else _g.h["TE"] = "て";
	if(__map_reserved.TO != null) _g.setReserved("TO","と"); else _g.h["TO"] = "と";
	if(__map_reserved.NA != null) _g.setReserved("NA","な"); else _g.h["NA"] = "な";
	if(__map_reserved.NI != null) _g.setReserved("NI","に"); else _g.h["NI"] = "に";
	if(__map_reserved.NU != null) _g.setReserved("NU","ぬ"); else _g.h["NU"] = "ぬ";
	if(__map_reserved.NE != null) _g.setReserved("NE","ね"); else _g.h["NE"] = "ね";
	if(__map_reserved.NO != null) _g.setReserved("NO","の"); else _g.h["NO"] = "の";
	if(__map_reserved.HA != null) _g.setReserved("HA","は"); else _g.h["HA"] = "は";
	if(__map_reserved.HI != null) _g.setReserved("HI","ひ"); else _g.h["HI"] = "ひ";
	if(__map_reserved.FU != null) _g.setReserved("FU","ふ"); else _g.h["FU"] = "ふ";
	if(__map_reserved.HE != null) _g.setReserved("HE","へ"); else _g.h["HE"] = "へ";
	if(__map_reserved.HO != null) _g.setReserved("HO","ほ"); else _g.h["HO"] = "ほ";
	if(__map_reserved.MA != null) _g.setReserved("MA","ま"); else _g.h["MA"] = "ま";
	if(__map_reserved.MI != null) _g.setReserved("MI","み"); else _g.h["MI"] = "み";
	if(__map_reserved.MU != null) _g.setReserved("MU","む"); else _g.h["MU"] = "む";
	if(__map_reserved.ME != null) _g.setReserved("ME","め"); else _g.h["ME"] = "め";
	if(__map_reserved.MO != null) _g.setReserved("MO","も"); else _g.h["MO"] = "も";
	if(__map_reserved.YA != null) _g.setReserved("YA","や"); else _g.h["YA"] = "や";
	if(__map_reserved.YU != null) _g.setReserved("YU","ゆ"); else _g.h["YU"] = "ゆ";
	if(__map_reserved.YO != null) _g.setReserved("YO","よ"); else _g.h["YO"] = "よ";
	if(__map_reserved.RA != null) _g.setReserved("RA","ら"); else _g.h["RA"] = "ら";
	if(__map_reserved.RI != null) _g.setReserved("RI","り"); else _g.h["RI"] = "り";
	if(__map_reserved.RU != null) _g.setReserved("RU","る"); else _g.h["RU"] = "る";
	if(__map_reserved.RE != null) _g.setReserved("RE","れ"); else _g.h["RE"] = "れ";
	if(__map_reserved.RO != null) _g.setReserved("RO","ろ"); else _g.h["RO"] = "ろ";
	if(__map_reserved.WA != null) _g.setReserved("WA","わ"); else _g.h["WA"] = "わ";
	if(__map_reserved.WO != null) _g.setReserved("WO","を"); else _g.h["WO"] = "を";
	if(__map_reserved.N != null) _g.setReserved("N","ん"); else _g.h["N"] = "ん";
	if(__map_reserved.GA != null) _g.setReserved("GA","が"); else _g.h["GA"] = "が";
	if(__map_reserved.GI != null) _g.setReserved("GI","ぎ"); else _g.h["GI"] = "ぎ";
	if(__map_reserved.GU != null) _g.setReserved("GU","ぐ"); else _g.h["GU"] = "ぐ";
	if(__map_reserved.GE != null) _g.setReserved("GE","げ"); else _g.h["GE"] = "げ";
	if(__map_reserved.GO != null) _g.setReserved("GO","ご"); else _g.h["GO"] = "ご";
	if(__map_reserved.ZA != null) _g.setReserved("ZA","ざ"); else _g.h["ZA"] = "ざ";
	if(__map_reserved.JI != null) _g.setReserved("JI","じ"); else _g.h["JI"] = "じ";
	if(__map_reserved.ZU != null) _g.setReserved("ZU","ず"); else _g.h["ZU"] = "ず";
	if(__map_reserved.ZE != null) _g.setReserved("ZE","ぜ"); else _g.h["ZE"] = "ぜ";
	if(__map_reserved.ZO != null) _g.setReserved("ZO","ぞ"); else _g.h["ZO"] = "ぞ";
	if(__map_reserved.DA != null) _g.setReserved("DA","だ"); else _g.h["DA"] = "だ";
	if(__map_reserved["JI*"] != null) _g.setReserved("JI*","ぢ"); else _g.h["JI*"] = "ぢ";
	if(__map_reserved["ZU*"] != null) _g.setReserved("ZU*","づ"); else _g.h["ZU*"] = "づ";
	if(__map_reserved.DE != null) _g.setReserved("DE","で"); else _g.h["DE"] = "で";
	if(__map_reserved.DO != null) _g.setReserved("DO","ど"); else _g.h["DO"] = "ど";
	if(__map_reserved.BA != null) _g.setReserved("BA","ば"); else _g.h["BA"] = "ば";
	if(__map_reserved.BI != null) _g.setReserved("BI","び"); else _g.h["BI"] = "び";
	if(__map_reserved.BU != null) _g.setReserved("BU","ぶ"); else _g.h["BU"] = "ぶ";
	if(__map_reserved.BE != null) _g.setReserved("BE","べ"); else _g.h["BE"] = "べ";
	if(__map_reserved.BO != null) _g.setReserved("BO","ぼ"); else _g.h["BO"] = "ぼ";
	if(__map_reserved.PA != null) _g.setReserved("PA","ぱ"); else _g.h["PA"] = "ぱ";
	if(__map_reserved.PI != null) _g.setReserved("PI","ぴ"); else _g.h["PI"] = "ぴ";
	if(__map_reserved.PU != null) _g.setReserved("PU","ぷ"); else _g.h["PU"] = "ぷ";
	if(__map_reserved.PE != null) _g.setReserved("PE","ぺ"); else _g.h["PE"] = "ぺ";
	if(__map_reserved.PO != null) _g.setReserved("PO","ぽ"); else _g.h["PO"] = "ぽ";
	if(__map_reserved.KYA != null) _g.setReserved("KYA","きゃ"); else _g.h["KYA"] = "きゃ";
	if(__map_reserved.KYU != null) _g.setReserved("KYU","きゅ"); else _g.h["KYU"] = "きゅ";
	if(__map_reserved.KYO != null) _g.setReserved("KYO","きょ"); else _g.h["KYO"] = "きょ";
	if(__map_reserved.SHA != null) _g.setReserved("SHA","しゃ"); else _g.h["SHA"] = "しゃ";
	if(__map_reserved.SHU != null) _g.setReserved("SHU","しゅ"); else _g.h["SHU"] = "しゅ";
	if(__map_reserved.SHO != null) _g.setReserved("SHO","しょ"); else _g.h["SHO"] = "しょ";
	if(__map_reserved.CHA != null) _g.setReserved("CHA","ちゃ"); else _g.h["CHA"] = "ちゃ";
	if(__map_reserved.CHU != null) _g.setReserved("CHU","ちゅ"); else _g.h["CHU"] = "ちゅ";
	if(__map_reserved.CHO != null) _g.setReserved("CHO","ちょ"); else _g.h["CHO"] = "ちょ";
	if(__map_reserved.NYA != null) _g.setReserved("NYA","にゃ"); else _g.h["NYA"] = "にゃ";
	if(__map_reserved.NYU != null) _g.setReserved("NYU","にゅ"); else _g.h["NYU"] = "にゅ";
	if(__map_reserved.NYO != null) _g.setReserved("NYO","にょ"); else _g.h["NYO"] = "にょ";
	if(__map_reserved.HYA != null) _g.setReserved("HYA","ひゃ"); else _g.h["HYA"] = "ひゃ";
	if(__map_reserved.HYU != null) _g.setReserved("HYU","ひゅ"); else _g.h["HYU"] = "ひゅ";
	if(__map_reserved.HYO != null) _g.setReserved("HYO","ひょ"); else _g.h["HYO"] = "ひょ";
	if(__map_reserved.MYA != null) _g.setReserved("MYA","みゃ"); else _g.h["MYA"] = "みゃ";
	if(__map_reserved.MYU != null) _g.setReserved("MYU","みゅ"); else _g.h["MYU"] = "みゅ";
	if(__map_reserved.MYO != null) _g.setReserved("MYO","みょ"); else _g.h["MYO"] = "みょ";
	if(__map_reserved.RYA != null) _g.setReserved("RYA","りゃ"); else _g.h["RYA"] = "りゃ";
	if(__map_reserved.RYU != null) _g.setReserved("RYU","りゅ"); else _g.h["RYU"] = "りゅ";
	if(__map_reserved.RYO != null) _g.setReserved("RYO","りょ"); else _g.h["RYO"] = "りょ";
	if(__map_reserved.GYA != null) _g.setReserved("GYA","ぎゃ"); else _g.h["GYA"] = "ぎゃ";
	if(__map_reserved.GYU != null) _g.setReserved("GYU","ぎゅ"); else _g.h["GYU"] = "ぎゅ";
	if(__map_reserved.GYO != null) _g.setReserved("GYO","ぎょ"); else _g.h["GYO"] = "ぎょ";
	if(__map_reserved.JA != null) _g.setReserved("JA","じゃ"); else _g.h["JA"] = "じゃ";
	if(__map_reserved.JU != null) _g.setReserved("JU","じゅ"); else _g.h["JU"] = "じゅ";
	if(__map_reserved.JO != null) _g.setReserved("JO","じょ"); else _g.h["JO"] = "じょ";
	if(__map_reserved["JA*"] != null) _g.setReserved("JA*","ぢゃ"); else _g.h["JA*"] = "ぢゃ";
	if(__map_reserved["JU*"] != null) _g.setReserved("JU*","ぢゅ"); else _g.h["JU*"] = "ぢゅ";
	if(__map_reserved["JO*"] != null) _g.setReserved("JO*","ぢょ"); else _g.h["JO*"] = "ぢょ";
	if(__map_reserved.BYA != null) _g.setReserved("BYA","びゃ"); else _g.h["BYA"] = "びゃ";
	if(__map_reserved.BYU != null) _g.setReserved("BYU","びゅ"); else _g.h["BYU"] = "びゅ";
	if(__map_reserved.BYO != null) _g.setReserved("BYO","びょ"); else _g.h["BYO"] = "びょ";
	if(__map_reserved.PYA != null) _g.setReserved("PYA","ぴゃ"); else _g.h["PYA"] = "ぴゃ";
	if(__map_reserved.PYU != null) _g.setReserved("PYU","ぴゅ"); else _g.h["PYU"] = "ぴゅ";
	if(__map_reserved.PYO != null) _g.setReserved("PYO","ぴょ"); else _g.h["PYO"] = "ぴょ";
	$r = _g;
	return $r;
}(this));
urgame_neko_KanaManager.hiraganaToRomanji = (function($this) {
	var $r;
	var _g = new haxe_ds_StringMap();
	if(__map_reserved["あ"] != null) _g.setReserved("あ","A"); else _g.h["あ"] = "A";
	if(__map_reserved["い"] != null) _g.setReserved("い","I"); else _g.h["い"] = "I";
	if(__map_reserved["う"] != null) _g.setReserved("う","U"); else _g.h["う"] = "U";
	if(__map_reserved["え"] != null) _g.setReserved("え","E"); else _g.h["え"] = "E";
	if(__map_reserved["お"] != null) _g.setReserved("お","O"); else _g.h["お"] = "O";
	if(__map_reserved["か"] != null) _g.setReserved("か","KA"); else _g.h["か"] = "KA";
	if(__map_reserved["き"] != null) _g.setReserved("き","KI"); else _g.h["き"] = "KI";
	if(__map_reserved["く"] != null) _g.setReserved("く","KU"); else _g.h["く"] = "KU";
	if(__map_reserved["け"] != null) _g.setReserved("け","KE"); else _g.h["け"] = "KE";
	if(__map_reserved["こ"] != null) _g.setReserved("こ","KO"); else _g.h["こ"] = "KO";
	if(__map_reserved["さ"] != null) _g.setReserved("さ","SA"); else _g.h["さ"] = "SA";
	if(__map_reserved["し"] != null) _g.setReserved("し","SHI"); else _g.h["し"] = "SHI";
	if(__map_reserved["す"] != null) _g.setReserved("す","SU"); else _g.h["す"] = "SU";
	if(__map_reserved["せ"] != null) _g.setReserved("せ","SE"); else _g.h["せ"] = "SE";
	if(__map_reserved["そ"] != null) _g.setReserved("そ","SO"); else _g.h["そ"] = "SO";
	if(__map_reserved["た"] != null) _g.setReserved("た","TA"); else _g.h["た"] = "TA";
	if(__map_reserved["ち"] != null) _g.setReserved("ち","CHI"); else _g.h["ち"] = "CHI";
	if(__map_reserved["つ"] != null) _g.setReserved("つ","TSU"); else _g.h["つ"] = "TSU";
	if(__map_reserved["て"] != null) _g.setReserved("て","TE"); else _g.h["て"] = "TE";
	if(__map_reserved["と"] != null) _g.setReserved("と","TO"); else _g.h["と"] = "TO";
	if(__map_reserved["な"] != null) _g.setReserved("な","NA"); else _g.h["な"] = "NA";
	if(__map_reserved["に"] != null) _g.setReserved("に","NI"); else _g.h["に"] = "NI";
	if(__map_reserved["ぬ"] != null) _g.setReserved("ぬ","NU"); else _g.h["ぬ"] = "NU";
	if(__map_reserved["ね"] != null) _g.setReserved("ね","NE"); else _g.h["ね"] = "NE";
	if(__map_reserved["の"] != null) _g.setReserved("の","NO"); else _g.h["の"] = "NO";
	if(__map_reserved["は"] != null) _g.setReserved("は","HA"); else _g.h["は"] = "HA";
	if(__map_reserved["ひ"] != null) _g.setReserved("ひ","HI"); else _g.h["ひ"] = "HI";
	if(__map_reserved["ふ"] != null) _g.setReserved("ふ","FU"); else _g.h["ふ"] = "FU";
	if(__map_reserved["へ"] != null) _g.setReserved("へ","HE"); else _g.h["へ"] = "HE";
	if(__map_reserved["ほ"] != null) _g.setReserved("ほ","HO"); else _g.h["ほ"] = "HO";
	if(__map_reserved["ま"] != null) _g.setReserved("ま","MA"); else _g.h["ま"] = "MA";
	if(__map_reserved["み"] != null) _g.setReserved("み","MI"); else _g.h["み"] = "MI";
	if(__map_reserved["む"] != null) _g.setReserved("む","MU"); else _g.h["む"] = "MU";
	if(__map_reserved["め"] != null) _g.setReserved("め","ME"); else _g.h["め"] = "ME";
	if(__map_reserved["も"] != null) _g.setReserved("も","MO"); else _g.h["も"] = "MO";
	if(__map_reserved["や"] != null) _g.setReserved("や","YA"); else _g.h["や"] = "YA";
	if(__map_reserved["ゆ"] != null) _g.setReserved("ゆ","YU"); else _g.h["ゆ"] = "YU";
	if(__map_reserved["よ"] != null) _g.setReserved("よ","YO"); else _g.h["よ"] = "YO";
	if(__map_reserved["ら"] != null) _g.setReserved("ら","RA"); else _g.h["ら"] = "RA";
	if(__map_reserved["り"] != null) _g.setReserved("り","RI"); else _g.h["り"] = "RI";
	if(__map_reserved["る"] != null) _g.setReserved("る","RU"); else _g.h["る"] = "RU";
	if(__map_reserved["れ"] != null) _g.setReserved("れ","RE"); else _g.h["れ"] = "RE";
	if(__map_reserved["ろ"] != null) _g.setReserved("ろ","RO"); else _g.h["ろ"] = "RO";
	if(__map_reserved["わ"] != null) _g.setReserved("わ","WA"); else _g.h["わ"] = "WA";
	if(__map_reserved["を"] != null) _g.setReserved("を","O/WO"); else _g.h["を"] = "O/WO";
	if(__map_reserved["ん"] != null) _g.setReserved("ん","N"); else _g.h["ん"] = "N";
	if(__map_reserved["が"] != null) _g.setReserved("が","GA"); else _g.h["が"] = "GA";
	if(__map_reserved["ぎ"] != null) _g.setReserved("ぎ","GI"); else _g.h["ぎ"] = "GI";
	if(__map_reserved["ぐ"] != null) _g.setReserved("ぐ","GU"); else _g.h["ぐ"] = "GU";
	if(__map_reserved["げ"] != null) _g.setReserved("げ","GE"); else _g.h["げ"] = "GE";
	if(__map_reserved["ご"] != null) _g.setReserved("ご","GO"); else _g.h["ご"] = "GO";
	if(__map_reserved["ざ"] != null) _g.setReserved("ざ","ZA"); else _g.h["ざ"] = "ZA";
	if(__map_reserved["じ"] != null) _g.setReserved("じ","JI"); else _g.h["じ"] = "JI";
	if(__map_reserved["ず"] != null) _g.setReserved("ず","ZU"); else _g.h["ず"] = "ZU";
	if(__map_reserved["ぜ"] != null) _g.setReserved("ぜ","ZE"); else _g.h["ぜ"] = "ZE";
	if(__map_reserved["ぞ"] != null) _g.setReserved("ぞ","ZO"); else _g.h["ぞ"] = "ZO";
	if(__map_reserved["だ"] != null) _g.setReserved("だ","DA"); else _g.h["だ"] = "DA";
	if(__map_reserved["ぢ"] != null) _g.setReserved("ぢ","JI*"); else _g.h["ぢ"] = "JI*";
	if(__map_reserved["づ"] != null) _g.setReserved("づ","ZU*"); else _g.h["づ"] = "ZU*";
	if(__map_reserved["で"] != null) _g.setReserved("で","DE"); else _g.h["で"] = "DE";
	if(__map_reserved["ど"] != null) _g.setReserved("ど","DO"); else _g.h["ど"] = "DO";
	if(__map_reserved["ば"] != null) _g.setReserved("ば","BA"); else _g.h["ば"] = "BA";
	if(__map_reserved["び"] != null) _g.setReserved("び","BI"); else _g.h["び"] = "BI";
	if(__map_reserved["ぶ"] != null) _g.setReserved("ぶ","BU"); else _g.h["ぶ"] = "BU";
	if(__map_reserved["べ"] != null) _g.setReserved("べ","BE"); else _g.h["べ"] = "BE";
	if(__map_reserved["ぼ"] != null) _g.setReserved("ぼ","BO"); else _g.h["ぼ"] = "BO";
	if(__map_reserved["ぱ"] != null) _g.setReserved("ぱ","PA"); else _g.h["ぱ"] = "PA";
	if(__map_reserved["ぴ"] != null) _g.setReserved("ぴ","PI"); else _g.h["ぴ"] = "PI";
	if(__map_reserved["ぷ"] != null) _g.setReserved("ぷ","PU"); else _g.h["ぷ"] = "PU";
	if(__map_reserved["ぺ"] != null) _g.setReserved("ぺ","PE"); else _g.h["ぺ"] = "PE";
	if(__map_reserved["ぽ"] != null) _g.setReserved("ぽ","PO"); else _g.h["ぽ"] = "PO";
	if(__map_reserved["きゃ"] != null) _g.setReserved("きゃ","KYA"); else _g.h["きゃ"] = "KYA";
	if(__map_reserved["きゅ"] != null) _g.setReserved("きゅ","KYU"); else _g.h["きゅ"] = "KYU";
	if(__map_reserved["きょ"] != null) _g.setReserved("きょ","KYO"); else _g.h["きょ"] = "KYO";
	if(__map_reserved["しゃ"] != null) _g.setReserved("しゃ","SHA"); else _g.h["しゃ"] = "SHA";
	if(__map_reserved["しゅ"] != null) _g.setReserved("しゅ","SHU"); else _g.h["しゅ"] = "SHU";
	if(__map_reserved["しょ"] != null) _g.setReserved("しょ","SHO"); else _g.h["しょ"] = "SHO";
	if(__map_reserved["ちゃ"] != null) _g.setReserved("ちゃ","CHA"); else _g.h["ちゃ"] = "CHA";
	if(__map_reserved["ちゅ"] != null) _g.setReserved("ちゅ","CHU"); else _g.h["ちゅ"] = "CHU";
	if(__map_reserved["ちょ"] != null) _g.setReserved("ちょ","CHO"); else _g.h["ちょ"] = "CHO";
	if(__map_reserved["にゃ"] != null) _g.setReserved("にゃ","NYA"); else _g.h["にゃ"] = "NYA";
	if(__map_reserved["にゅ"] != null) _g.setReserved("にゅ","NYU"); else _g.h["にゅ"] = "NYU";
	if(__map_reserved["にょ"] != null) _g.setReserved("にょ","NYO"); else _g.h["にょ"] = "NYO";
	if(__map_reserved["ひゃ"] != null) _g.setReserved("ひゃ","HYA"); else _g.h["ひゃ"] = "HYA";
	if(__map_reserved["ひゅ"] != null) _g.setReserved("ひゅ","HYU"); else _g.h["ひゅ"] = "HYU";
	if(__map_reserved["ひょ"] != null) _g.setReserved("ひょ","HYO"); else _g.h["ひょ"] = "HYO";
	if(__map_reserved["みゃ"] != null) _g.setReserved("みゃ","MYA"); else _g.h["みゃ"] = "MYA";
	if(__map_reserved["みゅ"] != null) _g.setReserved("みゅ","MYU"); else _g.h["みゅ"] = "MYU";
	if(__map_reserved["みょ"] != null) _g.setReserved("みょ","MYO"); else _g.h["みょ"] = "MYO";
	if(__map_reserved["りゃ"] != null) _g.setReserved("りゃ","RYA"); else _g.h["りゃ"] = "RYA";
	if(__map_reserved["りゅ"] != null) _g.setReserved("りゅ","RYU"); else _g.h["りゅ"] = "RYU";
	if(__map_reserved["りょ"] != null) _g.setReserved("りょ","RYO"); else _g.h["りょ"] = "RYO";
	if(__map_reserved["ぎゃ"] != null) _g.setReserved("ぎゃ","GYA"); else _g.h["ぎゃ"] = "GYA";
	if(__map_reserved["ぎゅ"] != null) _g.setReserved("ぎゅ","GYU"); else _g.h["ぎゅ"] = "GYU";
	if(__map_reserved["ぎょ"] != null) _g.setReserved("ぎょ","GYO"); else _g.h["ぎょ"] = "GYO";
	if(__map_reserved["じゃ"] != null) _g.setReserved("じゃ","JA"); else _g.h["じゃ"] = "JA";
	if(__map_reserved["じゅ"] != null) _g.setReserved("じゅ","JU"); else _g.h["じゅ"] = "JU";
	if(__map_reserved["じょ"] != null) _g.setReserved("じょ","JO"); else _g.h["じょ"] = "JO";
	if(__map_reserved["ぢゃ"] != null) _g.setReserved("ぢゃ","JA*"); else _g.h["ぢゃ"] = "JA*";
	if(__map_reserved["ぢゅ"] != null) _g.setReserved("ぢゅ","JU*"); else _g.h["ぢゅ"] = "JU*";
	if(__map_reserved["ぢょ"] != null) _g.setReserved("ぢょ","JO*"); else _g.h["ぢょ"] = "JO*";
	if(__map_reserved["びゃ"] != null) _g.setReserved("びゃ","BYA"); else _g.h["びゃ"] = "BYA";
	if(__map_reserved["びゅ"] != null) _g.setReserved("びゅ","BYU"); else _g.h["びゅ"] = "BYU";
	if(__map_reserved["びょ"] != null) _g.setReserved("びょ","BYO"); else _g.h["びょ"] = "BYO";
	if(__map_reserved["ぴゃ"] != null) _g.setReserved("ぴゃ","PYA"); else _g.h["ぴゃ"] = "PYA";
	if(__map_reserved["ぴゅ"] != null) _g.setReserved("ぴゅ","PYU"); else _g.h["ぴゅ"] = "PYU";
	if(__map_reserved["ぴょ"] != null) _g.setReserved("ぴょ","PYO"); else _g.h["ぴょ"] = "PYO";
	$r = _g;
	return $r;
}(this));
urgame_neko_KanaManager.romanjiToKatakana = (function($this) {
	var $r;
	var _g = new haxe_ds_StringMap();
	if(__map_reserved.A != null) _g.setReserved("A","ア"); else _g.h["A"] = "ア";
	if(__map_reserved.I != null) _g.setReserved("I","イ"); else _g.h["I"] = "イ";
	if(__map_reserved.U != null) _g.setReserved("U","ウ"); else _g.h["U"] = "ウ";
	if(__map_reserved.E != null) _g.setReserved("E","エ"); else _g.h["E"] = "エ";
	if(__map_reserved.O != null) _g.setReserved("O","オ"); else _g.h["O"] = "オ";
	if(__map_reserved.KA != null) _g.setReserved("KA","カ"); else _g.h["KA"] = "カ";
	if(__map_reserved.KI != null) _g.setReserved("KI","キ"); else _g.h["KI"] = "キ";
	if(__map_reserved.KU != null) _g.setReserved("KU","ク"); else _g.h["KU"] = "ク";
	if(__map_reserved.KE != null) _g.setReserved("KE","ケ"); else _g.h["KE"] = "ケ";
	if(__map_reserved.KO != null) _g.setReserved("KO","コ"); else _g.h["KO"] = "コ";
	if(__map_reserved.SA != null) _g.setReserved("SA","サ"); else _g.h["SA"] = "サ";
	if(__map_reserved.SHI != null) _g.setReserved("SHI","シ"); else _g.h["SHI"] = "シ";
	if(__map_reserved.SU != null) _g.setReserved("SU","ス"); else _g.h["SU"] = "ス";
	if(__map_reserved.SE != null) _g.setReserved("SE","セ"); else _g.h["SE"] = "セ";
	if(__map_reserved.SO != null) _g.setReserved("SO","ソ"); else _g.h["SO"] = "ソ";
	if(__map_reserved.TA != null) _g.setReserved("TA","タ"); else _g.h["TA"] = "タ";
	if(__map_reserved.CHI != null) _g.setReserved("CHI","チ"); else _g.h["CHI"] = "チ";
	if(__map_reserved.TSU != null) _g.setReserved("TSU","ツ"); else _g.h["TSU"] = "ツ";
	if(__map_reserved.TE != null) _g.setReserved("TE","テ"); else _g.h["TE"] = "テ";
	if(__map_reserved.TO != null) _g.setReserved("TO","ト"); else _g.h["TO"] = "ト";
	if(__map_reserved.NA != null) _g.setReserved("NA","ナ"); else _g.h["NA"] = "ナ";
	if(__map_reserved.NI != null) _g.setReserved("NI","ニ"); else _g.h["NI"] = "ニ";
	if(__map_reserved.NU != null) _g.setReserved("NU","ヌ"); else _g.h["NU"] = "ヌ";
	if(__map_reserved.NE != null) _g.setReserved("NE","ネ"); else _g.h["NE"] = "ネ";
	if(__map_reserved.NO != null) _g.setReserved("NO","ノ"); else _g.h["NO"] = "ノ";
	if(__map_reserved.HA != null) _g.setReserved("HA","ハ"); else _g.h["HA"] = "ハ";
	if(__map_reserved.HI != null) _g.setReserved("HI","ヒ"); else _g.h["HI"] = "ヒ";
	if(__map_reserved.FU != null) _g.setReserved("FU","フ"); else _g.h["FU"] = "フ";
	if(__map_reserved.HE != null) _g.setReserved("HE","ヘ"); else _g.h["HE"] = "ヘ";
	if(__map_reserved.HO != null) _g.setReserved("HO","ホ"); else _g.h["HO"] = "ホ";
	if(__map_reserved.MA != null) _g.setReserved("MA","マ"); else _g.h["MA"] = "マ";
	if(__map_reserved.MI != null) _g.setReserved("MI","ミ"); else _g.h["MI"] = "ミ";
	if(__map_reserved.MU != null) _g.setReserved("MU","ム"); else _g.h["MU"] = "ム";
	if(__map_reserved.ME != null) _g.setReserved("ME","メ"); else _g.h["ME"] = "メ";
	if(__map_reserved.MO != null) _g.setReserved("MO","モ"); else _g.h["MO"] = "モ";
	if(__map_reserved.YA != null) _g.setReserved("YA","ヤ"); else _g.h["YA"] = "ヤ";
	if(__map_reserved.YU != null) _g.setReserved("YU","ユ"); else _g.h["YU"] = "ユ";
	if(__map_reserved.YO != null) _g.setReserved("YO","ヨ"); else _g.h["YO"] = "ヨ";
	if(__map_reserved.RA != null) _g.setReserved("RA","ラ"); else _g.h["RA"] = "ラ";
	if(__map_reserved.RI != null) _g.setReserved("RI","リ"); else _g.h["RI"] = "リ";
	if(__map_reserved.RU != null) _g.setReserved("RU","ル"); else _g.h["RU"] = "ル";
	if(__map_reserved.RE != null) _g.setReserved("RE","レ"); else _g.h["RE"] = "レ";
	if(__map_reserved.RO != null) _g.setReserved("RO","ロ"); else _g.h["RO"] = "ロ";
	if(__map_reserved.WA != null) _g.setReserved("WA","ワ"); else _g.h["WA"] = "ワ";
	if(__map_reserved.WO != null) _g.setReserved("WO","ヲ"); else _g.h["WO"] = "ヲ";
	if(__map_reserved.N != null) _g.setReserved("N","ン"); else _g.h["N"] = "ン";
	if(__map_reserved.GA != null) _g.setReserved("GA","ガ"); else _g.h["GA"] = "ガ";
	if(__map_reserved.GI != null) _g.setReserved("GI","ギ"); else _g.h["GI"] = "ギ";
	if(__map_reserved.GU != null) _g.setReserved("GU","グ"); else _g.h["GU"] = "グ";
	if(__map_reserved.GE != null) _g.setReserved("GE","ゲ"); else _g.h["GE"] = "ゲ";
	if(__map_reserved.GO != null) _g.setReserved("GO","ゴ"); else _g.h["GO"] = "ゴ";
	if(__map_reserved.ZA != null) _g.setReserved("ZA","ザ"); else _g.h["ZA"] = "ザ";
	if(__map_reserved.JI != null) _g.setReserved("JI","ジ"); else _g.h["JI"] = "ジ";
	if(__map_reserved.ZU != null) _g.setReserved("ZU","ズ"); else _g.h["ZU"] = "ズ";
	if(__map_reserved.ZE != null) _g.setReserved("ZE","ゼ"); else _g.h["ZE"] = "ゼ";
	if(__map_reserved.ZO != null) _g.setReserved("ZO","ゾ"); else _g.h["ZO"] = "ゾ";
	if(__map_reserved.DA != null) _g.setReserved("DA","ダ"); else _g.h["DA"] = "ダ";
	if(__map_reserved["JI*"] != null) _g.setReserved("JI*","ヂ"); else _g.h["JI*"] = "ヂ";
	if(__map_reserved["ZU*"] != null) _g.setReserved("ZU*","ヅ"); else _g.h["ZU*"] = "ヅ";
	if(__map_reserved.DE != null) _g.setReserved("DE","デ"); else _g.h["DE"] = "デ";
	if(__map_reserved.DO != null) _g.setReserved("DO","ド"); else _g.h["DO"] = "ド";
	if(__map_reserved.BA != null) _g.setReserved("BA","バ"); else _g.h["BA"] = "バ";
	if(__map_reserved.BI != null) _g.setReserved("BI","ビ"); else _g.h["BI"] = "ビ";
	if(__map_reserved.BU != null) _g.setReserved("BU","ブ"); else _g.h["BU"] = "ブ";
	if(__map_reserved.BE != null) _g.setReserved("BE","ベ"); else _g.h["BE"] = "ベ";
	if(__map_reserved.BO != null) _g.setReserved("BO","ボ"); else _g.h["BO"] = "ボ";
	if(__map_reserved.PA != null) _g.setReserved("PA","パ"); else _g.h["PA"] = "パ";
	if(__map_reserved.PI != null) _g.setReserved("PI","ピ"); else _g.h["PI"] = "ピ";
	if(__map_reserved.PU != null) _g.setReserved("PU","プ"); else _g.h["PU"] = "プ";
	if(__map_reserved.PE != null) _g.setReserved("PE","ペ"); else _g.h["PE"] = "ペ";
	if(__map_reserved.PO != null) _g.setReserved("PO","ポ"); else _g.h["PO"] = "ポ";
	if(__map_reserved.KYA != null) _g.setReserved("KYA","キャ"); else _g.h["KYA"] = "キャ";
	if(__map_reserved.KYU != null) _g.setReserved("KYU","キュ"); else _g.h["KYU"] = "キュ";
	if(__map_reserved.KYO != null) _g.setReserved("KYO","キョ"); else _g.h["KYO"] = "キョ";
	if(__map_reserved.SHA != null) _g.setReserved("SHA","シャ"); else _g.h["SHA"] = "シャ";
	if(__map_reserved.SHU != null) _g.setReserved("SHU","シュ"); else _g.h["SHU"] = "シュ";
	if(__map_reserved.SHO != null) _g.setReserved("SHO","ショ"); else _g.h["SHO"] = "ショ";
	if(__map_reserved.CHA != null) _g.setReserved("CHA","チャ"); else _g.h["CHA"] = "チャ";
	if(__map_reserved.CHU != null) _g.setReserved("CHU","チュ"); else _g.h["CHU"] = "チュ";
	if(__map_reserved.CHO != null) _g.setReserved("CHO","チョ"); else _g.h["CHO"] = "チョ";
	if(__map_reserved.NYA != null) _g.setReserved("NYA","ニャ"); else _g.h["NYA"] = "ニャ";
	if(__map_reserved.NYU != null) _g.setReserved("NYU","ニュ"); else _g.h["NYU"] = "ニュ";
	if(__map_reserved.NYO != null) _g.setReserved("NYO","ニョ"); else _g.h["NYO"] = "ニョ";
	if(__map_reserved.HYA != null) _g.setReserved("HYA","ヒャ"); else _g.h["HYA"] = "ヒャ";
	if(__map_reserved.HYU != null) _g.setReserved("HYU","ヒュ"); else _g.h["HYU"] = "ヒュ";
	if(__map_reserved.HYO != null) _g.setReserved("HYO","ヒョ"); else _g.h["HYO"] = "ヒョ";
	if(__map_reserved.MYA != null) _g.setReserved("MYA","ミャ"); else _g.h["MYA"] = "ミャ";
	if(__map_reserved.MYU != null) _g.setReserved("MYU","ミュ"); else _g.h["MYU"] = "ミュ";
	if(__map_reserved.MYO != null) _g.setReserved("MYO","ミョ"); else _g.h["MYO"] = "ミョ";
	if(__map_reserved.RYA != null) _g.setReserved("RYA","リャ"); else _g.h["RYA"] = "リャ";
	if(__map_reserved.RYU != null) _g.setReserved("RYU","リュ"); else _g.h["RYU"] = "リュ";
	if(__map_reserved.RYO != null) _g.setReserved("RYO","リョ"); else _g.h["RYO"] = "リョ";
	if(__map_reserved.GYA != null) _g.setReserved("GYA","ギャ"); else _g.h["GYA"] = "ギャ";
	if(__map_reserved.GYU != null) _g.setReserved("GYU","ギュ"); else _g.h["GYU"] = "ギュ";
	if(__map_reserved.GYO != null) _g.setReserved("GYO","ギョ"); else _g.h["GYO"] = "ギョ";
	if(__map_reserved.JA != null) _g.setReserved("JA","ジャ"); else _g.h["JA"] = "ジャ";
	if(__map_reserved.JU != null) _g.setReserved("JU","ジュ"); else _g.h["JU"] = "ジュ";
	if(__map_reserved.JO != null) _g.setReserved("JO","ジョ"); else _g.h["JO"] = "ジョ";
	if(__map_reserved["JA*"] != null) _g.setReserved("JA*","ヂャ"); else _g.h["JA*"] = "ヂャ";
	if(__map_reserved["JU*"] != null) _g.setReserved("JU*","ヂュ"); else _g.h["JU*"] = "ヂュ";
	if(__map_reserved["JO*"] != null) _g.setReserved("JO*","ヂョ"); else _g.h["JO*"] = "ヂョ";
	if(__map_reserved.BYA != null) _g.setReserved("BYA","ビャ"); else _g.h["BYA"] = "ビャ";
	if(__map_reserved.BYU != null) _g.setReserved("BYU","ビュ"); else _g.h["BYU"] = "ビュ";
	if(__map_reserved.BYO != null) _g.setReserved("BYO","ビョ"); else _g.h["BYO"] = "ビョ";
	if(__map_reserved.PYA != null) _g.setReserved("PYA","ピャ"); else _g.h["PYA"] = "ピャ";
	if(__map_reserved.PYU != null) _g.setReserved("PYU","ピュ"); else _g.h["PYU"] = "ピュ";
	if(__map_reserved.PYO != null) _g.setReserved("PYO","ピョ"); else _g.h["PYO"] = "ピョ";
	$r = _g;
	return $r;
}(this));
urgame_neko_KanaManager.katakanaToRomanji = (function($this) {
	var $r;
	var _g = new haxe_ds_StringMap();
	if(__map_reserved["ア"] != null) _g.setReserved("ア","A"); else _g.h["ア"] = "A";
	if(__map_reserved["イ"] != null) _g.setReserved("イ","I"); else _g.h["イ"] = "I";
	if(__map_reserved["ウ"] != null) _g.setReserved("ウ","U"); else _g.h["ウ"] = "U";
	if(__map_reserved["エ"] != null) _g.setReserved("エ","E"); else _g.h["エ"] = "E";
	if(__map_reserved["オ"] != null) _g.setReserved("オ","O"); else _g.h["オ"] = "O";
	if(__map_reserved["カ"] != null) _g.setReserved("カ","KA"); else _g.h["カ"] = "KA";
	if(__map_reserved["キ"] != null) _g.setReserved("キ","KI"); else _g.h["キ"] = "KI";
	if(__map_reserved["ク"] != null) _g.setReserved("ク","KU"); else _g.h["ク"] = "KU";
	if(__map_reserved["ケ"] != null) _g.setReserved("ケ","KE"); else _g.h["ケ"] = "KE";
	if(__map_reserved["コ"] != null) _g.setReserved("コ","KO"); else _g.h["コ"] = "KO";
	if(__map_reserved["サ"] != null) _g.setReserved("サ","SA"); else _g.h["サ"] = "SA";
	if(__map_reserved["シ"] != null) _g.setReserved("シ","SHI"); else _g.h["シ"] = "SHI";
	if(__map_reserved["ス"] != null) _g.setReserved("ス","SU"); else _g.h["ス"] = "SU";
	if(__map_reserved["セ"] != null) _g.setReserved("セ","SE"); else _g.h["セ"] = "SE";
	if(__map_reserved["ソ"] != null) _g.setReserved("ソ","SO"); else _g.h["ソ"] = "SO";
	if(__map_reserved["タ"] != null) _g.setReserved("タ","TA"); else _g.h["タ"] = "TA";
	if(__map_reserved["チ"] != null) _g.setReserved("チ","CHI"); else _g.h["チ"] = "CHI";
	if(__map_reserved["ツ"] != null) _g.setReserved("ツ","TSU"); else _g.h["ツ"] = "TSU";
	if(__map_reserved["テ"] != null) _g.setReserved("テ","TE"); else _g.h["テ"] = "TE";
	if(__map_reserved["ト"] != null) _g.setReserved("ト","TO"); else _g.h["ト"] = "TO";
	if(__map_reserved["ナ"] != null) _g.setReserved("ナ","NA"); else _g.h["ナ"] = "NA";
	if(__map_reserved["ニ"] != null) _g.setReserved("ニ","NI"); else _g.h["ニ"] = "NI";
	if(__map_reserved["ヌ"] != null) _g.setReserved("ヌ","NU"); else _g.h["ヌ"] = "NU";
	if(__map_reserved["ネ"] != null) _g.setReserved("ネ","NE"); else _g.h["ネ"] = "NE";
	if(__map_reserved["ノ"] != null) _g.setReserved("ノ","NO"); else _g.h["ノ"] = "NO";
	if(__map_reserved["ハ"] != null) _g.setReserved("ハ","HA"); else _g.h["ハ"] = "HA";
	if(__map_reserved["ヒ"] != null) _g.setReserved("ヒ","HI"); else _g.h["ヒ"] = "HI";
	if(__map_reserved["フ"] != null) _g.setReserved("フ","FU"); else _g.h["フ"] = "FU";
	if(__map_reserved["ヘ"] != null) _g.setReserved("ヘ","HE"); else _g.h["ヘ"] = "HE";
	if(__map_reserved["ホ"] != null) _g.setReserved("ホ","HO"); else _g.h["ホ"] = "HO";
	if(__map_reserved["マ"] != null) _g.setReserved("マ","MA"); else _g.h["マ"] = "MA";
	if(__map_reserved["ミ"] != null) _g.setReserved("ミ","MI"); else _g.h["ミ"] = "MI";
	if(__map_reserved["ム"] != null) _g.setReserved("ム","MU"); else _g.h["ム"] = "MU";
	if(__map_reserved["メ"] != null) _g.setReserved("メ","ME"); else _g.h["メ"] = "ME";
	if(__map_reserved["モ"] != null) _g.setReserved("モ","MO"); else _g.h["モ"] = "MO";
	if(__map_reserved["ヤ"] != null) _g.setReserved("ヤ","YA"); else _g.h["ヤ"] = "YA";
	if(__map_reserved["ユ"] != null) _g.setReserved("ユ","YU"); else _g.h["ユ"] = "YU";
	if(__map_reserved["ヨ"] != null) _g.setReserved("ヨ","YO"); else _g.h["ヨ"] = "YO";
	if(__map_reserved["ラ"] != null) _g.setReserved("ラ","RA"); else _g.h["ラ"] = "RA";
	if(__map_reserved["リ"] != null) _g.setReserved("リ","RI"); else _g.h["リ"] = "RI";
	if(__map_reserved["ル"] != null) _g.setReserved("ル","RU"); else _g.h["ル"] = "RU";
	if(__map_reserved["レ"] != null) _g.setReserved("レ","RE"); else _g.h["レ"] = "RE";
	if(__map_reserved["ロ"] != null) _g.setReserved("ロ","RO"); else _g.h["ロ"] = "RO";
	if(__map_reserved["ワ"] != null) _g.setReserved("ワ","WA"); else _g.h["ワ"] = "WA";
	if(__map_reserved["ヲ"] != null) _g.setReserved("ヲ","O/WO"); else _g.h["ヲ"] = "O/WO";
	if(__map_reserved["ン"] != null) _g.setReserved("ン","N"); else _g.h["ン"] = "N";
	if(__map_reserved["ガ"] != null) _g.setReserved("ガ","GA"); else _g.h["ガ"] = "GA";
	if(__map_reserved["ギ"] != null) _g.setReserved("ギ","GI"); else _g.h["ギ"] = "GI";
	if(__map_reserved["グ"] != null) _g.setReserved("グ","GU"); else _g.h["グ"] = "GU";
	if(__map_reserved["ゲ"] != null) _g.setReserved("ゲ","GE"); else _g.h["ゲ"] = "GE";
	if(__map_reserved["ゴ"] != null) _g.setReserved("ゴ","GO"); else _g.h["ゴ"] = "GO";
	if(__map_reserved["ザ"] != null) _g.setReserved("ザ","ZA"); else _g.h["ザ"] = "ZA";
	if(__map_reserved["ジ"] != null) _g.setReserved("ジ","JI"); else _g.h["ジ"] = "JI";
	if(__map_reserved["ズ"] != null) _g.setReserved("ズ","ZU"); else _g.h["ズ"] = "ZU";
	if(__map_reserved["ゼ"] != null) _g.setReserved("ゼ","ZE"); else _g.h["ゼ"] = "ZE";
	if(__map_reserved["ゾ"] != null) _g.setReserved("ゾ","ZO"); else _g.h["ゾ"] = "ZO";
	if(__map_reserved["ダ"] != null) _g.setReserved("ダ","DA"); else _g.h["ダ"] = "DA";
	if(__map_reserved["ヂ"] != null) _g.setReserved("ヂ","JI*"); else _g.h["ヂ"] = "JI*";
	if(__map_reserved["ヅ"] != null) _g.setReserved("ヅ","ZU*"); else _g.h["ヅ"] = "ZU*";
	if(__map_reserved["デ"] != null) _g.setReserved("デ","DE"); else _g.h["デ"] = "DE";
	if(__map_reserved["ド"] != null) _g.setReserved("ド","DO"); else _g.h["ド"] = "DO";
	if(__map_reserved["バ"] != null) _g.setReserved("バ","BA"); else _g.h["バ"] = "BA";
	if(__map_reserved["ビ"] != null) _g.setReserved("ビ","BI"); else _g.h["ビ"] = "BI";
	if(__map_reserved["ブ"] != null) _g.setReserved("ブ","BU"); else _g.h["ブ"] = "BU";
	if(__map_reserved["ベ"] != null) _g.setReserved("ベ","BE"); else _g.h["ベ"] = "BE";
	if(__map_reserved["ボ"] != null) _g.setReserved("ボ","BO"); else _g.h["ボ"] = "BO";
	if(__map_reserved["パ"] != null) _g.setReserved("パ","PA"); else _g.h["パ"] = "PA";
	if(__map_reserved["ピ"] != null) _g.setReserved("ピ","PI"); else _g.h["ピ"] = "PI";
	if(__map_reserved["プ"] != null) _g.setReserved("プ","PU"); else _g.h["プ"] = "PU";
	if(__map_reserved["ペ"] != null) _g.setReserved("ペ","PE"); else _g.h["ペ"] = "PE";
	if(__map_reserved["ポ"] != null) _g.setReserved("ポ","PO"); else _g.h["ポ"] = "PO";
	if(__map_reserved["キャ"] != null) _g.setReserved("キャ","KYA"); else _g.h["キャ"] = "KYA";
	if(__map_reserved["キュ"] != null) _g.setReserved("キュ","KYU"); else _g.h["キュ"] = "KYU";
	if(__map_reserved["キョ"] != null) _g.setReserved("キョ","KYO"); else _g.h["キョ"] = "KYO";
	if(__map_reserved["シャ"] != null) _g.setReserved("シャ","SHA"); else _g.h["シャ"] = "SHA";
	if(__map_reserved["シュ"] != null) _g.setReserved("シュ","SHU"); else _g.h["シュ"] = "SHU";
	if(__map_reserved["ショ"] != null) _g.setReserved("ショ","SHO"); else _g.h["ショ"] = "SHO";
	if(__map_reserved["チャ"] != null) _g.setReserved("チャ","CHA"); else _g.h["チャ"] = "CHA";
	if(__map_reserved["チュ"] != null) _g.setReserved("チュ","CHU"); else _g.h["チュ"] = "CHU";
	if(__map_reserved["チョ"] != null) _g.setReserved("チョ","CHO"); else _g.h["チョ"] = "CHO";
	if(__map_reserved["ニャ"] != null) _g.setReserved("ニャ","NYA"); else _g.h["ニャ"] = "NYA";
	if(__map_reserved["ニュ"] != null) _g.setReserved("ニュ","NYU"); else _g.h["ニュ"] = "NYU";
	if(__map_reserved["ニョ"] != null) _g.setReserved("ニョ","NYO"); else _g.h["ニョ"] = "NYO";
	if(__map_reserved["ヒャ"] != null) _g.setReserved("ヒャ","HYA"); else _g.h["ヒャ"] = "HYA";
	if(__map_reserved["ヒュ"] != null) _g.setReserved("ヒュ","HYU"); else _g.h["ヒュ"] = "HYU";
	if(__map_reserved["ヒョ"] != null) _g.setReserved("ヒョ","HYO"); else _g.h["ヒョ"] = "HYO";
	if(__map_reserved["ミャ"] != null) _g.setReserved("ミャ","MYA"); else _g.h["ミャ"] = "MYA";
	if(__map_reserved["ミュ"] != null) _g.setReserved("ミュ","MYU"); else _g.h["ミュ"] = "MYU";
	if(__map_reserved["ミョ"] != null) _g.setReserved("ミョ","MYO"); else _g.h["ミョ"] = "MYO";
	if(__map_reserved["リャ"] != null) _g.setReserved("リャ","RYA"); else _g.h["リャ"] = "RYA";
	if(__map_reserved["リュ"] != null) _g.setReserved("リュ","RYU"); else _g.h["リュ"] = "RYU";
	if(__map_reserved["リョ"] != null) _g.setReserved("リョ","RYO"); else _g.h["リョ"] = "RYO";
	if(__map_reserved["ギャ"] != null) _g.setReserved("ギャ","GYA"); else _g.h["ギャ"] = "GYA";
	if(__map_reserved["ギュ"] != null) _g.setReserved("ギュ","GYU"); else _g.h["ギュ"] = "GYU";
	if(__map_reserved["ギョ"] != null) _g.setReserved("ギョ","GYO"); else _g.h["ギョ"] = "GYO";
	if(__map_reserved["ジャ"] != null) _g.setReserved("ジャ","JA"); else _g.h["ジャ"] = "JA";
	if(__map_reserved["ジュ"] != null) _g.setReserved("ジュ","JU"); else _g.h["ジュ"] = "JU";
	if(__map_reserved["ジョ"] != null) _g.setReserved("ジョ","JO"); else _g.h["ジョ"] = "JO";
	if(__map_reserved["ヂャ"] != null) _g.setReserved("ヂャ","JA*"); else _g.h["ヂャ"] = "JA*";
	if(__map_reserved["ヂュ"] != null) _g.setReserved("ヂュ","JU*"); else _g.h["ヂュ"] = "JU*";
	if(__map_reserved["ヂョ"] != null) _g.setReserved("ヂョ","JO*"); else _g.h["ヂョ"] = "JO*";
	if(__map_reserved["ビャ"] != null) _g.setReserved("ビャ","BYA"); else _g.h["ビャ"] = "BYA";
	if(__map_reserved["ビュ"] != null) _g.setReserved("ビュ","BYU"); else _g.h["ビュ"] = "BYU";
	if(__map_reserved["ビョ"] != null) _g.setReserved("ビョ","BYO"); else _g.h["ビョ"] = "BYO";
	if(__map_reserved["ピャ"] != null) _g.setReserved("ピャ","PYA"); else _g.h["ピャ"] = "PYA";
	if(__map_reserved["ピュ"] != null) _g.setReserved("ピュ","PYU"); else _g.h["ピュ"] = "PYU";
	if(__map_reserved["ピョ"] != null) _g.setReserved("ピョ","PYO"); else _g.h["ピョ"] = "PYO";
	$r = _g;
	return $r;
}(this));
urgame_Main.main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
