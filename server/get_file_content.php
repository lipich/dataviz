<?php
include("config.php");

$file = "";
if (isset($_GET['file'])) $file = $storage . $_GET['file'];
if ($file === "") exit(0);  

$password = $_GET['password'];
if ($password === $delete_password) 
{
    $file_content = file_get_contents($file, true);		
    echo json_encode(array('content'=>$file_content));
}
else 
{
	$res = "Неверный пароль!";
    echo json_encode($res);
}
?>