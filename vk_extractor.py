import urllib2
from bs4 import BeautifulSoup as Soup

# mainUrl = 'http://www.verkami.com/browse?page=2'
mainUrl = 'http://www.verkami.com'
nextPage = ''
projects = []

def getNextPage(soup):
  nav_buttons = soup.findAll("div", { "class" : "nav_buttons" })[0]  
  if (nav_buttons is not None):
    return nav_buttons.findAll("a", { "class" : "next_page" })[0]['href']
  else:
    return ''

def parseProject(project):
  pHandler = urllib2.urlopen(project['url']).read() 
  pSoup = Soup(pHandler)
  boxa = pSoup.find("div", { "class" : "boxA portlet_project_summary" })
  categorization = boxa.find("div", { "class" : "categorization clearfix" })
  project['category'] = categorization.find(("div", { "class" : "category" })).strong.a.contents
  project['tags'] = categorization.find(("div", { "class" : "tags" }))
  print(categorization.find(("div", { "class" : "tags" })))
  # print(project)
  # projects.append(project)


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