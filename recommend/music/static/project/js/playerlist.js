(function(window) {
  function Playerlist() {
    return new Playerlist.prototype.init();
  }
  Playerlist.prototype = {
    constructor: Playerlist,
    init: function() {},
    getData: function(url, callback) {
      $.ajax({
        url: url,
        type: "get",
        dataType: "json",
        cache: true,
        success: callback,
        error: function(e) {
          console.log(e);
        },
      });
    },
   /* getSongInfo: function(data) {
      var listId = data.playlist.id;
      var that = this;
      var songList = [];
      $.each(data.playlist.tracks, function(i, v) {
        var songInfo = new Object();
        songInfo.name = v.name;
        songInfo.artist = "Josh Yu";
        songInfo.picUrl = v.al.picUrl;
        songInfo.duration = 30000 / 1000;
        // songInfo.id = v.id;
        songInfo.mp3Url = 'http://music.163.com/song/media/outer/url?id=' + v.id + '.mp3';
        // songInfo.listId = listId;
        songList.push(songInfo);
      });
      return songList;
    },*/

    getSongInfo: function(data) {
      var listId = data.getId;
      var that = this;
      var songList = [];
      $.each(data.musicList, function(i, v) {
        var songInfo = new Object();
        songInfo.name = v.name;
        songInfo.artist = v.artist;
        songInfo.picUrl = v.picUrl;
        songInfo.duration = 30000 / 1000;
        songInfo.id = 5177783391;
        songInfo.style = v.style;
        songInfo.mp3Url = v.mp3Url;
        songInfo.listId = listId;
        songList.push(songInfo);
      });
      return songList;
    },

    /*getResultInfo: function(songlist, resultList) {
      resultList.length = 0;
      var that = this;
      //遍历获取 albumpic
      $.each(songlist, function(i, v) {
        // console.log(v.artists[0].name);
        var song = new Object();
        song.name = v.name;
        song.artist = v.artists[0].name;
        song.duration = v.duration / 1000;
        song.id = v.id;
        song.mp3Url = 'http://music.163.com/song/media/outer/url?id=' + v.id + '.mp3';
        var picUrl = 'https://v1.hitokoto.cn/nm/album/' + v.album.id;
        song.listId = 'search';
        that.getData(picUrl, showPic);
        //cb
        function showPic(data) {
          // console.log(data.album.picUrl + '?param=200y200');
          song.picUrl = data.album.picUrl;
          $('.searchContent').find('.songPic').eq(i).css('background', 'url(' + song.picUrl + '?param=200y200)');
          $('.searchContent').find('.songPic').eq(i).css('background-size', 'cover');

        }
        resultList.push(song);
      });
    },*/
    changeListId: function(list, listId) {
      $.each(list, function(i, v) {
        v.listId = listId;
      });
    },

    showList: function(list, $listContent, listId) {
      $listContent.data('mCS', '');
      // console.log(list);
      var that = this;
      var html = "";
      $listContent.empty();
      $.each(list, function(i, v) {
        html = '<ul class="listItem">' +
          '<li class="icon-wave"></li>' +
          '<li class="songPic"></li>' +
          '<li class="songInfo"><ul>' +
          '<li class="songName">' + v.name + '</li>' +
          '<li class="songArtist">' + v.artist + '</li>' +
          '</ul></li>' +
          '<li class="songTime"></li>' +
          '</ul>';
        $listContent.append(html);
        $listContent.find('.songPic').eq(i).css('background', 'url(' + v.picUrl + '?param=50y50)');
        $listContent.find('.songPic').eq(i).css('background-size', 'cover');
        $listContent.find('.songTime').eq(i).text(that.timeConvert(v.duration));
        $listContent.find('.listItem')[i].index = i;
        $listContent.find('.listItem')[i].listId = listId;
        $listContent.find('.listItem')[i].trackId = v.id;
      });
      $listContent.mCustomScrollbar();
    },
    myListHighLight: function(curIndex) {
      $('.myListContent .listItem').eq(curIndex).addClass("highlight");
      $('.myListContent .listItem').eq(curIndex).siblings().removeClass("highlight");
    },
    listItemStyle: function(curList, curIndex, playCondition) {
      var that = this;
      if (curList[curIndex].listId !== 'search') {
        $('.listItem').each(function(i, v) {
          if (this.listId !== curList[curIndex].listId || this.trackId !== curList[curIndex].id || $(this).parents().hasClass('myListContent'))
            return true;
          that.StyleClassToggle($(this), playCondition);
        });
      }
      if (curList[curIndex].listId == 'search') {
        var $listItem = $('.listItem').filter(function() {
          return this.trackId == curList[curIndex].id && !$(this).parents().hasClass('myListContent');
        });
        if ($listItem.length == 1) {
          that.StyleClassToggle($listItem, playCondition);
        }
        if ($listItem.length == 2) {
          $listItem.each(function(i, v) {
            if ($(this).parents().hasClass('recentContent')) return true;
            that.StyleClassToggle($(this), playCondition);
          });
        }
      }
    },
    StyleClassToggle: function($listItem, playCondition) {
      $('.listItem').find(".icon-wave").removeClass("wave-display");
      $('.listItem').find(".songPic").removeClass("songPic-big");
      if (playCondition) {
        $listItem.find(".icon-wave").addClass("wave-display");
      }
      $listItem.find(".songPic").addClass("songPic-big");
    },
    addTrackAnimate: function() {
      $('.btnsBar').append('<div class="icon-addTrack"></div>');
      $('.icon-addTrack').show();
      $('.icon-addTrack').animate({
        top: '-100px',
        opacity: '0'
      }, 800, function() {
        $('.icon-addTrack').remove();
      });
    },
    historyDataUpdate: function(historyList, song) {
      //historyList更新
      var item = historyList.find(ele => {
        if (song.id) { //传进来的是track 对应的对象
          return song.id == ele.id;
        } else { //传进来的是dom 对象
          return song.trackId == ele.id;
        }
      });
      // console.log(item);
      if (!item) {
        var cloneSong = $.extend(true, {}, song);
        cloneSong.listId = 'history';
        historyList.unshift(cloneSong);
      } else {
        var i = historyList.indexOf(item);
        historyList.splice(i, 1);
        historyList.unshift(item);
      }
      // console.log(historyList);
    },
    topItem: function($ItemClicked) {
      $('.recentContent .listItem').each(function(i, v) {
        if (this.trackId == $ItemClicked[0].trackId) {
          $(this).remove();
          $('.recentContent .mCSB_container').prepend(this);
        }
      });
    },
    timeConvert: function(timestamp) {
      var minutes = Math.floor(timestamp / 60);
      var seconds = Math.floor(timestamp - (minutes * 60));
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      timestamp = minutes + ':' + seconds;
      return timestamp;
    },
  };
  Playerlist.prototype.init.prototype = Playerlist.prototype;
  window.Playerlist = Playerlist;

})(window);
