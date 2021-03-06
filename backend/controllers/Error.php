<?php
/**
 * @name ErrorController
 * @desc 错误控制器, 在发生未捕获的异常时刻被调用
 * @see http://www.php.net/manual/en/yaf-dispatcher.catchexception.php
 * @author wangfeng
 */
class ErrorController extends BaseBackEndController {

    public function validateAuth()
    {
        return true;
    }

    public function notfoundAction()
    {
        $this->assign($this->dataFlow->flow());
    }

	//从2.1开始, errorAction支持直接通过参数获取异常
    /**
     * @param $exception Exception
     * @return bool
     */
    public function errorAction($exception) {
		//1. assign to view engine
//        var_dump($exception);
//        if($exception instanceof AppException
////            && $this->getRequest()->isPost()
//        ){
//            if($exception->getCode() === Constants::CODE_NOT_FOUND){
//                $this->redirect('/404');
//            }
//            if($exception->getPrevious() !=null){
//                $this->getLogger()->warn(sprintf('catch AppException from previous:[%s] code:%s msg:%s', get_class($exception->getPrevious()),$exception->getCode(),$exception->getMessage()));
//            }
//            $this->render_ajax($exception->getCode(), $exception->getMessage(),$exception->getContext());
//        }else{
        if($exception instanceof AppException){
            header("HTTP/1.1 200 OK");
            $this->render_ajax($exception->getCode(), $exception->getMessage(),$exception->getContext());
        }else{
            $this->getLogger()->warn($exception->getMessage().":\n".$exception->getTraceAsString());
            $this->getView()->assign("exception", $exception);
            var_dump($exception);
        }
        return false;
//        }
		//5. render by Yaf
	}
}
