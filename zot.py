import web
import urllib
import htmlcrush

from google.appengine.api import urlfetch 

urls = (
	'/', 'index',
    '/search', 'search',
	'/schedules', 'schedules'
)

render = web.template.render('templates/')

class index:
	def GET(self):
		return render.index()

class search:
	def GET(self):
		try:
			search_page = urlfetch.fetch("http://websoc.reg.uci.edu")
			result = htmlcrush.strip_search(search_page.content)
		except urlfetch.Error:
			return "UCI webpage down at the moment"
		return render.search(result)

class schedules:
	def POST(self):
		p = web.input()
		
		form_fields = {
			"Breadth": p.Breadth,
			"CancelledCourses": p.CancelledCourses,
			"ClassType": p.ClassType,
			"CourseCodes": p.CourseCodes,
			"CourseNum"	: p.CourseNum,
			"CourseTitle": p.CourseTitle,
			"Days": p.Days,
			"Dept": p.Dept,
			"Division": p.Division,
			"EndTime": p.EndTime,
			"FontSize": p.FontSize,
			"FullCourses": p.FullCourses,
			"InstrName": p.InstrName,
			"MaxCap": p.MaxCap,
			"ShowComments": p.ShowComments,
			"ShowFinals": p.ShowFinals,
			"StartTime": p.StartTime,
			"Submit": p.Submit,
			"Units": p.Units,
			"YearTerm": p.YearTerm,
		}
		form_data = urllib.urlencode(form_fields)
		try:
			schedule_page = urlfetch.fetch("http://websoc.reg.uci.edu",
											payload=form_data,
											method=urlfetch.POST,
											headers={'Content-Type': 'application/x-www-form-urlencoded'})
			result = htmlcrush.strip_schedule(schedule_page.content)
		except urlfetch.Error:
			return "UCI webpage down at the moment"
		
		return result

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.cgirun()
