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
	this.course_bag = []
	this.doShit = function() {
		this.course_bag = ['aoeu'];
		alert(this.course_bag);
	}
}

SOCParser = function() {
	
}

function isDuplicateCourse(courseString) {
	for(i in COURSE_BAG) {
		if(COURSE_BAG[i].title == courseString) {
			return true;
		}
	}
	return false;
}

function clearAllEvents() {
	jQuery('#calendar').weekCalendar('clear');
	COURSE_BAG = [];
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

function getCorrectLowerHeights() {
	var heights = function() {
		if(jQuery('#header').is(":visible")) {
			return jQuery(window).height() - jQuery('#header').outerHeight() - jQuery('#controls').outerHeight();
		} else {
			return jQuery(window).height() - jQuery('#controls').outerHeight();
		}
	}
	
	return heights();
}

function resizeLowerContent() {
	var heights = getCorrectLowerHeights();
	jQuery('#school').css('height', heights);
	jQuery('#calendar').weekCalendar('resizeCalendar', heights);
}

jQuery(document).ready(function() {
	var courseManager = new CourseManager();
	
	jQuery('#school').css('height', getCorrectLowerHeights());
	
	//initialize calendar
	jQuery('#calendar').weekCalendar({
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
		height: function(jQuerycalendar){
			return getCorrectLowerHeights();
		},
		draggable : function(calEvent, element) {	return false; },
		resizable : function(calEvent, element) {	return false; },
		eventClick : function(calEvent, element) {		
			//handler for removing courses						
			for(i in COURSE_BAG) {
				if(calEvent.title == COURSE_BAG[i].title) {
					var removalID = COURSE_BAG[i].id;
					
					jQuery('#calendar').weekCalendar('removeEvent', removalID);
					delete COURSE_BAG[i];
				}
			}
			//
			//TODO: clean up undefined after 'deletes'
			//
		}
	});
	
	//switch calendar view to the static date, rather than today's view
	jQuery('#calendar').weekCalendar('gotoWeek',  new Date(START_YEAR, START_MONTH, START_DAY));
	
	//school handlers
	jQuery('#school').load(function() {
		var list = jQuery('.course-list', frames['school'].document);
		
		//hover over valid course
		jQuery("tr[valign*='top']", list).hover(
			function() {
				jQuery(this).css({'color': 'red', 'cursor': 'pointer'});
			},
			function() {
				jQuery(this).css({'color': 'black', 'cursor': 'default'});
			}
		);
		
		//click on course
		jQuery("tr[valign*='top']", list).click(function() {

			timeString = jQuery(this).find('td').eq(SCHEDULE_TIME_INDEX).html();
			
			if(timeString == null) {
				broadcastMessage("You didn't click on a course.");
				return false;
			};
			
			if(timeString.indexOf('TBA') != -1) {
				broadcastMessage("Course time is 'TBA'");
				return false;
			}
			
			//parse for course information
			var courseCode = jQuery(this).find('td').eq(SCHEDULE_CODE_INDEX).html();
			var courseType = jQuery(this).find('td').eq(SCHEDULE_TYPE_INDEX).html();
			var courseString = jQuery(this).prevAll().find('.CourseTitle:last').html();
			
			var courseName = constructCourseName(courseString, courseType, courseCode);
			if(isDuplicateCourse(courseName)) {
				broadcastMessage("You have already added that course!");
				return false;
			}
			
			var courseTime = getCourseTime(timeString);
			//scroll calendar viewport to expect newly added course events
			jQuery('#calendar').weekCalendar('scrollToHour', courseTime.startHour);
			
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
				jQuery('#calendar').weekCalendar('updateEvent', calEvents[i]);
				
				//add course to the master list of courses
				COURSE_BAG.push(calEvents[i]);
			}
		});
	});
	
	//other event handlers
	jQuery(window).resize(function() {
		resizeLowerContent();
	});
		
	jQuery('a#clear-calendar').click(function() {
		clearAllEvents();
		return false;
	});
	
	jQuery('a#pull-tab').toggle( function() {
			jQuery(this).html('More');
			var newHeight = jQuery(window).height() - jQuery('#controls').outerHeight();
			jQuery('#header').slideUp();
			jQuery('#school').css('height', newHeight);
			jQuery('#calendar').weekCalendar('resizeCalendar', newHeight);
		}, function() {
			jQuery(this).html('Less');
			var newHeight = jQuery(window).height() - jQuery('#header').outerHeight() - jQuery('#controls').outerHeight();
			jQuery('#header').slideDown();
			jQuery('#school').css('height', newHeight);
			jQuery('#calendar').weekCalendar('resizeCalendar', newHeight);
		}
	);
	
});