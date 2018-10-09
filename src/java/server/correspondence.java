/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author lenovo
 */
public class correspondence {
    protected Connection _connection = null;
    protected List<JSONObject> _response = null;
    
    correspondence() {
        try {
            Class.forName("org.postgresql.Driver");
            String url = "jdbc:postgresql://127.0.0.1/happyshare";
            Properties props = new Properties();
            props.setProperty("user", "postgres");
            props.setProperty("password", "123456");
            try {
                _connection = DriverManager.getConnection(url, props);
            } catch (SQLException ex) {
                Logger.getLogger(connectPG.class.getName()).log(Level.SEVERE, null, ex);
            }
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    protected void addLinkManResponse(ResultSet rs){
        _response = new ArrayList<JSONObject>();
        try {
            while (rs.next()) {
                JSONObject pointInfo = new JSONObject();
                pointInfo.append("linkManId", rs.getString("touserid"));
                _response.add(pointInfo);
            }
        } catch (SQLException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        } catch (JSONException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    protected void addMessageResponse(ResultSet rs){
        _response = new ArrayList<JSONObject>();
        try {
            while (rs.next()) {
                JSONObject pointInfo = new JSONObject();
                pointInfo.append("fromuserid", rs.getString("fromuserid"));
                pointInfo.append("touserid", rs.getString("touserid"));
                pointInfo.append("messagetime", rs.getString("messagetime"));
                pointInfo.append("message", rs.getString("message"));
                _response.add(pointInfo);
            }
        } catch (SQLException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        } catch (JSONException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public List<JSONObject> getFriendsList(String ID){
        try {
            String sql = "select touserid, min(extract(day from (current_timestamp(0) - messagetime))*24*60*60 + extract(hour from (current_timestamp(0) - messagetime))*60*60 + extract(minute from (current_timestamp(0) - messagetime))*60 + extract(second from (current_timestamp(0) - messagetime))) AS timeInterval\n" +
                    "from usermessage\n" +
                    "where fromuserid = 33\n" +
                    "group by touserid\n" +
                    "order by timeInterval asc\n"+
                    "limit 10;";
            PreparedStatement st = _connection.prepareStatement(sql);
            ResultSet rs = st.executeQuery();
            addLinkManResponse(rs);
        } catch (SQLException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
        return _response;
    }
    
    public List<JSONObject> getFriendMessage(String ID, String friendID){
        try {
            String sql = "select * from usermessage "
                    + "where (fromuserid = ? and touserid = ?) or (fromuserid = ? and touserid = ?) order by messagetime  asc;";
            PreparedStatement st = _connection.prepareStatement(sql);
            st.setInt(1, Integer.parseInt(ID));
            st.setInt(2, Integer.parseInt(friendID));
            st.setInt(3, Integer.parseInt(friendID));
            st.setInt(4, Integer.parseInt(ID));
            ResultSet rs = st.executeQuery();
            addMessageResponse(rs);     
        } catch (SQLException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
        return _response;
    }
    
    public boolean insertOneMessage(String ID, String friendID, String message, String datetime){
        boolean isSuccess = false;
        try {
            String sql = "insert into usermessage(fromuserid, touserid, messagetime, message) values(" + ID + "," + friendID + ", to_timestamp(?, 'YYYY:MM:DD HH24-MI-SS'), ?);";
            PreparedStatement st = _connection.prepareStatement(sql);
            st.setString(1, datetime);
            st.setString(2, message);
            isSuccess = st.execute();
        } catch (SQLException ex) {
            Logger.getLogger(correspondence.class.getName()).log(Level.SEVERE, null, ex);
        }
        return isSuccess;
    }
    
    public static void main(String[] args){       
        correspondence test = new correspondence();
//        test.insertOneMessage("1", "2", "silent", "2018:09:30 09-30-00");
        List<JSONObject> data = test.getFriendMessage("33", "34");
        System.out.println(data.size());
    }
}
