$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();

    activateAccount($.url().param('activation_token'), $.url().param('user_id'));
    $("#loginBtn").click(function() {
        var logedUser = {
            "email": $("#email").val(),
            "password": $("#password").val()
        };

        console.log("checking user : " + logedUser.email);


        $.ajax({
            type: "POST",
            url: "http://localhost:8000/user/login",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(logedUser),
            dataType: "json",
            success: function(data) {
                $("div").html("<span>Welcome, </span>" + data.email);
                console.log('success' + data);
            },
            error: function(e) {
                $("#error").html("<div>Sorry, the login and password don't match </div>");

                console.log('Error: ' + e);
            }

        });


    });


    $("#registerBtn").click(function() {
        $("#email").css("border", "1px solid #e8ebed");
        $("#password").css("border", "1px solid #e8ebed");

        var newUser = {
            "email": $("#email").val(),
            "password": password = $("#password").val()
        };

        if (!isValidEmailAddress(newUser.email)) {
            console.log("email not valid");
            $("#email").css("border", "1px solid red");
        }


        if (!isValidPassword(newUser.password)) {
            console.log("should contain at least one digit should contain at least one lower case, should contain at least one upper case, should contain at least 8 from the mentioned characters");
            $("#password").css("border", "1px solid red");

        };

        console.log("new user: " + newUser.email);


        $.ajax({
            type: "POST",
            url: "http://localhost:8000/user/",
            contentType: "application/json; charset=utf-8",
            form: newUser,
            dataType: "json",
            success: function(msg) {
                $("div").html("<span>Check you email to activate you account!</span>");
                console.log('success' + msg);
            }

        });



    });


    function isValidEmailAddress(email) {
        var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        return pattern.test(email);
        console.log(pattern.test(email));
    };

    function isValidPassword(passw) {
        var pattern = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
        return pattern.test(passw);
        console.log(pattern.test(passw));
    }

    function activateAccount(token, user_id) {
        if (!token || !user_id) return;

        $.ajax({
            type: "GET",
            url: "http://localhost:8000/user/" + user_id + "/activate?activation_token=" + token,
            dataType: 'json',
            success: function(data) {
                $("div").html("<span style='text-align:center'>You have successfully created your account</span>");
                console.log(data);
            }
        });
    }

});
