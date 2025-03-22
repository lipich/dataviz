<?php
include("config.php");

$file = "";
if (isset($_GET['file'])) $file = $storage . $_GET['file'];
if ($file === "") exit(0);  

list($arrDataList, $res) = GetRowList($file);

echo json_encode(array('data' => $arrDataList, 'res' => $res));

// получить список рядов из файла
function GetRowList($file)
{
	$row = "";
	
	try
	{
		$handle = fopen($file, "r");
		
		$row = fgetcsv($handle, 0, ";");
		$row = fgetcsv($handle, 0, ";"); 
		
		unset($row[0]);					
		fclose($handle);
		
    	return array($row, null);
	}
	catch (Exception $e)
	{
		return array(null, "Ошибка загрузки списка рядов из файла. Подробнее: " . $e->getMessage());		
	}
}
?>