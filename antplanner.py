import web
import urllib

import scraper
import schedule
from admin import *

from google.appengine.api import urlfetch 
from google.appengine.api import memcache
from google.appengine.api import users
from django.utils import simplejson as json

import logging

urls = (
	'/', 'index',
    '/search', 'search',
	'/schedules', 'schedules',
	'/schedule/save', 'saveSchedule',
	'/schedule/load', 'loadSchedule',
	'/admin', 'admin',
	'/admin/flush-cache', 'adminFlushCache',
	'/admin/latest-web-soc', 'latestWebSoc',
	'/admin/delete-old-schedules', 'deleteOldSchedules',
	'/prof', 'getProf'
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
				memcache.set("SEARCH", search_page, 12 * 60)
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
		
		form_hash = ''.join(form_fields.values())
		schedule_page = memcache.get(form_hash)
		
		if schedule_page is None:
			try:
				raw_page = urlfetch.fetch("http://websoc.reg.uci.edu",
												payload=form_data,
												method=urlfetch.POST,
												headers={'Content-Type': 'application/x-www-form-urlencoded'})
				schedule_page = scraper.strip_schedule(raw_page.content)
				memcache.set(form_hash, schedule_page, 12 * 60)
			except urlfetch.Error:
				schedule_page = "UCI webpage is not available at the moment"
		
		return render.schedule(schedule_page)

class saveSchedule():
	def POST(self):
		p = web.input()
		# TODO: error handling
		schedule.save_schedule(p.username, p.caldata)
		return '{"success":"true"}'

class loadSchedule():
	def GET(self):
		return schedule.load_schedule(web.input().username)
		
class getProf():
	def GET(self):
		p = web.input(names=[])
		if p is None or p.names is None:
			return '{"success": "Invalid or empty names parameter"}'
		
		found = []
		for n in p.names:
			prof = memcache.get(n)
			if prof is None:	
				try:
					raw_page = urlfetch.fetch("http://www.ratemyprofessors.com/SelectTeacher.jsp?the_dept=All&sid=1074&orderby=TLName&letter=" + n.split(',')[0],
						method=urlfetch.GET,
						deadline=10)
					
					prof = scraper.strip_professors(raw_page.content, unicode(n))
				except urlfetch.DownloadError:
					data = '{"success":"urlfetch.DownloadError: RateMyProfessors.com request exceeded 10 seconds"}'
					return json.dumps(data)
				except urlfetch.Error:
					data = '{"success":"urlfetch.Error: RateMyProfessors.com is not available at the moment}'
					return json.dumps(data)
					
			found.extend(prof)
			memcache.set(n, prof, 24 * 60)
		
		data = {'success': 'true', 'professors': found}
		return json.dumps(data)


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.cgirun()
