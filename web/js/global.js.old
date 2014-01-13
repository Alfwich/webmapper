// Global JS for mapper
// Arthur Wuterich
// 1-9-14

// Constants
var NO_LOADED_MAP_LABEL = 'No Loaded Map';
var MAX_REFRESH_INTERVAL = 10000;
var MIN_REFRESH_INTERVAL = 500;

// State Variables
var currentMapID = '';
var currentPassphrase = '';
var drawingTool = 0;
var admin = false;

// Application Variables
var lastCheckedTime = 1;
var hasLoaded = false;
var isLoading = false;
var refreshTimeoutId = null;
var currentRefreshInterval = MIN_REFRESH_INTERVAL;
var refreshIntervalStep = MIN_REFRESH_INTERVAL;
var mapIdPopup = null;

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
    $("#map .map_image").css( { "opacity":opacity } );
}

function MapClick(e)
{
    // Don't attempt to add points if there is not map
    if( currentMapID.length <= 0 )
    {
        return;
    }
    
    CloseAllMenus();    
    
    var posX = $(this).offset().left,
        posY = $(this).offset().top;
    AddRelativePoint( (e.pageX - posX), (e.pageY - posY), "#"+$("#point_color").val(), drawingTool );
}

function AddRelativePoint(x,y,color,tool)
{
    var mapWidth = $("#map .map_image").width();
    var mapHeight = $("#map .map_image").outerHeight();
    AddPoint( ( x / mapWidth ) * 100 , ( y / mapHeight ) * 100, color, tool );
}

function AddPoint(x,y,color,tool,sId)
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
        class:'point ' + GetToolClass( tool ),
    });
    
    $(point).css( { "background-color":color } );
    
    $(pointWrapper).append(point);
    
    $("#map .map_image").append( pointWrapper );    
    
    if( sId == undefined )
    {
            
        // Send AJAX call to add point to DB
        var post = { 'ajax_request':'save_point', 'x':x, 'y':y, 'user_id':id, 'color':color, 'map':currentMapID, 'tool':tool };
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
        
    // Send AJAX call to add point to DB
    var post = { 'ajax_request':'get_points', 'time':time, 'map':currentMapID };
        $.post(
        "/ne/",
        post,
        function(data) {
        
            var pointsAdded = false;
            
            // Check to see if the old map id and the new map id are different; if this is the case then don't add the points
            // also don't add points is the application is currently loading a map
            if( current_map_id != currentMapID || isLoading )
            {
                return;
            }                 
            
            log( data );
            var result = jQuery.parseJSON( data );

            // Check to make sure that this is the current map
            if( result.map != currentMapID )
            {
                return
            }
            
            lastCheckedTime = result.time;
            
            // Add each point
            for( Point in result.points )
            {
                if( AddPoint( result.points[Point].x, result.points[Point].y, result.points[Point].color, result.points[Point].tool, result.points[Point].user_id ) )
                {
                    pointsAdded = true;
                }
            }
            
            hasLoaded = false;
            
            if( !pointsAdded && currentRefreshInterval < MAX_REFRESH_INTERVAL )
            {
                currentRefreshInterval += refreshIntervalStep;
            }
            else if( pointsAdded )
            {
               currentRefreshInterval = MIN_REFRESH_INTERVAL;
            }
            
            clearTimeout( refreshTimeoutId );
            refreshTimeoutId = setTimeout( GetPoints, currentRefreshInterval );            
            
        }
    );    
    
}

function ClearAllPoints()
{
    $("#map .point_wrapper").remove();
}

function GenerateMapIDClick(e)
{
    var gen_id = MD5( new Date().getTime().toString() ).slice(0,16);
    $("#map_id").val( gen_id );
}

