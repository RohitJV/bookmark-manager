function genTemplate(name, link, desc) {
	return '<div class="list-group-item" > \
											<h4 class="list-group-item-heading" style="text-align:left"><a href="'+link+'"">'+name+'</a> \
									    		<span style="float:right" class="glyphicon glyphicon-chevron-down" aria-hidden="true" title="Expand"></span> \</h4> \
									    	<p class="list-group-item-text">'+link+'</p> \
									    	<div class="bm-desc"> \
									    		<hr/> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-trash delete-bookmark red" aria-hidden="true" title="Delete"></span> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-pencil edit-bookmark blue" aria-hidden="true" title="Edit"></span> \
									    		<p class="desc">'+desc+'</p> \
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
									  	</div>'
}


function genFolderTemplate(name, imgNum) {
	return '<div class="folder col-xs-6 col-md-3" id="'+ name +'"> \
				    <a class="thumbnail"> \
				      <img src="static/images/img'+ imgNum +'.jpg" alt="..."> \
				      <div class="caption"> \
				      	<h4 style="text-align:center">'+ name +'</h4> \
				      </div> \
				    </a> \
				  </div>';
}

function genFolderBookmarkTemplate(_bm_name, _bm_link, _bm_desc) {
	return '<div class="list-group-item"> \
											<h4 class="list-group-item-heading" style="text-align:left"><a href="'+_bm_link+'"">'+_bm_name+'</a> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-chevron-down" aria-hidden="true" title="Expand"></span> \
									    		<span style="float:right;padding-left:10px;" class="glyphicon glyphicon-remove red" aria-hidden="true" title="Remove from this Folder"></span> \</h4> \
									    	<p class="list-group-item-text">'+_bm_link+'</p> \
									    	<div class="bm-desc"> \
									    		<hr/> \
									    		<p class="desc">'+_bm_desc+'</p> \
									    	</div> \
									  	</div>';
}