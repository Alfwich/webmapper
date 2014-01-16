// Webmapper: Defines the methods and variables required for the webmapper application
// Arthur Wuterich
// 1/13/2014

var webMapper = 
{   
    // Constants
    NO_LOADED_MAP_LABEL:'No Loaded Map',
    MAX_REFRESH_INTERVAL:10000,
    MIN_REFRESH_INTERVAL:1000,
    REFRESH_INTERVAL_STEP:1000,
    CLIENT_IP:'',    
    ID:'',

    // Application Variables
    currentMapID:'',
    currentPassphrase:'',
    currentImageRatio:1,
    
    // Drawing state
    currentDrawingTool:0,
    currentSize:5,
    currentOutlineSize:1,
    currentFillColor:"FFF",
    currentOutlineColor:"000",
    
    // State Flags
    admin:false,    
    hasLoaded:false,
    isLoading:false,
    
    // Resize Timeout
    resizeTimeout:null,
    
    // Refresh Timer Variables
    refreshTimeoutId:null,
    currentRefreshInterval:0,
    lastCheckedTime:2,
    lastCheckedRequestTime:2,
    
    // Raphael SVG 
    canvas:null,
    exampleCanvas:null,
    
    // Tool classes
    toolClasses : {
        0:'point_circle',
        1:'', // Square is the default point type
    },
    
    // Alter the color of the body when the color range input is changed
    // Will modulate between white and black
    BackgroundRangeChange : function(e)
    {
        var bg_intensity = $(e.target).val();
        $("body").css( { "background-color":"rgb("+bg_intensity+","+bg_intensity+","+bg_intensity+")" } );
    },

    // Alter the opacity of the map when the opacity range input is changed
    MapOpacityRangeChange : function(e)
    {
        var opacity = $(e.target).val() / 100.0;
        $("#map .map_image").css( { "opacity":opacity } );
    },

    // When the user clicks on the map add a point on the user's mouse mosition
    MapClick : function(e)
    {
        // Don't attempt to add points if there is not map
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        webMapper.CloseAllMenus();    
        
        // Add the point
        var posX = $(this).offset().left,
            posY = $(this).offset().top;
        
        var point = {
            'x':(e.pageX - posX),
            'y':(e.pageY - posY),
            'color':webMapper.currentFillColor,
            'size':webMapper.currentSize,
            'tool':webMapper.currentDrawingTool,
            'outline':webMapper.currentOutlineColor,            
            'outline_size':webMapper.currentOutlineSize,
        };
                
        webMapper.AddRelativePoint( point );
    },
    
    // Adds a point to the map based on the position in pixels
    // x: x position of the point in pixels
    // y: y position of the point in pixels
    // color: Color of the point
    // tool: Tool class to add to the point
    AddRelativePoint : function( point )
    {
        var mapWidth = $("#map .map_image").width();
        var mapHeight = $("#map .map_image").outerHeight();
        
        point.x = point.x / mapWidth * 100;
        point.y = point.y / mapHeight * 100;
        webMapper.AddPoint( point );
    },

    // Adds a point to the currently loaded map
    // point: obj to describe point
    // [sId]: The creator's user id. If this is defined then the point will not be synced with the server
    //                               to prevent infinite loops
    AddPoint : function( point, sId )
    {        
        // If this point has been created by this user do not add it unless this is during the loading phase
        if( webMapper.ID == sId && !webMapper.hasLoaded )
        {
            return false;
        }
                
        webMapper.DrawPoint( point );
        
        // Save the point with the server if no user id is defined
        if( sId == undefined )
        {
            // Send AJAX call to add point to DB
            var post = { 'ajax_request':'save_point', 'user_id':webMapper.ID, 'map':webMapper.currentMapID, 'json':point };
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
    
    // Will draw a SVG point at the desired location and with desired tool and color
    DrawPoint : function( point, canvas )
    {       
        if( typeof canvas === 'undefined' )
        {
            canvas = webMapper.canvas;
        }
        
        // Convert size into int for calculations
        point.size = parseInt( point.size );
        
        // Add hash for colors
        if( typeof point.color !== 'undefined' )
        {
            point.color = "#"+point.color;
        }
        if( typeof point.outline !== 'undefined' )
        {
            point.outline = "#"+point.outline;
        }        
        
        switch( parseInt( point.tool ) )
        {
            case 0:
                // Dot
                canvas.circle( point.x+"%", point.y+"%", point.size ).attr( { "fill": point.color, 'stroke-width':point.outline_size, "stroke":point.outline } );
            break;
            
            case 1:
                // Square
                // Transforms to place in center
                canvas.rect( point.x+"%", point.y+"%", point.size, point.size ).attr( { "fill": point.color, 'stroke-width':point.outline_size, "stroke":point.outline } ).transform("t-"+(point.size/2)+",-"+(point.size/2));  
            break;
            
            case 2:
                // Rounded Square
                // Transforms to place in center
                point.size += 3;
                canvas.rect( point.x+"%", point.y+"%", point.size, point.size, point.size/4 ).attr( { "fill": point.color, 'stroke-width':point.outline_size, "stroke":point.outline } ).transform("t-"+(point.size/2)+",-"+(point.size/2)); 
            break;

            case 3:
                // Horizontal Line
                canvas.rect( "0%", point.y+"%", "100%", point.size ).attr( { "stroke":point.outline, 'fill':point.outline } ).transform( "t0,-"+(point.size/2) );
            break;

            case 4:
                // Vertical Line
                canvas.rect( point.x+"%", "0%", point.size, "100%" ).attr( { "stroke":point.outline, 'fill':point.outline } ).transform( "t-"+(point.size/2)+",0" );
            break;
            
            case 5:
                // Cross
                canvas.rect( "0%", point.y+"%", "100%", point.size ).attr( { "stroke":point.outline, 'fill':point.outline } ).transform( "t0,-"+(point.size/2) );
                canvas.rect( point.x+"%", "0%", point.size, "100%" ).attr( { "stroke":point.outline, 'fill':point.outline } ).transform( "t-"+(point.size/2)+",0" );
            break;             

            case 6:
                // Circle
                canvas.circle( point.x+"%", point.y+"%", point.size ).attr( { "stroke": point.outline, 'stroke-width':point.outline_size, } );              
            break;            
        }
    },
    
    // Will perform a request on the client
    // Returns true if the poll server function should exit
    ExecuteRequest : function( request )
    {
        var exitOnComplete = false;
        switch( request )
        {
            case 0:
                webMapper.ClearAllPoints();
            break;
            
            case 1:
                webMapper.ReloadMapImage();
            break;
        }
        
        return exitOnComplete;
    
    },
    
    // Will reload the map image url
    ReloadMapImage : function()
    {
        // If no map is loaded don't do anything
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Send AJAX call to db
        var post = { 'ajax_request':'get_map_image_url', 'map':webMapper.currentMapID, 'passphrase':webMapper.currentPassphrase };
            $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
                data = jQuery.parseJSON( data );
                
                webMapper.SetMapImage( data.image_url );
            
            }
        );
    },

    // Will connect to the web server and retrieve any new points and requests
    // time: Cutoff time for acquiring points
    PollServer : function( time )
    {
        // If no map is loaded don't do anything
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Save the current map id to local space
        var current_map_id = webMapper.currentMapID;
        
        // Set the time to the last checked time if not specified ( or 0 )
        if( time == undefined || time == 0 )
        {
            time = webMapper.lastCheckedTime-1;
        }
            
        // Send AJAX call to add point to DB
        var post = { 'ajax_request':'poll_server', 'time':time, 'request_time': webMapper.lastCheckedRequestTime, 'map':webMapper.currentMapID };
            $.post(
            "/ne/",
            post,
            function(data) {
                log( data );            
                var pointsAdded = false;
                
                // Check to see if the old map id and the new map id are different; if this is the case then don't add the points
                // also don't add points is the application is currently loading a map
                if( current_map_id != webMapper.currentMapID || webMapper.isLoading )
                {
                    return;
                }                 
                
                var result = jQuery.parseJSON( data );

                // Check to make sure that this is the current map
                if( result.map != webMapper.currentMapID )
                {
                    return
                }
                
                // If the server responds with a request execute the request
                if( typeof result.request !== 'undefined' )
                {
                    // If the request is an array execute all of the commands
                    if( $.isArray( result.request ) )
                    {
                        for( var r in result.request )
                        {
                            if( webMapper.ExecuteRequest( result.request[r] ) )
                            {
                                return;
                            }
                        }
                    }
                    
                    webMapper.lastCheckedRequestTime = result.time;                    
                }
                
                webMapper.lastCheckedTime = result.time;
                
                // Add each point
                for( Point in result.points )
                {
                    if( webMapper.AddPoint( result.points[Point].json, result.points[Point].user_id ) )
                    {
                        pointsAdded = true;
                    }
                }
                
                // If no points were added and the current refresh interval is less than the max interval increase the refresh interval
                if( !pointsAdded && webMapper.currentRefreshInterval < webMapper.MAX_REFRESH_INTERVAL )
                {
                    webMapper.currentRefreshInterval += webMapper.REFRESH_INTERVAL_STEP;
                }
                // If points were added then reset the refresh interval to its lowest state
                else if( pointsAdded )
                {
                   webMapper.currentRefreshInterval = webMapper.MIN_REFRESH_INTERVAL;
                }
                
                // If a new admin request time is sent set to the new value
                if( typeof result.requestTime !== 'undefined' )
                {
                    webMapper.lastCheckedRequestTime = result.requestTime;
                }
                
                // Make sure than the refresh timeout is unset and reset to the new refresh interval
                clearTimeout( webMapper.refreshTimeoutId );
                webMapper.refreshTimeoutId = setTimeout( webMapper.PollServer, webMapper.currentRefreshInterval );
                
                // Set loading state
                webMapper.hasLoaded = false;                
                
            }
        );    
        
    },

    // Removes all of the points from the map
    ClearAllPoints : function()
    {
        if( webMapper.canvas == null )
        {
            return;
        }
        
        webMapper.canvas.clear();
    },

    // Generates a random id for the map_id
    GenerateMapIDClick : function(e)
    {
        var gen_id = MD5( new Date().getTime().toString() ).slice(0,16);
        $("#map_id").val( gen_id );
        
        webMapper.ToggleLoadMapButton();
    },

    // Will attempt to load the map_id in the map_id text field. 
    // Optionaly if a passphrase is provided this will be checked against the database.
    //  If the passphrase is incorrect the application will prevent loading the map
    LoadMapClick : function()
    {
        // If there is currently a map loaded stop the refresh timeout
        if( webMapper.refreshTimeoutId != null )
        {
            clearTimeout( webMapper.refreshTimeoutId );
        }
        
        // Acquire the new map_id and the optional passphrase
        var new_map_id = $("#map_id").val();
        var map_passphrase = $("#map_passphrase").val();    
        
        // If the map_id is empty exit
        if( new_map_id.length <= 0 )
        {
            return;
        }    
        
        // Reset the map is needed
        webMapper.ClearAllPoints();
        webMapper.CloseAllMenus();
        
        // Reset the checked time to get all of the points
        webMapper.lastCheckedTime = 2;
        webMapper.lastCheckedRequestTime = 2;
        
        // Send AJAX call to access the map requested
        var post = { 'ajax_request':'load_map', 'map':new_map_id, 'ip':webMapper.CLIENT_IP, 'passphrase':map_passphrase };
        $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
                var data = jQuery.parseJSON( data );
                
                // If the code is 1 then the user has rights to this map
                if( typeof data.code != undefined && data.code == 1 )
                {
                    // Reset inputs
                    $("#map_id").val( '' );
                    $("#map_passphrase").val( '' );
                    
                    webMapper.ToggleLoadMapButton();
                    
                    
                    // Set state variables
                    webMapper.currentMapID = data.map_key;
                    webMapper.currentPassphrase = data.passphrase;
                    webMapper.admin = data.admin;
                    webMapper.hasLoaded = true;
                    
                    // Set UI state
                                        
                    webMapper.ToggleMapMenuButtons();
                    webMapper.ToggleAdminButton();
                    webMapper.ToggleMap();
                    document.title = 'Mapper: ' + data.map_key;
                    
                    // Set map image
                    webMapper.SetMapImage( data.image_url );                    
                    
                    // Init point timeout
                    webMapper.PollServer();
                }
                // Execute the unload map click
                else
                {
                    webMapper.UnloadMapClick();
                }
            }
        );     
    },
        
    SetMapImage : function( image_url, dontSetText )
    {
        if( typeof image_url === 'string' && ( image_url.indexOf("http://") != -1 || image_url.indexOf("https://") != -1 ) )
        {
            var img = new Image();
            img.name = "bg_img";
            img.onload = webMapper.SetMapImageOnLoad;
            img.src = image_url;
            img.onerror = webMapper.SetDefaultImageError;
            
            $("#map .map_image").css( { 'background-image' : 'url("http://arthurwut.com/ne/image/loading.jpg")' } );
            
            if( typeof dontSetText === 'undefined' )
            {
                $("#map_admin_background_url").val( '' );
            }
        }
        else
        {
            $("#map .map_image").css( 'background-image', '' );
            
            if( typeof dontSetText === 'undefined' )
            {
                $("#map_admin_background_url").val( '' );
            }
        }
    },
    
    SetMapImageOnLoad : function(e)
    {
        webMapper.currentImageRatio = this.width / this.height;
        $("#map .map_image").css( { 'background-image':"url('" + this.src + "')" } );
        $("#map_admin_background_url").val( this.src );
        webMapper.ResizeMap();
    },
    
    SetDefaultImageError : function(e)
    {
        webMapper.SetMapImage( 'http://arthurwut.com/ne/image/error.jpg', true );
    },
    
    // Will reload the current map if there is one loaded
    ReloadMap : function()
    {
        $("#map_id").val( webMapper.currentMapID );
        $("#map_passphrase").val( webMapper.currentPassphrase );
        webMapper.lastCheckedTime = 2;
        webMapper.lastCheckedRequestTime = 2;
        
        webMapper.LoadMapClick();
    },

    // Unloads the current map and restores the application to its default state
    UnloadMapClick : function(e)
    {
        // Clear the refresh timer
        clearTimeout( webMapper.refreshTimeoutId );
        
        // Alter state of the application variables
        webMapper.currentMapID = '';
        webMapper.currentPassphrase = '';
        webMapper.admin = false;
        webMapper.currentRefreshInterval = webMapper.MIN_REFRESH_INTERVAL;
        
        // Reset UI
        document.title = 'Mapper';
        webMapper.ClearAllPoints();
        webMapper.ToggleMapMenuButtons();
        webMapper.ToggleAdminButton();
        webMapper.ToggleMap();
    },
    
    ToggleMapMenuButtons : function(e)
    {
        var flag = webMapper.currentMapID.length <= 0;
        
        webMapper.ToggleDisables( $("#map_unload_button"), flag );
        webMapper.ToggleDisables( $("#map_reload_button"), flag );
        webMapper.ToggleDisables( $("#map_clear_points"), flag );
        webMapper.ToggleDisables( $("#map_link_button"), flag );
    },
    
    ToggleDisables : function( obj, condition )
    {
        if( typeof obj === 'undefined' )
        {
            return;
        }
        
        if( typeof condition === 'undefined' )
        {
            condition = obj.is(":disabled");
        }
        
        if( condition )
        {
            obj.attr( 'disabled', true );
        }
        else
        {
            obj.attr( 'disabled', false );
        }
    },    
    
    // Toggles the visibility of the admin button
    ToggleAdminButton : function()
    {
        if( !webMapper.admin )
        {
            $("#map_admin").fadeOut();
            $("#map_admin_background_url").val('');
        }
        else
        {
            $("#map_admin").fadeIn();
        }
    },
    
    // Toggles the load map button to only be clickable when there is text in the map_id text field
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

    // Toggles the visibility of the map
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

    // Will generate a dynamic menu at the cursor position with a link to the current map
    ShowLinkClick : function(e)
    {
        // Exit if there is no map loaded
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Get the position and message div
        var coords = webMapper.MouseCoords(e);
        var msg = $("<div>", {
            text:"http://ne.arthurwut.com/?m="+encodeURIComponent(webMapper.currentMapID)+"&p="+encodeURIComponent(webMapper.currentPassphrase),
        });
        
        // Create the menu
        webMapper.CreateOptionsMenu( coords.x-5, coords.y-5, msg );
    },

    // Key press for application
    DocumentKeypress : function(e)
    {
        switch( e.charCode )
        {
            case 13:
                $("#map_load_button").trigger( 'click' );
            break;
        }
        
        
    },
    
    // Mouse move for application
    DocumentMouseMove : function(e)
    {
        // If this mouse has moved reset the refresh timer if it is not below two increase iterations
        // and immediatly query the server for new points
        if( webMapper.currentRefreshInterval > webMapper.MIN_REFRESH_INTERVAL + webMapper.REFRESH_INTERVAL_STEP*2 )
        {
            webMapper.currentRefreshInterval = webMapper.MIN_REFRESH_INTERVAL;
            clearTimeout( webMapper.refreshTimeoutId );
            webMapper.PollServer();
        }
        
    },

    // Returns an object with the current mouse position
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

    // Will create an dynamic options menu
    // x: The x position of the menu
    // y: The y position of the menu
    // objects: Will add all of the objects contained in this array to the menu.
    //          If objects is not an array it will add objects to the menu
    // [removeOnExit]: If defined will bind a handler to close the menu on mouse exit
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

    // Will close a dynamically generated options menu
    CloseOptionsMenu : function( menu, force )
    {
        // Animate the closure
        if( force == undefined )
        {
            $(menu).fadeOut( 400, function(e){
                $(this).remove();
            });
        }
        // Instantly close the menu
        else
        {
            $(menu).remove();
        }
    },

    // Closes all of the possible menus
    CloseAllMenus : function()
    {
        $("#options_menu").hide();
        $("#admin_menu").hide();
        $("#drawing_tools").hide();
        $("#map_menu").hide();
    },

    // Toggles the visibility of an object
    ToggleVisibility : function( obj )
    {
        if( $(obj).is(":visible") )
        {
            $(obj).fadeOut( 200 );
        }
        else
        {
            $(obj).fadeIn( 200 );
        }
    },
    
    // Open the tools menu when the tools button is clicked
    MapToolsClick : function(e)
    {
        $("#options_menu").hide();
        $("#admin_menu").hide();
        $("#map_menu").hide();           
        
        webMapper.ToggleVisibility( "#drawing_tools" );
    },

    // Open the options menu when the options button is clicked
    OptionsClick : function(e)
    {
        $("#drawing_tools").hide();
        $("#admin_menu").hide();
        $("#map_menu").hide();           
        
        webMapper.ToggleVisibility( $("#options_menu") );
    },
    
    // Open the admin menu when the admin button is clicked
    AdminClick : function(e)
    {
        $("#drawing_tools").hide();
        $("#options_menu").hide();
        $("#map_menu").hide();           
        
        webMapper.ToggleVisibility( $("#admin_menu") );
    },

    // Open the map menu when the map button is clicked
    MapMenuClick : function(e)
    {
        $("#options_menu").hide();    
        $("#drawing_tools").hide();
        $("#admin_menu").hide();     
        webMapper.ToggleVisibility( $("#map_menu") );
    },
    
    // Will empty the eample point canvas
    ClearExamplePoint : function()
    {
        webMapper.exampleCanvas.clear();
    },
    
    DrawExamplePoint : function()
    {
        var point = {
            'x':50,
            'y':50,
            'color':webMapper.currentFillColor,
            'outline':webMapper.currentOutlineColor,
            'size':webMapper.currentSize,
            'tool':webMapper.currentDrawingTool,
            'outline':webMapper.currentOutlineColor,
            'outline_size':webMapper.currentOutlineSize,
        };
        
        webMapper.DrawPoint( point, webMapper.exampleCanvas );
    },

    // Change the example point's fill color when the fill color is changed
    FillColorSelectorChange : function(e)
    {
        webMapper.currentFillColor = $("#fill_color").val();
        webMapper.ClearExamplePoint();
        webMapper.DrawExamplePoint();
    },
    
    // Change the example point's outline color when outline color is changed
    OutlineColorSelectorChange : function(e)
    {
        webMapper.currentOutlineColor = $("#outline_color").val();
        webMapper.ClearExamplePoint();
        webMapper.DrawExamplePoint();        
    },
    
   SizeChange : function(e)
    {
        webMapper.currentSize = $("#size_range").val();
        webMapper.ClearExamplePoint();
        webMapper.DrawExamplePoint();     
    },

    OutlineSizeChange : function(e)
    {
        webMapper.currentOutlineSize = $("#outline_size_range").val();
        webMapper.ClearExamplePoint();
        webMapper.DrawExamplePoint();       
    },

    // Returns the class associated with the tool
    //  tool: Tool to request id, if undefined will return the current drawing tools class
    GetToolClass : function( tool )
    {
        
        if( tool == undefined )
        {
            tool = webMapper.currentDrawingTool;
        }
        
        // Return the tool class or an empty string is not defined
        return webMapper.toolClasses[tool]!=undefined?webMapper.toolClasses[tool]:'';

    },
    
    // Will send a request to delete all points for this current map
    DeleteAllPointsRequest : function(e)
    {
        // Don't do anything if there is not a loaded map
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Send clear request for the current map
        var post = { 'ajax_request':'admin_clear', 'map':webMapper.currentMapID, 'ip':webMapper.CLIENT_IP, 'passphrase':webMapper.currentPassphrase };
        $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
            }
        );    

        webMapper.ClearAllPoints();        
    },
    
    // Will send a request to set the current map image url
    SetBackgroundRequest : function(e)
    {
        // Don't do anything if there is not a loaded map
        if( webMapper.currentMapID.length <= 0 )
        {
            return;
        }
        
        // Send clear request for the current map
        var post = { 'ajax_request':'admin_set_map', 'map':webMapper.currentMapID, 'ip':webMapper.CLIENT_IP, 'passphrase':webMapper.currentPassphrase, 'map_url':$("#map_admin_background_url").val() };
        $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
            }
        );         
    },
    
    ResizeMap : function(e)
    {
        // Get the width to maintain the correct aspect ratio
        var desiredHeight = ( $(document).width() ) / webMapper.currentImageRatio;
        
        // If the height is going to place image below the window then adjust width
        if( desiredHeight + 50 > $(document).height() )
        {
            var desiredWidth = ( ($(document).height()-50) * webMapper.currentImageRatio );
            
            $("#map").width( desiredWidth );            
            $("#map").height( $(document).height()-50 );
            $("#map").css( { 'margin-left': ($(document).width()-desiredWidth)/2, 'margin-top':50 } );
        }
        else
        {
            $("#map").height( desiredHeight );
            $("#map").width( $(document).width() );
            $("#map").css( { 'margin-left': 0, 'margin-top': ( (($(document).height()+50)-desiredHeight)/2 ) } );
        }
    },
    
    DocumentResizeEvent : function(e)
    {
        clearTimeout( webMapper.resizeTimeout );
        webMapper.resizeTimeout = setTimeout( webMapper.ResizeMap, 100 );
    },
    
    ToolChange : function(e)
    {
        // Unselect all tool buttons
        var toolClasses = { 'dot':0, 'square':1, 'round_square':2, 'h_line':3, 'v_line':4, 'cross':5, 'circle':6, 'delete':7 };
        
        // Go over each tool class and adjust based on the clicked object
        for( var property in toolClasses )
        {
            var html_tool = $("#tool_"+property);
            if( html_tool[0] === $(e.target)[0] )
            {
                html_tool.css( { 'background-color':'rgba(0,0,0,.2)' } );
                
                // Get the classes of the object
                var classList = html_tool.attr('class').split(/\s+/);
                
                // Set to the value of the 2nd class *** REFACTOR ***
                webMapper.currentDrawingTool = toolClasses[classList[1]];
            }
            else
            {
                html_tool.css( { 'background-color':'transparent' } );
            }
        }
        
        webMapper.ClearExamplePoint();
        webMapper.DrawExamplePoint();         
        
    },

    // Binds events for the web application and general mapper related functions
    BindEvents : function()
    {
        // Map event handlers
        $("#map_event_layer").click( webMapper.MapClick );
        $(document).keypress( webMapper.DocumentKeypress );
        $(document).mousemove( webMapper.DocumentMouseMove );
        $(window).resize( webMapper.DocumentResizeEvent );

        // Admin Menu
        $("#map_admin").click( webMapper.AdminClick );
        $("#map_admin_delete_points").click( webMapper.DeleteAllPointsRequest );
        $("#map_admin_set_background").click( webMapper.SetBackgroundRequest );
        
        // Toolbar Load Button
        $("#map_load_button").click( webMapper.LoadMapClick );  
        $("#map_id").keyup( webMapper.ToggleLoadMapButton );
        
        // Map Menu
        $("#map_maps").click( webMapper.MapMenuClick ); 
        $("#map_generate_button").click( webMapper.GenerateMapIDClick );           
        $("#map_unload_button").click( webMapper.UnloadMapClick );
        $("#map_link_button").click( webMapper.ShowLinkClick );
        $("#map_reload_button").click( webMapper.ReloadMap );
        $("#map_clear_points").click( webMapper.ClearAllPoints );
        
        // Drawing Tools Menu
        $("#drawing_tool").click( webMapper.MapToolsClick );        
        $("#fill_color").change( webMapper.FillColorSelectorChange );
        $("#outline_color").change( webMapper.OutlineColorSelectorChange );
        $("#size_range").change( webMapper.SizeChange );
        $("#outline_size_range").change( webMapper.OutlineSizeChange );
        // Tool Clicks
        $("#tool_dot").click( webMapper.ToolChange );
        $("#tool_square").click( webMapper.ToolChange );
        $("#tool_round_square").click( webMapper.ToolChange );
        $("#tool_h_line").click( webMapper.ToolChange );
        $("#tool_v_line").click( webMapper.ToolChange );
        $("#tool_cross").click( webMapper.ToolChange );
        $("#tool_circle").click( webMapper.ToolChange );
        $("#tool_delete").click( webMapper.ToolChange );
       
        // Options Menu
        $("#map_options").click( webMapper.OptionsClick ); 
        $("#background_range").change( webMapper.BackgroundRangeChange );
        $("#map_range").change( webMapper.MapOpacityRangeChange );        
    },
    
    // Inits the SVG drawing canvas
    InitRaphael : function()
    {
        // Don't execute if there is already a canvas
        if( webMapper.canvas !== null )
        {
            return;
        }
        
        // Create the canvas for the main view
        webMapper.canvas = Raphael( "map", "100%", "100%" );
        
        // Create the canvas for the example point
        webMapper.exampleCanvas = Raphael( "drawing_tool", "100%", "100%" );
        webMapper.DrawExamplePoint();
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
            $("#admin_menu").hide();
            $("#map_menu").hide();
            
            // Init SVG canvas
            webMapper.InitRaphael();            
            
            webMapper.BindEvents();
            webMapper.LoadMapClick();
            webMapper.ResizeMap();
        });        
    },    

};

// Init the application
webMapper.Init();



















// EOF