export class epPredictions {
  constructor(
    protected malId: number,
    protected cacheKey: string,
    protected listType:'anime'|'manga',
  ) {
    return this;
  }

  async init() {
    await this.initMalPrediction();
    await this.initAniPrediction();
    await this.initUpdateCheckPrediction();
    return this;
  }

  getAiring() {
    if(this.updateCheckPrediction && !this.updateCheckPrediction.finished) return true;
    if(this.malPrediction && this.malPrediction.airing) return true;
    return false;
  }

  getEp(safe = false) {
    if(!safe) {
      if(this.updateCheckPrediction && this.updateCheckPrediction.newestEp) return {ep: this.updateCheckPrediction.newestEp, provider: 'UPDATECHECK'};
    }
    if(this.aniPrediction && this.aniPrediction.currentEp) return {ep: this.aniPrediction.currentEp, provider: 'ANILIST'};
    if(this.malPrediction && this.malPrediction.episode) return {ep: this.malPrediction.episode, provider: 'MAL'};
  }

  getNextEpTimestamp() {
    if(this.aniPrediction && this.aniPrediction.nextEpTime) return this.aniPrediction.nextEpTime * 1000
    //TODO: malPrediction
    return false;
  }

  //Mal Prediciton
  protected malPrediction;

  protected async initMalPrediction(){
    if(!this.malId) return;
    if(!api.settings.get('epPredictions')) return;
    var timestamp = await api.storage.get('mal/'+this.malId+'/release');
    if(typeof(timestamp) != "undefined"){
      var airing = 1;
      var episode = 0;
      if(Date.now() < timestamp) airing = 0;

      if(airing){
        var delta = Math.abs(Date.now() - timestamp) / 1000;
      }else{
        var delta = Math.abs(timestamp - Date.now()) / 1000;
      }


      var diffWeeks = Math.floor(delta / (86400 * 7));
      delta -= diffWeeks * (86400 * 7);

      if(airing){
        //We need the time until the week is complete
        delta = (86400 * 7) - delta;
      }

      var diffDays = Math.floor(delta / 86400);
      delta -= diffDays * 86400;

      var diffHours = Math.floor(delta / 3600) % 24;
      delta -= diffHours * 3600;

      var diffMinutes = Math.floor(delta / 60) % 60;
      delta -= diffMinutes * 60;

      if(airing){
        episode = diffWeeks - (new Date().getFullYear() - new Date(timestamp).getFullYear()); //Remove 1 week between years
        episode++;
        if( episode > 50 ){
          episode = 0;
        }
      }

      var maxEp = await api.storage.get('mal/'+this.malId+'/release');
      if(typeof(maxEp) === "undefined" || episode < maxEp){
        this.malPrediction = {
          timestamp: timestamp,
          airing: airing,
          diffWeeks: diffWeeks,
          diffDays: diffDays,
          diffHours: diffHours,
          diffMinutes: diffMinutes,
          episode: episode
        };
      }
    }
  }

  // anilist prediction
  protected aniPrediction;

  protected async initAniPrediction() {
    if(!this.malId) return;
    this.aniPrediction = await api.storage.get('mal/'+this.malId+'/aniSch');
  }

  // anilist prediction
  protected updateCheckPrediction;

  protected async initUpdateCheckPrediction() {
    if(!this.cacheKey) return;
    var updateCheckTime = await api.storage.get("updateCheckTime");
    if(typeof updateCheckTime !== 'undefined' && updateCheckTime && updateCheckTime !== '0'){
      var cache = await api.storage.get('updateCheck/'+this.listType+'/'+this.cacheKey);
      if(typeof cache != 'undefined' && typeof cache.error == 'undefined'){
        this.updateCheckPrediction = cache;
      }
    }
  }
}
