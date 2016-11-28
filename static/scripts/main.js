/**
 * 
 */


$(window).resize( function(){
        var windowHeight = $(window).height();    
	$('.expandable').each(function(i, el){
	    var maxHeight = windowHeight - el.offsetTop - 20;
	    $(el).css('max-height', maxHeight+'px'); //set max height
	});	       
});





define([ 'require', 'jquery', 'angular' ], function(r, $, ng) {

	var mainApp = ng.module('mainApp', [ 'ngRoute' ]);

	// ============= Services =============================

	mainApp.service('ImageUploadService', [ '$rootScope', function($rootScope) {
		this.nUploads = 0;
		this.uploadSize = 0;
		this.images = [ ];
		this.uploadQueue = [ ];
		
		this.uploadFile = function(file, scope){
			if(!file){
				return;
			}
			this.nUploads ++;			
			var ImageUploadService = this;
			var reader = new FileReader();
			reader.onloadend = (function() {
				var finner = file;
				return function(e) {
					var dat = btoa(e.target.result);
					var imObject = JSON.stringify({
						filename: finner.name,
						archiveName: scope.archiveName,
						data: dat
					});					
					$.ajax({
						type: "POST",
						url: "rest/images",
						data: imObject,
						dataType: "application/json",
						contentType: "application/json"
					}).always(function(response,status,xhr){
						var data = JSON.parse(response.responseText);
						//ImageUploadService.addThumb(data.filename,data.thumbnail);
						scope.images.push({
							filename : data.filename,
							archive: scope.archiveName,
							data : data.thumbnail,
							selected: false
						});		
						ImageUploadService.nUploads --;
						//"this" should be ImageUploadService
						scope.progress = ImageUploadService.getProgress();
						scope.showProgress = (scope.progress < 100)?true:false;
						scope.$apply();
						if(ImageUploadService.uploadQueue.length > 0){
							ImageUploadService.uploadFile(ImageUploadService.uploadQueue.pop(), scope);
						}
						else{
						    ImageUploadService.uploadSize = 0;
						}
					});																						
					/*$http({
						url: "rest/images",
						method: 'POST',
						data: JSON.stringify({recipe: "recipe"}),
						headers: {'Content-Type': 'application/json'}
							//angular.toJson({}
							{
								'filename': 'finner.name'
								//TODO: this line threw a json parse error in $http
								//data: btoa(e.target.result)
							}
							//)
					});*/
				};
			})();
			reader.readAsBinaryString(file);
		};
		
		this.queueFiles = function(files, scope){
			this.uploadSize = files.length;
			for (var i = 0, file; i < files.length; i++) {
				file = files[i];
				if (file.type.indexOf("image") == 0) {
					this.uploadQueue.push(file);
					if (this.nUploads < 2){
						this.uploadFile(this.uploadQueue.pop(), scope);
					}
				}
			}
			
		};
		
		this.reset = function(callback){
		    this.images = [];
		    callback();
		};
		
		this.getProgress = function(){
			if (this.uploadsize === -1){
				return 'null';
			}
			if (this.uploadSize === 0){
				return 100;
			}
			return ((this.uploadSize - this.uploadQueue.length) / this.uploadSize) *100;
		};

	} ]);
	
	mainApp.service('ArchiveService',[function(){
		
		this.getArchives = function(Fn){
			var Fn = Fn;
			$.ajax({
				type: "GET",
				url: "rest/archives",				
				dataType: "application/json"
			}).always(function(response,status,xhr){
				Fn(JSON.parse(response.responseText)['return']);
			});
		};
	}]);
	
	mainApp.service('ImageListService',[function(){
		
		this.getImageList = function(arch, Fn){
			var Fn = Fn;
			$.ajax({
				type: "GET",
				url: "rest/archives/"+arch,				
				dataType: "application/json"
			}).always(function(response,status,xhr){
				Fn(JSON.parse(response.responseText)['return']);
			});
		};
	}]);
	
	mainApp.service('ImageService', [function(){
		this.images = {};
		this.queueImageDownloads = function(arch, filenames, callback){
			var ImageService = this;
			filenames.forEach(function(filename){
				if(!(arch in ImageService.images)){
					ImageService.images[arch] = [];
				}
				var missing = true;
				for(var i = 0; i < ImageService.images[arch].length; i++){
					if(ImageService.images[arch][i].filename === filename){
						missing = false;
					}
				}
				if(missing === true){					
					$.ajax({
						type: "GET",
						url: "rest/archives/"+arch+"/"+filename+"?thumbnail=True",				
						dataType: "application/json"
					}).always(function(response,status,xhr){
						ImageService.images[arch].push(JSON.parse(response.responseText)['return']);
						callback();
					});
				}
			});
			callback();
		};
		this.zipDownload = function(images){
		    var dat = JSON.stringify(images);
		    console.log(dat);
		    $.ajax({
			type: "POST",
			url: "rest/zip",
			data: dat,
			contentType: "application/json",
			dataType: "application/json"
		}).always(function(response,status,xhr){
		    var iframe = document.createElement('iframe');
		    iframe.setAttribute('display', 'none');
		    document.getElementsByTagName('body')[0].appendChild(iframe);
		    response = JSON.parse(response.responseText)
		    console.log(response)
		    console.log(response['return'])
		    iframe.src = response['return'];
		});
		};
		
		this.getImage = function(image, Fn){
		    $.ajax({
			type: "GET",
			url: "rest/archives/"+image.archive+"/"+image.filename+"?thumbnail=False",				
			dataType: "application/json"
		    }).always(function(response,status,xhr){
			Fn(JSON.parse(response.responseText)['return']);			
		    });
		}
	}]);

	// ============== Directives ===================

	// This directive only seems to work with all lower case name?
	mainApp.directive('phtheader', function() {
		return {
			restrict : 'E',
			replace : 'true',
			templateUrl : 'templates/header.html'
		};
	});

	mainApp.directive('imageCell', function() {
		return {
			restrict : 'A',
			templateUrl : 'templates/imagecell.html',
			link: function(scope, iElement, iAttrs, controller, transcludeFn){
				
			}
		};
	});

	mainApp.directive('fileDrop', [
			'ImageUploadService',
			'$http',
			function(ImageUploadService, $http) {
				return {
					restrict : 'A',
					link : function(scope, iElement, iAttrs, controller,
							transcludeFn) {
						iElement['0'].addEventListener('dragover', function(e) {
							e.stopPropagation();
							e.preventDefault();
							e.target.style.color = "#F60";
						});
						iElement['0'].addEventListener("dragleave",
								function(e) {
									e.stopPropagation();
									e.preventDefault();
									e.currentTarget.style.color = "#000";
								});
						iElement['0'].addEventListener("drop", function(e) {							
							e.stopPropagation();
							e.preventDefault();	
							e.currentTarget.style.color = "#000";
							ImageUploadService.queueFiles(e.dataTransfer.files, scope);							
						});
					}
				};

			} ]);

	// ================ Filters ======================
	
	mainApp.filter('summary', function(){
		return function(string, limit){
			if (string.length <= limit){
				return string;
			}
			return string.substring(0,limit-3) + '...';
		};
	});
	
	mainApp.filter('selected', function(){
		return function(images){
			var selectedImages = [];
			for(var i = 0; i < images.length; i++){
				var im = images[i];
				if (im.selected === true){
					selectedImages.push(im);
				}
			}
			return selectedImages;
		};
	});

	// ================ controllers ===================

	mainApp.controller('UploadController', [ '$scope', 'ImageUploadService',
			function($scope, ImageUploadService) {
                    	    $('li').removeClass('active');	
                    	    $('#upload-link').addClass('active');
				$scope.$on('images.update', function() {
					$scope.images.push(ImageUploadService.getNewImages());
					$scope.progress = ImageUploadService.getProgress();
					$scope.showProgress = ($scope.progress < 100)?true:false;
					$scope.$apply();
				});

				$scope.images = ImageUploadService.images;
				$scope.progress = 100;
				$scope.showProgress = false;
				d = new Date();
				ISOdate = d.toISOString();
				i = ISOdate.lastIndexOf(':');
				$scope.archiveName = ISOdate.substring(0,i);

				$scope.clear = function(){
				    ImageUploadService.reset(function(){
					$scope.images = ImageUploadService.images;
					$scope.archiveName = ISOdate.substring(0,i);
					$scope.$apply();
				    });				    
				};

			} ]);

	mainApp.controller('ImageViewerController', [ '$scope', 'ArchiveService','ImageListService','ImageService', function($scope, ArchiveService, ImageListService, ImageService) {
	    $('li').removeClass('active');	
	    $('#peruse-link').addClass('active');
	    //Angular's version of $(document).ready()
	    $scope.$on('$viewContentLoaded',function(){
		var windowHeight = $(window).height();    
		$('.expandable').each(function(i, el){
		    var maxHeight = windowHeight - el.offsetTop - 20;
		    $(el).css('max-height', maxHeight+'px'); //set max height
		});
	    });
	    $scope.imageslib = ImageService.images;
		$scope.images = [];
		$scope.currentArchive = "";
		$scope.progress = 100;
		$scope.showProgress = false;
		$scope.zoomImage = {};
		$scope.showZoom = false;
		//This function should fetch updated image data AND retain any selection data for current images.
		$scope.populateImages = function(archive){
			ImageListService.getImageList(archive, function(filenames){
				ImageService.queueImageDownloads(archive,filenames,function(){						
					$scope.images = $scope.imageslib[archive];
					$scope.$apply();
				});
			});			
		};
		$scope.select= function(index) {
		     $scope.selected = index; 
		};
			    
		$scope.zoom = function(image){
		    ImageService.getImage(image,function(im){
			$scope.zoomImage = im;
			$scope.$apply();
		    });
		    $scope.showZoom = true;
		};
		
		ArchiveService.getArchives(function(data){
			$scope.archives = data;
			$scope.$apply();
		});
		
		

	} ]);
	
	
	mainApp.controller('AlbumController',['$scope','ImageService',function($scope,ImageService){
	    $('li').removeClass('active');	
	    $('#album-link').addClass('active');
		$scope.images = [];
		for (var archive in ImageService.images){
			ImageService.images[archive].forEach(function(image){
				if(image.selected === true){
					$scope.images.push(image);
				}
			});
		}
		$scope.download = function(){
			var images_meta = []
			for(var i_img in $scope.images){
				img = $scope.images[i_img]
				images_meta.push({'filename':img["filename"],
								 'archive':img["archive"]});
			}
		    ImageService.zipDownload(images_meta);
		};
	}]);

	// ============ Routes ========================

	mainApp.config([ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/upload', {
			templateUrl : 'templates/imageupload.html',
			controller : 'UploadController'
		}).when('/view', {
			templateUrl : 'templates/imageviewer.html',
			controller : 'ImageViewerController'
		}).when('/album',{
			templateUrl : 'templates/albummanager.html',
			controller : 'AlbumController'
		}).otherwise({
			redirectTo : '/view'
		});
	} ]);

});