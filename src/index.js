import './torgui.css';
import './bs4.pop.css'
const nkn = require('nkn-client/dist/nkn');
import bs4Pop from './bs4.pop';

let nknClient = null;

let useRemoteDownload = false
let nknSearchQueries = false
let waitingForQuery = null
let lastSearchQuery = ""
let retryLastQueryEvent = new CustomEvent("retryLastQuery");

function fillInitialLocalStorage() {
  if (window.localStorage.nknMagnetDestination && window.localStorage.nknWalletSeedKey) {
    $('#nknMagnetDestination').val(window.localStorage.nknMagnetDestination)
    $('#nknWalletSeedKey').val(window.localStorage.nknWalletSeedKey)
    $('#nknSearchQueries').prop('checked', JSON.parse(window.localStorage.nknSearchQueries))
    
    if (nknClient === null) {
      nknClient = nkn({seed: window.localStorage.nknWalletSeedKey});
    }
    
    if($('#nknConnectionStatus').length == 0) {
      var inputBar = document.querySelector('#inputBar > .input-group-append');
      inputBar.appendChild(document.getElementById('nknConnectionStatusTemplate').content.cloneNode(true));
    } else {
      $("#nknConnectionStatus").removeClass("btn-success").addClass("btn-danger");
      nknClient.close();
      nknClient = nkn({seed: window.localStorage.nknWalletSeedKey});
    }
    
    nknClient.on('connect', () => {
      useRemoteDownload = true;
      nknSearchQueries = JSON.parse(window.localStorage.nknSearchQueries);
      $("#nknConnectionStatus").removeClass("btn-danger").addClass("btn-success");
      $("#nknConnectionStatus").attr("title", "NKN connected");
      $("#nknConnectionStatus > i").removeClass("fa-chain-broken").addClass("fa-link");
      console.log('Connection opened.');
    });
    
    nknClient.on('message', async (src, payload, payloadType, encrypt) => {
      if (src === window.localStorage.nknMagnetDestination) {
        let obj = JSON.parse(payload)
        if (obj.hash !== waitingForQuery) {
          console.log(`Received results for something we were not waiting for anymore. Ignoring.`)
          console.log(waitingForQuery)
          console.log(obj)
          return;
        }

        if (obj.state === 'INPROGRESS') {
          $("#center").removeClass('spinnerInitial').addClass('spinnerData');
        } else if (obj.state === 'RESULTS') {
          parseData(obj.data);
          $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
          waitingForQuery = null;
        } else if (obj.state === 'ALREADY_ADDED') {
          bs4Pop.notice('Server is already handling this link!', {position: 'center', type: 'warning'})
        } else if (obj.state === 'ADDED') {
          bs4Pop.notice('Link added to server!', {position: 'center', type: 'success'})
        }
      }
    });
    document.addEventListener("retryLastQuery", async (e) => {
      console.log('retryLastQuery...')
      try {
        await nknClient.send(
          window.localStorage.nknMagnetDestination,
          JSON.stringify({type: 'search', hash: waitingForQuery, query: lastSearchQuery}),
          { encrypt: true } // Default is true as well, but just passing incase that changes
        );
      } catch (error) {
        bs4Pop.notice('Failed to send message to NKN in 2 attempts. Please try again!', {position: 'center', type: 'danger', autoClose: 5000})
        $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
      }
    });
  }
}

