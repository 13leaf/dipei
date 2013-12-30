<?php
/**
 * User: wangfeng
 * Date: 13-6-30
 * Time: 下午9:09
 * //TODO 浏览他的亦浏览了
 */
class DetailController extends BaseController
{
    public function validateAuth()
    {
        if($this->getRequest()->getActionName() == 'index'){
            $uid = $this->getRequest()->getParam('uid', 0);
            if(!UserModel::getInstance()->isValidId($uid)){
                $this->getLogger()->warn("not found uid $uid", array('request' => $this->getRequest(),'input'=>$_REQUEST));
                throw new AppException(Constants::CODE_NOT_FOUND);
            }
        }
        return true;
    }

    public function indexAction($uid)
    {
        $this->assignViewedLepei();
        // append search locations
        $this->renderSearch();
        
        $this->dataFlow->fuids[] = intval($uid);
        $this->assign(array('VUID' => $uid));
        

        $page=$this->getPage();

        //inc view count
        UserModel::getInstance()->update(array('$inc'=>array('vc'=>1)),array('_id'=>$uid));

        // set feeds
        $query = array('uid' => intval($uid) , 's'=>array('$ne'=>Constants::STATUS_DELETE));
        $queryBuilder = MongoQueryBuilder::newQuery()->query($query)
            ->sort(array('c_t' => -1))
            ->limit(Constants::LIST_FEED_SIZE);

        $feeds=FeedModel::getInstance()->fetch($queryBuilder->build());
        $this->dataFlow->mergeFeeds($feeds);

        $lastReplyUids = array_column( $feeds , 'l_r_u' );
        $this->dataFlow->uids += $lastReplyUids;

        // get post locations
        $oids = array_column( $feeds , 'oid' );
        $posts = PostModel::getInstance()->fetch(
            MongoQueryBuilder::newQuery()
                ->query(array('_id'=>array('$in'=>$oids)))
                ->build()
            );
        $lids = array_unique(array_column( $posts , 'lid' ));
        $this->dataFlow->flids = array_merge( $this->dataFlow->flids , $lids );
        $data=$this->dataFlow->flow();
        $this->assign($data);

        $this->assign($this->getPagination($page,Constants::LIST_FEED_SIZE,FeedModel::getInstance()->count($query)));

        if( $this->isLepeiById(intval($uid)) ){
            //set viewed lepei
            $_lp = $this->getRequest()->getCookie('_lp', '');
            $viewedLepei = $_lp ? explode(',', $_lp ) : array();
            if(isset($data['USERS'][$uid])
                && (array_search($uid,$viewedLepei) === false)){

                $viewedLepei[]=$uid;
                if(count($viewedLepei) >4){
                    $viewedLepei=array_slice($viewedLepei, -4);
                }
                $this->setCookie('_lp', $viewedLepei);
            }
        }

        // render like status
        $like = LikeModel::getInstance()->fetchOne(array(
            'uid'=>$this->userId , 
            'oid'=>intval($uid) , 
            'tp'=>Constants::LIKE_USER));

        $this->assign(array('like_status'=>!empty($like)));

        // assign like post status
        $feedIds = array_column($feeds , 'oid');
        $likes = LikeModel::getInstance()->fetch(
            MongoQueryBuilder::newQuery()
                ->query(
                    array('uid'=>$this->userId ,
                        'oid'=>array('$in'=> $feedIds ),
                        'tp'=> array('$in'=> array( Constants::LIKE_POST , Constants::LIKE_PROJECT ))
                        )
                    )
                ->build()
            );

        // if current view user is not a lepei,  get his/her wish locations
        if( !$this->isLepei() ){
            $likeModel = LikeModel::getInstance();
            $loclikes = $likeModel->fetch(
                MongoQueryBuilder::newQuery()
                    ->query(array('uid'=>$this->userId,'tp'=>Constants::LIKE_LOCATION ))
                    ->sort(array('t'=>-1))
                    ->limit(Constants::LIST_PAGE_SIZE)
                    ->build()
            );
            $locs=array();
            // assign like objects
            $likeObjs = array();
            foreach($loclikes as $like){
                $locs[] = $like['oid'];
                $likeObjs[ $like['oid'] ] = $like;
            }

            $this->assign(array('wish_location'=>$locs));
            $this->dataFlow->flids = array_merge($this->dataFlow->flids, $locs);
        }

        $this->assign(array('likes'=> array_column( $likes , null , 'oid' )));

        // render nearby list
        $viewUser = UserModel::getInstance()->fetchOne(
                array( '_id'=>intval( $uid ) )
            );

        if( !empty( $viewUser['lid'] ) ){
            //render brother loc_list
            $location = LocationModel::getInstance()->fetchOne( array("_id"=> $viewUser['lid'] ) );
            $parent = array_pop($location['pt']); 
            $location['pt'][]=$parent;
            $brothers = LocationModel::getInstance()->fetch(
                MongoQueryBuilder::newQuery()
                    ->query(array('$and'=>array(array('pt' => $parent),array('ptc'=>$location['ptc']))))
                    ->sort(array('c.d'=>-1))
                    ->limit(20)
                    ->build()
            );

            $cityIds = array_column( $brothers , "_id" );
            $nearbyUsers = UserModel::getInstance()->fetch(
                MongoQueryBuilder::newQuery()
                ->query( array( 'lid'=> array( '$in' => $cityIds ) , 'l_t' => array('$in' => Constants::$LEPEI_TYPES) ) )
                ->limit(100)->build()
                );
            $users = array();
            for($i = 0 ; $i < 5 ; $i++){
                $users[] = array_splice($nearbyUsers, rand(0 ,count($nearbyUsers)-1) , 1)[0];
            }
            $this->assign(array('nearbyList'=> UserModel::getInstance()->format( $users )));
        }
    }
}