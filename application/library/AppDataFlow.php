<?php
/**
 * User: wangfeng
 * Date: 13-6-14
 * Time: 下午11:49
 */
class AppDataFlow
{
    use AppComponent;
    use Strategy_Singleton;
    public $isAPI=false;

    //------------in------------------
    public $tids=array();//translation ids
    public $fids=array();//feeds ids
    public $lids=array();//location ids
    public $flids=array();//get also parent locations
    public $uids=array();//uids
    public $pids=array();//get projects
    public $fpoids=array();//get fully projects
    public $poids=array();//get posts
    public $fuids=array();//full uids
    public $rids=array();//reply ids
    public $mids=array();//message ids

    //-----------out------------------
    public $users=array();
    public $locations=array();
    public $projects=array();
    public $posts=array();
    public $translates=array();
    public $moneys=array();
    public $rates=array();
    public $replys=array();
    public $feeds=array();
    public $messages=array();
    public $results=array();

    public function ensureInputs()
    {
        $this->tids = array_diff(array_unique(array_map('intval', array_values($this->tids))), array_keys($this->translates));
        $this->uids = array_diff(array_unique(array_map('intval', array_values($this->uids))), array_keys($this->users));
        $this->fuids = array_unique(array_map('intval', array_values($this->fuids)));
        $this->pids = array_diff(array_unique(array_map('intval', array_values($this->pids))),array_keys($this->projects));
        $this->fids = array_diff(array_unique(array_map('intval', array_values($this->fids))),array_keys($this->feeds));
        $this->poids = array_diff(array_unique(array_map('intval', array_values($this->poids))),array_keys($this->posts));
        $this->fpoids = array_unique(array_map('intval', array_values($this->fpoids)));
        $this->lids = array_diff(array_unique(array_map('intval', array_values($this->lids))), array_keys($this->locations));
        $this->rids = array_diff(array_unique(array_map('intval', array_values($this->rids))), array_keys($this->replys));
        $this->flids = array_unique(array_map('intval', array_values($this->flids)));
        $this->mids = array_diff(array_unique(array_map('intval', array_values($this->mids))), array_keys($this->messages));

        $this->uids = array_diff($this->uids, $this->fuids);
        $this->lids = array_diff($this->lids, $this->flids);
        $this->poids = array_diff($this->poids, $this->fpoids);
    }

    public function mergeOne($dataSource,$data)
    {
        $datas=array($data['_id']=>$data);
        $func = 'merge' . ucfirst($dataSource);
        if(method_exists($this,$func)){
            $this->$func($datas);
        }else{
            $this->getLogger()->error('not found method '.$func);
        }
    }

    public function mergeMessages(&$messages)
    {
        $messageModel=new MessageModel();
        foreach($messages as $message){
            $this->uids[] = $message['uid'];
            $this->uids[] = $message['tid'];

            $this->messages[$message['_id']] = $messageModel->format($message);
        }
    }

    public function mergeFeeds(&$feeds)
    {   
        $feedModel=FeedModel::getInstance();
        foreach($feeds as $feed){
            if($feed['tp'] == Constants::FEED_TYPE_POST
                || $feed['tp'] == Constants::FEED_TYPE_QA){
                $this->poids[] = $feed['oid'];
            }else{
                $this->pids[] = $feed['oid'];
            }
            $this->feeds[$feed['_id']] = $feedModel->format($feed);
        }
    }

    public function mergeUsers(&$users)
    {
        $userModel=UserModel::getInstance();
        foreach($users as $user){
            if(array_search($user['_id'],$this->fuids) !== false){
                $this->flids[] = $user['lid'];
                $this->flids[] = $user['ctr'];
            }else{
                $this->lids[] = $user['lid'];
                if(isset($user['ctr'])){
                    $this->lids[] = $user['ctr'];
                }
            }
            unset($user['pw'],$user['tk']);
            if(isset($user['cts'])){
                $this->tids = array_merge($this->tids, array_keys($user['cts']));
            }
            if(isset($user['ls'])){
                $this->tids = array_merge($this->tids, array_keys($user['ls']));
                $this->tids = array_merge($this->tids, array_values($user['ls']));
            }
            if(isset($user['ps'])){
                $this->pids = array_merge($this->pids, $user['ps']);
            }
            $this->users[$user['_id']] = $userModel->format($user);
        }
    }

    private function shortContent($content)
    {
        return strip_tags($content);
    }

    public function mergeProjects(&$projects)
    {
        $projectModel=ProjectModel::getInstance();
        $rateModel=RateModel::getInstance();
        foreach($projects as $project){
            $project['p'] = $rateModel->convertRate($project['p'], AppLocal::currentMoney(),$project['pu']);
            $project['pu']=AppLocal::currentMoney();
            $this->uids[] = $project['uid'];
            foreach($project['ds'] as $day){
                foreach($day['ls'] as $line){
                    $this->tids[]=$line+1000;
                    $this->lids[]=$line;
                }
                //XXX API
                if($this->isAPI){
                    $project['ds']['short_desc']=$this->shortContent($project['ds']['dsc']);
                }
            }
            if(isset($project['tm'])) {
                $this->tids = array_merge($this->tids, $project['tm']);
            }
            if(isset($project['ts'])) {
                $this->tids = array_merge($this->tids, $project['ts']);
            }
            $this->projects[$project['_id']] = $projectModel->format($project);
        }
        $this->ensureInputs();
        if(!empty($this->uids)){
            $users = UserModel::getInstance()->fetch(array('_id' => array('$in' => $this->uids)), array('ps' => false));
            $this->mergeUsers($users);
        }
    }

