<?php
/**
 * User: wangfeng
 * Date: 13-6-22
 * Time: 下午7:24
 */
require_once __DIR__ . '/../DipeiTestCase.php';

class DataFlowTest extends DipeiTestCase
{
    public function testFullUid()
    {
        $this->dataSet->setUpFullTestUser();
    }
}
