<?php
/**
 * User: wangfeng
 * Date: 13-5-28
 * Time: 下午11:45
 *
 * base:global.js
 *
 * @method Twig_Adapter getView()
 */
class BaseController extends  Yaf_Controller_Abstract
{
    use AppComponent;

    /**
     * @var array
     */
    protected  $user;

    /**
     * @var int
     */
    protected $userId=0;

    /**
     * @var AppDataFlow
     */
    protected $dataFlow;

    /**
     * @var array
     */
    protected $allow;

    /**
     * @var array
     */
    protected $deny;

    public function dump()
    {
        header('Content-Type:text/html;charset=utf8');
        var_dump($this->getView()->getAssigned());
        exit;
    }

    public function isLepei(){
        return UserModel::getInstance()->isLepei($this->user);
    }

    public function isLepeiById( $uid ){
        $userModel = UserModel::getInstance();
        $user = $userModel->fetchOne(array('_id'=>$uid));
        return $userModel->isLepei($user);
    }

    public function getPage() {
        return max(1,(int)$this->getRequest()->getRequest('page',1));
    }

    public function getPagination($page,$pageSize,$count){
        $pageSize = max(1, $pageSize);
        $page = max(1, $page);
        $pageCount=(int)ceil($count/$pageSize);
        return array(
            'pagination'=>array(
                'current'=>$page,
                'total'=>$pageCount,
                'count'=>$count
            )
        );
    }

    public function renderSearch(){
        //append locids
        $locids=array(161,621,403,564,649,500,520);
        $locList = array_slice($locids, -4);

        $locationModel=LocationModel::getInstance();
        $this->dataFlow->locations[0]=$locationModel->format($locationModel->getGlobalLocation());
        $this->dataFlow->locations[0]['counts']['country'] = $locationModel->count(array('pt' => array('$size' => 1)));
        $this->dataFlow->lids = array_merge($this->dataFlow->lids, $locids);
        $this->getView()->assign(array('locids' => $locids));
        $this->getView()->assign(array('search_list' => $locids));
    }

    public function init()
    {
        $this->dataFlow=new AppDataFlow();
        $this->dataFlow->isAPI=$this->isAPI();

        if (Yaf_Session::getInstance()->has('user')) {
            $this->user = UserModel::getInstance()->fetchOne(array('_id'=>Yaf_Session::getInstance()['user']['_id']));
            $this->setCookie('UID', $this->user['_id']);
        }else  if($this->isAPI()){  //XXX API
            $token=$this->getRequest()->getQuery('token');
            list($uid,$loginTime,$rand)=explode('_',base64_decode($token));
            $user = UserModel::getInstance()->fetchOne(array('_id' => intval($uid)));
            if(!empty($user) && $user['tk'] === $token){
                $this->user=$user;
            }
        }

        //debug log
        $this->getLogger()->debug(sprintf('controller:%s,action:%s,params:%s,UID:%s',$this->getRequest()->controller,$this->getRequest()->action,json_encode($this->getRequest()->getRequest()),$this->userId));

        if(!empty($this->user)){
            $this->userId = $this->user['_id'];
            $this->getView()->assign(array('UID'=>$this->user['_id']));
            $this->dataFlow->fuids[]=$this->userId;
            $this->dataFlow->mergeOne('users', $this->user);
        }

        $this->dataFlow->tids = array_merge($this->dataFlow->tids,range(1,1000));

        if(!$this->validateAuth()){
            $action=$this->getRequest()->getActionName();
            $passed=null;
            if(!empty($this->allow)){
                if(is_null($passed)){
                    $passed=false;
                }
                foreach($this->allow as $rule){
                    if(preg_match($rule,$action)){
                        $passed=true;
                        break;
                    }
                }
            }
            if(!empty($this->deny)){
                if(is_null($passed)){
                    $passed=true;
                }
                foreach($this->deny as $rule){
                    if(preg_match($rule,$action)){
                        $passed=false;
                        break;
                    }
                }
            }
            if(!$passed){
                $this->handleInvalidateAuth();
            }
        }

        // add user fav locations
        $this->assignMyFavLocations();
    }

    /**
     * 当权限不被验证的时候，会先过一次白名单黑名单，然后调用handleInvalidateAuth
     * @return bool
     */
    public function validateAuth()
    {
        return !empty($this->user);
    }

    /**
     *
     */
    public function handleInvalidateAuth()
    {
        if(!$this->isAPI()){
            $this->redirect('/');
            exit;
        }else{
            $this->render_ajax(Constants::CODE_NEED_LOGIN,'');
            exit;
        }
    }

    public function assignViewedLepei()
    {
        $viewedLepei=$this->getRequest()->getCookie('_lp');
        if(!empty($viewedLepei)){
            $uids = array_unique(array_map('intval', explode(',', $viewedLepei)));
            $this->dataFlow->fuids=array_merge($this->dataFlow->uids,$uids);
        }
    }

