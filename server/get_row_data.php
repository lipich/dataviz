<?php
include("config.php");

$file = "";
$rows = "";
$start_x = "0";
$end_x = "3000";

if (isset($_GET['file'])) $file = $storage . $_GET['file'];
if (isset($_GET['rows'])) $rows = $_GET['rows'];
if ((isset($_GET['start_x'])) && ($_GET['start_x'] != "null")) $start_x = $_GET['start_x'];
if ((isset($_GET['end_x'])) && ($_GET['end_x'] != "null")) $end_x = $_GET['end_x'];
if (($file === "") or ($rows === "")) exit(0);

$rows = "0," . $rows;
list($arrData, $res) = GetRowData($file, $rows, $start_x, $end_x);

echo json_encode(array('data' => $arrData, 'res' => $res));

// получить данные рядов из файла
function GetRowData($file, $rows, $start_x, $end_x)
{
	$arrRes = array();
	
	try
	{
		$arrRows = explode(",", $rows); 
		$i = 0;
	
		$handle = fopen($file, "r");
		
		$row = fgetcsv($handle, 0, ";");
		$row = fgetcsv($handle, 0, ";");
		while (($row = fgetcsv($handle, 0, ";")) != false) 
		{	
			$j = 0;
			
			if (($row[0] >= $start_x ) && ($row[0] <= $end_x))
			{
				foreach ($arrRows as $rowIndex) 
				{
					$arrRes[$i][$j] = str_replace(",", ".", $row[$rowIndex]);
					
					// если не key values
					if ($j != 0)
					{
						// приводим null
						$arrRes[$i][$j] = $arrRes[$i][$j] == "" ? NULL : (double)$arrRes[$i][$j];
					}
																
					$j++;
				}
			
				$i++;
			}
		}
							
		fclose($handle);

    	return array($arrRes, null);
	}
	catch (Exception $e)
	{
		return array(null, "Ошибка загрузки данных ряда. Подробнее: " . $e->getMessage());		
	}
}
?>