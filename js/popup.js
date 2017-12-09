
var extension = {
	id: 0,
	domain: '',
	selected: ''
}
var apiLink = 'http://mvp.daratus.com/ico-extention/index.php?link=';
var graphUrl = 'https://widget.similarweb.com/traffic/';

var graphInitData = [
	{btnID: "hour", container:"hourGraph", dataName:"histo60Minutes", timeText:"LAST HOUR", data:{xGridAmm:5}, smoothAmm: 0, type: "other"},
	{btnID: "day", container:"dayGraph", dataName:"histo24Hours", timeText:"LAST 24 HOUR", data:{xGridAmm:7}, smoothAmm: 0, type: "other"},
	{btnID: "week", container:"weekGraph", dataName:"histo1week", timeText:"LAST 7 DAYS", data:{xGridAmm:8}, smoothAmm: 0, type: "init"},
	{btnID: "month", container:"monthGraph", dataName:"histo1month", timeText:"LAST MONTH", data:{xGridAmm:5}, smoothAmm: 0, type: "other"},
	{btnID: "3month", container:"3monthGraph", dataName:"histo3months", timeText:"LAST 3 MONTH", data:{xGridAmm:7}, smoothAmm: 0, type: "other"}
]

// Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-103789418-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function addButtonTracking(){
	// Price action graph
	setTrack("#hour", "price_graph_hour");
	setTrack("#day", "price_graph_day");
	setTrack("#week", "price_graph_week");
	setTrack("#month", "price_graph_month");
	setTrack("#3month", "price_graph_3month");
}

function setTrack(elementName, eventName){
	$( elementName ).attr('track', eventName);
}

function init( rootDomain, selectedText ){
	// get extension id
	extension.domain = rootDomain;
	extension.selected = selectedText;
	console.log(extension.selected);
	getExtensionId();
	// setTimeout(getExtensionId, 5000); // for testing
}

function getExtensionId(){
	// check if we have id
	chrome.storage.local.get( ["id"] , function(items){

	    if( !items.hasOwnProperty("id") ){
	    	console.log("no id");

	    	// create id
	    	var newId = Math.floor((Math.random() * 8999999999) + 1000000000);
	    	extension.id = newId;

	    	chrome.storage.local.set( { "id": newId } , function(){
	    		console.log("id created:", newId);
	    	});
	    } else {
	    	console.log("extension id:", items.id);
	    	extension.id = items.id;
	    }

	    getDomainData(extension.domain);
	});
}

function initExtension( data ){
	// console.log(data);

	// if ( data.hasOwnProperty("baseInfo") ){
	if ( data.error == null ){

		appendSocialIcons(data.baseInfo.status);
		addSocialLinks(data.social);
		showBottomGraph(data.traffic);

		if(data.baseInfo.status == "ICO"){
			showICO(data.baseInfo, data.icoRating, data.social);
			$("#ico").css("display", "block");
		} else if (data.baseInfo.status == "trading"){
			showTrading(data.baseInfo, data.coinMarket);
			$("#trading").css("display", "block");
			// loadGraph(data.historicalRates, "init");
			setTimeout( function(){
				loadGraph(data.historicalRates, "init");
			}, 5 );
		}

		addMouseEvents();
		// activateExtensionLinks();
	} else {
		console.log("er", data.error);
		$("#errorMsg > #error1 #fromJSON").html(data.error);
		$("#contWrap").css("display", "none");
		$("#errorMsg").css("display", "block");
		$("#error1").css("display", "block");
	}

	showBottomLink(data.additionalInfo);
	activateExtensionLinks();
	addButtonTracking();
	
	// hide loader
	$( "#loader" ).animate({
	    opacity: 0.0
	}, 550, function() {
	    $("#loader").addClass("noEvents");
	});
}


function addSocialLinks(social){
	addSocialIcoLink(".social > .telegram", social.telegram, "social_telegram");
	addSocialIcoLink(".social > .twitter", social.twitter, "social_twitter");
	addSocialIcoLink(".social > .faceBook", social.faceBook, "social_faceBook");
	addSocialIcoLink(".social > .reddit", social.reddit, "social_reddit");
	addSocialIcoLink(".social > .gitHub", social.gitHub, "social_gitHub");
	addSocialIcoLink(".social > .bitCoinTalk", social.bitCoinTalk, "social_bitCoinTalk");

	if( (social.blog != null) && (social.blog.search("medium.com") >= 0) ){ 
		addSocialIcoLink(".social > .medium", social.blog, "social_blog_medium");
		$(".social > .blog").addClass("nodisplay");
	} else {
		addSocialIcoLink(".social > .blog", social.blog, "social_blog_blog");
		$(".social > .medium").addClass("nodisplay");
	}
}

