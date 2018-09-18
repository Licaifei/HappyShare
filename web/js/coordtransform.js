Coordtransform = function (){
    var me = this;
    me._init();
};

Coordtransform.prototype._init =  function(){
    var me = this;
    me.x_pi = 3.14159265358979324 * 3000.0 /180.0;
    me.pi = 3.14159265358979324;
    me.a = 6378245.0;
    me.ee = 0.00669342162296594323;
};

// 百度坐标转WGS
/*
 * @param lng 百度坐标纬度
 * @param lat 百度坐标经度
 * @retrun WGS84坐标
 */

Coordtransform.prototype.bd09towgs84 = function(lng, lat){
    var me = this;
    var gcj = me.bd09togcj02(lng, lat);
    var wgs84 = me.gcj02towgs84(gcj[0],gcj[1]);
    return wgs84;
};

/*
 * @param lng WGS84坐标纬度
 * @param lat WGS84坐标经度
 * @retrun 百度坐标
 */

Coordtransform.prototype.wgs84tobd09 = function(lng, lat){
    var me = this;
    var gcj = me.bd09togcj02(lng, lat);
    var wgs84 = me.gcj02towgs84(gcj[0],gcj[1]);
    return wgs84;
};

/*
 * 纬度转换
 * @param {type} lng
 * @param {type} lat
 * @returns {Number}
 */
Coordtransform.prototype.transformlat= function(lng, lat){
    var me = this;
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * me.pi) + 20.0 * Math.sin(2.0 * lng * me.pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * me.pi) + 40.0 * Math.sin(lat / 3.0 * me.pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * me.pi) + 320 * Math.sin(lat * me.pi / 30.0)) * 2.0 / 3.0;
    return ret;
};

/*
 * 经度转换
 * @param {type} lng
 * @param {type} lat
 * @returns {undefined}
 */

Coordtransform.prototype.transformlng= function(lng, lat){
    var me = this;
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * me.pi) + 20.0 * Math.sin(2.0 * lng * me.pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * me.pi) + 40.0 * Math.sin(lng / 3.0 * me.pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * me.pi) + 300.0 * Math.sin(lng / 30.0 * me.pi)) * 2.0 / 3.0;
    return ret;
    
};

/*
 * 火星坐标系gcj
 */

Coordtransform.prototype.bd09togcj02 = function(lng, lat){
    var me = this;
    var x = lng - 0.0065;
    var y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * me.x_pi);
    var theta = Math.atan2(y,x) - 0.000003 * Math.cos(x * me.x_pi);
    var gglng = z * Math.cos(theta);
    var gglat = z * Math.sin(theta);
    return [gglng,gglat];
};



Coordtransform.prototype.gcj02tobd09= function(lng, lat){
    var me = this;
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * me.x_pi);
    var theta = Math.atan2(lat,lng) + 0.000003 * Math.cos(lng * me.x_pi);
    var bdlng = z * Math.cos(theta) + 0.0065;
    var bdlat = z * Math.sin(theta) + 0.006;
    return [bdlng, bdlat];
};

Coordtransform.prototype.gcj02towgs84= function(lng, lat){
    var me = this;
    if(me.outof_china(lng,lat) === true){
        return [lng,lat];
    }
    var dlat = me.transformlat(lng - 105.0, lat - 35.0);
    var dlng = me.transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * me.pi;
    var magic = Math.sin(radlat);
    magic = 1 - me.ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((me.a * (1 - me.ee)) / (magic * sqrtmagic) * me.pi);
    dlng = (dlng * 180.0) / (me.a / sqrtmagic * Math.cos(radlat) * me.pi);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return [lng*2-mglng, lat*2-mglat];
};

Coordtransform.prototype.wgs84togcj02 = function(lng, lat){
    var me = this;
    if(me.outof_china(lng,lat) === true){
        return [lng,lat];
    }
    var dlat = me.transformlat(lng - 105.0, lat - 35.0);
    var dlng = me.transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * me.pi;
    var magic = Math.sin(radlat);
    magic = 1 - me.ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((me.a * (1 - me.ee)) / (magic * sqrtmagic) * me.pi);
    dlng = (dlng * 180.0) / (me.a / sqrtmagic * Math.cos(radlat) * me.pi);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return [mglng,mglat];
};

Coordtransform.prototype.outof_china= function(lng, lat){
    var me = this;
    if (lng < 72.004 || lng > 137.8347) {
        return true;
    } else if (lat < 0.8293 || lat > 55.8271) {
        return true;
    }
    return false;
}
;
