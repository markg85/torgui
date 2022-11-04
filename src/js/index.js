// TODO!
// Use Github Actions to "upload" directly to IPFS and pinata: https://github.com/aquiladev/ipfs-action/issues/1
// And for that, somehow either update the torgui dns to use the new ipfs hash
// ... or ... use IPNS but then i somehow need to make my node run name publish

let lastSearchQuery = ""
let nextSearchQuery = null
let previousSearchQuery = null

function fillInitialLocalStorage() {

}

function zeroPadding(num, size = 2) {
  var st = num + "";
  var sl = size - st.length - 1;
  for (; sl >= 0; sl--) st = "0" + st;
  return st;
}

async function parseData(data) {
  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();
  
  var title = ""
  var image = ""
  var imageLarge = ""

  if (!data.error && data.results.length > 0) {
    if (data?.meta) {
      image = data.meta.images.medium
      imageLarge = data.meta.images.original
      title = data.meta.name
    }

    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
    // But we don't have it for movies.
    if (data.results[0].season) {
      title += " S" + zeroPadding(data.results[0].season) + "E" + zeroPadding(data.results[0].episode)
    }

    // Store the last search query and clear the input field.
    lastSearchQuery = $('#searchfield').val();
    $('#searchfield').val("");
    waitingForResult = []

    $('.card-img-bottom').attr('src', image);
    $('.card-img-bottom').attr('srcset', `${imageLarge} 2x`);
    $('.header-text').text(title)

    var torrents = data.results[0].torrents;
    var maxNum = Math.max(...(Object.values(torrents).map(a => a.length)))

    var rowTemplate = document.getElementById('torrentEntry');
    var bodyForRows = document.getElementById('episodeLinks').getElementsByTagName('tbody')[0];

    var keys = Object.keys(torrents)

    for (var i = 0; i < maxNum; i++) {
      var clonedNode = rowTemplate.content.cloneNode(true);
      var td = clonedNode.querySelectorAll("td");

      td[0].textContent = (i + 1);

      for (let [col, value] of Object.entries(keys)) {
        let item = torrents[value][i]
        col = 1 + parseInt(col);

        if (item) {
          var cell = td[col];

          // Get objects
          //var badgeElem = cell.getElementsByClassName("badge-torgui");
          var badgeElem = cell.getElementsByClassName("badge-torgui")[0];
          var extraElem = cell.getElementsByClassName("extra")[0];
          var download = cell.getElementsByTagName('a')[0];
          var bitAddition = ` bit${item.classification.bitdepth}`

          // Set values
          badgeElem.className += ` ${item.classification.codec}` + bitAddition;
          extraElem.textContent = `(${item.classification.source}) ${item.sizeHumanReadable}`;
          download.href = item.url;
          download.title = item.name

        } else {
          td[col].textContent = ``;
        }
      }

      bodyForRows.appendChild(clonedNode);
    }

    // Specially crafted function to hide the empty columns. With the exception of the number column.
    hideEmptyCols($("#showInfo"), 2);

    // Now the table is done. Show it.
    $("#showInfo").fadeIn()
  }
}

function hideEmptyCols(table, columnOffset = 1) {
  //count # of columns
  var numCols = $("th", table).length;
  for ( var i=columnOffset; i<=numCols; i++ ) {
      var empty = true;
      //grab all the <td>'s of the column at i
      $("td:nth-child(" + i + ")", table).each(function(index, el) {
          //check if the <span> of this <td> is empty
          if ( $("span", el).text() != "" ) {
              empty = false;
              return false; //break out of each() early
          }
      });
      if ( empty ) {
          $("td:nth-child(" + i + ")", table).hide();
          $("th:nth-child(" + i + ")", table).hide();
      } else {
          $("td:nth-child(" + i + ")", table).show();
          $("th:nth-child(" + i + ")", table).show();
      }
  }
}

