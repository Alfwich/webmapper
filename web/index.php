<?php
    session_start();
    
    // Database abstraction
    include_once 'php/db.php';
    
    // Whitelist array
    $whiteList = array(
        '71.202.94.245'
    );
       
    // If the ip is not in the whitelist then redirect
    if( !in_array( $_SERVER['REMOTE_ADDR'], $whiteList ) )
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
    <script type="text/javascript" src="js/jscolor.js"></script>
    <script type="text/javascript">var id = "<?php echo md5(time()); ?>";</script>
</head>
<body>
    <div id="right_bar">
        <div class="dark"></div>
        <input type="range" id="background_range" name="background_color" min="0" max="255" value="255">
        <div class="light"></div>
        
        <div class="visible"></div>
        <input type="range" id="map_range" name="map_opacity" min="0" max="100" value="100">
        <div class="invisible"></div>
        
    </div>
    <div id="map">
        <div class="map_image">
        </div>
        <div id="color">
            Dot Color <input type="text" name="color" class="color" value="" />        
        </div>
    </div>
</body>
</html>