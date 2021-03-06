// инициализация страницы
$(function() {
	google.charts.load('current', {'packages': ['corechart', 'line'], 'language': 'ru'});
	//google.charts.load('current', {'packages':['table']});
	//google.charts.load('current', {'packages':['geochart'], 'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'});
});

// получить параметры URL 
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
	}
}

// страница загружена
$(document).ready(function() {
	// отключить кеширование
	$.ajaxSetup({'cache': false});

	// очистить страницу
    $('#row_list').hide();
	hideChart();
	hideShare();

	// отключить состояние загрузки
	localStorage.setItem('loading_files', 'false');
	localStorage.setItem('loading_rows', 'false');
	localStorage.setItem('loading_data', 'false');

	// получить параметры url
	var file = getUrlParameter('file');
	localStorage.setItem('qs_file', file);

	var row = getUrlParameter('row');
	localStorage.setItem('qs_row', row);

	// инициализировать переменную "ссылка для публикации" 
	localStorage.setItem('share_url', "");	
    
    // загрузить список файлов
	loadFileList();
});

// загрузить список файлов данных
function loadFileList()
{	
	var delimiter = "<%%%>"; // разделитель названия ряда и имени файла с данными в массиве
	
	// включить состояние загрузки
	localStorage.setItem('loading_files', 'true');
	
	// таймаут для отображения индикатора загрузки
	setTimeout(function() {
		var loading = localStorage.getItem('loading_files');
		if (loading == 'true') $('#loader_counter').show();
	}, 1000);
	
	// получить список файлов
    $.getJSON('server/get_file_list.php',
    function(data)
    {
	    if (!data.res)
	    {
		    $('#counter_files').text(data.data.length);
	
	        var select = $('#file_list');
	        
	        $.each(data.data, function(index, item)
	        {
	            if (item) 
	            {
		            arrItem = item.split(delimiter);
		            select.append('<a href="#" class="dropdown-item" id="dl_' + arrItem[1] + '" data-pdsa-dropdown-val="' + arrItem[1] + '" onClick="loadRowList(\'' + arrItem[1] + '\', \'' + arrItem[0] + '\')">' + arrItem[0] + '</a>');
		        }
	        });
	        
	        select.append('<div class="dropdown-divider"></div>');
	        select.append('<a class="dropdown-item" href="admin.html"><span class="uploadLink"> + добавить </span></a>');
        }
        else 
		{
			bootbox.alert(data.res);
		}
		
		// выключить состояние загрузки
		$('#loader_counter').hide();
		localStorage.setItem('loading_files', 'false');
		
		// выбрать указанный файл
		setTimeout(function() {
			var selected = localStorage.getItem('qs_file');
			
			// если файл не указан выберем случайный
			if (selected === "undefined") {
				selectedIndex = Math.floor((Math.random() * data.data.length));
				arrItem = data.data[selectedIndex].split(delimiter);
				selected = arrItem[1];
			} else {
				selected += ".csv";
			}

			localStorage.removeItem('qs_file');
			$('#file_list a').filter('[data-pdsa-dropdown-val="' + selected + '"]').trigger('click');
		}, 500);
    });
}

// загрузить список рядов из файла данных
function loadRowList(file, text)
{
	// включить состояние загрузки
	localStorage.setItem('loading_rows', 'true');

	setTimeout(function() {
		var loading = localStorage.getItem('loading_rows');
		if (loading == 'true') $('#loader_list').show();
	}, 1000);

	// очистить список рядов, график, ссылку поделиться и количество выбранных рядов
	$('#row_list').empty();
    hideStatusSelected();
    hideChart();
    hideShare();
 	
	localStorage.setItem('s_file', file);
	localStorage.setItem('s_row', "");	
	localStorage.setItem('n_row', "");	
	
	// получить список рядов из файла
    $.getJSON('server/get_row_list.php',
    {
        file: String(file)
    },
    function(data)
    {
	    if (!data.res)
	    {
		    var i = 1;
			var s_width = parseInt($(window).width());
			if (s_width < 800) s_height = 148; else s_height = 295;
	
	        var select = $('#row_list');
	        select.css('max-height', s_height); 
	        
	        $.each(data.data, function(index, item)
	        {
		        if (item) select.append('<a href="#" class="list-group-item list-group-item-action" id="rl_' + i + '" onClick="loadRowData(\'' + i + '\', \'' + item + '\')">' + item + '</a>');
	            i++;
	        });
	        
	        localStorage.setItem('q_row', i - 1);
			showStatusSelected(0);
		}
        else 
		{
			bootbox.alert(data.res);
		}
		
		// выключить состояние загрузки
		$('#loader_list').hide();
		localStorage.setItem('loading_rows', 'false');
		
		// выбрать указанные ряды
		setTimeout(function() {
			var selected = localStorage.getItem('qs_row');	
			
			// если ряды не указаны выберем первый
			if (selected === "undefined") selected = "1";

			localStorage.removeItem('qs_row');
			arrSelected = selected.split(",");
			for (i = 0; i < arrSelected.length; i++) 
			{
				$('#rl_' + arrSelected[i]).trigger('click');
			}
		}, 500);
    });
    		
    $('#dropdownMenuButton').text(text);
    $('#row_list').show();
    
    // сформировать ссылку "поделиться"
    var arrFile = file.split(".");
	var shareUrl = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
	if (window.location.pathname.indexOf("index.html") == -1) shareUrl += "index.html";
	shareUrl += "?file=" + arrFile[0];
    localStorage.setItem('share_url', shareUrl);
}

