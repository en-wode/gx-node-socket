//命令格式
//length（1B） 总长度 xn(2B) (设备编号)  命令字 （1B）n 数据个数(1B) data(nB) checksum(1B)
// for (const b of Buffer.from('1447656645380')) {
//   console.log(parseInt(b,16));
// }

const ab = new ArrayBuffer(10);
const buf = Buffer.from('14 00 0A');
// 060001A200AF
// 140001A00E303030303030303131323334353679
// 输出: 2
let data=buf.toString('hex');
let arr=[]
for(let i=0;i<data.length/2;i++){
  arr[i]=data.substring(2*i,2*(i+1));  
}
console.log(arr)
// let bufs=['14','00','01','A0','0E','30','30','30','30','30','30','30','31','31','32','33','34','35','36','79']
// let arr=bufs.map((item)=>{
//   return '0x'+item
// })
// let login=Buffer.from(['14','00','01','A0','0E','30','30','30','30','30','30','30','31','31','32','33','34','35','36','79']);
// // 14 长度20
// const buf = Buffer.from([arr[0]]);
// console.log(parseInt(buf.toString('hex'),16));
// // 00 01 机器的编号 00 * 256 + 01 = 1
// console.log(arr[1]*256+Number(arr[2]))
// // A0  登陆
// // 0E 数据长度14
// const dataBuf = Buffer.from([arr[4]]);
// console.log(parseInt(dataBuf.toString('hex'),16));
// // 30 30 30 30 30 30 30 31 账号
// let accountNumber=arr.slice(5,13);
// const accountNumberBuf = Buffer.from(accountNumber);
// console.log(accountNumberBuf.toString())
// // 31 32 33 34 35 36  密码
// let password=arr.slice(13,19);
// const passwordBuf = Buffer.from(password);
// console.log(passwordBuf.toString())
// // 79 校验码 前面数字和

// Buffer.from([07 00 01 A1 01 32 DC]);

// 07长度为7
// 00 01 机器的编号 00 * 256 + 01 = 1
// A1 登陆的回应
// 01 数据长度1
// 32 回应的数据2 0是非法用户 2 可查看 3可操作 4可设置
// DC 校验码 前面数字和

// Buffer.from([2E 00 01 A2 28 12 04 1C 08 08 06 01 25 00 47 02 28 00 23 01 00 00 A8 02 47 02 10 01 E0 02 04 01 00 0E 01 46 01 00 01 01 00 01 01 00 02 00 sum]);
// 2E 长度46
// 00 01 机器的编号 00 * 256 + 01 = 1
// A2  上传状态
// 28 数据长度40
// data[0]-data[5] 时间 12 04 1C 08 08 06 //18年 4月28号 08：08：06
// data[6]-data[7] 井内水位  data[6]*256+data[7] 单位厘米
// data[8]-data[9] 河道水位  同上
// data[10]-data[11] 截污管水位  同上
// data[12]-data[13] 垃圾高度  同上
// data[14]-data[15] 排水闸开度  同上
// data[16]-data[17] 截污闸开度  同上
// data[18]-data[19] 提篮格栅开度  同上
// data[20]-data[21] 污水流量1  同上
// data[22]-data[23] 污水流量2  同上
// data[24]-data[27] ss  
// data[28]-data[29] COD  
// data[30] PH值0~14 
// data[31] 水泵1状态 0关1开
// data[32] 水泵2状态 0关1开
// data[33] 水泵浮球 
// data[34] PH值0~14 
// data[35] PH值0~14 
// data[36] PH值0~14 
// data[37] PH值0~14 
// data[38] PH值0~14 
// data[39] PH值0~14 
// checksum(1B)

//回应
//A3  回应上传状态 A2+1 命令字 
//07  7个数据
//data[0]-data[5] 时间 12 04 1C 08 08 06 //18年 4月28号 08：08：06 时间原值返回
//data[6] 是否正确 0不正确 1正确

// 270001a421983a0000004b000500c801f400c8001400320014005a0000000060ae0a0027108c79
// 270001a421983a0000004b000500c801f400c8001400320014005a0000000060ae0a0027108c23>
//983a0000 小端存储((00x256+00)x256+3a)x256+98 井低标高
//004b  00*256+4b 进水管高度
//0005  同上  