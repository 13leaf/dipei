/*! depei 2013-07-09 */
!!function(host){"use strict";host.LP&&(host._LP=host.LP);var __Cache={},_loader=window.seajs||{},_guid=0,LP=host.LP={config:{debug:!0,imageServer:"localhost/public/img",staServer:"www.lepei.cc"},loader:_loader,use:function(){var arg=Array.prototype.splice.call(arguments,0);_loader.use&&_loader.use.apply(_loader,arg)},isLogin:function(){return!0},guid:function(){return _guid++},reload:function(){window.location.href=window.location.href.replace(/#.*/,"")},getUrl:function(str,type){if(type=type||"sta",str.match(/^http:\/\//))return str;switch(type){case"sta":return"http://"+LP.config.staServer+(LP.config.debug?"/src/":"/public/")+str;case"img":return str=str.replace(/(_\d+-\d+)(_\d+-\d+)?(\.\w+)/,"$1_7-0$3"),str.indexOf(!1)?str:"http://"+LP.config.imageServer+"/"+str}},mix:function(){var o={},len=arguments.length,i=0;for(arguments[len-1]===!0&&(o=arguments[0],i=1,len-=1);len>i;i++)for(var k in arguments[i])o[k]=arguments[i][k];return o},each:function(arr,fn,isObj){if(!isObj&&arr.length){for(var i=0,len=arr.length;len>i;i++)if(fn(i,arr[i])===!1)return}else for(var key in arr)if(fn(key,arr[key])===!1)return},format:function(str,obj){return str.replace(/#\[(.*?)\]/g,function($0,$1){return void 0===obj[$1]||obj[$1]===!1?"":obj[$1]})},url2json:function(str){str.indexOf("?")>0&&(str=str.split("?")[1]);for(var tmp2,tmp3,tmp4,tmp=str.split("&"),result={},i=0,len=tmp.length;len>i;i++)tmp2=tmp[i].split("="),tmp3=result[tmp2[0]],tmp4=decodeURIComponent(tmp2[1]),tmp3?(LP.isArray(tmp3)||(tmp3=[tmp3]),tmp3.push(tmp4),result[tmp2[0]]=tmp3):result[tmp2[0]]=tmp4;return result}},_classObj={},_classReg=/([^\s]+)\]$/,_typeof=function(s){var t=_classObj.toString.call(s);return t=t.match(_classReg),t?t[1].toLowerCase():"unknow"};LP.each(["number","function","object","array","string","boolean"],function(i,type){LP["is"+type.replace(/^\w/,function($1){return $1.toUpperCase()})]=function(s){return _typeof(s)===type}}),__Cache.pageVar={},LP.mix(LP,{setPageVar:function(varObj){__Cache.pageVar=LP.mix(__Cache.pageVar,varObj)},getPageVar:function(key){return __Cache.pageVar[key]}},!0),!!function(){__Cache.actions={};var actionAttr="data-a",actionDataAttr="data-d";LP.mix(LP,{action:function(type,fn){__Cache.actions[type]=fn},bind:document.addEventListener?function(dom,type,fn){dom.addEventListener(type,function(ev){var r=fn.call(dom,ev);r===!1&&(ev.preventDefault(),ev.stopPropagation())},!1)}:function(dom,type,fn){dom.attachEvent("on"+type,function(ev){ev=ev||window.event;var r=fn.call(dom,ev);r===!1&&(ev.returnValue=!1,ev.cancelBubble=!0)})}},!0);var _fireAction=function(type,dom,data){var fn=__Cache.actions[type];if(fn)return fn.call(dom,data)};LP.bind(document,"click",function(ev){for(var target=ev.srcElement||ev.target;target&&target!==document&&!target.getAttribute(actionAttr);)target=target.parentNode;if(target&&target!=document){var action=target.getAttribute(actionAttr);if(action){var aData=target.getAttribute(actionDataAttr)||"",r=LP.url2json(aData);_fireAction(action,target,r)}}})}(),!!function(){LP.ajax=function(){var args=[].splice.call(arguments,0);LP.use("api",function(api){api.ajax.apply(api,args)})}}(),!!function(){LP.mix(LP,{error:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.error.apply(exports,args)})},right:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.right.apply(exports,args)})},alert:function(){return this.warn.apply(this,[].splice.call(arguments,0))},warn:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.warn.apply(exports,args)})},confirm:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.confirm.apply(exports,args)})},panel:function(){var args=[].splice.call(arguments,0);LP.use("panel",function(exports){exports.panel.apply(exports,args)})}},!0)}(),LP.getCookie=function(name){var regVal,doc=document,val=null;return doc.cookie&&(regVal=doc.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)")),null!=regVal&&(val=decodeURIComponent(regVal[2]))),val},LP.setCookie=function(name,value,expire,path,domain,s){if(void 0===document.cookie)return!1;expire=LP.isNumber(expire)?parseInt(expire):0,0>expire&&(value="");var dt=new Date;return dt.setTime(dt.getTime()+1e3*expire),document.cookie=name+"="+encodeURIComponent(value)+(expire?"; expires="+dt.toGMTString():"")+"; path="+(path||"/")+"; domain="+(domain||"")+(s?"; secure":""),!0},LP.removeCookie=function(name,path,domain){return LP.setCookie(name,"",-1,path,domain)},!!function(){var cookieName="lang",i18n=LP.getCookie(cookieName);LP.lang={},LP.loader.config({vars:{locale:i18n},preload:["i18n"]}),host._e=function(str,object){return str=LP.lang[str]||str,LP.format(str,object)}}()}(window);