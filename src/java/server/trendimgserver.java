/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.beans.IntrospectionException;
import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.FileItem;
import org.apache.tomcat.util.http.fileupload.FileItemFactory;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.apache.tomcat.util.http.fileupload.RequestContext;
import org.apache.tomcat.util.http.fileupload.disk.DiskFileItemFactory;
import org.apache.tomcat.util.http.fileupload.servlet.ServletFileUpload;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet 获得填写的表单数据
 */
@WebServlet("/trendimgserver")
public class trendimgserver extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, JSONException, FileUploadException, Exception {
        response.setContentType("text/plain;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            /* TODO output your page here. You may use following sample code. */
            String requestStr = request.getParameter("request");
            JSONObject responseobj = new JSONObject();
            if (requestStr == null) {
                responseobj.put("success", false);
                responseobj.put("message", "Please set the request parameters");
                out.print(responseobj.toString());
                return;
            }
            String dir = "./web/image/userDynamic/";
            boolean isMultipart = ServletFileUpload.isMultipartContent(request);
            if (isMultipart) {
                File dirFile = new File(dir);
                if (!dirFile.exists()) {
                    dirFile.mkdirs();
                }
                FileItemFactory factory = new DiskFileItemFactory();
                ServletFileUpload fileUpload = new ServletFileUpload(factory);
                List<FileItem> items = fileUpload.parseRequest((RequestContext) request);
                for (FileItem item : items) {
                    if (item.isFormField()) {
                        // 普通字段
                        String name = item.getFieldName();
                        String value = item.getString("utf-8"); 
                        //System.out.println(name + " " + URLDecoder.decode(item.getString(), "utf-8"));
                    } else {
                        //System.out.println(dir);
                        //System.out.println("item.getName=" + item.getName());
                        String longFileName = item.getName();
                        //System.out.println("longFileName:" + longFileName);
                        char indexChar = '\\';
                        String fileName = item.getName().substring(longFileName.lastIndexOf(indexChar) + 1, longFileName.length());
                        //System.out.println("filePath=" + dir + "\\" + fileName);
                        File saveFile = new File(dirFile, fileName);
                        item.write(saveFile);
                    }
                }
            }
            responseobj.put("success", true);
            responseobj.put("message", "保存成功");
            responseobj.put("images", dir);
            out.print(responseobj.toString());
        } catch (JSONException ex) {
            Logger.getLogger(TotalServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (FileUploadException ex) {
            Logger.getLogger(trendimgserver.class.getName()).log(Level.SEVERE, null, ex);
        } catch (Exception ex) {
            Logger.getLogger(trendimgserver.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            processRequest(request, response);
        } catch (FileUploadException ex) {
            Logger.getLogger(trendimgserver.class.getName()).log(Level.SEVERE, null, ex);
        } catch (Exception ex) {
            Logger.getLogger(trendimgserver.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

    private connectPG DetailServer() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
