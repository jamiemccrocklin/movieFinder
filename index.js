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
        `<li class="theater-names" value="${responseJson._embedded.locations[i]._embedded.theatre.id}">${responseJson._embedded.locations[i]._embedded.theatre.longName}</li>
         <p>Distance:${responseJson._embedded.locations[i].distance}miles</p>
         <p>Address: ${responseJson._embedded.locations[i]._embedded.theatre.location.addressLine1}</p>
         <p>${responseJson._embedded.locations[i]._embedded.theatre.location.city}, ${responseJson._embedded.locations[i]._embedded.theatre.location.state} ${responseJson._embedded.locations[i]._embedded.theatre.location.postalCode}</p>`)
        };
// on click of theater name, theater ID is logged
    $('.theater-names').on('click', function(event) {
        $('html,body').animate({
            scrollTop: $('.showtimesPg').offset().top},
            'slow');
        let id = event.currentTarget.value
        let showtimesUrl = amcBaseURL + '/v2/theatres/' + id + '/showtimes/' + date
        let msg = showtimes(showtimesUrl)
        showtimes(showtimesUrl)
    })

//theater ID is input in amcShowtimes URL along with date
    function showtimes(showtimesUrl) {
        fetch (showtimesUrl, options) 
                .then(response => response.json())
                .then(responseJson => {
                    console.log(responseJson)
                    // displayShowtimeResults(responseJson)
                    parseMovies(responseJson)
                })
    }
};

//parse through data to find duplicate movie names and combine into one 
function parseMovies(responseJson) {
    const showtimes = responseJson._embedded.showtimes;
    console.log(showtimes)
    let myMovies = [];
    showtimes.forEach(movieName => {
        return myMovies.push(movieName);
    })


function combine(arr) {
    var combined = arr.reduce(function(result, item) {
    var current = result[item.movieName];
      result[item.movieName] = !current ? item : {
        movieName: item.movieName,
        showDateTimeLocal: current.showDateTimeLocal + ',' + item.showDateTimeLocal,
        posterDynamic: item.media.posterDynamic,
      };

  
      return result;
    }, {});
  
    return Object.keys(combined).map(function(key) {
      return combined[key];
    });
  }

    var result = combine(myMovies);
    console.log(result);
    displayShowtimeResults(result)
}


// movies playing at selected theater appear
function displayShowtimeResults(result) {
    $('.theaterPg').remove()
    $('.showtimes-results').empty();
    $('.showtimes-results').append( 
    `<h2>Movies playing at selected theater:</h2>`)
    for (let i = 0; i < result.length; i++){
        $('.showtimes-results').append( 
        // <li class= "movie-name">${result[i].movieName}</li>
        `<div class="poster-container">
            <img class="trigger" title="${result[i].movieName}" alt="movie image icon" src="${result[i].posterDynamic || result[i].media.posterDynamic}"> 
        </div>
        <div class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h1>Movie Name Here</h1>
            <img src="${result[i].posterDynamic || result[i].media.posterDynamic}">
        </div>
        </div>` 
    )}
    $('.trigger').on('click', function() {
        console.log('trigger is running')
        var newTrigger = event.currentTarget;
        toggleThings(newTrigger)
    })
    
    function toggleThings(newTrigger) {
        console.log('toggleThings is running')
        var modal = document.querySelector(".modal");
        var closeButton = document.querySelector(".close-button");
    
        function showModal() {
            // $('.modal').css('visibility', 'visible');
            modal.classList.add("show-modal");
        }

        function closeModal() {
            // $('.modal').css('visibility', 'hidden');
            modal.classList.remove("show-modal");
        }
    
        function windowOnClick(event) {
            if (event.target === modal) {
                toggleModal();
            }
        }
    
        newTrigger.addEventListener("click", showModal);
        closeButton.addEventListener("click", closeModal);
        window.addEventListener("click", windowOnClick);
    
    }
}
 

// $(watchForEvent);
// $(window).on('click', '.modal', function () { var modal = $(this); // etc })
// function watchForEvent() {


//on click of posterDynamic, show showtimes
// function showShowtimes() {
//     $('.')
// }

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

//start at top of page upon refresh
$("html, body").animate({ scrollTop: 0 }, "slow");

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

 //scrolling effects   
 $('.submitDate').click(function() {
    $('html,body').animate({
        scrollTop: $('.locationPg').offset().top},
        'slow');
});

$('.submitZip').click(function() {
    var elements = document.querySelectorAll('input');
    var invalidListener = function(){ this.scrollIntoView(false); };

    for(var i = elements.length; i--;)
    elements[i].addEventListener('invalid', invalidListener);

    $('html,body').animate({
        scrollTop: $('.theaterPg').offset().top},
        'slow');
});



// $('.submitZip').click(function() {
//     $('html,body').animate({
//         scrollTop: $('.theaterPg').offset().top},
//         'slow');
// });
