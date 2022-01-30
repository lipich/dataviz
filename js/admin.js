// страница загружена
$(document).ready(function() {
  $.ajaxSetup({'cache': false});
  
  $('#alert_success').hide();
  localStorage.setItem('loading_files', 'false');
  loadFileList();
});

// загрузить список файлов данных
function loadFileList() {
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
  function(data) {
    if (!data.res) {
      $('#counter_files').text(data.data.length);

      var select = $('#file_list');
      select.empty();
        
      $.each(data.data, function(index, item) {
        if (item) {
          arrItem = item.split(delimiter);
          select.append('<li class="list-group-item list-group-item-action flex-column align-items-start">' + arrItem[0] + 
          '<div class="d-flex w-100 justify-content-between">' + 
          '<a href="data/' + arrItem[1] + '" id="flv_' + arrItem[1] + '">' + arrItem[1] + '</a>' + 
          '<div>' + 
          '<button type="button" class="btn btn-primary btn-sm" id="edt_' + arrItem[1] + '"><i class="far fa-edit"></i></button>' + 
          '&nbsp;' + 
          '<button type="button" class="btn btn-danger btn-sm" id="del_' + arrItem[1] + '"><i class="far fa-trash-alt"></i></button>' + 
          '</div>' + 
          '</div></li>');
        }
      });
    } else {
      bootbox.alert(data.res);
    }
  
    $('#loader_list').hide();  
    localStorage.setItem('loading_files', 'false');
  }); 
}

// получить содержимое файла
function getFileContent(fileName, password) {
  $.getJSON('server/get_file_content.php',
  {
    file: String(fileName),
    password: String(password) 
  },
  function(data) {
    if (data == 'Неверный пароль!') {
      bootbox.alert(data);
    } else {
      $('#file_edit').text(data.content);
      $('#div_file_list').hide();
      $('#div_file_edit').show();
    }
  });
}

// удалить файл
function deleteFile(fileName, password) {
  $.getJSON('server/delete_file.php', 
  {
    file: String(fileName),
    password: String(password) 
  },
  function(data) {
    if (!data) {
      loadFileList();
      
      $('#alert_success').fadeTo(1000, 500).slideUp(500, function() {
        $('#alert_success').slideUp(500);
      });
    } else {
      bootbox.alert(data);
    };
  });
}

// нажатие на кнопку редактировать/удалить
$('#file_list').on('click', 'button', function() {
  event.preventDefault();
  
  var elem = $(this);
  var btnType = elem.attr('id').substring(0, 3);
  var file = elem.attr('id').substring(4);
  
  bootbox.prompt({
    title: "Введите пароль:",
    inputType: 'password',
    callback: function(result) {
      if (result) {
        switch(btnType) {
          case "edt":
            getFileContent(file, result);
            break;
          case "del":
            deleteFile(file, result);
            break;
          default:
            break;
        }
      }
    }
  });
});

// нажатие на кнопку отмена
$('#btn_cancel_files').on('click', function() {
  $('#div_file_list').show();
  $('#div_file_edit').hide();
});

// выбор файла для загрузки
$('.custom-file-input').on('change', function() {
  var fileName = $(this).val().split("\\").pop();
  $(this).siblings('.custom-file-label').addClass('selected').html(fileName);
});