async function parsePogData(pog) {
  // Clear all table rows
  $('#pogEntries > tbody tr').remove();
  
  var rowTemplate = document.getElementById('pogEntry');
  var bodyForRows = document.getElementById('pogEntries').getElementsByTagName('tbody')[0];

  const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }

  let i = 1;
  for (let entry of pog) {
    var clonedNode = rowTemplate.content.cloneNode(true);
    var td = clonedNode.querySelectorAll("td");

    td[0].textContent = i++
    if (isToday(new Date(entry.airdate))) {
      td[1].textContent = 'Aired today!'
    } else {
      td[1].textContent = entry.fromNow
    }

    $(td[1]).prop('title', new Date(entry.airdate));

    let search = td[2].getElementsByTagName('a')[0];
    let seriesEpisode = entry.series + ` S${zeroPadding(entry.season)}E${zeroPadding(entry.episode)}`
    search.innerHTML = seriesEpisode
    search.onclick = async function () { searchHandler(seriesEpisode) };
    search.href = `#`
    
    bodyForRows.appendChild(clonedNode);
  }

  $("#pogResults").fadeIn()
}

async function sendSearchRequest(query) {
  var searchQuery = query.trim();
  if (searchQuery == "") {
    $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
    alert("Empty query. Not doing anything.")
    return;
  }

  $("#center").show().addClass('spinnerInitial');

  // Adjust search query to be more generic.
  // If it contains a "S??E??" or starts with a "tt" then we pass it as is.
  // If not (this if body) then prefix it with "latest:"
  if (!searchQuery.match(/(.+) s([0-9]{1,2})e([0-9]{1,2})/i) && !searchQuery.startsWith("tt") && !searchQuery.startsWith("!") && !searchQuery.startsWith("imdb:") && !searchQuery.startsWith("latest:")) {
    searchQuery = "latest:" + searchQuery
  }

  // We want a wildcard search.
  if (searchQuery.startsWith("!")) {
    searchQuery = searchQuery.slice(1).trim()
  }

  //$("#status").fadeIn()
  $("#showInfo").fadeOut()
  $("#pogResults").fadeOut()

  // Clear item information
  $('.card-img-bottom').attr('src', "");
  $('.card-img-bottom').attr('srcset', "");
  $('.header-text').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  // Clear next/previous button values
  previousSearchQuery = null
  nextSearchQuery = null
  $("#previousEpisode").attr("disabled", true);
  $("#nextEpisode").attr("disabled", true);
  $("#previousEpisode").prop('title', "");
  $("#nextEpisode").prop('title', "");

  console.log(searchQuery)
  lastSearchQuery = searchQuery

  //  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax("https://tor.sc2.nl/search/" + searchQuery)
    .done(async function (data) {
      //alert( "success" + data );
      console.log(data)
      //$("#responseStatus span").addClass("done").text("done");
      await parseData(data);
      $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
    })
    .fail(function () {
      $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
      alert("error");
    });

  //$("#sendRequestStatus span").addClass("done").text("done");
}

async function updateMagnetDestination() {
  let pogicalurl = $('#pogicalurl').val();
  window.localStorage.pogicalurl = pogicalurl;
  fillInitialLocalStorage();
}

function searchHandler(input) {
  sendSearchRequest(input);
}

function isMagnetSearch(input) {
  return false;
}

function previousEpisode() {
  if (previousSearchQuery !== null) {
    searchHandler(previousSearchQuery)
  }
}

function nextEpisode() {
  if (nextSearchQuery !== null) {
    searchHandler(nextSearchQuery)
  }
}

document.addEventListener("DOMContentLoaded",function(){

  fillInitialLocalStorage();

  $('#searchfieldRefresh').click(function () {
    searchHandler(lastSearchQuery);
  });

  $('#searchfieldSubmit').click(function () {
    searchHandler($('#searchfield').val());
  });

  $('#saveMoreOptions').click(function () {
    updateMagnetDestination();
  });

  $('#toggleMoreOptions').click(function () {
    $('#moreOptions').toggle()
  });

  $('#searchfield').keypress(function (e) {
    if (e.which == 13)  // the enter key code
    {
      searchHandler($('#searchfield').val());
      return false;
    }
  });

  $('#searchfield').on('input',function (e) {
    if (isMagnetSearch($('#searchfield').val())) {
      $('#searchfieldSubmit i').removeClass('fa-search').addClass('fa-magnet')
    } else {
      $('#searchfieldSubmit i').removeClass('fa-magnet').addClass('fa-search')
    }
  });

  $('#previousEpisode').click(function () {
    previousEpisode();
  });

  $('#nextEpisode').click(function () {
    nextEpisode();
  });
});
