<?php
require_once __DIR__.'/../DipeiTestCase.php';

class AppLocalTest extends DipeiTestCase
{
    public function test1()
    {
        AppLocal::init();
        echo AppLocal::getString("please enter you #[hahah] name" , array("hahah"=>"aaaaaa")),"\n";
        echo AppLocal::getString("hello" , array("hahah"=>"aaaaaa")),"\n";
        echo _e(GenErrorDesc::$descs[Constants::CODE_LOGIN_FAILED]);
    }
}
