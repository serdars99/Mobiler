var siteurl = "http://www.bahisor.com/";
//var siteurl = "http://localhost:26087/";
var apiurl = siteurl + "mobile/";
var defaulttext = 'Yazmak için tıklayın...';
var chatcheckdate = moment(new Date()).subtract('days', 1);
var chatinterval;
var isvalidmember = false;
var currentversion = 1;
$(document).on("ready", function () {
    moment.lang('tr');
    jQuery.ajaxSetup({
        beforeSend: function () {
            $.mobile.loading('show');
        },
        complete: function () {
            $.mobile.loading('hide');
        },
        success: function () { $.mobile.loading('hide'); }
    });
    if (localStorage["bettypes"] == null)
        getajaxdata("GetBetTypes", null, function (data) { var jdata = JSON.parse(data); localStorage["bettypes"] = data; }, false, true, true);
});
function appendoption(elm, value, text, selected) {
    if (selected)
        $(elm).append('<option value="' + value + '" selected="true">' + text + '</option>');
    else
        $(elm).append('<option value="' + value + '">' + text + '</option>');
}
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
    if (localStorage["currentversion"] == null || localStorage["currentversion"] != currentversion) {
        localStorage.clear();
        localStorage["currentversion"] = currentversion;
    }
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
        if (!isvalidmember) {
            getajaxdata("ValidateToken", { token: getmember().MobileGuid }, ValidateCB, false, true, true);
        }
    //$.mobile.changePage("#loginDialog", { transition: "pop", role: "dialog", reverse: false });
    if (chatinterval != null)
        clearInterval(chatinterval);
    if (getmember() != null && isvalidmember) {
        if (event.target.id == 'main') PageChat();
        else if (event.target.id == 'program') PageProgram();
        else if (event.target.id == 'coupon') PageCoupon();
        else if (event.target.id == 'betdetail') PageBetdetails();
        else if (event.target.id == 'profile') PageProfile();
        else if (event.target.id == 'coupons') PageCoupons();
    }
    //$('.ui-navbar ul li').button();
});
$(document).on("pagecreate", function (event) {
    $("body > [data-role='panel']").panel();
    $("body > [data-role='panel'] [data-role='listview']").listview();
    //console.log(event.target.id);
    if (event.target.id != 'main' && event.target.id != 'loginDialog') {
        //        $(event.target).prepend($('#baseheader')[0].outerHTML);
        //        $(event.target).append($('#basefooter')[0].outerHTML);
    }
});
$(document).on("pagebeforecreate ", function (event) {
});
function savelocalitem(objname, objvalue) {
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
        aftervalidate(data);
    }
}
function aftervalidate(data) {
    isvalidmember = true;
    var jdata = JSON.parse(atob(decodeURIComponent(escape(data))));
    setmember(data);
    $('.mydata').html(getmember().NickName + '(' + getmember().Credits + '+' + getmember().DailyLoan + ' P)');
    checklocalitem("program", "GetProgram", null, false, null);
    checklocalitem("mycoupons", "getcoupons", { memberid: getmember().MemberID }, false, null);
    checklocalitem("allcoupons", "getcoupons", null, false, null);
    $.mobile.changePage("#" + localStorage["redirpage"]);
    localStorage.removeItem("redirpage");
}
function TryLogin() {
    if ($('#loginnick').val() == '' || $('#loginpass').val() == '') {
        alert("Alanları doldurun");
        return;
    }
    getajaxdata("Login", { nick: $('#loginnick').val(), pass: $('#loginpass').val() }, TryLoginCB, false, true);
}
function ResetLogin() {
    localStorage.clear();
    alert("login info has been deleted");
}
function TryLoginCB(data) {
    if (data != null) {
        aftervalidate(data);
    }
    else
        alert('Yanlış kullanıcı adı veya şifre');
}

function GetPerm(n1, n2) {
    return GetPermSingle(n1) / (GetPermSingle(n2) * GetPermSingle((n1 - n2)));
}
function GetPermSingle(n1) {
    var res = 1;
    while (n1 > 1) {
        res *= n1;
        n1--;
    }
    return res;
}
function getrandomcombination(itemsize, itemcount) {
    var setcount = GetPerm(itemsize, itemcount);
    var allnumbersets = new Array();
    while (allnumbersets.length < setcount) {
        var numberset = new Array();
        while (numberset.length < itemcount) {
            var number = Math.floor((Math.random() * itemsize));
            if (numberset.indexOf(number) == -1)
                numberset.push(number);
        }
        numberset.sort();
        var isexist = false;
        for (var i = 0; i < allnumbersets.length; i++) {
            if (isarraysequal(allnumbersets[i], numberset)) {
                isexist = true;
                break;
            }
        }
        if (isexist)
            continue;
        else
            allnumbersets.push(numberset);
    }
    return allnumbersets;
}
function isarraysequal(ar1, ar2) {
    var ec = 0;
    for (var i = 0; i < ar1.length; i++)
        if (ar1[i] == ar2[i])
            ec++;
    if (ec == ar1.length)
        return true;
    else
        return false;
}
function GetSystemBets(couponjson) {
    var allsys = { ratio: 0, winning: 0, couponcount: 0, allsystems: new Array() };
    var bankocbs = jQuery.grep(couponjson.bets, function (bet) { return bet.isbanko; });
    var notbankocbs = jQuery.grep(couponjson.bets, function (bet) { return !bet.isbanko; });
    var notbankocount = notbankocbs.length;
    allsys.ratio = 0;
    allsys.winning = 0;
    allsys.couponcount = 0;
    for (var i = 0; i < couponjson.systems.length; i++) {
        var systemsallbets = { systems: new Array(), systemno: couponjson.systems[i], ratio: 0, winning: 0 };
        var combs = getrandomcombination(notbankocount, couponjson.systems[i]);
        for (var j = 0; j < combs.length; j++) {
            var betsholder = { systembets: new Array(), ratio: 1 };
            for (var k = 0; k < bankocbs.length; k++) {
                betsholder.systembets.push({ SystemID: couponjson.systems, Ratio: bankocbs[k].rt });
                betsholder.ratio *= bankocbs[k].rt;
            }
            for (var k = 0; k < combs[j].length; k++) {
                var ibet = notbankocbs[combs[j][k]];
                betsholder.systembets.push({ SystemID: couponjson.systems, Ratio: ibet.rt });
                betsholder.ratio *= ibet.rt;
            }
            betsholder.winning = betsholder.ratio * couponjson.stake;
            systemsallbets.systems.push(betsholder);
            systemsallbets.ratio += betsholder.ratio;
            systemsallbets.winning += betsholder.ratio * couponjson.stake;
        }
        allsys.allsystems.push(systemsallbets);
        allsys.ratio += systemsallbets.ratio;
        allsys.winning += systemsallbets.winning;
        allsys.couponcount += combs.length;
    }
    console.log(allsys);
    return allsys;
}