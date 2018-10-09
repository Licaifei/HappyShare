/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author fei
 */
public class UserServer extends connectPG {

    public UserServer() throws JSONException {
        super();

    }

    @Override
    public void run() {
        try {
            switch (_type) {
                case "LOGIN":
                    login();
                    break;
                case "REGISTER":
                    register();
                    break;
                case "GETINFO":
                    getinfo();
                    break;
                case "UPDATEINFO":
                    updateinfo();
                    break;
                default:
                    break;
            }
        } catch (JSONException | SQLException ex) {
            Logger.getLogger(UserServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private void login() throws JSONException, SQLException {
        String sqlstr = "   select"
                + "             userid, username "
                + "         from "
                + "             userinfo "
                + "         where "
                + "             username = ? "
                + "             and "
                + "             password = ?"
                + "         limit 1 ";
        PreparedStatement st = _connection.prepareStatement(sqlstr);
        st.setString(1, _data.getString("username"));
        st.setString(2, _data.getString("password"));
        ResultSet rs = st.executeQuery();
        if (rs.next() != false) {
            String user = rs.getString(1);
            int userid = rs.getInt("userid");
            JSONObject f = new JSONObject();
            f.put("username", user);
            f.put("userid", userid);
            setResponse(true, "登陆成功", f);
        } else {
            setResponse(false, "非法的用户名或密码！", null);
        }
    }

    private void register() throws JSONException, SQLException {
        String sqlstr = "insert into"
                + "  userinfo(userid, username, password, email, profilename, phone, sex, useraddress, userintro)"
                + "  values(nextval('public.userinfo_userid_seq'),?, ?, ?, ?, ?, ?, ?, ?) returning userid;";
        PreparedStatement st = _connection.prepareStatement(sqlstr);
        st.setString(1, _data.getString("username"));
        st.setString(2, _data.getString("password"));
        st.setString(3, _data.getString("email"));
        st.setString(4, _data.getString("profilename"));
        st.setString(5, _data.getString("phone"));
        st.setBoolean(6, _data.getBoolean("sex"));
        st.setString(7, _data.getString("address"));
        st.setString(8, _data.getString("intro"));
        // st.execute();
        ResultSet rs = st.executeQuery();
        int id = 0;
        if (rs.next() != false) {
            id = rs.getInt("userid");
        }
        String user = _data.getString("username");
        JSONObject f = new JSONObject();
        f.put("username", user);
        f.put("userid", id);
        setResponse(true, "注册成功！", f);
    }
    
    private void getinfo() throws SQLException, JSONException {
        String sqlstr = "   select"
                + "             * "
                + "         from "
                + "             userinfo "
                + "         where "
                + "             userid = ?";
        PreparedStatement st = _connection.prepareStatement(sqlstr);
        int sid = _data.getInt("userid");
        st.setInt(1, sid);
        
        ResultSet rs = st.executeQuery();
        if (rs.next() != false) {
            JSONObject f = new JSONObject();
            
            f.put("username", rs.getString("username"));
            f.put("password", rs.getString("password"));
            f.put("email", rs.getString("email"));
            f.put("phone", rs.getString("phone"));
            f.put("sex", rs.getBoolean("sex"));
            f.put("useraddress", rs.getString("useraddress"));
            f.put("userinfo", rs.getString("userintro"));
            
            setResponse(true, "查询成功！", f);
        } else {
            setResponse(false, "用户信息错误！", null);
        }
    }
    
    private void updateinfo() throws JSONException, SQLException {
        String sqlstr = "  update userinfo"
                      + "  set username=?,password=?, email=?, phone=?, sex=?, useraddress=?, userintro=?)"
                      + "  where userid = ?";

        PreparedStatement st = _connection.prepareStatement(sqlstr);
        st.setString(1, _data.getString("username"));
        st.setString(2, _data.getString("password"));
        st.setString(3, _data.getString("email"));
        st.setString(4, _data.getString("phone"));
        st.setBoolean(5, _data.getBoolean("sex"));
        st.setString(6, _data.getString("address"));
        st.setString(7, _data.getString("intro"));
        st.setString(8, _data.getString("userid"));
        st.execute();
        
        setResponse(true, "修改成功！", null);
    }
}
