//var apiurl = "http://www.bahisor.com/mobile/";
var apiurl = "http://localhost:26087/mobile/";
var siteurl = "http://www.bahisor.com/";
var chatcheckdate = moment(new Date()).subtract('days', 1);
$(document).on("ready ", function () {
    moment.lang('tr');
});
function fixlink(str) {
    return str.replace(/href="\//ig, "href=\"" + siteurl);
}
function getajaxdata(apimethod, postdata, fncallback, sendtokeninfo) {
    getjsoncall(apimethod, postdata, fncallback, sendtokeninfo);
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
function getjsoncall(apimethod, postdata, fncallback, sendtokeninfo) {
    if (postdata != null)
        postdata.rnd = Math.floor((Math.random() * 1000));
    else
        postdata = { rnd: Math.floor((Math.random() * 1000)) };
    var token = null;
    if (sendtokeninfo)
        token = { "token": getmember().MobileGuid };
    $.ajax({ type: 'GET', headers: token, url: apiurl + apimethod, data: postdata, dataType: 'json' }).done(function (data) { if (fncallback != null) fncallback(data); }).fail(function (data) { fncallback(null); });   //btoa()
}
function getmember() {
    var m1 = window.localStorage.getItem("member");
    if (m1 == null)
        return null;
    else
        return JSON.parse(atob(m1));
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
    if (event.target.id == 'main' && getmember() != null) PageChat();
});
$(document).on("pagecreate", function (event) {
    ""
    $("body > [data-role='panel']").panel();
    $("body > [data-role='panel'] [data-role='listview']").listview();
    //console.log(event.target.id);
    if (event.target.id != 'main' && event.target.id != 'loginDialog') {
        $(event.target).prepend($('#baseheader')[0].outerHTML);
        $(event.target).append($('#basefooter').html());
    }
});
//$(document).one("pageshow", function () {
//    $("body > [data-role='header']").toolbar();
//    $("body > [data-role='header'] [data-role='navbar']").navbar();
//});
$(document).on("pagebeforecreate ", function (event) {
});
function ValidateCB(data) {
    var jdata = JSON.parse(atob(data));
    //console.log(jdata);
    if (data == null)
        $.mobile.changePage("#loginDialog");
}
function DeleteComment() {
    getajaxdata("DeleteComment", { commentID: 1 }, function (data) { console.log(data) }, true);
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
        var jdata = JSON.parse(atob(data));
        //console.log(jdata);
        setmember(data);
        $.mobile.changePage("#" + window.localStorage.getItem("redirpage"));
        window.localStorage.removeItem("redirpage")
    }
    else
        alert('Yanlış kullanıcı adı veya şifre');
}
var defaulttext = 'Yazmak için tıklayın...';
function PageChat() {
    $('#usertxt').html(defaulttext);
    $('#usertxt').on("click", function () { if ($(this).html() == defaulttext) $(this).html(''); })
    $('#usertxt').on("blur", function () { if ($(this).html() == '') $(this).html(defaulttext); })
    getajaxdata("RefreshChat", { lastcheckdate: moment(chatcheckdate).format("YYYY-MM-DD HH:mm:ss"), count: 10 }, PageChatCallBack);
}
function PageChatCallBack(data) {
    if (data == undefined)
        return;
    //console.log(JSON.parse(data));
    chatcheckdate = new Date(data.date.match(/\d+/)[0] * 1);
    $('#lastchat').html('');
    var str = '';
    var deleters = '1,2';
    var iszebra = false;
    $(data.items).each(function () {
        iszebra = !iszebra;
        var li = $('#maincommentsx').html();
        li = li.replace(/#cid/g, this.CommentID);
        li = li.replace(/#comment/g, fixlink(this.CommentText));
        li = li.replace(/#nick/g, this.NickName);
        li = li.replace(/#urlnick/g, this.NickName.replace(/ /g, '-'));
        li = li.replace(/#comment/g, this.CommentText);
        li = li.replace(/#zebra/g, iszebra ? 'zebra' : '');
        li = li.replace(/#time/g, moment(new Date(this.CreateDate.match(/\d+/)[0] * 1)).fromNow());
        if (getmember().MemberID == this.MemberID || deleters.indexOf(getmember().AdminRoleID) > -1)
            li = li.replace(/#delclass/g, 'delyes');
        else
            li = li.replace(/#delclass/g, 'delno');
        str += li;
    });
    $('#lastchat').html(str);
    //var height = count == 10 ? '330' : '730';
    //            $('#chatholder').slimScroll({
    //                height: height + 'px'
    //            });

    $("#lastchat").listview();
    $("#lastchat").listview('refresh');
    attachtouchchatlist();
}
function attachtouchchatlist() {
    $(document).on("swipeleft", "#lastchat li", function (event) {
        if ($(this).attr('class').indexOf('delno') > -1)
            return;
        var listitem = $(this),
            dir = event.type === "swipeleft" ? "left" : "right",
            transition = $.support.cssTransform3d ? dir : false;
        confirmAndDelete(listitem, transition, event.type === "swipeleft" ? 1 : 2);
    });
    $(document).on("swiperight", "#lastchat li", function (event) {
        var listitem = $(this),
            dir = event.type === "swipeleft" ? "left" : "right",
            transition = $.support.cssTransform3d ? dir : false;
        confirmAndDelete(listitem, transition, event.type === "swipeleft" ? 1 : 2);
    });
    //    if (!$.mobile.support.touch) {
    //        $("#lastchat").removeClass("touch");
    //        $(".delete").on("click", function () {
    //            var listitem = $(this).parent("li");
    //            confirmAndDelete(listitem, null, event.type === "swipeleft" ? 1 : 2);
    //        });
    //    }
    function confirmAndDelete(listitem, transition, postfix) {
        listitem.parent().children().children().removeClass("ui-btn-active");
        listitem.children(".ui-btn").addClass("ui-btn-active");
        $("#confirm" + postfix + " .topic").remove();
        if (postfix == 1) {
            listitem.find(".topic").clone().insertAfter("#question" + postfix);
            $("#confirm" + postfix).popup("open");
            $("#confirm" + postfix + " #yes" + postfix).on("click", function () {
                if (transition) {
                    listitem
                    .addClass(transition)
                    .on("webkitTransitionEnd transitionend otransitionend", function () {
                        listitem.remove();
                        $("#lastchat").listview("refresh").find(".border-bottom").removeClass("border-bottom");
                        //$(document).on("swipeleft swiperight", "#lastchat li").off();
                    })
                    .prev("li").children("a").addClass("border-bottom")
                    .end().end().children(".ui-btn").removeClass("ui-btn-active");
                }
                else {
                    listitem.remove();
                    $("#lastchat").listview("refresh");
                }
            });
            $("#confirm" + postfix + " #cancel" + postfix).on("click", function () {
                listitem.children().removeClass("ui-btn-active");
                $("#confirm" + postfix + " #yes" + postfix).off();
            });
        }
        else if (postfix == 2) {
            if ($('#usertxt').val() == defaulttext) $('#usertxt').val('');
            $("#usertxt").val($("#usertxt").val() + ' @' + listitem.children().children('.urlnick').attr('urlnick') + ' ');
            $("#usertxt").focus();
        }
    }
}