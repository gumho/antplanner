from lib.BeautifulSoup import BeautifulSoup

def strip_search(html):
	form_html = BeautifulSoup(html).find('form', action='http://websoc.reg.uci.edu/')
	
	#replace form submit with our own link
	form_html['action'] = '/schedules'
	
	#remove 'Display Text Results' button
	text_buttons = form_html.findAll(attrs={"class" : "banner-width"})
	for i in text_buttons:
		i.replaceWith('<p id=\"submit-container\"><input type="submit" value="Display Web Results" name="Submit"></p>')
	
	return str(form_html)
	
def strip_schedule(html):
	schedule_html = BeautifulSoup(html).find('div', 'course-list')
	if schedule_html is None:
		return "Not a valid selection"
	else:
		return str(schedule_html)