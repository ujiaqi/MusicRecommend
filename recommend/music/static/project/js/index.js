/*
$(function() {
  var curIndex = 0;
  var curTrackLen;
  var curTotalTime;
  var playCondition = false;
  var listId;
  var curList;
  var recommend;
  var playlistData = [];
  var historyList = [];
  var resultList = [];
  var searchList = [];
  //列表 id 和 url
  var getListUrl = "https://v1.hitokoto.cn/nm/playlist/";
  var discoverListId = 5177783391;
  var dynamicListId = 5190711437;
  var gentleListId = 5193964181;
  var discoverUrl = "http://127.0.0.1:8000/getMusicList";
  // var discoverUrl = getListUrl + discoverListId;
  // var dynamicUrl = getListUrl + dynamicListId;
  // var gentleUrl = getListUrl + gentleListId;
  var dynamicUrl = "http://127.0.0.1:8000/getMusicList";
  var gentleUrl = "http://127.0.0.1:8000/getMusicList";
  var initList = new Playerlist();

  //1.初始化
  //1.1 播放器初始化
  initList.getData(discoverUrl, initPlayer);

  function initPlayer(data) {
    curList = initList.getSongInfo(data);
    recommend = initList.getSongInfo(data);
    curTrackLen = curList.length;
    listId = data.getId;
    // listId = data.playlist.id;
    //初始化歌曲
    trackInfo();
    playStatus();
    setInterval(playProgress, 200);
    //初始化列表
    hisListUpdate();
    loadMyList();
    loadLibraryList(data);
    clickEvent();
  }
  //1.2 dynamiclist和gentlelist初始化
  initList.getData(dynamicUrl, loadLibraryList);
  initList.getData(gentleUrl, loadLibraryList);
  // initList.getData(discoverUrl, loadLibraryList);
  //2.界面控制
  //2.1 获取歌曲信息
  function trackInfo() {
    console.log(curList);
    var song = curList[curIndex];
    var $cover = $('.trackInfo .cover');
    var $trackName = $('.trackInfo .trackName p');
    var $artist = $('.trackInfo .artist');
    // console.log(song.picUrl)
    $cover.css('background', 'url(' + song.picUrl + '?param=200y200)');
    $cover.css('background-size', 'cover');
    $trackName.text(song.name);
    $trackName.css('--duration', $trackName[0].offsetWidth / 100 + 's');
    $artist.text(song.artist);
    curTotalTime = song.duration;
    $('.controls .total').text(initList.timeConvert(curTotalTime));
    //url
    $('#audio source').attr('src', song.mp3Url);
    $('#audio')[0].load();

    // loadLyric(song.id);
  }

  //2.3 播放状态控制(ui和audio)
  function playStatus() {
    $('.controls .play').attr('class', 'play iconfont icon-' + (playCondition ? 'zanting' : 'bofang'));

    if (playCondition) {
      $('#audio')[0].play();
      $('.rotate').addClass('running');
    } else {
      $('#audio')[0].pause();
      $('.rotate').removeClass('running');
    }
  }
  //2.4 进度条设置(动态)
  function playProgress() {
    var curTime = $('#audio')[0].currentTime;
    $('.controls .current').text(initList.timeConvert(curTime));
    //currentBar(样式+切换)
    $('.controls .currentBar').css('width', curTime / curTotalTime * 100 + '%');
    //pointer跟随
    $('.controls .progressBtn').css('left', curTime / curTotalTime * $('.progressBar')[0].offsetWidth - $('.progressBtn')[0].offsetWidth * 0.5 + 'px');

    if (curTime >= curTotalTime) {
      $('.controls .next').click();
    }
  }

  //3.列表加载
  function hisListUpdate($itemClicked) {
    if ($itemClicked && $itemClicked[0].listId == 'history') {
      initList.historyDataUpdate(historyList, $itemClicked[0]);
      initList.topItem($itemClicked);
    } else {
      initList.historyDataUpdate(historyList, curList[curIndex]);
      initList.showList(historyList, $('.recentContent'), 'history');
    }
  }

  function loadMyList() {

    initList.showList(recommend, $('.myListContent'), listId);
    initList.myListHighLight(curIndex);
  }

  function loadLibraryList(data) {

    // var songlist = data.playlist.tracks;
    var songlist = initList.getSongInfo(data);
    var id = data.getId;
    initList.showList(curList, $('.discoverContent'), id);
    initList.listItemStyle(curList, curIndex, playCondition);
    // var id = data.playlist.id;
    //若playlistData找得到符合条件的元素,则返回赋值给 item
    // var item = playlistData.find(ele => {
    //   return ele.id == id;
    // });
    // if (item) return;
    // playlistData.push({
    //   id: id,
    //   songlist: songlist
    // });
    // if (id === dynamicListId) {
    //   initList.showList(songlist, $('.dynamicContent'), id);
    // }
    // if (id === gentleListId) {
    //   initList.showList(songlist, $('.gentleContent'), id);
    // }
    // if (id === discoverListId) {
    //   initList.showList(curList, $('.discoverContent'), id);
    //   initList.listItemStyle(curList, curIndex, playCondition);
    // }
  }

  //4.事件
  //4.1 状态更改和歌曲切换
  function clickEvent() {
    function trackChange($itemClicked) {
      hisListUpdate($itemClicked);
      playCondition = true;
      //得先渲染新的 dom 再liststyle
      initList.listItemStyle(curList, curIndex, playCondition);
      trackInfo();
      playStatus();
      initList.myListHighLight(curIndex);
    }

    function listChange($itemClicked) {
      listId = $itemClicked[0].listId;
      switch (listId) {
        case 'search':
          curList = searchList;
          hisListUpdate($itemClicked);
          break;
        case 'history':
          curList = $.extend(true, [], historyList);
          break;
        default:
          curList = playlistData.find(ele => {
            return ele.id === listId;
          }).songlist;
          hisListUpdate($itemClicked);
      }
      curTrackLen = curList.length;
      playCondition = true;
      initList.listItemStyle(curList, curIndex, playCondition);
      trackInfo();
      playStatus();
      loadMyList();
    }

    //1.播放
    $('.controls .play').unbind('click').click(function() {
      playCondition = !playCondition;
      playStatus();
      initList.listItemStyle(curList, curIndex, playCondition);
    });
    //2.上一首
    $('.controls .prev').unbind('click').click(function() {
      if (curIndex === 0) {
        curIndex = curTrackLen - 1;
      } else {
        curIndex--;
      }
      trackChange();
    });
    //3.下一首
    $('.controls .next').unbind('click').click(function() {
      if (curIndex === curTrackLen - 1) {
        curIndex = 0;
      } else {
        curIndex++;
      }
      trackChange();
    });

    // 4. 列表点击事件
    $('.songList').undelegate('click').delegate('.listItem', 'click', function() {
      if (this.listId !== 'history' && this.listId === listId) {
        if (this.index === curIndex) {
          $('.controls .play').click();
          return;
        } else {
          curIndex = this.index;
          trackChange();
        }
      }
      if (this.listId !== 'history' && this.listId !== listId) {
        curIndex = this.index;
        listChange($(this));
      }
      if (this.listId === 'history') {
        if (listId == 'history' && this.trackId == curList[curIndex].id) {
          $('.controls .play').click();
          return;
        } else {
          hisListUpdate($(this));
          curIndex = 0;
          listChange($(this));
        }
      }
      initList.addTrackAnimate();
    });

    //5.searchlist点击(sch与 curlist相互独立的,而 4 里边是同步的)
    $('.searchContent').undelegate('click').delegate('.listItem', 'click', function() {
      var song = curList.find(ele => {
        return ele.id == this.trackId;
      });
      if (song) {
        curIndex = curList.indexOf(song);
        if (listId == 'search') trackChange($(this));
        else {
          searchList = $.extend(true, [], curList);
          initList.changeListId(searchList, 'search');
          listChange($(this));
        }
      }
      if (!song) {
        if (listId !== 'search') {
          searchList = $.extend(true, [], curList);
          initList.changeListId(searchList, 'search');
        }
        searchList.unshift(resultList[this.index]);
        curIndex = 0;
        listChange($(this));
      }
      initList.addTrackAnimate();
    });

    //3.2 其他
    //volume
    $('.controls .volumn').unbind('click').click(function() {
      $(this).toggleClass('icon-jingyin icon-yinliang');
      $('audio')[0].volume = ($(this).hasClass('icon-yinliang')) ? 1 : 0;
    });
    //mode
    $('.controls .mode').unbind('click').click(function() {
      $(this).toggleClass('icon-shunxu icon-danquxunhuan');
      $('audio')[0].loop = ($(this).hasClass('icon-danquxunhuan')) ? true : false;
    });
    //list
    $('.controls .list').unbind('click').click(function() {
      $('.myListContent').toggle();
      $('.myListContainer').animate({
        width: 'toggle'
      }, 300);
    });


    //category
    $('.category > div').unbind('click').click(function() {
      $('.category').hide();
      $('.discoverContainer').hide();
      if (this === $('.recent')[0]) {
        $('.recentContainer').show();
      } else if (this === $('.dynamic')[0]) {
        $('.dynamicContainer').show();
      } else if (this === $('.gentle')[0]) {
        $('.gentleContainer').show();
      }
    });

    //back
    $('.back-btn').unbind('click').click(function() {
      $('.recentContainer').hide();
      $('.dynamicContainer').hide();
      $('.gentleContainer').hide();
      $('.searchContainer').hide();
      $('.category').show();
      $('.discoverContainer').show();
      if ($(this).parents().hasClass('searchContainer')) {
        $('.searchContent').empty();
        initList.listItemStyle(curList, curIndex, playCondition);
      }
    });

    //3.3progress事件
    function progressMove(e) {
      var updateTime;
      if (e.target === $('.progressBtn')[0]) {
        updateTime = ($('.progressBtn')[0].offsetLeft / $('.controls .progressBar')[0].offsetWidth) * curTotalTime;
      } else {
        updateTime = (e.offsetX / $('.player .controls .progressBar')[0].offsetWidth) * curTotalTime;
      }
      $('#audio')[0].currentTime = updateTime;
    }

    // 1.进度条整体的鼠标按下事件
    var btnIsClick = false;
    $('.controls .progressBar').unbind('mousedown').mousedown(function(e) {
      // console.log('鼠标按下');
      e.preventDefault();
      progressMove(e);
    });

    // 2.鼠标点击按钮事件
    $('.controls .progressBtn').unbind('mousedown').mousedown(function(e) {
      // console.log('鼠标按下');
      btnIsClick = true;
    });

    //3.拖拽 btn (两个事件同时发生)
    $('.controls .progressBar').unbind('mousemove').mousemove(function(e) {
      // console.log('鼠标正在移动');
      if (btnIsClick) {
        progressMove(e);
      }
    });

    //4. 弹起
    $(document).unbind('mouseup').mouseup(function() {
      // console.log('鼠标弹起');
      btnIsClick = false;
    });
  }
});
*/

