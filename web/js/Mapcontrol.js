/*
 * openlayers 3857
 * wgs84 4326
 * baidu gaode pianyi 4326
 */
/* global ol */

MapControl = function (opts) {
    var me = this;

    me.opts = $.extend(true, {
        target: "mainmap",
        width: '100%',
        height: '100%',
        center: [0, 0],
        zoom: 16,
        bkmapname: "NOTHING",
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


    me.olmapID = uuid();
    me.bkmapID = uuid();

    me.olmapEL = $("<div>")
            .attr("id", me.olmapID)
            .appendTo(me.el)
            .css({"z-index": 2})
            .addClass("map-layer");
    me.bkmapEL = $("<div>")
            .attr("id", me.bkmapID)
            .appendTo(me.el)
            .css({"z-index": 1})
            .addClass("map-layer");

    me._initolmap();
    me._initBKmap();

};

MapControl.prototype._initolmap = function () {
    var me = this;
    var newcenter = ol.proj.transform(me.opts.center, "EPSG:4326", "EPSG:3857");

    me.olmap = new ol.Map({
        layers: [

        ],
        target: me.olmapID,
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
    $(".ol-zoom").css({
        left : 'auto',
        right: '.5em'
    });
    $('.ol-touch .ol-control').css({
        'font-size' : '1.0em'
    });
    
    me.olmap.getView().on("change", function (e) {
        me.updateBackgroundMap();
    });
    me.olmap.on("pointerdrag", function (e) {
        me.updateBackgroundMap();
    });

    me.olmap.on("click", function (e) {
        var coord = e.coordinate;
        coord = ol.proj.transform(coord, "EPSG:3857", "EPSG:4326");

//        Connector({
//            url: "MyGISServer",
//            params: {
//                type: "FEATURE_IDENFITY",
//                data: {
//                    x: coord[0],
//                    y: coord[1]
//                }
//            },
//            success: function (json) {
//                var opts = {
//                    width: 250, // 信息窗口宽度    
//                    height: 100, // 信息窗口高度    
//                    title: json['data']['name']
//                }
//                var marker = new BMap.Marker(new BMap.Point(coord));        // 创建标注    
//                me.bkmap.addOverlay(marker);
////                var infoWindow = new BMap.InfoWindow("World", opts);  // 创建信息窗口对象    
////                me.bkmap.openInfoWindow(infoWindow, new BMap.Point(coord));      // 打开信息窗口
//            }
//        });
    });
};

MapControl.prototype._initBKmap = function () {
    var me = this;
    me.setBackgroundMap(me.opts.bkmapname);
};

MapControl.prototype.getCenter = function () {
    var me = this;
    return me.olmap.getView().getCenter();
};

MapControl.prototype.getZoom = function () {
    var me = this;
    return me.olmap.getView().getZoom();
};


MapControl.prototype.setBackgroundMap = function (bkname) {
    var me = this;
    if (me.bkmap && me.opts.bkmapname === bkname) {
        return;
    }
    me.destroyBackgroundMap();
    me.opts.bkmapname = bkname;

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.bkmap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        me.olmap.getLayers().insertAt(0, me.bkmap);
    } else if (bkname === "GOOGLE_SATELLITE" ||
            bkname === "GOOGLE_HYBRID" ||
            bkname === "GOOGLE_TERRAIN" ||
            bkname === "GOOGLE_ROADMAP"
            ) {
        me.setGoogleBackgroundmap();
    } else if (bkname === "BAIDU") {
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
    }
};

MapControl.prototype.getBackgroundMapName = function () {
    var me = this;
    return me.opts.bkmapname;
};


MapControl.prototype.destroyBackgroundMap = function (bkname) {
    var me = this;

    var bkname = me.opts.bkmapname;
    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {
        me.olmap.removeLayer(me.bkmap);
        me.bkmapEL.empty();
    } else if (bkname === "GOOGLE_SATELLITE" ||
            bkname === "GOOGLE_HYBRID" ||
            bkname === "GOOGLE_TERRAIN" ||
            bkname === "GOOGLE_ROADMAP"
            ) {
        me.bkmapEL.empty();
    } else if (bkname === "BAIDU") {
        me.bkmapEL.empty();
    }
};

MapControl.prototype.setGoogleBackgroundmap = function () {
    var me = this;

    if (me._googleJSReady) {
        me.initgoogledemap();
    } else {
        $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyA-t6e94_7rituD9no88Y5BYo-FE6b5Tz0", function () {
            me.initgoogledemap();
            me._googleJSReady = true;
        });
    }
};


MapControl.prototype.initbaidumap = function (bkname) {
    var me = this;
    me.bkmap = new BMap.Map(me.bkmapID);          // 创建地图实例  
    var mycenter = me.opts.center;

    var bgc = me.opts.transform.wgs84tobd09(mycenter[0], mycenter[1]);
    var point = new BMap.Point(bgc[0], bgc[1]);  // 创建点坐标  
    me.bkmap.centerAndZoom(point, me.opts.zoom);
};

MapControl.prototype.initgoogledemap = function (bkname) {
    var me = this;
    //var googlec = me.opts.transform.wgs84togcj02(me.opts.center[0], me.opts.center[1]);
    var googlec = me.opts.center;
    var uluru = {
        lat: googlec[1],
        lng: googlec[0]
    };

    var maptype = me.opts.bkmapname.split("_")[1].toLowerCase();
    me.bkmap = new google.maps.Map(document.getElementById(me.bkmapID), {
        center: uluru,
        mapTypeId: maptype,
        zoom: me.opts.zoom
    });

    me.updategoogleMap();

    for (var i = 1; i < 3; i++) {
        setTimeout(function () {
            $(".gmnoprint").remove();
            $(".gm-fullscreen-control").remove();
            $("[src='https://maps.gstatic.com/mapfiles/api-3/images/google_white5_hdpi.png']").hide();
        }, 300 * i);
    }
//    setTimeout(function () {
//        $(".gm-fullscreen-control").remove();
//        $(".gmnoprint").remove();
//    }, 1000);
};

MapControl.prototype.updateBackgroundMap = function () {
    var me = this;
    var bkname = me.opts.bkmapname;

    me.opts.center = ol.proj.transform(me.getCenter(), "EPSG:3857", "EPSG:4326");
    me.opts.zoom = me.getZoom();

    if (bkname === "NOTHING") {

    } else if (bkname === "OSM") {

    } else if (bkname === "GOOGLE_SATELLITE" ||
            bkname === "GOOGLE_HYBRID" ||
            bkname === "GOOGLE_TERRAIN" ||
            bkname === "GOOGLE_ROADMAP"
            ) {
        me.updategoogleMap();
    } else if (bkname === "BAIDU") {
        me.updatebaiduMap();
    }
};

MapControl.prototype.updategoogleMap = function () {
    var me = this;
    var zoom = me.getZoom();
    if (zoom % 1 !== 0) {
        return;
    }

    var mycenter = me.getCenter();
    mycenter = ol.proj.transform(mycenter, "EPSG:3857", "EPSG:4326");

    //var googlec = me.opts.transform.wgs84togcj02(mycenter[0], mycenter[1]);
    me.bkmap.setOptions({
        zoom: zoom,
        center: {lng: mycenter[0], lat: mycenter[1]}
    });
};


MapControl.prototype.updatebaiduMap = function () {
    var me = this;
    var v = me.getZoom();
    var mycenter = me.getCenter();
    mycenter = ol.proj.transform(mycenter, "EPSG:3857", "EPSG:4326");
    var bdc = me.opts.transform.wgs84tobd09(mycenter[0], mycenter[1]);

    me.bkmap.setZoom(v);
    me.bkmap.setCenter(new BMap.Point(bdc[0], bdc[1]));
};