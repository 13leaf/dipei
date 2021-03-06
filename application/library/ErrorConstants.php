<?php
/**
 * User: wangfeng
 * Date: 13-5-27
 * Time: 上午1:23
 */
interface ErrorConstants
{
    const CODE_NO_IMPLEMENT=999;

    const CODE_SUCCESS=0;

    const CODE_UNKNOWN=-1;

    const CODE_MONGO=-2;

    const CODE_INVALID_MODEL=-3;

    const CODE_UPDATE_NEED_WHERE=-4;

    const CODE_REMOVE_NEED_WHERE=-5;

    // validator error
    const CODE_VALIDATOR_ERROR=-6;

    const CODE_PARAM_INVALID=-7;//param error

    const CODE_NO_PERM=-8;//no permission

    const CODE_LACK_FIELD=-100;

    const CODE_NOT_FOUND=-404;//not found 404

    //login \ register
    const CODE_LOGIN_FAILED=-1000;

    //profile
    const CODE_NOT_FOUND_PROJECT=-2000;
    const CODE_PASSWORD_NOT_RIGHT=-2001;
    const CODE_PASSWORD_TOO_SHORT=-2002;
    //
    const CODE_NOT_FOUND_POST=-3000;

    const CODE_NOT_FOUND_MESSAGE=-4000;
    const CODE_NOT_FOUND_REPLY=-5000;

    const CODE_LOCATION_NOT_FOUND=-6000;
    const CODE_LOCATION_MUST_CITY=-6001;

    //image
    const CODE_UPLOAD_OVER_LIMIT_SIZE=-8000;
    const CODE_UPLOAD_OVERFLOW_SIZE=-8001;
    const CODE_UPLOAD_UNCOMPLETED=-8002;
    const CODE_UPLOAD_EMPTY_LIST=-8003;
    const CODE_UPLOAD_EMPTY_FILE=-8004;
    const CODE_UPLOAD_OVERFLOW_POST=-8005;
    const CODE_UPLOAD_ILLEGAL_TYPE=-8006;
    const CODE_UPLOAD_IO=-8007;
    const CODE_UPLOAD_FAILED=-8008;


    //like
    const CODE_NOT_FOUND_LIKE_OBJECT=-9000;
    const CODE_INVALID_LIKE_ID=-9001;
    const CODE_DUPLICATE_LIKE=-9002;

    //client
    const CODE_NEED_LOGIN=-10000;
}