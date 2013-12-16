//var siteurl = "http://www.bahisor.com/";
var siteurl = "http://localhost:26087/";
var apiurl = siteurl + "mobile/";
var defaulttext = 'Yazmak için tıklayın...';

var chatcheckdate = moment(new Date()).subtract('days', 1);
$(document).on("ready ", function () {
    moment.lang('tr');
});
function fixlink(str) {
    return str.replace(/href="\//ig, "href=\"" + siteurl);
}
function getajaxdata(apimethod, postdata, fncallback, sendtokeninfo, isnotapirequest) {
    getjsoncall(apimethod, postdata, fncallback, sendtokeninfo, isnotapirequest);
}
function getjsonpcall(apimethod, postdata, fncallback) {
    if (postdata != null)
        postdata.rnd = Math.floor((Math.random() * 1000));
    else
        postdata = { rnd: Math.floor((Math.random() * 1000)) };
    $.ajax({ type: 'GET', url: apiurl + apimethod, data: postdata, dataType: 'jsonp',
        jsonp: false, jsonpCallback: "fn"
    }).done(function (data) { if (fncallback != null) fncallback(data); }).fail(function (data) { fncallback(null); });
}
function getjsoncall(req, postdata, fncallback, sendtokeninfo, isnotapirequest) {
    if (!(isnotapirequest))
        if (postdata != null)
            postdata.rnd = Math.floor((Math.random() * 1000));
        else
            postdata = { rnd: Math.floor((Math.random() * 1000)) };
    var token = null;
    if (sendtokeninfo)
        token = { "token": getmember().MobileGuid };
    var requrl = isnotapirequest ? "http://www.bahisor.com/xml/program-4a7e3488-d.xml" : apiurl + req;

    $.ajax({ type: 'GET', headers: token, url: requrl, data: postdata, dataType: isnotapirequest == true ? 'xml' : 'json' }).done(function (data) { if (fncallback != null) fncallback(data); }).fail(function (data) { fncallback(null); });   //btoa()
}
function getmember() {
    var m1 = window.localStorage.getItem("member");
    if (m1 == null)
        return null;
    else
        return JSON.parse(atob(decodeURIComponent(escape(m1))));
}
function setmember(data) {
    window.localStorage.setItem("member", data);
}
$(document).on("pageshow", function (event) {
    //getajaxdata("Testd", null, null);
    //console.log(event.target.id);
    if (event.target.id != 'loginDialog') {
        redirectpage = event.target.id;
        window.localStorage.setItem("redirpage", redirectpage);
        if (getmember() == null)
            $.mobile.changePage("#loginDialog");
        //$.mobile.changePage("#loginDialog", { transition: "pop", role: "dialog", reverse: false });
        else {
            getajaxdata("ValidateToken", { token: getmember().MobileGuid }, ValidateCB);
        }
    }
    if (getmember() != null) {
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
function ValidateCB(data) {
    //console.log(jdata);
    if (data == null)
        $.mobile.changePage("#loginDialog");
    else {
        var jdata = JSON.parse(atob(decodeURIComponent(escape(data))));
        $('#mydata').html(getmember().NickName + '(' + getmember().Credits + ' Puan)');
    }
}
function TryLogin() {
    if ($('#loginnick').val() == '' || $('#loginpass').val() == '') {
        alert("Alanları doldurun");
        return;
    }
    getajaxdata("Login", { nick: $('#loginnick').val(), pass: $('#loginpass').val() }, TryLoginCB);
}
function ResetLogin() {
    window.localStorage.removeItem("member");
    alert("login info has been deleted");
}
function TryLoginCB(data) {
    if (data != null) {
        var jdata = JSON.parse(atob(decodeURIComponent(escape(data))));
        //console.log(jdata);
        setmember(data);
        $.mobile.changePage("#" + window.localStorage.getItem("redirpage"));
        window.localStorage.removeItem("redirpage");
    }
    else
        alert('Yanlış kullanıcı adı veya şifre');
}
