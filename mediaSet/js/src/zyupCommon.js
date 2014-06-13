/**
 * User: ty
 * Date: 13-6-13
 * 幻灯片设置媒体文件页面公用js
 */

var zyupCommon = (function(){
    var zyup=window.parent.zyup;
    var uploadedMedias=zyup.uploadedMedias; //已经上传了的媒体文件
    var config=zyup.config;

    return {
        config:config,
        uploadedMedias:uploadedMedias,

        /**
         * 获取当前编辑的mediaId
         * @returns {string} mediaId
         */
        "getMediaId":function(){
            var url=location.href;
            var pos=url.indexOf("?"); //获取参数，因为mediaId将通过参数传递过来
            var mediaId=url.substr(pos+1,url.length-1);

            return mediaId;
        },

        /**
         * 获取压缩后的图片
         * @param imgurl 图片的路径
         * @returns {string} 压缩图片路径
         */
        "getCompressImg":function(imgurl){
            var imgExt=imgurl.substring(imgurl.lastIndexOf("."),imgurl.length);
            var imgSrcCompress=imgurl.substring(0,imgurl.lastIndexOf("."))+config.compressSuffix+imgExt;

            return imgSrcCompress;
        },

        /**
         * 打开设置页面时，设置原来的内容
         * @param mediaId 媒体文件的id
         * @param mediaType 媒体文件的类型
         */
        "setField":function(mediaId,mediaType){

            if(mediaType!=config.mediaTypes.image){
                if(mediaType==config.mediaTypes.webVideo){

                    //网络视频设置不一样
                    if(uploadedMedias[mediaId][config.mediaObj.mediaFilename]){
                        $("#zyupWebInput").val(uploadedMedias[mediaId][config.mediaObj.mediaFilename]);

                        //下面不能使用html函数，html函数会直接播放iframe
                        $("#zyupFileInfo").text(uploadedMedias[mediaId][config.mediaObj.mediaFilename]);
                        //$("#zyupFileInfoDiv").removeClass("zyupHidden");
                        $("#zyupChangeDiv").addClass("zyupHidden");
                    }
                }else{
                    $("#zyupFileInfo").html(uploadedMedias[mediaId][config.mediaObj.mediaFilename]);
                }
            }

            // 设置缩略图
            if(uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath]){

                //设置缩略图,显示压缩后的图片
                $("#zyupMediaThumb").attr("src",uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath]);
            }

            // 设置标题和描述
            if(uploadedMedias[mediaId][config.mediaObj.mediaTitle]){
                $("#zyupMediaTitle").val(uploadedMedias[mediaId][config.mediaObj.mediaTitle]);
            }
            if(uploadedMedias[mediaId][config.mediaObj.mediaMemo]){
                $("#zyupMediaDescription").text(uploadedMedias[mediaId][config.mediaObj.mediaMemo]);
            }
        },

        /**
         * 媒体设置时上传媒体
         * @param filters 媒体文件格式筛选器
         * @param mediaId 媒体文件id
         */
        "createMediaUploader":function(filters,mediaId){
            var mediaUploader=new plupload.Uploader({
                runtimes:"html5",
                multi_selection:false,
                max_file_size:config.sizes.maxMediaSize,
                browse_button:"zyupUploadMediaBtn",
                container:"zyupLeftTop",
                unique_names:true,
                url: config.ajaxUrls.uploadFileUrl,
                //flash_swf_url : '../js/lib/plupload.flash.swf',
                /*multipart_params:{
                    userId:currentUserId
                },*/
                filters : [
                    {title : "Media files", extensions : filters}
                ]
            });

            //初始化
            mediaUploader.init();

            //文件添加事件
            mediaUploader.bind("FilesAdded",function(up,files){

                up.start(); //开始上传

                //影藏按钮
                $("#zyupUploadMediaBtn").addClass("zyupHidden");
            });

            //文件上传进度条事件
            mediaUploader.bind("UploadProgress",function(up,file){
                $("#zyupFileInfo").html(file.percent + '%'+file.name);
            });

            //出错事件
            mediaUploader.bind("Error",function(up,err){

                //一般采用父级别的错误提示
                if(err.message.match("Init")==null){
                    if(err.message.match("size")){
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadSizeError+config.sizes.maxImageSize);
                    }else if(err.message.match("extension")){
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadExtensionError+config.mediaFilters.imageFilter);
                    }else{
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                    }
                }
                up.refresh();


                $("#zyupUploadMediaBtn").removeClass("zyupHidden");
            });

            //上传完毕事件
            mediaUploader.bind("FileUploaded",function(up,file,res){
                var response=JSON.parse(res.response);
                if(response.success){

                    //设置uploaded_medias的值
                    uploadedMedias[mediaId][config.mediaObj.mediaFilename]=file.name;
                    uploadedMedias[mediaId][config.mediaObj.mediaFilepath]=response.url;

                    //设置列表中的值
                    $("#zyupMediaList .zyupMediaItem[data-media-id='"+mediaId+"']",parent.document).find(".zyupMediaFilename").text(file.name);


                    $("#zyupFileInfo").html(file.name);
                    $("#zyupUploadMediaBtn").removeClass("zyupHidden");
                }else{
                    zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                }

            });
        },

        /**
         * 媒体设置时上传缩略图
         * @param mediaId 媒体文件的id
         */
        "createThumbUploader":function(mediaId){
            var thumbUploader=new plupload.Uploader({
                runtimes:"html5",
                multi_selection:false,
                max_file_size:config.sizes.maxImageSize,
                browse_button:"zyupUploadThumbBtn",
                container:"zyupLeftBottom",
                unique_names:true,
                url: config.ajaxUrls.uploadFileUrl,
                //flash_swf_url:'../js/lib/plupload.flash.swf',
                /*multipart_params:{
                    userId:currentUserId
                },*/
                filters : [
                    {title : "Image files", extensions : config.mediaFilters.imageFilter}
                ]
            });

            //初始化
            thumbUploader.init();

            //文件添加事件
            thumbUploader.bind("FilesAdded",function(up,files){

                up.start();//开始上传
            });

            //文件上传进度条事件
            thumbUploader.bind("UploadProgress",function(up,file){
                //$("#"+file.id+" b").html(file.percent + "%");
            });

            //出错事件
            thumbUploader.bind("Error",function(up,err){

                //一般采用父级别的错误提示
                if(err.message.match("Init")==null){
                    if(err.message.match("size")){
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadSizeError+config.sizes.maxImageSize);
                    }else if(err.message.match("extension")){
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadExtensionError+config.mediaFilters.imageFilter);
                    }else{
                        zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                    }
                }
                up.refresh();
            });

            //上传完毕事件
            thumbUploader.bind("FileUploaded",function(up,file,res){

                //和父级别交互操作
                var response=JSON.parse(res.response);
                if(response.success){

                    //设置uploaded_medias的值
                    if(uploadedMedias[mediaId][config.mediaObj.mediaType]==config.mediaTypes.image){

                        //如果是图片媒体，需要同时设置四个信息
                        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilename]=file.name;
                        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath]=response.url;
                        uploadedMedias[mediaId][config.mediaObj.mediaFilename]=file.name;
                        uploadedMedias[mediaId][config.mediaObj.mediaFilepath]=response.url;
                    }else{
                        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilename]=file.name;
                        uploadedMedias[mediaId][config.mediaObj.mediaThumbFilepath]=response.url;
                    }

                    //设置缩略图，显示压缩后的图片
                    var imgSrc=response.url;
                    //var imgExt=imgSrc.substring(imgSrc.lastIndexOf("."),imgSrc.length);
                    //var imgCompressSrc=imgSrc.substring(0,imgSrc.lastIndexOf("."))+config.compressSuffix+imgExt;
                    $("#zyupMediaThumb").attr("src",imgSrc);

                    var parentA=$("#zyupMediaList .zyupMediaItem[data-media-id='"+mediaId+"']",parent.document);


                    //设置列表中的缩略图
                    parentA.find(".zyupSmallThumb").attr("src",imgSrc);
                    parentA.parent().removeClass("zyupMediaItemError");


                    //如果是图片类型，还需要设置文件名
                    if(mediaId.match(config.mediaTypesPrefix.image)!=null){
                        parentA.find(".zyupMediaFilename").text(file.name);
                    }

                }else{
                    zyup.showErrorMessage(config.messages.errorTitle,config.messages.uploadIOError);
                }
            });
        }
    };
})();