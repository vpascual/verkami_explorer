#!/usr/bin/env python
#coding=utf8

import urllib2
from bs4 import BeautifulSoup as Soup
import time
import scraperwiki
import json

mainUrl = 'http://www.verkami.com'
nextPage = ''

def getNextPage(soup):
  nav_buttons = soup.findAll("div", { "class" : "nav_buttons" })[0]
  if (nav_buttons is not None):
    next = nav_buttons.findAll("a", { "class" : "next_page" })
    if len(next) > 0:
      return next[0]['href']

  return ''

def parseProject(project):
  pHandler = urllib2.urlopen(project['url']).read()
  pSoup = Soup(pHandler, "lxml")

  boxa = pSoup.find("div", { "class" : "boxA portlet_project_summary" })
  if boxa is not None:
    categorization = boxa.find("div", { "class" : "categorization clearfix" })
    current_amount = boxa.find("div", { "class" : "current_amount"})

    if current_amount is not None:
      project['current_amount'] = current_amount.strong.contents[0]

    total_amount = boxa.find("div", { "class" : "total_amount"})

    if total_amount is not None:
      project['total_amount'] = total_amount.strong.contents[0]

    time_left = boxa.find("div", { "class" : "time_left"})
    project['time_left'] = time_left.strong.contents[0]

    #description = pSoup.find("div", { "class" : "text"})
    #if description is not None:
    #  project['description'] = str(description)

    if categorization is not None:
      try:
        project['category'] = categorization.find(("div", { "class" : "category" })).strong.a.contents[0]
      except AttributeError:
        project['category'] = 'None'

      tags = categorization.findAll(("div", { "class" : "tags" }))
      tags = tags[1]
      project['tags'] = []

      for tag in tags.findAll('a'):
        project['tags'].append(tag.contents[0])

    project['update_time'] = time.strftime("%Y-%m-%d %H:%M")

    print(json.dumps(project))
    # scraperwiki.sql.save(unique_keys=[project['id'] + "_" + str(int(time.time()))], data=project)

# get the main info from a project, specially its url
def getProjectsFromUrl(url):
  print("Processing Verkami URL " + url)
  handler = urllib2.urlopen(url).read()
  soup = Soup(handler,  "lxml")
  project_list = soup.find("div", { "class" : "boxA projects_preview_list" })
  uls = project_list.findAll("ul")
  for ul in uls:
    lis = ul.findAll("li")
    for li in lis:
      project = dict()
      image = li.find("div", { "class" : "image" })
      project['image'] = image.a.img['src']
      project['url'] = mainUrl + image.a['href']
      id = project['url'].rsplit('/',1)[-1]
      project['id'] = id[:id.index('-')]

      parseProject(project)

  return getNextPage(soup)


if __name__ == "__main__":
  print("Starting Verkami scrapper by @vpascual\n")
  url = mainUrl + '/browse'

  while (url != mainUrl):
    nexturl = getProjectsFromUrl(url)
    url = mainUrl + nexturl