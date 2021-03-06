<?php
/*
 * render the base static in template files
 * <link href="/static/a.css,b.css,d.css,ji.css,de.css?_=7890" rel="stylesheet" />
 * <script href="/static/a.js,b/a.js,er/s.js,ew/ewrwe/were.js?_=123341"></script>
 */

define( 'STA_REPLACE_CHAR' , '~' );
define( 'STA_CACHE_DIR' , __DIR__ . '/_cache' );
define( 'STA_YUICOMPRESSOR' , __DIR__ . '/_bulid/yuicompressor.jar' );
define( 'STA_CSS_PATH' , __DIR__ . '/css' );
define( 'STA_JS_PATH' , __DIR__ . '/js' );
date_default_timezone_set('PRC');

class Cgi{
    private static $combine_error = array();
    private static $contentType = array(
        "css" => 'text/css',
        "js" => 'application/x-javascript'
    );

    public static function init(){
        $fileList = $_GET['f'];
        $version = $_GET['_'];
        $file = '';
        if( !empty( $fileList ) ){
            $file = preg_replace( "/(\\\)|(\/)/" , STA_REPLACE_CHAR , $fileList ) . '-' . $version;
        }

        if( !empty( $file ) ){
            // set header
            $type = strpos(  $file , '.css' ) !== false ? 'css' : 'js';
            header( 'Content-type: ' . self::$contentType[ $type ] );
            // judge if file is exist
            $filepath = STA_CACHE_DIR . '/' . $file . '.' . $type;
            if( file_exists( $filepath )){
                $content = file_get_contents( $filepath );
            } else {
                $content = self::combine( explode( ',' , $fileList ) );
                $content =
"/*
 * combine file:
 * data: " . date('F j, Y, g:i a') . "
 * "
            . join( "  *\n" , self::$combine_error )
            .
"
 */
"
            . $content;

                // save content to file
                file_put_contents( STA_CACHE_DIR . '/' . $file . '.' . $type , $content );

                // need to remove other the same name file
            }

            echo $content;
        }
    }

    private static function combine( $files ){

        $type = preg_match( '/\.css/' , $files[0] ) ? 'css' : 'js';

        $content = "";
        foreach ( $files as $key => $value ) {
            $content .= self::imageCacheContent( $type , $value );
        }

        // INCLUDE COMPRESSOR CLASS
        include('YUICompressor.php');
        // INVOKE CLASS
        $yui = new YUICompressor( STA_YUICOMPRESSOR , STA_CACHE_DIR , array(
            'type' => $type
            ));

        $yui->addString( $content );

        // COMPRESS
        $content = $yui->compress();

        return $content;
    }

    private static function imageCacheContent( $type , $name ){
        $file = ( $type == 'css' ? STA_CSS_PATH : STA_JS_PATH ) . '/' . $name;
        if( file_exists( $file )){
            $content = file_get_contents( $file );
            return preg_replace( '/url\s*\(\s*([\'"]?)([^\'"]+)\1\s*\)/e' , "self::fixImageCache(\"\\2\",'" . $file .  "')" , $content );
        } else {
            self::$combine_error[] = 'error: ' . $name . ' ... not exist';
            return '';
        }
    }

    private static function fixImageCache( $imgsrc , $file ){
        $img_src = trim( $imgsrc );
        $img_path = dirname( $imgsrc );
        $file_path = dirname( $file );

        // get real image path
        $img_real_src = $file_path . '/' . $img_src;

        // get version
        $time = filemtime( $img_real_src );
        if( !$time ){
            $time = explode( ' ' , microtime() );
            $time = $time[1];
        }

        return "url(" . self::getRelativePath( $img_real_src , STA_CACHE_DIR ) . '?_=' . $time . ")";
    }

    private static function getRelativePath( $img_file , $css_path ){
        $img_file = self::cleanPath( $img_file );
        $css_path = self::cleanPath( $css_path );

        $img_file_arr = explode( '/' , $img_file );
        $css_path_arr = explode( '/' , $css_path );


        $r = array();
        for( $i = 0 , $len = count( $css_path_arr ); $i < $len ; $i++ ){
            if( $img_file_arr[ $i ] == $css_path_arr[ $i ] ){
                continue;
            }
            $r[] = "..";
        }
        for( $i -= count( $r ) , $len = count( $img_file_arr ) ; $i < $len ; $i++ ){
            $r[] = $img_file_arr[ $i ];
        }

        return join( '/' , $r );
    }

    private static function cleanPath( $path ){
        $path = preg_replace( '/\\\+/', '/', $path );
        $path = preg_replace( '/\/+/', '/', $path );
        $paths = explode('/', $path );

        $r = array();
        foreach ($paths as $key => $value) {
            if( $value == '..' ){
                array_pop( $r );
            } else if( $value != '.' ){
                $r[] = $value;
            }
        }

        return join( '/' , $r );
    }
}


// export
Cgi::init();