    public function mergePosts(&$posts){
        $postModel=PostModel::getInstance();
        foreach($posts as $post){
            $this->uids[] = $post['uid'];
            $this->posts[$post['_id']] = $postModel->format($post);
            //XXX API
            if($this->isAPI){
                $post['short_content']=$this->shortContent($post['content']);
            }
            $this->lids[] = $post['lid'];
        }
    }

    public function mergeReplys(&$replys)
    {
       $replyModel=ReplyModel::getInstance();
       foreach($replys as $reply) {
           $this->uids[] = $reply['uid'];
           $this->replys[$reply['_id']] = $replyModel->format($reply);
           if(!empty($reply['rid'])){
               $this->rids[] = $reply['rid'];
           }
       }
    }

    public function mergeLocations(&$locations)
    {
        $locationModel=LocationModel::getInstance();
        $parentLids=array();
        foreach($locations as $location){
            if(array_search($location['_id'],$this->flids) !== false){
                $parentLids = array_merge($parentLids, $location['pt']);
            }
            $this->tids[]=$location['_id']+1000;
            if(isset($location['tm_c'])){
                $this->tids = array_merge($this->tids, array_keys($location['tm_c']));
            }
            $this->locations[$location['_id']] = $locationModel->format($location);
        }
        $parentLids = array_diff($parentLids, $this->lids);
        $parentLocations = $locationModel->fetch(array('_id' => array('$in' => $parentLids)));
        foreach($parentLocations as $location){
            $this->lids[] = $location['_id'];
            $this->tids[]=$location['_id']+1000;
            if(isset($location['tm_c'])){
                $this->tids = array_merge($this->tids, array_keys($location['tm_c']));
            }
            $this->locations[$location['_id']] = $locationModel->format($location);
        }
    }

    public function mergeTranslates(&$translates)
    {
        $translateModel=TranslationModel::getInstance();
        foreach($translates as $translate){
            $this->translates[$translate['_id']] = $translateModel->translateWord($translate);
        }
    }


    public function flow()
    {
        //feeds
        $this->ensureInputs();
        if(!empty($this->fids)){
            $feedModel=FeedModel::getInstance();
            $feeds = $feedModel->fetch(array('_id' => array('$in' => $this->fids)));
            $this->mergeFeeds($feeds);
        }
        //posts
        $this->ensureInputs();
        if(!empty($this->poids) || !empty($this->fpoids)){
            $postModel=PostModel::getInstance();
            $allPostIds = array_merge($this->poids,$this->fpoids);
            $posts=$postModel->fetch(array('_id'=>array('$in'=>$allPostIds)));
            $this->mergePosts($posts);
        }
        //reply
        $this->ensureInputs();
        if(!empty($this->rids)){
            $replyModel=ReplyModel::getInstance();
            $replys = $replyModel->fetch(array('_id' => array('$in' => $this->rids)));
            $this->mergeReplys($replys);
        }
        /*
        //reply replys
        $this->ensureInputs();
        if(!empty($this->rids)){
            $replyModel=ReplyModel::getInstance();
            $replys = $replyModel->fetch(array('_id' => array('$in' => $this->rids)));
            $this->mergeReplys($replys);
        }
        */
        $this->ensureInputs();
        if(!empty($this->mids)){
            $messageModel=new MessageModel();
            $messages = $messageModel->fetch(array('_id' => $this->mids));
            $this->mergeMessages($messages);
        }
        //users
        $this->ensureInputs();
        if(!empty($this->uids) || !empty($this->fuids)){
            $userModel=UserModel::getInstance();
            $users = $userModel->fetch(array('_id' => array('$in' => $this->uids)),array('ps'=>false));
            $this->mergeUsers($users);
            if(!empty($this->fuids)){
                $users = array_merge($users,$userModel->fetch(array('_id'=>array('$in'=>$this->fuids))));
                $this->mergeUsers($users);
            }
            
        }
        //projects
        $this->ensureInputs();
        if(!empty($this->pids)){
            $projectModel=ProjectModel::getInstance();
            $projects = $projectModel->fetch(array('_id' => array('$in' => $this->pids)));
            $this->mergeProjects($projects);
        }
        //locations
        if(!empty($this->lids) || !empty($this->flids)){
            $locationModel=LocationModel::getInstance();
            $allLids = array_merge($this->lids, $this->flids);
            $locations = $locationModel->fetch(array('_id'=>array('$in'=>$allLids)));
            $this->mergeLocations($locations);
        }
        //translates
        $this->ensureInputs();
        if(!empty($this->tids)){
            $translateModel=TranslationModel::getInstance();
            $translates = $translateModel->fetch(array('_id'=>array('$in'=>$this->tids)));
            $this->mergeTranslates($translates);
        }

        //replace location name
        if(!empty($this->locations)){
            foreach(array_keys($this->locations) as $k){
                $this->locations[$k]['name'] = $this->translates[$k + 1000];
            }
        }

        $this->results=array(
            'USERS'=>$this->users,
            'POSTS'=>$this->posts,
            'PROJECTS'=>$this->projects,
            'REPLYS'=>$this->replys,
            'LOCATIONS'=>$this->locations,
            'FEEDS'=>$this->feeds,
            'MESSAGES'=>$this->messages,
            'TRANSLATES'=>$this->translates,
        );
        return $this->results;
    }
}