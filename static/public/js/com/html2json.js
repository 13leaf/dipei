/*! depei 2013-07-06 */
define(function(require,exports){exports.html2json=function(){var Util={div:null,attrs:"id,name,style,class,value,src,href,width,height,title,type".split(","),getJson:function(childNodes,attrs,length){for(var result=[],i=0,len=childNodes.length;len>i;i++){var item=childNodes[i];if(3==item.nodeType)result.push({text:item.nodeValue});else if(1==item.nodeType){var obj={tag:item.nodeName.toLowerCase(),attr:{}},flag=!1;if(attrs)for(var j=0;length>j;j++)if("style"==attrs[j]){var sStyle=item.getAttribute("style").cssText;sStyle&&(obj.attr.style=sStyle,flag=!0)}else{var attrNode=item.attributes[attrs[j]];if(attrNode&&2===attrNode.nodeType){var value=attrNode.value;value&&"null"!=value&&(obj.attr[attrs[j]]=value,flag=!0)}}else if(item.attributes.length)for(var n=0,l=item.attributes.length;l>n;n++){var value=item.attributes[n].value;value&&(flag=!0,obj.attr[item.attributes[n].name]=value)}if(flag||delete obj.attr,item.childNodes.length<1){var text=item.innerText;text&&(obj.text=item.innerText)}else obj.child=Util.getJson(item.childNodes,attrs,length);result.push(obj)}}return result}},html2json=function(text,stringify,attrs){Util.div||(Util.div=document.createElement("div")),Util.div.innerHTML=text;var allAttrs,len,ie6=/MSIE 6/.test(navigator.userAgent);if(ie6){allAttrs=Util.attrs,Object.prototype.toString.call(stringify).indexOf("Array")&&(attrs=stringify),attrs=attrs||[];for(var i=0,len=attrs.length;len>i;i++)allAttrs.push(attrs[i]);len=allAttrs.length}var result=Util.getJson(Util.div.childNodes,allAttrs,len);return result};return html2json}()});