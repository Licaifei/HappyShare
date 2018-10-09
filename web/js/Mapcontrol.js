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
        center: [112.9357, 26],
        zoom: 5,
        transform: null,
        keys: {
            google: "AIzaSyA-t6e94_7rituD9no88Y5BYo-FE6b5Tz0",
            baidu: "hs5FSdjmy2qPjG3UtjNpsRssf24c1ccx"
        }
    }, opts);

    me._init();
};

MapControl.prototype.panorama = null;
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
        // me.getPointsInfo();
    };
};

MapControl.prototype.initbaidumap = function () {
    var me = this;
    me.bkmap = new BMap.Map(me.bkmapID);          // 创建地图实例  
    me.panorama = new BMap.Panorama(me.bkmapID); 
    me.panorama.setPov({heading: -40, pitch: 6});   //创建全景地图
    var mycenter = me.opts.center;

    var bgc = me.opts.transform.wgs84tobd09(mycenter[0], mycenter[1]);
    var point = new BMap.Point(bgc[0], bgc[1]);  // 创建点坐标  
    me.bkmap.centerAndZoom(point, me.opts.zoom);
    me.bkmap.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    // me.bkmap.addControl(new BMap.NavigationControl());
    me.bkmap.addControl(new BMap.ScaleControl());
    me.bkmap.addControl(new BMap.OverviewMapControl());
    me.bkmap.addControl(new BMap.MapTypeControl());
//    me.bkmap.setCurrentCity("北京"); // 仅当设置城市信息时，MapTypeControl的切换功能才能可用

    if(me.opts.type === "index")
    {
        me.getPointsInfo();
    }
    else {
        me.getTrendInfo();
    }
};

//增加点（WGS84)在图层上
MapControl.prototype.getPointsInfo = function () {
    var me = this;
    $.ajax({
        url: "TotalServer",
        data: {
            request: JSON.stringify({
                type: "Point_Index",
                data: {}
            })
        },
        method: "POST",
        success: function (data) {
            var json = JSON.parse(data);
            if(json.success === true){
                this.information = json.data.geoList[0];
                me.showPoint(this.information);
            }
        },
        error: function (data) {
            alert("网络错误，请检查您的网络连接！");
        }
    });
};

MapControl.prototype.getTrendInfo = function() 
{
    var me = this;
    var userid = sessionStorage["userid"];
    if(typeof(userid) === "undefined")
        return;
    $.ajax({
        url: "TotalServer",
        data: {
            request: JSON.stringify({
                type: "Point_Trend",
                data: {
                    userid : userid
                }
            })
        },
        method: "POST",
        success: function (data) {
            var json = JSON.parse(data);
            if(json.success === true){
                this.information = json.data.geoList[0];
                me.showTrendPoint(this.information);
            }
        },
        error: function (data) {
            alert("网络错误，请检查您的网络连接！");
        }
    });
};
/**
 * 将动态信息显示到地图
 * @param {json} information
 * @returns {}
 */
MapControl.prototype.showTrendPoint = function(information)
{
    var me = this;
    me.trendinformation = information;

    me.trendpoints = me.handelPointFormat(information);
    me.addTrendPointToMap();
};

MapControl.prototype.addTrendPointToMap = function(){
    var me = this;
    me.BDTrendPointMaker = [];
    for(var i = 0; i < this.trendpoints.length; i++) {
        var scenicName = me.trendinformation[i].content[0];
        var pt = new BMap.Point(this.trendpoints[i][0], this.trendpoints[i][1]);
        var myIcon = new BMap.Icon("image/point-of-interest-32.png", new BMap.Size(32, 32));
        var marker = new BMap.Marker(pt, {icon: myIcon});  // 创建标注  
//        marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        me.bkmap.addOverlay(marker);              // 将标注添加到地图中
        me.addClickHandler(scenicName,marker);   //添加监听事件    
        me.BDTrendPointMaker.push(marker);
    }   
};

