// Global JS for mapper
// Arthur Wuterich
// 1-9-14

<<<<<<< HEAD
log = function(msg)
=======
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
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978
{
    console.log(msg);
};

var webMapper = 
{

<<<<<<< HEAD
    // Constants
    NO_LOADED_MAP_LABEL:'No Loaded Map',
    MAX_REFRESH_INTERVAL:10000,
    MIN_REFRESH_INTERVAL:500,

    // State Variables
    currentMapID:'',
    currentPassphrase:'',
    drawingTool:0,
    admin:false,
    ID:'',
    CLIENT_IP:'',

    // Application Variables
    lastCheckedTime:1,
    hasLoaded:false,
    isLoading:false,
    refreshTimeoutId:null,
    currentRefreshInterval:500,
    refreshIntervalStep:500,
    mapIdPopup:null,

    BackgroundRangeChange : function(e)
    {
        var bg_intensity = $(e.target).val();
        $("body").css( { "background-color":"rgb("+bg_intensity+","+bg_intensity+","+bg_intensity+")" } );
    },

    MapOpacityRangeChange : function(e)
    {
        var opacity = $(e.target).val() / 100.0;
        $("#map .map_image").css( { "opacity":opacity } );
    },

    MapClick : function(e)
=======
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
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978
    {
        // Don't attempt to add points if there is not map
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        webMapper.CloseAllMenus();    
        
        var posX = $(this).offset().left,
            posY = $(this).offset().top;
        webMapper.AddRelativePoint( (e.pageX - posX), (e.pageY - posY), "#"+$("#point_color").val(), webMapper.drawingTool );
    },

    AddRelativePoint : function(x,y,color,tool)
    {
        var mapWidth = $("#map .map_image").width();
        var mapHeight = $("#map .map_image").outerHeight();
        webMapper.AddPoint( ( x / mapWidth ) * 100 , ( y / mapHeight ) * 100, color, webMapper.tool );
    },

    AddPoint : function(x,y,color,tool,sId)
    {

        if( webMapper.ID == webMapper.sId && !webMapper.hasLoaded )
        {
            return false;
        }
        
        var pointWrapper = $("<div>",{
            class:'point_wrapper',
        });
        
        $(pointWrapper).css( { "left":x+"%", "top":y+"%" } );    

        var point = $("<div>",{
            class:'point ' + webMapper.GetToolClass( tool ),
        });
        
        $(point).css( { "background-color":color } );
        
        $(pointWrapper).append(point);
        
        $("#map .map_image").append( pointWrapper );    
        
        if( sId == undefined )
        {
                
            // Send AJAX call to add point to DB
            var post = { 'ajax_request':'save_point', 'x':x, 'y':y, 'user_id':webMapper.ID, 'color':color, 'map':webMapper.currentMapID, 'tool':tool };
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
    },

    GetPoints : function( time )
    {
        // If no map is loaded don't do anything
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Save the current map id to local space
        var current_map_id = webMapper.currentMapID;
        
        if( time == undefined || time == 0 )
        {
            if( webMapper.lastCheckedTime == 1 )
            {
                time = 1;
            }
            else
            {
                time = webMapper.lastCheckedTime-1;
            }
        }
            
        // Send AJAX call to add point to DB
<<<<<<< HEAD
        var post = { 'ajax_request':'get_points', 'time':time, 'map':webMapper.currentMapID };
=======
        var post = { 'ajax_request':'save_point', 'x':x, 'y':y, 'user_id':id, 'color':color, 'map':currentMapID, 'tool':tool };
        log( post );
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978
            $.post(
            "/ne/",
            post,
            function(data) {
            
                var pointsAdded = false;
                
                // Check to see if the old map id and the new map id are different; if this is the case then don't add the points
                // also don't add points is the application is currently loading a map
                if( current_map_id != webMapper.currentMapID || webMapper.isLoading )
                {
                    return;
                }                 
                
                log( data );
                var result = jQuery.parseJSON( data );

                // Check to make sure that this is the current map
                if( result.map != webMapper.currentMapID )
                {
                    return
                }
                
                webMapper.lastCheckedTime = result.time;
                
                // Add each point
                for( Point in result.points )
                {
                    if( webMapper.AddPoint( result.points[Point].x, result.points[Point].y, result.points[Point].color, result.points[Point].tool, result.points[Point].user_id ) )
                    {
                        pointsAdded = true;
                    }
                }
                
                webMapper.hasLoaded = false;
                
                if( !pointsAdded && webMapper.currentRefreshInterval < webMapper.MAX_REFRESH_INTERVAL )
                {
                    webMapper.currentRefreshInterval += webMapper.refreshIntervalStep;
                }
                else if( pointsAdded )
                {
                   webMapper.currentRefreshInterval = webMapper.MIN_REFRESH_INTERVAL;
                }
                
                clearTimeout( webMapper.refreshTimeoutId );
                webMapper.refreshTimeoutId = setTimeout( webMapper.GetPoints, webMapper.currentRefreshInterval );            
                
            }
<<<<<<< HEAD
        );    
        
    },

    ClearAllPoints : function()
    {
        $("#map .point_wrapper").remove();
    },

    GenerateMapIDClick : function(e)
    {
        var gen_id = MD5( new Date().getTime().toString() ).slice(0,16);
        $("#map_id").val( gen_id );
    },

    LoadMapClick : function()
    {
        if( webMapper.refreshTimeoutId != null )
        {
            clearTimeout( webMapper.refreshTimeoutId );
        }
        
        var new_map_id = $("#map_id").val();
        var map_passphrase = $("#map_passphrase").val();    
        
        if( new_map_id.length <= 0 )
        {
            return;
        }    
        
        webMapper.ClearAllPoints();
        webMapper.CloseAllMenus();
        webMapper.lastCheckedTime = 1;
        
        // Send AJAX call to access the map requested
        var post = { 'ajax_request':'load_map', 'map':new_map_id, 'ip':webMapper.CLIENT_IP, 'passphrase':map_passphrase };
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
                    webMapper.currentMapID = data.map_key;
                    webMapper.currentPassphrase = data.passphrase;
                    webMapper.admin = data.admin;
                    $("#map_label").text( webMapper.currentMapID );
                    webMapper.hasLoaded = true;
                    webMapper.GetPoints();
                    
                    webMapper.ToggleMapLinkButton();
                    webMapper.ToggleUnloadMapButton();
                    webMapper.ToggleMapLinkButton();
                    webMapper.ToggleAdminButton();
                    webMapper.ToggleMap();
                    
                }
                else
                {
                    webMapper.UnloadMapClick();
                }
            }
        );     
    },

    MapIDKeyPress : function(e)
    {
        var id_text = $("#map_id").val();
        
        if( id_text.length > 15 )
        {
            $("#map_id").val( id_text.slice(0,15) );
        }
        
    },

    UnloadMapClick : function(e)
    {
        webMapper.ClearAllPoints();
        clearTimeout( webMapper.refreshTimeoutId );
        webMapper.currentMapID = '';
        webMapper.currentPassphrase = '';
        webMapper.admin = false;
        webMapper.ToggleUnloadMapButton();
        webMapper.ToggleMapLinkButton();
        webMapper.ToggleAdminButton();
        webMapper.ToggleMap();
    },

    ToggleUnloadMapButton : function()
    {
        if( webMapper.currentMapID.length <= 0 )
        {
            $("#map_unload_button").attr( 'disabled', true );
        }
        else
        {
            $("#map_unload_button").attr( 'disabled', false );
        }
    },

    ToggleMapLinkButton : function()
    {
        if( webMapper.currentMapID.length <= 0 )
        {
            $("#map_link_button").attr( 'disabled', true );
        }
        else
        {
            $("#map_link_button").attr( 'disabled', false );
        }
    },

    ToggleLoadMapButton : function()
    {
        if( $("#map_id").val() <= 0 )
        {
            $("#map_load_button").attr( 'disabled', true );
        }
        else
        {
            $("#map_load_button").attr( 'disabled', false );
        }
    },

    ToggleAdminButton : function()
    {
        if( !webMapper.admin )
        {
            $("#map_admin").fadeOut();
        }
        else
        {
            $("#map_admin").fadeIn();
        }
    },

    ToggleMap : function()
