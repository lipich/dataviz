// page init
$(function() {
  google.charts.load('current', {'packages': ['corechart', 'line'], 'language': 'ru'});
  google.charts.load('current', {'packages': ['corechart', 'bar'], 'language': 'ru'});
  google.charts.load('current', {'packages':['table'], 'language': 'ru'});
  //google.charts.load('current', {'packages':['geochart'], 'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'});
});

// get URL parameters 
function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

// page loaded
$(document).ready(function() {
  // disable caching
  $.ajaxSetup({'cache': false});

  // clear bin
  $('#row_list').hide();
  hideChart();

  // disable loading state
  localStorage.setItem('loading_files', 'false');
  localStorage.setItem('loading_rows', 'false');
  localStorage.setItem('loading_data', 'false');

  // get url parameters
  var file = getUrlParameter('file');
  localStorage.setItem('qs_file', file);

  var row = getUrlParameter('row');
  localStorage.setItem('qs_row', row);

  var chartType = getUrlParameter('chart_type');
  if (!chartType) chartType = 'line';
  localStorage.setItem('chart_type', chartType);
  if (chartType == 'line') {
    $('#btn_line_chart').removeClass('btn-secondary');
    $('#btn_line_chart').addClass('btn-primary');
    $('#btn_bar_chart').removeClass('btn-primary');
    $('#btn_bar_chart').addClass('btn-secondary');
  } else {
    $('#btn_line_chart').removeClass('btn-primary');
    $('#btn_line_chart').addClass('btn-secondary');
    $('#btn_bar_chart').removeClass('btn-secondary');
    $('#btn_bar_chart').addClass('btn-primary');
  }
    
  var chartDelta = getUrlParameter('chart_delta');
  if (!chartDelta) chartDelta = 'false';
  localStorage.setItem('chart_delta', chartDelta);
  if (chartDelta == 'false') {
    $('#btn_data_delta').removeClass('btn-primary');
    $('#btn_data_delta').addClass('btn-secondary');
  }
  else { 
    $('#btn_data_delta').removeClass('btn-secondary');
    $('#btn_data_delta').addClass('btn-primary');
  }
  
  // init share url 
  localStorage.setItem('share_url', "");	
    
  // load files list
  loadFileList();

  // x-axis slider
  var slider = document.getElementById("xRange");
  //var output = document.getElementById("xValue");
  //output.innerHTML = slider.value;
 
  slider.oninput = function() {
    localStorage.setItem('end_x', this.value);	
    loadRowData();
    //output.innerHTML = this.value;
  }
});

// updating the graph when the browser window changes 
var chart_refresh = "done";

$(window).resize(function() {
  if(chart_refresh == "done") {
    chart_refresh = "waiting";
    setTimeout(function() { loadRowData(); chart_refresh = "done" }, 1000);
  }
});

