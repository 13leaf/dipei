/*! depei 2013-07-06 */
LP.use(["jquery","validator","autoComplete"],function($,valid,auto){if($("#J_add-lang").click(function(){$(this).prev().clone().insertBefore(this)}),$("#J_lp-form").length){var $sug=$("#J_loc-sug");auto.autoComplete($sug,{availableCssPath:"li",renderData:function(data){var aHtml=["<ul>"],num=10,key=this.key;return $.each(data||[],function(i,v){return i==num?!1:(aHtml.push('<li lid="'+v.id+'">'+[v.name.replace(key,"<em>"+key+"</em>"),'<span class="c999">'+v.parentName+"</span>"].join(" , ")+"</li>"),void 0)}),aHtml.push("</ul>"),aHtml.join("")},onSelect:function($dom,data){$sug.val(data.name),$('input[name="lid"]').val(data.id)},getData:function(cb){var key=this.key;LP.ajax("locsug",{k:decodeURIComponent(key)},function(r){cb(r.data)})}});var val1=valid.formValidator().add(valid.validator("lepei_type").setRequired(_e("乐陪类型必填"))).add(valid.validator("desc").setRequired(_e("乐陪描述必填")).setLength(10,100,_e("乐陪描述必须小于100个字"))).add(valid.validator("agreement").setTipDom("#J_agreement-tip").setRequired(_e("请同意乐陪服务条款")));$("#J_lp-form").submit(function(){return val1.valid(function(){var lang={};$(".J_lang").each(function(){var $sels=$(this).find("select");lang[$sels.eq(0).val()]=$sels.eq(1).val()});var contact={};$(".contact").find("input").each(function(){contact[this.name]=this.value});var data={};data.step=1,data.langs=lang,data.contacts=contact,$.each(["lid","lepei_type","desc"],function(i,v){data[v]=$('[name="'+v+'"]').val()}),LP.ajax("auth",data,function(){window.location.href=window.location.href.replace(/#.*/,"")})}),!1})}else $("#J_p-form").length&&$("#J_p-form").data("submit",function(data){LP.ajax("auth",data,function(){window.location.href=window.location.href.replace(/#.*/,"")})})});