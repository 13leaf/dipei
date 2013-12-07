<?php
/**
 * User: wangfeng
 * Date: 13-6-20
 * Time: 下午9:49
 */
class LoginController extends BaseController
{
    public function init()
    {
        $this->allow=array('/.*/');
        parent::init();
    }

    public function initLogger()
    {
        $logger=parent::initLogger();
        $logger->pushProcessor(new \Monolog\Processor\WebProcessor());
        return $logger;
    }

    public function logoutAction()
    {
        Yaf_Session::getInstance()->del('user');
        $this->render_ajax(Constants::CODE_SUCCESS);
        return false;
    }

    public function indexAction()
    {
        if($this->getRequest()->isPost()){
            $userModel=UserModel::getInstance();
            $input=$this->getRequest()->getPost();
            $user=$userModel->login($userModel->format($input, true));
            if(!empty($user)){
                //XXX API
                if($this->isAPI()){
                    $token=$userModel->genToken($user);
                    $this->dataFlow->mergeOne('users', $user);
                    $this->assign($this->dataFlow->flow());
                    $this->assign(array('token'=>$token));
                    $this->render_ajax(Constants::CODE_SUCCESS,'',$this->getView()->getAssigned());
                }else{
                    $this->render_ajax(Constants::CODE_SUCCESS);
                }
            }else{
                $this->render_ajax(Constants::CODE_LOGIN_FAILED);
            }
        }else{
            $this->render_ajax(Constants::CODE_SUCCESS);
        }
        return false;
    }
}