// load list of data files
function loadFileList() {
  var delimiter = "<%%%>"; // separator between the series name and the file name with data in the array

  // enable download state
  localStorage.setItem('loading_files', 'true');

  // timeout for displaying the loading indicator
  setTimeout(function() {
    var loading = localStorage.getItem('loading_files');
    if (loading == 'true') $('#loader_counter').show();
  }, 1000);

  // get files list
  $.getJSON('server/get_file_list.php', 
  function(data) {
    if (!data.res) {
      $('#counter_files').text(data.data.length);

      var select = $('#file_list');

      $.each(data.data, function(index, item) {
        if (item) {
          arrItem = item.split(delimiter);
          select.append('<a href="#" class="dropdown-item" id="dl_' + arrItem[1] + '" data-pdsa-dropdown-val="' + arrItem[1] + '" onClick="loadRowList(\'' + arrItem[1] + '\', \'' + arrItem[0] + '\')">' + arrItem[0] + '</a>');
        }
      });

      select.append('<div class="dropdown-divider"></div>');
      select.append('<a class="dropdown-item" href="admin.html"><button type="button" class="btn btn-primary">Add data</button></a>');
    } else {
      bootbox.alert(data.res);
    }

    // turn off loading state
    $('#loader_counter').hide();
    localStorage.setItem('loading_files', 'false');
 
    // select the specified file
    setTimeout(function() {
      var selected = localStorage.getItem('qs_file');
      
      // if the file is not specified, choose a random one
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

// load series list from data file
function loadRowList(file, text) {
  // enable loading state
  localStorage.setItem('loading_rows', 'true');

  setTimeout(function() {
    var loading = localStorage.getItem('loading_rows');
    if (loading == 'true') $('#loader_list').show();
  }, 1000);

  // clear row list, graph, share link and number of selected rows
  $('#row_list').empty();
  hideStatusSelected();
  hideChart();

  localStorage.setItem('s_file', file);
  localStorage.setItem('s_row', "");	
  localStorage.setItem('n_row', "");	   
  localStorage.setItem('init_slider', 'true');
  loadSlider();
  
  // get list of rows from file
  $.getJSON('server/get_row_list.php', {
    file: String(file)
  },
  function(data) {
    if (!data.res) {
      var i = 1;
      var select = $('#row_list');

      $.each(data.data, function(index, item) {
        if (item) select.append('<a href="#" class="list-group-item list-group-item-action" id="rl_' + i + '" onClick="loadRowData(\'' + i + '\', \'' + item + '\')">' + item + '</a>');
        i++;
      });

      localStorage.setItem('q_row', i - 1);
      showStatusSelected(0);
    } else {
      bootbox.alert(data.res);
    }

    // disable loading state
    $('#loader_list').hide();
    localStorage.setItem('loading_rows', 'false');

    // select specified rows
    setTimeout(function() {
      var selected = localStorage.getItem('qs_row');	

      // if the rows are not specified, choose the first one
      if (selected === "undefined") selected = "1";
      if (!selected) selected = "1";

      localStorage.removeItem('qs_row');
      
      arrSelected = selected.split(",");
      for (i = 0; i < arrSelected.length; i++) {
        $('#rl_' + arrSelected[i]).trigger('click');
      }    
    }, 500);
  });

  $('#dropdownMenuButton').text(text);
  $('#row_list').show();

  // create a share link
  var arrFile = file.split(".");
  var shareUrl = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
  if (window.location.pathname.indexOf("index.html") == -1) shareUrl += "index.html";
  shareUrl += "?file=" + arrFile[0];
  localStorage.setItem('share_url', shareUrl);
}

// load data for selected rows
function loadRowData(row, rowName)
{
  // enable loading state
  localStorage.setItem('loading_data', 'true');

  setTimeout(function() {
    var loading = localStorage.getItem('loading_data');
    if (loading == 'true') $('#loader_data').show();
  }, 1000);

  // if a new row is passed, update the list of selected rows
  if (row) {
    var rl = $('#rl_' + row);
  
    if (rl.hasClass('active'))
      rl.removeClass('active'); 
    else
      rl.addClass('active');

    // download selected row codes
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
    if (arrRow.length == 0) {
      // disable loading state
      $('#loader_data').hide();
      localStorage.setItem('loading_data', 'false');
    }
  
    // load selected series titles
    var arrRow = localStorage.getItem('n_row').split(",");

    if (arrRow[0] == "") arrRow.splice(0, 1);
  
    if (arrRow.indexOf(rowName) == -1)
      arrRow.push(rowName);
    else 
      arrRow.splice(arrRow.indexOf(rowName), 1);
  
    var nRow = arrRow.join().replace(/^,/, '');
    
    localStorage.setItem('n_row', nRow);
  }
  
  // get data for selected rows
  $.getJSON('server/get_row_data.php', {
    file: localStorage.getItem('s_file'),
    rows: localStorage.getItem('s_row'),
    start_x: localStorage.getItem('start_x'),
    end_x: localStorage.getItem('end_x'),
    delta: localStorage.getItem('chart_delta')
  },
  function(data) {
    if (!data.res) {
      var chartType = localStorage.getItem('chart_type');
      var chartDelta = localStorage.getItem('chart_delta');
      loadChart(chartType, data.data);
      
	    var initSlider = localStorage.getItem('init_slider');
	    if (initSlider == 'true') {
        loadSlider(data.data.length - 1);
      }
      localStorage.setItem('init_slider', 'false')
	  
      // create a share link
      var arrShareUrl = localStorage.getItem('share_url').split("&");
      var sRow = localStorage.getItem('s_row')
      if (sRow == "") {
        localStorage.setItem('share_url', arrShareUrl[0]);
      } else {
        localStorage.setItem('share_url', arrShareUrl[0] + "&row=" + sRow + "&chart_type=" + chartType + "&chart_delta=" + chartDelta);
      }
    } else {
      bootbox.alert(data.res);
    }
    
    // disable loading state
    $('#loader_data').hide();
    localStorage.setItem('loading_data', 'false');
  });    
}

// load chart
function loadChart(type, arrData) {
  var data = new google.visualization.DataTable();

  data.addColumn('string', 'X');

  var i;
  var arrLines = localStorage.getItem('n_row').split(",");
  for (i = 0; i < arrLines.length; i++) {
    data.addColumn('number', arrLines[i]);
  }

  data.addRows(arrData);

  // graph display area settings
  var s_indent_h = 30;
  var s_indent_w = 100;
  
  var s_height = '75%';
  var s_width = parseInt($(window).width());
  if (s_width < 992) { s_indent_w = 70; s_indent_h = 25; s_height = '75%'; }
  if (s_width < 768) { s_indent_w = 60; s_indent_h = 20; s_height = '75%'; }
  if (s_width < 600) { s_indent_w = 55; s_indent_h = 15; s_height = '75%'; }
  
  var s_pointSize = 3;
  if ((s_width < 1000) && (arrData.length > 40)) s_pointSize = 0;

  var options = {
    chartArea: { left: s_indent_w, top: s_indent_h, width: s_width - s_indent_w * 1.8, height: s_height, backgroundColor: '#ffffff' },
    colors: ['#a52714', '#097138', '#f1ca3a', '#6f9654', '#1c91c0', '#43459d', '#e0440e'],
    legend: { position: 'bottom' },
    backgroundColor: '#fafafa',
    hAxis: { gridlines: {color: '#ccc', count: 5} },
    vAxis: { gridlines: {color: '#ccc', count: 5}, format: 'short' },
    pointSize: s_pointSize
  };

  localStorage.setItem('chart_data', data);	
  localStorage.setItem('chart_options', options);	

  $('#chart_data').show();
  $('#chart_options').show();

  var chart;
  switch(type) {
    case 'line':
      chart = new google.visualization.LineChart(document.getElementById('chart_data'));
      break;
    case 'bar':
      chart = new google.visualization.ColumnChart(document.getElementById('chart_data'));
      break;
    case 'table':
      chart = new google.visualization.Table(document.getElementById('chart_data'));
      break;
    default:
      chart = new google.visualization.LineChart(document.getElementById('chart_data'));
  }

  chart.draw(data, options);
  $('#xRange').show();
}

// switch to linechart
$('#btn_line_chart').on('click', function() {
  if (localStorage.getItem('chart_type') == 'bar') {
    localStorage.setItem('chart_type', 'line');
    $(this).toggleClass('btn-secondary btn-primary');
    $('#btn_bar_chart').toggleClass('btn-primary btn-secondary');

    loadRowData();
  }
});

// switch to barchart
$('#btn_bar_chart').on('click', function() {
  if (localStorage.getItem('chart_type') == 'line') {
    localStorage.setItem('chart_type', 'bar');
    $(this).toggleClass('btn-secondary btn-primary');
    $('#btn_line_chart').toggleClass('btn-primary btn-secondary');

    loadRowData();
  }
});

// switch to delta
$('#btn_data_delta').on('click', function() {
  if (localStorage.getItem('chart_delta') == 'false') {
    localStorage.setItem('chart_delta', 'true');
    $(this).toggleClass('btn-secondary btn-primary');
  } else {
    localStorage.setItem('chart_delta', 'false');    
    $(this).toggleClass('btn-primary btn-secondary');
  }

  loadRowData();
});

// show share link
$('#btn_share').on('click', function() {
  bootbox.alert({
    title: "Share link",
    message: localStorage.getItem('share_url')
  });
});

// load slider
function loadSlider(xMax) {  
  var x = 1000000;
  if (xMax) x = xMax;
  
  // initialize the range of displayed values of the x-axis
  localStorage.setItem('start_x', "0");	
  localStorage.setItem('end_x', x);	
  
  var slider = document.getElementById("xRange");
  slider.min = 1;
  slider.max = x;
  slider.value = x;
}

// load map
function loadMap(arrData) {
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

// hide chart
function hideChart() {
  $('#chart_data').hide();
  $('#chart_options').hide();
  $('#xRange').hide();
}

// show how many rows are selected
function showStatusSelected(sRow) {
  var qRow = localStorage.getItem('q_row');
  
  if (sRow == 0) 
    $('#lblRowCounter').text("Total rows: " + qRow);   
  else 
    $('#lblRowCounter').text("Selected: " + sRow + " of " + qRow);
}

// hide rows counter
function hideStatusSelected() {
  $('#lblRowCounter').text("");
}