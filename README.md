# 基于星云链的游戏--早起的鸟儿有虫吃 [体验地址](http://www.nanayun.cn/morningBird.html#/)

![](http://cdn.binghai.site/o_1cdag2idr1mqshe3c4fj26kcaa.png)

### 智能合约
```
'use strict';

var Record = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.payDay = o.payDay;
    this.from = o.from;
    this.idx = o.idx;
    this.tag = o.tag;
    this.payMuch = new BigNumber(o.payMuch);
  }
};


Record.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var MorningBoard = function(){
	// 奖池
	LocalContractStorage.defineProperty(this, "jackpot");
	LocalContractStorage.defineProperty(this, "recordCounter");
	LocalContractStorage.defineMapProperty(this, "mainBoard", {
    parse: function (text) {
      return new Record(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

}

MorningBoard.prototype = {
  init: function () {
  	this.jackpot = new BigNumber(0);
  	this.recordCounter = 0;
  },

  // 付钱参与
  participate:function(){
  	var from = Blockchain.transaction.from;
  	var value = new BigNumber(Blockchain.transaction.value);
  	var standard = new BigNumber(1000000000000000);


  	if(value < standard){
  		return "do not pay less than 0.001 nas,or your pay will be nothing.";
  	}

  	this.jackpot = value.plus(this.jackpot);

  	var rec = new Record();

  	rec.payDay = this._getDay();
  	rec.payMuch = value;
  	rec.idx = this._nextIndex();
  	rec.tag = 0;
  	rec.from = from;

  	this.mainBoard.put(rec.idx,rec);

  	return "success";
  },

  _getHour:function(){
  	var ts = Blockchain.transaction.timestamp;
  	var hour = parseInt((ts/3600)%24+8);
  	return hour;
  },

  _getDay:function(){
	var ts = Blockchain.transaction.timestamp;
  	var day = parseInt(ts/86400);
  	return day;
  },

  _getMinute:function(){
  	var ts = Blockchain.transaction.timestamp;
  	var minute = parseInt(ts%3600/60);
  	return minute;
  },

  _nextIndex:function(){
  	return this.recordCounter++;
  },

  // 打卡
  morning:function(){
  	if(this._getHour() < 5 || this._getHour() > 8){
  		throw new Error("your can not punch the clock at this time :"+this._getHour());
  	}

  	var from = Blockchain.transaction.from;
  	var yesterday = this._getDay()-1;

  	for(var i = 0; i < this.recordCounter;i++){
  		var item = this.mainBoard.get(i);
  
  		if(item.payDay == yesterday && item.tag == 0 && item.from == from){
  			item.tag = 1;
  			this.mainBoard.put(item.idx,item);
  			return "success";
  		}

  		if(item.payDay == yesterday && item.tag == 1){
  			return "well,you marked 2 twice,so the secode one will be ignore!";
  		}
  	}

  	throw new Error("you did not participate yesterday!");
  },

  //领钱
  distribution:function(){
  	if(this._getHour < 8){
  		throw new Error('can not pull money befor 8:00 !');
  	}

  	var yesterday = this._getDay()-1;
  	var memberSum = 0;
  	var addressList = [];
  	var sum = new BigNumber(0);

  	for(var i = 0; i < this.recordCounter;i++){
  		var item = this.mainBoard.get(i);
  		if(item.payDay == yesterday && item.tag == 1){
  			memberSum++;
  			sum += item.payMuch;
  			item.tag = 2;
  			this.mainBoard.put(item.idx,item);
  			addressList.push(item.from);
  		}
  	}

  	if(memberSum == 0){
  		throw new Error("no member played yesterday!");
  	}

  	var every = (sum/memberSum).toFixed(4);
  	for(var i = 0;i < memberSum;i++){
  		Blockchain.transfer(addressList[i], every);
  	}

  	this.jackpot -= sum;
  	return "success";
  },

  // 付过钱的用户
  memberList:function(){
  	var list = [];
  	for(var i = 0; i < this.recordCounter;i++){
  		list.push(this.mainBoard.get(i));
  	}
  	return list;
  },

  getJackpot:function(){
  	return this.jackpot;
  },

  recordLength:function(){
  	return this.recordCounter;
  },

 }

 module.exports = MorningBoard;
```