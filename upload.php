<?php
/**
 * Created by JetBrains PhpStorm.
 * User: ty
 * Date: 14-2-12
 * Time: 下午3:08
 * To change this template use File | Settings | File Templates.
 */
$targetDir="./uploads/";

if(is_uploaded_file($_FILES["file"]["tmp_name"])){

    //如果是表单上传的文件，将文件复制到目标目录

    if(move_uploaded_file($_FILES["file"]["tmp_name"],$targetDir.$_POST["name"])){
        $obj=array("success"=>true,"url"=>"http://localhost/zyup/uploads/".$_POST["name"],"name"=>$_FILES["file"]["name"]);
        echo json_encode($obj);
    }else{
        $obj=array("error"=>true);
        echo json_encode($obj);
    }

}