/**
 * 将景点显示到地图上
 * @param {json} information
 * @returns {}
 */
MapControl.prototype.showPoint = function(information) {
    var me = this;
    me.information = information;

    me.points = me.handelPointFormat(information);
    me.addPointToMap();
};

MapControl.prototype.addPointToMap = function(){
    var me = this;
    me.BDPointMaker = [];
    for(var i = 0; i < this.points.length; i++) {
        var scenicName = me.information[i].scenicname[0];
        var pt = new BMap.Point(this.points[i][0], this.points[i][1]);
        var myIcon = new BMap.Icon("image/point-of-interest-32.png", new BMap.Size(32, 32));
        var marker = new BMap.Marker(pt, {icon: myIcon});  // 创建标注  
//        marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        me.bkmap.addOverlay(marker);              // 将标注添加到地图中
        me.addClickHandler(scenicName,marker);   //添加监听事件    
        me.BDPointMaker.push(marker);
    }   
};

//处理监听事件
MapControl.prototype.addClickHandler = function (content, marker) {
    var me = this;
    marker.addEventListener("mouseover", function (e) {
        me.showPointInfo(content, e);
    });    
    marker.addEventListener("mouseout", function (e) {
        me.delPointInfo(e);
    });
    marker.addEventListener("click", function (e) {
        me.bdPanorama(e);
    });
};

MapControl.prototype.bdPanorama = function(e) {
    var me = this;
    var p = e.target;
    var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
    me.panorama.setPosition(point); 
    me.panorama.show();
};

MapControl.prototype.delPointInfo = function(e) {
    var me = this;
    me.bkmap.closeInfoWindow();
};

MapControl.prototype.showPointInfo = function(content, e){
    //获取点的信息
    var me = this;
    var p = e.target;
    var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
    var infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象 
    me.bkmap.openInfoWindow(infoWindow, point); //开启信息窗口
};

MapControl.prototype.handelPointFormat = function(information) {
    var me = this;
    var points = new Array();
    for (items in information){
        var geo = information[items].geometry[0];
        var index = geo.indexOf(" ");
        var lng = parseFloat(geo.substr(6, index-6));
        var lat = parseFloat(geo.substr(index+1, geo.length-index-2));
        var transform = new Coordtransform();
        var point = transform.bd09towgs84(lng, lat);
        points.push(point);
    }
    return points;
};

MapControl.prototype.searchByPology = function(cityName){
    var me = this;
    for(var i = 0; i < me.points.length; i++){
        var flag = me.inOrOutPology(me.points[i], me.ply);
        if(flag === true){
            me.BDPointMaker[i].setAnimation(BMAP_ANIMATION_BOUNCE);
        }
    }
};

MapControl.prototype.pologyByCityName = function(cityName) {
    var me = this;
    var bdary = new BMap.Boundary();
    bdary.get(cityName, function(rs) { //获取行政区域
        me.bkmap.clearOverlays(); //清除地图覆盖物    
        me.addPointToMap();
        var count = rs.boundaries.length; //行政区域的点有多少个
        if (count === 0) {
            alert('未能获取当前输入行政区域');
            return;
        }
        var pointArray = [];
        for (var i = 0; i < count; i++) {
            var ply = new BMap.Polygon(rs.boundaries[i], {
                strokeWeight: 2,
                strokeColor: "#ff0000"
            }); //建立多边形覆盖物
            me.bkmap.addOverlay(ply); //添加覆盖物
            pointArray = pointArray.concat(ply.getPath());     
        }
        var pts = [];
        for(var i = 0; i < pointArray.length; i++)
            pts.push(pointArray[i]);
        me.ply= new BMap.Polygon(pts);
        me.searchByPology();
    });
};

MapControl.prototype.inOrOutPology = function(point, ply){
    var pt = new BMap.Point(point[0], point[1]);
    var result = BMapLib.GeoUtils.isPointInPolygon(pt, ply);
    return result;
};