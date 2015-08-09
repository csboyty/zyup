/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 13-9-4
 * Time: 下午6:01
 *上传（新建、修改）作品资源模块
 */
var zyup=(function(config,functions){

    var currentMediaId=0;
    var currentEditEntityId=0;
    var currentMediaUploader=null;
    var uploadingMediaFile=null;

    var uploadedMedias={};
    var fileIdToMediaId={};
    var addedTags={}; //已经添加的标签
    var step2UploaderInit=false;

    /**
     * 拖拽函数====================
     */
    function drag(){
        var targetOl = document.getElementById("zyupMediaList");//容器元素
        var eleDrag = null;//被拖动的元素

        targetOl.onselectstart=function(event){
            if(event.target.className.match("zyupMediaItem")!==null){

                event.preventDefault();
                event.stopPropagation();
            }
        };
        targetOl.ondragstart=function(event){
            if(event.target.className.match("zyupMediaItem")!==null){
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text","移动中");
                eleDrag = event.target||event.srcElement;

                return true;
            }
        };
        targetOl.ondragend=function(event){
            if(event.target.className.match("zyupMediaItem")!==null){
                eleDrag=null;

                event.preventDefault();
                event.stopPropagation();
            }
        };

        //在元素中滑过
        targetOl.ondragover = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };

        targetOl.ondrop=function(event){

            event.preventDefault();
            event.stopPropagation();
        };

        //ol作为最大的容器也要处理拖拽事件，当在li上滑动的时候放到li的前面，当在ol上滑动的时候放到ol的最后面
        targetOl.ondragenter = function (event) {
            var target=event.toElement||event.target;
            var targetParent=target.parentNode;
            if (target == targetOl) {
                targetOl.appendChild(eleDrag);
            }else{
                if(target.tagName=="LI"){
                    targetOl.insertBefore(eleDrag, target);
                }else{
                    targetOl.insertBefore(eleDrag, targetParent);
                }
            }

            event.preventDefault();
            event.stopPropagation();
        };
    }

    /**
     * 获取已经上传的媒体文件，即幻灯片（文章）的每一页，供预览使用=======================
     * @returns {Array} 返回对象数组
     */
    function  getSlidePages(){
        var arraySlides=[];
        $(".zyupMediaItem").each(function(index,m){
            var obj={};//幻灯片每一页的对象
            var mediaId=$(this).data("media-id");
            var title=uploadedMedias[mediaId][config.mediaObj.mediaTitle];
            var type=uploadedMedias[mediaId][config.mediaObj.mediaType];
            var memo=uploadedMedias[mediaId][config.mediaObj.mediaMemo];
            var imgSrc=uploadedMedias[mediaId][config.mediaObj.mediaThumbFilePath];
            var filePath=uploadedMedias[mediaId][config.mediaObj.mediaFilePath];
            var className="";

            obj.title=title?title:"";
            obj.memo=memo?memo:"";

            if(type==config.mediaTypes.ppt){
                className+=" zyupHasPpt zyupHasMedia";
            }else if(type==config.mediaTypes._3d){
                className+=" zyupHas3d zyupHasMedia";
            }else if(type==config.mediaTypes.localVideo){
                className+=" zyupHasLocalVideo zyupHasMedia";
            }else if(type==config.mediaTypes.webVideo){
                className+=" zyupHasWebVideo zyupHasMedia";
            }else if(type==config.mediaTypes.file){
                className="zyupHasFile zyupHasMedia";
            }else if(type==config.mediaTypes.flash){
                className+=" zyupHasFlash zyupHasMedia" ;
            }

            if(type==config.mediaTypes.image){
                obj.content='<img src="'+imgSrc+'"/>';
            }else{
                obj.content='<a data-media-type="'+type+'data-media-id="'+mediaId+
                    '" class="'+className+'" target="_blank" href="'+filePath+'"><img src="'+imgSrc+'"/></a>';
            }


            arraySlides.push(obj);
        });

        //将所有的幻灯片页返回
        return arraySlides;
    }

    /**
     * 将输入的标签添加到已添加列表==================
     * @param {String} value 输入的标签
     */
    function showInputTag(value){
        var tpl=$("#zyupTagTpl").html();
        var html=juicer(tpl,{text:value});
        $("#zyupTagList").append($(html));

        $("#zyupTagInput").val("");
    }


    /**
     * 显示步骤对应的面板==========================
     * @param {Number} stepId 需要显示的面板的id
     */
    function showStepPanel(stepId){
        $(".zyupStepPanel").addClass("zyupHidden");
        $(stepId).removeClass("zyupHidden");
        $(".zyupStepCurrent").removeClass("zyupStepCurrent");
        $(".zyupStep[href='"+stepId+"']").addClass("zyupStepCurrent");
    }


    /**
     * 将已经上传的媒体文件记录到uploadedMedias对象中(hash表)=================
     * @param {String} filename 媒体文件名称
     * @param {String} url 媒体文件地址
     * @param {String} mediaId 媒体文件media对象id
     */
    function initUploadedMediasObj(filename,url,mediaId){
        uploadedMedias[mediaId] = {

            //声明一个空的对象，后续将内容全部加入
        };

        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilename] = filename;
        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilePath] = url;
        uploadedMedias[mediaId][config.mediaObj.mediaFilename] = "";
        uploadedMedias[mediaId][config.mediaObj.mediaFilePath] = "";
        uploadedMedias[mediaId][config.mediaObj.mediaType] = config.mediaTypes.image;
        uploadedMedias[mediaId][config.mediaObj.mediaTitle] = "";
        uploadedMedias[mediaId][config.mediaObj.mediaMemo] = "";
    }

    /**
     * 修改的时候初始化详细信息=====================
     * @param {Number} entityId 需要修改的id
     */
    function getEntityDetail(entityId){
        $.ajax({
            url:config.ajaxUrls.getEntityDetail,
            type:"get",
            async:false,
            dataType:"json",
            data:{
               postId:entityId
            },
            success:function(data){
                if(data.success){
                    showEntityDetail(data.entity);
                }else{
                    ajaxReturnErrorHandler(data);
                }
            },
            error:function(){
                showErrorMessage(config.messages.errorTitle,config.messages.networkError);
            }

        });
    }

    /**
     * 修改的时候显示详细信息============================
     * @param {Object} entity 需要显示的信息对象
     */
    function showEntityDetail(entity){
        var i= 0,length;

        //设置标题
        $("#zyupTitleInput").val(entity.postTitle);

        $("#zyupEntityId").val(entity.postId);

        //设置描述
        $("#zyupDescriptionTxt").val(entity.postDescribe);

        //设置缩略图
        $("#zyupThumb").attr("src",entity.postThumb);
        $("#zyupThumbName").val(entity.postThumbFilename);
        $("#zyupThumbUrl").val(entity.postThumb);
    }

    /**
     * 修改的时候初始化已经上传的媒体文件==========================
     * @param {Number} entityId 需要修改的entityId
     */
    function getEntityMedias(entityId){
        $.ajax({
            url:config.ajaxUrls.getEntityMedias,
            type:"get",
            dataType:"json",
            data:{
                postId:entityId
            },
            success:function(data){
                if(data.success){
                    mediasToObject(data.attachments);
                    showEntityMedias(data.attachments);
                }else{
                    ajaxReturnErrorHandler(data);
                }
            },
            error:function(data){
                showErrorMessage(config.messages.errorTitle,config.messages.networkError);
            }

        });
    }

    /**
     * 将后台返回的附件数据，转化成前台需要的数据形式，保存到uploadedMedias===========================
     * @param {Object} attachments 已经上传了的媒体文件数据
     */
    function mediasToObject(attachments){
        var length=attachments.length;
        var i=0;
        for(;i<length;i++){
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaMemo]=
                attachments[i]["attachmentDescribe"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaTitle]=
                attachments[i]["attachmentTitle"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaThumbFilename]=
                attachments[i]["attachmentPreviewFilename"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaThumbFilePath]=
                attachments[i]["attachmentPreviewLocation"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaFilename]=
                attachments[i]["attachmentMediaFilename"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaFilePath]=
                attachments[i]["attachmentMediaLocation"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaType]=
                attachments[i]["attachmentType"];
        }
    }

    /**
     * 修改的时候显示已经上传的媒体文件===============
     * @param {Object} attachments 已经上传了的媒体文件数据(hash表)
     */
    function showEntityMedias(attachments){
        var tpl=$("#zyupCompleteLiTpl").html();
        var html="";
        var iframeSrc="";
        var mediaType="";
        var length=attachments.length;
        var i=0;
        for(;i<length;i++){

            mediaType=attachments[i]["attachmentType"];


            html+=juicer(tpl,{
                classString:"",
                mediaType:mediaType,
                mediaId:attachments[i]["attachmentId"],
                thumbSrc:attachments[i]["attachmentPreviewLocation"],
                filename:attachments[i]["attachmentMediaFilename"]
            });
        }
        $("#zyupMediaList").html(html);

    }

    /**
     * 提交前预览========================
     */
    function preview(){
        var data={};
        data.title=$("#zyupTitleInput").val();
        data.date=functions.formatDate();
        data.description=$("#zyupDescriptionTxt").val();
        data.medias=getSlidePages();
        var tpl=$("#zyupUploadPreviewTpl").html();
        var html=juicer(tpl,data);
        $("#zyupPreview").html(html);
    }

    return {
        drag:drag,
        fileIdToMediaId:fileIdToMediaId,
        fileUploadHandler:null,
        fileWhichUpload:null,
        uploadedMedias:uploadedMedias,

        /**
         * ===========================
         */
        createThumbUploader:function(){
            functions.createQiNiuUploader({
                maxSize:config.uploader.sizes.img,
                filter:config.uploader.filters.img,
                uploadBtn:"zyupThumbUploadBtn",
                multiSelection:false,
                uploadContainer:"zyupThumbContainer",
                uploadedCb:function(response,file,up){
                    //var imgSrc=response.url;
                    //var imgExt=imgSrc.substring(imgSrc.lastIndexOf("."),imgSrc.length);
                    //var imgSrc=imgSrc.substring(0,imgSrc.lastIndexOf("."))+config.imgSize.middle+img_ext;
                    $("#zyupThumb").attr("src",response.url);
                    $("#zyupThumbName").val(file.name);
                    $("#zyupThumbUrl").val(response.url);
                }
            });
        },
        /**
         * ===========================
         */
        createImageUploader:function(){
            functions.createQiNiuUploader({
                maxSize:config.uploader.sizes.img,
                filter:config.uploader.filters.img,
                uploadBtn:"zyupUploadImage",
                multiSelection:true,
                uploadContainer:"zyupUploadImageContainer",
                filesAddedCb:function(files){
                    var mediaId = "";
                    var fileLength=files.length;

                    for (var i = 0; i < fileLength; i++) {


                        mediaId = functions.getRandom("random_");
                        fileIdToMediaId[files[i]["id"]] = mediaId;

                        //组装显示的数据
                        var data = {
                            mediaId:mediaId,
                            thumbSrc:config.thumbs.smallThumb,
                            filename:"0%"
                        };

                        //显示列表项
                        var tpl = $("#zyupMediaItemTpl").html();
                        var html = juicer(tpl, data);
                        $("#zyupMediaList").append(html);
                    }

                },
                progressCb:function(file){
                    $(".zyupMediaItem[data-media-id='" + fileIdToMediaId[file.id] + "']").
                        find(".zyupMediaFilename").html(file.percent + "%");
                },
                uploadedCb:function(response,file){
                    $(".zyupMediaItem[data-media-id='" + fileIdToMediaId[file.id] + "']").
                        find(".zyupMediaFilename").html(file.name).end().
                        find(".zyupDelete").removeClass("zyupHidden").end().find(".zyupSmallThumb").
                        attr("src",response.url);

                    initUploadedMediasObj(file.name,response.url,fileIdToMediaId[file.id]);
                }
            });
        },
        /**
         *附件上传句柄
         */
        createFileUploader:function(){
            var me=this;
            this.fileUploadHandler=functions.createQiNiuUploader({
                maxSize:config.uploader.sizes.all,
                filter:config.uploader.filters.zip,
                uploadBtn:"zyupFileUploadBtn",
                uploadContainer:"zyupFileContainer",
                filesAddedCb:function(files,up){
                    me.fileWhichUpload=files[0];
                    $("#zyupFilename").addClass("zyupUnUploaded");
                },
                progressCb:function(file){
                    $("#zyupFilename").text(file.name+"----"+file.percent+"%"+"--点击取消");
                },
                uploadedCb:function(info,file,up){
                    me.fileWhichUpload=null;
                    $("#zyupFilename").text(file.name).removeClass("zyupUnUploaded");
                    $("#zyupFilenameValue").val(file.name);
                    $("#zyupFileUrl").val(info.url);

                }
            });
        },
        /**
         * ========================
         */
        createMediaUploader:function(params){
            functions.createQiNiuUploader({
                maxSize:config.uploader.sizes.all,
                filter:params.filter,
                uploadBtn:params.browseButton,
                multiSelection:false,
                uploadContainer:"zyupAddMediaMenu",
                filesAddedCb:function(files,up){
                    uploadingMediaFile=files[0];
                    currentMediaUploader=up;
                    uploadedMedias[currentMediaId][config.mediaObj.mediaFilename]="0%";
                    $("#zyupBindFileName").text("0%");
                    $("#zyupBindFileInfo").removeClass("zyupHidden");
                },
                progressCb:function(file){
                    $("#zyupBindFileName").text(file.percent + "%");
                },
                uploadedCb:function(response,file,up){
                    uploadingMediaFile=null;
                    currentMediaUploader=null;
                    uploadedMedias[currentMediaId][config.mediaObj.mediaFilename]=file.name;
                    uploadedMedias[currentMediaId][config.mediaObj.mediaFilePath]=response.url;
                    uploadedMedias[currentMediaId][config.mediaObj.mediaType]=params.type;
                    $("#zyupBindFileName").text(file.name);
                }
            });
        },
        /**
         * ==========================
         */
        createMediaThumbUploader:function(){
            functions.createQiNiuUploader({
                maxSize:config.uploader.sizes.img,
                filter:config.uploader.filters.img,
                uploadBtn:"zyupUpdateThumbButton",
                multipartParams:null,
                multiSelection:false,
                uploadContainer:"zyupUpdateThumbContainer",
                filesAddedCb:null,
                progressCb:null,
                uploadedCb:function(response,file){
                    uploadedMedias[currentMediaId][config.mediaObj.mediaThumbFilename]=file.name;
                    uploadedMedias[currentMediaId][config.mediaObj.mediaThumbFilePath]=response.url;
                    $(".zyupMediaItem[data-media-id='" + currentMediaId + "']").
                        find(".zyupMediaFilename").html(file.name).end().find(".zyupSmallThumb").
                        attr("src",response.url);
                    $("#zyupMediaThumb").attr("src",response.url);
                }
            });
        },
        /**
         * 修改作品（资源）函数=============
         * @param {Number} entityId 需要修改的作品（资源）entityId
         */
        editEntity:function(entityId){
            currentEditEntityId=entityId;
            getEntityDetail(entityId);
            getEntityMedias(entityId);
        },

        /**
         * 删除已经上传的文件=========================================
         * @param {Object} target 需要删除的文件的项目中删除按钮span.zyupUnCompleteLi
         */
        deleteUploadedFileHandler:function(target){
            if(confirm(config.messages.deleteConfirm)){
                var mediaId=target.parent().data("media-id");
                uploadedMedias[mediaId]=undefined;
                delete uploadedMedias[mediaId];
                target.parents("li").remove();

                //清空数据
                $("#zyupMediaThumb").attr("src",config.thumbs.defaultThumb);
                $("#zyupMediaTitle").val("");
                $("#zyupMediaMemo").val("");
                $("#zyupBindFileName").text("");
            }
        },

        /**
         * 已经上传的文件列表项点击事件处理==========================================
         * @param {Object} target 点击的项目中的a.zyupMediaItem
         */
        uploadedLiClickHandler:function(target){
            var active=$(".zyupMediaItemActive"),
                currentMediaObj;
            if(active.length!=0){
                active.removeClass("zyupMediaItemActive");
            }

            currentMediaId=target.data("media-id");
            currentMediaObj=uploadedMedias[currentMediaId];

            //设置数据
            $("#zyupMediaThumb").attr("src",currentMediaObj[config.mediaObj.mediaThumbFilePath]);
            $("#zyupMediaTitle").val(currentMediaObj[config.mediaObj.mediaTitle]);
            $("#zyupMediaMemo").val(currentMediaObj[config.mediaObj.mediaMemo]);

            if(currentMediaObj[config.mediaObj.mediaFilename]){
                $("#zyupBindFileName").text(currentMediaObj[config.mediaObj.mediaFilename]);
                $("#zyupBindFileInfo").removeClass("zyupHidden");
            }else{
                $("#zyupBindFileInfo").addClass("zyupHidden");
            }


            //控制类
            target.addClass("zyupMediaItemActive");

            $("#zyupContent").removeClass("zyupHidden");

        },
        /**
         * ============================
         * @param value
         */
        setMediaTitle:function(value){
            uploadedMedias[currentMediaId][config.mediaObj.mediaTitle]=value;
        },
        /**
         * ==================
         */
        deleteBindFile:function(){
            if(confirm(config.messages.confirmDelete)){
                if(currentMediaUploader){
                    currentMediaUploader.removeFile(uploadingMediaFile);
                    currentMediaUploader.stop();
                }

                uploadedMedias[currentMediaId][config.mediaObj.mediaFilename]="";
                uploadedMedias[currentMediaId][config.mediaObj.mediaFilePath]="";
                uploadedMedias[currentMediaId][config.mediaObj.mediaType]=config.mediaTypes.image;

                $("#zyupBindFileName").text("");
                $("#zyupBindFileInfo").addClass("zyupHidden");
            }
        },
        /**
         * ================================
         * @param value
         */
        setMediaMemo:function(value){
            uploadedMedias[currentMediaId][config.mediaObj.mediaMemo]=value;
        },



        /**
         * 上传的步骤控制=========================
         * @param {Number} stepId 需要显示的面板的id
         * @returns {boolean} 如果不可点的时候，需要返回false
         */
        stepHandler:function(stepId){
            if(stepId!="#zyupStep1"){
                if($("#zyupTitleInput").val()==""||$("#zyupThumbName").val()==""||
                    $("#zyupFilenameValue").val()==""||$("#zyupTagList li").length==0){
                    $().toastmessage("showErrorToast",config.messages.stepOneUnComplete);
                    return false;
                }
            }

            if(stepId=="#zyupStep3"){

                //判断第二中的内容是否都已经填写完整。

                if(!$.isEmptyObject(uploadedMedias)){

                    for(var obj in uploadedMedias){

                        if(uploadedMedias[obj][config.mediaObj.mediaThumbFilename].indexOf("%")!=-1&&
                            uploadedMedias[obj][config.mediaObj.mediaThumbFilename].indexOf(".")==-1){
                            $().toastmessage("showErrorToast",config.messages.stepTwoUnComplete);
                            return false;
                        }

                        if(uploadedMedias[obj][config.mediaObj.mediaFilename].indexOf("%")!=-1&&
                            uploadedMedias[obj][config.mediaObj.mediaFilename].indexOf(".")==-1){
                            $().toastmessage("showErrorToast",config.messages.stepTwoUnComplete);
                            return false;
                        }
                    }
                }else{
                    $().toastmessage("showErrorToast",config.messages.stepTwoUnComplete);
                    return false;
                }

                //显示
                preview();
            }

            showStepPanel(stepId);

            //一定要在页面显示后初始化，不然ie里面无法使用上传插件
            /*if(stepId=="#zyupStep2"&&!step2UploaderInit){
                this.createMediaUploader({type:config.mediaTypes.localVideo,browseButton:"zyupUploadMp4",
                    filter:config.uploader.uploader.video});
                this.createMediaUploader({type:config.mediaTypes._3d,browseButton:"zyupUpload3D",
                    filter:config.uploader._3d});

                step2UploaderInit=true;
            }*/
        },

        /**
         * 表单提交=========================
         */
        ajaxUploadFormHandler:function(){
            var url=config.ajaxUrls.uploadFormAction;
            var assets=[];
            functions.showLoading();
            $(".zyupMediaItem").each(function(index,m){
                uploadedMedias[$(this).data("media-id")][config.mediaObj.mediaPos]=index+1;
                assets.push(uploadedMedias[$(this).data("media-id")]);
            });

            if(currentEditEntityId){
                url=config.ajaxUrls.uploadFormEditAction;
            }
            $("#zyupForm").ajaxSubmit({
                url:url,
                type:"post",
                data:{
                    attachmentJson:JSON.stringify(uploadedMedias)
                },
                dataType:"json",
                success:function (data) {
                    if(data.success){
                        showSuccessMessage(config.messages.successTitle,config.messages.optSuccRedirect);
                        setTimeout(function(){
                            window.location.href="admin/article";
                        },3000);
                    }else{
                        ajaxReturnErrorHandler(data);
                    }
                },
                error:function (data) {
                    ajaxErrorHandler();
                }
            });
        },
        /**
         * 删除标签=====================
         * @param {Object} target 点击的a
         */
        deleteTagHandler:function(target){
            target.parent().remove();

            var value=target.text();

            addedTags[value]=undefined;
            delete addedTags[value];
        },

        /**
         * 标签输入栏的事件====================
         */
        tagInputHandler:function(value){
            if(value.trim()&&!addedTags[value]){
                addedTags[value]=true;
                showInputTag(value);
            }
        },
        /**
         * =========================
         * 清空编辑时留下的数据，新建、修改作品（资源）提交时使用
         */
        clearEditData:function(){
            $("#zyupTitleInput").val("");
            $("#zyupTagList").html("");
            $("#zyupDescriptionTxt").val("");
            $("#zyupTagInput").val("");
            $("#zyupMediaIframe").remove();

            $("#zyupThumb").attr("src",config.thumbs.defaultThumb);
            $("#zyupMediaList").html("");
            $("#zyupThumbName").val("");
            $("#zyupThumbUrl").val("");
            $("#zyupEntityId").val("");
            addedTags={};
        },
        /**
         * 播放媒体文件=====================
         * @param {Object} target 点击的元素,a
         */
        showMediaHandler:function(target){

            var content=target.attr("href");
            var img=target.find("img");
            var mediaId=img.data("media-id");
            var mediaType=img.data("media-type");
            var ext="";//文件的后缀,视频文件有mp4和swf
            var tpl=null;

            if(mediaType==config.mediaTypes.image){
                tpl=$("#zyupShowImageTpl").html();
            }else if(mediaType==config.mediaTypes.localVideo){
                ext=content.substr(content.lastIndexOf(".")+1);
                if(ext.toLowerCase()==="mp4"){
                    tpl=$("#zyupShowVideoTpl").html();
                }else{
                    tpl=$("#zyupShowSpecialVideoTpl").html();
                }
            }else if(mediaType==config.mediaTypes.webVideo){
                tpl=$("#zyupShowWebVideoTpl").html();
            }else if(mediaType==config.mediaTypes.ppt){
                if(content==config.resultCode.pptx_upload_error){
                    content=config.messages.pptUploadError;
                }else if(content==config.resultCode.pptx_upload_wait){
                    content=config.messages.pptHasNotUploaded;
                }
                tpl=$("#zyupShowPptTpl").html();
            }else if(mediaType==config.mediaTypes._3d){
                tpl=$("#zyupShow3dTpl").html();
            }else if(mediaType==config.mediaTypes.flash){
                tpl=$("#zyupShowFlashTpl").html();
            }

            //ios移动设备上视频(mp4)使用新窗口播放
            if(ext==="mp4"&&navigator.userAgent.match(/(iPad|iPhone|iPod)/g)!==null){
                window.open(content);
            }else{

                //显示元素界面
                var html=juicer(tpl,{content:content});
                $("#zyupShowMediaPanel").removeClass("zyupHidden");
                $("#zyupShowMediaPanelContent").html(html);
                $("#zyupBlackout").removeClass("zyupHidden");
            }

        },

        /**
         * 关闭显示媒体界面事件句柄===========================
         */
        showMediaPanelCloseHandler:function(){
            $("#zyupShowMediaPanel").addClass("zyupHidden");
            $("#zyupBlackout").addClass("zyupHidden");
            $("#zyupShowMediaPanelContent").html("");
        }

    }
})(config,functions);

