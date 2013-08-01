/*! depei 2013-07-11 */
!function(global,undefined){function isType(type){return function(obj){return Object.prototype.toString.call(obj)==="[object "+type+"]"}}function hasOwn(obj,key){return obj&&obj.hasOwnProperty(key)}function dirname(path){return path.match(DIRNAME_RE)[0]}function realpath(path){for(path=path.replace(DOT_RE,"/"),path=path.replace(MULTIPLE_SLASH_RE,"$1/");path.match(DOUBLE_DOT_RE);)path=path.replace(DOUBLE_DOT_RE,"/");return path}function normalize(uri){return uri=realpath(uri),HASH_END_RE.test(uri)?uri=uri.slice(0,-1):URI_END_RE.test(uri)||(uri+=".js"),uri.replace(":80/","/")}function parseAlias(id){var alias=configData.alias;return hasOwn(alias,id)?alias[id]:id}function parsePaths(id){var m,paths=configData.paths;return paths&&(m=id.match(PATHS_RE))&&hasOwn(paths,m[1])&&(id=paths[m[1]]+m[2]),id}function parseVars(id){var vars=configData.vars;return vars&&id.indexOf("{")>-1&&(id=id.replace(VARS_RE,function(m,key){return hasOwn(vars,key)?vars[key]:m})),id}function parseMap(uri){var map=configData.map,ret=uri;if(map)for(var i=0;i<map.length;i++){var rule=map[i];if(ret=isFunction(rule)?rule(uri)||uri:uri.replace(rule[0],rule[1]),ret!==uri)break}return ret}function isAbsolute(id){return ABSOLUTE_RE.test(id)}function isRelative(id){return RELATIVE_RE.test(id)}function isRoot(id){return ROOT_RE.test(id)}function addBase(id,refUri){var ret;return ret=isAbsolute(id)?id:isRelative(id)?dirname(refUri)+id:isRoot(id)?(cwd.match(ROOT_DIR_RE)||["/"])[0]+id.substring(1):configData.base+id}function id2Uri(id,refUri){if(!id)return"";var isRel=isRelative(id);return id=parseAlias(id),id=parsePaths(id),id=parseVars(id),id=addBase(id,isRel&&refUri?refUri:configData.base),id=normalize(id),id=parseMap(id)}function getScriptAbsoluteSrc(node){return node.hasAttribute?node.src:node.getAttribute("src",4)}function request(url,callback,charset){var isCSS=IS_CSS_RE.test(url),node=doc.createElement(isCSS?"link":"script");if(charset){var cs=isFunction(charset)?charset(url):charset;cs&&(node.charset=cs)}addOnload(node,callback,isCSS),isCSS?(node.rel="stylesheet",node.href=url):(url=parseVars(url),node.async=!0,node.src=url),currentlyAddingScript=node,baseElement?head.insertBefore(node,baseElement):head.appendChild(node),currentlyAddingScript=undefined}function addOnload(node,callback,isCSS){var missingOnload=isCSS&&(isOldWebKit||!("onload"in node));return missingOnload?(setTimeout(function(){pollCss(node,callback)},1),void 0):(node.onload=node.onerror=node.onreadystatechange=function(){READY_STATE_RE.test(node.readyState)&&(node.onload=node.onerror=node.onreadystatechange=null,isCSS||configData.debug||head.removeChild(node),node=undefined,callback())},void 0)}function pollCss(node,callback){var isLoaded,sheet=node.sheet;if(isOldWebKit)sheet&&(isLoaded=!0);else if(sheet)try{sheet.cssRules&&(isLoaded=!0)}catch(ex){"NS_ERROR_DOM_SECURITY_ERR"===ex.name&&(isLoaded=!0)}setTimeout(function(){isLoaded?callback():pollCss(node,callback)},20)}function getCurrentScript(){if(currentlyAddingScript)return currentlyAddingScript;if(interactiveScript&&"interactive"===interactiveScript.readyState)return interactiveScript;for(var scripts=head.getElementsByTagName("script"),i=scripts.length-1;i>=0;i--){var script=scripts[i];if("interactive"===script.readyState)return interactiveScript=script}}function parseDependencies(code){var ret=[];return code.replace(SLASH_RE,"").replace(REQUIRE_RE,function(m,m1,m2){m2&&ret.push(m2)}),ret}function Module(uri){this.uri=uri,this.dependencies=[],this.exports=null,this.status=0}function resolve(ids,refUri){if(isArray(ids)){for(var ret=[],i=0;i<ids.length;i++)ret[i]=resolve(ids[i],refUri);return ret}var data={id:ids,refUri:refUri};return emit("resolve",data),data.uri||id2Uri(data.id,refUri)}function use(uris,callback){isArray(uris)||(uris=[uris]),load(uris,function(){for(var exports=[],i=0;i<uris.length;i++)exports[i]=exec(cachedModules[uris[i]]);callback&&callback.apply(global,exports)})}function load(uris,callback){var unloadedUris=getUnloadedUris(uris);if(0===unloadedUris.length)return callback(),void 0;emit("load",unloadedUris);for(var len=unloadedUris.length,remain=len,i=0;len>i;i++)!function(uri){function loadWaitings(cb){cb||(cb=done);var waitings=getUnloadedUris(mod.dependencies);0===waitings.length?cb():isCircularWaiting(mod)?(printCircularLog(circularStack),circularStack.length=0,cb(!0)):(waitingsList[uri]=waitings,load(waitings,cb))}function done(circular){!circular&&mod.status<STATUS_LOADED&&(mod.status=STATUS_LOADED),0===--remain&&callback()}var mod=cachedModules[uri];mod.dependencies.length?loadWaitings(function(circular){function cb(){done(circular)}mod.status<STATUS_SAVED?fetch(uri,cb):cb()}):mod.status<STATUS_SAVED?fetch(uri,loadWaitings):done()}(unloadedUris[i])}function fetch(uri,callback){function onRequested(){delete fetchingList[requestUri],fetchedList[requestUri]=!0,anonymousModuleData&&(save(uri,anonymousModuleData),anonymousModuleData=undefined);var fn,fns=callbackList[requestUri];for(delete callbackList[requestUri];fn=fns.shift();)fn()}cachedModules[uri].status=STATUS_FETCHING;var data={uri:uri};emit("fetch",data);var requestUri=data.requestUri||uri;if(fetchedList[requestUri])return callback(),void 0;if(fetchingList[requestUri])return callbackList[requestUri].push(callback),void 0;fetchingList[requestUri]=!0,callbackList[requestUri]=[callback];var charset=configData.charset;emit("request",data={uri:uri,requestUri:requestUri,callback:onRequested,charset:charset}),data.requested||request(data.requestUri,onRequested,charset)}function define(id,deps,factory){1===arguments.length&&(factory=id,id=undefined),!isArray(deps)&&isFunction(factory)&&(deps=parseDependencies(factory.toString()));var data={id:id,uri:resolve(id),deps:deps,factory:factory};if(!data.uri&&doc.attachEvent){var script=getCurrentScript();script?data.uri=script.src:log("Failed to derive: "+factory)}emit("define",data),data.uri?save(data.uri,data):anonymousModuleData=data}function save(uri,meta){var mod=getModule(uri);mod.status<STATUS_SAVED&&(mod.id=meta.id||uri,mod.dependencies=resolve(meta.deps||[],uri),mod.factory=meta.factory,mod.factory!==undefined&&(mod.status=STATUS_SAVED))}function exec(mod){function resolveInThisContext(id){return resolve(id,mod.uri)}function require(id){return exec(cachedModules[resolveInThisContext(id)])}if(!mod)return null;if(mod.status>=STATUS_EXECUTING)return mod.exports;mod.status=STATUS_EXECUTING,require.resolve=resolveInThisContext,require.async=function(ids,callback){return use(resolveInThisContext(ids),callback),require};var factory=mod.factory,exports=isFunction(factory)?factory(require,mod.exports={},mod):factory;return mod.exports=exports===undefined?mod.exports:exports,mod.status=STATUS_EXECUTED,mod.exports}function getModule(uri){return cachedModules[uri]||(cachedModules[uri]=new Module(uri))}function getUnloadedUris(uris){for(var ret=[],i=0;i<uris.length;i++){var uri=uris[i];uri&&getModule(uri).status<STATUS_LOADED&&ret.push(uri)}return ret}function isCircularWaiting(mod){var waitings=waitingsList[mod.uri]||[];if(0===waitings.length)return!1;if(circularStack.push(mod.uri),isOverlap(waitings,circularStack))return cutWaitings(waitings),!0;for(var i=0;i<waitings.length;i++)if(isCircularWaiting(cachedModules[waitings[i]]))return!0;return circularStack.pop(),!1}function isOverlap(arrA,arrB){for(var i=0;i<arrA.length;i++)for(var j=0;j<arrB.length;j++)if(arrB[j]===arrA[i])return!0;return!1}function cutWaitings(waitings){for(var uri=circularStack[0],i=waitings.length-1;i>=0;i--)if(waitings[i]===uri){waitings.splice(i,1);break}}function printCircularLog(stack){stack.push(stack[0]),log("Circular dependencies: "+stack.join(" -> "))}function preload(callback){var preloadMods=configData.preload,len=preloadMods.length;len?use(resolve(preloadMods),function(){preloadMods.splice(0,len),preload(callback)}):callback()}function config(data){for(var key in data){var curr=data[key];curr&&"plugins"===key&&(key="preload",curr=plugin2preload(curr));var prev=configData[key];if(prev&&isObject(prev))for(var k in curr)prev[k]=curr[k];else isArray(prev)?curr=prev.concat(curr):"base"===key&&(curr=normalize(addBase(curr+"/"))),configData[key]=curr}return emit("config",data),seajs}function plugin2preload(arr){for(var name,ret=[];name=arr.shift();)ret.push(loaderDir+"plugin-"+name);return ret}var _seajs=global.seajs;if(!_seajs||!_seajs.version){var seajs=global.seajs={version:"2.0.0b3"},isObject=isType("Object"),isArray=Array.isArray||isType("Array"),isFunction=isType("Function"),log=seajs.log=function(msg,type){global.console&&(type||configData.debug)&&console[type||(type="log")]&&console[type](msg)},eventsCache=seajs.events={};seajs.on=function(event,callback){if(!callback)return seajs;var list=eventsCache[event]||(eventsCache[event]=[]);return list.push(callback),seajs},seajs.off=function(event,callback){if(!event&&!callback)return seajs.events=eventsCache={},seajs;var list=eventsCache[event];if(list)if(callback)for(var i=list.length-1;i>=0;i--)list[i]===callback&&list.splice(i,1);else delete eventsCache[event];return seajs};var emit=seajs.emit=function(event,data){var fn,list=eventsCache[event];if(list)for(list=list.slice();fn=list.shift();)fn(data);return seajs},DIRNAME_RE=/[^?#]*\//,DOT_RE=/\/\.\//g,MULTIPLE_SLASH_RE=/([^:\/])\/\/+/g,DOUBLE_DOT_RE=/\/[^/]+\/\.\.\//g,URI_END_RE=/\?|\.(?:css|js)$|\/$/,HASH_END_RE=/#$/,PATHS_RE=/^([^/:]+)(\/.+)$/,VARS_RE=/{([^{]+)}/g,ABSOLUTE_RE=/(?:^|:)\/\/./,RELATIVE_RE=/^\./,ROOT_RE=/^\//,ROOT_DIR_RE=/^.*?\/\/.*?\//,doc=document,loc=location,cwd=dirname(loc.href),scripts=doc.getElementsByTagName("script"),loaderScript=doc.getElementById("seajsnode")||scripts[scripts.length-1],loaderDir=dirname(getScriptAbsoluteSrc(loaderScript))||cwd;seajs.cwd=function(val){return val?cwd=realpath(val+"/"):cwd};var currentlyAddingScript,interactiveScript,anonymousModuleData,head=doc.getElementsByTagName("head")[0]||doc.documentElement,baseElement=head.getElementsByTagName("base")[0],IS_CSS_RE=/\.css(?:\?|$)/i,READY_STATE_RE=/^(?:loaded|complete|undefined)$/,isOldWebKit=1*navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/,"$1")<536,REQUIRE_RE=/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,SLASH_RE=/\\\\/g,cachedModules=seajs.cache={},fetchingList={},fetchedList={},callbackList={},waitingsList={},STATUS_FETCHING=1,STATUS_SAVED=2,STATUS_LOADED=3,STATUS_EXECUTING=4,STATUS_EXECUTED=5;Module.prototype.destroy=function(){delete cachedModules[this.uri],delete fetchedList[this.uri]};var circularStack=[];seajs.use=function(ids,callback){return preload(function(){use(resolve(ids),callback)}),seajs},seajs.resolve=id2Uri,global.define=define,Module.load=use;var configData=config.data={base:function(){var ret=loaderDir,m=ret.match(/^(.+?\/)(?:seajs\/)+(?:\d[^/]+\/)?$/);return m&&(ret=m[1]),ret}(),charset:"utf-8",preload:[]};seajs.config=config,config({plugins:function(){var ret,str=loc.search.replace(/(seajs-\w+)(&|$)/g,"$1=1$2");return str+=" "+doc.cookie,str.replace(/seajs-(\w+)=1/g,function(m,name){(ret||(ret=[])).push(name)}),ret}()});var dataConfig=loaderScript.getAttribute("data-config"),dataMain=loaderScript.getAttribute("data-main");if(dataConfig&&configData.preload.push(dataConfig),dataMain&&seajs.use(dataMain),_seajs&&_seajs.args)for(var methods=["define","config","use"],args=_seajs.args,g=0;g<args.length;g+=2)seajs[methods[args[g]]].apply(seajs,args[g+1])}}(this);
seajs.config( {"shim":{"jquery":{"src":"../js/jquery/jquery-1.8.3.min.js?_=1371394223","exports":"jQuery"},"uploadify":{"src":"../js/uploadify/jquery.uploadify-3.1.min.js?_=1340542126","deps":["jquery","../js/uploadify/uploadify.css?_=1337887860"]},"jcrop":{"src":"../js/jcrop/jquery.Jcrop.min.js?_=1337887860","deps":["jquery","../js/jcrop/jquery.Jcrop.css?_=1337887860"]},"datepicker_local":{"src":"../js/datepicker/i18n/jquery.ui.datepicker-{locale}.js?_=","deps":["jquery"]},"datepicker":{"src":"../js/datepicker/jquery.ui.datepicker.js?_=1371394246","deps":["jquery","../js/datepicker/jquery-ui-datepicker.css?_=1371116537","datepicker_local"]},"ueditor":{"src":"../js/ueditor/ueditor.all.js?_=1371555185","deps":["../js/ueditor/ueditor.config.js?_=1372001838"],"exports":"UE"}},"alias":{"i18n":"../js/i18n/{locale}.js?_=","api":"../js/api.js?_=1373476814","util":"../js/util/util.js?_=1373390136","panel":"../js/panel/panel.js?_=1373476329","autoComplete":"../js/autocomplete/autoComplete.js?_=1372164246","validator":"../js/validator/validator.js?_=1372077061","html2json":"../js/com/html2json.js?_=1372238887"}});
/*! depei 2013-07-11 */
!function(a,d){function c(b){if(b){b=b.shim;for(var a in b)!function(b){b.deps&&define(b.src,b.deps),define(a,[b.src],function(){var a=b.exports;return"function"==typeof a?a():"string"==typeof a?d[a]:a})}(b[a])}}a.on("config",c),c(a.config.data)}(seajs,"undefined"==typeof global?this:global);
/*! depei 2013-07-11 */
!!function(host){"use strict";host.LP&&(host._LP=host.LP);var __Cache={},_loader=window.seajs||{},_guid=0,LP=host.LP={config:{debug:!0,imageServer:"localhost/public/img",staServer:"www.lepei.cc"},loader:_loader,use:function(){var arg=Array.prototype.splice.call(arguments,0);_loader.use&&_loader.use.apply(_loader,arg)},isLogin:function(){return!0},guid:function(){return _guid++},reload:function(){window.location.href=window.location.href.replace(/#.*/,"")},getUrl:function(str,type){if(type=type||"sta",str.match(/^http:\/\//))return str;switch(type){case"sta":return"http://"+LP.config.staServer+(LP.config.debug?"/src/":"/public/")+str;case"img":return str=str.replace(/(_\d+-\d+)(_\d+-\d+)?(\.\w+)/,"$1_7-0$3"),str.indexOf(!1)?str:"http://"+LP.config.imageServer+"/"+str}},mix:function(){var o={},len=arguments.length,i=0;for(arguments[len-1]===!0&&(o=arguments[0],i=1,len-=1);len>i;i++)for(var k in arguments[i])o[k]=arguments[i][k];return o},each:function(arr,fn,isObj){if(!isObj&&arr.length){for(var i=0,len=arr.length;len>i;i++)if(fn(i,arr[i])===!1)return}else for(var key in arr)if(fn(key,arr[key])===!1)return},format:function(str,obj){return str.replace(/#\[(.*?)\]/g,function($0,$1){return void 0===obj[$1]||obj[$1]===!1?"":obj[$1]})},url2json:function(str){str.indexOf("?")>0&&(str=str.split("?")[1]);for(var tmp2,tmp3,tmp4,tmp=str.split("&"),result={},i=0,len=tmp.length;len>i;i++)tmp2=tmp[i].split("="),tmp3=result[tmp2[0]],tmp4=decodeURIComponent(tmp2[1]),tmp3?(LP.isArray(tmp3)||(tmp3=[tmp3]),tmp3.push(tmp4),result[tmp2[0]]=tmp3):result[tmp2[0]]=tmp4;return result}},_classObj={},_classReg=/([^\s]+)\]$/,_typeof=function(s){var t=_classObj.toString.call(s);return t=t.match(_classReg),t?t[1].toLowerCase():"unknow"};LP.each(["number","function","object","array","string","boolean"],function(i,type){LP["is"+type.replace(/^\w/,function($1){return $1.toUpperCase()})]=function(s){return _typeof(s)===type}}),__Cache.pageVar={},LP.mix(LP,{setPageVar:function(varObj){__Cache.pageVar=LP.mix(__Cache.pageVar,varObj)},getPageVar:function(key){return __Cache.pageVar[key]}},!0),!!function(){__Cache.actions={};var actionAttr="data-a",actionDataAttr="data-d";LP.mix(LP,{action:function(type,fn){__Cache.actions[type]=fn},bind:document.addEventListener?function(dom,type,fn){dom.addEventListener(type,function(ev){var r=fn.call(dom,ev);r===!1&&(ev.preventDefault(),ev.stopPropagation())},!1)}:function(dom,type,fn){dom.attachEvent("on"+type,function(ev){ev=ev||window.event;var r=fn.call(dom,ev);r===!1&&(ev.returnValue=!1,ev.cancelBubble=!0)})}},!0);var _fireAction=function(type,dom,data){var fn=__Cache.actions[type];if(fn)return fn.call(dom,data)};LP.bind(document,"click",function(ev){for(var target=ev.srcElement||ev.target;target&&target!==document&&!target.getAttribute(actionAttr);)target=target.parentNode;if(target&&target!=document){var action=target.getAttribute(actionAttr);if(action){var aData=target.getAttribute(actionDataAttr)||"",r=LP.url2json(aData);_fireAction(action,target,r)}}})}(),!!function(){LP.ajax=function(){var args=[].splice.call(arguments,0);LP.use("api",function(api){api.ajax.apply(api,args)})}}(),!!function(){LP.mix(LP,{error:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.error.apply(exports,args)})},right:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.right.apply(exports,args)})},alert:function(){return this.warn.apply(this,[].splice.call(arguments,0))},warn:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.warn.apply(exports,args)})},confirm:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.confirm.apply(exports,args)})},panel:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.panel.apply(exports,args)})}},!0)}(),LP.getCookie=function(name){var regVal,doc=document,val=null;return doc.cookie&&(regVal=doc.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)")),null!=regVal&&(val=decodeURIComponent(regVal[2]))),val},LP.setCookie=function(name,value,expire,path,domain,s){if(void 0===document.cookie)return!1;expire=LP.isNumber(expire)?parseInt(expire):0,0>expire&&(value="");var dt=new Date;return dt.setTime(dt.getTime()+1e3*expire),document.cookie=name+"="+encodeURIComponent(value)+(expire?"; expires="+dt.toGMTString():"")+"; path="+(path||"/")+"; domain="+(domain||"")+(s?"; secure":""),!0},LP.removeCookie=function(name,path,domain){return LP.setCookie(name,"",-1,path,domain)},!!function(){var cookieName="lang",i18n=LP.getCookie(cookieName);LP.lang={},LP.loader.config({vars:{locale:i18n},preload:["i18n"]}),host._e=function(str,object){return str=LP.lang[str]||str,LP.format(str,object)}}()}(window);
/*! depei 2013-07-11 */
LP.use("jquery",function(exports){var $=exports;LP.action("logout",function(){LP.ajax("logout","",function(){LP.reload()})}),LP.action("login",function(){LP.panel({url:"/login/?",hideHead:!0,width:518})}),LP.action("reg",function(){LP.panel({url:"/login/?reg=1",hideHead:!0,width:518})});var headerReady=function(){$(".top-r-w").click(function(ev){var target=ev.target;return $(".dropdown-menu").hide(),$(this).find(".dropdown-menu").show(),$(target).closest(".dropdown-menu").length||$(this).hasClass("J_no-stop")}).on("click",".dropdown-menu li",function(){var cookie=$(this).closest(".dropdown-menu").attr("c");if(cookie){var value=$(this).attr("c");LP.setCookie(cookie,value,2592e3),location.href=location.href.replace(/#.*/,"")}}),$(document).click(function(){$(".dropdown-menu").hide()})};$(headerReady),$(".footer .langs").on("click","a",function(){LP.setCookie("lang",$(this).attr("c"),2592e3),location.href=location.href.replace(/#.*/,"")})});