// загрузить данные по выбранным рядам
function loadRowData(row, rowName)
{
	// включить состояние загрузки
	localStorage.setItem('loading_data', 'true');

	setTimeout(function() {
		var loading = localStorage.getItem('loading_data');
		if (loading == 'true') $('#loader_data').show();
	}, 1000);

	var rl = $('#rl_' + row);
	
	if (rl.hasClass('active'))
		rl.removeClass('active'); 
	else
		rl.addClass('active');
	
	// загрузить выбранные коды рядов
	var arrRow = localStorage.getItem('s_row').split(",");
	
	if (arrRow[0] == "") arrRow.splice(0, 1);
	
	if (arrRow.indexOf(row) == -1)
		arrRow.push(row);
	else 
		arrRow.splice(arrRow.indexOf(row), 1);
	
	var sRow = arrRow.join().replace(/^,/, '');
	if (sRow == "") hideChart(); 
		
	localStorage.setItem('s_row', sRow);

	showStatusSelected(arrRow.length);
	if (arrRow.length == 0)
	{
		// выключить состояние загрузки
		$('#loader_data').hide();
		localStorage.setItem('loading_data', 'false');
		hideShare();
	}
		
	// загрузить выбранные названия рядов
	var arrRow = localStorage.getItem('n_row').split(",");

	if (arrRow[0] == "") arrRow.splice(0, 1);
	
	if (arrRow.indexOf(rowName) == -1)
		arrRow.push(rowName);
	else 
		arrRow.splice(arrRow.indexOf(rowName), 1);
	
	var nRow = arrRow.join().replace(/^,/, '');
		
	localStorage.setItem('n_row', nRow);
	
	// получить данные по выбранным рядам
	$.getJSON('server/get_row_data.php',
    {
        file: localStorage.getItem('s_file'),
        rows: localStorage.getItem('s_row')
    },
    function(data)
    {
	    if (!data.res)
	    {
			loadChart(data.data);
			showShareButton();
		}
        else 
		{
			bootbox.alert(data.res);
		}
		
		// выключить состояние загрузки
		$('#loader_data').hide();
		localStorage.setItem('loading_data', 'false');
    });
    
    // сформировать ссылку "поделиться"
    var arrShareUrl = localStorage.getItem('share_url').split("&");
    if (sRow == "") {
    	localStorage.setItem('share_url', arrShareUrl[0]);	    
    }
    else {
    	localStorage.setItem('share_url', arrShareUrl[0] + "&row=" + sRow);	    
    }
}

// загрузить график
function loadChart(arrData)
{
    var data = new google.visualization.DataTable();
      
    data.addColumn('string', 'X');
      
    var i;
    var arrLines = localStorage.getItem('n_row').split(",");
    for (i = 0; i < arrLines.length; i++) 
    {
    	data.addColumn('number', arrLines[i]);
	}
      
    data.addRows(arrData);

	// настройки области отображения графика
	var s_indent_h = 30;
	var s_indent_w = 100;
	var s_width = parseInt($(window).width());
	var s_height = 400;	
	if (s_width < 1000) s_indent_w = 70;
	if (s_width < 800) s_indent_w = 60;
	if (s_width < 600) { s_indent_w = 50; s_height = 300; }
	var s_pointSize = 3;
	if ((s_width < 1000) && (arrData.length > 40)) s_pointSize = 0;
	
    var options = {
	    height: s_height,
        chartArea: { left: s_indent_w, top: s_indent_h, width: s_width - s_indent_w * 1.8, height:'70%', backgroundColor: '#ffffff' },
        colors: ['#a52714', '#097138', '#f1ca3a', '#6f9654', '#1c91c0', '#43459d', '#e0440e'],
        legend: { position: 'bottom' },
        backgroundColor: '#fafafa',
        hAxis: { gridlines: {color: '#ccc', count: 5} },
        vAxis: { gridlines: {color: '#ccc', count: 5}, format: 'short' },
        pointSize: s_pointSize
    };

	$('#chart_data').show();
    var chart = new google.visualization.LineChart(document.getElementById('chart_data'));
    //var chart = new google.visualization.Table(document.getElementById('chart_data'));
    chart.draw(data, options);
}

// загрузить карту
function loadMap(arrData)
{
	var data = google.visualization.arrayToDataTable([
		['Страна', 'Население (млн)'],
		['Germany', 70],
		['United States', 300],
		['Brazil', 200],
		['Canada', 80],
		['France', 60],
		['Spain', 50],          
		['Russia', 140],
		['Japan', 130]
	]);
	
	var options = {
		//region: '019',
		//resolution: 'provinces' 
	};
	
	$('#chart_data').show();
	var chart = new google.visualization.GeoChart(document.getElementById('chart_data'));
	chart.draw(data, options);
}

// скрыть график
function hideChart()
{
	$('#chart_data').hide();
}

// показать сколько выбрано рядов
function showStatusSelected(sRow)
{
	var qRow = localStorage.getItem('q_row');
	if (sRow == 0) 
		$('#lblRowCounter').text("Всего рядов: " + qRow);   
	else 
		$('#lblRowCounter').text("Выбрано: " + sRow + " из " + qRow);
}

// скрыть сколько выбрано рядов
function hideStatusSelected()
{
	$('#lblRowCounter').text("");
}

// показать кнопку "поделиться"
function showShareButton()
{
	$('#share').show();
	$('#urlShare').text("");
}

// показать ссылку "поделиться"
function showShareUrl()
{
	$('#urlShare').attr('href', localStorage.getItem('share_url'));
	$('#urlShare').text("Ссылка");
}

// скрыть ссылку "поделиться" 
function hideShare()
{
	$('#share').hide();
	$('#urlShare').text("");
}

