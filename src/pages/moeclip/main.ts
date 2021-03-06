import { pageInterface } from "./../pageInterface";

export const moeclip: pageInterface = {
  name: "moeclip",
  domain: "https://moeclip.com",
  type: "anime",
  isSyncPage: function(url) {
    if (j.$("div.video-content")[0] && j.$("h1.entry-title.title-font")[0]) {
      return true;
    } else {
      return false;
    }
  },
  sync: {
    getTitle: function(url){return j.$("header h1.entry-title.title-font").text().replace(/\d+\ssub\s*indo/gmi,"").trim()},
    getIdentifier: function(url) {
      return url.split("/")[3].replace(/-\d*-sub-indo.*/gmi,"").trim();
    },
    getOverviewUrl: function(url){
      return moeclip.domain +  "/anime/" + moeclip.sync.getIdentifier(url);
    },
    getEpisode: function (url) {
      let urlParts = url.split("/");

      if (!urlParts || urlParts.length === 0) return NaN;

      let episodePart = urlParts[3];

      if (episodePart.length === 0) return NaN;

      let temp = episodePart.match(/-\d*-sub-indo.*/gmi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ""));
    },
    nextEpUrl: function(url){return j.$('div.episode-nav > div.select-episode > div:nth-child(3) > a').first().attr('href');
  },
},
overview:{
  getTitle: function(url){
    return utils.getBaseText($('#data2 > div:nth-child(2)')).trim().replace(/:[ ]*/g,"");
  },
  getIdentifier: function(url){
    return url.split("/")[4].replace(/-sub-indo.*/gmi,"").trim();
  },
  uiSelector: function(selector){
    selector.insertAfter(j.$("div.entry-meta").first());
  },
  list:{
    offsetHandler: false,
    elementsSelector: function(){
      return j.$("li.episode-list");
    },
    elementUrl: function(selector){
      return utils.absoluteLink(selector.find('div > a').first().attr('href'),moeclip.domain);
    },
    elementEp: function(selector){
      return Number(selector.find('div > a').first().text().replace(/\D+/,""));
    }
  }
},
init(page){
  if(document.title == "Just a moment..."){
    con.log("loading");
    page.cdn();
    return;
  }
  api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  j.$(document).ready(function(){
    if (page.url.split("/")[3] == "anime" || j.$("div.video-content")[0] && j.$("h1.entry-title.title-font")[0] && j.$("#plv > div.contentsembed > div.episode-nav > div > div.eps-nav.pilih")[0]) {
      page.handlePage();
    }
  });
}
};
