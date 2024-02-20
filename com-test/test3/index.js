/**
 *
 赫夫曼编码
基本介绍

1.赫夫曼编码也翻译为    哈夫曼编码(Huffman Coding)，又称霍夫曼编码，是一种编码方式, 属于一种程序算法
赫夫曼编码是赫哈夫曼树在电讯通信中的经典的应用之一。

2.赫夫曼编码广泛地用于数据文件压缩。其压缩率通常在20%～90%之间
赫夫曼码是可变字长编码(VLC)的一种。Huffman于1952年提出一种编码方法，称之为最佳编码

 *
 *
 */

class Node {
  data;//存放数据(字符本身),比如 'a' => 97, ' '=>32
  weight;//权值，表示字符串出现的次数
  left;//
  constructor(data, weight) {
      this.data = data;
      this.weight = weight;
  }

  //前序遍历
  preOrder(arr) {
      arr.push(this);
      if (this.left) {
          this.left.preOrder(arr);
      }
      if (this.right) {
          this.right.preOrder(arr);
      }
  }
}


/**
*
* @param {接受字符数组} bytes
* @return 返回的就是list形式
*/
function getNodes(bytes) {
  //创建一个list
  let list = [];
  //counts 统计每一个byte出现的次数
  let counts = {};
  for (let b of bytes) {
      let count = counts[b];//map还没有这个字符数据
      if (count == null) {
          counts[b] = 1;
      } else {
          counts[b]++;
      }
  }

  for (const [key, value] of Object.entries(counts)) {
      list.push(new Node(key, value));
  }
  return list;
}


//通过list创建赫夫曼树
function createHuffmanTree(nodes) {
  const compareFun = function (a, b) {
      return a.weight - b.weight
  };
  while (nodes.length > 1) {
      //排序,从小到大
      nodes.sort(compareFun);
      //取出第一颗最小的二叉树
      let leftNode = nodes.shift(), rightNode = nodes.shift();
      //创建一个新的二叉树，它的根节点，没有data，只有权值
      let parent = new Node(null, leftNode.weight + rightNode.weight);
      parent.left = leftNode;
      parent.right = rightNode;

      //将新的二叉树，加入到nodes
      nodes.unshift(parent);
  }
  //nodes最后的节点，就是根节点
  return nodes.shift();
}

//生成赫夫曼树对应的赫夫曼编码表
function getCodes2(root) {
  if (root == null) {
      return null;
  }
  //生成赫夫曼树对应的赫夫曼编码表
  //思路
  //1.将赫夫曼编码表存放在map里面
  //2.在生成赫夫曼编码表时，需要拼接路径，定义一个数组string,存储某个叶子节点的路径

  let huffmanCodes = {};
  let string = [];
  /**
   * 将传入的node节点的所有叶子节点的赫夫曼编码得到，并放入到huffmanCodes集合中
   * @param {传入节点} node
   * @param {路径：左子节点是0，右子节点是1} code
   * @param {用于拼接路径} string
   */
  function getCodes(node, code, string) {
      let string2 = [...string];
      //将code加入到string中
      string2.push(code);
      if (node != null) { //如果node == null不处理
          //判断当前node是叶子节点还是非叶子节点
          if (node.data == null) {//非叶子节点
              //递归处理
              //向左递归
              getCodes(node.left, '0', string2);
              //向右递归
              getCodes(node.right, '1', string2)
          } else {//说明是一个叶子节点
              //就表示找到了某个叶子节点的最后
              huffmanCodes[node.data] = string2.join('');
          }
      }
  }
  getCodes(root, "", string);
  return huffmanCodes;
}

//编写一个方法，将字符串对应的bytes数组，通过生成的赫夫曼编码表，返回一个赫夫曼编码压缩后的byte数组
/**
*
* @param {原始的字符串对应的bytes数组} bytes
* @param {生成的赫夫曼编码表} huffmanCodes
* @return 返回的是字符串对应的一个byte数组
*/
function zip(bytes, huffmanCodes) {
  //1.利用huffmanCodes将bytes转成赫夫曼编码对应的字符串
  let string = [];
  //遍历数组
  for (let b of bytes) {
      string.push(huffmanCodes[b]);
  }
  return string;
}

