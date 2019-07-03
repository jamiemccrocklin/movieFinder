'use strict';

const amcApiKey = '451EB6B4-E2FD-412E-AF07-CA640853CDC3'; 
const amcBaseURL = 'https://cors-anywhere.herokuapp.com/https://api.amctheatres.com';
// const amcTheatersSuggestions = '/v2/location-suggestions/?query=40206';
// ex https://api.amctheatres.com/v2/location-suggestions/?query=40206
// _embedded.suggestions.https://api.amctheatres.com/rels/v2/locations.href = link to query (with lat/long) which pulls up theaters
// const amcShowtimes = '/v2/theatres/{theatreNumber}/showtimes/{date}';
// https://api.amctheatres.com/v2/theatres/4266/showtimes/6-30-2019
// const amcMovies = '/v2/movies/{id}';
const options = {
    headers: new Headers({
      "X-AMC-Vendor-Key": amcApiKey})
  };

//tomorrow's date
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

//today's date
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); 
let yyyy = today.getFullYear();
today = mm + '-' + dd + '-' + yyyy;




// const for selected theater id
// const for selected data
// const for movie ID







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
// let value = document.querySelector('.tomorrow');

//     value.addEventListener('click', event => {
//         console.log('tomorrow was clicked')
//     });


// let submitAnswer = $('.submitDate').val();
// console.log(submitAnswer)

//on selection of 'submit', date is logged and sent to displayTheaterResults function
// function dateInput() {
//     $('form.date').submit(event => {
//       event.preventDefault();
//       let inputToday = $('.today').val();
//       let inputTomorrow = $('.tomorrow').val(tomorrow);
//       let inputDate = document.querySelector('input[type="date"]').value;
//       console.log(inputToday)
//       console.log(inputTomorrow)
//       console.log(inputDate)
//     });
//   }
// $(dateInput())






// $(document).on('submit', '.date', function(event) {
//     event.preventDefault();
//     // let submit = event.currentTarget.value
//     // console.log(submit)

//     // let calendar = document.getElementsByClassName("calendar").selected
//     // console.log(calendar)
//     // let tomorrow = document.getElementsByClassName("tomorrow").selected
//     // console.log(tomorrow)
//     function watchForm() {
//         $('form.zipCode').submit(event => {
//           event.preventDefault();
//           const inputZip = $('.js-zip').val();
//           getSuggestions(inputZip);
    
//         });
//       }

    // if ($('.calendar input[type=date]').click()) {
    //     let date= document.querySelector('input[type="date"]').value;
    //     console.log(date)
    // }
    // else if ($('.tomorrow input[type="button"]').click()) {
    //     console.log(tomorrow)
    //     }
    // else if ($('.today input[type="button"]').click()) {
    //     console.log(today)
    // }
    // if ($('input').is('.calendar')) {
    //     let date= document.querySelector('input[type="date"]').value;
    //     console.log(date)
    // }
    // else if ($('input').is('.tomorrow')) {
    //     console.log(tomorrow)
    // }
    // else if ($('input').is('.today')) {
    //     console.log(today)
    // }
// })


//display available theaters 
function displayTheaterResults(responseJson) {
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
    })
//theater ID is input in amcShowtimes URL along with date   

};




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
// $('.submitDate').on('click', function() {
//     event.preventDefault();
//     $('.landingPg').remove();
// })



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






  
$('form.date').submit(event => {
    event.preventDefault()
    if ($('input:checked').val() === 'Today') {
        let value = $('input:checked').val(today)
        let newVal = document.querySelector('input[class=today]').value
        console.log(newVal)
    }
    else if ($('input:checked').val() === 'Tomorrow') {
        let value = $('input:checked').val(tomorrow)
        let newVal = document.querySelector('input[class=tomorrow]').value
        console.log(newVal)
    }
    else if ($('input:checked').val() === 'Other') {
        let value = $('input:checked').val('input[id=which-date]')
        let newVal = document.querySelector('input[id=which-date]').value
        console.log(newVal)
    }
})