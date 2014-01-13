// Global JS for mapper
// Arthur Wuterich
// 1-9-14

// Logging abstraction
log = function(msg)
{
    console.log(msg);
};

// Webmapper: Defines the methods and variables required for the webmapper application
var webMapper = 
{

    // Constants
    NO_LOADED_MAP_LABEL:'No Loaded Map',
    MAX_REFRESH_INTERVAL:10000,
    MIN_REFRESH_INTERVAL:500,
    REFRESH_INTERVAL_STEP:500,
    CLIENT_IP:'',    
    ID:'',

    // Application Variables
    currentMapID:'',
    currentPassphrase:'',
    drawingTool:0,
    
    // State Flags
    admin:false,    
    hasLoaded:false,
    isLoading:false,
    
    // Refresh Timer Variables
    refreshTimeoutId:null,
    currentRefreshInterval:0,
    lastCheckedTime:1,

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
        var post = { 'ajax_request':'get_points', 'time':time, 'map':webMapper.currentMapID };
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
                    webMapper.currentRefreshInterval += webMapper.REFRESH_INTERVAL_STEP;
                }
                else if( pointsAdded )
                {
                   webMapper.currentRefreshInterval = webMapper.MIN_REFRESH_INTERVAL;
                }
                
                clearTimeout( webMapper.refreshTimeoutId );
                webMapper.refreshTimeoutId = setTimeout( webMapper.GetPoints, webMapper.currentRefreshInterval );            
                
            }
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
    {
        if( webMapper.currentMapID.length <= 0 )
        {
            $("#map").fadeOut();
        }
        else
        {
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
                webMapper.CloseOptionsMenu( this );
            });
        }
        
        $("body").append( popup );

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

    // Returns the class associated with the tool
    //  tool: Tool to request id, if undefined will return the current drawing tools class
    GetToolClass : function( tool )
    {
        
        if( tool == undefined )
        {
            tool = webMapper.drawingTool;
        }
        
        var output = '';
        
        // Get the class for the tool *** REFACTOR ***
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

    // Alters the example point and sets the internal drawing state to the desired tool
    PointTypeChange : function(e)
    {
        // Set drawing tool state
        webMapper.drawingTool = parseInt($("#point_type").val());
        
        // Set the example point
        $("#example_point").removeClass();
        $("#example_point").addClass("point "+ webMapper.GetToolClass( webMapper.drawingTool ));    
        
    },

    // Binds events for the web application and general mapper related functions
    BindEvents : function()
    {
        // Map event handlers
        $(".map_image").click( webMapper.MapClick ); // Generates points
        $(document).keypress( webMapper.DocumentKeypress ); // Redirects the enter key to load map

        // Admin Menu
        $("#map_admin").click( webMapper.AdminClick );
        
        // Toolbar Load Button
        $("#map_load_button").click( webMapper.LoadMapClick );  
        
        // Map Menu
        $("#map_maps").click( webMapper.MapMenuClick ); 
        $("#map_generate_button").click( webMapper.GenerateMapIDClick );           
        $("#map_unload_button").click( webMapper.UnloadMapClick );
        $("#map_link_button").click( webMapper.ShowLinkClick );        
        
        // Drawing Tools Menu
        $("#map_tools").click( webMapper.MapToolsClick );        
        $("#point_color").change( webMapper.ColorSelectorChange );
        $("#point_type").change( webMapper.PointTypeChange );
        
        // Options Menu
        $("#map_options").click( webMapper.OptionsClick ); 
        $("#background_range").change( webMapper.BackgroundRangeChange );
        $("#map_range").change( webMapper.MapOpacityRangeChange );        
    },
    
    // Inits the application, binds event handlers
    Init : function()
    {      
        $(document).ready( function(e){
        
            // Get the IP from the index form
            webMapper.CLIENT_IP = CLIENT_IP;
            CLIENT_IP = undefined;
            
            // Get the instance ID from the web form
            webMapper.ID = ID;
            ID = undefined;
            
            // Remove sections of the DOM
            $(".REMOVE_ON_LOAD").remove();

            // Hide sections of the UI that are dynamically shown
            $("#map").hide();
            $("#map_admin").hide();
            $("#drawing_tools").hide();
            $("#options_menu").hide();
            $("#map_menu").hide();
            
            webMapper.BindEvents();
            webMapper.LoadMapClick();            
        });        
    },    

};

webMapper.Init();







// EOF