function huffstringToByte(string) {
  //计算赫夫曼编码字符串的长度
  string = string.join('');
  let len = Math.ceil(string.length / 8);
  //创建存储压缩后的byte数组
  let huffmanCodeByte = new Array(len + 1);
  let index = 0, strByte;//记录是第几个byte
  for (let i = 0; i < string.length; i += 8) {
      strByte = string.substring(i, i + 8);
      //将strByte转成一个byte，放入huffmanCodeByte
      huffmanCodeByte[index] = parseInt(strByte, 2);
      index++;
  }
  //记录最后一位二进制码的长度，因为，比如最后一位二进制strByte为00101时，
  //parseInt(strByte, 2)后等于5，前面的两个00已经丢失，所以必须记录长度，以便解码时补足前面的0
  huffmanCodeByte[index] = strByte.length;
  return huffmanCodeByte
}

//使用一个方法，封装前面的方法，便于调用
/**
*
* @param {原始的字符串对应的字节数组} bytes
* @returns 是经过赫夫曼编码处理后，压缩后的字节数组
*
*/
function huffmanZip(bytes) {
  //1.生成节点数组
  let nodes = getNodes(bytes);
  //2.根据节点数组创建赫夫曼树
  let root = createHuffmanTree(nodes);
  //3.根据赫夫曼树生成赫夫曼编码
  let hufumanCodes = getCodes2(root);
  //4.根据生成的赫夫曼编码生成压缩后的赫夫曼编码字节数组
  let hufumanStrArr = zip(bytes, hufumanCodes);
  let hufumanByteArr = huffstringToByte(hufumanStrArr);

  return hufumanByteArr;
}

//完成数据的解压
//思路
//1.将huffmanBytesArr先转成赫夫曼编码对应的二进制字符串
//2.将赫夫曼编码对应的二进制的字符串转成赫夫曼编码字符串

/**
*
* @param {表示是否需要补高位，如果是true，表示需要，如果是false，表示不需要，如果是最后一个字节不需要补高位} flag
* @param {传入的byte} byte
* @returns 是byte对应的二进制字符串
*/
function heffmanByteToString(flag, byte) {
  //如果是
  if (flag) {
      byte |= 256;
  }
  let str = Number(byte).toString(2)
  if (flag) {
      return str.substring(str.length - 8);
  } else {
      return str;
  }
}

//编写一份方法，完成对压缩数据的解码
/**
*
* @param {赫夫曼编码表} huffmanCodes
* @param {赫夫曼编码得到的二进制数组} huffmanBytes
*/
function decode(huffmanCodes, huffmanBytes) {
  //1.先得到二进制字符串 形式11001111111011......
  let heffmanStrArr = [];
  for (let i = 0; i < huffmanBytes.length - 1; i++) {
      //判断是不是最后一个字节
      let flag = (i !== huffmanBytes.length - 2);
      heffmanStrArr.push(heffmanByteToString(flag, huffmanBytes[i]))
  }
  //最后一位记录的是最后一位二进制字符串的长度，该长度主要用于补足最后一位丢失的0,所以要单独处理，
  let lastByteStr = heffmanStrArr[heffmanStrArr.length - 1];
  let lastByteLength = huffmanBytes[huffmanBytes.length - 1];
  lastByteStr = '00000000'.substring(8 - (lastByteLength - lastByteStr.length)) + lastByteStr;
  heffmanStrArr[heffmanStrArr.length - 1] = lastByteStr;

  //把赫夫曼编码表进行调换
  let map = {};
  for (const [key, value] of Object.entries(huffmanCodes)) {
      map[value] = key;
  }

  let heffmanStr = heffmanStrArr.join('');
  let list = [];
  //
  for (let i = 0; i < heffmanStr.length;) {
      let count = 1;
      let flag = true;
      let b = null;
      while (flag) {
          //取出一个1或0
          //i不动，count移动，直到匹配到一个字符
          let key = heffmanStr.substring(i, i + count);
          b = map[key]
          if (!b) {//没有匹配到
              count++;
          } else {
              //匹配到
              flag = false;
          }
      }
      list.push(parseInt(b));
      i += count;
  }
  //当for循环结束后，list中就存放了所有的字符

  return list;
}

