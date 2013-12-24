LP.use(['ueditor' , 'util' , 'html2json'] , function( UE , util , html2json){

	// 1. init publisher
    var _editor = new UE.ui.Editor({
        initialContent          : ''
        , initialFrameHeight    : 176
        , compressSide          : 1    // 压缩图片基准，1按照宽度
        , maxImageSideLength    : 640
        , toolbars              : [["fullscreen","insertimage" ,"emotion","fontfamily","fontsize","bold", "italic", "underline", "forecolor", 'justifyleft', 'justifycenter', 'justifyright',"link","removeformat","undo","redo","autotypeset"]]
    });

    var $pubArea = $('#G_pub-area');
    _editor.render( $pubArea[0] );
    $pubArea.data( 'editor' , _editor );

    // init select tag
    var type = $('.pub-tabs li.selected').data('value');
    
    util.tab( $('.pub-tabs li') , function(){
        type = $(this).data('value');
    } );

    // init form submit event
    // set ajax to add post 
    $pubArea.closest('form')
        .submit(function(){
            var data = LP.query2json( $(this).serialize() );

            // validator 
            if( !data.title || data.title.length > 50 ){
                LP.error(_e('标题不能为空，且少于50个字'));
                return false;
            }
            if( !data.content || data.content.length > 5000 ){
                LP.error(_e('内容不能为空，且少于5000个字'));
                return false;
            }
            
            data.type = type;
            data.content = util.stringify( html2json.html2json(data.content) );


            LP.ajax('addPost' , data , function(){
                // refresh the page
                LP.reload();
            });
            return false;
        });
});