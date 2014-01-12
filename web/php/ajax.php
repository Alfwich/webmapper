<?php
    // AJAX calls
    if( isset($_POST['ajax_request']) )
    {
        $output = 'Request not defined';
        DB_Connect();
        switch( $_POST['ajax_request'] )
        {
            case 'save_dot':
                $x = Get( 'x' );
                $y = Get( 'y' );
                $user_id = Get( 'user_id' );
                $map = Get( 'map' );
                $color = Get( 'color' );    
                
                $id = DB_GetSingleArray( DB_Query( "SELECT id from map where map_key='{$map}' LIMIT 1" ) );
                
                // Create the map if needed
                if( count( $id ) <= 0 )
                {
                    DB_Query( "INSERT INTO map (map_key) VALUES('{$map}')" );
                    $id = DB_GetInsertID();
                }
                else
                {
                    $id = $id[0];
                }
                
                // Insert the dot
                DB_Query( "INSERT INTO dot (x,y,user_id,color,map_id) VALUES ({$x}, {$y}, '{$user_id}', '{$color}', {$id} )" );                
                
                $output = array( 'x' => $x, 'y' => $y, 'code' => 1 );
            break;
            
           case 'get_dots':
                $time = Get( 'time' );
                $map = Get( 'map' );
                $output = array( 'dots' => DB_GetArray( DB_Query( "SELECT * FROM dot, map WHERE UNIX_TIMESTAMP(dot.added) > {$time} AND dot.map_id = map.id AND map.map_key='{$map}'" ), true ), 'code' => 1, 'time' => time() );
            break;

            case 'clean_dots':
                $user_id = Get( 'user_id' );
                $q = DB_Query( "DELETE FROM dot WHERE user_id='{$user_id}'" );
                $output = array( 'code' => 1 );
            
        }
        
        return json_encode( $output );
    }
    
    return null;
?>
