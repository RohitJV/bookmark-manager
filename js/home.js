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

	/*
		Help and FAQ
	*/

	// Get the list of users, and populate the "People on Bookmark Manager"
	var usersRef = myFirebaseRef.child("users");
	var usersList = []; // list of all users
	usersRef.on("child_added", function(snapshot) {
	 	console.log(snapshot.val());
	 	$('#users-list').append('<li class="list-group-item" style="text-align:center">' + snapshot.val().email + '</li>');
	 	usersList.push(snapshot.val());
	 	if(snapshot.val().uid === authData.uid) {
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
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-trash delete-bookmark" aria-hidden="true"></span> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-pencil edit-bookmark" aria-hidden="true"></span> \
									    		<p class="desc">'+this.description+'</p> \
									    		<div class="dropdown addToFolder" style="text-align:right"> \
											      <button class="btn btn-default dropdown-toggle" type="button" id="addToFolderButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"> \
											        Add To Folder \
											        <span class="caret"></span> \
											      </button> \
											      <ul class="dropdown-menu dropdown-menu-right" style="width:250px;overflow:auto" aria-labelledby="addToFolderButton"> \
											      	<div class="input-group"> \
														<input type="text" class="form-control" placeholder="New Folder"> \
														<span class="input-group-btn"> \
													    	<button class="btn btn-success newFolder" type="button">Add</button> \
													    </span> \
													</div> \
													<hr/> \
											      </ul> \
											    </div> \
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
	 	var newBookmark = new bookmark(snapshot.key(), snapshot.val().uid, _bookmark_name, _bookmark_url, _bookmark_desc);
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

	/*
		Folders
	*/

	var foldersRef = myFirebaseRef.child("folders");
	var foldersList = []; // list of all folders

	function folder(pushID, uid, name, listBM, imgNum) {
		this.pushID = pushID;
		this.uid = uid;
		this.name = name;
		this.listBM = listBM;
		this.arrayBM = listBM.split(',');
		this.imgNum = imgNum;

		var that = this;

		this.save = function() {
			var newEntry = foldersRef.push({
				uid : that.uid,
				name : that.name,
				bookmarks : that.listBM,
				imgNum : that.imgNum
			});
		}

		this.addToUI = function() {
			$('.addToFolder > ul').append('<li><a>' + that.name + '</a></li>');
			$('.folders').append('<div class="folder col-xs-6 col-md-3" id="'+ that.name +'"> \
				    <a class="thumbnail"> \
				      <img src="static/images/img'+ that.imgNum +'.jpg" alt="..."> \
				      <div class="caption"> \
				      	<h4 style="text-align:center">'+ that.name +'</h4> \
				      </div> \
				    </a> \
				  </div>');
		}

		this.update = function(listBM) {
			var childToEdit = foldersRef.child(that.pushID);
			childToEdit.update({
				"bookmarks" : listBM
			});
		}

		this.addBookmark = function(bm) {
			if(that.arrayBM.indexOf(bm) === -1) {
				that.arrayBM.push(bm);
				that.listBM = that.listBM + "," + bm;
				that.update(that.listBM);
			}
		}
	}

	// Search Folder
	function searchFolder(uid, name) {
		for (var f in foldersList) {
			if( (foldersList[f].name === name) && (foldersList[f].uid === uid) )
				return f;
		}
	}

	// Get the list of bookmarks, and populate the "Your Folders" panel
	foldersRef.on("child_added", function(snapshot) {
	 	var _folder_name = snapshot.val().name;
	 	var _folder_listBM = snapshot.val().bookmarks;
	 	var _folder_imgNum = snapshot.val().imgNum;
	 	var newFolder = new folder(snapshot.key(), snapshot.val().uid, _folder_name, _folder_listBM, _folder_imgNum);
	 	foldersList.push(newFolder);
	 	if(snapshot.val().uid === authData.uid) {
			newFolder.addToUI();
		}
	}, function (errorObject) {
	  	alert("Failed to retrive bookmarks list");
	});

	// Add Bookmark to Folder
	$('#bookmarks-list').on('click','.addToFolder > ul > li > a',function() {
		// Get index of the folder
		var f_idx = searchFolder(authData.uid, $(this).html());
		var $parentElement = $(this).parent().parent().parent().parent().parent();
		var _bookmark_name = $parentElement.find('h4').find('a').html();
		var bm_idx = searchBM(authData.uid, _bookmark_name)
		foldersList[f_idx].addBookmark(bookmarksList[bm_idx].pushID);
	})

	// Add new folder
	$('#bookmarks-list').on('click','.newFolder',function() {
		var _folder_name = $(this).parent().parent().find('input').val();
		if(  _folder_name === '' )
			alert("Folder name cannot be empty!");
		else {
			// Add to Firebase
			var _folder_imgNum = Math.floor( (Math.random()*5)+1 );
			var newFolder = new folder("default", authData.uid, _folder_name, "", _folder_imgNum);
			newFolder.save();
		}
	});

//  *********************************************************************************************
	// Logout
	$('#logoutbutton').click(function() {
		myFirebaseRef.unauth();
		alert("Logged out!");
		var url = "index.html";    
		$(location).attr('href',url);
	});

	// Profile
	$('#profilebutton').click(function() {
		window.open("profile.html","","height=600, width=1000");
	});
});