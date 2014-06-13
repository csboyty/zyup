/**
 * User: ty
 * Date: 13-6-13
 * 幻灯片设置图片文件属性页面js
 */
$(document).ready(function(){

    var mediaId=zyupCommon.getMediaId();


    //设置原来的内容
    zyupCommon.setField(mediaId,zyupCommon.config.mediaTypes.image);

    //上传罗略图部分代码
    zyupCommon.createThumbUploader(mediaId);

    //控制标题和描述的输入
    $("#zyupMediaTitle").blur(function(){

        //防止后台json_decode出错，将双引号改成单引号
        zyupCommon.uploadedMedias[mediaId][zyupCommon.config.mediaObj.mediaTitle]=$(this).val().replace(/["]/g,"'");
    });
    $("#zyupMediaDescription").blur(function(){

        //防止后台json_decode出错，将双引号改成单引号
        zyupCommon.uploadedMedias[mediaId][zyupCommon.config.mediaObj.mediaMemo]=$(this).val().replace(/["]/g,"'");
    });
});