/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-2-12
 * Time: 上午10:41
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){

    //拖拽事件
    zyup.drag();

    //创建上传句柄
    zyup.createUploader({type:zyup.config.mediaTypes.thumb});
    /*zyup.createUploader({type:zyup.config.mediaTypes.localVideo,browseButton:"zyupUploadLocalVideo",filters:zyup.config.mediaFilters.videoFilter});
    zyup.createUploader({type:zyup.config.mediaTypes._3d,browseButton:"zyupUpload3d",filters:zyup.config.mediaFilters._3dFilter});
    zyup.createUploader({type:zyup.config.mediaTypes.ppt,browseButton:"zyupUploadPpt",filters:zyup.config.mediaFilters.pptFilter});
    zyup.createUploader({type:zyup.config.mediaTypes.image,browseButton:"zyupUploadImage",filters:zyup.config.mediaFilters.imageFilter});
    zyup.createUploader({type:zyup.config.mediaTypes.file,browseButton:"zyupUploadFile",filters:zyup.config.mediaFilters.fileFilter});
    zyup.createUploader({type:zyup.config.mediaTypes.flash,browseButton:"zyupUploadFlash",filters:zyup.config.mediaFilters.flashFilter});*/

    //步骤控制
    $("#zyupTab a").click(function(){
        zyup.stepHandler($(this).attr("href"));

        return false;
    });

    //标签删除事件
    $(document).on("click","#zyupTagList a",function(){
        zyup.deleteTagHandler($(this));

        return false;
    });

    //标签输入事件
    var tagInput=$("#zyupTagInput");
    tagInput.keydown(function(event){
        if(event.keyCode==13){
            zyup.tagInputHandler($(this).val());
        }
    });

    tagInput.blur(function(){
        zyup.tagInputHandler($(this).val());
    });

    //显示上传文件的菜单
    $("#zyupShowUploadMenu").hover(function(e){
        $("#zyupUploadMenu").css("height","280px");
    },function(e){
        $("#zyupUploadMenu").css("height",0);
    });
    $("#zyupUploadMenu").hover(function(e){
        $("#zyupUploadMenu").css("height","280px");
    },function(e){
        $("#zyupUploadMenu").css("height",0);
    });

    //控制网络视频,显示输入面板
    $("#zyupUploadWebVideo").click(function(){
        zyup.webVideoPanelShowHandler();

        return false;
    });

    $("#zyupWebVideoPanelClose").click(function(){
        zyup.webVideoPanelCloseHandler();
    });

    //网络视频输入确定
    $("#zyupWebVideoInputOk").click(function(){
        zyup.webVideoInputHandler($("#zyupWebVideoInput").val());
    });

    //关闭播放界面
    $("#zyupShowMediaPanelClose").click(function(){
        zyup.showMediaPanelCloseHandler();
    });


    //删除文件
    $(document).on("click",".zyupDelete",function(){
        if($(this).data("status")==="unComplete"){
            if(confirm("确定删除吗？")){
                $(this).parents("li").remove();
            }
        }else{
            zyup.deleteUploadedFileHandler($(this));
        }

        return false;
    });



    //列表中每一项的点击事件，如果选中的列表没有填写完整，则不能选择其他列表
    $(document).on("click",".zyupMediaItem",function(){
        zyup.uploadedLiClickHandler($(this));

        return false;
    });

    //表单提交
    $("#zyupFormSubmitBtn").click(function(){

        //防止重复提交
        zyup.ajaxUploadFormHandler();

        return false;
    });

    //火狐里面阻止form提交
    $("input[type='text'],input[type='password']").keydown(function(e){
        if(e.keyCode==13){
            return false;
        }
    });

    //点击附件播放对应媒体文件，上传预览那里也用到
    $(document).on("click",".zyupJsClickClass",function(){
        zyup.showMediaHandler($(this));

        return false;
    });
});
