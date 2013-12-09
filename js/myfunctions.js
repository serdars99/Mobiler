var apiurl = "http://www.bahisor.com/mobile/";
var redirectpage;
$(document).on("pageload", function (event) {
    //    console.log(event.target.id);
    if (event.target.id != 'loginDialog') {
        redirectpage = event.target.id;
        if (window.localStorage.getItem("btoken") == null)
            $.mobile.changePage("#loginDialog");
        else
            getjsonpcall("ValidateToken", { token: window.localStorage.getItem("btoken") }, ValidateCB);
    }
});
$(document).on("pagebeforecreate ", function (event) {
    if (event.target.id != 'page-pets' && event.target.id != 'loginDialog') {
        $(event.target).prepend($('#baseheader').html());
        $(event.target).append($('#basefooter').html());
    }
    //console.log('pagebeforecreate ', event.target.id);
});
function ValidateCB(data) {
    console.log(data);
    if (data == null)
        $.mobile.changePage("#loginDialog");
}
function TryLogin() {
    if ($('#loginnick').val() == '' || $('#loginpass').val() == '') {
        alert("Alanları doldurun");
        return;
    }
    //var guid = window.localStorage.getItem("mykey");
    //    if (guid == null)
    getjsonpcall("Login", { nick: $('#loginnick').val(), pass: $('#loginpass').val() }, TryLoginCB);
}
function TryLoginCB(data) {
    console.log(data);
    if (data != null) {
        window.localStorage.setItem("btoken", data.MobileGuid);
        $.mobile.changePage("#" + redirectpage);
    }
}
function getjsonpcall(apimethod, data, fncallback) {
    //, rnd: Math.floor((Math.random() * 1000))
    $.ajax({
        type: 'GET',
        url: apiurl + apimethod,
        data: data,
        dataType: 'jsonp',
        jsonp: false,
        jsonpCallback: "fn",
        success: function (data) {
            fncallback(data);
        }
    });
}
