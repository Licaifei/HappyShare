/* global ol */

MapControl = function (opts) {
    var me = this;
    me.opts = $.extend(true, {
        center: [0, 0],
        zoom: 3,
        backgroundMapName: "NOTHING"
    }, opts);
    //baidu key: hs5FSdjmy2qPjG3UtjNpsRssf24c1ccx
    me._init();

};


MapControl.prototype._init = function () {
    var me = this;

    me.el = $("#" + me.opts.target);

    me.olmapId = uuid();
    me.bkmapId = uuid();

    me.olmapEl = $("<div>").attr("id", me.olmapId).appendTo(me.el).css({
        "z-index": 2
    }).addClass("map-layer");

    me.bkmapEl = $("<div>").attr("id", me.bkmapId).appendTo(me.el).css({
        "z-index": 1
    }).addClass("map-layer");


    var newcenter = ol.proj.transform(me.opts.center, "EPSG:4326", "EPSG:3857");

    me.olmap = new ol.Map({
        layers: [

        ],
        target: me.olmapId,
        controls: ol.control.defaults({
            attributionOptions: {
                collapsible: false
            }
        }),
        view: new ol.View({
            center: newcenter,
            zoom: me.opts.zoom
        })
    });

    $(".ol-attribution").remove();

    me.setBackgroundMap(me.opts.backgroundMapName);

    me.olmap.getView().on("change", function (e) {
        me.updateBackgroundMap();
    });
    me.olmap.on("pointerdrag", function (e) {
        me.updateBackgroundMap();
    });

};


MapControl.prototype.setBackgroundMap = function (bkname) {
    var me = this;

    me.destroyBackgroundMap();

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.backgroundMap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        me.olmap.getLayers().push(me.backgroundMap);
    } else if (bkname === "GAODE") {
        $.getScript("https://webapi.amap.com/maps?v=1.4.9&key=c01f317e3fa6f9bf77e7a085e5e66d36", function () {
            me.initGaoDeMap();
        });
    }
};


MapControl.prototype.destroyBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.olmap.removeLayer(me.backgroundMap);
    } else if (bkname === "GAODE") {
        me.bkmapEl.remove();
    } 
};


MapControl.prototype.initGaoDeMap = function () {
    var me = this;
    var uluru = {
        lat: me.opts.center[1],
        lng: me.opts.center[0]
    };

    me.bkmap = new AMap.Map(me.bkmapId, {
        zoom: me.opts.zoom,
        center: uluru
    });
//    setTimeout(function () {
//        $(".gm-fullscreen-control").remove();
//        $(".gmnoprint").remove();
//    }, 1000);
};

MapControl.prototype.updateBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.backgroundMapName;
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {

    } else if (bkname === "GAODE") {
        me.updateGaoDeMap();
    } 
};

MapControl.prototype.updateGaoDeMap = function () {
    var me = this;
    var v = me.olmap.getView();
    var mycenter = v.getCenter();
    mycenter = ol.proj.transform(mycenter, "EPSG:3857", "EPSG:4326");
    me.bkmap.setZoomAndCenter(v.getZoom(), mycenter);
};



