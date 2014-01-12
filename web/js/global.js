// Global JS for mapper
// Arthur Wuterich
// 1-9-14

// Constants
var NO_LOADED_MAP_LABEL = 'No Loaded Map';
var MAX_REFRESH_INTERVAL = 30000;
var MIN_REFRESH_INTERVAL = 500;

// Application Variables
var lastCheckedTime = 1;
var currentMapID = '';
var hasLoaded = false;
var lockDotGeneration = false;
var refreshTimeoutId = null;
var currentRefreshInterval = MIN_REFRESH_INTERVAL;
var refreshIntervalStep = MIN_REFRESH_INTERVAL;

function log(msg)
{
    console.log(msg);
}

function BackgroundRangeChange(e)
{
    var bg_intensity = $(e.target).val();
    $("body").css( { "background-color":"rgb("+bg_intensity+","+bg_intensity+","+bg_intensity+")" } );
}

function MapOpacityRangeChange(e)
{
    var opacity = $(e.target).val() / 100.0;
    $("#map").css( { "opacity":opacity } );
}

function MapClick(e)
{
    // Don't attempt to add dots if there is not map
    if( currentMapID.length <= 0 )
    {
        return;
    }
    
    var posX = $(this).offset().left,
        posY = $(this).offset().top;
    AddRelativePoint( (e.pageX - posX), (e.pageY - posY), "#"+$(".color").val() );
}

function AddRelativePoint(x,y,color)
{
    var mapWidth = $("#map .map_image").width();
    var mapHeight = $("#map .map_image").outerHeight();
    AddPoint( ( x / mapWidth ) * 100 , ( y / mapHeight ) * 100, color );
}

function AddPoint(x,y,color,sId)
{

    if( id == sId && !hasLoaded )
    {
        return false;
    }
    
    var pointWrapper = $("<div>",{
        class:'point_wrapper',
    });
    
    $(pointWrapper).css( { "left":x+"%", "top":y+"%" } );    

    var point = $("<div>",{
        class:'point',
    });
    
    $(point).css( { "background-color":color } );
    
    $(pointWrapper).append(point).fadeIn();
    
    $("#map .map_image").append( pointWrapper );    
    
    if( sId == undefined )
    {
            
        // Send AJAX call to add dot to DB
        var post = { 'ajax_request':'save_dot', 'x':x, 'y':y, 'user_id':id, 'color':color, 'map':currentMapID };
        log( post );
            $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
            }
        );
    }
    
    return true;
}

function GetPoints( time )
{
    // If no map is loaded don't do anything
    if( currentMapID.length <= 0 )
    {
        return;
    }
    
    // Save the current map id to local space
    var current_map_id = currentMapID;
    
    if( time == undefined || time == 0 )
    {
        if( lastCheckedTime == 1 )
        {
            time = 1;
        }
        else
        {
            time = lastCheckedTime-1;
        }
    }
        
    // Send AJAX call to add dot to DB
    var post = { 'ajax_request':'get_dots', 'time':time, 'map':currentMapID };
        $.post(
        "/ne/",
        post,
        function(data) {
        
            var pointsAdded = false;
        
            // Check to see if the old map id and the new map id are different; if this is the case then don't add the dots
            if( current_map_id != currentMapID )
            {
                return;
            }
            
            log( data );
            var result = jQuery.parseJSON( data );
            lastCheckedTime = result.time;
            
            // Add each dot
            for( Point in result.dots )
            {
                if( AddPoint( result.dots[Point].x, result.dots[Point].y, result.dots[Point].color, result.dots[Point].user_id ) )
                {
                    pointsAdded = true;
                }
            }
            
            hasLoaded = false;
            
            if( !pointsAdded && currentRefreshInterval < MAX_REFRESH_INTERVAL )
            {
                currentRefreshInterval += refreshIntervalStep;
            }
            else
            {
               currentRefreshInterval = MIN_REFRESH_INTERVAL;
            }
            
            refreshTimeoutId = setTimeout( GetPoints, currentRefreshInterval );            
            
        }
    );    
    
}

function ClearAllPoints()
{
    $(".point_wrapper").fadeOut();
}

function GenerateMapIDClick(e)
{
    var gen_id = MD5( new Date().getTime().toString() ).slice(0,16);
    $("#map_id").val( gen_id );
}

function LoadMapClick()
{
    ClearAllPoints();
    lastCheckedTime = 1;
    
    var new_map_id = $("#map_id").val();
    
    if( new_map_id.length <= 0 )
    {
        return;
    }
    
    $("#map_id").val( '' );    
    
    currentMapID = new_map_id;
    
    $("#map_label").text( currentMapID );
    
    hasLoaded = true;
    
    GetPoints();
    
    clearTimeout( refreshTimeoutId );
    refreshTimeoutId = setTimeout( GetPoints, currentRefreshInterval );
    
    ToggleUnloadMapButton();

}

function MapIDKeyPress(e)
{
    var id_text = $("#map_id").val();
    
    if( id_text.length > 15 )
    {
        $("#map_id").val( id_text.slice(0,15) );
    }
    
}

function UnloadMapClick(e)
{
    ClearAllPoints();
    clearTimeout( refreshTimeoutId );
    currentMapID = '';
    ToggleUnloadMapButton();
    $("#map_label").text( NO_LOADED_MAP_LABEL );
}

function ToggleUnloadMapButton()
{
    if( currentMapID.length <= 0 )
    {
        $("#map_unload_button").attr( 'disabled', true );
    }
    else
    {
        $("#map_unload_button").attr( 'disabled', false );
    }
}

function ShowLinkClick(e)
{
    if( currentMapID.length <= 0 )
    {
        return;
    }
    
    var coords = MouseCoords(e);
    
    var popup = $("<div>", {
        class:"url_popup",
        text:"ne.arthurwut.com/?m="+encodeURIComponent(currentMapID),
    });
    
    $(popup).css( { left:coords.x-5, top:coords.y-5 } );
    
    $(popup).mouseout( function(e){
        $(this).fadeOut( 400, function(e){
            $(this).remove();
        });
    });
    
    $("body").append( popup );
}

function DocumentKeypress(e)
{
    switch( e.charCode )
    {
        case 13:
            $("#map_load_button").trigger( 'click' );
        break;
    }
}

function DocumentMouseMove(e)
{
    var coords = MouseCoords(e);
    log( coords.x + " : " + coords.y );
}

function Init()
{
    $("#map_label").text( NO_LOADED_MAP_LABEL );
}

function MouseCoords(ev){
	// from http://www.webreference.com/programming/javascript/mk/column2/
	if(ev.pageX || ev.pageY){
		return {x:ev.pageX, y:ev.pageY};
	}
	return {
		x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
		y:ev.clientY + document.body.scrollTop  - document.body.clientTop
	};
}

function BindEvents()
{
    $("#background_range").change( BackgroundRangeChange );
    $("#map_range").change( MapOpacityRangeChange );
    $(".map_image").click( MapClick );
    $("#map_generate_button").click( GenerateMapIDClick );
    $("#map_load_button").click( LoadMapClick );
    $("#map_unload_button").click( UnloadMapClick );
    $("#map_id").keypress( MapIDKeyPress );
    $(document).keypress( DocumentKeypress );
    //$(document).mousemove( DocumentMouseMove );
    $("#map_link_button").click( ShowLinkClick );
}

$(document).ready( function(e){
    Init();
    BindEvents();
    LoadMapClick();
});










// EOF