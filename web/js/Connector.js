/**
 * 包装jquery的ajax请求，
 * @param {type} opts 
 * {
 *      url: "",
 *      params: {},
 *      success:function(json){},
 *      failure:function(json){}
 * }
 * @returns {void}
 */
Connector = function(opts){
    $.ajax({
        url:opts.url,
        data:{
            request: JSON.stringify(opts.params)
        },
        method:"POST", 
        success:function(data){
            var json = JSON.parse(data);
            if(json.success && opts.success && typeof opts.success === "function"){
                opts.success(json);
            }else if(!json.success && opts.failure && typeof opts.failure === "function"){
                opts.failure(json);
            }else{
//                alert(json.message);
            }
        },
        error:function(data){
            alert("网络错误，请检查您的网络连接!");
        }
    });
};

