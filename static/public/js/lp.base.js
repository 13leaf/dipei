/*! depei 2013-07-09 */
LP.use("jquery",function(exports){var $=exports;LP.action("logout",function(){LP.ajax("logout","",function(){LP.reload()})}),LP.action("login",function(){LP.panel({url:"/login/?",hideHead:!0,width:518})}),LP.action("reg",function(){LP.panel({url:"/login/?reg=1",hideHead:!0,width:518})});var headerReady=function(){$(".top-r-w").click(function(ev){var target=ev.target;return $(".dropdown-menu").hide(),$(this).find(".dropdown-menu").show(),$(target).closest(".dropdown-menu").length||$(this).hasClass("J_no-stop")}).on("click",".dropdown-menu li",function(){var cookie=$(this).closest(".dropdown-menu").attr("c");if(cookie){var value=$(this).attr("c");LP.setCookie(cookie,value,2592e3),location.href=location.href.replace(/#.*/,"")}}),$(document).click(function(){$(".dropdown-menu").hide()})};$(headerReady),$(".footer .langs").on("click","a",function(){LP.setCookie("lang",$(this).attr("c"),2592e3),location.href=location.href.replace(/#.*/,"")})});