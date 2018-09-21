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
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author lenovo
 */
public class getPoint extends connectPG {
    public getPoint() throws JSONException{
        super();
    }
    
    @Override
    public void run(){
        if(_type.equals("Index")){
            get5APoint();
        }
    }
    
    public void get5APoint(){
        try {
            String sql = "select scenicid, scenicname, ST_AsText(position) as point from scenicinfo where sceniclevel = 5;";
            PreparedStatement st = _connection.prepareStatement(sql);
            ResultSet rs = st.executeQuery();
            ArrayList pointList = new ArrayList();
            while (rs.next()) {
                JSONObject pointInfo = new JSONObject();
                pointInfo.append("index", rs.getString("scenicid"));
                pointInfo.append("scenicname", rs.getString("scenicname"));
                pointInfo.append("geometry", rs.getString("point"));
                pointList.add(pointInfo);
            }
            JSONObject data = new JSONObject();
            data.append("geoList", pointList);
            setResponse(true, "获取首页所需要的5A景区的信息", data);
        } catch (SQLException ex) {
            Logger.getLogger(getPoint.class.getName()).log(Level.SEVERE, null, ex);
        } catch (JSONException ex) {
            Logger.getLogger(getPoint.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
