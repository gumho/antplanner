from web.template import CompiledTemplate, ForLoop


def index():
    loop = ForLoop()
    _dummy  = CompiledTemplate(lambda: None, "dummy")
    join_ = _dummy._join
    escape_ = _dummy._escape

    def __template__():
        yield '', join_('<html>\n')
        yield '', join_('<head>\n')
        yield '', join_('        <title>Wtf</title>\n')
        yield '', join_('\n')
        yield '', join_("        <link rel='stylesheet' type='text/css' href='http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/start/jquery-ui.css' />\n")
        yield '', join_("        <link rel='stylesheet' type='text/css' href='/static/css/jquery.weekcalendar.css' />\n")
        yield '', join_("        <link rel='stylesheet' type='text/css' href='/static/css/main.css' />\n")
        yield '', join_('                \n')
        yield '', join_("        <script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js'></script>\n")
        yield '', join_("        <script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js'></script>\n")
        yield '', join_("        <script type='text/javascript' src='/static/js/jquery.weekcalendar.js'></script>\n")
        yield '', join_('        \n')
        yield '', join_('        <script type="text/javascript" charset="utf-8">\n')
        yield '', join_('        \n')
        yield '', join_('        var YEAR = 2010; //static calendar year\n')
        yield '', join_('        var MONTH = 4; //static calendar month (May)\n')
        yield '', join_('        var DAY = 3; //Monday the 3rd \n')
        yield '', join_('        \n')
        yield '', join_('        function broadcastMessage(message) {\n')
        yield '', join_('                alert(message);\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        function genID() {\n')
        yield '', join_('                return Math.floor(Math.random() * 101);\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        //parses course string into readable format ie. INF 41 Software Reqs\n')
        yield '', join_('        function parseCourseString(courseString) {\n')
        yield '', join_("                courseName = courseString.match(/<b>.*<\\/b>/)[0].replace(/<.{1,2}>/g, '');\n")
        yield '', join_("                courseNumber = courseString.match(/&nbsp;.*<font/)[0].replace('<font', '').replace(/&nbsp;/g, '').replace(/\\s{2,}/g, ' ');\n")
        yield '', join_('                \n')
        yield '', join_('                return (courseNumber + courseName);\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        //returns an array containing the days a course occurs on\n')
        yield '', join_('        function getCourseDays(timeString) {\n')
        yield '', join_('                //READ: WORKAROUND\n')
        yield '', join_('                //Because the week calendar library does not support recurring\n')
        yield '', join_('                //events, a single week in time has been selected to represent \n')
        yield '', join_('                //a typical week for a school quarter. See date constants above.\n')
        yield '', join_('                \n')
        yield '', join_('                var days = [];\n')
        yield '', join_("                days['M'] = 3;\n")
        yield '', join_("                days['Tu'] = 4;\n")
        yield '', join_("                days['W'] = 5;\n")
        yield '', join_("                days['Th'] = 6;\n")
        yield '', join_("                days['F'] = 7;\n")
        yield '', join_('                \n')
        yield '', join_('                var courseDates = [];\n')
        yield '', join_('                \n')
        yield '', join_("                if(timeString.indexOf('M') != -1) {\n")
        yield '', join_("                        courseDates.push(days['M']);\n")
        yield '', join_('                } \n')
        yield '', join_('                \n')
        yield '', join_("                if(timeString.indexOf('Tu') != -1) {\n")
        yield '', join_("                        courseDates.push(days['Tu']);\n")
        yield '', join_('                } \n')
        yield '', join_('                \n')
        yield '', join_("                if(timeString.indexOf('W') != -1) {\n")
        yield '', join_("                        courseDates.push(days['W']);\n")
        yield '', join_('                }\n')
        yield '', join_('                \n')
        yield '', join_("                if(timeString.indexOf('Th') != -1) {\n")
        yield '', join_("                        courseDates.push(days['Th']);\n")
        yield '', join_('                }\n')
        yield '', join_('                \n')
        yield '', join_("                if(timeString.indexOf('F') != -1) {\n")
        yield '', join_("                        courseDates.push(days['F']);\n")
        yield '', join_('                }\n')
        yield '', join_('                \n')
        yield '', join_('                return courseDates;\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        //takes course time info and converts into JS Date hour and minute\n')
        yield '', join_('        //9:30-10:50p\n')
        yield '', join_('        function getCourseTime(timeString) {\n')
        yield '', join_('                var inPM = timeString.charAt(timeString.length - 1);\n')
        yield '', join_("                timeString = timeString.replace(/[a-zA-Z&;]/g,'');\n")
        yield '', join_('                \n')
        yield '', join_("                var splitTimes = timeString.split('-');\n")
        yield '', join_("                        if(splitTimes == '') {\n")
        yield '', join_("                                broadcastMessage('Invalid time');\n")
        yield '', join_('                        }\n')
        yield '', join_('                        \n')
        yield '', join_('                        var startTime = splitTimes[0];\n')
        yield '', join_('                        var endTime = splitTimes[1];\n')
        yield '', join_('                \n')
        yield '', join_("                var splitStart = startTime.split(':');\n")
        yield '', join_('                        var startHour = parseInt(splitStart[0]);\n')
        yield '', join_('                        var startMin = parseInt(splitStart[1]);\n')
        yield '', join_('        \n')
        yield '', join_("                var splitEnd = endTime.split(':');\n")
        yield '', join_('                        var endHour = parseInt(splitEnd[0]);\n')
        yield '', join_('                        var endMin = parseInt(splitEnd[1]);\n')
        yield '', join_('                \n')
        yield '', join_('                //if end time goes into afternoon, do magic to convert\n')
        yield '', join_('                //into 24 hour times\n')
        yield '', join_("                if(inPM == 'p') {\n")
        yield '', join_('                        if(endHour < 12) {\n')
        yield '', join_('                                endHour += 12;\n')
        yield '', join_('                                \n')
        yield '', join_('                                if(startHour >= 1 && startHour < 12) {\n')
        yield '', join_('                                        startHour += 12;\n')
        yield '', join_('                                }\n')
        yield '', join_('                        }\n')
        yield '', join_('                } \n')
        yield '', join_('                \n')
        yield '', join_("                //alert('start: ' + startHour + ':' + startMin + ' end: ' + endHour + ':' + endMin);\n")
        yield '', join_('                \n')
        yield '', join_('                var time = {\n')
        yield '', join_('                        "startHour": startHour,\n')
        yield '', join_('                        "startMin": startMin,\n')
        yield '', join_('                        "endHour": endHour,\n')
        yield '', join_('                        "endMin": endMin\n')
        yield '', join_('                };\n')
        yield '', join_('                \n')
        yield '', join_('                return time;\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        function createEvents(courseName, courseDates, courseTime) {\n')
        yield '', join_('                \n')
        yield '', join_('                var calEvents = [];\n')
        yield '', join_('\n')
        yield '', join_('                for(i in courseDates) {\n')
        yield '', join_('                        var e = {       \n')
        yield '', join_('                                "id": genID(),\n')
        yield '', join_('                                "start": new Date(YEAR, MONTH, courseDates[i], courseTime.startHour, courseTime.startMin),\n')
        yield '', join_('                                "end": new Date(YEAR, MONTH, courseDates[i], courseTime.endHour, courseTime.endMin),\n')
        yield '', join_('                                "title": courseName\n')
        yield '', join_('                        };\n')
        yield '', join_('                        \n')
        yield '', join_('                        calEvents.push(e);\n')
        yield '', join_('                }\n')
        yield '', join_('                \n')
        yield '', join_('                return calEvents;\n')
        yield '', join_('        }\n')
        yield '', join_('        \n')
        yield '', join_('        jQuery(document).ready(function() {\n')
        yield '', join_("                jQuery('#calendar').weekCalendar({\n")
        yield '', join_('                        timeslotsPerHour: 2,\n')
        yield '', join_('                        useShortDayNames: true,\n')
        yield '', join_('                        firstDayOfWeek: 1,\n')
        yield '', join_('                        daysToShow:5,\n')
        yield '', join_('                        businessHours: {start: 8, end: 21, limitDisplay: true},\n')
        yield '', join_('                        allowCalEventOverlap: true,\n')
        yield '', join_('                        height: function(jQuerycalendar){\n')
        yield '', join_('                                return jQuery(window).height() - jQuery("h1").outerHeight();\n')
        yield '', join_('                        }\n')
        yield '', join_('                });\n')
        yield '', join_('                \n')
        yield '', join_("                jQuery('#calendar').weekCalendar('gotoWeek',  new Date(YEAR, MONTH, DAY));\n")
        yield '', join_('                \n')
        yield '', join_('                //\n')
        yield '', join_("                jQuery('#school').load(function() {\n")
        yield '', join_("                        var list = jQuery('.course-list', frames['school'].document);\n")
        yield '', join_('                        \n')
        yield '', join_('                        //add courses to calendar on click\n')
        yield '', join_("                        jQuery('tr', list).click(function() {\n")
        yield '', join_('\n')
        yield '', join_("                                timeString = jQuery(this).find('td').eq(5).html();\n")
        yield '', join_('                                \n')
        yield '', join_('                                //check if click was on an actual course\n')
        yield '', join_('                                if(timeString == null) {\n')
        yield '', join_('                                        broadcastMessage("You didn\'t click on a course!");\n')
        yield '', join_('                                };\n')
        yield '', join_('\n')
        yield '', join_("                                courseString = jQuery(this).prevAll().find('.CourseTitle:last').html();\n")
        yield '', join_('\n')
        yield '', join_('                                var calEvents = createEvents(\n')
        yield '', join_('                                        parseCourseString(courseString),\n')
        yield '', join_('                                        getCourseDays(timeString), \n')
        yield '', join_('                                        getCourseTime(timeString)\n')
        yield '', join_('                                );\n')
        yield '', join_('                                \n')
        yield '', join_('                                for(i in calEvents) {\n')
        yield '', join_('                                        jQuery("#calendar").weekCalendar("updateEvent", calEvents[i]);\n')
        yield '', join_('                                }\n')
        yield '', join_('                        });\n')
        yield '', join_('                });\n')
        yield '', join_('                \n')
        yield '', join_('        });\n')
        yield '', join_('        </script>\n')
        yield '', join_('\n')
        yield '', join_('</head>\n')
        yield '', join_('<body>\n')
        yield '', join_('        <div id="wrapper">\n')
        yield '', join_('                <div id="header">\n')
        yield '', join_('                        Ant Planner<sub>Alpha</sub>\n')
        yield '', join_('                </div>\n')
        yield '', join_('\n')
        yield '', join_('                <div id="calendar">\n')
        yield '', join_('\n')
        yield '', join_('                </div>\n')
        yield '', join_('                \n')
        yield '', join_('                <iframe src ="/search" id="school" name="school">               \n')
        yield '', join_('                </iframe>\n')
        yield '', join_('\n')
        yield '', join_('        </div>\n')
        yield '', join_('</body>\n')
        yield '', join_('</html>\n')
    return __template__

index = CompiledTemplate(index(), 'templates/index.html')


def search():
    loop = ForLoop()
    _dummy  = CompiledTemplate(lambda: None, "dummy")
    join_ = _dummy._join
    escape_ = _dummy._escape

    def __template__ (search_form):
        yield '', join_('\n')
        yield '', join_('<html>\n')
        yield '', join_('<head>\n')
        yield '', join_('</head>\n')
        yield '', join_('<body>\n')
        yield '', join_('        ', escape_(search_form, True), '\n')
        yield '', join_('</body>\n')
        yield '', join_('</html>\n')
    return __template__

search = CompiledTemplate(search(), 'templates/search.html')
