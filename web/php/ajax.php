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
                $color = Get( 'color' );                
                
                DB_Query( "INSERT INTO dot (x,y,user_id,color) VALUES ({$x}, {$y}, '{$user_id}', '{$color}' )" );
                
                $output = array( 'x' => $x, 'y' => $y, 'code' => 1 );
            break;
            
           case 'get_dots':
                $time = Get( 'time' );
                $output = array( 'dots' => DB_GetArray( DB_Query( "SELECT * FROM dot WHERE UNIX_TIMESTAMP(added) > {$time}" ), true ), 'code' => 1, 'time' => time() );
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