function addMouseEvents(){
	$( ".soc_icon" ).mouseover(function(event) {
		var name = $( this ).attr("value");
	  	$( this ).append( '<div class="social_toolbox">'+name+'</div>' );
	  	// $( this ).addClass('socialFadeIn');
	  	$( ".social_toolbox"  ).animate({ opacity: 1 }, 400);
	});
	$( ".soc_icon" ).mouseout(function() {
		$( ".social_toolbox" ).remove();
	  	// $( this +"> .social_toolbox" ).animate({ opacity: 0.0 }, 200, function() {
			// $( this +"> .social_toolbox" ).remove();
	  	// });
	});
}



function addSocialIcoLink(el, url, trackEventName){
	if( (url != null) && (url != "") ){
		$( el+" > a" ).attr("href", url )
		$( el ).css("order", "1" )
		setTrack(el+" > a", trackEventName);
	} else {
		$( el ).addClass("inactiveSocialIcon");
	}
}

function showICO(baseInfo, icoRating, social){
	$("#domain_name > span > .name").html( naCheck(baseInfo.name) );
	$("#domain_name > span > .symbol").html( "(" + naCheck(baseInfo.symbol) + ")" );
	$(".domain_logo").css("background-image", "url(" + baseInfo.logoLink + ")" )
	$(".description").html( baseInfo.description );

	$("#sale_starts > .date").html( naCheck(baseInfo.tokenSaleStartDate) );
//	$("#sale_starts > .date_text").html( naCheck(baseInfo.tokenSaleStartInWords) );
	$("#sale_ends > .date").html( naCheck(baseInfo.tokenSaleEndDate) );
//	$("#sale_ends > .date_text").html( naCheck(baseInfo.tokenSaleEndInWords) );

	$("#telegram_members > .value").html( naCheck(social.telegram_users) );
	$("#twitter_followers > .value").html( naCheck(social.twitter_followers) );


	var ratingsPaths = [ 
		// elID, val, link, trackeventname
		['ico_rating', 'icorating', 'icoratingLink', 'ratings_icorating', 'icoratingText'],
		['ico_bench', 'icobench', 'icobenchLink', 'ratings_icobench', 'icobenchText'],
		['ico_bazaar', 'icobazaar', 'icobazaarLink', 'ratings_icobazaar', 'icobazaarText'],
		['token_tops', 'tokentops', 'tokentopsLink', 'ratings_tokentops', 'tokentopsText'],
		['fox_ico', 'foxIco', 'foxIcoLink', 'ratings_foxIco', 'foxIcoText'],
		['digrate', 'digrate', 'digrateLink', 'ratings_digrate', 'digrateText'],
		['ico_drops', 'icodrops', 'icodropsLink', 'ratings_icodrops', 'icodropsText']
	]

	displayRating( ratingsPaths, icoRating );
	setTimeout(ratingsSameWidth, 10);
}

function displayRating(ratingsPaths, icoRating){
	var total = 100/5; //  100 proc / 5 balu sistema

	for(var i=0; i<ratingsPaths.length; i++){
		var elName = ratingsPaths[i][0];
		var valName = ratingsPaths[i][1];
		var urlName = ratingsPaths[i][2];
		var trackeventname = ratingsPaths[i][3];
		var textName = ratingsPaths[i][4];
		$("#"+elName+" > .flexRows > .flex > .value").html( ifNull( fixed(icoRating[ textName ], 2), "-") );
		$("#"+elName+" > .bar > .activeBar").css( "width", (ifNoInt(icoRating[ valName ], 0))*total+"%" );
		addDetailsBtnLink("#"+elName+" > .info > .details_text", icoRating[ urlName ], trackeventname);
	}
}

function ratingsSameWidth(){
	var max = 0;
	$('.rateVal').each( function(index){
		if(max < $(this).width() ){
			max = $(this).width();
		}
	})
	
	if(max!=0){
		$('.rateVal').width(max)
	} else {
		setTimeout(ratingSameWidth, 10);
	}
}

