
var extension = {
	id: 0,
	domain: ''
}
var apiLink = 'http://mvp.daratus.com/ico-extention/index.php?link=';
var graphUrl = 'https://widget.similarweb.com/traffic/';

var graphInitData = [
	{btnID: "hour", container:"hourGraph", dataName:"histo60Minutes", timeText:"LAST HOUR", data:{xGridAmm:5}, smoothAmm: 0, type: "init"},
	{btnID: "day", container:"dayGraph", dataName:"histo24Hours", timeText:"LAST 24 HOUR", data:{xGridAmm:7}, smoothAmm: 0, type: "other"},
	{btnID: "week", container:"weekGraph", dataName:"histo1week", timeText:"LAST 7 DAYS", data:{xGridAmm:8}, smoothAmm: 0, type: "other"},
	{btnID: "month", container:"monthGraph", dataName:"histo1month", timeText:"LAST MONTH", data:{xGridAmm:5}, smoothAmm: 0, type: "other"},
	{btnID: "3month", container:"3monthGraph", dataName:"histo3months", timeText:"LAST 3 MONTH", data:{xGridAmm:7}, smoothAmm: 0, type: "other"}
]


function init( rootDomain ){
	// get extension id
	getExtensionId();

	// get current domain
	extension.domain = rootDomain;

	// start data load
	getDomainData( rootDomain );
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
	});
}

function initExtension( data ){
	// console.log(data);

	if ( data.hasOwnProperty("baseInfo") ){
		// unhide("#dataScreen");

		appendSocialIcons(data.baseInfo.status);
		addSocialLinks(data.social);
		showBottomData(data.traffic, data.additionalInfo);

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
		activateExtensionLinks();
	} else {
		console.log("er");
		$("#errorMsg").html(data.error);
		$("#dataScreen").css("display", "none");
		$("#errorMsg").css("display", "block");
	}

	
	$( "#loader" ).animate({
	    opacity: 0.0
	}, 550, function() {
	    $("#loader").addClass("noEvents");
	});
}



function addSocialLinks(social){
	addSocialIcoLink(".social > .telegram", social.telegram);
	addSocialIcoLink(".social > .twitter", social.twitter);
	addSocialIcoLink(".social > .faceBook", social.faceBook);
	addSocialIcoLink(".social > .reddit", social.reddit);
	addSocialIcoLink(".social > .gitHub", social.gitHub);
	addSocialIcoLink(".social > .bitCoinTalk", social.bitCoinTalk);

	if( (social.blog != null) && (social.blog.search("medium.com") >= 0) ){ 
		addSocialIcoLink(".social > .medium", social.blog);
		$(".social > .blog").addClass("nodisplay");
	} else {
		addSocialIcoLink(".social > .blog", social.blog);
		$(".social > .medium").addClass("nodisplay");
	}
}

function addMouseEvents(){
	$( ".soc_icon" ).mouseover(function(event) {
		var name = $( this ).attr("value");
	  	$( this ).append( '<div class="social_toolbox">'+name+'</div>' );
	});
	$( ".soc_icon" ).mouseout(function() {
		$( ".social_toolbox" ).remove();
	});
}



function addSocialIcoLink(el, url){
	if( (url != null) && (url != "") ){
		$( el+" > a" ).attr("href", url )
		$( el ).css("order", "1" )
	} else {
		$( el ).addClass("inactiveSocialIcon");
	}
}

function onClickOpenTab(link){
	console.log("link", link);
	// chrome.tabs.create({url:link})
}

