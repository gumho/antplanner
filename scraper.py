from lib.BeautifulSoup import BeautifulSoup

#consider caching if gets too expensive

def strip_search(html):
	form_html = BeautifulSoup(html).find('form', action='http://websoc.reg.uci.edu/')
	form_html['action'] = '/schedules'
	return str(form_html)
	
def strip_schedule(html):
	schedule_html = BeautifulSoup(html).find('div', 'course-list')
	if schedule_html is None:
		return "Not a valid selection"
	else:
		return str(schedule_html)