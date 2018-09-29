/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package server;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import sun.misc.BASE64Encoder;

/**
 *
 * @author lenovo
 */
public class getPictures {
    protected List<String> pictureArr = null;   //保存图片的List
    protected String pictureFileStr = null;     //图片的存储路径
    
    public getPictures(){
        pictureArr = new ArrayList<String>();
    }
    
    public getPictures(String scenceIndex){
        pictureArr = new ArrayList<String>();
        String classUrl = this.getClass().getResource("").toString();
        int index = classUrl.lastIndexOf("build");
        pictureFileStr = classUrl.substring(6, index) + "web/image/data/" + scenceIndex;
    }
    
    public void setPictureFileStr(String path){
        pictureFileStr = path;
    }
    
    public void setPictureFileIndex(String index){
        String classUrl = this.getClass().getResource("").toString();
        int indexStr = classUrl.lastIndexOf("build");
        pictureFileStr = classUrl.substring(6, indexStr) + "web/image/data/" + index;
    }
    
    public List<String> getPictures(){
        if(pictureFileStr == null)
            return null;
	File file = new File(pictureFileStr);//文件夹路径
        File[] files = file.listFiles();//遍历该文件夹
        List<String> picturesPath = new ArrayList<>();
        if(null!=files)
        {
            for (int i = 0; i < files.length; i++) {
                File file1 = files[i];
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
                    Logger.getLogger(getPictures.class.getName()).log(Level.SEVERE, null, ex);
                } catch (IOException ex) {
                    Logger.getLogger(getPictures.class.getName()).log(Level.SEVERE, null, ex);
                }                
            }
        }
        return pictureArr;
    }
}
