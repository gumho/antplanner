app = {
	'START_YEAR': 2010, //static calendar year
	'START_MONTH': 4, //static calendar month (May)
	'START_DAY': 3 //Monday the 3rd
}

session = {
	'genID': function() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}
}

function Utils() {
	this.getRandColorPair = function() {
		var palette = [
			{color: '#C4A883', borderColor: '#B08B59'},
			{color: '#A7A77D', borderColor: '#898951'},
			{color: '#85AAA5', borderColor: '#5C8D87'},
			{color: '#94A2BE', borderColor: '#5C8D87'},
			{color: '#8997A5', borderColor: '#627487'},
			{color: '#A992A9', borderColor: '#8C6D8C'},
			{color: '#A88383', borderColor: '#A87070'},
			{color: '#E6804D', borderColor: '#DD5511'},
			{color: '#F2A640', borderColor: '#EE8800'},
			{color: '#E0C240', borderColor: '#D6AE00'},
			{color: '#BFBF4D', borderColor: '#AAAA11'},
			{color: '#8CBF40', borderColor: '#66AA00'},
			{color: '#4CB052', borderColor: '#109618'},
			{color: '#65AD89', borderColor: '#329262'},
			{color: '#59BFB3', borderColor: '#22AA99'},
			{color: '#668CD9', borderColor: '#3366CC'},
			{color: '#668CB3', borderColor: '#336699'},
			{color: '#8C66D9', borderColor: '#6633CC'},
			{color: '#B373B3', borderColor: '#994499'},
			{color: '#E67399', borderColor: '#DD4477'},
			{color: '#D96666', borderColor: '#CC3333'}
		];
		
		return palette[Math.floor(Math.random() * palette.length)];
	};
};


function CourseManager() {
	//courseBag contains calEvents
	this.courseBag = [];
	
	this.clearCourseBag = function() {
		this.courseBag = [];
	};
	
	this.addToBag = function(calEvent) {
		this.courseBag.push(calEvent);
	};
	
	this.isDuplicateCourse = function(courseString) {
		for(var i in this.courseBag) {
			if(this.courseBag[i].title == courseString) {
				return true;
			}
		}
		return false;
	};
	
	//constructs a legible course description (HTML-ized)
	this.constructCourseName = function(courseString, courseType, courseCode) {
		//removing the course name for now...it takes up too much space
		//courseName = courseString.match(/<b>.*<\/b>/)[0].replace(/<.{1,2}>/g, '');

		courseNumber = courseString.match(/&nbsp;.*<font/i)[0].replace('<font', '').replace(/&nbsp;/g, '').replace(/\s{2,}/g, ' ');

		return (courseNumber + courseType + '<br/>(' + courseCode + ')');
	};
	
	this.getJSON = function() {
		//remove undefined
		var newArray = new Array();
		for(var i = 0; i<this.courseBag.length; i++){
			if (this.courseBag[i] != undefined){
				newArray.push(this.courseBag[i]);
			}
		}
		return encodeURIComponent(JSON.stringify(newArray));
	}
};

function APCalendar() {
	this.initCalendar = function(courseManager) {
		
		//keeps track of # of'remove course' clicks
		var numRemoveClicks = 0;
		
		$('#calendar').weekCalendar({
			readonly: true,
			timeslotsPerHour: 3,
			useShortDayNames: true,
			showHeaderDate: false,
			firstDayOfWeek: 1,
			daysToShow:5,
			businessHours: {start: 7, end: 23, limitDisplay: true},
			allowCalEventOverlap: true,
			overlapEventsSeparate: true,
			buttons: false,
			defaultEventLength: 0,
			height: function($calendar){
				var windowManager = new WindowManager();
				return windowManager.getCorrectBottomSectionHeight();
			},
			draggable : function(calEvent, element) {	return false; },
			resizable : function(calEvent, element) {	return false; },
			eventClick : function(calEvent, element) {		
				//handler for removing courses		
				var bag = courseManager.courseBag				
				for(var i in bag) {
					if(calEvent.title == bag[i].title) {
						var removalID = bag[i].id;
						$('#calendar').weekCalendar('removeEvent', removalID);
						delete bag[i];
					}
				}
				
				//Every 7 'remove' clicks, we get rid of all the null elements
				//in the courseBag. This is to keep the array growing and slowing 
				//down course adds when checking for duplicate courses. 
				if(numRemoveClicks % 7 == 0) {
					var nonNullBag = new Array();
					for(var i in bag) {
						if (bag[i] != null) {
							nonNullBag.push(bag[i]);
						}
					}
					courseManager.courseBag = nonNullBag;
				}
				
				numRemoveClicks += 1;
			}
		});
		
		//switch calendar view to the static date, rather than today's view
		$('#calendar').weekCalendar('gotoWeek',  new Date(app.START_YEAR, app.START_MONTH, app.START_DAY));
		
	};
	
	this.clearAllEvents = function() {
		$('#calendar').weekCalendar('clear');
	}
	
	this.addCourse = function(calEvent) {
		//create the events
		$('#calendar').weekCalendar('updateEvent', calEvent);
	}
	
	this.clearCalendar = function() {
		$('#calendar').weekCalendar('clear');
	};
	
	this.scrollToHour = function(startHour) {
		$('#calendar').weekCalendar('scrollToHour', startHour);
	};
	
	//returns an array of cal events
	this.createEventArray = function(courseName, courseDates, courseTime) {
		var calEvents = [];

		for(var i in courseDates) {
			var e = {	
				"id": session.genID(),
				"start": new Date(app.START_YEAR, app.START_MONTH, courseDates[i], courseTime.startHour, courseTime.startMin),
				"end": new Date(app.START_YEAR, app.START_MONTH, courseDates[i], courseTime.endHour, courseTime.endMin),
				"title": courseName
			};

			calEvents.push(e);
		}

		return calEvents;
	};
	
};

