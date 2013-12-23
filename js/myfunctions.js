function PageChat() {
    //    $('#footer li').eq(0).addClass('ui-btn-active');
    $('#usertxt').html(defaulttext);
    $('#usertxt').on("click", function () { if ($(this).html() == defaulttext) $(this).html(''); });
    $('#usertxt').on("blur", function () { if ($(this).html() == '') $(this).html(defaulttext); });
    $('#usertxt').off('keydown').on('keydown', function (e) {
        if (e.which == 13) { senddailycomment(); }
    });
    //    var localitem = loadlocalitem("program");
    //    if (localitem != null)
    //        PageChatCallBack(localitem.obj);
    //    else
    refreshchat();
    chatinterval = setInterval("refreshchat()", 5000);
}
function refreshchat() {
    getajaxdata("RefreshChat", { lastcheckdate: moment(chatcheckdate).format("YYYY-MM-DD HH:mm:ss"), count: 10 }, PageChatCallBack, false, true);
}
function PageChatCallBack(data) {
    if (data == undefined)
        return;
    //console.log(JSON.parse(data));
    chatcheckdate = new Date(data.date.match(/\d+/)[0] * 1);
    savelocalitem("chat", data, chatcheckdate);
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
    $("#lastchat").listview();
    $("#lastchat").listview('refresh');
    attachtouchchatlist();
}
function attachswipebase(listitem, transition, completefunction) {
    listitem.parent().children().children().removeClass("ui-btn-active");
    listitem.children(".ui-btn").addClass("ui-btn-active");
    if (transition) {
        listitem
                    .addClass(transition)
                    .on("webkitTransitionEnd transitionend otransitionend", function () {
                        completefunction(listitem);
                    })
                    .prev("li").children("a").addClass("border-bottom")
                    .end().end().children(".ui-btn").removeClass("ui-btn-active");
    }
}
function attachtouchchatlist() {
    $(document).on("swipeleft", "#lastchat li", function (event) {
        if ($(this).attr('class').indexOf('delno') > -1)
            return;
        var listitem = $(this),
            dir = event.type === "swipeleft" ? "left" : "right",
            transition = $.support.cssTransform3d ? dir : false;
        confirmAndDeleteDailyComment(listitem, transition);
    });
    $(document).on("swiperight", "#lastchat li", function (event) {
        var listitem = $(this),
            dir = event.type === "swipeleft" ? "left" : "right",
            transition = $.support.cssTransform3d ? dir : false;

        //attachswipebase(listitem, transition, function (listitem) {
        if ($('#usertxt').val() == defaulttext) $('#usertxt').val('');
        $("#usertxt").val($("#usertxt").val() + ' @' + listitem.children().children('.urlnick').attr('urlnick') + ' ');
        $("#usertxt").focus();
        //});
    });
    //    if (!$.mobile.support.touch) {
    //        $("#lastchat").removeClass("touch");
    //        $(".delete").on("click", function () {
    //            var listitem = $(this).parent("li");
    //            confirmAndDelete(listitem, null, event.type === "swipeleft" ? 1 : 2);
    //        });
    //    }
    function confirmAndDeleteDailyComment(listitem, transition) {
        //$("#confirm1" + " .topic").remove();
        //listitem.find(".topic").clone().insertAfter("#question1");
        $("#confirm1").popup("open");
        $("#confirm1" + " #yes1").on("click", function () {
            attachswipebase(listitem, transition, function (listitem) {
                listitem.remove();
                $("#lastchat").listview("refresh").find(".border-bottom").removeClass("border-bottom");
                getajaxdata("DeleteComment", { commentID: listitem.attr('cid') }, function (data) {
                    //console.log(data);
                    $("#confirm1").popup("close");
                }, true, false);
            });
        });
        $("#confirm1" + " #cancel1").on("click", function () {
            listitem.children().removeClass("ui-btn-active");
            $("#confirm1" + " #yes1").off();
        });
    }
}
function senddailycomment() {
    getajaxdata("SendDailyComment", { comment: $('#usertxt').val() }, function (data) {
        $('#usertxt').val('');
        getajaxdata("RefreshChat", { lastcheckdate: moment(chatcheckdate).format("YYYY-MM-DD HH:mm:ss"), count: 10 }, PageChatCallBack);
    }, true, false);
}
var prgcheckdate = moment(new Date()).subtract('days', 1);
function PageProgram() {
    var localprg = loadlocalitem("program");
    if (localprg != null)
        prgcheckdate = moment(localprg.lastdate);
    if (localprg != null && moment(new Date()).diff(moment(localprg.lastdate), 'minutes') < 3) {
        loadprogramfilters();
        loadprogram();
    }
    else
        checkprogram(prgcheckdate);
}
function checkprogram(prgcheckdate) {
    getajaxdata("GetProgram", { lastcheckdate: prgcheckdate.format("YYYY-MM-DD HH:mm:ss") }, function (data) {
        prgcheckdate = moment(new Date());
        if (data != undefined) {
            data = JSON.parse(data);
            savelocalitem("program", data, prgcheckdate);
        }
        else
            savelocalitem("program", loadlocalitem("program").obj, prgcheckdate);
        loadprogramfilters();
        loadprogram();
    }, false);
}
function loadprogramfilters() {
    var data = loadlocalitem("program").obj;
    $('#slcdate').html('');
    $(data.dates).each(function () {
        appendoption($('#slcdate'), this, this, false);
    });
    $('#slccomp').html('');
    appendoption($('#slccomp'), "", "Turnuva", false);
    $(data.comps).each(function () {
        appendoption($('#slccomp'), this.cid, this.cn, false);
    });
    $('#slcdate').selectmenu("refresh", true);
    $('#slccomp').selectmenu("refresh", true);
}
//var key = "one";
//delete someObj[key];
function loadprogram() {
    var data = loadlocalitem("program").obj;
    $("#tblprog > tbody").html('');
    var str = '';
    var deleters = '1,2';
    var betspan = "<span tid='#tid' oid='#oid' rt='#rt'></span>";
    $(data.events).each(function () {
        if (this.sid == $('#slcsport').val() && $('#slcdate').val() == moment(this.edate).format("YYYY-MM-DD") && ($('#slccomp').val() == "" || $('#slccomp').val() == this.cid)) {
            var li = $('#trproghelper')[0].outerHTML.replace(/tx/ig, 'tr').replace(/ty/ig, 'td');
            li = li.replace(/#evid/g, this.id);
            li = li.replace(/#evname/g, this.ename);
            li = li.replace(/#time/g, moment(new Date(this.edate)).format("HH:mm"));
            li = li.replace(/#code/g, this.code);
            li = li.replace(/#mbs/g, this.mbs);
            li = li.replace(/#edate/g, this.edate);
            li = li.replace(/#sid/g, this.sid);

            var addoption = '<a href="#" onclick="AddToCoupon(#id,#oid,#rt)" class="bt#oid ui-btn ui-mini" >#rt</a>'.replace(/#id/, this.id);
            var o1 = jQuery.grep(this.bets, function (bet) { return bet.oid == 1; })[0].rt;
            var o0 = jQuery.grep(this.bets, function (bet) { return bet.oid == 2; })[0].rt;
            var o2 = jQuery.grep(this.bets, function (bet) { return bet.oid == 3; })[0].rt;
            li = li.replace(/#o1/g, addoption.replace(/#oid/ig, 1).replace(/#rt/ig, o1));
            li = li.replace(/#o0/g, addoption.replace(/#oid/ig, 2).replace(/#rt/ig, o0));
            li = li.replace(/#o2/g, addoption.replace(/#oid/ig, 3).replace(/#rt/ig, o2));
            var oa = jQuery.grep(this.bets, function (bet) { return bet.oid == 15; });
            var ou = jQuery.grep(this.bets, function (bet) { return bet.oid == 16; });
            if (oa.length > 0)
                li = li.replace(/#oa/g, addoption.replace(/#oid/ig, 15).replace(/#rt/ig, oa[0].rt));
            else
                li = li.replace(/#oa/g, '');
            if (ou.length > 0)
                li = li.replace(/#ou/g, addoption.replace(/#oid/ig, 16).replace(/#rt/ig, ou[0].rt));
            else
                li = li.replace(/#ou/g, '');
            var bets = '';
            for (var i = 0; i < this.bets.length; i++)
                bets += betspan.replace(/#oid/ig, this.bets[i].oid).replace(/#rt/ig, this.bets[i].rt).replace(/#tid/ig, this.bets[i].tid);
            li = li.replace(/#bets/ig, bets);

            str += li;
        }
    });
    $("#tblprog > tbody").append(str);
    $("#tblprog").table("refresh");

    if (localStorage["coupon"] != null) {
        var json = JSON.parse(localStorage["coupon"]);
        for (var i = 0; i < json.bets.length; i++)
            $('.tr' + json.bets[i].evid + ' .bt' + json.bets[i].oid).addClass('ui-btn-active');
    }
}
function openbetdetails(evid) {
    var bettypes = JSON.parse(localStorage["bettypes"]);
    var bets = $('#bets' + evid).children();
    var types = new Array();
    for (var i = 0; i < bets.length; i++) {
        var tid = jQuery.grep(bettypes, function (bet) { return bet.oid == $(bets[i]).attr('oid'); });
        if (types.indexOf(tid[0].tid) == -1)
            types.push(tid[0].tid);
    }
    var str = '';
    for (var i = 0; i < types.length; i++) {
        var opts = jQuery.grep(bets, function (bet) { return $(bet).attr('tid') == types[i]; });
        var tbl = '<table data-role="table" data-mode="columntoggle" class="movie-list gtbl"><thead><tr><th colspan="#cnt">#tn</th></tr></thead><tbody>#opts</tbody></table>';
        var ltype = jQuery.grep(bettypes, function (bet) { return bet.tid == types[i]; });
        if (opts.length > 7)
            tbl = tbl.replace(/#cnt/, 7).replace(/#tn/, ltype[0].sname);
        else
            tbl = tbl.replace(/#cnt/, opts.length).replace(/#tn/, ltype[0].sname);
        var tds = '';
        var tds2 = '';
        var tds3 = '';
        var tds4 = '';
        var tds5 = '';
        var tds6 = '';

        for (var j = 0; j < opts.length; j++) {
            var lopt = jQuery.grep(bettypes, function (bet) { return bet.oid == $(opts[j]).attr('oid'); });
            var td = '<td><a href="#" class="bt#oid ui-btn ui-mini" onclick="AddToCoupon(#evid,#oid,#rt)">#on(#rt)</a></td>'.replace(/#on/, lopt[0].oname).replace(/#rt/ig, $(opts[j]).attr('rt')).replace(/#evid/, evid).replace(/#oid/ig, $(opts[j]).attr('oid'));
            if (j < 7)
                tds += td;
            else if (j < 14)
                tds2 += td;
            else if (j < 21)
                tds3 += td;
            else if (j < 28)
                tds4 += td;
            else if (j < 35)
                tds5 += td;
            else
                tds6 += td;
        }
        if (opts.length < 8)
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>');
        else if (opts.length < 16)
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>' + '<tr>' + tds2 + '</tr>');
        else if (opts.length < 24)
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>' + '<tr>' + tds2 + '</tr>' + '<tr>' + tds3 + '</tr>');
        else if (opts.length < 24)
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>' + '<tr>' + tds2 + '</tr>' + '<tr>' + tds3 + '</tr>' + '<tr>' + tds4 + '</tr>');
        else if (opts.length < 32)
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>' + '<tr>' + tds2 + '</tr>' + '<tr>' + tds3 + '</tr>' + '<tr>' + tds4 + '</tr>' + '<tr>' + tds5 + '</tr>');
        else
            str += tbl.replace(/#opts/, '<tr>' + tds + '</tr>' + '<tr>' + tds2 + '</tr>' + '<tr>' + tds3 + '</tr>' + '<tr>' + tds4 + '</tr>' + '<tr>' + tds5 + '</tr>' + '<tr>' + tds6 + '</tr>');
    }
    $('#betdetails #tables').html(str);
    $('#betdetails #tables .gtbl').table();
    $('#betdetails').popup('open');
}
function ClearCoupon() {
    if (localStorage["coupon"] != null)
        delete localStorage["coupon"];
    LoadCoupon();
}
function RefreshCoupon(couponjson) {
    var rt = 1;
    var mbs = 0;
    for (var i = 0; i < couponjson.bets.length; i++) {
        var bt = couponjson.bets[i];
        rt *= bt.rt;
        if (bt.mbs > mbs)
            mbs = bt.mbs;
    }
    couponjson.mbs = mbs;
    couponjson.rt = rt;
    couponjson.count = 1;
    couponjson.totalwin = couponjson.stake * couponjson.rt;
    couponjson.cost = couponjson.stake * couponjson.count;
    var bankocount = jQuery.grep(couponjson.bets, function (bet) { return bet.isbanko });
    var maxsys = couponjson.bets.length - bankocount.length;
    var minsys = couponjson.mbs;

    couponjson.systems = jQuery.grep(couponjson.systems, function (bet) { return bet <= maxsys });

    var sysstr = '';
    var btn = '<a href="#" class="ui-btn ui-mini #lastchild" onclick="SwitchSys(this,#sysno)" id="sys#sysno">#sysno</a>';

    if (minsys <= maxsys)
        for (var i = minsys; i <= maxsys; i++)
            sysstr += btn.replace(/#sysno/ig, i).replace(/#lastchild/ig, i==maxsys?"ui-last-child":"");

    $('#systems').html('<div class="ui-controlgroup-controls ">'+sysstr+'</div>');
    $('#systems').controlgroup().controlgroup('refresh');

    for (var i = 0; i < couponjson.systems.length; i++)
        $('#sys' + couponjson.systems[i]).toggleClass('ui-btn-active');

    if (couponjson.systems.length == 0)
        couponjson.issys = false;

    if (couponjson.issys) {
        var combs = GetSystemBets(couponjson);
        couponjson.rt = combs.ratio;
        couponjson.totalwin = combs.winning;
        couponjson.count = combs.couponcount;
    }
    localStorage["coupon"] = JSON.stringify(couponjson);
    return couponjson;
}
function setsys() {
    var couponjson = JSON.parse(localStorage["coupon"]);
    couponjson.issys = true;
    couponjson.systems.push(3);
    localStorage["coupon"] = JSON.stringify(couponjson);
    console.log(couponjson);
}
function AddToCoupon(evid, oid, rt) {
    //var isremove = $(btn).hasClass('ui-btn-active');
    var localcoupon = localStorage["coupon"];
    var couponjson;
    if (localcoupon == null)
        couponjson = {
            bets: new Array(), rt: 0, issys: false, systems: new Array(), mbs: 0, stake: 2, count: 1, cost: 0, totalwin: 0
        };
    else
        couponjson = JSON.parse(localcoupon);

    var existingbet = jQuery.grep(couponjson.bets, function (bet) { return bet.evid == evid && bet.oid == oid; });
    var isremove = existingbet.length > 0;

    var filteredbets = jQuery.grep(couponjson.bets, function (bet) { return bet.evid != evid; });
    couponjson.bets = filteredbets;
    var trcp = $('.tr' + evid).children();
    //$('.tr9927').children().eq(3).children('a').html()
    if (!isremove)
        couponjson.bets.push({ oid: oid, evid: evid, name: $(trcp[3]).children('a').html(), mbs: $(trcp[2]).html(), code: $(trcp[1]).html(), time: trcp.parent().attr('edate')
        , sid: trcp.parent().attr('sid'), isbanko: false, rt: rt
        });

    couponjson = RefreshCoupon(couponjson);
    console.log(couponjson);
    localStorage["coupon"] = JSON.stringify(couponjson);

    if ($('#betdetails .ui-btn').length > 0)
        $('#betdetails .ui-btn').removeClass('ui-btn-active');
    $('.tr' + evid + ' .ui-btn').removeClass('ui-btn-active');

    if (!isremove) {
        $('.tr' + evid + ' .bt' + oid).addClass('ui-btn-active');
        if ($('#betdetails .ui-btn').length > 0)
            $('#betdetails .bt' + oid).addClass('ui-btn-active');
    }
}
function PageCoupon() {
    if ($('#slcstake option').length == 0) {
        for (var i = 1; i < 961; i++)
            appendoption($('#slcstake'), i, i, false);
        $('#slcstake').selectmenu("refresh", true);
    }
    LoadCoupon();
}
function changestake(elm, evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    jsoncoupon.stake = parseInt($('#slcstake').val());
    localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    LoadCoupon();
}
function SwitchSys(elm, sysno) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    var existing = jQuery.grep(jsoncoupon.systems, function (bet) { return bet == sysno; });
    if (existing.length > 0) 
        jsoncoupon.systems = jQuery.grep(jsoncoupon.systems, function (bet) { return bet != sysno; });
    else 
        jsoncoupon.systems.push(sysno);

    jsoncoupon.issys = jsoncoupon.systems > 0;  
    localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    $(elm).toggleClass('ui-btn-active');
}
function SwitchBanko(elm, evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    var isremove = false;
    for (var i = 0; i < jsoncoupon.bets.length; i++)
        if (jsoncoupon.bets[i].evid == evid) {
            isremove = jsoncoupon.bets[i].isbanko;
            jsoncoupon.bets[i].isbanko = !jsoncoupon.bets[i].isbanko;
        }

    localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    $(elm).toggleClass('ui-btn-active');
}
function DeleteBet(evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    jsoncoupon.bets = jQuery.grep(jsoncoupon.bets, function (bet) { return bet.evid != evid; });
    localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    LoadCoupon();
}
function LoadCoupon() {
    $("#tblcoupon > tbody").html('');
    var data = localStorage["coupon"];
    if (data == null)
        return;
    data = JSON.parse(data);
    if (data.bets.length == 0)
        return;
    var deleter = '<a href="#" onclick="DeleteBet(#evid)" class="ui-btn ui-mini" >Sil</a>';
    var bnkbtn = '<a href="#" onclick="SwitchBanko(this,#evid)" class="ui-btn ui-mini #act" >Banko</a>';
    var str = '';
    var bettypes = JSON.parse(localStorage["bettypes"]);

    $(data.bets).each(function () {
        var li = $('#trcouponhelper')[0].outerHTML.replace(/tx/ig, 'tr').replace(/ty/ig, 'td');
        var oid = this.oid;
        var betdet = jQuery.grep(bettypes, function (bet) { return bet.oid == oid; });
        li = li.replace(/#bet/g, betdet[0].tname + ':' + betdet[0].oname);
        li = li.replace(/#evname/g, this.name);
        li = li.replace(/#time/g, moment(new Date(this.time)).format("DD.MM.YY HH:mm"));
        li = li.replace(/#code/g, this.code);
        li = li.replace(/#mbs/g, this.mbs);
        li = li.replace(/#rt/g, this.rt);
        li = li.replace(/#bnk/g, bnkbtn.replace(/#evid/ig, this.evid).replace(/#act/ig, this.isbanko ? "ui-btn-active" : ""));
        li = li.replace(/#del/g, deleter.replace(/#evid/ig, this.evid));
        //li = li.replace(/#edate/g, this.edate);

        str += li;
    });
    $("#tblcoupon > tbody").append(str);
    $("#tblcoupon").table("refresh");

    $("#slcstake").val(data.stake);
    $('#slcstake').selectmenu("refresh", true);

    $("#spnwin").html(data.totalwin.toFixed(2));
    $("#spnratio").html(data.rt.toFixed(2));
    $("#spncount").html(data.count);

    RefreshCoupon(data);
}