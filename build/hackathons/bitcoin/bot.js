//
// TODO: implement the logic to decide whether or not to make a trade
//
var itemList = [];
var lastPrice = 0;
var wordList = ['game', 'news', 'money', 'fun', 'good', 'actor',  'movies', 'tech', 'music', 'people', 'apple', 'google'];
var record = [];
var n = 5
var isStart = true;

var keyWord = [	{word:'game', effect:-1},// strong -
				{word:'news', effect:0}, // weak -
				{word: 'money',effect:1},// strong +
				{word: 'fun',effect:0}, // weak +
				{word: 'good',effect:1}, // strong +
				{word: 'actor', effect:0}, // none
				{word:'movies', effect:0}, //weak -
				{word:'tech', effect:0},  // none
				{word:'music', effect:0},  // weak -
				{word:'people', effect:-1}, // str -
				{word:'apple', effect:0}, // none
				{word:'google',effect:0}]; // none

/*
var keyWord = [	{word:'game', effect:-1},// strong -
				{word:'news', effect:-1}, // weak -
				{word: 'money',effect:1},// strong +
				{word: 'fun',effect:1}, // weak +
				{word: 'good',effect:1}, // strong +
				{word: 'actor', effect:0}, // none
				{word:'movies', effect:-1}, //weak -
				{word:'tech', effect:0},  // none
				{word:'music', effect:-1},  // weak -
				{word:'people', effect:-1}, // str -
				{word:'apple', effect:0}, // none
				{word:'google',effect:0}]; // none	
				*/			
/*
var keyWord = [	{word:'game', effect:-1},// strong -
				{word:'news', effect:-1}, // weak -
				{word: 'money',effect:1},// strong +
				{word: 'fun',effect:1}, // weak +
				{word: 'good',effect:1}, // strong +
				{word: 'actor', effect:1}, // none
				{word:'movies', effect:-1}, //weak -
				{word:'tech', effect:-1},  // none
				{word:'music', effect:-1},  // weak -
				{word:'people', effect:-1}, // str -
				{word:'apple', effect:1}, // none
				{word:'google',effect:0}]; // none
				*/
function decideWhetherOrNotToTrade(item){
	var shouldBuyBitCoin = 0;
	var tweetWords = _.words(item.tweet)
	_.forEach(keyWord, function(e){
	if (_.includes(tweetWords,e.word)) 
		shouldBuyBitCoin +=  e.effect;
	});
	if (bank.currency == 'USD' && shouldBuyBitCoin > 0)
		return true;
	if (bank.currency == 'BITCOIN' && shouldBuyBitCoin < 1)
		return true;
	return false;
}
// learning
function decideWhetherOrNotToTrade1(item){
	if (isStart) {
		record = _.map(wordList, function(d){
			var obj = {}
			obj.word = d;
			obj.plusCount = 0
			obj.minusCount = 0;
			return obj			
		})
		isStart = false;

	}
	
	if (lastPrice != 0 && item.price != lastPrice){
		// look through last N tweets
		lookCount = n
		if (_.size(itemList) < n) lookCount = n;
		tweetList = _.takeRight(itemList,lookCount);
		
		_.forEach(tweetList, function(d){
			var tweetWords = _.words(d.tweet)
			_.forEach(record, function(e){
				//if indexOf()
				if (_.includes(tweetWords,e.word)) {
					if (item.price > lastPrice)
						e.plusCount ++;
					else e.minusCount++;

				}
			})
		})
		
	}
	lastPrice = item.price
	itemList.push(item);

  return Math.random() < 0.1
}
