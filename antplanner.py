import web
import urllib
import hashlib

import scraper
import data
from auth import *
from admin import *

from google.appengine.api import urlfetch 
from google.appengine.api import memcache
from google.appengine.api import users

urls = (
	'/', 'index',
    '/search', 'search',
	'/schedules', 'schedules',
	'/schedule/save', 'saveSchedule',
	'/schedule/load', 'loadSchedule',
	'/admin', 'admin',
	'/admin/flush-cache', 'adminFlushCache',
	'/admin/latest-web-soc', 'latestWebSoc',
)

render = web.template.render('templates/')

class index:
	def GET(self):
		return render.index()

class search:
	def GET(self):
		search_page = memcache.get("SEARCH")
		
		if search_page is None:
			try:
				raw_page = urlfetch.fetch("http://websoc.reg.uci.edu")
				search_page = scraper.strip_search(raw_page.content)
				memcache.add("SEARCH", search_page, 60 * 60)
			except urlfetch.Error:
				search_page = "UCI webpage is not available at the moment"
		
		return render.search(search_page)

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
			"StartTime": p.StartTime,
			"Submit": p.Submit,
			"Units": p.Units,
			"YearTerm": p.YearTerm,
		}
		
		try:
			form_fields["ShowComments"] = p.ShowComments
			form_fields["ShowFinals"] = p.ShowFinals
		except AttributeError, e:
			pass
		form_data = urllib.urlencode(form_fields)
		
		form_concat = ''
		for k, v in form_fields.items():
			form_concat += v
		
		#md5 hash of all the form fields used for memcached key
		form_hash = hashlib.md5(form_concat).hexdigest()
		
		schedule_page = memcache.get(form_hash)
		
		if schedule_page is None:
			try:
				raw_page = urlfetch.fetch("http://websoc.reg.uci.edu",
												payload=form_data,
												method=urlfetch.POST,
												headers={'Content-Type': 'application/x-www-form-urlencoded'})
				schedule_page = scraper.strip_schedule(raw_page.content)
				memcache.add(form_hash, schedule_page, 60 * 60)
			except urlfetch.Error:
				schedule_page = "UCI webpage is not available at the moment"
		
		return render.schedule(schedule_page)

class saveSchedule():
	def POST(self):
		p = web.input()
		# TODO: error handling
		data.save_schedule(p.username, p.caldata)
		return '{"success":"true"}'

class loadSchedule():
	def GET(self):
		return data.load_schedule(web.input().username)
		
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.cgirun()
