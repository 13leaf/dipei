<?php
/**
 * User: wangfeng
 * Date: 13-6-24
 * Time: 下午2:31
 */
class AjaxController extends BaseController
{
    public function validateAuth()
    {
        return true;//always ok
    }

    public function locSearchAction($k){
        $k = urldecode($k);
        $locationModel=LocationModel::getInstance();
        $results=$locationModel->searchLocation($k);
        $this->render_ajax(Constants::CODE_SUCCESS, '', $results);
        return false;
    }

    public function countrySearchAction($k){
        $k = urldecode($k);
        $locationModel=LocationModel::getInstance();
        $results=$locationModel->searchCountry($k);
        $this->render_ajax(Constants::CODE_SUCCESS, '', $results);
        return false;
    }

    public function translatesAction(){
        $this->dataFlow->tids = range(1, 1000);
        $this->render_ajax(Constants::CODE_SUCCESS,'',$this->getDataFlow()->flow());
        return false;
    }
}