// страница загружена
$(document).ready(function() {
	$.ajaxSetup({'cache': false});
	
	localStorage.setItem('loading_files', 'false');
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
		if (loading == 'true') $('#loader_list').show();
	}, 1000);
	
	// получить список файлов
    $.getJSON('server/get_file_list.php',
    function(data)
    {
	    if (!data.res)
	    {
	 	    $('#counter_files').text(data.data.length);
	        
			var select = $('#file_list');
			select.empty();
	        
			$.each(data.data, function(index, item)
	        {
	            if (item) 
	            {
		            arrItem = item.split(delimiter);
		            select.append('<li class="list-group-item list-group-item-action flex-column align-items-start">' + arrItem[1] + 
		            '<div class="d-flex w-100 justify-content-between">' + 
		            '<a href="data/' + arrItem[1] + '" id="dl_' + arrItem[1] + '">' + arrItem[1] + '</a>' + 
		            '<button type="button" class="btn btn-danger btn-sm" id="dl_' + arrItem[1] + '">Удалить</button>' + 
		            '</div></li>');
		        }
	        });
        }
        else 
		{
			bootbox.alert(data.res);
		}
		
		$('#loader_list').hide();	
		localStorage.setItem('loading_files', 'false');		 
    }); 
}

// удалить файл (функция)
function deleteFile(fileName, password) 
{
	$.getJSON('server/delete_file.php', 
	{
        file: String(fileName),
        password: String(password) 
    },
	function(data)
	{	
		if (!data) 
		{
			loadFileList();
		}
		else  
		{	
			bootbox.alert(data);
		};
	});
}

// нажатие на кнопку удалить
$('#file_list').on('click', 'button', function()
{
	event.preventDefault();
	
	var elem = $(this);
	var file = elem.attr('id').substring(3);
    
	bootbox.confirm(
	{
	    message: "Удалить файл <b>" + file + "</b>?",
	    buttons: {
	        confirm: {
	            label: 'Да',
	            className: 'btn-success'
	        },
	        cancel: {
	            label: 'Нет',
	            className: 'btn-danger'
	        }
	    },
	    callback: function(result) {
        if (result) 
        	bootbox.prompt(
        	{
				title: "Введите пароль:",
			    inputType: 'password',
			    callback: function(result) {
					if (result)
					{
						deleteFile(file, result);
					}
				}
			}); 
	    }
    });
});