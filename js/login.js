/*
	Javascript for login.html
*/

$(document).ready(function() {
	/*
		HTML responsive design
	*/

	// Dynamic Tab
    $('#gettingstarted-tab li').click(function (e) {
	 	$('#gettingstarted-tab li').removeClass('active');
	 	$(this).addClass('active');

	 	$('#gettingstarted-content div').removeClass('active');
	 	var len = $(this).attr('id').length - 3;
	 	$('#' + $(this).attr('id').substr(0,len)).addClass('active');
	});

    // Slow Scroll
	$('#navigateToLogin').click(function () {
		$('html, body').animate({
	        scrollTop: $("#getStarted").offset().top
		}, 1500);
	});

// *****************************************************************************

	/*
		FireBase Interaction
	*/
	var myFirebaseRef = new Firebase("https://bookmark-manager.firebaseio.com/");
	var usersRef = myFirebaseRef.child("users");

	// Register a new User
	$('#registerbutton').click( function() {
		var _email = $('#register-form #email').val();
		var _password = $('#register-form #password').val();
		var _repassword = $('#register-form #repassword').val();

		// Check if password matches
		if(_repassword !== _password) {
			alert("Password mismatch!");
			return;
		}

		myFirebaseRef.createUser({
			email    : _email.toString(),
			password : _password.toString()
			}, function(error, userData) {
				if (error) {
					alert("Error! Maybe you have already registered");
				} else {
					console.log("Successfully created user account with uid:", userData.uid);
						usersRef.push({
								uid : userData.uid,
								name : "default",
								email : _email.toString(),
								gender : "Male",
	 						    country : "India",
	 						    about : "NA"
						});
						alert("Successfully registered!");
						var url = "index.html";    
						$(location).attr('href',url);
				}
		});
	});

	// Create a callback to handle the result of the authentication
	function authHandler(error, authData) {
		if (error) {
			alert("Login Failed!", error);
		} else {
			var url = "home.html";    
			$(location).attr('href',url);
		}
	}

	// Login with an email/password combination
	$('#loginbutton').click(function() {
		var _email = $('#login-form #email').val();
		var _password = $('#login-form #password').val();
		myFirebaseRef.authWithPassword({
		  email    : _email,
		  password : _password
		}, authHandler);
	});
});