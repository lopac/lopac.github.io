var resultsRevealed = false;
var playerRevealed = false;
var playlistEnded = false;
var switch_state = "off";
var videolist = [];

var listno = 0;
var list = 0;
var index = 0;
var player;


$("#click-text").hide();
$("#switch-box").hide();

String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}


window.cookieconsent_options = {
    "message": "This website uses cookies to ensure you get the best experience on our website",
    "dismiss": "Okay!",
    "theme": "light-bottom",
    "expiryDays": "100"
};

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


function PlayYouTube(vid) {
    player = new YT.Player('player', {
        height: '580',
        width: '1000',
        videoId: vid,
        playerVars: {
            rel: 0,
            showinfo: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {

    if (event.data == YT.PlayerState.PLAYING) {
        $("li").first().css("height", "30px");
        $("li").first().css("font-size", "25px");
        $("li").first().css("background", "#dddddd")
        $("li").first().css("color", "#6C102F");
        $("li").first().css("border-radius", "2px");
        $("li").first().css("text-align", "center");
        $("li").first().children("button").remove();
        $("#switch-box").show();

        var position = 0;
        var message = $("li").first().text();

        window.setInterval(function titleslide() {
            document.title = message.substring(position, message.length) + message.substring(0, position);
            position++;
            if (position > message.length) position = 0;
        }, 300);

    }

    if (event.data == YT.PlayerState.PAUSED) {
        //todo
    }

    if (event.data == YT.PlayerState.ENDED) {

        if (index < videolist.length) {
            $("li").first().remove();

            while (!videolist[index] && index < videolist.length) {
                index++;
            }

            LoadVideo(videolist[index]);

            if (index < videolist.length) index++;
        } else {
            alert("Playlist has ended!");
            document.title = "Fliptube";
            $("li").first().remove();
            $("#player").hide();
            playlistEnded = true;
        }
    }

}

function onPlayerReady(event) {
    event.target.playVideo();
}

function stopVideo() {
    player.stopVideo();
}

function LoadVideo(id) {
    player.loadVideoById(id);
    player.videoId = id;
}

function deletelist(buttonid) {
    $(buttonid).parent('li').remove();

    var listid = buttonid.replace(/[^0-9]/gi, '');
    videolist[listid - 1] = 0;

}

function listadd(videoID, videoTitle) {

    var listing = document.getElementById("list");
    var newlist = document.createElement("li");
    newlist.id = videoID;
    /*newlist.onclick = function() {
				LoadVideo(newlist.id);
				$("#"+newlist.id).remove();
				$('li').first().innerHTML = videoTitle;
    }*/
    newlist.innerHTML = videoTitle.substring(0, 45) + "<button class=\"DownloadButton\" onclick=\"DownloadVideo('"+ videoID +"')\">Download</button> <button id=\"b" + listno + "\" onclick=\"deletelist('#b" + listno + "')\">delete</button>";
    listing.appendChild(newlist);

    setTimeout(function() {
        newlist.className = newlist.className + "show";
    }, 10);

    if (playerRevealed && !playlistEnded) videolist.push(videoID);

    if (!playerRevealed) {
        PlayYouTube(videoID);
        playerRevealed = true;
    }

    if (playlistEnded) {
        $('#player').show();
        LoadVideo(videoID);
        playlistEnded = false;
    }

    listno++;
    list++;
}



$(function() {
    $('#switch').click(function() {
        $(this).toggleClass('active');

        if (switch_state == "off") {
            $("#player").css("width", "1000");
            $("#player").css("height", "500");
            $("#player").css("right", "0");

            $("html, body").css("height", "900");
            $("html, body").css("width", "1000");
            $("html, body").css("margin", "10 auto 20px");

            $(".input-box").css("width", "500px");

            $("#playlist").css("width", "1000");
            $("#playlist").css("top", "575");
            $("#click-text").hide();
            $("#search-results").hide();
            switch_state = "on";
        } else {
            $("#player").css("width", "640");
            $("#player").css("height", "400");
            $("#player").css("right", "0");

            $("html, body").css("height", "800");
            $("html, body").css("width", "1280");
            $("html, body").css("margin", "10 auto 20px");

            $(".input-box").css("width", "800");


            $("#playlist").css("width", "640");
            $("#playlist").css("top", "475");
            $("#playlist").show();
            $("#search-results").show();
            switch_state = "off";
        }
    });
});


$(document).ready(function() {
    $("#search-box").autocomplete({
        source: function(request, response) {
            $.getJSON("http://suggestqueries.google.com/complete/search?callback=?", {
                "ds": "yt",
                "jsonp": "suggestCallBack",
                "q": request.term,
                "client": "youtube"
            });
            suggestCallBack = function(data) {
                var suggestions = [];
                $.each(data[1], function(key, val) {
                    suggestions.push({
                        "value": val[0]
                    });
                });
                suggestions.length = 7;
                response(suggestions);
            };
        },
    });
});




document.getElementById('search-box').onkeydown = function(enter) {
    if (enter.keyCode === 13) {
        if (!resultsRevealed) $("#search-results").append('<div id="results">');
        $("#results").empty();
        $("#welcome-text").empty();
        var Query = document.getElementById('search-box').value;
        resultsRevealed = true;


        $("#click-text").show();


        $.getJSON("https://www.googleapis.com/youtube/v3/search?", {
            "part": 'snippet',
            "q": Query,
            "type": 'video',
            "maxResults": '50',
            "order": 'viewCount',
            "relevanceLanguage": 'hr',
            "videoEmbeddable": 'true',
            //"videoSyndicated": 'true',
            "key": 'AIzaSyC9o2coXw_Nn55gJI2evuPNUFCqe3BpYA4'
        }, function(data) {
            if (data.pageInfo.totalResults === 0) {
                $("<p class=\"video-title\" style=\"text-align: center;\">Nothing found..</p>").appendTo("#results");
                return;
            }


            for (var i = 0; i < data.items.length; i++) {
                var videotitle = data.items[i].snippet.title.replace(/'/g, "").replace(/"/g, "");
                $("#results").append("<div id=\"roll\" class=\"video\" onclick='listadd(" + "\"" + data.items[i].id.videoId + "\"" + "," + "\"" + videotitle + "\"" + ")'>  <img class=\"video-image\" style=\"float: left; left: 10px; position: absolute; top: 10px;\" src='" + data.items[i].snippet.thumbnails.default.url + "'> <p class=\"video-title\">" + data.items[i].snippet.title + "</p> <p class=\"video-description\">" + data.items[i].snippet.description + "</p><p class=\"video-author\">" + data.items[i].snippet.channelTitle + "</p> </div>");
            }

        }).fail(function(jqXHR, textStatus, errorThrown) {
            $("<p style='color: #F00;'></p>").text(jqXHR.responseText || errorThrown).appendTo("#video-title");
        });

    }
}


//typing text
var TxtRotate = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    var that = this;
    var delta = 115 - Math.random() * 100;

    if (this.isDeleting) {
        delta /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(function() {
        that.tick();
    }, delta);
};

window.onload = function() {
    var elements = document.getElementsByClassName('txt-rotate');
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-rotate');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtRotate(elements[i], JSON.parse(toRotate), period);
        }
    }

    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
    document.body.appendChild(css);
};
