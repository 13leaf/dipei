/*! depei 2013-07-11 */
!function(d){var e={},f=/\/(?:\d+\.){1,2}\d+\/|\D(?:\d+\.){1,2}\d+[^/]*\.(?:js|css)\W?/;d.on("fetch",function(a){if(a=a.uri,f.test(a)){var b=a.replace(f,"{version}"),b=e[b]||(e[b]=[]);-1===g(b,a)&&b.push(a),1<b.length&&d.log("This module has multiple versions:\n"+b.join("\n"),"warn")}});var g=[].indexOf?function(a,b){return a.indexOf(b)}:function(a,b){for(var c=0;c<a.length;c++)if(a[c]===b)return c;return-1};define(d.config.data.dir+"plugin-warning",[],{})}(seajs);