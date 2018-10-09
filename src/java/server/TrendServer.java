/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author lenovo
 */
public class TrendServer extends connectPG {
    public TrendServer() throws JSONException{
        super();
    }
    
    @Override
    public void run(){
        if(_type.equals("GETINFO")){
            gettrend();
        } 
        else if(_type.equals("SETINFO")){
            settrend();
        }
    }
    
    private void gettrend()
    {
        try {
            String sql = "select trendid, content, images, viewname, pick, publictime from trend where userid = ? limit 10;";
            PreparedStatement st = _connection.prepareStatement(sql);
            st.setInt(1, _data.getInt("userid"));
            
            ResultSet rs = st.executeQuery();
            ArrayList pointList = new ArrayList();
            while (rs.next()) {
                JSONObject pointInfo = new JSONObject();
                pointInfo.append("trendid", rs.getString("trendid"));
                pointInfo.append("content", rs.getString("content"));
                pointInfo.append("viewname", rs.getString("viewname"));
                pointInfo.append("pick", rs.getInt("pick"));
                pointInfo.append("publictime", rs.getString("publictime"));
                
                operatPicture op = new operatPicture();
                op.setPictureFileStr(rs.getString("images"));
                
                List<String> imgs = op.getTrendPictures(rs.getString("trendid"));
                pointInfo.append("images", imgs);
                
                pointList.add(pointInfo);
            }
            JSONObject data = new JSONObject();
            data.append("TrendList", pointList);
            setResponse(true, "获取成功！", data);
        } catch (SQLException | JSONException ex) 
        {
            Logger.getLogger(getPoint.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    private void settrend()
    {
        try {
            String sqlstr = "insert into"
                    + "  trend(trendid, userid, content, viewname, tposition)"
                    + "  values(nextval('public.trend_trendid_seq'),?, ?, ?, ST_GeomFromText(?,4326)) returning trendid;";
            PreparedStatement st = _connection.prepareStatement(sqlstr);
            st.setInt(1, _data.getInt("userid"));
            st.setString(2, _data.getString("content"));
            st.setString(3, _data.getString("viewname"));
            st.setString(4, _data.getString("postion"));

            // st.execute();
            ResultSet rs = st.executeQuery();
            int id = 0;
            if (rs.next() != false) {
                id = rs.getInt("trendid");
            }
            String altersql = "update public.trend set images='/web/image/userDynamic/?' where trendid=?;";
            PreparedStatement ast = _connection.prepareStatement(altersql);
            ast.setInt(1, id);
            ast.setInt(2, id);
            ast.execute();
            JSONObject f = new JSONObject();
            f.put("trendid", id);
            setResponse(true, "发布成功！", f);
        } catch (SQLException | JSONException e) {
             Logger.getLogger(getPoint.class.getName()).log(Level.SEVERE, null, e);
        }
    }
}

