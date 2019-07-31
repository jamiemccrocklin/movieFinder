'use strict';

const amcApiKey = '451EB6B4-E2FD-412E-AF07-CA640853CDC3'; 
const amcBaseURL = 'https://cors-anywhere.herokuapp.com/https://api.amctheatres.com';
const omdbBaseURL = 'https://www.omdbapi.com/?apikey=cec2abca&t=';
const youtubeBaseURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=AIzaSyDb7xCvGxu327fSkYk4Gxg-C5h-ems8n68&maxResults=1&q=';

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
        let clickedTheater = $(this);
        let clickedTheaterName = clickedTheater.html();
        document.getElementById("insert").innerHTML = clickedTheaterName;
        console.log(clickedTheaterName)
        let id = event.currentTarget.value
        let showtimesUrl = amcBaseURL + '/v2/theatres/' + id + '/showtimes/' + date
        let msg = showtimes(showtimesUrl)
        showtimes(showtimesUrl)
        displayShowtimeResults(clickedTheaterName)
    })

//theater ID is input in amcShowtimes URL along with date
    function showtimes(showtimesUrl) {
        fetch (showtimesUrl, options) 
                .then(response => response.json())
                .then(responseJson => {
                    console.log(responseJson)
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
        showDateTimeLocal: current.showDateTimeLocal + ', ' + item.showDateTimeLocal,
        posterDynamic: item.media.posterDynamic,
        mpaaRating: item.mpaaRating,
        runTime: item.runTime,
        genre: item.genre,
      };
    
//need to format HH:MM & conditional - if same time, only display once
    // let oldDate = Object.entries(showDateTimeLocal);
    // console.log(oldDate)
  
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
//var imgSrc;
getImgSrc();
closeModal();



// movies playing at selected theater appear
function displayShowtimeResults(result) {
    console.log('displayShowtimeResults running')
    // $('.showtimesPg').append( 
    // `<h2 class="showtimes-title">Movies playing at ${clickedTheaterName}</h2>`)
    $('.modal-content').empty();
    $('.showtimes-results').empty();
    for (let i = 0; i < result.length; i++){
        $('.showtimes-results').append( 
        `<div class="poster-container">
            <img class="trigger" title="${result[i].movieName}" alt="movie image icon" src="${result[i].posterDynamic || result[i].media.posterDynamic}"> 
        </div>

        <div class="modal">
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h1>${result[i].movieName}</h1>
            <img class="modal-image" src="${result[i].posterDynamic || result[i].media.posterDynamic}">
            <h2>Showtimes: ${result[i].showDateTimeLocal}</h2>
        </div>
        </div>` 
    )}   
}
 
function getImgSrc() {
    $('.showtimes-results').on('click', '.poster-container', function() {
        let clickedElement = $(this);
        toggleThings(clickedElement)
    })
}
    
function toggleThings(clickedElement) {
    console.log('toggleThings running')
//shows modal
    var $modal = $(clickedElement).next('.modal')
    var $closeButton = $modal.find('.close-button');
    $modal.addClass('show-modal');
//grabs just the movie name of the selected poster title
    let selectedMovieName = clickedElement.html();
    console.log(selectedMovieName)
    let movie = $(selectedMovieName).attr('title');
    let formatMovieName = movie.split(' ').join('+');
    let omdbRatingURL = omdbBaseURL + formatMovieName
//fetches ratings from omdb API 
    fetch(omdbRatingURL)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson)
            let imdb = responseJson.Ratings[0];
            let imdbText = Object.values(imdb);
            let rottenTomato = responseJson.Ratings[1];
            let rottenTomatoText = Object.values(rottenTomato);
            let metacritic = responseJson.Ratings[2];
            let metacriticText = Object.values(metacritic);
            console.log(imdb)
            console.log(rottenTomato)
            console.log(metacritic)
            $('.movie-info').empty();
            $('.modal-content').append(
                `<div class="movie-info">
                <h3>${responseJson.Plot}</h3>
                <h3>Actors: ${responseJson.Actors}</h3>
                <ul>Ratings:</ul>
                <img class="imdb icon" src="IMDB Icon.png" alt="IMDB icon">
                <li class="rating"> ${imdbText[1]}</li>
                <img class="rotten-tomato icon" src="Rotten Tomato Icon.png" alt="rotten tomato icon">
                <li class="rating"> ${rottenTomatoText[1]}</li>
                <img class="metacritic icon" src="Metacritic icon.png" alt="Metacritic icon"?
                <li class="rating"> ${metacriticText[1]}</li>
                </div>`
            )
        }); 
    let youtubeURL = youtubeBaseURL + formatMovieName + 'Official+Movie+Trailer'
    console.log(youtubeURL)
    fetch(youtubeURL)
        .then(response => response.json())
        .then(responseJson => {
            console.log(responseJson)
            let id = responseJson.items[0].id.videoId;
            console.log(id)
            $('.movie-container').empty();
            $('.modal-content').append(
                `<div class="movie-container">
                <iframe src="https://www.youtube.com/embed/${id}"
                width="560" height="315" frameborder="0" allowfullscreen>
                </iframe>
                </div>`
            )
        }); 
}

function closeModal() {
  $('.showtimes-results').on('click', '.close-button', function() {
    $('.showtimes-results .modal').removeClass('show-modal')
  });
}




// function getRatings(omdbRatingURL) {
//     $('.showtimes-results').on('click', '.poster-container', function() {
//     fetch(omdbRatingURL)
//         .then(response => response.json())
//         .then(responseJson => {
//             console.log(responseJson)
//             let imdb = responseJson.Ratings[0];
//             let rottenTomato = responseJson.Ratings[1];
//             let metacritic = responseJson.Ratings[2];
//             console.log(imdb)
//             console.log(rottenTomato)
//             console.log(metacritic)
//             displayShowtimeResults(imdb, rottenTomato, metacritic)
//         });
//     })
    
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

