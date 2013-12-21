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
function loadprogram() {
    var data = loadlocalitem("program").obj;
    $("#tblprog > tbody").html('');
    var str = '';
    var deleters = '1,2';
    var betspan = "<span on='#on' tn='#tn' oid='#oid' rt='#rt'></span>";
    $(data.events).each(function () {
        if (this.sid == $('#slcsport').val() && $('#slcdate').val() == moment(this.edate).format("YYYY-MM-DD") && ($('#slccomp').val() == "" || $('#slccomp').val() == this.cid)) {
            var li = $('#trproghelper')[0].outerHTML.replace(/tx/ig, 'tr').replace(/ty/ig, 'td');
            li = li.replace(/#evid/g, this.id);
            li = li.replace(/#evname/g, this.ename);
            li = li.replace(/#time/g, moment(new Date(this.edate)).format("HH:mm"));
            li = li.replace(/#code/g, this.code);
            li = li.replace(/#mbs/g, this.mbs);

            var addoption = '<a href="#" onclick="AddToCoupon(#id,#oid)" class="ui-btn ui-mini" >#rt</a>'.replace(/#id/, this.id);
            var o1 = jQuery.grep(this.bets, function (bet) { return bet.oid == 1; })[0].rt;
            var o0 = jQuery.grep(this.bets, function (bet) { return bet.oid == 2; })[0].rt;
            var o2 = jQuery.grep(this.bets, function (bet) { return bet.oid == 3; })[0].rt;
            li = li.replace(/#o1/g, addoption.replace(/#oid/, 1).replace(/#rt/, o1));
            li = li.replace(/#o0/g, addoption.replace(/#oid/, 2).replace(/#rt/, o0));
            li = li.replace(/#o2/g, addoption.replace(/#oid/, 3).replace(/#rt/, o2));
            var oa = jQuery.grep(this.bets, function (bet) { return bet.oid == 15; });
            var ou = jQuery.grep(this.bets, function (bet) { return bet.oid == 16; });
            if (oa.length > 0)
                li = li.replace(/#oa/g, addoption.replace(/#oid/, 15).replace(/#rt/, oa[0].rt));
            else
                li = li.replace(/#oa/g, '');
            if (ou.length > 0)
                li = li.replace(/#ou/g, addoption.replace(/#oid/, 16).replace(/#rt/, ou[0].rt));
            else
                li = li.replace(/#ou/g, '');
            var bets = '';
            for (var i = 0; i < this.bets.length; i++)
                bets += betspan.replace(/#on/ig, this.bets[i].on).replace(/#tn/ig, this.bets[i].tn).replace(/#oid/ig, this.bets[i].oid).replace(/#rt/ig, this.bets[i].rt);
            li = li.replace(/#bets/ig, bets);

            str += li;
        }
    });
    $("#tblprog > tbody").append(str);
    $("#tblprog").table("refresh");
}
function AddToCoupon(evid, oid) {
    alert(evid + "-" + oid);
}
function openbetdetails(evid) {
    var bets = $('#bets' + evid).children();
    var types = new Array();
    for (var i = 0; i < bets.length; i++)
        if (types.indexOf($(bets[i]).attr('tn')) == -1) {
            types.push($(bets[i]).attr('tn'));
        }
    var str = '';
    for (var i = 0; i < types.length; i++) {
        var opts = jQuery.grep(bets, function (bet) { return $(bet).attr('tn') == types[i]; });
        var tbl = '<table data-role="table" data-mode="columntoggle" class="movie-list gtbl"><thead><tr><th colspan="#cnt">#tn</th></tr></thead><tbody>#opts</tbody></table>';
        if (opts.length > 7)
            tbl = tbl.replace(/#cnt/, 7).replace(/#tn/, types[i]);
        else
            tbl = tbl.replace(/#cnt/, opts.length).replace(/#tn/, types[i]);
        var tds = '';
        var tds2 = '';
        var tds3 = '';
        var tds4 = '';
        var tds5 = '';
        var tds6 = '';
        
        for (var j = 0; j < opts.length; j++) {
            var td = '<td><a href="#" class="ui-btn ui-mini" onclick="AddToCoupon(#id,#oid)">#on(#rt)</a></td>'.replace(/#on/, $(opts[j]).attr('on')).replace(/#rt/, $(opts[j]).attr('rt')).replace(/#id/, evid).replace(/#oid/, $(opts[j]).attr('oid'));
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