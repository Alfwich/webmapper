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
    <script type="text/javascript">var id = "<?php echo md5(time()); ?>";</script>
</head>
<body>
    <div id="application">
        <!--
        <div id="visual_menu">
            <div class="dark"></div>
            <input type="range" id="background_range" name="background_color" min="0" max="255" value="255">
            <div class="light"></div>
            
            <div class="visible"></div>
            <input type="range" id="map_range" name="map_opacity" min="0" max="100" value="100">
            <div class="invisible"></div>
            
        </div>
        -->
        <div id="top_bar">
            <input type="text" spellcheck="false" placeholder="Enter Map ID" id="map_id" value="<?php echo isset($_GET['m'])?$_GET['m']:''; ?>" />
            <input type="button" id="map_load_button" value="Load Map" />
            <input disabled type="button" id="map_unload_button" value="Unload Map" />
            <input type="button" id="map_generate_button" value="Generate ID" />
            <div class="vr_bar"></div>
            <div id="map_label"></div>
            <input type="button" id="map_link_button" value=" " />
            
            <input type="button" id="options_menu" value=" " />
        </div>
        <div id="map" class="no_select">
            
            <div class="map_image">
            </div>
            <div id="color">
                Dot Color <input type="text" name="color" class="color" value="" />
                <!-- <input type="button" id="clear_dots_button" name="clear_dots" value="Clear My Dots" /> -->
            </div>
        </div>
    </div>
</body>
</html>
