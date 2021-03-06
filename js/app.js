// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {

    // clone our result template code
    var result = $('.templates .question').clone();

    // Set the question properties in result
    var questionElem = result.find('.question-text a');
    questionElem.attr('href', question.link);
    questionElem.text(question.title);

    // set the date asked property in result
    var asked = result.find('.asked-date');
    var date = new Date(1000 * question.creation_date);
    asked.text(date.toString());

    // set the .viewed for question property in result
    var viewed = result.find('.viewed');
    viewed.text(question.view_count);

    // set some properties related to asker
    var asker = result.find('.asker');
    asker.html('<p>Name: <a target="_blank" ' +
        'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
        question.owner.display_name +
        '</a></p>' +
        '<p>Reputation: ' + question.owner.reputation + '</p>'
    );

    return result;
};

var showAnswers = function(answers) {

    // clone our result template code
    var result = $('.templates .answers').clone();

    // Set the answer properties in result
    var answersElem = result.find('.answers-text a');
    answersElem.attr('href', answers.link);
    answersElem.text(answers.title);


    return result;


};

var showUsers = function(users) {

    // clone our result template code
    var result = $('.templates .users').clone();

    // Set the answer properties in result
   result.find('.displayName').text(users.user.display_name);
    
   result.find('.postCount').text(users.post_count);
   result.find('.score').text(users.score);

    return result;


};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
    var results = resultNum + ' results for <strong>' + query + '</strong>';
    return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error) {
    var errorElem = $('.templates .error').clone();
    var errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {

    // the parameters we need to pass in our request to StackOverflow's API
    var request = {
        tagged: tags,
        site: 'stackoverflow',
        order: 'desc',
        sort: 'creation'
    };

    $.ajax({
            url: "http://api.stackexchange.com/2.2/questions/unanswered",
            data: request,
            dataType: "jsonp", //use jsonp to avoid cross origin issues
            type: "GET",
        })
        .done(function(result) { //this waits for the ajax to return with a succesful promise object
            var searchResults = showSearchResults(request.tagged, result.items.length);

            $('.search-results').html(searchResults);
            //$.each is a higher order function. It takes an array and a function as an argument.
            //The function is executed once for each item in the array.
            $.each(result.items, function(i, item) {
                var question = showQuestion(item);
                $('.results').append(question);
            });
        })
        .fail(function(jqXHR, error) { //this waits for the ajax to return with an error promise object
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
};

var getAnswerers = function(tags) {
    //parameters for answerers tags
    var answers = {
        tag: tags,
        site: 'stackoverflow',
        period: 'month'
    };
    var url = "http://api.stackexchange.com/2.2/tags/{tag}/top-answerers/{period}?site={site}"
        .replace('{tag}', answers.tag)
        .replace('{period}', answers.period)
        .replace('{site}', answers.site)

    $.ajax({
        url: url,
        dataType: "jsonp",
        type: "GET",

    })

    .done(function(results) {
        searchResults = showSearchResults(answers.tag, results.items.length);

        $('.search-results').html(searchResults);
        $.each(results.items, function(i, item) {
    
            var answers = showUsers(item);
            $('.results').append(answers);
        });
    });
}






$(document).ready(function() {
    $('.unanswered-getter').submit(function(e) {
        e.preventDefault();
        // zero out results if previous search has run
        $('.results').html('');
        // get the value of the tags the user submitted
        var tags = $(this).find("input[name='tags']").val();
        getUnanswered(tags);
    });

    $(document).ready(function() {
        $('.inspiration-getter').submit(function(e) {
            e.preventDefault();
            $('.results').html('');
            var tags = $(this).find("input[name='answerers']").val();
            getAnswerers(tags);
        });


    })
})
