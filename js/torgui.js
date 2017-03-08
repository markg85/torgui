var showWelcome = true

var version = "0.1.0"

function fillInitialLocalStorage() {
  if (!localStorage.welcomeMessageVersion) {
    localStorage.welcomeMessageVersion = "0.0.0"
  }
}

function welcomeMessageVersion() {
  if (localStorage && localStorage.welcomeMessageVersion) {
    localStorage.welcomeMessageVersion = version;
    return localStorage.welcomeMessageVersion;
  } else {
    return version;
  }
}

function isWelcomeMessageVersionRead() {
  if (localStorage.welcomeMessageVersion < version) {
    return false;
  }
  return true;
}

function parseData(data)
{
  var title = ""
  var image = ""

  if (data['meta'].image) {
    image = data['meta']['image']
    title = data['meta']['name']
  }

  // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
  // But we don't have it for movies.
  if (data['meta'].season) {
    title += " S" + data['meta']['season'] + "E" + data['meta']['episode']
  }
 
  $('#showThumb').attr('src', image);
  $('#showInfo .col-lg-3 .caption h3').text(title)

  if (!data['1080p']) data['1080p'] = [];
  if (!data['720p']) data['720p'] = [];
  if (!data['sd']) data['sd'] = [];

  var arrayLengths = [data['1080p'].length, data['720p'].length, data['sd'].length]
  var maxNum = Math.max(...arrayLengths)

  var rowTemplate = document.getElementById('torrentEntry');
  var bodyForRows = document.getElementById('episodeLinks').getElementsByTagName('tbody')[0];

  var keys = ['1080p', '720p', 'sd']

  for (var i = 0; i < maxNum; i++) {
    var td = rowTemplate.content.querySelectorAll("td");
   
    td[0].textContent = (i + 1);

    for (var col = 1; col < 4; col++) {
      var item = data[keys[col - 1]][i]

      if (item) {
        td[col].innerHTML = `<a href="${item.url}">Download</a> (${item.classification.source}) ${item.sizeHumanReadable}`;
      } else {
        td[col].textContent = ``;
      }
    }

    var clone = document.importNode(rowTemplate.content, true);
    bodyForRows.appendChild(clone);
  }

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
  var searchQuery = query.trim();
  if (searchQuery == "")
  {
    alert("Empty query. Not doing anything.")
    return;
  }

  // Adjust search query to be more generic.
  // If it starts with "!" or "tt" then we pass it as is.
  // If not (this if body) then prefix it with "latest:"
  if (!searchQuery.startsWith("!") && !searchQuery.startsWith("tt") && !searchQuery.startsWith("imdb:") && !searchQuery.startsWith("latest:"))
  {
    searchQuery = "latest:" + searchQuery
  }

  if (searchQuery.startsWith("!"))
  {
    searchQuery = searchQuery.substr(1);
  }

  $("#status").fadeIn()
  $("#showInfo").fadeOut()

  // Clear item information
  $('#showThumb').attr('src', "");
  $('#showInfo .col-lg-3 .caption h3').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  console.log(searchQuery)
//  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax( "http://tor.sc2.nl/search/" + searchQuery )
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

  fillInitialLocalStorage();
  console.log(localStorage.welcomeMessageVersion)

  $('[data-toggle="tooltip"]').tooltip();

  $("#welcomeMessage").css("display", ((isWelcomeMessageVersionRead() == false) ? "block": "none"))
  $("#welcomeMessage > button").click(function(){
    welcomeMessageVersion();
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