=======
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
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978
    {
        if( webMapper.currentMapID.length <= 0 )
        {
            $("#map").fadeOut();
        }
        else
        {
<<<<<<< HEAD
            $("#map").fadeIn();
        }    
    },

    ShowLinkClick : function(e)
    {
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        var coords = webMapper.MouseCoords(e);
        
        var msg = $("<div>", {
            text:"http://ne.arthurwut.com/?m="+encodeURIComponent(webMapper.currentMapID)+"&p="+encodeURIComponent(webMapper.currentPassphrase),
        });
                
        webMapper.CreateOptionsMenu( coords.x-5, coords.y-5, msg );
    },

    DocumentKeypress : function(e)
    {
        switch( e.charCode )
        {
            case 13:
                $("#map_load_button").trigger( 'click' );
            break;
        }
    },

    DocumentMouseMove : function(e)
    {
        var coords = MouseCoords(e);
        log( coords.x + " : " + coords.y );
    },

    Init : function()
    {
        $(document).ready( function(e){
            $("#map").hide();
            $("#map_admin").hide();
            $("#drawing_tools").hide();
            $("#options_menu").hide();
            $("#map_menu").hide();
            
            webMapper.CLIENT_IP = CLIENT_IP;
            CLIENT_IP = null;
            
            webMapper.ID = ID;
            ID = '';
            
            webMapper.BindEvents();
            webMapper.LoadMapClick();
        });        
    },

    MouseCoords : function(ev){
        // from http://www.webreference.com/programming/javascript/mk/column2/
        if(ev.pageX || ev.pageY){
            return {x:ev.pageX, y:ev.pageY};
        }
        return {
            x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y:ev.clientY + document.body.scrollTop  - document.body.clientTop
        };
    },

    CreateOptionsMenu : function( x, y, objects, removeOnExit )
    {
        var popup = $("<div>", {
            class:"popup",
        });
        
        if( $.isArray( objects ) )
        {
            for( obj in objects )
            {
                $(popup).append( obj );
=======
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
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978
            }
            else if( pointsAdded )
            {
               currentRefreshInterval = MIN_REFRESH_INTERVAL;
            }
            
            clearTimeout( refreshTimeoutId );
            refreshTimeoutId = setTimeout( GetPoints, currentRefreshInterval );            
            
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

<<<<<<< HEAD
        return popup;
    },

    CloseOptionsMenu : function( menu, force )
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
    },

    CloseAllMenus : function()
    {
        $("#options_menu").hide();
        $("#admin_menu").hide();
        $("#drawing_tools").hide();
        $("#map_menu").hide();
    },

    ToggleVisibility : function( obj )
    {
        if( $(obj).is(":visible") )
        {
            $(obj).hide();
        }
        else
        {
            $(obj).show();
        }
    },

    MapToolsClick : function(e)
    {
        $("#options_menu").hide();
        $("#admin_menu").hide();
        
        webMapper.ToggleVisibility( "#drawing_tools" );
    },

    OptionsClick : function(e)
    {
        $("#drawing_tools").hide();
        $("#admin_menu").hide();
        
        webMapper.ToggleVisibility( $("#options_menu") );
    },

    AdminClick : function(e)
    {
        $("#drawing_tools").hide();
        $("#options_menu").hide();
        
        webMapper.ToggleVisibility( $("#admin_menu") );
    },

    MapMenuClick : function(e)
    {
        webMapper.ToggleVisibility( $("#map_menu") );
    },

    ColorSelectorChange : function(e)
    {
        $("#example_point").css( { 'background-color':$("#point_color").val() } );
    },

    GetToolClass : function( tool )
    {

        if( tool == undefined )
        {
            tool = webMapper.drawingTool;
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

    },

    PointTypeChange : function(e)
    {
        webMapper.drawingTool = parseInt($("#point_type").val());
        
        $("#example_point").removeClass();
        
        $("#example_point").addClass("point "+ webMapper.GetToolClass( webMapper.drawingTool ));    
        
    },

    BindEvents : function()
    {
        $("#background_range").change( webMapper.BackgroundRangeChange );
        $("#map_range").change( webMapper.MapOpacityRangeChange );
        $(".map_image").click( webMapper.MapClick );
        $("#map_generate_button").click( webMapper.GenerateMapIDClick );
        $("#map_load_button").click( webMapper.LoadMapClick );
        $("#map_unload_button").click( webMapper.UnloadMapClick );
        $("#map_id").keypress( webMapper.MapIDKeyPress );
        $(document).keypress( webMapper.DocumentKeypress );
        $("#map_link_button").click( webMapper.ShowLinkClick );
        $("#point_color").change( webMapper.ColorSelectorChange );
        
        $("#map_tools").click( webMapper.MapToolsClick );
        $("#map_options").click( webMapper.OptionsClick );
        $("#map_admin").click( webMapper.AdminClick );
        $("#map_maps").click( webMapper.MapMenuClick );
        
        $("#point_type").change( webMapper.PointTypeChange );
        
        
    },

};

webMapper.Init();
=======
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
>>>>>>> 675bd4f4786bf0140a6a324612845e1970017978

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