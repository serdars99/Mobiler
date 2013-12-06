$(document).on("pageinit", function () {
});
$(document).on("pagebeforecreate ", function (event) {
    if (event.target.id != 'page-pets') {
        $(event.target).prepend($('#baseheader').html());
        $(event.target).append($('#basefooter').html());
    }
    //console.log('pagebeforecreate ', event.target.id);
});
//jQuery.fn.headerOnAllPages = function () {
//    var theHeader = $('#constantheader-wrapper').html();
//    var allPages = $('div[data-role="page"]');
//    for (var i = 1; i < allPages.length; i++) {
//        allPages[i].innerHTML = theHeader + allPages[i].innerHTML;
//    }
//};
//$(document).ready(function () {
//    $().headerOnAllPages();
//});
function trylogin() {
    var guid = window.localStorage.getItem("mykey");
    if (guid == null)
        $.ajax({
            url: "http://localhost:26087/api/LoginUser?nick=idontgiveafuck&pass=123",
            //data: { caller: $('#hdnaction').val(), rnd: Math.floor((Math.random() * 1000)) },
            success: function (data, textStatus) {
                guid = data.MobileGuid;
                window.localStorage.setItem("mykey", guid);
            }
        });
    alert(guid);
}
