<?
// Database: Defines functions for php database connections
// Arthur Wuterich
// 8/28/13

// Database constants are defines in the .htaccess file

// Connects to MySQL database  
function DB_Connect()
{
	$link = mysql_connect( $_SERVER['DB_HOST_NAME'], $_SERVER['DB_USER_NAME'], $_SERVER['DB_PASSWORD'] );
	mysql_select_db( $_SERVER['DB_DATABASE'] );
    define( 'DB_CONNECTED', true );    
	return $link;
}

// Executes a query on the connected database
// Precondition: A valid SQL query
// Side effect: Executes the SQL query
function DB_Query( $query )
{
	$result = mysql_query( $query );
		
	// Show error if available
	if (!$result) {
		echo mysql_error(), '<BR/>';
	}	
	
	return $result;
}

// Returns a row of data from a query result
// Precondition: A valid MySql query result object
//		-$assoc: If true returns an associative array
function DB_GetRow( &$result, $assoc = false )
{
	if( !$assoc )
	{
		return mysql_fetch_row( $result );
	}
	else
	{
		return mysql_fetch_assoc( $result );
	}
}

// Returns a 2d array with all of the elements
// Precondition: A valid MySql query result object
// [$assoc]: If true returns each row as assoc rows
// Postcondition: A 2d array with all query information
function DB_GetArray( &$result, $assoc = false )
{
	$array = array();

	while( $row = DB_GetRow( $result, $assoc ) )
	{
		$array[] = $row;
	}
	
	return $array;
}

// Will take an nth dimension array and return a 1d array
// Precondition: Valid array object
// Postcondition: 1d array containing all of the elements of the org array
function DB_FlattenArray( $array )
{
	// Return input if not an array
	if( !is_array( $array ) )
	{
		return $array;
	}
	
	$result = array();
	foreach( $array as $value )
	{
		if( is_array( $value ) )
		{
			$result = array_merge( $result, DB_FlattenArray( $value ) );
		}
		else
		{
			$result[] = $value;
		}
	}
	
	return $result;
}

// Returns a 1d array with all of the elements 
// Precondition: A valid MySql query result object
// Postcondition: A 2d array with all query information
// [$assoc]: Will return the array as an associative array
function DB_GetSingleArray( &$result, $assoc = false )
{
	$array = array();

	// Cycle each element to push into result array
	while( $row = DB_GetRow( $result, $assoc ) )
	{
		// If the element is an array use recursion to get all of the elements
		if( is_array( $row ) )
		{
			$row = DB_FlattenArray( $row );
		}
		
		$array = array_merge( $array, $row );
	}
	
	return $array;
}

// Returns the auto generated id from the previous query
// Precondition: A valid database connection
function DB_GetInsertID()
{
    return mysql_insert_id();
}

// Returns the associated file in the post array or ends execution if the variable is required and not present
// Precondition: Assumes a DB link
//	$postVariable: The post variable to retrieve
//	[$required]: If true then the api will immediatly end execution on a null value
//	[$default]: The default value if no value found
function Get( $postVariable, $required = true, $default = null )
{
	if( ( !isset( $_POST[$postVariable] ) || $_POST[$postVariable] == '' ) )
	{
		if( $required )
		{
			exit( "ERROR_VARIABLE_NOT_FOUND" . ": {$postVariable}" );
		}
		
		return $default;
	}
	
	return str_replace( ';', '', $_POST[$postVariable]||!$required)?mysql_real_escape_string($_POST[$postVariable]):exit( "ERROR_VARIABLE_NOT_FOUND" . ": {$postVariable}" );

}

?>