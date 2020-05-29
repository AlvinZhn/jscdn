
var htmlEncode = function (str) {
    return $('<span/>').text(str).html();
}

var htmlDecode = function (str) {
    return $('<span/>').html(str).text();
}

var strEncode = function (str) {
    var s = "";
    if (str.length == 0) return ""
    s = str.replace(/\./g, "&46")
    s = s.replace(/ /g, "&32")
    s = s.replace(/\\/g, "&92")
    s = s.replace(/\//g, "&47")
    s = s.replace(/\'/g, "'")
    s = s.replace(/\"/g, "\"")
    s = s.replace(/\n/g, "<br>")
    return s
}

var strDecode = function (str) {
    var s = "";
    if (str.length == 0) return ""
    s = str.replace(/\&46/g, ".")
    s = s.replace(/\&32/g, " ")
    s = s.replace(/\&92/g, "\\")
    s = s.replace(/\&47/g, "/")
    return s
}

function show_toggle(obj) {
    if (obj != null) {
        var obj = $(obj).parent().next()
    } else {
        var obj = $('.nav-bottom .container .nav-menu')
    }
    if (obj.css('display') == 'none') {
        obj.css('display', 'block');
    } else {
        obj.css('display', 'none');
    }
}

var toggle_active = function() {
    if ($(window).width() < 768) {
        $('.nav-dropdown button').attr("onclick", "show_toggle(this);")
    }

    var current_path = window.location.pathname.split('/')[1]
    if (current_path[0] == '@') {
        current_path = 'profile'
    }

    var navTag = ['chat', 'crawler', 'mashup', 'discuss']
    var mainTag = ['todo', 'weibo', 'blog', 'finance']
    var crawlerTag = ['douban', 'mtime', 'renting', 'job']
    var accountTag = ['message', 'settings', 'admin', 'profile']

    var navIndex = navTag.indexOf(current_path)
    var mainIndex = mainTag.indexOf(current_path)
    var crawlerIndex = crawlerTag.indexOf(current_path)
    var accountIndex = accountTag.indexOf(current_path)
    if (navIndex > -1) {
        $(`.nav-${navTag[navIndex]}`).addClass('active is-active')
        if (navTag[navIndex] == 'crawler') {
            $(`.dropdown-${window.location.pathname.split('/')[2]}`).addClass('active is-active')
        }
    } else if (mainIndex > -1) {
        $(`.nav-catalog`).addClass('active is-active')
        $(`.dropdown-${mainTag[mainIndex]}`).addClass('active is-active')
    } else if (accountIndex > -1) {
        $(`.nav-dropdown-${accountTag[accountIndex]}`).addClass('active is-active')
    }
}

function flash(text) {
    var content = `
        <div class="flash notification is-primary for-user wow fadeIn" data-wow-delay=".5s" style="white-space:nowrap">
            <a href="#" class="notification-body inherits-color" target="_blank">
                ${text}
            </a>
        </div>
        `
    document.querySelector('body').insertAdjacentHTML('beforeEnd', content)
    var width = $(window).width()
    setTimeout(`$('.flash').animate({left:"${width}"},800);`, 3000 )
    setTimeout(`$('.flash').remove();`, 3800 )
}

var apiLogin = function (form, callback) {
    var path = '/api/login'
    ajax('POST', path, form, callback)
}

var apiRegister = function (form, callback) {
    var path = '/api/register'
    ajax('POST', path, form, callback)
}

var apiMessageCounter = function (callback) {
    var path = '/api/message/counter'
    ajax('GET', path, '', callback)
}

var notificationTemplate = function () {
    var alarm = `
        <li>
            <button id="user-notifications-toggle" class="button is-naked">
                <svg id="icon-alarm" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0V0z" fill="none"></path> <path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z"></path>
                </svg>
            </button>
        </li>
    `
    template = {
        'alarm': alarm,
    }
    return template
}

var messageCounterChange = function (counter) {
    var current = parseInt($('.nav-dropdown-message .tag').text())
    if (current == 0 && counter > 0) {
        var notification = notificationTemplate()
        $('.message-notify').prepend(notification.alarm)
        $('.nav-dropdown-message .tag').text(counter)
        $('.nav-dropdown-message .tag').css('display', 'flex')
    } else if (current != 0 && counter > 0) {
        $('.nav-dropdown-message .tag').text(counter)
    } else if (current != 0 && counter == 0) {
        $('#user-notifications-toggle').remove()
        $('.nav-dropdown-message .tag').text(counter)
        $('.nav-dropdown-message .tag').css('display', 'none')
    }

}

var bindEventFootBtn = function () {
    $('.go-top').on('click', function(){
        $("html,body").animate({scrollTop:0}, 500);
    })
    $('.qrcode').hover(function () {
    })
    $(".qrcode").hover(function(){
        $('#bottom-qrcode').css('display', 'block')
    },function(){
        $('#bottom-qrcode').css('display', 'none')
    });
    if (window.location.pathname == '/contact') {
        $('.fixed-btn').css('display', 'none')
    }
}

var bindEventSignIn = function() {
    $(`#id-login`).validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            // handle the invalid form...
        } else {
            // everything looks good!
            e.preventDefault();
            var btn = $('#id-login button')
            var username = $('#id-login-username').val()
            var password = $('#id-login-password').val()
            if (username.length > 0 && password.length > 0) {
                $(btn).addClass('is-loading')
                $(btn).next().remove()
                var form = {
                    username: username,
                    password: password,
                }
                apiLogin(form, function (r) {
                    var message = JSON.parse(r)
                    if (message['error'].length == 0) {
                        location.reload()
                    } else {
                        error_message = `
                        <div class="control">
                            <span class="help is-danger">
                            ${message['error']}
                            </span>
                        </div>
                        `
                        $(btn).parent()[0].insertAdjacentHTML('beforeEnd', error_message)
                        $(btn).removeClass('is-loading')
                    }
                })
            }
        }
    })
}

var bindEventRegister = function() {
    $('#id-register').on('click', function(){
        $('.username').css('display', 'none')
        $('.email').css('display', 'none')
    })
    $('#id-register').validator().on('submit', function (e) {
      if (e.isDefaultPrevented()) {
        // handle the invalid form...
      } else {
        // everything looks good!
        e.preventDefault();
        var username = $('#id-username').val()
        var email = $('#id-email').val()
        var password = $('#id-password').val()
        var passwordConfirm = $('#id-passwordConfirm').val()
        var form = {
            username: username,
            email: email,
            password: password,
        }
        var btn = $('#id-register button')
        $(btn).addClass('is-loading')
        apiRegister(form, function (r) {
            var response = JSON.parse(r)
            $(btn).removeClass('is-loading')
            if (response.error.length > 0) {
                error = '.' + response.error
                $(error).css('display', 'block')
                $(error).prev().addClass('glyphicon-remove')
                $(error).parent().addClass('has-error')
            } else {
                window.location = response.redirect
            }
        })
      }
    })

}

var wow = function (option) {
    if (option == undefined) {
        option = {mobile: false}
    }
    new WOW(option).init();
}

var bindEventMessageCounter = function () {
    apiMessageCounter(function (r) {
        var response = JSON.parse(r)
        var counter = parseInt(response.counter)
        messageCounterChange(counter)
    })
}

var bindEventCloseNotify =  function () {
    window.onbeforeunload = function(){ 
        return "quit?"; 
    } 
}

$(document).ready(function () {
    wow()
    toggle_active();
    bindEventFootBtn()
    bindEventSignIn();
    bindEventRegister();
    if ($('.nav-right img').prop('alt') != undefined) {
        bindEventMessageCounter();
    }
})
