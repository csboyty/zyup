/**
 * Created by JetBrains PhpStorm.
 * User: ty
 * Date: 13-6-13
 * Time: 上午8:58
 * 幻灯片设置网络视频文件属性页面js
 */
$(document).ready(function(){

    var mediaId=zyupCommon.getMediaId();


    //设置原来的内容
    zyupCommon.setField(mediaId,zyupCommon.config.mediaTypes.webVideo);

    //上传罗略图部分代码
    zyupCommon.createThumbUploader(mediaId);

    //输入视频文件控制部分
    $("#zyupWebInputOk").click(function(){
        var input= $("#zyupWebInput");
        if(input.val().trim().match(/^<iframe/)!=null){
            input.removeClass("zyupInputInvalid");

            //防止后台json_decode出错，将双引号改成单引号
            var filename=input.val().replace(/["]/g,"'");

            //设置列表中的值
            $("#zyupUploadedMediasOl a[data-media-id='"+mediaId+"']",parent.document).find(".zyupMediaFilename").text(filename);

            //设置uploaded_medias的值
            zyupCommon.uploadedMedias[mediaId][zyupCommon.config.mediaObj.mediaFilename]=filename;
            zyupCommon.uploadedMedias[mediaId][zyupCommon.config.mediaObj.mediaFilepath]=filename;

            //设置file_info的值
            $("#zyupFileInfo").text(filename);
            $("#zyupFileInfoDiv").removeClass("zyupHidden");
            $("#zyupChangeDiv").addClass("zyupHidden");
        }else{
            input.removeClass("zyupInputInvalid");
        }
    });



    //点击更换按钮
    $("#zyupWebChange").click(function(){
        $("#zy_change_div").removeClass("zyupHidden");
        $("#zyupFileInfo").addClass("zyupHidden");
    });

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
