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

        //        attachswipebase(listitem, transition, function (listitem) {
        if ($('#usertxt').val() == defaulttext) $('#usertxt').val('');
        var nick = listitem.children().children('.urlnick').attr('urlnick');
        if ($("#usertxt").val().indexOf(nick) == -1)
            $("#usertxt").val($("#usertxt").val() + ' @' + nick + ' ');
        $("#usertxt").focus();
        //        });
    });
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
function PageProgram() {
    checklocalitem("program", "GetProgram", null, false, function () {
        loadprogramfilters();
        loadprogram();
    });
}
function checklocalitem(localname, ajaxmethod, ajaxparams, forcerefresh, fncallback) {
    var localprg = loadlocalitem(localname);
    if (forcerefresh || localprg == null || moment(new Date()).diff(moment(localprg.lastdate), 'minutes') > 60) {
        var lastcheckdate = localprg == null || forcerefresh ? moment(new Date()).subtract('days', 1) : moment(localprg.lastdate);
        if (ajaxparams == null)
            ajaxparams = { lastcheckdate: lastcheckdate.format("YYYY-MM-DD HH:mm:ss") };
        else
            ajaxparams["lastcheckdate"] = lastcheckdate.format("YYYY-MM-DD HH:mm:ss");
        getajaxdata(ajaxmethod, ajaxparams, function (data) {
            if (data != undefined) {
                data = JSON.parse(data);
                savelocalitem(localname, data);
            }
            else
                savelocalitem(localname, loadlocalitem(localname).obj);
            if (fncallback != null) fncallback();
        }, false);
    }
    else if (fncallback != null)
        fncallback();
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
function loadprogram() {
    var data = loadlocalitem("program").obj;
    $("#ulprg").html('');
    //$("#tblprog > tbody").html('');
    var str = '';
    var deleters = '1,2';
    //    var betspan = "<span tid='#tid' oid='#oid' rt='#rt'></span>";
    str += $('#liprgfirst')[0].outerHTML;
    $(data.events).each(function () {
        if (this.sid == $('#slcsport').val() && $('#slcdate').val() == moment(this.edate).format("YYYY-MM-DD") && moment(this.edate) > moment(new Date())
            && ($('#slccomp').val() == "" || $('#slccomp').val() == this.cid)) {
            //var li = $('#trproghelper')[0].outerHTML.replace(/tx/ig, 'tr').replace(/ty/ig, 'td');
            var li1 = $('#liprghead')[0].outerHTML;
            var li2 = $('#liprgbets')[0].outerHTML;
            li2 = li2.replace(/#evid/g, this.id);
            li1 = li1.replace(/#evid/g, this.id);
            li1 = li1.replace(/#evname/g, this.ename + (this.dl == "1" ? "[D]" : ""));
            li1 = li1.replace(/#time/g, moment(new Date(this.edate)).format("HH:mm"));
            li1 = li1.replace(/#code/g, this.code);
            li1 = li1.replace(/#mbs/g, this.mbs);
            li1 = li1.replace(/#edate/g, this.edate);
            li1 = li1.replace(/#sid/g, this.sid);
            var betclick = '<a href="#" onclick="addremovebet(this,#evid,#oid,#rt)" class="xoid#oid">#rt</a>'.replace(/#evid/g, this.id);
            var noclick = '<a href="#">-</a>';
            li2 = li2.replace(/#bcount/g, '+' + this.bets.length);
            if (this.sid == 1) {
                var o1 = jQuery.grep(this.bets, function (bet) { return bet.oid == 1; })[0].rt.toFixed(2);
                var o0 = jQuery.grep(this.bets, function (bet) { return bet.oid == 2; })[0].rt.toFixed(2);
                var o2 = jQuery.grep(this.bets, function (bet) { return bet.oid == 3; })[0].rt.toFixed(2);
                li2 = li2.replace(/#link1/g, betclick.replace(/#oid/ig, 1).replace(/#rt/ig, o1));
                li2 = li2.replace(/#link2/g, betclick.replace(/#oid/ig, 2).replace(/#rt/ig, o0));
                li2 = li2.replace(/#link3/g, betclick.replace(/#oid/ig, 3).replace(/#rt/ig, o2));
            }
            else if (this.sid == 2) {
                var o1 = jQuery.grep(this.bets, function (bet) { return bet.oid == 72; })[0].rt.toFixed(2);
                //var o0 = jQuery.grep(this.bets, function (bet) { return bet.oid == 2; })[0].rt;
                var o2 = jQuery.grep(this.bets, function (bet) { return bet.oid == 73; })[0].rt.toFixed(2);
                li2 = li2.replace(/#link1/g, betclick.replace(/#oid/ig, 72).replace(/#rt/ig, o1));
                li2 = li2.replace(/#link2/g, noclick);
                li2 = li2.replace(/#link3/g, betclick.replace(/#oid/ig, 73).replace(/#rt/ig, o2));
            }

            str += li1;
            str += li2;
        }
    });
    $("#ulprg").append(str);
    $("#ulprg").listview('refresh');

    var vbets = [1, 2, 3, 72, 73];
    if (localStorage["coupon"] != null) {
        var json = JSON.parse(localStorage["coupon"]);
        for (var i = 0; i < json.bets.length; i++)
            if (vbets.indexOf(json.bets[i].oid) != -1)
                $('.tx2' + json.bets[i].evid + ' .xoid' + json.bets[i].oid).parent().addClass('stripeactive');
            else
                $('.tx2' + json.bets[i].evid + ' .xoidx').parent().addClass('stripeactive');
    }
}
function openbetdetailspage(evid) {
    localStorage["betdetailevid"] = evid;
    $.mobile.changePage("#betdetail");
}
function getmbsforoid(evmbs, oid) {
    var allbettypes = JSON.parse(localStorage["bettypes"]);
    var tid = jQuery.grep(allbettypes, function (item) { return item.oid == oid; })[0].tid;
    return getmbsfortid(evmbs, tid);
}
function getmbsfortid(evmbs, tid) {
    var mbs = evmbs;
    if ((tid == 10 || tid == 16) && mbs > 2)//iy/ms
        mbs = 2;
    if (tid == 11)//iy/ms
        mbs = 1;
    return mbs;
}
function PageBetdetails() {
    var evid = parseInt(localStorage["betdetailevid"]);
    var prg = JSON.parse(localStorage["program"]).obj;
    var ev = jQuery.grep(prg.events, function (ev) { return evid == ev.id; })[0];
    $('#betdetailevname').html(ev.ename);
    $('#bets').html('');
    var allbettypes = JSON.parse(localStorage["bettypes"]);
    var liheader = $('#betlidivider')[0].outerHTML;
    var li2 = $('#betli2')[0].outerHTML;
    var li3 = $('#betli3')[0].outerHTML;
    var li4 = $('#betli4')[0].outerHTML;
    var str = '';
    var bettypes = new Array();
    for (var i = 0; i < ev.bets.length; i++) {
        if (bettypes.indexOf(ev.bets[i].tid) == -1)
            bettypes.push(ev.bets[i].tid);
    }
    for (var i = 0; i < bettypes.length; i++) {
        var eventbetgroupdef = jQuery.grep(allbettypes, function (item) { return item.tid == bettypes[i]; });
        var eventbettypeoptions = jQuery.grep(ev.bets, function (item) { return item.tid == bettypes[i]; });
        var o1def = jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[0].oid; })[0].oname;
        var o2def = eventbettypeoptions.length > 1 ? jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[1].oid; })[0].oname : "";
        str += liheader.replace(/#txt/ig, eventbetgroupdef[0].tname + "[" + getmbsfortid(ev.mbs, bettypes[i]) + "]");
        if (eventbettypeoptions.length == 2) {
            var grpstr = li2.replace(/#evid/ig, ev.id).replace(/#oid1/ig, eventbettypeoptions[0].oid).replace(/#oid2/ig, eventbettypeoptions[1].oid);
            grpstr = grpstr.replace(/#rt1/ig, eventbettypeoptions[0].rt).replace(/#rt2/ig, eventbettypeoptions[1].rt);
            grpstr = grpstr.replace(/#on1/ig, o1def).replace(/#on2/ig, o2def);
            str += grpstr;
        }
        else if (eventbettypeoptions.length == 3) {
            var o3def = jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[2].oid; })[0].oname;
            var grpstr = li3.replace(/#evid/ig, ev.id).replace(/#oid1/ig, eventbettypeoptions[0].oid).replace(/#oid2/ig, eventbettypeoptions[1].oid).replace(/#oid3/ig, eventbettypeoptions[2].oid);
            grpstr = grpstr.replace(/#rt1/ig, eventbettypeoptions[0].rt).replace(/#rt2/ig, eventbettypeoptions[1].rt).replace(/#rt3/ig, eventbettypeoptions[2].rt);
            grpstr = grpstr.replace(/#on1/ig, o1def).replace(/#on2/ig, o2def).replace(/#on3/ig, o3def);
            grpstr = grpstr.replace(/onclick="addremovebet\(this,\d+,77\)"/ig, '');
            str += grpstr;
        }
        else if (eventbettypeoptions.length == 4) {
            var o3def = jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[2].oid; })[0].oname;
            var o4def = jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[3].oid; })[0].oname;
            var grpstr = li4.replace(/#evid/ig, ev.id).replace(/#oid1/ig, eventbettypeoptions[0].oid).replace(/#oid2/ig, eventbettypeoptions[1].oid).replace(/#oid3/ig, eventbettypeoptions[2].oid).replace(/#oid4/ig, eventbettypeoptions[3].oid);
            grpstr = grpstr.replace(/#rt1/ig, eventbettypeoptions[0].rt).replace(/#rt2/ig, eventbettypeoptions[1].rt).replace(/#rt3/ig, eventbettypeoptions[2].rt).replace(/#rt4/ig, eventbettypeoptions[3].rt);
            grpstr = grpstr.replace(/#on1/ig, o1def).replace(/#on2/ig, o2def).replace(/#on3/ig, o3def).replace(/#on4/ig, o4def);
            str += grpstr;
        }
        else if (eventbettypeoptions.length > 4) {
            for (var j = 0; j < eventbettypeoptions.length; j += 4) {
                var ob1def = jQuery.grep(eventbetgroupdef, function (item) { return item.oid == eventbettypeoptions[j].oid; });
                var ob2def = jQuery.grep(eventbetgroupdef, function (item) { return j + 1 < eventbettypeoptions.length && item.oid == eventbettypeoptions[j + 1].oid; });
                var ob3def = jQuery.grep(eventbetgroupdef, function (item) { return j + 1 < eventbettypeoptions.length && item.oid == eventbettypeoptions[j + 2].oid; });
                var ob4def = jQuery.grep(eventbetgroupdef, function (item) { return j + 1 < eventbettypeoptions.length && item.oid == eventbettypeoptions[j + 3].oid; });
                ob1def = ob1def.length == 0 ? "" : ob1def[0].oname;
                ob2def = ob2def.length == 0 ? "" : ob2def[0].oname;
                ob3def = ob3def.length == 0 ? "" : ob3def[0].oname;
                ob4def = ob4def.length == 0 ? "" : ob4def[0].oname;
                var oid1 = j < eventbettypeoptions.length ? eventbettypeoptions[j].oid : '';
                var oid2 = j + 1 < eventbettypeoptions.length ? eventbettypeoptions[j + 1].oid : '';
                var oid3 = j + 2 < eventbettypeoptions.length ? eventbettypeoptions[j + 2].oid : '';
                var oid4 = j + 3 < eventbettypeoptions.length ? eventbettypeoptions[j + 3].oid : '';
                var rt1 = j < eventbettypeoptions.length ? eventbettypeoptions[j].rt : '';
                var rt2 = j + 1 < eventbettypeoptions.length ? eventbettypeoptions[j + 1].rt : '';
                var rt3 = j + 2 < eventbettypeoptions.length ? eventbettypeoptions[j + 2].rt : '';
                var rt4 = j + 3 < eventbettypeoptions.length ? eventbettypeoptions[j + 3].rt : '';
                var grpstr = li4.replace(/#evid/ig, ev.id).replace(/#oid1/ig, oid1).replace(/#oid2/ig, oid2).replace(/#oid3/ig, oid3).replace(/#oid4/ig, oid4);
                grpstr = grpstr.replace(/#rt1/ig, rt1).replace(/#rt2/ig, rt2).replace(/#rt3/ig, rt3).replace(/#rt4/ig, rt4);
                grpstr = grpstr.replace(/#on1/ig, ob1def).replace(/#on2/ig, ob2def).replace(/#on3/ig, ob3def).replace(/#on4/ig, ob4def);
                str += grpstr;
            }
        }
    }
    $('#bets').html(str);
    $('#bets').listview('refresh');

    if (localStorage["coupon"] != null) {
        var json = JSON.parse(localStorage["coupon"]);
        for (var i = 0; i < json.bets.length; i++)
            if (evid == json.bets[i].evid)
                $('#ad' + json.bets[i].oid).parent().addClass('stripeactive');
    }
}
function addremovebet(elm, evid, oid, rt) {
    var hasclassbefore = $(elm).parent().hasClass('stripeactive');
    $('#bets').children().children().children().removeClass('stripeactive');
    $('.tx2' + evid).children().children().removeClass('stripeactive');
    if (!hasclassbefore)
        $(elm).parent().addClass('stripeactive');

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
    var trcp = $('.tx1' + evid);
    var code = trcp.children().children('span').eq(0).html().trim().match(/([^\.]+)\.(.*)/)[1];
    var mbs = trcp.children().children('span').eq(1).text().trim();
    var evname = trcp.children().children('span').eq(0).html().trim().match(/([^\.]+)\.(.*)/)[2];
    if (!isremove)
        couponjson.bets.push({
            oid: oid, evid: evid, name: evname, mbs: getmbsforoid(mbs, oid), code: code, time: trcp.attr('edate')
        , sid: trcp.attr('sid'), isbanko: false, rt: rt
        });

    RefreshCoupon(couponjson);
}
function ClearCoupon() {
    if (localStorage["coupon"] != null)
        delete localStorage["coupon"];
    RefreshCouponShower();
    LoadCoupon();
}
function RefreshCoupon(couponjson) {
    var rt = 1;
    var mbs = 0;
    var exist1mbs = false;
    for (var i = 0; i < couponjson.bets.length; i++) {
        var bt = couponjson.bets[i];
        rt *= bt.rt;
        if (bt.mbs > mbs)
            mbs = bt.mbs;
        if (bt.mbs == 1)
            exist1mbs = true;
    }
    couponjson.mbs = exist1mbs ? 1 : mbs;
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
            sysstr += btn.replace(/#sysno/ig, i).replace(/#lastchild/ig, i == maxsys ? "ui-last-child" : "");

    //if ($.mobile.activePage == 'coupon') {
    $('#systems').html('<div class="ui-controlgroup-controls ">' + sysstr + '</div>');
    $('#systems').controlgroup().controlgroup('refresh');

    for (var i = 0; i < couponjson.systems.length; i++)
        $('#sys' + couponjson.systems[i]).toggleClass('ui-btn-active');
    //}

    if (couponjson.systems.length == 0)
        couponjson.issys = false;

    if (couponjson.issys) {
        var combs = GetSystemBets(couponjson);
        couponjson.rt = combs.ratio;
        couponjson.totalwin = combs.winning;
        couponjson.count = combs.couponcount;
    }
    localStorage["coupon"] = JSON.stringify(couponjson);
    if ($.mobile.activePage.attr("id") == 'coupon') {
        RefreshCouponShower();
    }
    if (couponjson.mbs > 0 && couponjson.mbs <= couponjson.bets.length)
        $('#sendcpnbtn').show();
    else
        $('#sendcpnbtn').hide();

    //return couponjson;
}
function PageCoupon() {
    if ($('#slcstake option').length == 0) {
        for (var i = 1; i < 961; i++)
            appendoption($('#slcstake'), i, i, false);
        $('#slcstake').selectmenu("refresh", true);
    }
    RefreshCouponShower();
    LoadCoupon();
}
function changestake(elm, evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    jsoncoupon.stake = parseInt($('#slcstake').val());
    //localStorage["coupon"] = JSON.stringify(jsoncoupon);
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

    jsoncoupon.issys = jsoncoupon.systems.length > 0;
    //localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    $(elm).toggleClass('ui-btn-active');
}
function SwitchBanko(elm, evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    for (var i = 0; i < jsoncoupon.bets.length; i++)
        if (jsoncoupon.bets[i].evid == evid) {
            jsoncoupon.bets[i].isbanko = !jsoncoupon.bets[i].isbanko;
        }

    //localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    $(elm).toggleClass('ui-btn-active');
}
function DeleteBet(evid) {
    var jsoncoupon = JSON.parse(localStorage["coupon"]);
    jsoncoupon.bets = jQuery.grep(jsoncoupon.bets, function (bet) { return bet.evid != evid; });
    //localStorage["coupon"] = JSON.stringify(jsoncoupon);
    RefreshCoupon(jsoncoupon);
    LoadCoupon();
}
function LoadCoupon() {
    //$("#tblcoupon > tbody").html('');
    $('#ulcpn').html('');
    var data = localStorage["coupon"];
    if (data == null)
        return;
    data = JSON.parse(data);
    if (data.bets.length == 0)
        return;
    var deleter = '<a href="#" onclick="DeleteBet(#evid)" class="ui-btn ui-mini notopspace" >Sil</a>';
    var bnkbtn = '<a href="#" onclick="SwitchBanko(this,#evid)" class="ui-btn ui-mini notopspace #act" >Banko</a>';
    var str = '';
    var bettypes = JSON.parse(localStorage["bettypes"]);
    str += $('#licpfirst')[0].outerHTML;
    $(data.bets).each(function () {
        var li1 = $('#licphead')[0].outerHTML;
        var li2 = $('#licp')[0].outerHTML;
        var oid = this.oid;
        var betdet = jQuery.grep(bettypes, function (bet) { return bet.oid == oid; });
        li2 = li2.replace(/#on/g, betdet[0].oname);
        li2 = li2.replace(/#tn/g, betdet[0].tname);
        li1 = li1.replace(/#evname/g, this.name);
        li1 = li1.replace(/#time/g, moment(this.time).format("DD.MM.YY HH:mm"));
        li1 = li1.replace(/#code/g, this.code);
        li1 = li1.replace(/#mbs/g, getmbsfortid(this.mbs, betdet[0].tid));
        li2 = li2.replace(/#rt/g, this.rt);
        li2 = li2.replace(/#bnk/g, bnkbtn.replace(/#evid/ig, this.evid).replace(/#act/ig, this.isbanko ? "ui-btn-active" : ""));
        li2 = li2.replace(/#del/g, deleter.replace(/#evid/ig, this.evid));
        //li = li.replace(/#edate/g, this.edate);

        str += li1;
        str += li2;
    });
    $("#ulcpn").append(str);
    $("#ulcpn").listview("refresh");

    //RefreshCouponShower();

    RefreshCoupon(data);
}
function RefreshCouponShower() {
    var data = localStorage["coupon"];
    if (data == null) {
        $('#cpfree').show();
        $('#cpdets').hide();
        return;
    }
    data = JSON.parse(data);
    if (data.bets.length == 0) {
        $('#cpfree').show();
        $('#cpdets').hide();
        return;
    }
    $('#cpfree').hide();
    $('#cpdets').show();
    $("#slcstake").val(data.stake);
    $('#slcstake').selectmenu("refresh", true);

    $("#spnwin").html(data.totalwin.toFixed(2));
    $("#spnratio").html(data.rt.toFixed(2));
    $("#spncount").html(data.count);
}
function PageProfile() {
    checklocalitem("mycoupons", "getcoupons", { memberid: getmember().MemberID }, false, LoadMyCoupons);
}
function LoadMyCoupons() {
    var data = loadlocalitem("mycoupons").obj;
    $("#cpns").html('');
    var ul1 = '<ul data-role="listview" class="cplist" data-inset="true" >';
    var ul2 = '</ul>';
    var str = '';
    $(data).each(function () {
        var li1 = $('#licpshead')[0].outerHTML.replace('id=', 'xid=');
        var oid = this.oid;
        li1 = li1.replace(/#nick/g, '');
        li1 = li1.replace(/#ctime/g, moment(this.CreateDate).fromNow());
        li1 = li1.replace(/#rt/g, this.Ratio);
        li1 = li1.replace(/#winning/g, this.CouponWin);
        li1 = li1.replace(/#cpid/g, this.CouponID);
        li1 = li1.replace(/#cstake/g, this.Stake);
        li1 = li1.replace(/#ccount/g, this.CouponMultiplier == 1 ? "" : "(x" + this.CouponMultiplier + ")");
        str += ul1 + li1;
        for (var i = 0; i < this.bets.length; i++) {
            var li2 = $('#licpsitem')[0].outerHTML.replace('id=', 'xid=');

            li2 = li2.replace(/#evname/g, this.bets[i].evname);
            li2 = li2.replace(/#time/g, moment(new Date(this.bets[i].evdate)).format("DD.MM.YY HH:mm"));
            li2 = li2.replace(/#code/g, this.bets[i].evcode);
            li2 = li2.replace(/#mbs/g, getmbsforoid(this.bets[i].mbs, this.bets[i].oid));
            li2 = li2.replace(/#tn/g, this.bets[i].tsn);
            li2 = li2.replace(/#rt/g, this.bets[i].rt.toFixed(2));
            li2 = li2.replace(/#on/g, this.bets[i].on);
            li2 = li2.replace(/#bnk/g, this.bets[i].IsBanko ? "[B]" : "");
            li2 = li2.replace(/#dl/g, this.bets[i].IsDuello ? "[D]" : "");

            str += li2;
        }
    });

    $("#cpns").append(str);
    $(".cplist").listview();
}
function SendCoupon() {
    var couponjson = JSON.parse(localStorage["coupon"]);
    var senderobj = { bets: new Array(), stake: couponjson.stake, issys: couponjson.issys, systems: couponjson.systems };
    for (var i = 0; i < couponjson.bets.length; i++) {
        var bet = { oid: couponjson.bets[i].oid, evid: couponjson.bets[i].evid, bnk: couponjson.bets[i].isbanko };
        senderobj.bets.push(bet);
    }

    getajaxdata("SendCoupon", { cpndata: JSON.stringify(senderobj) },
      function (data) {
          if (data == "0") {
              alert("Kupon Oynandı!");
              ClearCoupon();
              getajaxdata("ValidateToken", { token: getmember().MobileGuid }, ValidateCB, false, true, true);
              checklocalitem("mycoupons", "getcoupons", { memberid: getmember().MemberID }, true, null);
              checklocalitem("allcoupons", "getcoupons", null, true, null);
          }
          else
              alert(strip(data));
      }
      , true, false, true);
}
function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
function PageCoupons() {
    checklocalitem("allcoupons", "getcoupons", null, false, CouponsLoader);
}
function CouponsLoader() {
    var data = loadlocalitem("allcoupons").obj;
    $("#cpnsall").html('');
    var ul1 = '<ul data-role="listview" class="cplist2" data-inset="true" >';
    var ul2 = '</ul>';
    var str = '';
    $(data).each(function () {
        var li1 = $('#licpshead')[0].outerHTML.replace('id=', 'xid=');
        var oid = this.oid;

        li1 = li1.replace(/#nick/g, '<div>#nick kuponu</div>'.replace(/#nick/, this.membernick));
        li1 = li1.replace(/#ctime/g, moment(this.CreateDate).fromNow());
        li1 = li1.replace(/#rt/g, this.Ratio);
        li1 = li1.replace(/#winning/g, this.CouponWin);
        li1 = li1.replace(/#cpid/g, this.CouponID);
        li1 = li1.replace(/#cstake/g, this.Stake);
        li1 = li1.replace(/#ccount/g, this.CouponMultiplier == 1 ? "" : "(x" + this.CouponMultiplier + ")");
        str += ul1 + li1;
        for (var i = 0; i < this.bets.length; i++) {
            var li2 = $('#licpsitem')[0].outerHTML.replace('id=', 'xid=');
            li2 = li2.replace(/#evname/g, this.bets[i].evname);
            li2 = li2.replace(/#time/g, moment(new Date(this.bets[i].evdate)).format("DD.MM.YY HH:mm"));
            li2 = li2.replace(/#code/g, this.bets[i].evcode);
            li2 = li2.replace(/#mbs/g, getmbsforoid(this.bets[i].mbs, this.bets[i].oid));
            li2 = li2.replace(/#tn/g, this.bets[i].tsn);
            li2 = li2.replace(/#rt/g, this.bets[i].rt.toFixed(2));
            li2 = li2.replace(/#on/g, this.bets[i].on);
            li2 = li2.replace(/#bnk/g, this.bets[i].IsBanko ? "[B]" : "");
            li2 = li2.replace(/#dl/g, this.bets[i].IsDuello ? "[D]" : "");

            str += li2;
        }
    });

    $("#cpnsall").append(str);
    $(".cplist2").listview();
}