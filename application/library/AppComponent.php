<?php
/**
 * User: wangfeng
 * Date: 13-5-28
 * Time: 下午10:57
 */
trait AppComponent
{
    /**
     * @var MonoLog\Logger
     */
    protected $logger;

    /**
     * 获取类名。以_分割namespace这种命名规范为准
     * @return string
     */
    public function getRealClassName(){
        static $realClassName;
        if($realClassName !== null) return $realClassName;
        $realClassName=get_class($this);
        $realClassName = str_replace('\\', '_', $realClassName);
        return $realClassName;
    }

    public function initLogger()
    {

        $suffixes=array('Model','Controller','Plugin','Exception');
        $realClassName=$this->getRealClassName();

        //do revert
        foreach($suffixes as $suffix){
            //check if last,revert suffix
            $pos = stripos($realClassName, $suffix);
            if($pos !== false && $pos + strlen($suffix) === strlen($realClassName)){
                $realClassName=$suffix.substr($realClassName,0,$pos);
                break;
            }
        }
        $prefix='';
        preg_match('/[A-Z][a-z]+/', $realClassName, $prefix);
        $logName = strtolower($realClassName);
        if(!empty($prefix)){
            $prefix = array_shift($prefix);
            $cutStart = strlen($prefix);
            if($logName[strlen($prefix)] =='_'){
                $cutStart++;
            }
            $logName = strtolower($prefix) . '.' . substr($logName, $cutStart);
        }
        if($logName[strlen($logName)-1] == '_'){
            $logName = substr($logName, 0, strlen($logName) - 1);
        }
        $logName .= '.'.date('Ymd');
        $logPath=Constants::$PATH_LOG.'/'.$logName;

        return AppLogger::getInstance()->newLogger($this->getRealClassName(), $logPath);
    }

    /**
     * @return MonoLog\Logger
     */
    public function getLogger()
    {
        //lazy
        if($this->logger !=null) return $this->logger;
        $this->logger=$this->initLogger();
        return $this->logger;
    }
}