function addDetailsBtnLink(el, url, trackEventName){
	if( url != null ){
		$( el+" > a" ).attr("href", url )
		setTrack(el+" > a", trackEventName);
	} else {
		$( el ).addClass("inactiveDetailsBtn");
	}
}

function showTrading(baseInfo, coinMarket){
	$("#domain_name > .name").html( naCheck(baseInfo.name) );

	$("#domain_name > .symbol").html( "(" + naCheck(baseInfo.symbol) + ")" );
	$(".domain_logo").css("background-image", "url(" + baseInfo.logoLink + ")" )
	$(".description").html( baseInfo.description );
	$("#domain_prices > p > .usd").html( "$" + naCheck(coinMarket.price_usd) );
	$("#domain_prices > p > .usdProc").html( "(" + naCheck(coinMarket.percent_change_24h) + "%)" );
	if(coinMarket.percent_change_24h < 0){ $(".usdProc").addClass("cRed"); } // if neg num -> red color
	$("#domain_prices > p > .btc").html( naCheck(coinMarket.price_btc) + " BTC" );
	// $("#domain_prices > p > .btcProc").html( "(" + "-" + "%)" );

	$("#rank > .number").html( "#" + naCheck(coinMarket.rank) );

	$("#market_cap > .usd").html( "$" + thousands(smartFixed(coinMarket.market_cap_usd/1000000, 2)) + " M" );
	$("#market_cap > .btc").html( thousands(fixed(coinMarket.market_cap_btc, 1)) + " BTC" );
	$("#market_cap > .eth").html( thousands(fixed(coinMarket.market_cap_eth, 1)) + " ETH" );
	$("#volume > .usd").html( "$" + thousands(smartFixed(coinMarket.volume_usd_24h/1000000,2)) + " M" );
	$("#volume > .btc").html( thousands(fixed(coinMarket.volume_btc_24h, 1)) + " BTC" );
	$("#volume > .eth").html( thousands(fixed(coinMarket.volume_eth_24h, 1)) + " ETH" );

	$("#start_price > .value").html( ifNull(baseInfo.tokenStartPrice, "n/a") );
	$("#funds_raised > .value").html( ifNull(baseInfo.fundsRaised, "n/a") );
	$("#token_sale_end_date > .value").html( ifNull(baseInfo.tokenSaleEndDate, "n/a") );
}

function showBottomGraph(traffic){
	$( ".graph_iframe" ).attr("src", graphUrl+extension.domain )
}

function showBottomLink(additionalInfo){
	$("#bottom > div").append( additionalInfo.html );
}

function unhide(id){
	$(id).css("visibility", "visible")
}


function activateExtensionLinks(){
	window.addEventListener('click',function(e){
		// console.log(e.target.id);
		trackIt(e);

		if( ($(e.target).attr('mailto') != null) && ($(e.target).attr('mailto') != undefined) ){
			sendEmail( $(e.target).attr('mailto') );
		} else if(e.target.href!==undefined){
			activateSimpleClick(e);
		} else if ( jQuery.inArray("time_tab", e.target.classList) >= 0 ) {
			$( ".time_tab" ).removeClass( "active_time_tab" )
			$( e.target ).addClass( "active_time_tab" )
			priceActionGraph(e.target.id);
		}
	})
}

function activateSimpleClick(e){
	chrome.tabs.create({url:e.target.href});
}

function trackIt(e){
	if( $( e.target ).attr('track') != null ){
		var trackVal = $( e.target ).attr('track');
		_gaq.push(['_trackEvent', trackVal, 'clicked']);
		console.log( "tracked:", trackVal );
	}
}

function sendEmail(emailUrl) {
	var emailUrl = "mailto:"+emailUrl;
    chrome.tabs.update({
        url: emailUrl
    });
}


function loadGraph(historicalRates, type){
	for(var i=0;i<graphInitData.length;i++){
		if(graphInitData[i].type == type){ // load all graphs of some type
			loadGraphData(graphInitData[i], historicalRates[graphInitData[i].dataName], historicalRates, type);
		}
	}
}
function loadGraphData(graphinitdata, url, historicalRates, type){
	$.ajax({
	    url: url,
	    type: "POST",
	    dataType: 'json',
	    success: function (data) {
	    	createTimeGraph( graphinitdata, data );
	    	if(type == "init"){
	    		console.log(name);
				$( "#"+graphinitdata.btnID ).addClass( "active_time_tab" )
	    		loadGraph(historicalRates, "other")
	    	}
	    }
	});
}