function CalendarCourseBridge(courseManager, calendar) {
	this.addEvent = function(calEvent) {
		courseManager.addToBag(calEvent);
		calendar.addCourse(calEvent);
	}
	
	this.clearAllEvents = function() {
		courseManager.clearCourseBag();
		calendar.clearCalendar();
	}
	
	this.loadCourses = function(calEvents) {
		this.clearAllEvents();
		
		for(i in calEvents) {
			this.addEvent(calEvents[i]);
		}
	}
	
	this.getCourseManager = function() {
		return courseManager;
	}
	
	this.getCalendar = function() {
		return calendar;
	}
}

//static-able
function CourseUtils() {
	//based on time string, will return an array
	//containing which days the course will occur
	this.parseDays = function(timeString) {
		//READ: WORKAROUND
		//Because the week calendar library does not support recurring
		//events, a single week in time has been selected to represent 
		//a typical week for a school quarter. See date constants above.

		var days = [];
		days['M'] = 3;
		days['Tu'] = 4;
		days['W'] = 5;
		days['Th'] = 6;
		days['F'] = 7;

		var courseDates = [];

		if(timeString.indexOf('M') != -1) {	courseDates.push(days['M']); } 
		if(timeString.indexOf('Tu') != -1) { courseDates.push(days['Tu']); } 
		if(timeString.indexOf('W') != -1) {	courseDates.push(days['W']); }
		if(timeString.indexOf('Th') != -1) { courseDates.push(days['Th']); }
		if(timeString.indexOf('F') != -1) {	courseDates.push(days['F']); }

		return courseDates;
	};
	
	//Takes a string of form like ThTh H:MM-H:MM[p] and returns object with the
	//start and end hours and minutes. NOTE that this algorithm that parses the 
	//times is based on my observations of the strings in WebSoc and on the assumption 
	//that all courses will fall during "school hours".
	this.parseTimes = function(timeString) {
		var inPM = timeString.charAt(timeString.length - 1);
		timeString = timeString.replace(/[a-zA-Z&;]/g,'');

		var splitTimes = timeString.split('-');
			var startTime = splitTimes[0];
			var endTime = splitTimes[1];

		var splitStart = startTime.split(':');
			var startHour = parseInt(splitStart[0]);
			var startMin = parseInt(splitStart[1]);

		var splitEnd = endTime.split(':');
			var endHour = parseInt(splitEnd[0]);
			var endMin = parseInt(splitEnd[1]);

		//If end time goes into afternoon, do magic to convert
		//into 24 hour times
		if(inPM == 'p') {
			if(endHour < 12) {
				endHour += 12;
			} 
			
			if(startHour < 8) {
				startHour += 12;
			}
		} 

		var time = {
			"startHour": startHour,
			"startMin": startMin,
			"endHour": endHour,
			"endMin": endMin
		};

		return time;
	} ;
};

//static-able
function WindowManager() {
	this.setSOCHeight = function() {
		$('#school').css('height', this.getCorrectBottomSectionHeight());
	}
	
	this.getCorrectBottomSectionHeight = function() {
		var heights = function() {
			if($('#header').is(":visible")) {
				return $(window).height() - $('#header').outerHeight() - $('#controls').outerHeight();
			} else {
				return $(window).height() - $('#controls').outerHeight();
			}
		}

		return heights();
	};
	this.resizeBottomSectionHeight = function() {
		var heights = this.getCorrectBottomSectionHeight();
		$('#school').css('height', heights);
		$('#calendar').weekCalendar('resizeCalendar', heights);
	};
	this.broadcastMessage = function(msg) {
		alert(msg);
	};
};