let content = [
  66812,
  67241,
  67242,
  67288,
  67291,
  67293,
  67758,
  69535,
  69536,
  69537,
  70390,
  72486,
  72487,
  72488,
  72489,
  74989,
  74990,
  75019,
  75584,
  75585,
  75586,
  75587,
  75588,
  76885,
  76886,
  76887,
  76888,
  76889,
  77105,
  32210,
  32211,
  32394,
  32395,
  32396,
  32541,
  32542,
  32543,
  32569,
  32761,
  32762,
  33214,
  33215,
  33217,
  33219,
  33328,
  33329,
  33570,
  33571,
  33572,
  33573,
  33574,
  33686,
  33687,
  34138,
  34139,
  34140,
  34396,
  34397,
  34398,
  34775,
  34878,
  35021,
  35541,
  35570,
  35571,
  36137,
  36985,
  39964,
  41939,
  43282,
  52016,
  31246,
  32188,
  40539,
  40596,
  42442,
  44094,
  44559,
  57789,
  44440,
  47058,
  75252,
  41145,
  43853,
  44439,
  47598,
  34125,
  35830,
  38494,
  41747,
  43613,
  76919,
  42490,
  44897,
  45346,
  22411,
  22484,
  22485,
  22486,
  22487,
  22488,
  22896,
  22897,
  22898,
  23019,
  23020,
  23766,
  23768,
  23769,
  23770,
  23869,
  23870,
  23871,
  25511,
  25512,
  25824,
  25868,
  25869,
  26010,
  26011,
  26012,
  26013,
  26062,
  26483,
  26484,
  26739,
  26740,
  26741,
  26742,
  26749,
  26835,
  26895,
  27236,
  27237,
  27238,
  27543,
  27544,
  27799,
  31668,
  31669,
  31940,
  32467,
  32468,
  33331,
  33332,
  70231,
  18831,
  18832,
  18833,
  18834,
  19584,
  19585,
  19586,
  20139,
  20247,
  20393,
  22072,
  22657,
  23771,
  23772,
  23773,
  23774,
  23775,
  35839,
  35842,
  35890,
  35888,
  35889,
  40259,
  40501,
  41128,
  25939,
  35736,
  35840,
  35841,
  33213,
  33957,
  38396,
  26837,
  26838,
  26839,
  26840,
  26841,
  26842,
  27000,
  27001,
  27239,
  27240,
  27241,
  27242,
  27713,
  27800,
  27801,
  27802,
  27803,
  27804,
  27805,
  28087,
  28088,
  28089,
  28372,
  28373,
  29051,
  31121,
  31663,
  31664,
  32212,
  32213,
  32759,
  32760,
  32889,
  33057,
  33211,
  33330,
  33567,
  33568,
  33569,
  43279,
  34111,
  34112,
  40797,
  43485,
  43875,
  45311,
  31666,
  31937,
  31938,
  31939,
  34777,
  34829,
  32209,
  35863,
  40755,
  40877,
  28083,
  28084,
  28085,
  28086,
  28378,
  28379,
  28380,
  30589,
  30590,
  34830,
  34831,
  35289,
  35290,
  35393,
  35786,
  35787,
  35788,
  43283,
  30588,
  34143,
  34394,
  34395,
  34859,
  34860,
  35577,
  35578,
  35722,
  43280,
  35394,
  35395,
  36600,
  36601,
  61020,
  40248,
  44170,
  40463,
  41127,
  57031,
  36690,
  37101,
  26836,
  27243,
  27244,
  27245,
  27246,
  27642,
  27643,
  27714,
  27798,
  28374,
  28375,
  28376,
  28377,
  28727,
  28728,
  28729,
  30631,
  31120,
  31434,
  31665,
  33058,
  33059,
  33688,
  33690,
  34141,
  34142,
  34400,
  43281,
  33060,
  33689,
  43256,
  43257,
  43258,
  43259,
  43260,
  46529,
  47261,
  43261,
  43988,
  45344,
  46855,
  47071,
  47158,
  44881,
  44882,
  46528,
  42998,
  43017,
  43075,
  43277,
  43488,
  43489,
  43555,
  43815,
  43816,
  43868,
  43871,
  44010,
  44012,
  44176,
  44810,
  44811,
  45042,
  45134,
  45217,
  45305,
  46591,
  56993,
  56994,
  57019,
  37401,
  37698,
  37701,
  38186,
  38792,
  38793,
  38801,
  38980,
  39088,
  39308,
  39313,
  39319,
  39797,
  39798,
  39799,
  39800,
  39801,
  39875,
  40112,
  40420,
  40421,
  40423,
  40595,
  40600,
  40601,
  40602,
  40603,
  40886,
  41065,
  41308,
  41309,
  41310,
  41311,
  41328,
  42178,
  42179,
  42392,
  42393,
  42399,
  42736,
  42737,
  42738,
  43240,
  43278,
  43737,
  44435,
  45064,
  45131,
  46199,
  46831,
  67599,
  43690,
  43885,
  44976,
  47355,
  52755,
  52761,
  52990,
  56798,
  60683,
  48081,
  75347,
  75798,
  47250,
  51700,
  51701,
  58246,
  61892,
  45121,
  45125,
  46224,
  47061,
  52247,
  52568,
  57958,
  44372,
  44879,
  45347,
  51622,
  51635,
  43298,
  46527,
  53380,
  61464,
  47188,
  52175,
  58090,
  60986,
  66339,
  70518,
  70521,
  73363,
  73262,
  57829,
  73613,
  47264,
  51910,
  57945,
  22465,
  46140,
  46268,
  46269,
  46270,
  46957,
  46958,
  46959,
  47374,
  47375,
  47661,
  48075,
  48076,
  48078,
  48117,
  48118,
  51374,
  51375,
  51376,
  51954,
  51955,
  51956,
  51957,
  53053,
  53115,
  53119,
  53120,
  56689
].join(',');
let bytes = stringToByte(content);
let nodes = getNodes(bytes);
let root = createHuffmanTree(nodes);
console.log('根节点：', root);
let list = [];
root.preOrder(list);
console.log('前序遍历：', list);