function createTimeGraph(graphinitdata, data){
	graphData = prepareTimeGraphData( graphinitdata, data );
	var svgEl = createSvg(graphData.container, graphData.width, graphData.height, graphinitdata.container);
	drawBg(svgEl, graphData.width, graphData.height, graphData.bgColor);
	drawGrid(svgEl, graphData.width, graphData.height, graphData.grid, graphData.y.min, graphData.y.max);
	createGraph(svgEl, graphData, graphinitdata.smoothAmm);
	addTimeText(svgEl, graphinitdata.timeText, graphData.width);
}

function prepareTimeGraphData(graphinitdata, jsonData){
	graphData = {
		container: 'prize_action_graph',
		width: $('#prize_action_graph').width(),
		height: $('#prize_action_graph').height(),
		bgColor: "rgba(0, 0, 0, 0)",
		line: {
			color: "#7e7bfd",
			width: 1.5,
		},
		fillColor: "rgba(126, 123, 253, 0.10)",
		padding: {
			sides: 0,
			tops: 30
		},
		steps: jsonData.Data.length,
		stepW: null,
		x: {
			data: [],
			max: jsonData.TimeFrom,
			min: jsonData.TimeTo
		},
		y: {
			data: [],
			max: -99999999999999,
			min: 99999999999999,
			scale: 0
		},
		grid: {
			strokeWidth: 1,
			color: "#eaeaea",
			x:{
				amm: graphinitdata.data.xGridAmm,
				padding: 0
			},
			y:{
				amm: 4,
				padding: 30
			}
		}
	}

	// get min max
	for(var i=0; i<jsonData.Data.length; i++){
		var x = jsonData.Data[i].time;
		var y = jsonData.Data[i].close;
		if(y > graphData.y.max){
			graphData.y.max = y;
		}
		if(y < graphData.y.min){
			graphData.y.min = y;
		}
	}
	// add graph x y
	for(var i=0; i<graphData.steps; i++){
		var x = jsonData.Data[i].time;
		var y = jsonData.Data[i].close-graphData.y.min;
		graphData.x.data.push(x);
		graphData.y.data.push(y);
	}

	// set up
	graphData.stepW = (graphData.width - graphData.padding.sides) / (graphData.steps-1);
	graphData.y.scale = (graphData.height-graphData.padding.tops)/(graphData.y.max - graphData.y.min);

	console.log(graphData);
	return graphData;
	// drawGraph(el, xValues, yValues, minY, maxY);
}

function createSvg(elName, w, h, contName){
	var svg   = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var svgNS = svg.namespaceURI;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    // document.body.appendChild(svg);
    $( "#"+contName ).append( svg );
    console.log(contName);
    return svg;
}

function addText(svgEl, x, y, yMin, yMax, cur, amm){
	textFix = {x:3, y:-5}
    var text = document.createElementNS(svgEl.namespaceURI,'text');
    text.setAttribute('x',x+textFix.x);
    text.setAttribute('y',y+textFix.y);
    text.setAttribute('fill','#85888c');
    text.setAttribute('font-size',8);

    var val = yMax - ((yMax - yMin)/(amm-1))*cur;
    console.log(yMin, yMax, val, amm);
    
	var textNode = document.createTextNode( "$"+thousands(val.toFixed(3)) );
	text.appendChild(textNode);
	
    svgEl.appendChild(text);
}

function addTimeText(svgEl, textVal, w){
    var text = document.createElementNS(svgEl.namespaceURI,'text');
    text.setAttribute('x', w-3);
    text.setAttribute('y', 10);
    text.setAttribute('fill','#85888c');
    text.setAttribute('text-anchor','end');
    text.setAttribute('font-size',8);
    
	var textNode = document.createTextNode( textVal );
	text.appendChild(textNode);
    svgEl.appendChild(text);
}

function drawBg(svgEl, w, h, bgColor){	
    var rect = document.createElementNS(svgEl.namespaceURI,'rect');
    rect.setAttribute('x',0);
    rect.setAttribute('y',0);
    rect.setAttribute('width',w);
    rect.setAttribute('height',h);
    rect.setAttribute('fill',bgColor);
    svgEl.appendChild(rect);
}

