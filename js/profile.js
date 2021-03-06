$(document).ready(function() {
	/*
		FireBase Interaction
	*/
	var myFirebaseRef = new Firebase("https://bookmark-manager.firebaseio.com/");
	var authData = myFirebaseRef.getAuth();
	if(!authData) {
		var url = "index.html";    
		$(location).attr('href',url);
	}

	/*
		Javascript for Profile tab
	*/
	// Get the list of users
	var usersRef = myFirebaseRef.child("users");
	var usersList = []; // list of all users
	usersRef.on("child_added", function(snapshot) {
	 	console.log(snapshot.val());
	 	usersList.push(snapshot.val());
	 	if(snapshot.val().uid === authData.uid) {
			generateGeneralProfile(authData);
		}
	}, function (errorObject) {
	  	alert("Failed to retrive Users' list");
	});

	// Populate General Profile
	var currentUserIndex = 0;
	function generateGeneralProfile(data) {
		for(var i=0; i<usersList.length; i++) {
			if(data.uid === usersList[i].uid) {
				currentUserIndex = i;
				// transfer data to "saved" mode
				$('#name-item .profile-content').html(usersList[i].name);
				$('#gender-item .profile-content').html(usersList[i].gender);
				$('#country-item .profile-content').html(usersList[i].country);
				$('#about-item .profile-content').html(usersList[i].about);

				// transfer data to "editable" mode
				$('#name-edit > div > input').val(usersList[i].name);
				$('#gender-edit > div > input').val(usersList[i].gender);
				$('#country-edit > div > input').val(usersList[i].country);
				$('#about-edit > div > textarea').html(usersList[i].about);
			}
		}
	}

	// Highlight the profile element/item on hover
	$('.list-toggle .saved').on('mouseenter',function() {
		// add color
		$(this).addClass('editable');
		// add glyphicon
		$(this).find('.glyphicon').show();
	});
	// Reverse the above opearion on mouseleave
	$('.list-toggle .saved').on('mouseleave',function() {
		// remove color
		$(this).removeClass('editable');
		// remove glyphicon
		$(this).find('.glyphicon').hide();
	});

	// Toggle to "editable" mode of display
	$('.list-toggle .saved').on('click',function() {
		$('.list-toggle').addClass('active');
		$(this).parent().removeClass('active')
	});

	// Save the changes made to General Profile
	$('#save-profile').click(function() {
		var _name = $('#name-edit > div > input').val();
		var _gender = $('#gender-edit > div > input').val();
		var _country = $('#country-edit > div > input').val();
		var _about = $('#about-edit > div > textarea').val();

		var usersRefForSave = myFirebaseRef.child("users");
		usersRefForSave.on("child_added", function(snapshot) {
			 	if(snapshot.val().uid === authData.uid) {
					var snapshotKeyForSave = usersRefForSave.child(snapshot.key());
					snapshotKeyForSave.on("child_added", function(innerSnapshot) {
						// Saving the data here!
						snapshotKeyForSave.update({"name":_name});
						snapshotKeyForSave.update({"gender":_gender});
						snapshotKeyForSave.update({"country":_country});
						snapshotKeyForSave.update({"about":_about});
						// Modify userList[]
						usersList[currentUserIndex].name = _name;
						usersList[currentUserIndex].gender = _gender;
						usersList[currentUserIndex].country = _country;
						usersList[currentUserIndex].about = _about;
						generateGeneralProfile(authData);
						//Show "Information Saved!" status
						$('.info-saved').show();
						$('.info-saved').fadeOut("1000",function() {
							// Nothing here
						});
					}, function(errorObject) {
						alert("Failed to save");
					});
				}
			}, function (errorObject) {
		  		alert("Failed to retrive Users' list while saving");
		});
		
		// Toggle/Revert back to "saved" mode of display
		$('.list-toggle').addClass('active');
		$(this).parent().parent().parent().removeClass('active');
	});

	$('#changepwdbutton').click(function() {
		//alert($('#oldpwd > div > input').val());
		myFirebaseRef.changePassword({
		  email: usersList[currentUserIndex].email,
		  oldPassword: $('#oldpwd > div > input').val(),
		  newPassword: $('#newpwd > div > input').val()
		}, function(error) {
		  if (error) {
		    switch (error.code) {
		      case "INVALID_PASSWORD":
		        alert("The specified user account password is incorrect.");
		        break;
		      case "INVALID_USER":
		        alert("The specified user account does not exist.");
		        break;
		      default:
		        alert("Error changing password:", error);
		    }
		  } else {
		    alert("User password changed successfully!");
		  }
		});
	});
});
