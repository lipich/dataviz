<?php
include("config.php");

$file = $storage . $_GET['file'];
$file_thrash = $storage . "_" . substr($_GET['file'], 0, -4) . "_" . date('m-d-Y-His') . ".csv";
$password = $_GET['password'];

if ($password === $delete_password)
{
	$res = DeleteFile($file, $file_thrash);
}
else
{ 
	$res = "Неверный пароль!";
}

echo json_encode($res);

// удалить файл
function DeleteFile($file, $file_thrash)
{
	try
	{
		if (file_exists($file)) 
		{
			rename($file, $file_thrash);
		}
		else
		{
			return "Указанного файла не существует";
		}
		
		return null;
	}
	catch (Exception $e)
	{
		return "Ошибка удаления файла. Подробнее: " . $e->getMessage();		
	}
}
?>