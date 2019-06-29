'use strict';

// const amcApiKey = 'FCBFBDED-2C13-4204-A0DD-73DDF3610237'; 
// const amcBaseURL = 'https://developer.nps.gov/api/v1/parks';
// const amcTheatersbyZip = '/v2/location-suggestions/?query=66062';
// const amcShowtimes = '/v2/theatres/{theatreNumber}/showtimes/{date}';
// const amcMovies = '/v2/movies/{id}';

// const for selected theater number
// const for selected data
// const for input zip
// const for movie ID
 
// on click of calendar input, datepicker displays
$(function() {
    $('.calendar').datepicker();
    console.log('datepicker running');
    //disable historical dates
  });

$('.go-button').on('click', function() {
    $('.landingPg').remove();
})


// function watchForm() {
//     $('form').submit(event => {
//       event.preventDefault();
//     });
//   }
  
//   $(watchForm);


  // have a spot when shows are showing to modify date/theater? 