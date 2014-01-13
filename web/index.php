<?php
    // If the remote address matches against the list return true
    function MatchWhitelist( $list )
    {    
        if( !is_array($list) )
        {
            return false;
        }
        
        foreach( $list as $re )
        {
            if( preg_match( "/{$re}/", $_SERVER['REMOTE_ADDR'] ) == 1 )
            {
                return true;
            }
        }
        return false;
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
        exit;
    }
    
    // AJAX handler
    if( ( $result = include_once 'php/ajax.php' ) != null )
    {
        // If the results was a susccessful ajax call echo the results and exit
        echo $result;
        exit;
    }
?>
<html>
<head>
    <title>Mapper</title>
    <link rel="stylesheet" type="text/css" href="css/global.css">
    <script type="text/javascript" src="js/jquery-1.10.2.js"></script>
    <script type="text/javascript" src="js/global.js"></script>
    <script type="text/javascript" src="js/jscolor/jscolor.js"></script>
    <script type="text/javascript">var id = "<?php echo md5(time()); ?>";</script>
</head>
<body>
    <div id="application">
        <div id="right_bar">
            <div class="dark"></div>
            <input type="range" id="background_range" name="background_color" min="0" max="255" value="255">
            <div class="light"></div>
            
            <div class="visible"></div>
            <input type="range" id="map_range" name="map_opacity" min="0" max="100" value="100">
            <div class="invisible"></div>
            
            <div class="slow"></div>
            <input type="range" id="refresh_rate" name="map_refresh" min="0" max="10" value="10">
            <div class="fast"></div>            
            
        </div>
        <div id="map">
            <div class="map_image">
            </div>
            <div id="color">
                Dot Color <input type="text" name="color" class="color" value="" />
                <input type="button" id="clear_dots_button" name="clear_dots" value="Clear My Dots" />
            </div>
        </div>
    </div>
</body>
</html>