function LoadMapClick()
{
    if( refreshTimeoutId != null )
    {
        clearTimeout( refreshTimeoutId );
    }
    
    var new_map_id = $("#map_id").val();
    var map_passphrase = $("#map_passphrase").val();    
    
    if( new_map_id.length <= 0 )
    {
        return;
    }    
    
    ClearAllPoints();
    CloseAllMenus();
    lastCheckedTime = 1;
    
    // Send AJAX call to access the map requested
    var post = { 'ajax_request':'load_map', 'map':new_map_id, 'ip':CLIENT_IP, 'passphrase':map_passphrase };
        $.post(
        "/ne/",
        post,
        function(data) {
            log( data );
            var data = jQuery.parseJSON( data );
            if( data.code && data.code == 1 )
            {
                $("#map_id").val( '' );
                $("#map_passphrase").val( '' );
                currentMapID = data.map_key;
                currentPassphrase = data.passphrase;
                admin = data.admin;
                $("#map_label").text( currentMapID );
                hasLoaded = true;
                GetPoints();
                
                ToggleMapLinkButton();
                ToggleUnloadMapButton();
                ToggleMapLinkButton();
                ToggleAdminButton();
                ToggleMap();
                
            }
            else
            {
                UnloadMapClick();
            }
        }
    );     
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
    currentPassphrase = '';
    admin = false;
    ToggleUnloadMapButton();
    ToggleMapLinkButton();
    ToggleAdminButton();
    ToggleMap();
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

function ToggleMapLinkButton()
{
    if( currentMapID.length <= 0 )
    {
        $("#map_link_button").attr( 'disabled', true );
    }
    else
    {
        $("#map_link_button").attr( 'disabled', false );
    }
}

function ToggleLoadMapButton()
{
    if( $("#map_id").val() <= 0 )
    {
        $("#map_load_button").attr( 'disabled', true );
    }
    else
    {
        $("#map_load_button").attr( 'disabled', false );
    }
}

function ToggleAdminButton()
{
    if( !admin )
    {
        $("#map_admin").fadeOut();
    }
    else
    {
        $("#map_admin").fadeIn();
    }
}

function ToggleMap()
{
    if( currentMapID.length <= 0 )
    {
        $("#map").fadeOut();
    }
    else
    {
        $("#map").fadeIn();
    }    
}

function ShowLinkClick(e)
{
    if( currentMapID.length <= 0 )
    {
        return;
    }
    
    var coords = MouseCoords(e);
    
    var msg = $("<div>", {
        text:"http://ne.arthurwut.com/?m="+encodeURIComponent(currentMapID)+"&p="+encodeURIComponent(currentPassphrase),
    });
            
    CreateOptionsMenu( coords.x-5, coords.y-5, msg );
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
    $("#map").hide();
    $("#map_admin").hide();
    $("#drawing_tools").hide();
    $("#options_menu").hide();
    $("#map_menu").hide();
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

function CreateOptionsMenu( x, y, objects, removeOnExit )
{
    var popup = $("<div>", {
        class:"popup",
    });
    
    if( $.isArray( objects ) )
    {
        for( obj in objects )
        {
            $(popup).append( obj );
        }
    }
    else
    {
        $(popup).append( objects );
    }
    
    $(popup).css( { left:x, top:y } );
    
    if( removeOnExit == undefined )
    {
        $(popup).mouseleave( function(e){
            CloseOptionsMenu( this );
        });
    }
    
    $("body").append( popup );

    return popup;
}

function CloseOptionsMenu( menu, force )
{
    if( force == undefined )
    {
        $(menu).fadeOut( 400, function(e){
            $(this).remove();
        });
    }
    else
    {
        $(menu).remove();
    }
}

function CloseAllMenus()
{
    $("#options_menu").hide();
    $("#admin_menu").hide();
    $("#drawing_tools").hide();
    $("#map_menu").hide();
}

function ToggleVisibility( obj )
{
    if( $(obj).is(":visible") )
    {
        $(obj).hide();
    }
    else
    {
        $(obj).show();
    }
}

function MapToolsClick(e)
{
    $("#options_menu").hide();
    $("#admin_menu").hide();
    
    ToggleVisibility( "#drawing_tools" );
}

function OptionsClick(e)
{
    $("#drawing_tools").hide();
    $("#admin_menu").hide();
    
    ToggleVisibility( $("#options_menu") );
}

function AdminClick(e)
{
    $("#drawing_tools").hide();
    $("#options_menu").hide();
    
    ToggleVisibility( $("#admin_menu") );
}

function MapMenuClick(e)
{
    ToggleVisibility( $("#map_menu") );
}

function ColorSelectorChange(e)
{
    $("#example_point").css( { 'background-color':$("#point_color").val() } );
}

function GetToolClass( tool )
{

    if( tool == undefined )
    {
        tool = drawingTool;
    }

    var output = '';
    switch( parseInt(tool) )
    {
        case 0:
            output = "point_circle";        
        break;
        
        case 1:
        break;          
    }
    
    return output;

}

function PointTypeChange(e)
{
    drawingTool = parseInt($("#point_type").val());
    
    $("#example_point").removeClass();
    
    $("#example_point").addClass("point "+ GetToolClass( drawingTool ));    
    
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
    $("#map_link_button").click( ShowLinkClick );
    $("#point_color").change( ColorSelectorChange );
    
    $("#map_tools").click( MapToolsClick );
    $("#map_options").click( OptionsClick );
    $("#map_admin").click( AdminClick );
    $("#map_maps").click( MapMenuClick );
    
    $("#point_type").change( PointTypeChange );
    
    
}

$(document).ready( function(e){
    Init();
    BindEvents();
    LoadMapClick();
});










// EOF