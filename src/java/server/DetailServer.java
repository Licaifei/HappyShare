/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author pcwang
 */
public class DetailServer extends connectPG {

    String ScenicPoint;
    String ScenicName;
    int ScenicFirstID;
    int ScenicSecondID;
    int ScenicThirdID;
    JSONObject d = new JSONObject();

    public DetailServer() throws JSONException {
        super();
    }

    @Override
    public void run() {
        if (_type.equals("SEARCH")) {
            try {
                int index = _data.getInt("SearchID");
                Search(index, "scenicdata");
                SearchNear();
                Search(ScenicFirstID, "ScenicFirst");
                Search(ScenicSecondID, "ScenicSecond");
                Search(ScenicThirdID, "ScenicThird");
                SearchTrend();
            } catch (SQLException | JSONException ex) {
                Logger.getLogger(DetailServer.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

    //根据景点ID搜索景点信息
    private void Search(int a, String data) throws SQLException, JSONException {
        try {
            //            获取景点图片
            operatPicture thisview = new operatPicture();
//            String picpath = "D:\\Downloads\\data\\" + _data.getString("SearchID");
            String picpath = "D:\\Downloads\\data\\" + String.valueOf(a);
            thisview.setPictureFileStr(picpath);
            thisview.getPictures();
//            查询景点详细信息
            String sqlstr = "select scenicid,scenicname,sceniclevel,address,time,price,intro,st_astext(position) from scenicinfo where scenicid = ? ";
            PreparedStatement st = _connection.prepareStatement(sqlstr);
            st.setInt(1, a);
            ResultSet rs = st.executeQuery();
            JSONArray result = new JSONArray();
            while (rs.next()) {
                JSONObject f = new JSONObject();
                f.put("name", rs.getString(2));
                f.put("level", rs.getInt(3));
                f.put("address", rs.getString(4));
                f.put("time", rs.getString(5));
                f.put("price", rs.getString(6));
                f.put("intro", rs.getString(7));
                f.put("pic", thisview.pictureArr);
                ScenicPoint = rs.getString(8);
                ScenicName = rs.getString(2);
                result.put(f);
            }
            d.put(data, result);
            setResponse(true, "ok", d);
        } catch (SQLException | JSONException ex) {
            setResponse(false, ex.getMessage(), null);
        }

    }

    //获取附近景点的ID号
    private void SearchNear() throws SQLException, JSONException {
        try {
            ScenicPoint.chars();
            String sqlstr = "select scenicid from scenicinfo where ST_dwithin(position::geography, ST_GeomFromText('"
                    + ScenicPoint
                    + "', 4326)::geography, 100000000)"
                    + "order By ST_distance(position::geography, ST_GeomFromText('"
                    + ScenicPoint
                    + "', 4326)::geography) ASC limit 4";
            PreparedStatement st = _connection.prepareStatement(sqlstr);
            ResultSet rs = st.executeQuery();
            JSONArray result = new JSONArray();
            int i = 0;
            while (rs.next()) {
                JSONObject f = new JSONObject();
                i = i + 1;
                f.put(String.valueOf(i), rs.getInt("scenicid"));
                result.put(f);
            }
            JSONObject job = result.getJSONObject(1);
            ScenicFirstID = job.getInt("2");
            JSONObject job2 = result.getJSONObject(2);
            ScenicSecondID = job2.getInt("3");
            JSONObject job3 = result.getJSONObject(3);
            ScenicThirdID = job3.getInt("4");
        } catch (SQLException | JSONException ex) {
            setResponse(false, ex.getMessage(), null);
        }
    }

//    获取动态
    private void SearchTrend() throws SQLException, JSONException {
        int[] idarray = new int[7];
        try {
            String sqlstr = "select userid,content from trend where viewname = ? limit 7;";
            PreparedStatement st = _connection.prepareStatement(sqlstr);
            st.setString(1,ScenicName);
            ResultSet trs = st.executeQuery();
            JSONArray result = new JSONArray();
            int i = 0;
            while (trs.next()) {                
                JSONObject f = new JSONObject();
                idarray[i] = trs.getInt(1);
                String key = String.valueOf(i);
                f.put(key,trs.getString(2));
                i = i + 1;
                result.put(f);
            }
            d.put("TrendContent", result);

            JSONArray result2 = new JSONArray();
            for (int j = 0; j < 7; j++) {
                String sqlstr2 = "select profilename from userinfo where userid = " + idarray[j] + ";";
                PreparedStatement st2 = _connection.prepareStatement(sqlstr2);
                ResultSet rs2 = st2.executeQuery();
                while (rs2.next()) {
                    JSONObject b = new JSONObject();
                    b.put(String.valueOf(j), rs2.getString(1));
                    result2.put(b);
                }
            }
            d.put("Trenduser", result2);
            setResponse(true, "ok", d);
        } catch (SQLException | JSONException ex) {
            setResponse(false, ex.getMessage(), null);
        }
    }
}
