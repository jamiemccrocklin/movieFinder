'use strict';

const amcApiKey = '451EB6B4-E2FD-412E-AF07-CA640853CDC3'; 
const amcBaseURL = 'https://cors-anywhere.herokuapp.com/https://api.amctheatres.com';
// const amcTheatersSuggestions = '/v2/location-suggestions/?query=40206';
// ex https://api.amctheatres.com/v2/location-suggestions/?query=40206
// _embedded.suggestions.https://api.amctheatres.com/rels/v2/locations.href = link to query (with lat/long) which pulls up theaters
// const amcShowtimes = '/v2/theatres/{theatreNumber}/showtimes/{date}';
// const amcMovies = '/v2/movies/{id}';
const options = {
    headers: new Headers({
      "X-AMC-Vendor-Key": amcApiKey})
  };

//tomorrow's date
function getTomorrow() {
let tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
let day = String(tomorrow.getDate()).padStart(2, '0')
let month = String(tomorrow.getMonth() + 1).padStart(2, '0')
let year = tomorrow.getFullYear()
tomorrow = ( month + "-" + day + "-" + year)

return tomorrow

}

//today's date
function getToday() {
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); 
let yyyy = today.getFullYear();
today = mm + '-' + dd + '-' + yyyy;

return today
}


function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

//GET data from location-suggestions and embedded URL 

function getSuggestions() {
    const inputZip = $('.js-zip').val();
    const params = {
    query: inputZip
  };
  const queryString = formatQueryParams(params);
  const amcTheatersSuggestions = amcBaseURL + '/v2/location-suggestions/?' + queryString;

  console.log(amcTheatersSuggestions);

  fetch(amcTheatersSuggestions, options)
    .then(response => response.json())
    .then(responseJson => {
        console.log(responseJson)
        console.log(responseJson._embedded.suggestions[0]._links['https://api.amctheatres.com/rels/v2/locations'].href)
        let embeddedUrl = 'https://cors-anywhere.herokuapp.com/' + responseJson._embedded.suggestions[0]._links['https://api.amctheatres.com/rels/v2/locations'].href;
        fetch (embeddedUrl, options) 
            .then(response => response.json())
            .then(responseJson => {
                console.log(responseJson)
                displayTheaterResults(responseJson)
            })
    });
}


// let submitAnswer = $('.submitDate').val();
// console.log(submitAnswer)

//logs input date to console
// function getDate() {
//     let newVal;
//         if ($('input:checked').val() === 'Today') {
//             value = $('input:checked').val(today)
//             newVal = document.querySelector('input[class=today]').value
//             console.log(newVal)
//         }
//         else if ($('input:checked').val() === 'Tomorrow') {
//             value = $('input:checked').val(tomorrow)
//             newVal = document.querySelector('input[class=tomorrow]').value
//             console.log(newVal)
//         }
//         else if ($('input:checked').val() === 'Other') {
//             value = $('input:checked').val('input[id=datepicker]')
//             newVal = document.querySelector('input[id=datepicker]').value
//             console.log(newVal)
//         }
//     return {
//         newVal
//     }
    
// }

function getDate() {
    if ($('input:checked').val() === 'Today') {
        return getToday();
    } 
    else if ($('input:checked').val() === 'Tomorrow') {
        return getTomorrow();
    } 
    else {
        return document.querySelector('input[id=datepicker]').value 
    }
}



