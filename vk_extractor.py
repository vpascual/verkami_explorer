import urllib2
import json
from bs4 import BeautifulSoup as Soup

# mainUrl = 'http://www.verkami.com/browse?page=2'
mainUrl = 'http://www.verkami.com'
nextPage = ''
projects = []

def getNextPage(soup):
  nav_buttons = soup.findAll("div", { "class" : "nav_buttons" })[0]  
  if (nav_buttons is not None):
    next = nav_buttons.findAll("a", { "class" : "next_page" })    
    if len(next) > 0:
      return next[0]['href']
  
  return ''

def parseProject(project):
  pHandler = urllib2.urlopen(project['url']).read() 
  pSoup = Soup(pHandler.decode('utf-8','ignore'))
  
  boxa = pSoup.find("div", { "class" : "boxA portlet_project_summary" })
  if boxa is not None:
    categorization = boxa.find("div", { "class" : "categorization clearfix" })
    current_amount = boxa.find("div", { "class" : "current_amount"})
    total_amount = boxa.find("div", { "class" : "total_amount"})
    time_left = boxa.find("div", { "class" : "time_left"})
    project['time_left'] = time_left.strong.contents[0].encode('utf-8')

      # if div['class'] == 'tags':
      #   tags = div.findAll("a")
      #   for tag in tags:
      #     if project['tags'] is None:
      #       project['tags'] = project['tags'] + tag.contents
      #     else:
      #       project['tags'] = project['tags'] + ',' + tag.contents  
    
    if categorization is not None:
      project['category'] = categorization.find(("div", { "class" : "category" })).strong.a.contents[0].encode('utf-8')
      tags = categorization.findAll(("div", { "class" : "tags" }))
      tags = tags[1]
      project['tags'] = []
      
      for tag in tags.findAll('a'):
        project['tags'].append(tag.contents[0].encode('utf-8'))
      
    if current_amount is not None:
      project['current_amount'] = current_amount.strong.contents[0].encode('utf-8')
    
    if total_amount is not None:
      project['total_amount'] = total_amount.strong.contents[0].encode('utf-8')
      
    projects.append(project)
  # print(json.dumps(projects))  
  
  # project['tags'] = categorization.find(("div", { "class" : "tags" }))
  # print(categorization.find(("div", { "class" : "tags" })))
  # print(project['tags'])
  # projects.append(project)

def writeFile(filename, content):
  f = open(filename,'w')
  f.write(content)
  f.close()
  print("Output file: " + filename)

def getProjectsFromUrl(url):
  print("Processing Verkami URL " + url)
  handler = urllib2.urlopen(url).read()
  soup = Soup(handler)
  project_list = soup.find("div", { "class" : "boxA projects_preview_list" })
  uls = project_list.findAll("ul")
  for ul in uls:
    lis = ul.findAll("li")
    for li in lis:
      project = dict()
      image = li.find("div", { "class" : "image" })
      project['image'] = image.a.img['src']
      project['url'] = mainUrl + image.a['href']
      parseProject(project)
      # project['image'] = 
    # for li in lis:
  # print(len(projects.ul))

  return getNextPage(soup)
  

if __name__ == "__main__":
  print("Starting Verkami scrapper by @vpascual\n")
  url = mainUrl + '/browse'

  while (url != mainUrl):
    nexturl = getProjectsFromUrl(url)
    url = mainUrl + nexturl

  writeFile('verkami_projets.json', json.dumps(projects))