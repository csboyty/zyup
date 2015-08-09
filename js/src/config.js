/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-10-5
 * Time: 下午5:34
 * To change this template use File | Settings | File Templates.
 */
var config={
    baseUrl:"",
    thumbs:{
        defaultThumb:"images/zyup/zyupDefaultThumb.png",
        smallThumb:"images/zyup/zyupDefaultSmallThumb.png"
    },
    mediaTypes:{
        image:1,
        localVideo:2,
        ppt:4,
        _3d:8,
        file:16,
        flash:32
    },
    mediaObj:{
        mediaPos:"pos",
        mediaTitle:"name",
        mediaMemo:"description",
        mediaType:"type",
        mediaThumbFilename:"profile_filename",
        mediaThumbFilePath:"profile_file",
        mediaFilename:"media_filename",
        mediaFilePath:"media_file"
    },
    qiNiu:{
    	upTokenUrl:"http://localhost/idchannel/chinese/wp-admin/admin-ajax.php?action=getUploadToken",
        uploadDomain:'http://qiniu-plupload.qiniudn.com/',
        bucketDomain:"http://id-channel-1.qiniudn.com/",
        swfUrl:"static/backend/js/lib/Moxie.swf"
    },
    uploader:{
        url:"#",
        swfUrl:"static/js/plupload/plupload.flash.swf",
        sizes:{
            all:"5120m",
            img:"2m"
        },
        filters:{
            all:"*",
            zip:"zip,ZIP",
            img:"jpg,JPG,jpeg,JPEG,png,PNG",
            _3d:"zip,ZIP",
            video:"mp4"
        }
    },
    ajaxUrls:{
        getEntityDetail:"#",
        getEntityMedias:"#",
        uploadFormAction:"#",
        uploadFormEditAction:"#"
    },
    messages:{
        confirmDelete:"确定删除吗？",
        stepOneUnComplete:"字段没有填写完整！",
        stepTwoUnComplete:"没有上传文件或者有文件正在上传！"
    }
};
$(document).ready(function(){

    $("input[type='text'],input[type='email']").blur(function(){
        $(this).val($(this).val().trim());
    });

    //火狐里面阻止form提交
    $("input[type='text'],input[type='password']").keydown(function(e){
        if(e.keyCode==13){
            return false;
        }
    });
});
