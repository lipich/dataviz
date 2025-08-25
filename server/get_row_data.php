<?php
include("config.php");

$file = "";
$rows = "";
$start_x = "0";
$end_x = "100000";
$delta = "false";

if (isset($_GET['file'])) $file = $storage . $_GET['file'];
if (isset($_GET['rows'])) $rows = $_GET['rows'];
if ((isset($_GET['start_x'])) && ($_GET['start_x'] != "null")) $start_x = $_GET['start_x'];
if ((isset($_GET['end_x'])) && ($_GET['end_x'] != "null")) $end_x = $_GET['end_x'];
if (isset($_GET['delta'])) $delta = $_GET['delta'];
if (($file === "") or ($rows === "")) exit(0);

$rows = "0," . $rows;
list($arrData, $res) = GetRowData($file, $rows, $start_x, $end_x, $delta);

echo json_encode(array('data' => $arrData, 'res' => $res));

// получить данные рядов из файла
function GetRowData($file, $rows, $start_x, $end_x, $delta)
{
	$arrRes = array();
	$arrBuf = array();
	
	try 
	{
		$arrRows = explode(",", $rows); 
		$i = 0;
	
		$handle = fopen($file, "r");
		
		$row = fgetcsv($handle, 0, ";", "\"", "\\");
		$row = fgetcsv($handle, 0, ";", "\"", "\\");
		while (($row = fgetcsv($handle, 0, ";", "\"", "\\")) != false) 
		{	
			$j = 0;
			
			if (($i >= $start_x) && ($i <= $end_x)) 
			{
				foreach ($arrRows as $rowIndex) 
				{
					$arrBuf[$i][$j] = str_replace(",", ".", $row[$rowIndex]);
					
					// если не key values
					if ($j != 0) 
					{
					    // если нужно передавать изменения между значениями (дельту), а не сами значения
					    if ($delta == "true") 
						{  
                            // для значений со второго столбца берем дельту
					        if (($i > $start_x) && ($i <= $end_x))
							{
                                // если значения соседних столбцов не пустые
                                if (($arrBuf[$i][$j] != "") && ($arrBuf[$i - 1][$j] != "")) 
								{
                                    $arrRes[$i][$j] = (double)($arrBuf[$i][$j] - $arrBuf[$i - 1][$j]);
                                } 
								else 
								{
                                    // если пустые, то без дельты -- todo придумать как убрать первый столбец
                                    $arrRes[$i][$j] = $arrBuf[$i][$j] == "" ? NULL : (double)$arrBuf[$i][$j];
                                }  
                            } 
							else 
							{
                                // для первого столбца при дельте значения нет
						        $arrRes[$i][$j] = NULL;
                            }              
                        } 
						else 
						{
                            // если не нужно передавать дельту
						    $arrRes[$i][$j] = $arrBuf[$i][$j] == "" ? NULL : (double)$arrBuf[$i][$j];            
                        }
					} 
					else 
					{
  					    $arrRes[$i][$j] = $arrBuf[$i][$j];
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