$(function() {
  var curIndex = 0;
  var curTrackLen;
  var curTotalTime;
  var playCondition = false;
  var listId;
  var curList;
  var playlistData = [];
  var historyList = [];
  var resultList = [];
  var searchList = [];
  //列表 id 和 url
  // var getListUrl = "https://v1.hitokoto.cn/nm/playlist/";
  var discoverListId = 5177783391;
  var dynamicListId = 5190711437;
  var gentleListId = 5190711435;
  // var discoverUrl = getListUrl + discoverListId;
  // var dynamicUrl = getListUrl + dynamicListId;
  // var gentleUrl = getListUrl + gentleListId;

  // 拿到项目后最主要改这里三个地址，其他的我也不太清楚了
  var discoverUrl = "http://127.0.0.1:8000/getMusicList";

  var dynamicUrl = "http://127.0.0.1:8000/getRecommendGenre";
  var gentleUrl = "http://127.0.0.1:8000/getMusicRecommend?musicIndex=";
  var initList = new Playerlist();

  //1.初始化
  //1.1 播放器初始化
  initList.getData(discoverUrl, initPlayer);

  function initPlayer(data) {
    curList = initList.getSongInfo(data);
    curTrackLen = curList.length;
    // listId = data.playlist.id;
    listId = data.getId;
    //初始化歌曲
    trackInfo();
    playStatus();
    setInterval(playProgress, 200);
    //初始化列表
    hisListUpdate();
    loadMyList();
    loadLibraryList(data);
    clickEvent();
  }
  //1.2 dynamiclist和gentlelist初始化
  initList.getData(dynamicUrl, loadLibraryList);
  initList.getData(gentleUrl, loadLibraryList);

  //2.界面控制
  //2.1 获取歌曲信息
  function trackInfo() {
    console.log(curList);
    var song = curList[curIndex];
    var $cover = $('.trackInfo .cover');
    var $trackName = $('.trackInfo .trackName p');
    var $artist = $('.trackInfo .artist');
    $cover.css('background', 'url(' + song.picUrl + '?param=200y200)');
    $cover.css('background-size', 'cover');
    $trackName.text(song.name);
    $trackName.css('--duration', $trackName[0].offsetWidth / 100 + 's');
    $artist.text(song.artist);
    curTotalTime = song.duration;
    $('.controls .total').text(initList.timeConvert(curTotalTime));
    //url
    $('#audio source').attr('src', song.mp3Url);
    $('#audio')[0].load();

    // loadLyric(song.id);
  }
  //2.2 获取歌词
  /*function loadLyric(songId) {
    var lyricUrl = "https://api.imjad.cn/cloudmusic/?type=lyric&id=" + songId;
    var initLyric = new Lyric(lyricUrl);
    initLyric.loadLrc();
  }*/
  //2.3 播放状态控制(ui和audio)
  function playStatus() {
    $('.controls .play').attr('class', 'play iconfont icon-' + (playCondition ? 'zanting' : 'bofang'));

    if (playCondition) {
      $('#audio')[0].play();
      $('.rotate').addClass('running');
    } else {
      $('#audio')[0].pause();
      $('.rotate').removeClass('running');
    }
  }
  //2.4 进度条设置(动态)
  function playProgress() {
    var curTime = $('#audio')[0].currentTime;
    $('.controls .current').text(initList.timeConvert(curTime));
    //currentBar(样式+切换)
    $('.controls .currentBar').css('width', curTime / curTotalTime * 100 + '%');
    //pointer跟随
    $('.controls .progressBtn').css('left', curTime / curTotalTime * $('.progressBar')[0].offsetWidth - $('.progressBtn')[0].offsetWidth * 0.5 + 'px');

    if (curTime >= curTotalTime) {
      $('.controls .next').click();
    }
  }

  //3.列表加载
  function hisListUpdate($itemClicked) {
    if ($itemClicked && $itemClicked[0].listId == 'history') {
      initList.historyDataUpdate(historyList, $itemClicked[0]);
      initList.topItem($itemClicked);
    } else {
      initList.historyDataUpdate(historyList, curList[curIndex]);
      initList.showList(historyList, $('.recentContent'), 'history');
    }
  }

  function loadMyList() {
    initList.showList(curList, $('.myListContent'), listId);
    initList.myListHighLight(curIndex);
  }

  function loadLibraryList(data) {
    // var songlist = data.playlist.tracks;
    var songlist = initList.getSongInfo(data);
    // var id = data.playlist.id;
    var id = data.getId;
    //若playlistData找得到符合条件的元素,则返回赋值给 item
    var item = playlistData.find(ele => {
      return ele.id == id;
    });
    if (item) return;
    playlistData.push({
      id: id,
      songlist: songlist
    });
    if (id === dynamicListId) {
      initList.showList(songlist, $('.dynamicContent'), id);
    }
    if (id === gentleListId) {
      initList.showList(songlist, $('.gentleContent'), id);
    }
    if (id === discoverListId) {
      initList.showList(curList, $('.discoverContent'), id);
      initList.listItemStyle(curList, curIndex, playCondition);
    }
  }

  //4.事件
  //4.1 状态更改和歌曲切换
  function clickEvent() {
    function trackChange($itemClicked) {
      hisListUpdate($itemClicked);
      playCondition = true;
      //得先渲染新的 dom 再liststyle
      initList.listItemStyle(curList, curIndex, playCondition);
      trackInfo();
      playStatus();
      initList.myListHighLight(curIndex);
    }

    function listChange($itemClicked) {
      listId = $itemClicked[0].listId;
      switch (listId) {
        case 'search':
          curList = searchList;
          hisListUpdate($itemClicked);
          break;
        case 'history':
          curList = $.extend(true, [], historyList);
          break;
        default:
          curList = playlistData.find(ele => {
            return ele.id === listId;
          }).songlist;
          hisListUpdate($itemClicked);
      }
      curTrackLen = curList.length;
      playCondition = true;
      initList.listItemStyle(curList, curIndex, playCondition);
      trackInfo();
      playStatus();
      loadMyList();
    }

    //1.播放
    $('.controls .play').unbind('click').click(function() {
      playCondition = !playCondition;
      playStatus();
      initList.listItemStyle(curList, curIndex, playCondition);
    });

    //喜欢
    $('.controls .like').unbind('click').click(function() {
        // initList.getData(dynamicUrl, loadLibraryList);
        initList.getData(gentleUrl+curList[curIndex].style, initPlayer);

        // alert(gentleUrl+curList[curIndex].style);
    });

    //2.上一首
    $('.controls .prev').unbind('click').click(function() {
      if (curIndex === 0) {
        curIndex = curTrackLen - 1;
      } else {
        curIndex--;
      }
      trackChange();
    });
    //3.下一首
    $('.controls .next').unbind('click').click(function() {
      if (curIndex === curTrackLen - 1) {
        curIndex = 0;
      } else {
        curIndex++;
      }
      trackChange();
    });

    // 4. 列表点击事件
    $('.songList').undelegate('click').delegate('.listItem', 'click', function() {
      if (this.listId !== 'history' && this.listId === listId) {
        if (this.index === curIndex) {
          $('.controls .play').click();
          return;
        } else {
          curIndex = this.index;
          trackChange();
        }
      }
      if (this.listId !== 'history' && this.listId !== listId) {
        curIndex = this.index;
        listChange($(this));
      }
      if (this.listId === 'history') {
        if (listId == 'history' && this.trackId == curList[curIndex].id) {
          $('.controls .play').click();
          return;
        } else {
          hisListUpdate($(this));
          curIndex = 0;
          listChange($(this));
        }
      }
      initList.addTrackAnimate();
    });

    //5.searchlist点击(sch与 curlist相互独立的,而 4 里边是同步的)
    $('.searchContent').undelegate('click').delegate('.listItem', 'click', function() {
      var song = curList.find(ele => {
        return ele.id == this.trackId;
      });
      if (song) {
        curIndex = curList.indexOf(song);
        if (listId == 'search') trackChange($(this));
        else {
          searchList = $.extend(true, [], curList);
          initList.changeListId(searchList, 'search');
          listChange($(this));
        }
      }
      if (!song) {
        if (listId !== 'search') {
          searchList = $.extend(true, [], curList);
          initList.changeListId(searchList, 'search');
        }
        searchList.unshift(resultList[this.index]);
        curIndex = 0;
        listChange($(this));
      }
      initList.addTrackAnimate();
    });

    //3.2 其他
    //volume
    $('.controls .volumn').unbind('click').click(function() {
      $(this).toggleClass('icon-jingyin icon-yinliang');
      $('audio')[0].volume = ($(this).hasClass('icon-yinliang')) ? 1 : 0;
    });
    //mode
    $('.controls .mode').unbind('click').click(function() {
      $(this).toggleClass('icon-shunxu icon-danquxunhuan');
      $('audio')[0].loop = ($(this).hasClass('icon-danquxunhuan')) ? true : false;
    });
    //list
    $('.controls .list').unbind('click').click(function() {
      $('.myListContent').toggle();
      $('.myListContainer').animate({
        width: 'toggle'
      }, 300);
    });

    //searchBar
    /*$('.searchBar .search').unbind('click').click(function() {
      var searchWord = $('#seach-txt').val();
      var searchUrl = 'https://v1.hitokoto.cn/nm/search/' + searchWord + '?type=SONG&offset=0&limit=30';
      if (searchWord == "") {
        alert("not empty");
        $('.searchBar .search').focus();
        return false;
      }
      initList.getData(searchUrl, showResult);

      function showResult(data) {
        $('.loader').hide();
        var songlist = data.result.songs;
        initList.getResultInfo(songlist, resultList);
        initList.showList(resultList, $('.searchContent'), 'search');
        initList.listItemStyle(curList, curIndex, playCondition);
      }
      $('#seach-txt').val('');
      $('.category').hide();
      $('.listContainer:visible').hide();
      $('.searchContent').empty();
      $('.searchContainer').show();
      $('.loader').show();
    });

    $('#seach-txt').keypress(function(e) {
      var keynum = (e.keyCode ? e.keyCode : e.which);
      if (keynum == 13) {
        $('.searchBar .search').click();
      }
    });*/
    //category
    $('.category > div').unbind('click').click(function() {
      $('.category').hide();
      $('.discoverContainer').hide();
      if (this === $('.recent')[0]) {
        $('.recentContainer').show();
      } else if (this === $('.dynamic')[0]) {
        $('.dynamicContainer').show();
      } else if (this === $('.gentle')[0]) {
        $('.gentleContainer').show();
      }
    });

    //back
    $('.back-btn').unbind('click').click(function() {
      $('.recentContainer').hide();
      $('.dynamicContainer').hide();
      $('.gentleContainer').hide();
      $('.searchContainer').hide();
      $('.category').show();
      $('.discoverContainer').show();
      if ($(this).parents().hasClass('searchContainer')) {
        $('.searchContent').empty();
        initList.listItemStyle(curList, curIndex, playCondition);
      }
    });

    //3.3progress事件
    function progressMove(e) {
      var updateTime;
      if (e.target === $('.progressBtn')[0]) {
        updateTime = ($('.progressBtn')[0].offsetLeft / $('.controls .progressBar')[0].offsetWidth) * curTotalTime;
      } else {
        updateTime = (e.offsetX / $('.player .controls .progressBar')[0].offsetWidth) * curTotalTime;
      }
      $('#audio')[0].currentTime = updateTime;
    }

    // 1.进度条整体的鼠标按下事件
    var btnIsClick = false;
    $('.controls .progressBar').unbind('mousedown').mousedown(function(e) {
      // console.log('鼠标按下');
      e.preventDefault();
      progressMove(e);
    });

    // 2.鼠标点击按钮事件
    $('.controls .progressBtn').unbind('mousedown').mousedown(function(e) {
      // console.log('鼠标按下');
      btnIsClick = true;
    });

    //3.拖拽 btn (两个事件同时发生)
    $('.controls .progressBar').unbind('mousemove').mousemove(function(e) {
      // console.log('鼠标正在移动');
      if (btnIsClick) {
        progressMove(e);
      }
    });

    //4. 弹起
    $(document).unbind('mouseup').mouseup(function() {
      // console.log('鼠标弹起');
      btnIsClick = false;
    });
  }
});