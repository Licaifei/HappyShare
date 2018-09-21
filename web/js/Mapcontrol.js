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
        me.getPointsInfo();
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
                var information = json.data.geoList[0];
                me.showPoint(information);
            }
        },
        error: function (data) {
            alert("网络错误，请检查您的网络连接！");
        }
    });
};

MapControl.prototype.showPoint = function(information) {
//    var geo = information[0];
//    geo = geo.geometry[0];
//    alert(geo);
    var me = this;
    var points = me.handelPointFormat(information);
    //创建小狐狸
    for(var i = 0; i < points.length; i++) {
        var scenicName = information[i].scenicname[0];
        var pt = new BMap.Point(points[i][0], points[i][1]);
        var myIcon = new BMap.Icon("http://lbsyun.baidu.com/jsdemo/img/fox.gif", new BMap.Size(150, 150));
        //, {icon: myIcon}
        var marker = new BMap.Marker(pt);  // 创建标注   
        me.bkmap.addOverlay(marker);              // 将标注添加到地图中
        marker.addEventListener("click",function(){
            me.showPointInfo(this, scenicName);
        });   //添加监听事件
        
    }
    
};

MapControl.prototype.showPointInfo = function(thisMarker, data){
    //获取点的信息
    var sContent = 
    '<ul style="margin:0 0 5px 0;padding:0.2em 0">'  
    +'<li style="line-height: 26px;font-size: 15px;">'  
    +'<span style="width: 50px;display: inline-block;">名称：</span>' + data + '</li>';
    var infoWindow = new BMap.InfoWindow(sContent); //创建信息窗口对象
    thisMarker.openInfoWindow(infoWindow); //图片加载完后重绘infoWindow
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