    public function assignMyFavLocations()
    {
        $likeModel=LikeModel::getInstance();
        $feedModel=FeedModel::getInstance();
        //my fav lids
        if($this->userId){
            $myLikeLocations=$likeModel->fetch(
                MongoQueryBuilder::newQuery()
                    ->query(array('tp'=>Constants::LIKE_LOCATION,'uid'=>$this->userId))
                    ->sort(array('t'=>-1))
                    ->limit(5)
                    ->build()
            );

            $this->setCookie('ll' , count($myLikeLocations));
            $likeLocIds=array();
            foreach($myLikeLocations as $likeLocation){
                $this->dataFlow->lids[] = $likeLocation['oid'];
                $likeLocIds[] = $likeLocation['oid'];
            }
            $myLikeLocationCounts=array();
            foreach($likeLocIds as $lid){
                $lastTime=$this->user['l_vts'][$lid]?$this->user['l_vts'][$lid] : new MongoDate(0);
                $myLikeLocationCounts[$lid]=$feedModel->count(array('lpt'=>$lid,'c_t'=>array('$gt'=>$lastTime)));
            }
            //loc counts
            $this->assign(array(
                'my_like_locations'=>$likeLocIds
            ));
            $this->assign(array(
                'my_like_location_counts'=>$myLikeLocationCounts
            ));
        }
    }

    public function setCookie($name,$val,$expire=null,$path=null)
    {
        if(is_null($expire)){
            $expire=Constants::$COOKIE_EXPIRE;
        }
        if(is_null($path)){
            $path=Constants::$COOKIE_PATH;
        }
        if(is_array($val)){
            $val = join(',', $val);
        }
        setcookie($name, is_string($val)?$val:strval($val), time()+$expire, $path);
    }

    public function wrapInput($method,$args){
        $class = new ReflectionClass(get_class($this));
        $split = strrpos($method, ':');
        if($split !== false){
            $method = substr($method, $split+1);
        }
        $method=$class->getMethod($method);
        $params=$method->getParameters();
        $out=array();
        foreach($params as $param){
            $out[$param->getName()] = $args[$param->getPosition()];
        }
        return $out;
    }

    public function assign($var)
    {
        $this->getView()->assign($var);
    }

    public function isAPI()
    {
        static $api=null;
        if($api === null){
            $api=Yaf_Application::app()->getConfig()->get('application')['api'] || Yaf_Registry::get('api');//
        }
        return $api;
    }

    public function render($tpl,array $vars=null){
        if($this->getRequest()->getQuery('debug',false)){
            $this->dump();
        }
        //XXX API
        if($this->isAPI()){
            $this->render_ajax(0,'',$this->getView()->getAssigned());
            return;
        }
        if($this->getRequest()->getQuery('json',false)){
            $this->render_ajax(0, '', $this->getView()->getAssigned());
            return;
        }
        $renderPath=$this->getRenderPath();
        $this->assign(array('TEMPLATE'=>$renderPath));
        $list=Sta::getPageCssList($renderPath);
        $this->assign(array('page_css_list'=>$list));
        return parent::render($tpl, $vars);
    }

    public function getRenderPath()
    {
        $renderPath = strtolower(sprintf('%s/%s.%s', $this->getRequest()->getControllerName(), $this->getRequest()->getActionName(), Yaf_Application::app()->getConfig()['application']['view']['ext']));
        return $renderPath;
    }

    public function render_ajax($code,$message='',$data=null,$renderPath='', $renderData=null)
    {
        header('Content-Type:application/json');
        if($this->getRequest()->getQuery('debug',false)){
            $this->dump();
        }
        
        if(empty($renderPath)){
            $renderPath = $this->getRenderPath();
        }
        if(empty($message) && isset(GenErrorDesc::$descs[$code])){
            $message = _e(GenErrorDesc::$descs[$code]);
        }
        //FIXME pagination
        if($this->isAPI() && is_array($data)){
            foreach($data as $k=>$v){
                if($k != 'TRANSLATES' && is_array($v)){
                    $data[$k] = array_values($v);
                }
            }
        }
        $html='';
        if(!$this->isAPI() &&
            file_exists($this->getViewpath()[0].'/'.$renderPath) /* && !$this->getRequest()->isPost() */){
            $html = $this->getView()->render($renderPath,$renderData);
        }
        echo json_encode(array(
            'err'=>$code,
            'msg'=>$message,
            'data'=>$data,
            'html'=>$html
        )),"\n";
    }

    public function getProjectInfo()
    {
        $projectInfo = ProjectModel::getInstance()->format($this->getRequest()->getRequest(), true);
        foreach($projectInfo['ds'] as $k=>$day){
            $projectInfo['ims']=array_unique(array_merge((array)$projectInfo['ims'],AppHelper::getInstance()->getImages(json_decode($projectInfo['ds'][$k]['dsc'],true))));
            $projectInfo['ds'][$k]['dsc']=Json2html::newInstance($projectInfo['ds'][$k]['dsc'])->run();
        }
        $customThemes=$this->getRequest()->getPost('custom_themes');
        if(!empty($customThemes)){
            foreach($customThemes as $custom){
                $tid = TranslationModel::getInstance()->fetchOrSaveCustomWord(array(AppLocal::currentLocal() => $custom));
                $projectInfo['tm'][]=$tid;
            }
        }
        $customServices=$this->getRequest()->getPost('custom_services');
        if(!empty($customServices)){
            foreach($customServices as $custom){
                $tid = TranslationModel::getInstance()->fetchOrSaveCustomWord(array(AppLocal::currentLocal() => $custom));
                $projectInfo['ts'][]=$tid;
            }
        }
        if( !isset( $projectInfo['s'] ) ){
            $projectInfo['s'] = Constants::STATUS_NEW;
        }
        return $projectInfo;
    }


    public function getPostInfo()
    {
        $postInfo = PostModel::getInstance()->format($this->getRequest()->getRequest(), true);
        $postInfo['ims']=AppHelper::getInstance()->getImages(json_decode($postInfo['c'],true));
        $postInfo['c']=Json2html::newInstance($postInfo['c'])->run();
        return $postInfo;
    }
}
