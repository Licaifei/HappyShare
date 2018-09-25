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
            if (_type.equals("LOGIN")) {
                login();
            } else if (_type.equals("REGISTER")) {
                register();
            }
        } catch (JSONException | SQLException ex) {
            Logger.getLogger(UserServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private void login() throws JSONException, SQLException {
        String sqlstr = "   select"
                + "             username "
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
            JSONObject f = new JSONObject();
            f.put("username", user);
            setResponse(true, "登陆成功", f);
        } else {
            setResponse(false, "非法的用户名或密码！", null);
        }
    }

    private void register() throws JSONException, SQLException {
        String sqlstr = "insert into"
                + "  userinfo(username, password, email, profilename, phone, sex, useraddress, userintro)"
                + "  values(?, ?, ?, ?, ?, ?, ?, ?)";
        PreparedStatement st = _connection.prepareStatement(sqlstr);
        st.setString(1, _data.getString("username"));
        st.setString(2, _data.getString("password"));
        st.setString(3, _data.getString("email"));
        st.setString(4, _data.getString("profilename"));
        st.setString(5, _data.getString("phone"));
        st.setBoolean(6, _data.getBoolean("sex"));
        st.setString(7, _data.getString("useraddress"));
        st.setString(8, _data.getString("userinfo"));
        st.execute();
        
        String user = _data.getString("username");
        JSONObject f = new JSONObject();
        f.put("username", user);
        setResponse(true, "注册成功！", f);
    }
}
