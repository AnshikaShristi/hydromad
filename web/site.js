
/* Copyright (C) 2010 Felix Andrews <felix@nfrac.org> */

var currentAnchor = "INIT";
var currentItem = "intro";

// repeatedly check the anchor in the URL, to detect back/forward
function checkAnchor() {
    if (currentAnchor != document.location.hash) {  
        currentAnchor = document.location.hash;
	var newItem;
        if ((!currentAnchor) || (currentAnchor == "#")) {
	    newItem = "intro";
	} else {
            newItem = currentAnchor.substring(1);
        }
	loadItem(newItem);
    }
}  

function setAnchor(newItem) {
    var a;
    if (newItem == "intro") {
	a = "#";
    } else {
	a = "#" + newItem;
    }
    document.location.hash = a;
}

function loadItem(newItem) {
    // record in access log
//    pageTracker._trackPageview("/item/" + newItem);
    // animate change of page
    if (currentItem != newItem) {
	$(jq(currentItem)).slideUp();
	currentItem = newItem;
    }
    $(jq(newItem)).slideDown();
    // set menu item to 'active'
    $("#nav a.active").removeClass("active");
    var navEl = $("#nav " + jq("nav_" + newItem));
    navEl.addClass("active");
    if (newItem == "intro") {
	closeNavGroups();
    } else {
	// expand the corresponding nav group
	openNavGroup(navEl.parents("li.navgroup"));
	// load man page immediately if there is no example image
	if ($(jq(newItem)).find("img").length == 0) {
	    helplink = $(jq(newItem)).find("a.helplink");
	    if (helplink.is(":visible"))
		helplink.click();
	}
    }
}

/* constructs an id selector, escaping '.' and ':' (from jquery.com) */
function jq(myid) { 
    return '#' + myid.replace(/(:|\.)/g,'\\$1');
}

function closeNavGroups() {
    $("#nav li.navgroup:visible").slideUp("normal", function() {
	    $(this).prev().removeClass("active");
	});
}

function openNavGroup(el) {
    el.siblings("li.navgroup:visible").slideUp("normal", function() {
	    $(this).prev().removeClass("active");
	});
    el.slideDown();
    // set parent nav item to 'active'
    el.prev().addClass("active");
    el;
}

jQuery(function(){
	// suppress loading of images until they are needed:
	//$(".item img").attr("src", "");
	$(".item").hide();
	$(".groupname").hide();
	// collapse subnavigation initially
	$("#nav li.navgroup").hide();

	$("#nav li.navhead a").click(function() {
		el = $(this).parent().next();
		if (el.is(":visible")) {
		    closeNavGroups();
		} else {
		    openNavGroup(el);
		}
		return false;
	    });

	$("#nav li.navgroup a").click(function(e) {
		e.preventDefault();
		var newItem = $(this).attr("id").substring(4);
		// set the URL anchor, will trigger loadItem()
		setAnchor(newItem);
	    });

	$("a.helplink").click(function(e) {
		e.preventDefault();
		helplink = $(this);
		href = helplink.attr("href");
		// record in access log
		//	pageTracker._trackPageview(href);
		helplink.slideUp();
		loader = $('<div class="loading">Loading...</div>');
		helplink.after(loader);
		loader.hide().slideDown(); // reveal slowly
		man = $('<div class="manpage"></div>');
		helplink.after(man);
		man.load(href, function() {
			$(this).siblings(".loading").remove();
			$(this).find("h2,table:first,div:last").remove();
			$(this).hide().slideDown(); // reveal slowly
			helplink.after('<a class="rmhelplink" href="#">' +
				       '<small>[hide help page]</small></a>');
		    });
	    });

	$("a.rmhelplink").live('click', function(e) {
		e.preventDefault();
		rmhelplink = $(this);
		helplink = $(this).siblings("a.helplink");
		man = $(this).siblings(".manpage");
		rmhelplink.remove();
		man.slideUp('normal', function() { $(this).remove(); });
		helplink.slideDown();
	    });

	checkAnchor();
	setInterval("checkAnchor()", 300);
});