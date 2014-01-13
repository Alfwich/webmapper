<?php
    ///////////////
    // Functions //
    ///////////////
    
    // If the remote address matches against the list return true
    function MatchWhitelist( $list, $ip = '' )
    {    
        if( !is_array($list) || !is_string($ip) )
        {
            return false;
        }
        
        $result = false;
        
        if( strlen( $ip ) <= 0 )
        {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        
        // Check each regex against the requesting ip
        foreach( $list as $re )
        {
            if( preg_match( "/{$re}/", $ip ) )
            {
                $result = true;
                break;
            }
        }
        
        return $result;
    }
    
    // Database abstraction
    include_once 'php/db.php';
    
    /*
    // Whitelist array
    $whiteList = array(
        '71.202.94.245',
        '(\d+.){3}(\d+)'
    );
       
    // If the ip is not in the whitelist then redirect
    if( !MatchWhitelist( $whiteList ) )
    {
        header('Location: http://arthurwut.com');
        return;
    }
    */
    
    // AJAX handler
    if( ( $result = include_once 'php/ajax.php' ) != null )
    {
        // If the results was a susccessful ajax call echo the results and exit
        echo $result;
        return;
    }
?>
<html>
<head>
    <title>Mapper</title>
    <link rel="stylesheet" type="text/css" href="css/global.css">
    <script type="text/javascript" src="js/jquery-1.10.2.js"></script>
    <script type="text/javascript" src="js/global.js"></script>
    <script type="text/javascript" src="js/jscolor/jscolor.js"></script>
    <script type="text/javascript" src="js/webtoolkit.md5.js"></script>
    <script type="text/javascript" class="REMOVE_ON_LOAD">
        var ID = "<?php echo substr( md5(time()), 0, 10 ); ?>";
        var CLIENT_IP="<?php echo $_SERVER['REMOTE_ADDR']; ?>";
    </script>
</head>
<body>
    <div id="application">
        <div id="top_bar">
            <input type="text" maxlength="15" spellcheck="false" placeholder="Enter Map ID" id="map_id" value="<?php echo isset($_GET['m'])?$_GET['m']:''; ?>" />
            <input type="text" maxlength="15" spellcheck="false" placeholder="Optional Passphrase" id="map_passphrase" value="<?php echo isset($_GET['p'])?$_GET['p']:''; ?>" />
            <input type="button" id="map_load_button" value="Load / Create Map" />
            <input type="button" id="map_maps" value="Map" />
            <div id="map_menu">
                <input type="button" id="map_generate_button" value="Generate Random ID" />
                <input disabled type="button" id="map_unload_button" value="Unload Current Map" />
                <input disabled type="button" id="map_link_button" value="Get Sharable Link" />
            </div>
            <input type="button" id="map_options" class="right" value="Options" />
            <div id="options_menu">
                <h4>Display Settings</h4>                
                <div class="dark"></div>
                <div class="light"></div>
                <input type="range" id="background_range" name="background_color" min="0" max="255" value="255">
                <hr>
                <h4>Map Settings</h4>                
                <div class="visible"></div>
                <div class="invisible"></div>
                <input type="range" id="map_range" name="map_opacity" min="0" max="100" value="100">
            </div>
            <div id="drawing_tools">
                <h4>Color</h4>
                <input type="text" id="point_color" name="color" class="color" value="" />
                <BR/>
                <h4>Type</h4>
                <select id="point_type">
                    <option value="0">Circle</option>
                    <option value="1">Square</option>
                </select>
            </div>
            <input type="button" id="map_tools" class="right" value="Drawing Tools" />
            <div id="drawing_tool">
                <div class="point_wrapper">
                    <div id="example_point" class="point point_circle" >
                    </div>
                </div>            
            </div>
            <input type="button" id="map_admin" class="right" value="Admin" />
        </div>
        <div id="map" class="no_select">
            <div class="map_image"></div>
        </div>
    </div>
</body>
</html>
