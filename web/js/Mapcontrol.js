/*
 * openlayers 3857
 * wgs84 4326
 * baidu gaode pianyi 4326
 */

/* global BMap */

MapControl = function (opts) {
    var me = this;

    me.opts = $.extend(true, {
        target: "mainmap",
        width: '100%',
        height: '100%',
        center: [0, 0],
        zoom: 14,
        transform: null,
        keys: {
            google: "AIzaSyA-t6e94_7rituD9no88Y5BYo-FE6b5Tz0",
            baidu: "hs5FSdjmy2qPjG3UtjNpsRssf24c1ccx"
        }
    }, opts);

    me._init();
};

MapControl.prototype._init = function () {
    var me = this;

    var w = me.opts.width;
    w = typeof w === "string" ? w : w + "px";
    var h = me.opts.height;
    h = typeof h === "string" ? h : h + "px";
    me.el = $("#" + me.opts.target).css({
        width: w,
        height: h
    }).addClass("map-control");

    me.bkmapID = uuid();

    me.bkmapEL = $("<div>")
            .attr("id", me.bkmapID)
            .appendTo(me.el)
            .css({"z-index": 1})
            .addClass("map-layer");

    me._initBKmap();
};


MapControl.prototype._initBKmap = function () {
    var me = this;
    if (me._baiduJSReady) {
        me.initbaidumap();
    } else {
        $.getScript("http://api.map.baidu.com/api?v=2.0&ak=hs5FSdjmy2qPjG3UtjNpsRssf24c1ccx&callback=__initbaidumap", function () {
            me.initbaidumap();
        });
    }
    window.__initbaidumap = function () {
        me._baiduJSReady = true;
        me.initbaidumap();
    };
};

MapControl.prototype.initbaidumap = function () {
    var me = this;
    me.bkmap = new BMap.Map(me.bkmapID);          // 创建地图实例  
    var mycenter = me.opts.center;

    var bgc = me.opts.transform.wgs84tobd09(mycenter[0], mycenter[1]);
    var point = new BMap.Point(bgc[0], bgc[1]);  // 创建点坐标  
    me.bkmap.centerAndZoom(point, me.opts.zoom);
    me.bkmap.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    me.bkmap.addControl(new BMap.NavigationControl());
    me.bkmap.addControl(new BMap.ScaleControl());
    me.bkmap.addControl(new BMap.OverviewMapControl());
    me.bkmap.addControl(new BMap.MapTypeControl());
//    me.bkmap.setCurrentCity("北京"); // 仅当设置城市信息时，MapTypeControl的切换功能才能可用
};