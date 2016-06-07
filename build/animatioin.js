(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animatioin"] = factory();
	else
		root["animatioin"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*created by zhangcw*/
	'use strict';

	/*
	 *帧动画库类
	 *@constructor
	*/
	var loadImage = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./imageloader\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	var Timeline = __webpack_require__(1);

	//定义初始状态
	var STATE_INITIAL = 0;//大写定义常量
	//开始
	var STATE_START = 1;
	//停止
	var STATE_STOP = 2;

	//同步任务
	var TASK_SYNC = 0;
	//异步任务
	var TASK_ASYNC = 1;

	function next(callback){
		callback && callback();
	}

	function Animation() {
		this.tasekQueue = [];//定义任务链对象
		this.index = 0;//定义索引
		this.timeline = new Timeline();
		this.state = STATE_INITIAL;//定义状态
	}
	/*
	  添加同步任务，预加载图片
	  @param imglist
	*/
	Animation.prototype.loadImage = function (imglist){
	   var taskFn = function(next){
	        loadImage(imglist.slice(),next);//slice对数组深拷贝
	   };
	   var type = TASK_SYNC;

	   return this._add(taskFn,type);
	};

	/*添加异步定时任务，通过定时改变图片背景位置，实现帧动画*/
	Animation.prototype.changePosition = function(ele,positions,imgUrl){
	   var len = positions.length;
	   var taskFn;
	   var type;
	   if (len) {
	       var me = this;
	       taskFn = function(next,time){
	          if (imageUrl) {
	          	ele.style.backgroundImage = 'url('+ imageUrl +')';
	          }
	          //获取当前背景图片索引
	          var index = Math.min(time/me.interval|0,len -1);
	          var position = positions[index].split('');
	          //改变dom对象背景图片位置
	          ele.style.backgroundPosition = position[0] + 'px' + position[1] + 'px';
	          if (index === len -1) {
	          	next();
	          }
	       };
	       type = TASK_ASYNC;
	   }else{
	   	taskFn = next;
	   	type = TASK_SYNC;
	   }

	   return this._add(taskFn,type);
	};

	/*添加一个异步定时任务，通过定时改变image标签的src属性，实现帧动画*/
	Animation.prototype.changeSrc = function (ele,imglist){
	    var len = imglist.length;
	    var taskFn;
	    var type;
	    if (len) {
	    	var me = this;
	    	taskFn = function(next,time){
	        //获取当前图片索引
	    		var index = Math.min(time/me.interval| 0,len -1);
	        //改变image当前图片地址
	    		ele.src =imglist[index];
	    		if (index === len -1) {
	    			next();
	    		}
	    	}
	    	type = TASK_ASYNC;
	    }else{
	    	taskFn = next;
	    	type = TASK_ASYNC;
	    }

	    return this._add(taskFn,type);
	};

	/*高级用法，添加一个异步定时执行的任务*/
	Animation.prototype.enterFrame = function (taskFn){
	   return this._add(taskFn,TASK_ASYNC);
	};

	/*
	*添加同步任务，在上一个任务完成后执行回调函数
	*/
	Animation.prototype.then = function(callback){
	    var taskFn = function(next){
	       callback();
	       next();
	    };
	    var type = TASK_SYN;

	    return this._add(taskFn,type);
	};
	/*开始执行任务，异步定义任务执行的间隔*/
	Animation.prototype.start = function (interval){
	     if (this.state === STATE_START) {
	     	return this;
	     }
	     if (!this.tasekQueue.length) {
	     	return this;
	     }
	     this.state = STATE_START;
	     this.interval = interval;//将interval保存到this实例
	     this._runTask();
	     return this;
	};
	/**
	*添加同步任务，该任务回退到上一个任务
	*实现重复上一个任务
	*/
	Animation.prototype.repeat = function(times){
	   var me= this;//外层保持对listImage写个闭包
	   var taskFn = function(){
	     if (typeof times === 'undefined') {
	     	me.index--;
	     	me._runTask();
	     	return;
	     }
	     if (times) {
	     	tiems--;
	      //回退
	     	me.index--;
	     	me._runTask();
	     }else{
	      //达到重复次数,
	      var task = me.tasekQueue[me.index];
	     	me._next(task);
	     }
	   }
	   var type = TASK_SYNC;

	   return this._add(taskFn,type);
	};

	/*添加同步任务，相当于repeat()更友好的接口，无限循环上一次任务*/
	Animation.prototype.repeatForever = function(){
	    return this.repeat();
	};

	/*
	设置当前任务执行结束后下一个任务开始的等待时间
	*/
	Animation.prototype.wait = function(time){
	      if (this.tasekQueue && this.tasekQueue.length > 0 ) {
	      	this.tasekQueue[this.tasekQueue.length - 1].wait = time;
	      }
	      return this;
	};

	Animation.prototype.pause = function(){
	    if (this.state === STATE_START) {
	    	this.state = STATE_STOP;
	    	this.timeline.stop();
	    	return this;
	    }
	    return this;
	};
	/*执行上一次暂停的异步任务*/
	Animation.prototype.restart = function(){
	    if (this.state === STATE_STOP) {
	    	this.state = STATE_START;
	    	this.timeline.restart();
	    	return this;
	    }
	    return this;
	};
	/*
	释放资源
	*/
	Animation.prototype.dispose = function(){
	   if (this.state!== STATE_INITIAL) {
	   	this.state = STATE_INITIAL;
	   	this.tasekQueue = null;
	   	this.timeline.stop();
	   	this.timeline = null;
	   	return this;
	   }
	   return this;
	};

	/*添加一个任务到任务队列*/
	Animation.prototype._add = function(taskFn,type){
	   this.tasekQueue.push({
	      taskFn : taskFn,
	      type : type 
	   });

	   return this;//链式调用
	}

	/*执行任务*/
	Animation.prototype._runTask = function(){
	   if (!this.tasekQueue || this.state!== STATE_START) {
	   	return;
	   }
	   //任务执行完毕
	   if (this.index === this.tasekQueue.length) {
	   	this.dispose();
	   	return;
	   }
	   //获取任务链上的当前任务
	   var task = this.tasekQueue[this.index];
	   if (task.type === TASK_ASYNC) {
	   	this._syncTask(task);
	   }else{
	   	this._asyncTask(task);
	   }
	};

	/*同步任务*/
	Animation.prototype._syncTask = function(task){
	    var me = this;
	    var next = function(){
	      me._next(task);
	    };

	    var taskFn = task.taskFn;  
	    taskFn(next);
	};

	/*异步任务*/
	Animation.prototype._asyncTask = function(task){
	     //定义每一帧执行的回调函数
	     var enterFrame = function(time){
	        var taskFn = task.taskFn;
	        var next = function(){
	          //停止当前任务
	          me.timeline.stop();
	          //执行下一个任务
	          me._next(task);
	        };
	       taskFn(next,time);
	     };   

	     this.timeline.onenterframe = enterFrame;
	     this.timeline.start(this.interval);
	}

	/*切换到下一个任务*/
	Animation.prototype._next = function(task){
	   this.index++;
	   var me = this;
	   task.wait ? setTimeout(function(){
	   	me._runTask();
	   },task.wait) : this._runTask();
	}

	module.exports = function(){
		return new Animation();
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	var DEFAULT_INTERVAL = 1000/60;
	var STATE_INITIAL = 0;
	var STATE_START = 1;
	var STATE_STOP = 2;

	var requestAnimationFrame = (function () {
		return window.requestAnimationFrame ||
		       window.webkitRequestAnimationFrame ||
		       function(callback){
		       	return window.setTimeout(callback,callback.interval || DEFAULT_INTERVAL);
		       };
	})();

	var cancelAnimationFrame = (function(){
	     return window.cancelAnimationFrame ||
	            window.webkitRequestAnimationFrame ||
	            function(id){
	                return window.clearTimeout(id);
	            };
	})();

	/*时间轴类*/
	function Timeline(){
	    this.animationHandler = 0;
	    this.state = STATE_START;
	}

	/*时间轴上每一次回调执行的函数*/
	Timeline.prototype.onenterFrame = function(time) {
		
	};

	/*动画开始*/
	Timeline.prototype.start = function(interval){
	    if (this.sate === STATE_START)
	    	return;
	    this.state = STATE_START;

	    this.interval = interval || DEFAULT_INTERVAL;
	    startTimeline(this,+new Date());
	};

	/*动画停止*/
	Timeline.prototype.stop = function(){
	    if (this.state !== STATE_START) {
	    	return;
	    }
	    this.state = STATE_STOP;

	    if (this.startTime) {
	    	this.dur = +new Date() - this.startTime;
	    }
	    cancelAnimationFrame(this.animationHandler);
	};

	/*重新开始动画*/
	Timeline.prototype.restart = function(){
	   if (this.state === STATE_START) {
	   	  return;
	   }
	   if (!this.dur || !this.interval) {
	   	return;
	   }
	   this.state = STATE_START;

	   startTimeline(this,+new Date() - this.dur);
	};

	/*时间轴动画启动函数*/
	function startTimeline(timeline,startTimeline){
	    
	    timeline.startTime = startTime;
	    nextTick.interval = timeline.interval;

	    //记录上一次回调时间戳
	    var lastTick = +new Date();
	    nextTick();

	    /*每一帧执行的函数*/
	    function nextTick(){
	         var now = +new Date();

	         timeline.animationHandler = requestAnimationFrame(nextTick);
	         
	         if (now - lastTick>=timeline.interval) {
	         	timeline.onenterFrame(now - startTime);
	         	lastTick = now;
	         }
	    }
	}

	module.exports = Timeline;

/***/ }
/******/ ])
});
;