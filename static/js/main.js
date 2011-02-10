var SCHEDULE_CODE_INDEX = 0;
var SCHEDULE_TYPE_INDEX = 1;
var SCHEDULE_TIME_INDEX = 5;

var COURSE_BAG = [];

var START_YEAR = 2010; //static calendar year
var START_MONTH = 4; //static calendar month (May)
var START_DAY = 3; //Monday the 3rd 

var ID_COUNT = 0;

function broadcastMessage(message) {
	alert(message);
}

function genID() {
	ID_COUNT += 1;
	return ID_COUNT;
}



Utils = function() {
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
		]
		
		return palette[Math.floor(Math.random() * palette.length)];
	}
}


CourseManager = function() {
	//courseBag contains calEvents
	this.courseBag = []
	
	this.clearCourseBag = function() {
		this.courseBag = [];
	}
	
	this.addToBag = function(calEvent) {
		this.courseBag.push(calEvent);
	}
}

SOCParser = function() {
	
}

APCalendar = function(courseManager) {
	this.initCalendar = function() {
		$('#calendar').weekCalendar({
			readonly: true,
			timeslotsPerHour: 4,
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
				
				for(i in bag) {
					if(calEvent.title == bag[i].title) {
						var removalID = bag[i].id;
						$('#calendar').weekCalendar('removeEvent', removalID);
						delete bag[i];
					}
				}
				//
				//TODO: clean up undefined after 'deletes'
				//
			}
		});
		
		//switch calendar view to the static date, rather than today's view
		$('#calendar').weekCalendar('gotoWeek',  new Date(START_YEAR, START_MONTH, START_DAY));
		
	}
	this.clearAllEvents = function() {
		$('#calendar').weekCalendar('clear');
		courseManager.clearCourseBag();
	}
}

function isDuplicateCourse(courseString) {
	for(i in COURSE_BAG) {
		if(COURSE_BAG[i].title == courseString) {
			return true;
		}
	}
	return false;
}

//parses course string into readable format ie. INF 41 Software Reqs
function constructCourseName(courseString, courseType, courseCode) {
	//removing the course name for now...it takes up too much space
	//courseName = courseString.match(/<b>.*<\/b>/)[0].replace(/<.{1,2}>/g, '');

	courseNumber = courseString.match(/&nbsp;.*<font/i)[0].replace('<font', '').replace(/&nbsp;/g, '').replace(/\s{2,}/g, ' ');
	
	return (courseNumber + courseType + '<br/>(' + courseCode + ')');
}

//returns an array containing the days a course occurs on
function getCourseDays(timeString) {
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
}

//takes course time info and converts into JS Date hour and minute
//9:30-10:50p
function getCourseTime(timeString) {
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
	
	//if end time goes into afternoon, do magic to convert
	//into 24 hour times
	if(inPM == 'p') {
		if(endHour < 12) {
			endHour += 12;
			
			if(startHour >= 1 && startHour < 12) {
				startHour += 12;
			}
		}
	} 
	
	//alert('start: ' + startHour + ':' + startMin + ' end: ' + endHour + ':' + endMin);
	
	var time = {
		"startHour": startHour,
		"startMin": startMin,
		"endHour": endHour,
		"endMin": endMin
	};
	
	return time;
}

//returns an array of calEvents
function createEvents(courseName, courseDates, courseTime) {
	var calEvents = [];

	for(i in courseDates) {
		var e = {	
			"id": genID(),
			"start": new Date(START_YEAR, START_MONTH, courseDates[i], courseTime.startHour, courseTime.startMin),
			"end": new Date(START_YEAR, START_MONTH, courseDates[i], courseTime.endHour, courseTime.endMin),
			"title": courseName
		};
		
		calEvents.push(e);
	}
	
	return calEvents;
}

WindowManager = function() {
	this.getCorrectBottomSectionHeight = function() {
		var heights = function() {
			if($('#header').is(":visible")) {
				return $(window).height() - $('#header').outerHeight() - $('#controls').outerHeight();
			} else {
				return $(window).height() - $('#controls').outerHeight();
			}
		}

		return heights();
	},
	this.resizeBottomSectionHeight = function() {
		var heights = this.getCorrectBottomSectionHeight();
		$('#school').css('height', heights);
		$('#calendar').weekCalendar('resizeCalendar', heights);
	}
}

$(document).ready(function() {
	var courseManager = new CourseManager();
	var socParser = new SOCParser();
	var apCalendar = new APCalendar(courseManager);
	var windowManager = new WindowManager();
	
	$('#school').css('height', windowManager.getCorrectBottomSectionHeight());
	
	//initialize calendar
	apCalendar.initCalendar();

	//school handlers
	$('#school').load(function() {
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
		
		//click on course
		$("tr[valign*='top']", list).click(function() {

			timeString = $(this).find('td').eq(SCHEDULE_TIME_INDEX).html();
			
			if(timeString == null) {
				broadcastMessage("You didn't click on a course.");
				return false;
			};
			
			if(timeString.indexOf('TBA') != -1) {
				broadcastMessage("Course time is 'TBA'");
				return false;
			}
			
			//parse for course information
			var courseCode = $(this).find('td').eq(SCHEDULE_CODE_INDEX).html();
			var courseType = $(this).find('td').eq(SCHEDULE_TYPE_INDEX).html();
			var courseString = $(this).prevAll().find('.CourseTitle:last').html();
			
			var courseName = constructCourseName(courseString, courseType, courseCode);
			if(isDuplicateCourse(courseName)) {
				broadcastMessage("You have already added that course!");
				return false;
			}
			
			var courseTime = getCourseTime(timeString);
			//scroll calendar viewport to expect newly added course events
			$('#calendar').weekCalendar('scrollToHour', courseTime.startHour);
			
			//create the array of cal events
			var calEvents = createEvents(
				courseName,
				getCourseDays(timeString), 
				courseTime
			);
			
			//generate color for the event
			var utils = new Utils();
			var colorPairing = utils.getRandColorPair();
			
			//create the course events
			for(i in calEvents) {
				//assign the colors
				calEvents[i].color = colorPairing.color;
				calEvents[i].borderColor = colorPairing.borderColor;

				//create the events
				$('#calendar').weekCalendar('updateEvent', calEvents[i]);
				
				//add course to the master list of courses
				courseManager.addToBag(calEvents[i]);
				alert(courseManager.courseBag);
			}
		});
	});
	
	//other event handlers
	$(window).resize(function() {
		windowManager.resizeBottomSectionHeight();
	});
		
	$('a#clear-calendar').click(function() {
		courseManager.clearCourseBag();
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
	
});