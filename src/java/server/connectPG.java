/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author lenovo
 */
public abstract class connectPG {
    protected Connection _connection = null;
    protected JSONObject _request = null;
    protected JSONObject _response = null;
    protected JSONObject _data = null;
    protected String _type = null;

    public connectPG() throws JSONException {
        _response = new JSONObject();
        setResponse(false, "未执行Server类的成员函数。", null);
    }

    public void setResponse(boolean success, String message, JSONObject data) throws JSONException {
        _response.put("success", success);
        _response.put("message", message);
        _response.put("data", data);
    }

    public JSONObject getResponse() {
        return _response;
    }

    public void setRequest(JSONObject request) throws JSONException {
        _request = request;
        String[] strArr = _request.getString("type").split("_");
        _type = strArr[1];
        _data = _request.getJSONObject("data");
    }

    public abstract void run();

    public void connectDB() throws ClassNotFoundException {
        Class.forName("org.postgresql.Driver");
        String url = "jdbc:postgresql://127.0.0.1/gissecdev";
        Properties props = new Properties();
        props.setProperty("user", "postgres");
        props.setProperty("password", "123456");

        try {
            _connection = DriverManager.getConnection(url, props);
        } catch (SQLException ex) {
            Logger.getLogger(connectPG.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void closeDB() throws SQLException {
        if(_connection != null){
            _connection.close();
        }
    }
}