function createGraph(svgEl, data, smoothAmm){
    var polyline = document.createElementNS(svgEl.namespaceURI,'polyline');
    var polylineFill = document.createElementNS(svgEl.namespaceURI,'polyline');
    polyline.setAttribute('style','fill:none;stroke:'+data.line.color+';stroke-width:'+data.line.width);
    // polyline.setAttribute('style','fill:none;stroke:'+data.line.color+';stroke-width:'+data.line.width+";stroke-linejoin: round");
    polylineFill.setAttribute('style','fill:'+data.fillColor+';stroke-width:0');
    
    var points = "";
    var curArray = [];
	for(var i=0; i<data.steps; i++){
		var curX = i*data.stepW+data.padding.sides/2;
		var curY = data.height-data.y.data[i]*data.y.scale-data.padding.tops/2;
		curArray.push( [curX, curY] );
    }
	var smoothPoints = smoothPolyline(curArray, smoothAmm);
    for(var i=0; i<smoothPoints.length; i++){
    	points += smoothPoints[i][0]+","+smoothPoints[i][1]+" ";
    }

	polyline.setAttribute('points', points);
	polylineFill.setAttribute('points', points+(data.width-data.padding.sides/2)+','+data.height+' '+data.padding.sides/2+','+data.height);
    svgEl.appendChild(polylineFill);
    svgEl.appendChild(polyline);
}

function smoothPolyline(curArray, smoothAmm){
	for(var i=0;i<smoothAmm;i++){
		curArray = smooth(curArray);
	}
	return curArray;
}

function drawGrid(svgEl, w, h, grid, yMin, yMax){
	console.log("drawGrid")
	for(var i=0;i<grid.x.amm;i++){
	    var line = document.createElementNS(svgEl.namespaceURI,'line');
	    var x = grid.x.padding/2+i*(w-grid.x.padding)/(grid.x.amm-1);
	    line.setAttribute('x1',x);
	    line.setAttribute('y1',0);
	    line.setAttribute('x2',x);
	    line.setAttribute('y2',h);
	    line.setAttribute('stroke-width',grid.strokeWidth);
	    line.setAttribute('stroke',grid.color);
	    svgEl.appendChild(line);
	}
	for(var i=0;i<grid.y.amm;i++){
	    var line = document.createElementNS(svgEl.namespaceURI,'line');
	    var y = grid.y.padding/2+i*(h-grid.y.padding)/(grid.y.amm-1);
	    line.setAttribute('x1',0);
	    line.setAttribute('y1',y);
	    line.setAttribute('x2',w);
	    line.setAttribute('y2',y);
	    line.setAttribute('stroke-width',grid.strokeWidth);
	    line.setAttribute('stroke',grid.color);
	    svgEl.appendChild(line);

	    addText(svgEl, 0, y, yMin, yMax, i, grid.y.amm);
	}
}



function priceActionGraph(type){
	// console.log("priceActionGraph", type);

	for(var i=0;i<graphInitData.length;i++){
		$("#"+graphInitData[i].container).css("display", "none")
		if(graphInitData[i].btnID == type){
			$("#"+graphInitData[i].container).css("display", "inline")
		}
	}
}


// ajax
function getDomainData( rootDomain ){
	var params = {id:extension.id, selectedText:extension.selected};
	var paramsUrl = $.param( params );

	var url = apiLink+"http://"+rootDomain+"?"+paramsUrl;
	console.log("ajax", url);

	$.ajax({
	    url: url,
	    // data: { id: extension.id },
	    type: "POST",
	    dataType: 'json',
	    success: function (data) {
	        initExtension( data );
	    },
	    error: function () {
			showError2();
	    }
	});
}

function showError2(){
	$("#contWrap").css("display", "none");
	$("#errorMsg").css("display", "block");
	$("#error2").css("display", "block");

	window.addEventListener('click',function(e){
		trackIt(e);
		if(e.target.href!==undefined){
			activateSimpleClick(e);
		}
	});
}

// on document ready
$(function() {
	chrome.tabs.executeScript( { code: "window.getSelection().toString();" }, function(selection) {
	  	if((selection != null) || (selection != undefined)){
		  	chrome.tabs.getSelected(null, function(tab) {
		  		var selectedText = selection[0];
		  		if( selectedText.length > 50 ) selectedText = '';

				init( extractRootDomain(tab.url), selectedText );
			});  
		} else {
			showError2();
		}
	});
});
