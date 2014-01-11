// Global JS for mapper
// Arthur Wuterich
// 1-9-14

var lastCheckedTime = 1;

function log(msg)
{
    console.log(msg);
}

function BackgroundRangeChange(e)
{
    var bg_intensity = $(e.target).val();
    $("body").css( { "background-color":"rgb("+bg_intensity+","+bg_intensity+","+bg_intensity+")" } );
}

function MapOpacityRangeChange(e)
{
    var opacity = $(e.target).val() / 100.0;
    $("#map").css( { "opacity":opacity } );
}

function MapClick(e)
{
    var posX = $(this).offset().left,
        posY = $(this).offset().top;
    AddRelativePoint( (e.pageX - posX), (e.pageY - posY), "#"+$(".color").val() );
}

function BindEvents()
{
    $("#background_range").change( BackgroundRangeChange );
    $("#map_range").change( MapOpacityRangeChange );
    $(".map_image").click( MapClick );
    $("#clear_dots_button").click( CleanPoints );
}

function AddRelativePoint(x,y,color)
{
    var mapWidth = $("#map .map_image").width();
    var mapHeight = $("#map .map_image").outerHeight();
    AddPoint( ( x / mapWidth ) * 100 , ( y / mapHeight ) * 100, color );
}

function AddPoint(x,y,color,sId)
{

    if( id == sId )
    {
        return;
    }
    
    var pointWrapper = $("<div>",{
        class:'point_wrapper',
    });
    
    $(pointWrapper).css( { "left":x+"%", "top":y+"%" } );    

    var point = $("<div>",{
        class:'point',
    });
    
    $(point).css( { "background-color":color } );
    
    $(pointWrapper).append(point).fadeIn();
    
    $("#map .map_image").append( pointWrapper );    
    
    if( sId == undefined )
    {
            
        // Send AJAX call to add dot to DB
        var post = { 'ajax_request':'save_dot', 'x':x, 'y':y, 'user_id':id, 'color':color };
        log( post );
            $.post(
            "/ne/",
            post,
            function(data) {
                log( data );
            }
        );
    }
}

function GetPoints( time )
{
    if( time == undefined || time == 0 )
    {
        if( lastCheckedTime == 1 )
        {
            time = 1;
        }
        else
        {
            time = lastCheckedTime-1;
        }
    }
    
    
    log( time );
    
    // Send AJAX call to add dot to DB
    var post = { 'ajax_request':'get_dots', 'time':time };
        $.post(
        "/ne/",
        post,
        function(data) {
            log( data );
            var result = jQuery.parseJSON( data );
            lastCheckedTime = result.time;
            
            // Add each dot
            for( dot in result.dots )
            {
                AddPoint( result.dots[dot].x, result.dots[dot].y, result.dots[dot].color, result.dots[dot].user_id );
            }
        }
    );    
    
}

$(document).ready( function(e){
    BindEvents();
    setInterval( GetPoints, 3000);
});

function CleanPoints()
{
    log( "sending request to remove dots" );
    
    // Send AJAX call to remove user's dots
    var post = { 'ajax_request':'clean_dots', 'user_id':id };
    $.ajax({
        type: 'POST',
        url: '/ne/',
        data: post,
        async: false
    });
}







// EOF