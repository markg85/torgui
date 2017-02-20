var showWelcome = true

function setWelcomeVisible(value)
{
  // No local storage.
  if (typeof(Storage) == "undefined")
  {
    return;
  }

  localStorage.welcomeMessageVisible = value;
}

function welcomVisible()
{
  if (localStorage && localStorage.welcomeMessageVisible)
  {
    return localStorage.welcomeMessageVisible;
  }
  else
  {
    return true;
  }
}

function parseData(data)
{
  $('#showThumb').attr('src', data['meta']['image']['original']);
  $('#showInfo .col-lg-3 .caption h3').text(data['meta']['name'])

  if (!data['1080p']) data['1080p'] = [];
  if (!data['720p']) data['720p'] = [];
  if (!data['sd']) data['sd'] = [];

  var arrayLengths = [data['1080p'].length, data['720p'].length, data['sd'].length]
  var maxNum = Math.max(...arrayLengths)

  // Get the last child
  var lastChild = $('#episodeLinks > tbody tr:last-child').clone();

  // Clear the table
  $('#episodeLinks > tbody').empty();

  lastChild.children().each(function(i)
  {
    $(this).text("");
  });

  // Fill it with new - empty - entries
  for (var i = 1; i <= maxNum; i++)
  {
    var row = lastChild.clone()
    $(row.children()[0]).text(i);
    $('#episodeLinks > tbody:last-child').append(row);
  }

  var index = 1

  for (var item of data['1080p'])
  {
    var link = `<a href="${item.url}">Download</a> (${item.classification.source}) ${item.sizeHumanReadable}`
    var child = $('#episodeLinks > tbody tr:nth-child('+index+')').children()[1]
    $(child).html(link);
    index++;
  }

  index = 1

  for (var item of data['720p'])
  {
    var link = `<a href="${item.url}">Download</a> (${item.classification.source}) ${item.sizeHumanReadable}`
    var child = $('#episodeLinks > tbody tr:nth-child('+index+')').children()[2]
    $(child).html(link);
    index++;
  }

  index = 1

  for (var item of data['sd'])
  {
    var link = `<a href="${item.url}">Download</a> (${item.classification.source}) ${item.sizeHumanReadable}`
    var child = $('#episodeLinks > tbody tr:nth-child('+index+')').children()[3]
    $(child).html(link);
    index++;
  }

  index = 1

  $("#parsingStatus span").addClass("done").text("done");
  $("#status").fadeOut()
  $("#showInfo").fadeIn()

  // Store the last search query and clear the input field.
  lastSearchQuery = data['meta']['name'];
  $('#searchfield').val("");

  // Reset the status lines (remove done class and set the text back to pending).
  $("sendRequestStatus span").removeClass("done").text("pending")
  $("#responseStatus span").removeClass("done").text("pending")
  $("#parsingStatus span").removeClass("done").text("pending")
}

var lastSearchQuery = "";

function sendSearchRequest(query)
{
  var searchQuery = query;
  if (searchQuery == "")
  {
    alert("Empty query. Not doing anything.")
    return;
  }

  $("#status").fadeIn()
  $("#showInfo").fadeOut()

//  $.ajax( "http://localhost:3020/search/latest:" + searchQuery )
  $.ajax( "http://tor.sc2.nl/search/latest:" + searchQuery )
    .done(function(data) {
      //alert( "success" + data );
      console.log(data)
      $("#responseStatus span").addClass("done").text("done");
      parseData(data);
    })
    .fail(function() {
      alert( "error" );
    });

  $("#sendRequestStatus span").addClass("done").text("done");
}

$( document ).ready(function() {

  console.log(localStorage.welcomeMessageVisible)

  $('[data-toggle="tooltip"]').tooltip();

  $("#welcomeMessage").css("display", ((welcomVisible() == true) ? "block": "none"))
  $("#welcomeMessage > button").click(function(){
    setWelcomeVisible(!welcomVisible())
  });

 $('#searchfieldRefresh').click(function() {
    sendSearchRequest(lastSearchQuery);
  });

 $('#searchfieldSubmit').click(function() {
    sendSearchRequest($('#searchfield').val());
  });

  $('#searchfield').keypress(function (e) {
    if(e.which == 13)  // the enter key code
    {
      sendSearchRequest($('#searchfield').val());
      return false;
    }
  });

});
