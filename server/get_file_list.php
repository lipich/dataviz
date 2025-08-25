<?php
include("config.php");

list($arrFileList, $res) = GetFileList($storage);

echo json_encode(array('data' => $arrFileList, 'res' => $res));

// получить список файлов данных
function GetFileList($storage)
{
	$files = array();
	$i = 0;

	try
	{
		foreach (scandir($storage) as $file) 
		{
	        if ($file[0] == ".") continue;
	        if ($file[0] == "_") continue;
			
			$handle = fopen($storage . $file, "r");
			$row = implode(fgetcsv($handle, 0, ";", "\"", "\\")); 
	
			$files[$i] = $row . "<%%%>" . $file; // для удобства сортировки перешел на одномерный массив
			
	        $i++;
	
			fclose($handle);
	    }

		usort($files, 'ruSort');
				
    	return array($files, null);
    }
    catch (Exception $e)
    {
		return array(null, "Ошибка загрузки списка файлов. Подробнее: " . $e->getMessage());		
    }
}

// сортировка русского алфавита
function ruSort($a, $b)
{
    $alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"; 
    
    $a = mb_strtolower($a);
    $b = mb_strtolower($b);

    for ($i = 0; $i < mb_strlen($a); $i++) 
    {
        if (mb_substr($a, $i, 1) == mb_substr($b, $i, 1)) 
        {
            continue;
        }
        
        if ($i > mb_strlen($b)) 
        {
            return 1;
        }
        
        if (mb_strpos($alphabet, mb_substr($a, $i, 1)) > mb_strpos($alphabet, mb_substr($b, $i, 1))) 
        {
            return 1;
        } 
        else 
        {
            return -1;
        }
    }
}
?>