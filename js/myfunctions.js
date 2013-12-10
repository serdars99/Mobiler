//var apiurl = "http://www.bahisor.com/mobile/";
var apiurl = "http://localhost:26087/mobile/";
function getajaxdata(apimethod, postdata, fncallback) {
    getjsoncall(apimethod, postdata, fncallback);
}
function getjsonpcall(apimethod, postdata, fncallback) {
    if (postdata != null)
        postdata.rnd = Math.floor((Math.random() * 1000));
    else
        postdata = { rnd: Math.floor((Math.random() * 1000)) };
    $.ajax({ type: 'GET', url: apiurl + apimethod, data: postdata, dataType: 'jsonp',
        jsonp: false, jsonpCallback: "fn"
    }).done(function (data) { fncallback(data); }).fail(function (data) { fncallback(null); });
}
function getjsoncall(apimethod, postdata, fncallback) {
    if (postdata != null)
        postdata.rnd = Math.floor((Math.random() * 1000));
    else
        postdata = { rnd: Math.floor((Math.random() * 1000)) };
    $.ajax({ type: 'GET', url: apiurl + apimethod, data: postdata, dataType: 'json' }).done(function (data) { fncallback(data); }).fail(function (data) { fncallback(null); });
}
$(document).on("pageshow", function (event) {
    getajaxdata("Testd", null, null); 
    //console.log(event.target.id);
    if (event.target.id != 'loginDialog') {
        redirectpage = event.target.id;
        window.localStorage.setItem("redirpage", redirectpage);
        if (window.localStorage.getItem("btoken") == null)
            $.mobile.changePage("#loginDialog");
        //$.mobile.changePage("#loginDialog", { transition: "pop", role: "dialog", reverse: false });
        else
            getajaxdata("ValidateToken", { token: window.localStorage.getItem("btoken") }, ValidateCB);
    }
});
$(document).on("pagebeforecreate ", function (event) {
    if (event.target.id != 'main' && event.target.id != 'loginDialog') {
        $(event.target).prepend($('#baseheader').html());
        $(event.target).append($('#basefooter').html());
    }
});
function ValidateCB(data) {
    if (data == null)
        $.mobile.changePage("#loginDialog");
}
function TryLogin() {
    if ($('#loginnick').val() == '' || $('#loginpass').val() == '') {
        alert("Alanları doldurun");
        return;
    }
    getajaxdata("Login", { nick: $('#loginnick').val(), pass: $('#loginpass').val() }, TryLoginCB);
}
function ResetLogin() {
    window.localStorage.removeItem("btoken");
    alert("login info has been deleted");
}
function TryLoginCB(data) {
    if (data != null) {
        window.localStorage.setItem("btoken", data.MobileGuid);
        if (data.Member != undefined)
            window.localStorage.setItem("member", data.Member);
        $.mobile.changePage("#" + window.localStorage.getItem("redirpage"));
        window.localStorage.removeItem("redirpage")
    }
    else
        alert('Yanlış kullanıcı adı veya şifre');
}
