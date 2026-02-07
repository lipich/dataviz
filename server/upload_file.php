<?php
include("config.php");

$html_start = "<html><head><meta charset='utf-8' /><body><p>";
$html_end = "</p></body></html>";

try
{
	if (isset($_POST['submit_upload'])) 
	{
		if ($_FILES['file_data']['name'])
		{
			print($_FILES['file_data']['name']);
			if (!$_FILES['file_data']['error'])
			{			
				if ($_FILES['file_data']['size'] > $max_file_size) 
				{
					unlink($_FILES['file_data']['tmp_name']);
					die($html_start . "Превышен максимальный размер файла 32МБ" . $html_end);
				}

				if (substr($_FILES['file_data']['name'], -4) != ".csv") 
				{
					unlink($_FILES['file_data']['tmp_name']);
					die($html_start . "Недопустимый тип файла. Допустимы только файлы с расширением .csv" . $html_end);
				}
				
				$file = $storage . $_FILES['file_data']['name'];
				
				while (file_exists($file)) $file = $storage . get_file_id() . ".csv";
				
				move_uploaded_file($_FILES['file_data']['tmp_name'], $file);	
			}
			else
			{
				die($html_start . "Ошибка загрузки файла: " . $_FILES['file_data']['error'] . $html_end);
			}
		}
	}

	header("location: ../admin.html");
}
catch (Exception $e)
{
	die($html_start . "Ошибка загрузки файла: " . $e->getMessage() . $html_end);		
}

// генерация имени файла 
function get_file_id()
{
    if (function_exists('com_create_guid'))
    {
        return trim(com_create_guid(), '{}');
    }
    else
    {
        mt_srand((double)microtime() * 10000);  //optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45); // "-"
        $fid = substr($charid, 0, 8).$hyphen
              .substr($charid, 8, 4).$hyphen
              .substr($charid,12, 4).$hyphen
              .substr($charid,16, 4).$hyphen
              .substr($charid,20,12);
        
        $fid = strtolower(substr(md5($fid), 0, 16));
        
        return $fid;
    }
}
?>