$(document).ready(function() {
	// Navigation bar
	$('#navigation-list li').click(function() {
		$('#navigation-list li').removeClass('active');
		$(this).addClass('active');

		// display appropriate inner-body
		$('.inner-body').removeClass('active');
		var len = $(this).attr('id').length - 6;
		$('#' + $(this).attr('id').substr(0,len) + '-body').addClass('active');
	});

	// Dropdown
	$('.glyphicon-triangle-bottom').click(function() {
		$('.overlay-dropdown').toggle();
	});

	/*
		FireBase Interaction
	*/
	var myFirebaseRef = new Firebase("https://bookmark-manager.firebaseio.com/");
	var authData = myFirebaseRef.getAuth();
	if(!authData) {
		var url = "index.html";    
		$(location).attr('href',url);
	}

//  *********************************************************************************************

	// Get the list of users, and populate the "People on Bookmark Manager"
	var usersRef = myFirebaseRef.child("users");
	var usersList = []; // list of all users
	usersRef.on("child_added", function(snapshot) {
	 	console.log(snapshot.val());
	 	$('#users-list').append('<li class="list-group-item" style="text-align:center">' + snapshot.val().email + '</li>');
	 	usersList.push(snapshot.val());
	 	if(snapshot.val().uid === authData.uid) {
			generateGeneralProfile(authData);
			// Display Email ID on contact-header
			$('#contact-info > div > p > #useremail').append(snapshot.val().email);
		}
	}, function (errorObject) {
	  	alert("Failed to retrive Users' list");
	});


	// What happens with the users-list on click/hover
	$('#users-list').on('mouseover','li',function() {
		
	});

//  *********************************************************************************************

	/*
		Javascript for Profile tab
	*/

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
		call_alert("Yay");
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

//  *********************************************************************************************

	/*
		Javascript for Bookmarks tab
	*/

	var bookmarksRef = myFirebaseRef.child("bookmarks");
	var bookmarksList = []; // list of all bookmarks

	// Bookmarks Class/Constructor
	function bookmark(pushID, uid, name, link, description) {
		this.pushID = pushID;
		this.uid = uid;
		this.name = name;
		this.link = link;
		this.description = description;

		this.save = function() {
			var newEntry = bookmarksRef.push({
				uid : this.uid,
				name : this.name,
				link : this.link,
				description : this.description
			});
		}

		this.addToUI = function() {
			$('#bookmarks-list').append('<div class="list-group-item"> \
											<h4 class="list-group-item-heading" style="text-align:left"><a href="'+this.link+'"">'+this.name+'</a> \
									    		<span style="float:right" class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> \</h4> \
									    	<p class="list-group-item-text">'+this.link+'</p> \
									    	<div class="bm-desc"> \
									    		<hr/> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-pencil edit-bookmark" aria-hidden="true"></span> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-trash delete-bookmark" aria-hidden="true"></span> \
									    		<p class="desc">'+this.description+'</p> \
									    	</div> \
									  	</div>');
		}

		this.getUID = function() {
			return this.uid;
		}

		this.deleteBM = function() {
			bookmarksRef.child(this.pushID).remove();
		}

		this.update = function(name, link, desc) {
			var childToEdit = bookmarksRef.child(this.pushID);
			childToEdit.update({
				"name" : name,
				"link" : link,
				"description" : desc
			});
		}
	}

	// Search Bookmark
	function searchBM(uid, name) {
		for (var bm in bookmarksList) {
			if( (bookmarksList[bm].name === name) && (bookmarksList[bm].uid === uid) )
				return bm;
		}
	}

	// Get the list of bookmarks, and populate the "Your Bookmarks" panel
	bookmarksRef.on("child_added", function(snapshot) {
	 	var _bookmark_name = snapshot.val().name;
	 	var _bookmark_url = snapshot.val().link;
	 	var _bookmark_desc = snapshot.val().description;
	 	var newBookmark = new bookmark(snapshot.key(), authData.uid, _bookmark_name, _bookmark_url, _bookmark_desc);
	 	bookmarksList.push(newBookmark);
	 	if(snapshot.val().uid === authData.uid) {
			newBookmark.addToUI();
		}
	}, function (errorObject) {
	  	alert("Failed to retrive bookmarks list");
	});

	//	Expand bookmark description
	$('#bookmarks-list').on('click','.list-group-item > h4 > .glyphicon-chevron-down',function() {
		$(this).parent().parent().find('.bm-desc').toggle();
	});

	// Add bookmark
	$('#add-bookmark').click(function() {
		var _bookmark_name = $('#new-bookmark-form #bm-name input').val();
		var _bookmark_url = $('#new-bookmark-form #bm-link input').val();
		var _bookmark_desc = $('#new-bookmark-form #bm-description input').val();
		var newBookmark = new bookmark("default", authData.uid, _bookmark_name, _bookmark_url, _bookmark_desc);
		newBookmark.save();
	});

	// Delete bookmark
	$(document).on('click','.delete-bookmark',function() {
		var $parentElement = $(this).parent().parent();
		var _bookmark_name = $parentElement.find('h4').find('a').html();
		// Find the index of the bookmark to b deleted in bookmarksList[]
		var bm_to_delete = searchBM(authData.uid,_bookmark_name);
		// Remove from DB
		bookmarksList[bm_to_delete].deleteBM();
		// Remove from UI
		$(this).parent().parent().remove();
		// Delete the bookmark from bookmarksList[]
		bookmarksList.splice(bm_to_delete,1);
	});

	// Edit Bookmark
	$('#bookmarks-list').on('click','.edit-bookmark',function() {
		$('.cd-user-modal').addClass('is-visible');
		// Darken the background, and display the pop-up
		$('.overlay-back, .overlay').fadeIn(500);
		var $bookmarkObj = $(this).parent().parent();
		// Get bookmark-to-be-edited details from UI
		var edit_bm_name = $bookmarkObj.find('h4').find('a').html();
		var edit_bm_link = $bookmarkObj.find('p').html();
		var edit_bm_desc = $bookmarkObj.find('div').find('p').html();
		// Populate the "edit-bookmark pop-up" 
		$('#edit-bm-name input').val(edit_bm_name);
		$('#edit-bm-link input').val(edit_bm_link);
		$('#edit-bm-description input').val(edit_bm_desc);
	});

	// Save edited bookmark
	$('#save-bookmark').click(function() {
		// Search for the corresponding bookmark object from the bookmarksList[]
		var edit_bm_name = $('#edit-bm-name input').val();
		var edit_bm_link = $('#edit-bm-link input').val();
		var edit_bm_desc = $('#edit-bm-description input').val();
		var bm_to_edit = searchBM(authData.uid,edit_bm_name);
		bookmarksList[bm_to_edit].update(edit_bm_name,edit_bm_link,edit_bm_desc);
		// trigger close pop-up
		$('.close-pop-up').trigger("click");
		location.reload();
	});

	// Close Edit pop-up window
	$('.close-pop-up').click(function() {
		$('.overlay, .overlay-back').hide();
		$('.cd-user-modal').removeClass('is-visible');
	});


//  *********************************************************************************************

	// Logout
	$('#logoutbutton').click(function() {
		myFirebaseRef.unauth();
		alert("Logged out!");
		var url = "index.html";    
		$(location).attr('href',url);
	});
});