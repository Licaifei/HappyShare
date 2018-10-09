/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 *
 * @author lenovo
 */
public class operatPicture {
    protected List<String> pictureArr = null;   //保存图片的List
    protected String pictureFileStr = null;     //图片的存储路径
    
    public operatPicture(){
       pictureArr = new ArrayList<String>();
    }
    
    public void setPictureFileStr(String path){
        pictureFileStr = path;
    }
    
    //设置图片存储路径
    protected void setPicturePath(String path){
        String classUrl = this.getClass().getResource("").toString();
        int indexStr = classUrl.lastIndexOf("build");
        pictureFileStr = classUrl.substring(6, indexStr) + path;
    }
    
    //返回一个文件夹下的所有图片
    protected List<String> getPictures(){
        File file = new File(pictureFileStr);//文件夹路径
        //File file = new File("home/fei/NetBeansProjects/HappyShare/web/image/userDynamic/1/");
        File[] files = file.listFiles();//遍历该文件夹
        List<String> picturesPath = new ArrayList<>();
        if(null!=files)
        {
            for (File file1 : files) {
                String path = file1.getPath();//获取图片路径
                picturesPath.add(path);
            }
        }
        if(picturesPath.isEmpty() == true)
            return null;
        else{
            for (int i = 0; i < picturesPath.size(); i++){
                try {
                    InputStream in = null;
                    byte[] data = null;
                    in = new FileInputStream(picturesPath.get(i));
                    data = new byte[in.available()];
                    in.read(data);
                    in.close();
                    //对字节数组Base64编码  
                    BASE64Encoder encoder = new BASE64Encoder();  
                    pictureArr.add(encoder.encode(data));//返回Base64编码过的字节数组字符串 
                } catch (FileNotFoundException ex) {
                    Logger.getLogger(operatPicture.class.getName()).log(Level.SEVERE, null, ex);
                } catch (IOException ex) {
                    Logger.getLogger(operatPicture.class.getName()).log(Level.SEVERE, null, ex);
                }                
            }
        }
        return pictureArr;
    }
    
    //根据base64编码的字符串在本地存储图片
    protected void generateImg(String path, String base64){
        BASE64Decoder decoder;
        decoder = new BASE64Decoder();
        try {
            if (base64 != null) {
                byte[] b = decoder.decodeBuffer(base64);
                try (OutputStream out = new FileOutputStream(path)) {
                    out.write(b);
                    out.flush();
                }
            } else {
                System.out.println("Base64编码不能为null");
            }
        } catch (IOException e) {
        }
    }
    
    //通过景点的编号获取景点的图片，返回的是base64编码的字符串List
    public List<String> getScenicPictures(String index){
        if(pictureArr.isEmpty() == false)
            pictureArr = new ArrayList<>();
        if(pictureFileStr != null)
            pictureFileStr = null;
        setPicturePath("web/image/data/" + index);
        return getPictures();
    }
    
    public List<String> getTrendPictures(String index){
        if(pictureArr.isEmpty() == false)
            pictureArr = new ArrayList<>();
        if(pictureFileStr != null)
            pictureFileStr = null;
        setPicturePath("web/image/userDynamic/" + index + "/");
        return getPictures();
    }
    
    //通过用户ID和动态编号获取该动态的所有图片
    public List<String> getUserDynamicPictures(String userID, String dynamicID){
        if(pictureArr.isEmpty() == false)
            pictureArr = new ArrayList<String>();
        if(pictureFileStr != null)
            pictureFileStr = null;
        setPicturePath("web/image/userDynamic/" + userID + "/" + dynamicID);
        return getPictures();
    }
    
    //存储用户动态的图片
    public void storageUserDymanicPictures(String userID, String dynamicID, List<String> pictures){
        if(pictureFileStr != null)
            pictureFileStr = null;
        setPicturePath("web/image/userDynamic/" + userID + "/" + dynamicID);
        File dir  = new File(pictureFileStr);
        if(dir.mkdirs()){
            for(int i = 0; i < pictures.size(); i++){
                this.generateImg(this.pictureFileStr+"/"+i+".jpg", pictures.get(i));
            }
        }
    }
    
    public static void main(String[] args){       
        operatPicture getPic = new operatPicture();
//        List<String> pictures = getPic.getScenicPictures("4");
//        getPic.storageUserDymanicPictures("1", "2", pictures);
//        List<String> pictures = getPic.getUserDynamicPictures("1", "2");
//        System.out.println(pictures.size());
        getPic.getTrendPictures("1");
    }
}
