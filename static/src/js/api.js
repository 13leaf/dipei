/*
 * api model
 */
define(function( require , exports , model ){
    var $ = require('jquery');
    // 公开的API
    // 签名：ajax = function ( api, data, successHandler, errorHandler, completeHandler ) {}
    // 备注：POST操作默认要登录，GET操作默认不需要登录
    //       默认是POST操作

    // 配置
    var _api = {
        // u:   api url
        // m:   api desc

        // 每一个Config可选参数：
        // data      : {} // 需要提交的参数，会与转递进来的值进行mix操作，所以这里可以填一些默认值
        // dataType  : 'json' // 返回的数据类型
        // alertOnError: true // 如果出错了，是否允许弹出错误信息
        // method    : 'POST' // 提交类型
        // needLogin : false  // 是否需要登录，如果需要登录，则会弹出登录框
        // timeout   : 10000  // 超时时间
        // cache     : true   // 是否需要使用jquery的ajax cache功能
        // global    : false  // 是否需要出错时  抛出给外部直到document上
        login        : {u:'/login/', m:_e('登录') , alertOnError: false , needLogin: false}
        ,logout      : {u:'/login/logout/', m:_e('登出') , alertOnError: false }
        , reg        : {u:'/reg/', m:_e('注册') , alertOnError: false , needLogin: false}

        // 位置接口
        // 位置检索
        // k :
        , locsug    : {u: '/ajax/locSearch/k/#[k]' , m: _e('检索地点') , alertOnError: false , needLogin: false}
        , countrysug: {u: '/ajax/countrySearch/k/#[k]' , m: _e('国家地点') , alertOnError: false , needLogin: false}
        , citySearch: {u:'/ajax/citysearch/k/#[k]', m: _e('城市搜索'), alertOnError: false , needLogin: false}
        , saveProfile: {u: '/profile/setting/' , m: _e('保存个人信息') }
        , auth      : {u: '/auth/' , m: _e('小鲜认证') }
        , hasloc    : {u: '/ajax/haslocation/' , data:{n:''} , alertOnError: false}
        // corpimage
        // upFile
        // w
        // h
        // x
        // y
        , corpimage : {u: '/image/crop/' , data:{upFile:"",w:"",h:"",x:"",y:""} ,  m: _e('裁剪图片') }
        , upload    : {u: '/image/upload/', data:{upFile:''} , m: _e('上传图片')}

        , uploadUserPhoto: {u: '/image/uploadUserPhoto/' , data:{upFile:''} , m:_e('上传用户图片') }
        , removeUserPhoto: {u: '/image/removeUserPhoto/' , data:{pname:''} , m:_e('上传用户图片') }

        , avatar    : {u: '/image/avatar/' , data:{upFile:"",w:"",h:"",x:"",y:""} , m : _e('保存头像') }
        // project interface
        , removeProject : {u:'/profile/removeProject/' , data:{pid:''} , m:_e("删除项目")}
        , addProject    : {u:'/profile/addProject/' , data:{} , m:_e("添加项目")}
        , updateProject : {u:'/profile/updateProject/' , data:{} , m:_e("更新项目")}

        // personal setting
        , setting       : {u:'/profile/setting/' , data:{} , m:_e("更新设置")}

        , resetPW       : {u:'/profile/resetPW/' , data: {} , m:_e('更改密码') , alertOnError: false}
        // user reg info check
        , validate      : {u:'/ajax/validate/' , data:{model:"User",field:"name" , value:'' , context:''} , m: _e('校验') , alertOnError: false}


        // 喜欢项目
        // 1: location
        // 2: post
        // 3: user
        , fav           : {u:'/ajax/like/' , data:{tp:2,oid:''} , m:_e("收藏")}
        , unfav         : {u:'/ajax/unlike/' , data:{tp:2,oid:''} , m:_e("取消收藏")}

        // post
        , addPost       : {u:'/post/add/' , m:_e("发布帖子")}
        , removePost       : {u:'/post/remove/' , m:_e("删除帖子")}
        // reply
        , getReply      : {u:'/post/getReplies/' , data:{pid:0}}
        , addReply      : {u:'/post/addReply/' , data:{pid:0}}
        , delReply      : {u:'/post/removeReply/' , data:{id:0} , m: _e('删除评论')}
        

        // message api
        , delMsg        : {u:'/profile/removeMessage/', data:{id:0} , m: _e('删除私信')}
        , addMsg        : {u:'/profile/sendMessage/', data:{tid:0,content:''} , m: _e('发送私信')}
        , delUserMsg    : {u:'/profile/removeUserMessage/' , data: {tid:0} , m: _e('删除私信')}


        , newMsg        : {u:'/profile/newMsg/' , data:{} }
    };

    // 内部API
    var _unloginErrorNum = -2000;
    var _needRefresh     = {};

    function _isFormatUrl ( url ){
        return !!/#\[.*\]/.test( url );
    }
    function _load ( api , data , success , error , complete ) {
        if ( typeof data == "function" ) {
            return arguments.callee(api, {} , data, success, error);
        }
        if( typeof data == "string" ){
            data = LP.query2json( data );
        }
        var ajaxConfig = _api[api];
        if ( !ajaxConfig ) { return console && console.error( api + ' api is not exists!' ); }

        var method = ajaxConfig.method || "";
        if ( method == "")  {
            var res = /get/i.exec(api);
            method = (res && res.index == 0) ? "GET" : "POST";
        } else {
            method = method.toUpperCase();
        }

        error = error || ajaxConfig.error;

        data = LP.mix( ajaxConfig.data || {} , data );
        var doAjax = function () {
            $.ajax({
                  url      : _isFormatUrl( ajaxConfig.u ) ? LP.format( ajaxConfig.u , data ) : ajaxConfig.u
                , data     : data
                , type     : method
                , dataType : ajaxConfig.dataType || 'json'
                , cache    : ajaxConfig.cache || false
                , global   : ajaxConfig.alertOnError === false || ajaxConfig.global === false ? false : true
                , error    : error
                , complete : complete
                , timeout  : ajaxConfig.timeout
                , success: function(e) {
                    if ( e && typeof e == "string" ) {
                        success(e);
                    } else {
                        _callback( e , api , success , error,  ajaxConfig , doAjax );
                    }
                }
            });
        }

        if ( ajaxConfig.needLogin === true || (ajaxConfig.needLogin !== false && method !== "GET") ) {
            // 如果不为GET的话，则默认是要登录的
            _execAfterLogin( doAjax , api );
        } else {
            doAjax();
        }
    }

    // err
    // msg
    function _callback ( result, api, success, error, config , ajaxFn ) {
        if ( !result ) return;
        var alertOnError = config.alertOnError;

        var error_no = result['err'];
        if ( error_no != 0 ) {
            if( alertOnError !== false ){
                // 如果是未登录错误，弹出登录框
                if( error_no == _unloginErrorNum ){
                    // TODO ..  show login tempalte
                    /*
                    require.async('login' , function( exports ){
                        exports.login( ajaxFn );
                    });
                    */
                    return;
                }

                LP.error( result['msg'] || _api[api].m + _e('出错啦，请稍候重试...') );
            }
            error && error( result['msg'] , result );
        } else if ( success ) {
            success( result );
        }

        // 用于判断页面是否需要刷新
        if( _needRefresh[api] ) {
            _needRefresh[api] = false;
            // remove url hash
            setTimeout(function() { location.href = location.href.replace(/#.*/,''); } , 1000);
        }
    }

    function _execAfterLogin ( cb , api ) {
        if( !LP.isLogin() ) {
            if ( _api[api].forceNoRefresh != true )
                _needRefresh[api] = true;
            // require login
            /*
            require.async('login' , function( exports ){
                exports.login( cb );
            });
            */
            require.async('util' , function( exports ){
                exports.trigger('login' , cb );
            });

        } else if (cb) {
            cb();
        }
    }

    $(document).ajaxError(function(evt, xhr, ajaxOptions, thrownError) {
        try{
            if ( xhr.status == 200 || thrownError.match(/^Invalid JSON/)) {
                LP.alert( _e(' (*´Д｀*) 系统出错了。请反馈给我们。'), 3000 );
            } else if ( thrownError !== "" ) {
                // 请求被Canceled的时候，thrownError为空【未验证】。这时候直接忽略。
                LP.alert( _e('发生了未知的网络错误，请稍后重试。') , 3000);
            }
        } catch(e) {};
    });

    // for model
    exports.ajax = _load;
});