function showICO(baseInfo, icoRating, social){
	$("#domain_name > span > .name").html( naCheck(baseInfo.name) );
	$("#domain_name > span > .symbol").html( "(" + naCheck(baseInfo.symbol) + ")" );
	$(".domain_logo").css("background-image", "url(" + baseInfo.logoLink + ")" )
	$(".description").html( baseInfo.description );

	$("#sale_starts > .date").html( naCheck(baseInfo.tokenSaleStartDate) );
	$("#sale_starts > .date_text").html( naCheck(baseInfo.tokenSaleStartInWords) );
	$("#sale_ends > .date").html( naCheck(baseInfo.tokenSaleEndDate) );
	$("#sale_ends > .date_text").html( naCheck(baseInfo.tokenSaleEndInWords) );

	$("#telegram_members > .value").html( naCheck(social.telegram_users) );
	$("#twitter_followers > .value").html( naCheck(social.twitter_followers) );

	// console.log(icoRating);

	$("#ico_rating > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.icorating, 2), "-") );
	$("#ico_critic > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.icocritic, 2), "-") );
	$("#ico_bench > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.icobench, 2), "-") );
	$("#cryptorated > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.cryptorated, 2), "-") );
	$("#ico_bazaar > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.icobazaar, 2), "-") );
	$("#token_tops > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.tokentops, 2), "-") );
	$("#digrate > .flexRows > .flex > .value").html( ifNull( fixed(icoRating.digrate, 2), "-") );

	// ratingSameWidth();
	setTimeout(ratingSameWidth, 10);

	var total = 100/5; //  100 proc / 5 balu sistema
	// console.log( icoRating.icobazaar );
	// console.log( ifNoInt(icoRating.icobazaar*total, 0)+"%" );
	$("#ico_rating > .bar > .activeBar").css( "width", (ifNoInt(icoRating.icorating, 0))*total+"%" );
	$("#ico_critic > .bar > .activeBar").css( "width", (ifNoInt(icoRating.icocritic*total, 0))+"%" );
	$("#ico_bench > .bar > .activeBar").css( "width", (ifNoInt(icoRating.icobench*total, 0))+"%" );
	$("#cryptorated > .bar > .activeBar").css( "width", (ifNoInt(icoRating.cryptorated*total, 0))+"%" );
	$("#ico_bazaar > .bar > .activeBar").css( "width", (ifNoInt(icoRating.icobazaar*total, 0))+"%" );
	$("#token_tops > .bar > .activeBar").css( "width", (ifNoInt(icoRating.tokentops*total, 0))+"%" );
	$("#digrate > .bar > .activeBar").css( "width", (ifNoInt(icoRating.digrate*total, 0))+"%" );

	addDetailsBtnLink("#ico_rating > .info > .details_text", icoRating.icoratingLink);
	addDetailsBtnLink("#ico_critic > .info > .details_text", icoRating.icocriticLink);
	addDetailsBtnLink("#ico_bench > .info > .details_text", icoRating.icobenchLink);
	addDetailsBtnLink("#cryptorated > .info > .details_text", icoRating.cryptoratedLink);
	addDetailsBtnLink("#ico_bazaar > .info > .details_text", icoRating.icobazaarLink);
	addDetailsBtnLink("#token_tops > .info > .details_text", icoRating.tokentopsLink);
	addDetailsBtnLink("#digrate > .info > .details_text", icoRating.digrateLink);

}

function ratingSameWidth(){
	var max = 0;
	// var anyZero = false;
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

function naCheck(val){
	if( val == null ){
		val = "n/a"
	}
	return val;
}

function addDetailsBtnLink(el, url){
	if( url != null ){
		$( el+" > a" ).attr("href", url )
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

function showBottomData(traffic, additionalInfo){
	$( ".graph_iframe" ).attr("src", graphUrl+extension.domain )

	// $("#estimated_visits > .value").html( traffic.TotalVisits );
	// $("#time_on_site > .value").html( traffic.TimeOnSite );
	// $("#page_views > .value").html( traffic.PagesViews );
	// $("#bounce_rate > .value").html( traffic.BounceRate );

	$("#bottom > div").append( additionalInfo.html );
}

function unhide(id){
	$(id).css("visibility", "visible")
}


function activateExtensionLinks(){
	window.addEventListener('click',function(e){
		// console.log(e, this);
		if(e.target.href!==undefined){
			// console.log("url", e.target.href)
			chrome.tabs.create({url:e.target.href})
		} else if ( jQuery.inArray("time_tab", e.target.classList) >= 0 ) {
			$( ".time_tab" ).removeClass( "active_time_tab" )
			$( e.target ).addClass( "active_time_tab" )
			priceActionGraph(e.target.id);
		}
	})
}


function loadGraph(historicalRates, type){
	for(var i=0;i<graphInitData.length;i++){
		if(graphInitData[i].type == type){
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
	$.ajax({
	    url: apiLink+"http://"+rootDomain+"?id="+extension.id,
	    // data: { id: extension.id },
	    type: "POST",
	    dataType: 'json',
	    success: function (data) {
	        initExtension( data );
	    },
	    error: function () {
	        // $("#status").html("failed");
	    }
	});
}

// on document ready
$(function() {
	chrome.tabs.getSelected(null, function(tab) { 
		init( extractRootDomain(tab.url) );
	});    
});