function SOCParser() {
	this.SCHEDULE_CODE_INDEX = 0;
	this.SCHEDULE_TYPE_INDEX = 1;
	this.SCHEDULE_PROF_INDEX = 4;
	this.SCHEDULE_TIME_INDEX = 5;
	
	this.getTimeString = function(element) {
		var timeString = $(element).find('td').eq(this.SCHEDULE_TIME_INDEX).html();

		if(timeString == null) {
			new WindowManager().broadcastMessage("You didn't click on a course.");
			return false;
		}
		
		if(timeString.indexOf('TBA') != -1) {
			new WindowManager().broadcastMessage("Course time is 'TBA'");
			return false;
		}
		
		return timeString;
	};
	
	this.getCourseCode = function(element) {
		return $(element).find('td').eq(this.SCHEDULE_CODE_INDEX).html();
	};
	
	this.getCourseType = function(element) {
		return $(element).find('td').eq(this.SCHEDULE_TYPE_INDEX).html();
	};
	
	this.getCourseProf = function(element) {
		return $(element).find('td').eq(this.SCHEDULE_PROF_INDEX).html();
	}
	
	this.getCourseString = function(element) {
		return $(element).prevAll().find('.CourseTitle:last').html();
	}
};

function SOC() {
	this.initSOC = function(bridge) {
		var list = $('.course-list', frames['school'].document);
		
		//hover over valid course
		$("tr[valign*='top']", list).hover(
			function() {
				$(this).css({'color': 'red', 'cursor': 'pointer'});
			},
			function() {
				$(this).css({'color': 'black', 'cursor': 'default'});
			}
		);
		
		//click on course (this should be placed on all tr's except instructor)
		$("tr[valign*='top']", list).click(function() {
			var socParser = new SOCParser();
			var courseUtils = new CourseUtils();
			
			//parse for course information
			var timeString = socParser.getTimeString(this);
			if(timeString == false) {
				return false;
			}
			var courseCode = socParser.getCourseCode(this);
			var courseType = socParser.getCourseType(this);
			var courseString = socParser.getCourseString(this);
			
			var courseName = bridge.getCourseManager().constructCourseName(courseString, courseType, courseCode);
			
			if(bridge.getCourseManager().isDuplicateCourse(courseName)) {
				new WindowManager().broadcastMessage("You have already added that course!");
				return false;
			}
			
			var courseTime = courseUtils.parseTimes(timeString);
			
			//scroll calendar viewport to expect newly added course events
			bridge.getCalendar().scrollToHour(courseTime.startHour);
			
			//create the array of cal events
			var calEvents = bridge.getCalendar().createEventArray(
				courseName,
				new CourseUtils().parseDays(timeString), 
				courseTime
			);
			
			//generate color for the event
			var utils = new Utils();
			var colorPairing = utils.getRandColorPair();
			
			//create the course events
			for(var i in calEvents) {
				//assign the colors:
				//we do this here because course sets must be the same color
				calEvents[i].color = colorPairing.color;
				calEvents[i].borderColor = colorPairing.borderColor;
				
				bridge.addEvent(calEvents[i]);
			}
		});
		
		// click on instructor
		$("tr[valign*='top'] td:nth-child(5)", list).click(function() {
			var prof = $(this).html();
			showProfessors(prof);
			return false; // prevent event bubbling
		});
		
		// instructor hover
		$("tr[valign*='top'] td:nth-child(5)", list).hover(
			function() {
				$(this).css({'text-decoration': 'underline', 'color': '#688FE7'});
			},
			function() {
				$(this).css({'text-decoration': 'none', 'color': 'black'});
			}
		);
	}
}

function showProfessors(nameString) {
	// name is the query string for professors
	var profTable = $('#prof-select');
	profTable.html('<tr><td style="border:0">Please wait while we grab results from RateMyProfessors.com</td></tr>');
	profTable.dialog('open');
	
	var trs = '<tr><th>Professor</th><th>Department</th><th>#&nbsp;Ratings</th><th>Quality</th><th>Easiness</th><th>Hot</th></tr>';
	nameList = nameString.split('<br>');
	
	$.ajax({
		url: "/prof",
		type: 'get',
		data: {'names': nameList},
		dataType: 'json',
		traditional: true,
		beforeSend: function() {
			$('body').css({'cursor': 'wait'});
		},
		success: function(data) {
			if (data.length > 0) {
				for (var i=0; i<data.length; i++) {
					var p = data[i];
					trs += '<tr><td><a href="'+p.href+'" target="_blank">'+p.name+'</a></td><td>'+p.dept+'</td><td>'+p.ratings+'</td><td>'+p.quality+'</td><td>'+p.easiness+'</td><td>'+p.hot+'</td></tr>';
				}
			} else {
				trs += '<tr><td>'+name+'</td><td>&nbsp;</td><td>0 found</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
			}
			profTable.html(trs);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			profTable.html('<tr><td>An error occured:</td></tr><tr><td>'+textStatus+'</td><td>'+errorThrown+'</td></tr>');
		},
		complete: function(jqXHR, textStatus) {
			$('body').css({'cursor': 'auto'});
		}
	});
}

