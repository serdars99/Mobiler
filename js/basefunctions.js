//var siteurl = "http://www.bahisor.com/";
var siteurl = "http://localhost:26087/";
var apiurl = siteurl + "mobile/";
var defaulttext = 'Yazmak için tıklayın...';
var chatcheckdate = moment(new Date()).subtract('days', 1);
var chatinterval;
var isvalidmember = false;
$(document).on("ready", function () {
    moment.lang('tr');
});
function fixlink(str) {
    return str.replace(/href="\//ig, "href=\"" + siteurl);
}
function getajaxdata(apimethod, postdata, fncallback, sendtokeninfo, addrnd, issynchron) {
    getjsoncall(apimethod, postdata, fncallback, sendtokeninfo, addrnd, issynchron);
}
function getjsoncall(req, postdata, fncallback, sendtokeninfo, addrnd, issynchron) {
    if (addrnd)
        if (postdata != null)
            postdata.rnd = Math.floor((Math.random() * 1000));
        else
            postdata = { rnd: Math.floor((Math.random() * 1000)) };
    var asyncron = true;
    if (issynchron == true)
        asyncron = false;
    var token = null;
    if (sendtokeninfo)
        token = { "token": getmember().MobileGuid };
    $.ajax({ type: 'GET', async: asyncron, headers: token, url: apiurl + req, data: postdata, dataType: 'json' }).done(function (data) { if (fncallback != null) fncallback(data); }).fail(function (data) { fncallback(null); });   //btoa()
}
function getmember() {
    var m1 = localStorage["member"];
    if (m1 == null)
        return null;
    else
        return JSON.parse(atob(decodeURIComponent(escape(m1))));
}
function setmember(data) {
    localStorage["member"] = data;
}
$(document).on("pageshow", function (event) {
    if (event.target.id == 'loginDialog') {
        $('#loginpass').off('keydown').on('keydown', function (e) {
            if (e.which == 13) { TryLogin(); }
        });
        return;
    }
    localStorage["redirpage"] = event.target.id;
    if (getmember() == null) {
        $.mobile.changePage("#loginDialog");
    }
    else if (getmember() != null)
        if (!isvalidmember)
            getajaxdata("ValidateToken", { token: getmember().MobileGuid }, ValidateCB, false, true, true);
    //$.mobile.changePage("#loginDialog", { transition: "pop", role: "dialog", reverse: false });
    if (chatinterval != null)
        clearInterval(chatinterval);
    if (getmember() != null && isvalidmember) {
        if (event.target.id == 'main') PageChat();
        else if (event.target.id == 'program') PageProgram();
    }
});
$(document).on("pagecreate", function (event) {
    $("body > [data-role='panel']").panel();
    $("body > [data-role='panel'] [data-role='listview']").listview();
    //console.log(event.target.id);
    if (event.target.id != 'main' && event.target.id != 'loginDialog') {
        $(event.target).prepend($('#baseheader')[0].outerHTML);
        //        $(event.target).append($('#basefooter')[0].outerHTML);
    }
});
//$(document).one("pageshow", function () {
//    $("body > [data-role='header']").toolbar();
//    $("body > [data-role='header'] [data-role='navbar']").navbar();
//});
$(document).on("pagebeforecreate ", function (event) {
});
function savelocalitem(objname, objvalue, lastdate) {
    var jsonData = {
        "lastdate": moment(new Date()),
        "obj": objvalue
    };
    localStorage[objname] = JSON.stringify(jsonData);
}
function loadlocalitem(objname) {
    if (localStorage[objname] == null)
        return null;
    return JSON.parse(localStorage[objname]);
}
function ValidateCB(data) {
    if (data == null)
        $.mobile.changePage("#loginDialog");
    else {
        isvalidmember = true;
        var jdata = JSON.parse(atob(decodeURIComponent(escape(data))));
        $('#mydata').html(getmember().NickName + '(' + getmember().Credits + ' Puan)');
        $.mobile.changePage("#" + localStorage["redirpage"]);
    }
}
function TryLogin() {
    if ($('#loginnick').val() == '' || $('#loginpass').val() == '') {
        alert("Alanları doldurun");
        return;
    }
    getajaxdata("Login", { nick: $('#loginnick').val(), pass: $('#loginpass').val() }, TryLoginCB, false, true);
}
function ResetLogin() {
    localStorage.removeItem("member");
    alert("login info has been deleted");
}
function TryLoginCB(data) {
    if (data != null) {
        var jdata = JSON.parse(atob(decodeURIComponent(escape(data))));
        //console.log(jdata);
        isvalidmember = true;
        setmember(data);
        $.mobile.changePage("#" + localStorage["redirpage"]);
        localStorage.removeItem("redirpage");
    }
    else
        alert('Yanlış kullanıcı adı veya şifre');
}
