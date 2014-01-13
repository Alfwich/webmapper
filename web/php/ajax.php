<?php
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
                $ip = Get( 'ip' );
                $map = Get( 'map' );
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
                
                $output = array( 'code' => $code, 'map_key' => $map, 'passphrase' => $map_passphrase, 'admin' => $admin );
            break;
            
           case 'get_points':
                $time = Get( 'time' );
                $map = Get( 'map' );
                $output = array( 'map' => $map, 'points' => DB_GetArray( DB_Query( "SELECT point.x, point.y, point.color, point.user_id, point.tool FROM point, map WHERE UNIX_TIMESTAMP(point.added) > {$time} AND point.map_id = map.id AND map.map_key='{$map}'" ), true ), 'code' => 1, 'time' => time() );
            break;

            case 'clean_points':
                $user_id = Get( 'user_id' );
                $q = DB_Query( "DELETE FROM point WHERE user_id='{$user_id}'" );
                $output = array( 'code' => 1 );
            
        }
        
        return json_encode( $output );
    }
    
    return null;
?>
