<?php

    // Returns the id of the map if the ip provided is the correct orginator ip
    // $map: The map key to check against
    // $ip: The ip to check for being the orginator
    // [$passphrase]: Optional passphrase to check against map
    function CheckAdminRights( $map, $ip, $passphrase = '' )
    {
        // Exit if this is no db connection
        if( !defined( 'DB_CONNECTED' ) )
        {
            return 0;
        }
        
        // If the passphrase is not provided then use the default passphrase
        if( strlen( $passphrase ) <= 0 )
        {
            $passphrase = md5( $passphrase );
        }
        
        $id = DB_GetSingleArray( DB_Query( "SELECT id FROM map WHERE map.map_key='{$map}' AND map.originator_ip='{$ip}' AND map.passphrase='{$passphrase}'" ) );
        
        // Return true if the previous query is not empty
        if( count($id) > 0 )
        {
            return $id[0];
        }
        return 0;
    }

    // AJAX calls
    if( isset($_POST['ajax_request']) )
    {
        $output = 'Request not defined';
        DB_Connect();
        switch( $_POST['ajax_request'] )
        {
            case 'save_point':
                $x = Get( 'x' );
                $y = Get( 'y' );
                $user_id = Get( 'user_id' );
                $map = Get( 'map' );
                $color = Get( 'color' );
                $tool = Get( 'tool', false, 0 );
                
                $code = 0;
                $message = '';
                $id = DB_GetSingleArray( DB_Query( "SELECT id from map where map_key='{$map}' LIMIT 1" ) );
                
                // Create the map if needed
                if( count( $id ) <= 0 )
                {
                    $message = 'Could not find the map in the database';
                }
                else
                {
                    $id = $id[0];
                    
                    // Insert the point
                    DB_Query( "INSERT INTO point (x,y,user_id,color,tool,map_id) VALUES ({$x}, {$y}, '{$user_id}', '{$color}', {$tool}, {$id} )" );
                    
                    $code = 1;
                    $message = '';                    
                }
                
                $output = array( 'x' => $x, 'y' => $y, 'code' => $code, 'message' => $message );
            break;
            
            case 'load_map':
                $ip = substr( Get( 'ip' ), 0, 15 );
                $map = substr( Get( 'map' ), 0, 15 );
                $map_passphrase = Get( 'passphrase', false, '' );
                
                $code = 0;
                $admin = false;
                $map_md5 = md5( $map_passphrase );
                $map_row = DB_GetArray( DB_Query( "SELECT * from map where map_key='{$map}' LIMIT 1" ), true );
                                
                // Create the map if needed and give the client admin privileges
                if( count( $map_row ) <= 0 )
                {
                    DB_Query( "INSERT INTO map (map_key, originator_ip, passphrase) VALUES('{$map}', '{$ip}', '{$map_md5}')" );
                    $admin = true;
                    $code = 1;
                }
                else
                {   
                    $map_row = $map_row[0];
                    
                    // If the ip associated with the map is the originator ip then allow admin privileges
                    if( $map_row['originator_ip'] == $ip )
                    {
                        $admin = true;
                    }
                    
                    // Match the given passphrase against the one in the database
                    if( $map_md5 != $map_row['passphrase'] )
                    {
                        $code = 0;
                        $admin = false;
                    }
                    else
                    {
                        $code = 1;
                    }
                }
                
                $output = array( 'code' => $code, 'map_key' => $map, 'passphrase' => $map_passphrase, 'admin' => $admin, 'image_url' => $map_row['image_url'] );
            break;
            
           case 'poll_server':
           //var post = { 'ajax_request':'poll_server', 'time':time, 'request_time': webMapper.lastCheckedRequestTime 'map':webMapper.currentMapID };
                $time = Get( 'time' );
                $map = Get( 'map' );
                $request_time = intval( Get( 'request_time' ) );
                
                // Check for recent requests for this map
                $output = array( 'map' => $map, 'points' => DB_GetArray( DB_Query( "SELECT point.id, point.x, point.y, point.color, point.user_id, point.tool FROM point, map WHERE UNIX_TIMESTAMP(point.added) > {$time} AND point.map_id = map.id AND map.map_key='{$map}'" ), true ), 'code' => 1, 'time' => time() );
                
                // If the request_time is set to its default send a new max request time from the database
                if( $request_time <= 2 )
                {
                    // Send the max request time if it is its default time
                    $maxRequestTime = DB_GetSingleArray( DB_Query( "SELECT max(UNIX_TIMESTAMP(added)) from admin_request where map_key='{$map}'" ) );
                    if( count( $maxRequestTime ) > 0 && is_numeric( $maxRequestTime[0] ) )
                    {
                        $output['requestTime'] = intval( $maxRequestTime[0] );
                    }
                    // Send a value greater than 2 to signify there are no previous requests for this map
                    // and to prevent continuous requests for the new max request time
                    else
                    {
                        $output['requestTime'] = 1337;                                        
                    }
                }
                // Add any requests to the response if available
                else
                {
                    $requests = DB_GetSingleArray( DB_Query("SELECT request_type FROM admin_request WHERE map_key='{$map}' AND UNIX_TIMESTAMP(added)>{$request_time}"));
                    if( count( $requests ) > 0 )
                    {
                        // Convert each request into an int
                        foreach( $requests as &$request )
                        {
                            $request = intval( $request );
                        }
                        
                        $output['request'] = $requests;
                    }
                }
            break;

            case 'admin_clear':
                $map = Get( 'map' );
                $ip = Get( 'ip' );
                $passphrase = md5( Get( 'passphrase', false, '' ) );
                                
                // Only execute the admin command if the user's ip is the orginator ip and the passphrase is correct
                if( ( $id = CheckAdminRights( $map, $ip, $passphrase ) ) != 0 ) 
                {
                    // Delete all points for this map
                    DB_Query( "DELETE FROM point where map_id={$id}" );
                    
                    // Insert admin request to delete all dots from clients
                    DB_Query( "INSERT INTO admin_request (map_key, request_type, flag) VALUES ('{$map}', 0, 0)" );
                    
                    $output = array( 'code' => 1 );                
                }
            break;
            
            case 'admin_set_map':
                $map = Get( 'map' );
                $ip = Get( 'ip' );
                $passphrase = md5( Get( 'passphrase', false, '' ) );
                $map_url = Get( 'map_url', false, '' );
                                
                // Only execute the admin command if the user's ip is the orginator ip and the passphrase is correct
                if( ( $id = CheckAdminRights( $map, $ip, $passphrase ) ) != 0 ) 
                {
                    // Update the image url
                    DB_Query( "UPDATE map SET image_url='{$map_url}' WHERE id={$id}" );
                    
                    // Insert admin request to reload map image url
                    DB_Query( "INSERT INTO admin_request (map_key, request_type, flag) VALUES ('{$map}', 1, 0)" );
                    
                    $output = array( 'code' => 1 );                
                }                
            break;
            
            case 'get_map_image_url':
            $map = Get( 'map' );
            $passphrase = md5( Get( 'passphrase', false, '' ) );
            
            $image_url = DB_GetSingleArray( DB_Query( "SELECT image_url FROM map WHERE map_key='{$map}' AND passphrase='{$passphrase}'" ) );
            
            if( count( $image_url ) > 0 )
            {
                $image_url = $image_url[0];
            }
            else
            {
                $image_url = '';
            }
            
            
            $output = array( 'map' => $map, 'image_url' => $image_url, 'code' => 1 );
            break;
        }
        
        return json_encode( $output );
    }
    
    return null;
?>
