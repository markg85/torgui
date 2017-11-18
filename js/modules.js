import {Spinner} from './spin.js';
var spinner = new Spinner();

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
  return !(localStorage.welcomeMessageVersion < version);
}

function parseData(data)
{
  var title = ""
  var image = ""

  if (!data.error) {
    if (data['meta'].image) {
      image = data['meta']['image']
      title = data['meta']['name']
    }
    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
    // But we don't have it for movies.
    if (data['meta'].season) {
      title += " S" + data['meta']['season'] + "E" + data['meta']['episode']
    }

    // Store the last search query and clear the input field.
    lastSearchQuery = data['meta']['name'];
    $('#searchfield').val("");


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
      var clonedNode = rowTemplate.content.cloneNode(true);
      var td = clonedNode.querySelectorAll("td");

      td[0].textContent = (i + 1);

      for (var col = 1; col < 4; col++) {
        var item = data[keys[col - 1]][i]

        if (item) {

          var cell = td[col];

          // Get objects
          //var badgeElem = cell.getElementsByClassName("badge-torgui");
          var badgeElem = cell.getElementsByClassName("badge-torgui")[0];
          var extraElem = cell.getElementsByClassName("extra")[0];
          var download = cell.getElementsByTagName('a')[0];

          // Set values
          badgeElem.className += ` ${item.classification.codec}`;
          extraElem.textContent = `(${item.classification.source}) ${item.sizeHumanReadable}`;
          download.href = item.url;
        } else {
          td[col].textContent = ``;
        }
      }

      bodyForRows.appendChild(clonedNode);
    }

    $("#showInfo").fadeIn()
  }
}

var lastSearchQuery = "";

function sendSearchRequest(query)
{
  spinner.spin(document.getElementById('center'));
  var searchQuery = query.trim();
  if (searchQuery == "")
  {
    spinner.stop();
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

  //$("#status").fadeIn()
  $("#showInfo").fadeOut()

  // Clear item information
  $('#showThumb').attr('src', "");
  $('#showInfo .col-lg-3 .caption h3').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  console.log(searchQuery)
//  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax( "https://tor.sc2.nl/search/" + searchQuery )
    .done(function(data) {
      //alert( "success" + data );
      console.log(data)
      //$("#responseStatus span").addClass("done").text("done");
      parseData(data);
      spinner.stop();
    })
    .fail(function() {
      spinner.stop();
      alert( "error" );
    });

  //$("#sendRequestStatus span").addClass("done").text("done");
}

$( document ).ready(function() {

  fillInitialLocalStorage();
  console.log(localStorage.welcomeMessageVersion)

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
