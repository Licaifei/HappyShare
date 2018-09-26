var __id = 0;

function uuid() {
    __id++;

    return "_id_" + __id;
}

/**
 * 注销用户
 * @returns void
 */
function destroyuser()
{
    sessionStorage.clear();
    new NoticeJs({
        text: '已退出登录！',
        type: 'warning',
        position: 'topCenter',
        animation: {
            open: 'animated bounceInRight',
            close: 'animated bounceOutLeft'
        }
    }).show();
    $('.headright').empty();
    $('.headright').append($('<a href="" class="trigger"> 登录</a> / <a href="register.html">注册 </a>'));
}

/**
 * 登录用户
 * @returns void
 */
function loginuser()
{
    var name = $("#user_name").val();
    var pass = $("#password").val();
    Connector({
        url: 'TotalServer',
        params: {
            'type': 'USER_LOGIN',
            'data': {
                'username': name,
                'password': pass
            }
        },
        success: function (json) {
            new NoticeJs({
                text: '登陆成功',
                position: 'topRight',
                animation: {
                    open: 'animated bounceInRight',
                    close: 'animated bounceOutLeft'
                }
            }).show();
            sessionStorage['name'] = name;
            window.location.href = "personal.html";
        },
        failure(json) {
            new NoticeJs({
                text: '登录失败，请检查用户名或者密码后重试！',
                position: 'middleCenter',
                type: 'error',
                animation: {
                    open: 'animated bounceIn',
                    close: 'animated bounceOut'
                }
            }).show();
        }
    });
}
