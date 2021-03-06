<?php
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;
use Monolog\Handler\ChromePHPHandler;
use Monolog\Processor\IntrospectionProcessor;
use Monolog\Processor\UidProcessor;

/**
 * Factory of logger
 * User: wangfeng
 * Date: 13-5-28
 * Time: 下午10:42
 * @method static AppLogger getInstance()
 */
class AppLogger
{
   use Strategy_Singleton;

   public function newLogger($name,$logPath)
   {
       $logger=new Logger($name);
//       $logger->pushHandler(new FirePHPHandler());
//       $logger->pushHandler(new ChromePHPHandler());
       $logger->pushHandler(new StreamHandler($logPath));

       $logger->pushProcessor(new IntrospectionProcessor());

       static $uidProcessor=null;
       if($uidProcessor === null){
            $uidProcessor= new UidProcessor(15);
       }
       $logger->pushProcessor($uidProcessor);
       return $logger;
   }
}