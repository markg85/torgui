import { Spinner } from './spin.js';

const nkn = require('nkn-client/dist/nkn');
const bs4Pop = require('./bs4.pop');

const spinner = new Spinner();
let nknClient = null;

var showWelcome = true
var useRemoteDownload = false
const version = "0.2.0"
let waitingForReply = []

function fillInitialLocalStorage() {
  if (!window.localStorage.welcomeMessageVersion) {
    window.localStorage.welcomeMessageVersion = "0.0.0"
  }

  if (window.localStorage.nknMagnetDestination && window.localStorage.nknWalletSeedKey) {
    useRemoteDownload = true;
    $('#nknMagnetDestination').val(window.localStorage.nknMagnetDestination)
    $('#nknWalletSeedKey').val(window.localStorage.nknWalletSeedKey)
    nknClient = nkn({seed: window.localStorage.nknWalletSeedKey, seedRpcServerAddr: 'https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet'});

    nknClient.on('connect', () => {
      console.log('Connection opened.');
    });
    
    nknClient.on('message', async (src, payload, payloadType, encrypt) => {
      if (src === window.localStorage.nknMagnetDestination) {
        let obj = JSON.parse(payload)
        let index = waitingForReply.indexOf(obj.hash);
        if (index >= 0) {
          waitingForReply.splice(index, 1);
          if (obj.state === 'ALREADY_ADDED') {
            bs4Pop.notice('Server is already handling this link!', {position: 'topright', type: 'warning'})
          } else if (obj.state === 'ADDED') {
            bs4Pop.notice('Link added to server!', {position: 'topright', type: 'success'})
          }
        }
      }
    });
  }
}

function welcomeMessageVersion() {
  if (window.localStorage && window.localStorage.welcomeMessageVersion) {
    window.localStorage.welcomeMessageVersion = version;
    return window.localStorage.welcomeMessageVersion;
  } else {
    return version;
  }
}

function isWelcomeMessageVersionRead() {
  return !(window.localStorage.welcomeMessageVersion < version);
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
  waitingForReply.push(hash);

  nknClient.send(
    window.localStorage.nknMagnetDestination,
    JSON.stringify({hash: hash, url: url}),
    { encrypt: true } // Default is true as well, but just passing incase that changes
  );

  console.log(url)
}

function parseData(data) {
  var title = ""
  var image = ""

  if (!data.error && data.results.length > 0) {
    image = data.meta.images.medium
    title = data.meta.name

    // Only add the season episode tag (like S01E01) if we have a season. We also have an episode in that case.
    // But we don't have it for movies.
    if (data.results[0].season) {
      title += " S" + zeroPadding(data.results[0].season) + "E" + zeroPadding(data.results[0].episode)
    }

    // Store the last search query and clear the input field.
    lastSearchQuery = $('#searchfield').val();
    $('#searchfield').val("");


    $('.card-img-bottom').attr('src', image);
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

var lastSearchQuery = "";

function sendSearchRequest(query) {
  spinner.spin(document.getElementById('center'));
  var searchQuery = query.trim();
  if (searchQuery == "") {
    spinner.stop();
    alert("Empty query. Not doing anything.")
    return;
  }

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
  $('.card-header').text("")

  // Clear all table rows
  $('#episodeLinks > tbody tr').remove();

  console.log(searchQuery)
  //  $.ajax( "http://localhost:3020/search/" + searchQuery )
  $.ajax("https://tor.sc2.nl/search/" + searchQuery)
    .done(function (data) {
      //alert( "success" + data );
      console.log(data)
      //$("#responseStatus span").addClass("done").text("done");
      parseData(data);
      spinner.stop();
    })
    .fail(function () {
      spinner.stop();
      alert("error");
    });

  //$("#sendRequestStatus span").addClass("done").text("done");
}

async function updateMagnetDestination() {
  let nknMagnetDestination = $('#nknMagnetDestination').val();
  let nknWalletSeedKey = $('#nknWalletSeedKey').val();
  window.localStorage.nknMagnetDestination = nknMagnetDestination;
  window.localStorage.nknWalletSeedKey = nknWalletSeedKey;
  fillInitialLocalStorage();
}

$(document).ready(function () {

  fillInitialLocalStorage();
  console.log(window.localStorage.welcomeMessageVersion)

  $("#welcomeMessage").css("display", ((isWelcomeMessageVersionRead() == false) ? "block" : "none"))
  $("#welcomeMessage > button").click(function () {
    welcomeMessageVersion();
  });

  $('#searchfieldRefresh').click(function () {
    sendSearchRequest(lastSearchQuery);
  });

  $('#searchfieldSubmit').click(function () {
    sendSearchRequest($('#searchfield').val());
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
      sendSearchRequest($('#searchfield').val());
      return false;
    }
  });
});