function zeroPadding(num, size = 2) {
  var st = num + "";
  var sl = size - st.length - 1;
  for (; sl >= 0; sl--) st = "0" + st;
  return st;
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

async function downloadUrl(url) {
  let hash = await digestMessage(url);
  waitingForQuery = hash

  nknClient.send(
    window.localStorage.nknMagnetDestination,
    JSON.stringify({type: 'download', hash: hash, url: url}),
    { encrypt: true } // Default is true as well, but just passing incase that changes
  );

  console.log(url)
}

function parseData(data) {
  var title = ""
  var image = ""
  var imageLarge = ""

  if (!data.error && data.results.length > 0) {
    image = data.meta.images.medium
    imageLarge = data.meta.images.original
    title = data.meta.name

    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
    // But we don't have it for movies.
    if (data.results[0].season) {
      title += " S" + zeroPadding(data.results[0].season) + "E" + zeroPadding(data.results[0].episode)
    }

    // Store the last search query and clear the input field.
    lastSearchQuery = $('#searchfield').val();
    $('#searchfield').val("");
    waitingForQuery = null;


    $('.card-img-bottom').attr('src', image);
    $('.card-img-bottom').attr('srcset', `${imageLarge} 2x`);
    $('.card-header').text(title)

    if (!data['1080p']) data['1080p'] = [];
    if (!data['720p']) data['720p'] = [];
    if (!data['sd']) data['sd'] = [];

    var torrents = data.results[0].torrents;
    var arrayLengths = [torrents['1080p'].length, torrents['720p'].length, torrents['sd'].length]
    var maxNum = Math.max(...arrayLengths)

    var rowTemplate = document.getElementById('torrentEntry');
    var bodyForRows = document.getElementById('episodeLinks').getElementsByTagName('tbody')[0];

    var keys = ['1080p', '720p', 'sd']

    for (var i = 0; i < maxNum; i++) {
      var clonedNode = rowTemplate.content.cloneNode(true);
      var td = clonedNode.querySelectorAll("td");

      td[0].textContent = (i + 1);

      for (var col = 1; col < 4; col++) {
        let item = torrents[keys[col - 1]][i]

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
          if (useRemoteDownload) {
            download.innerHTML = "Send"
            download.onclick = async function () { downloadUrl(item.url) };
            download.href = `#`
          }
          else {
            download.href = item.url;
          }

          download.title = item.name

        } else {
          td[col].textContent = ``;
        }
      }

      bodyForRows.appendChild(clonedNode);
    }

    $("#showInfo").fadeIn()
  }
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
  if (!searchQuery.match(/(.+) s([0-9]{1,2})e([0-9]{1,2})/i) && !searchQuery.startsWith("tt") && !searchQuery.startsWith("imdb:") && !searchQuery.startsWith("latest:")) {
    searchQuery = "latest:" + searchQuery
  }

  //$("#status").fadeIn()
  $("#showInfo").fadeOut()

  // Clear item information
  $('.card-img-bottom').attr('src', "");
  $('.card-img-bottom').attr('srcset', "");
  $('.card-header').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  console.log(searchQuery)
  lastSearchQuery = searchQuery

  if (nknSearchQueries == true) {
    // Sead the query to NKN.
    let hash = await digestMessage(searchQuery);
    waitingForQuery = hash;
    try {
      await nknClient.send(
        window.localStorage.nknMagnetDestination,
        JSON.stringify({type: 'search', hash: hash, query: searchQuery}),
        { encrypt: true } // Default is true as well, but just passing incase that changes
      );
    } catch (error) {
      document.dispatchEvent(retryLastQueryEvent);
      console.log('Failed! Timeout, probably. Emitting retry signal.')
    }
    return;
  }
  //  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax("https://tor.sc2.nl/search/" + searchQuery)
    .done(function (data) {
      //alert( "success" + data );
      console.log(data)
      //$("#responseStatus span").addClass("done").text("done");
      parseData(data);
      $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
    })
    .fail(function () {
      $("#center").hide().removeClass('spinnerInitial').removeClass('spinnerData');
      alert("error");
    });

  //$("#sendRequestStatus span").addClass("done").text("done");
}

async function updateMagnetDestination() {
  let nknMagnetDestination = $('#nknMagnetDestination').val();
  let nknWalletSeedKey = $('#nknWalletSeedKey').val();
  let nknSearchQueries = $('#nknSearchQueries').is(":checked")
  window.localStorage.nknMagnetDestination = nknMagnetDestination;
  window.localStorage.nknWalletSeedKey = nknWalletSeedKey;
  window.localStorage.nknSearchQueries = nknSearchQueries;
  fillInitialLocalStorage();
}

function searchHandler(input) {
  if (useRemoteDownload) {
    if (/magnet:\?/.test(input)) {
      downloadUrl(input)
      return;
    } else if (/^[a-z0-9]{40}$/i.test(input)) {
      let magnetUrl = `magnet:?xt=urn:btih:${input}`
      downloadUrl(magnetUrl)
      return;
    }
  }
  
  sendSearchRequest(input);
}

function isMagnetSearch(input) {
  if (useRemoteDownload) {
    if (/magnet:\?/.test(input)) {
      return true;
    } else if (/^[a-z0-9]{40}$/i.test(input)) {
      return true;
    }
  }
  return false;
}

$(document).ready(function () {

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
});