$(document).ready(function() {
	var courseManager = new CourseManager();
	var apCalendar = new APCalendar();
	var bridge = new CalendarCourseBridge(courseManager, apCalendar);
	var windowManager = new WindowManager();
	var soc = new SOC();
	
	$('h2').click(function() {
		a = courseManager;
	});
	
	//set appropriate height for #school
	windowManager.setSOCHeight();
	
	//initialize calendar
	apCalendar.initCalendar(courseManager);

	//school on-load handler
	$('#school').load(function() {
		 soc.initSOC(bridge);
	});
	
	//other event handlers
	$(window).resize(function() {
		windowManager.resizeBottomSectionHeight();
	});
		
	$('a#clear-calendar').click(function() {
		bridge.clearAllEvents();
		return false;
	});
	
	$('a#pull-tab').toggle( function() {
			$(this).html('More');
			var newHeight = $(window).height() - $('#controls').outerHeight();
			$('#header').slideUp();
			$('#school').css('height', newHeight);
			$('#calendar').weekCalendar('resizeCalendar', newHeight);
		}, function() {
			$(this).html('Less');
			var newHeight = $(window).height() - $('#header').outerHeight() - $('#controls').outerHeight();
			$('#header').slideDown();
			$('#school').css('height', newHeight);
			$('#calendar').weekCalendar('resizeCalendar', newHeight);
		}
	);
	
	//toggles the save/load pop up
	$('a#save-load').toggle(function() {
		$(this).css('font-weight', 'bold');
		$('#save-pop-up').css('display', 'inline');
		
		//auto select all text in text field
		$('#save-pop-up input').select();

	}, function() {
		$(this).css('font-weight', 'normal');
		$('#save-pop-up').css('display', 'none');
	});
	
	//TODO: refactor
	$('a#save-button').click(function() {
		// TODO: MEGA - TODO
		// what if too many events?
		// user exists?
		// password...
		
		var username = $('#username_field').val();
		var courseJSON = courseManager.getJSON();
		
		$.ajax({
		  url: "/schedule/save",
		  type: 'post',
		  data: 'username=' + username + '&caldata=' + courseJSON,
		  dataType: 'json',
		  beforeSend: function() {
		  	//TODO: create separate function for validation
			if(username == 'Username') {
				windowManager.broadcastMessage("Please fill in a username.");
				return false;
			}
			else if(username.length < 5) {
				windowManager.broadcastMessage("Username must be at least 5 characters.");
				return false;
			}

			if(courseManager.courseBag.length < 1) {
				windowManager.broadcastMessage("Your calendar is empty, Please add a course before saving!")
				return false;
			} else if(courseManager.courseBag.length > 36) {
				windowManager.broadcastMessage("Your calendar contains too many courses, the limit is 36!")
				return false;
			}
			
		  },
		  success: function(data) {
			if(data.success == 'true') {
				windowManager.broadcastMessage("Courses successfully saved!");
			} else {
				windowManager.broadcastMessage("Oops...a problem occurred while saving courses. Please try again later. This exception will be reviewed by an administrator.");
			}
		  }
		});
		return false;
	});
	
	//TODO: refactor
	$('a#load-button').click(function() {
		// TODO: errors
		
		var username = $('#username_field').val();
		
		$.ajax({
		  url: "/schedule/load",
		  type: 'get',
		  data: 'username=' + username,
		  dataType: 'json',
		  beforeSend: function() {
			if(username == 'Username') {
				windowManager.broadcastMessage("Please fill in a username.");
				return false;
			}
			else if(username.length < 5) {
				windowManager.broadcastMessage("Username must be at least 5 characters.");
				return false;
			}
		  },
		  success: function(data) {
			if(data.success == 'true') {
				var calEvents = data.calEvents
				bridge.loadCourses(calEvents);
				windowManager.broadcastMessage("Courses successfully loaded!");
			} else {
				
			}

		  }
		});
		return false;
	});
	
	$('#prof-select').dialog({	
		autoOpen: false,
		modal: true,
		title: 'RateMyProfessors.com',
		width: 600,
		resizable: false,
		closeOnEscape: true,
		draggable: false
	});
	
});

//surprise!
if (top === self){}else{$(document).ready(function(){$('html').html('404 not found')});}
