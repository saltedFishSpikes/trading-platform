export default {
  ws:null,
  heart:null,
  setWs:function(newWs){
    this.ws = newWs
    this.setHeart()
  },
  setHeart:function(){
    this.heart = setInterval(() => {
      if (this.ws && this.ws.readyState == 1) {
        this.ws.send("heart");
      }else if(!this.ws){
        clearInterval(this.heart)
      }
    }, 3000);
  },
  closeHeart:function(){
    if(this.heart){
      clearInterval(this.heart)
    }
  }
}