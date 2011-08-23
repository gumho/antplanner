from lib.BeautifulSoup import BeautifulSoup
import re
from django.utils import simplejson as json
import logging

def strip_search(html):
	form_html = BeautifulSoup(html).find('form', action='http://websoc.reg.uci.edu/')
	
	#replace form submit with our own link
	form_html['action'] = '/schedules'
	
	#remove 'Display Text Results' button
	text_buttons = form_html.findAll(attrs={"class" : "banner-width"})
	for i in text_buttons:
		i.replaceWith('<p id=\"submit-container\"><input type="submit" value="Display Results" name="Submit"></p>')
	
	return str(form_html)
	
def strip_schedule(html):
	schedule_html = BeautifulSoup(html).find('div', 'course-list')
	if schedule_html is None:
		return "<p id=\"error\">No results were found.</p>"
	else:
		return str(schedule_html)

def strip_websoc_version(html):
	version_matches = re.findall('version.{,8}', html)
	
	if not version_matches:
		return 'Couldn\'t find a match'
	else:
		return version_matches[0]
	
	
def strip_professors(html):
	p = BeautifulSoup(html).find('table', {'id': 'rmp_table'})
	if p is None:
		logging.debug(html[500:])
		return '{"Error while parsing table at RateMyProfessors.com":""}'
	else:
		profs = list()
		trs = p.findAll('tr')
		for tr in trs:
			if (str(tr).find('sid=1074') != -1):
				logging.debug(str(tr))
				tds = tr.findAll('td')
				logging.debug(str(tds[1]))
				anchor = tds[1].find('a')
				name = anchor.renderContents().strip()
				href = anchor['href'].strip()
				prof = { name: href }
				logging.debug(prof)
				profs.append(prof)
		return json.dumps(profs)