//display available theaters 
function displayTheaterResults(responseJson) {
    const date = getDate()
    console.log(date)
    $('.theaterResults').empty();
    for (let i = 0; i < responseJson._embedded.locations.length; i++){
      $('.theaterResults').append( 
        `<li class="theater-names" value=${responseJson._embedded.locations[i]._embedded.theatre.id}>${responseJson._embedded.locations[i]._embedded.theatre.longName}</li>
         <li class="theater-id">${responseJson._embedded.locations[i]._embedded.theatre.id}</li>
         <img alt="theater image icon" src="${responseJson._embedded.locations[i]._embedded.theatre.media.theatreImageIcon}">
         <p>Distance:${responseJson._embedded.locations[i].distance}miles</p>
         <p>Address: ${responseJson._embedded.locations[i]._embedded.theatre.location.addressLine1}</p>
         <p>${responseJson._embedded.locations[i]._embedded.theatre.location.city}, ${responseJson._embedded.locations[i]._embedded.theatre.location.state} ${responseJson._embedded.locations[i]._embedded.theatre.location.postalCode}</p>`)
        };
// on click of theater name, theater ID is logged
    $('.theater-names').on('click', function(event) {
        let id = event.currentTarget.value
        console.log(id)
        let showtimesUrl = amcBaseURL + '/v2/theatres/' + id + '/showtimes/' + date
        let msg = showtimes(showtimesUrl)
        showtimes(showtimesUrl)
    })

//theater ID is input in amcShowtimes URL along with date
    function showtimes(showtimesUrl) {
        fetch (showtimesUrl, options) 
                .then(response => response.json())
                .then(responseJson => {
                    // console.log(responseJson)
                    // displayShowtimeResults(responseJson)
                    parseMovies(responseJson)
                })
    }
};

//parse through data to find duplicate movie names and combine into one 
function parseMovies(responseJson) {
    // let notDuplicate = []
    let entries = Object.entries(responseJson._embedded.showtimes)
    console.log(entries)
    let result = [];

    entries.forEach(function (entry) {
        if (!this[entry.movieName]) {
            this[entry.movieName] = { movieName: entry.movieName};
            result.push(this[entry.movieName]);
        }
        
    }, Object.create(null));
    
    console.log(result);
    // for (let i = 0; i < responseJson._embedded.showtimes[i].length; i++) {
    //     if (responseJson._embedded.showtimes[i].movieName === responseJson._embedded.showtimes[++i].movieName) {
    //         console.log('this is running')
    //     }
    // }
    // displayShowtimeResults(responseJson)
}



// movies playing at selected theater appear
function displayShowtimeResults(responseJson) {
    $('.showtimes-results').empty();
    for (let i = 0; i < responseJson._embedded.showtimes.length; i++){
        $('.showtimes-results').append( 
        `<li class="movie-name">${responseJson._embedded.showtimes[i].movieName}</li>
        <img alt="movie image icon" src="${responseJson._embedded.showtimes[i].media.posterDynamic}">`  
        )}
}


  //on click of theater name, display movies playing at that theater
// function showMovies(theaterName) {
    
//     console.log(theaterName);
// }


//add this template to the above for an error message when ready
//   fetch(url)
//     .then(response => {
//       if (response.ok) {
//         return response.json();
//       }
//       throw new Error(response.statusText);
//     })
//     // .then(responseJson => console.log(responseJson));
//     .then(responseJson => displayResults(responseJson));
//     // .catch(err => {
//     //   $('#js-error-message').text(`Something went wrong: ${err.message}`);
//     // });
// }



//watches for submit of zip form 
function watchForm() {
    $('form.zipCode').submit(event => {
      event.preventDefault();
      const inputZip = $('.js-zip').val();
      getSuggestions(inputZip);
    });
}
  
  $(watchForm);
 

//removes landingPg page, removes hidden class on zipPg
$('.submitDate').on('click', function() {
    event.preventDefault();
    // $('.landingPg').remove();
})



//reveals date input option
$('.calendar').on('click', function () {
    $('.reveal-if-active').css({ display: 'block'})
    $('.reveal-if-active').prop('required',true)
})

$('.tomorrow').on('click', function () {
    $('.reveal-if-active').css({ display: 'none'})
    $('.reveal-if-active').prop('required',false)
})

$('.today').on('click', function () {
    $('.reveal-if-active').css({ display: 'none'})
    $('.reveal-if-active').prop('required',false)
})







$(function datePicker() {
    $("#datepicker").datepicker( {
        dateFormat: 'mm-dd-yy',
        minDate: 0
    });
 });
    