//测试
let hufumanCodes = getCodes2(root);
console.log('生成的赫夫曼编码表：', hufumanCodes);

//生成赫夫曼编码字符串
let hufumanStrArr = zip(bytes, hufumanCodes);
console.log('赫夫曼编码字符串：', hufumanStrArr.join(''))
console.log('赫夫曼编码字符串的长度：', hufumanStrArr.join('').length)//应该是133

//将生成赫夫曼编码字符串转成字节数组, 要发送的数组
let hufumanByteArr = huffstringToByte(hufumanStrArr);//长度为17
console.log('压缩后的字节数组', hufumanByteArr);
console.log('压缩率：', (bytes.length - hufumanByteArr.length) / bytes.length * 100 + '%');

//测试封装后的方法
console.log('压缩后的字节数组', huffmanZip(bytes));

//测试解码
console.log('解码后的数组：', decode(hufumanCodes, hufumanByteArr));
console.log('原字符的数组：', bytes);
console.log('解码后字符串：', byteToString(bytes));
console.log('原先的字符串：', byteToString(bytes));



//js byte[] 和string 相互转换 UTF-8
function stringToByte(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
          bytes.push(((c >> 18) & 0x07) | 0xF0);
          bytes.push(((c >> 12) & 0x3F) | 0x80);
          bytes.push(((c >> 6) & 0x3F) | 0x80);
          bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
          bytes.push(((c >> 12) & 0x0F) | 0xE0);
          bytes.push(((c >> 6) & 0x3F) | 0x80);
          bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
          bytes.push(((c >> 6) & 0x1F) | 0xC0);
          bytes.push((c & 0x3F) | 0x80);
      } else {
          bytes.push(c & 0xFF);
      }
  }
  return bytes;


}


function byteToString(arr) {
  if (typeof arr === 'string') {
      return arr;
  }
  var str = '',
      _arr = arr;
  for (var i = 0; i < _arr.length; i++) {
      var one = _arr[i].toString(2),
          v = one.match(/^1+?(?=0)/);
      if (v && one.length == 8) {
          var bytesLength = v[0].length;
          var store = _arr[i].toString(2).slice(7 - bytesLength);
          for (var st = 1; st < bytesLength; st++) {
              store += _arr[st + i].toString(2).slice(2);
          }
          str += String.fromCharCode(parseInt(store, 2));
          i += bytesLength - 1;
      } else {
          str += String.fromCharCode(_arr[i]);
      }
  }
  return str;
}
