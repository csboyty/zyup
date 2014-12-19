/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 13-9-4
 * Time: 下午6:01
 *上传（新建、修改）作品资源模块
 */
var zyup=(function(){

    var currentEditEntityId=0;
    var addedTags={}; //已经添加的标签
    var uploadedMedias={};
    var step2UploaderInit=false;

    var config={
        thumbs:{
            defaultThumb:"images/app/zyupDefaultThumb.png",
            smallThumb:"images/app/zyupDefaultSmallThumb.png"
        },
        compressSuffix:"-200x200",
        resultCode:{
            post_create_succ:"success",
            pptx_upload_error:"pptNotUploaded",
            pptx_upload_wait:"pptIsUploading"
        },
        ajaxUrls:{
            uploadFileUrl:"/zyup/upload.php",
            getEntityDetail:"#",
            getEntityMedias:"#",
            uploadFormAction:"#",
            uploadFormEditAction:"#"
        },
        iframeSrc:{
            image:"mediaSet/html/zyupImage.html?", //带有问号是因为采用了带src？mediaId的形式，iframe里面会去获取这个mediaId
            ppt:"mediaSet/html/zyupPpt.html?",
            _3d:"mediaSet/html/zyup3d.html?",
            localVideo:"mediaSet/html/zyupLocalVideo.html?",
            file:"mediaSet/html/zyupFile.html?",
            webVideo:"mediaSet/html/zyupWebVideo.html?",
            flash:"mediaSet/html/zyupFlash.html?"
        },
        mediaTypes:{
            thumb:"thumb",
            image:"image",
            ppt:"ppt",
            _3d:"3d",
            localVideo:"localVideo",
            file:"file",
            webVideo:"webVideo",
            flash:"flash"
        },
        mediaTypesPrefix:{
            image:"image",
            ppt:"ppt",
            _3d:"3d",
            localVideo:"localVideo",
            file:"file",
            webVideo:"webVideo",
            flash:"flash"
        },

        //单个媒体对象的信息
        mediaObj:{
            mediaTitle:"mediaTitle",
            mediaMemo:"mediaMemo",
            mediaType:"mediaType",
            mediaThumbFilename:"mediaThumbFilename",
            mediaThumbFilepath:"mediaThumbFilepath",
            mediaFilename:"mediaFilename",
            mediaFilepath:"mediaFilepath"
        },
        mediaFilters:{
            imageFilter:"jpg,gif,png,jpeg",
            pptFilter:"pptx",
            _3dFilter:"3d",
            videoFilter:"mp4",
            fileFilter:"zip,pdf",
            flashFilter:"swf"
        },
        sizes:{
            maxMediaSize:"300m", //最大的媒体文件上传大小
            maxImageSize:"2m" //最大的图片文件上传大小
        },
        messages:{
            errorTitle:"错误提示",
            successTitle:"成功提示",
            operationSuccess:"操作成功！",
            networkError:"网络连接失败，请稍后重试！",
            filenameError:"文件名必须是数字下划线汉字字母,且不能以下划线开头！",
            hasNoMedia:"没有上传媒体文件或者有上传错误的媒体文件，请上传或者删除后再预览！",
            mediaHasNoThumb:"有媒体文件没有上传缩略图，请上传后再预览！",
            stepOneUnComplete:"标题、标签、描述、缩略图等没有填写完整！",
            webVideoError:"请输入通用代码！",
            pptHasNotUploaded:"此资源还没有被上传到资源服务器，暂时不能查看！",
            pptUploadError:"此资源上传到资源服务器出错，无法查看！",
            uploadSizeError:"最大文件大小",
            uploadExtensionError:"只允许上传",
            uploadIOError:"服务器端异常，请刷新后重试！"
        }
    };

    /**
     * 显示错误信息
     * @param {String} title 信息的标题
     * @param {String} content 信息的内容
     */
    function showErrorMessage(title,content){
        console.log(content);
    }

    /**
     * 显示成功的信息
     * @param {String} title 信息的标题
     * @param {String} content 信息的内容
     */
    function showSuccessMessage(title,content){
        console.log(content);
    }

    /**
     * ajax后台返回错误处理
     * @param {Object} data 后台返回的数据对象
     */
    function ajaxReturnErrorHandler(data){
        console.log("ajax error");
    }


    /**
     * 格式化日期
     * @returns {string}  返回格式化的日期
     */
    function toDay(){

        var date=new Date();

        var year=date.getFullYear();

        var month=date.getMonth()+1;

        var day=date.getDate();

        return year+"-"+month+"-"+day;

    }


    /**
     * 产生随机数，可以自带前缀arguments[0]
     * @returns {string} 返回产生的字符串
     */
    function getRandom(){
        var date = new Date();
        var mo = (date.getMonth() + 1) < 10 ? ('0' + '' + (date.getMonth() + 1)) : date.getMonth() + 1;
        var dd = date.getDate() < 10 ? ('0' + '' + date.getDate()) : date.getDate();
        var hh = date.getHours() < 10 ? ('0' + '' + date.getHours()) : date.getHours();
        var mi = date.getMinutes() < 10 ? ('0' + '' + date.getMinutes()) : date.getMinutes();
        var ss = date.getSeconds() < 10 ? ('0' + '' + date.getSeconds()) : date.getSeconds();
        var retValue = date.getFullYear() + '' + mo + '' + dd + '' + hh + '' + mi + '' + ss + '';
        for (var j = 0; j < 4; j++) {
            retValue += '' + parseInt(10 * Math.random()) + '';
        }
        if (arguments.length == 1) {
            return arguments[0] + '' + retValue;
        }else{
            return retValue;
        }
    }

    /**
     * 拖拽函数
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
     * 获取已经上传的媒体文件，即幻灯片（文章）的每一页，供预览使用
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
            var imgSrc=uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath];
            var filepath=uploadedMedias[mediaId][config.mediaObj.mediaFilepath];
            var className="zyupJsClickClass"; //拥有这个类的才会有点击事件，file是直接下载，不加此类

            obj.title=title?title:"";
            obj.memo=memo?memo:"";

            if(type==config.mediaTypes.image){
                className+=" zyupOnlyImage";
            }else if(type==config.mediaTypes.ppt){
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

            obj.content='<a class="'+className+'"  href="'+filepath+'"><img data-media-type="'+type+'" src="'+imgSrc+'" data-media-id="'+mediaId+'" /></a>';

            arraySlides.push(obj);
        });

        //将所有的幻灯片页返回
        return arraySlides;
    }

    /**
     * 设置iframe，并且显示上传的文件的li
     * @param {Object} params 参数对象
     * type（文件类型）,url（文件地址）,iframeSrc（iframe地址）,mediaId（文件media对象id）,filename（文件名）
     */
    function setIframeAndShowLi(params){

        var classString = "zyupMediaItemError"; //没有上传缩略图的文件都会设置此类用以提示
        var thumbSrc =config.thumbs.smallThumb;


        if (params.type == config.mediaTypes.image) {

            //如果是图片，设置缩略图地址为本身（需要获取缩略图地址）
            //var imgSrc=params.url;
            //var imgExt=imgSrc.substring(imgSrc.lastIndexOf("."),imgSrc.length);
            //var imgCompress=imgSrc.substring(0,imgSrc.lastIndexOf("."))+config.imgSize.small+imgExt;
            thumbSrc = params.url;
            classString = "";
        }

        if ($("#zyupMediaList .zyupMediaItemActive").length == 0) {
            classString = classString == "" ? "zyupMediaItemActive" : "zyupMediaItemActive zyupMediaItemError";
            showIframe(params.iframeSrc);
        }

        //组装显示的数据
        var data={
            classString:classString,
            mediaType:params.type,
            mediaId:params.mediaId,
            iframeSrc:params.iframeSrc,
            thumbSrc:thumbSrc,
            filename:params.filename
        };

        //显示列表项
        var tpl=$("#zyupCompleteLiTpl").html();
        var html=juicer(tpl,data);
        $("#zyupMediaList").append(html);
    }

    /**
     * 显示iframe，不采用a的target的原因是单页的时候采用target会有历史记录
     * @param {String} src iframe的地址
     */
    function showIframe(src){
        var iframe=$("#zyupMediaIframe");
        if(iframe.length!=0){
            iframe.remove();
        }
        var tpl=$("#zyupUploadIframeTpl").html();
        var html=juicer(tpl,{src:src});
        $("#zyupColumnRight").append(html);
    }

    /**
     * 设置已经上传的列表第一项为选中状态
     */
    function setFirstActive(){

        //先判断是否有选中状态的
        if($(".zyupMediaItemActive").length==0){
            var firstLi=$("#zyupMediaList li:eq(0)");
            if(firstLi.length!=0){
                firstLi.addClass("zyupMediaItemActive");
                showIframe(firstLi.find("a").attr("href"));
            }
        }
    }

    /**
     * 将输入的标签添加到已添加列表
     * @param {String} value 输入的标签
     */
    function showInputTag(value){
        var tpl=$("#zyupTagTpl").html();
        var html=juicer(tpl,{text:value});
        $("#zyupTagList").append($(html));

        $("#zyupTagInput").val("");
    }

    /**
     * 显示步骤对应的面板
     * @param {Number} stepId 需要显示的面板的id
     */
    function showStepPanel(stepId){
        $(".zyupStepPanel").addClass("zyupHidden");
        $(stepId).removeClass("zyupHidden");
        $(".zyupStepCurrent").removeClass("zyupStepCurrent");
        $(".zyupStep[href='"+stepId+"']").addClass("zyupStepCurrent");
    }


    /**
     * 将已经上传的媒体文件记录到uploadedMedias对象中(hash表)
     * @param {String} type 媒体文件类型
     * @param {String} filename 媒体文件名称
     * @param {String} url 媒体文件地址
     * @param {String} mediaId 媒体文件media对象id
     */
    function setUploadedMediasObj(type,filename,url,mediaId){
        uploadedMedias[mediaId] = {

            //声明一个空的对象，后续将内容全部加入
        };

        if (type == config.mediaTypes.image) {

            //如果是图片媒体，需要同时设置四个信息
            uploadedMedias[mediaId][config.mediaObj.mediaThumbFilename] = filename;
            uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath] = url;
            uploadedMedias[mediaId][config.mediaObj.mediaFilename] = filename;
            uploadedMedias[mediaId][config.mediaObj.mediaFilepath] = url;
        } else {
            uploadedMedias[mediaId][config.mediaObj.mediaFilename] =filename;
            uploadedMedias[mediaId][config.mediaObj.mediaFilepath] = url;
        }

        uploadedMedias[mediaId][config.mediaObj.mediaType] = type;
        uploadedMedias[mediaId][config.mediaObj.mediaTitle] = "";
        uploadedMedias[mediaId][config.mediaObj.mediaMemo] = "";
    }


    /**
     * 上传封面图句柄
     */
    function createThumbUploader(){
        var uploaderThumb = new plupload.Uploader({
            runtimes:"html5,flash",
            multi_selection:false,
            max_file_size:config.sizes.maxImageSize,
            browse_button:"zyupThumbUploadBtn",
            container:"zyupThumbContainer",
            url:config.ajaxUrls.uploadFileUrl,
            flash_swf_url:'/zyup/js/plupload/plupload.flash.swf',
            unique_names:true,
            multipart_params:{
                isThumb:true
            },
            filters:[
                {title:"Image files", extensions:config.mediaFilters.imageFilter}
            ]
        });

        //初始化
        uploaderThumb.init();

        //文件添加事件
        uploaderThumb.bind("FilesAdded", function (up, files) {
            up.start();
        });

        //出错事件
        uploaderThumb.bind("Error", function (up, err) {
            var message=err.message;
            if(message.match("Init")==null){
                if(message.match("size")){
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadSizeError+config.sizes.maxImageSize);
                }else if(message.match("extension")){
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadExtensionError+config.mediaFilters.imageFilter);
                }else{
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                }
            }
            up.refresh();
        });

        //上传完毕事件
        uploaderThumb.bind("FileUploaded", function (up, file, res) {
            var response = JSON.parse(res.response);
            if(response.success){
                //var imgSrc=response.url;
                //var imgExt=imgSrc.substring(imgSrc.lastIndexOf("."),imgSrc.length);
                //var imgSrc=imgSrc.substring(0,imgSrc.lastIndexOf("."))+config.imgSize.middle+img_ext;
                $("#zyupThumb").attr("src",response.url);
                $("#zyupThumbName").val(file.name);
                $("#zyupThumbUrl").val(response.url);
            }else{
                showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
            }
        });
    }

    /**
     * 上传媒体文件句柄
     * @param {String} browseButton 需要设置上传按钮的id
     * @param {String} type 上传的文件类型
     * @param {String} filters 文件筛选器
     */
    function createMediaUploader(browseButton,type,filters){
        var uploaderMedia=new plupload.Uploader({
            runtimes:"html5,flash",
            multi_selection:true,
            max_file_size:config.sizes.maxMediaSize,
            browse_button:browseButton,
            container:"zyupUploadMenu",
            url:config.ajaxUrls.uploadFileUrl,
            flash_swf_url:'/zyup/js/plupload/plupload.flash.swf',
            unique_names:true,
            filters : [
                {title : "Media files", extensions : filters}
            ]
        });

        //初始化
        uploaderMedia.init();

        //根据type生成mediaId,和iframe的页面
        var mediaIdsHash = {}; //一个file.id和媒体mediaId的关联hash，因为要传多个文件，需要记录下每个mediaId
        var iframeSrcHash = {};

        //文件添加事件
        uploaderMedia.bind("FilesAdded", function (up, files) {
            var mediaId = "";
            var iframeSrc = "";
            var fileLength=files.length;

            for (var i = 0; i < fileLength; i++) {

                //给mediaId和iframe页面名称赋值
                if (type == config.mediaTypes.localVideo) {
                    mediaId = getRandom(config.mediaTypesPrefix.localVideo);
                    iframeSrc = config.iframeSrc.localVideo;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                } else if (type == config.mediaTypes._3d) {
                    mediaId = getRandom(config.mediaTypesPrefix._3d);
                    iframeSrc = config.iframeSrc._3d;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                } else if (type == config.mediaTypes.ppt) {
                    mediaId = getRandom(config.mediaTypesPrefix.ppt);
                    iframeSrc = config.iframeSrc.ppt;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                } else if (type == config.mediaTypes.image) {
                    mediaId = getRandom(config.mediaTypesPrefix.image);
                    iframeSrc = config.iframeSrc.image;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                } else if (type == config.mediaTypes.file) {
                    mediaId = getRandom(config.mediaTypesPrefix.file);
                    iframeSrc = config.iframeSrc.file;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                } else if (type == config.mediaTypes.flash) {
                    mediaId = getRandom(config.mediaTypesPrefix.flash);
                    iframeSrc = config.iframeSrc.flash;
                    mediaIdsHash[files[i]["id"]] = mediaId;
                    iframeSrcHash[files[i]["id"]] = iframeSrc;
                }


                //组装显示的数据
                var data = {
                    mediaId:mediaId,
                    thumbSrc:config.thumbs.smallThumb,
                    filename:files[i]["name"]
                };

                //显示列表项
                var tpl = $("#zyupUnCompleteLiTpl").html();
                var html = juicer(tpl, data);
                $("#zyupMediaList").append(html);

                //隐藏菜单栏
                $("#zyupUploadMenu").css("height", 0);
            }

            //开始上传
            up.start();

        });

        //文件上传进度条事件
        uploaderMedia.bind("UploadProgress", function (up, file) {
            $(".zyupUnCompleteLi[data-media-id='" + mediaIdsHash[file.id] + "']").find(".zyupPercent").html(file.percent + "%");

        });

        //出错事件
        uploaderMedia.bind("Error", function (up, err) {

            var message=err.message;
            if(message.match("Init")==null){
                if(message.match("size")){
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadSizeError+config.sizes.maxImageSize);
                }else if(message.match("extension")){
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadExtensionError+config.mediaFilters.imageFilter);
                }else{
                    showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                }
            }
            up.refresh();
        });

        //上传完毕事件
        uploaderMedia.bind("FileUploaded", function (up, file, res) {
            var response = JSON.parse(res.response);
            if (response.success) {

                //存在对应的未完成li，说明在上传的过程中没有被删除，应该做处理
                var uncompleteLi=$(".zyupUnCompleteLi[data-media-id='" + mediaIdsHash[file.id] + "']");

                if(uncompleteLi.length){

                    //移除上传时候的li
                    uncompleteLi.remove();


                    //下面一节使用封装了的函数
                    var iframeSrc=iframeSrcHash[file.id] + mediaIdsHash[file.id];

                    if(type==config.mediaTypes.ppt){
                        setUploadedMediasObj(type,file.name,config.resultCode.pptx_upload_wait,mediaIdsHash[file.id]);
                    }else{
                        setUploadedMediasObj(type,file.name,response.url,mediaIdsHash[file.id]);
                    }


                    setIframeAndShowLi({
                        type:type,
                        url:response.url,
                        iframeSrc:iframeSrc,
                        mediaId:mediaIdsHash[file.id],
                        filename:file.name
                    });

                }
            } else {
                showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
            }
        });
    }

    /**
     * 修改的时候初始化详细信息
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
     * 修改的时候显示详细信息
     * @param {Object} entity 需要显示的信息对象
     */
    function showEntityDetail(entity){
        var i= 0,length;

        //设置标题
        $("#zyupTitleInput").val(entity.postTitle);

        $("#zyupEntityId").val(entity.postId);

        //设置标签
        var tagTpl=$("#zyupTagsTpl").html();
        var html=juicer(tagTpl,{tags:entity.postTags});
        $("#zyupTagList").html(html);
        length=entity.postTags.length;

        //记录下已经输入的tag
        for(i;i<length;i++){
            addedTags[entity.postTags[i]]=true;
        }

        //设置描述
        $("#zyupDescriptionTxt").val(entity.postDescribe);

        //设置缩略图
        $("#zyupThumb").attr("src",entity.postThumb);
        $("#zyupThumbName").val(entity.postThumbFilename);
        $("#zyupThumbUrl").val(entity.postThumb);
    }

    /**
     * 修改的时候初始化已经上传的媒体文件
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
     * 将后台返回的附件数据，转化成前台需要的数据形式，保存到uploadedMedias
     * @param {Object} attachments 已经上传了的媒体文件数据
     */
    function mediasToObject(attachments){
        var length=attachments.length;
        var i=0;
        for(;i<length;i++){
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaMemo]=attachments[i]["attachmentDescribe"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaTitle]=attachments[i]["attachmentTitle"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaThumbFilename]=attachments[i]["attachmentPreviewFilename"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaThumbFilepath]=attachments[i]["attachmentPreviewLocation"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaFilename]=attachments[i]["attachmentMediaFilename"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaFilepath]=attachments[i]["attachmentMediaLocation"];
            uploadedMedias[attachments[i]["attachmentId"]][config.mediaObj.mediaType]=attachments[i]["attachmentType"];
        }
    }

    /**
     * 修改的时候显示已经上传的媒体文件
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
            if(mediaType==config.mediaTypes.localVideo) {
                iframeSrc=config.iframeSrc.localVideo+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes._3d){
                iframeSrc=config.iframeSrc._3d+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes.ppt){
                iframeSrc=config.iframeSrc.ppt+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes.webVideo){
                iframeSrc=config.iframeSrc.webVideo+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes.image){
                iframeSrc=config.iframeSrc.image+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes.file){
                iframeSrc=config.iframeSrc.file+attachments[i]["attachmentId"];
            }else if(mediaType==config.mediaTypes.flash){
                iframeSrc=config.iframeSrc.flash+attachments[i]["attachmentId"];
            }

            html+=juicer(tpl,{
                classString:"",
                mediaType:mediaType,
                mediaId:attachments[i]["attachmentId"],
                iframeSrc:iframeSrc,
                thumbSrc:attachments[i]["attachmentPreviewLocation"],
                filename:attachments[i]["attachmentMediaFilename"]
            });
        }
        $("#zyupMediaList").html(html);

    }

    /**
     * 提交前预览
     */
    function preview(){
        var data={};
        data.title=$("#zyupTitleInput").val();
        data.date=toDay();
        data.description=$("#zyupDescriptionTxt").text();
        data.medias=getSlidePages();
        var tpl=$("#zyupUploadPreviewTpl").html();
        var html=juicer(tpl,data);
        $("#zyupPreview").html(html);
    }

    return {
        drag:drag,
        config:config,
        uploadedMedias:uploadedMedias,
        showErrorMessage:showErrorMessage,

        /**
         * 修改作品（资源）函数
         * @param {Number} entityId 需要修改的作品（资源）entityId
         */
        editEntity:function(entityId){
            currentEditEntityId=entityId;
            getEntityDetail(entityId);
            getEntityMedias(entityId);
        },

        /**
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
         * 公开的创建上传句柄函数
         * @param {Object} obj 参数数组
         * type（需要创建上传句柄的类型），browreButton（需要设置上传按钮的id），filters（文件筛选器）
         */
        createUploader:function(obj){
            if(obj.type==config.mediaTypes.thumb){
                createThumbUploader();
            }else{
                createMediaUploader(obj.browseButton,obj.type,obj.filters)
            }
        },

        /**
         * 网络视频输入控制,检测是否合规
         * @param {String} videoUrl 输入的网络视频地址
         */
        webVideoInputHandler:function(videoUrl){
            if(videoUrl.trim().match(/^<iframe/)!=null){

                //防止后台json(php的json_decode)解析出错，将双引号改成单引号
                var filename=videoUrl.replace(/["]/g,"'");

                //生成mediaId
                var mediaId=getRandom(config.mediaTypesPrefix.webVideo);

                //设置uploadedMedias对象
                setUploadedMediasObj(config.mediaTypes.webVideo,filename,filename,mediaId);


                //设置列表中的值
                setIframeAndShowLi({
                    type:config.mediaTypes.webVideo,
                    url:filename,
                    iframeSrc:config.iframeSrc.webVideo+mediaId,
                    mediaId:mediaId,
                    filename:filename
                });

                $("#zyupWebVideoPanel").addClass("zyupHidden");
                $("#zyupBlackout").addClass("zyupHidden");
                $("#zyupWebVideoInput").val("");
                $("#zyupWebVideoPanelContent .error").remove();
            }else{
                $("#zyupWebVideoPanelContent").append($("<label class='error'>"+config.messages.webVideoError+"</label>"));
            }
        },

        /**
         * 删除已经上传的文件
         * @param {Object} target 需要删除的文件的项目中删除按钮span.zyupUnCompleteLi
         */
        deleteUploadedFileHandler:function(target){
            if(confirm("确定删除吗？")){
                var mediaId=target.parent().data("media-id");
                uploadedMedias[mediaId]=undefined;
                delete uploadedMedias[mediaId];
                target.parents("li").remove();

                //让第一个选中
                var lis=$("#zyupMediaList li");
                if(lis.not(".zyupUnCompleteLi").length!=0){
                    lis.removeClass("zyupMediaItemActive");
                    lis.eq(0).addClass("zyupMediaItemActive");
                    showIframe(lis.eq(0).find("a").attr("href"));
                    $("#zyupMediaList").scrollTop(0);
                }else{
                    $("#zyupMediaIframe").remove();
                }
            }
        },

        /**
         * 已经上传的文件列表项点击事件处理
         * @param {Object} target 点击的项目中的a.zyupMediaItem
         */
        uploadedLiClickHandler:function(target){
            var active=$(".zyupMediaItemActive");
            if(active.length!=0){

                //如果可以显示其他列表项，要删除active类
                active.removeClass("zyupMediaItemActive");
            }

            //设置媒体类型
            var type=target.data("media-type");

            if(type==config.mediaTypes.localVideo){
                $("#zyupCurrentType").text("本地视频");
            }else if(type==config.mediaTypes._3d){
                $("#zyupCurrentType").text("3d文件");
            }else if(type==config.mediaTypes.ppt){
                $("#zyupCurrentType").text("ppt文件");
            }else if(type==config.mediaTypes.image){
                $("#zyupCurrentType").text("图片");
            }else if(type==config.mediaTypes.webVideo){
                $("#zyupCurrentType").text("网络视频");
            }else if(type==config.mediaTypes.file){
                $("#zyupCurrentType").text("文件");
            }else if(type==config.mediaTypes.flash){
                $("#zyupCurrentType").text("flash");
            }

            //控制类
            target.addClass("zyupMediaItemActive");

            var src=target.attr("href");
            showIframe(src);
        },



        /**
         * 上传的步骤控制
         * @param {Number} stepId 需要显示的面板的id
         * @returns {boolean} 如果不可点的时候，需要返回false
         */
        stepHandler:function(stepId){
            if(stepId=="#zyupStep2"){
                if($("#zyupTitleInput").val()==""||$("#zyupTagList li").length==0||$("#zyupThumbName").val()==""){
                    showErrorMessage(config.messages.errorTitle,config.messages.stepOneUnComplete);
                    return false;
                }

                setFirstActive();
            }else if(stepId=="#zyupStep3"){

                //判断第二中的内容是否都已经填写完整。

                if($(".zyupMediaItem").length!=0&&$(".zyupUnCompleteLi").length==0){

                    for(var obj in uploadedMedias){

                        //如果有媒体文件没有传缩略图，则不能到第三步
                        if(!uploadedMedias[obj][config.mediaObj.mediaThumbFilename]){
                            showErrorMessage(config.messages.errorTitle,config.messages.mediaHasNoThumb);
                            return false;
                        }
                    }
                }else{
                    showErrorMessage(config.messages.errorTitle,config.messages.hasNoMedia);
                    return false;
                }

                //显示
                preview();
            }

            showStepPanel(stepId);

            //一定要在页面显示后初始化，不然ie里面无法使用上传插件
            if(stepId=="#zyupStep2"&&!step2UploaderInit){
                this.createUploader({type:this.config.mediaTypes.localVideo,
                    browseButton:"zyupUploadLocalVideo",filters:this.config.mediaFilters.videoFilter});
                this.createUploader({type:this.config.mediaTypes._3d,
                    browseButton:"zyupUpload3d",filters:this.config.mediaFilters._3dFilter});
                this.createUploader({type:this.config.mediaTypes.ppt,
                    browseButton:"zyupUploadPpt",filters:this.config.mediaFilters.pptFilter});
                this.createUploader({type:this.config.mediaTypes.image,
                    browseButton:"zyupUploadImage",filters:this.config.mediaFilters.imageFilter});
                this.createUploader({type:this.config.mediaTypes.file,
                    browseButton:"zyupUploadFile",filters:this.config.mediaFilters.fileFilter});
                this.createUploader({type:this.config.mediaTypes.flash,
                    browseButton:"zyupUploadFlash",filters:this.config.mediaFilters.flashFilter});

                step2UploaderInit=true;
            }
        },

        /**
         * 表单提交
         */
        ajaxUploadFormHandler:function(){
            var url=config.ajaxUrls.uploadFormAction;
            var order={};
            $(".zyupMediaItem").each(function(index,m){
                order[$(this).data("media-id")]=index+1;
            });

            if(currentEditEntityId){
                url=config.ajaxUrls.uploadFormEditAction;
            }
            $("#zyupForm").ajaxSubmit({
                url:url,
                type:"post",
                data:{
                    attachmentJson:JSON.stringify(uploadedMedias),
                    orderJson:JSON.stringify(order)
                },
                dataType:"json",
                success:function (data) {
                    if(data.success&&data.resultCode==DE.config.resultCode.post_create_succ){
                        showSuccessMessage(config.messages.successTitle,config.messages.operationSuccess);



                    }else{
                        ajaxReturnErrorHandler(data);
                    }
                },
                error:function (data) {
                    showErrorMessage(config.messages.errorTitle,config.messages.networkError);
                }
            });
        },

        /**
         * 删除标签
         * @param {Object} target 点击的a
         */
        deleteTagHandler:function(target){
            target.parent().remove();

            var value=target.text();

            addedTags[value]=undefined;
            delete addedTags[value];
        },

        /**
         * 标签输入栏的事件
         */
        tagInputHandler:function(value){
            if(value.trim()&&!addedTags[value]){
                addedTags[value]=true;
                showInputTag(value);
            }
        },

        /**
         * 播放媒体文件
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
         * 显示网络视频输入界面事件句柄
         */
        webVideoPanelShowHandler:function(){
            $("#zyupWebVideoPanel").removeClass("zyupHidden");
            $("#zyupBlackout").removeClass("zyupHidden");
        },

        /**
         * 关闭网络视频输入界面事件句柄
         */
        webVideoPanelCloseHandler:function(){
            $("#zyupWebVideoPanel").addClass("zyupHidden");
            $("#zyupBlackout").addClass("zyupHidden");
        },

        /**
         * 关闭显示媒体界面事件句柄
         */
        showMediaPanelCloseHandler:function(){
            $("#zyupShowMediaPanel").addClass("zyupHidden");
            $("#zyupBlackout").addClass("zyupHidden");
            $("#zyupShowMediaPanelContent").html("");
        }

    }
})();

