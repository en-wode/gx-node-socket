var net = require('net');
const crypto = require('crypto');
var mysql = require('./mysql.js')
var redis = require('./redis.js');
// var redis = require("redis");
// var pub = redis.createClient();
var PORT = 7004;
let timer=null;
let socketArr=[];
let time=0;
let date1=new Date();
 let arr=[];
// mysql.query('select * from user',(error, results, fields)=>{
//   console.log(results)
// });
// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
timerFn()
let server = net.createServer(function(sock) {
    console.log('服务端：收到来自客户端的请求',date1.getTime());
    sock.on('data', function(data) {
        console.log(data,'->');
        if (typeof data!=='object') {
          return
        }
        let string = data.toString('hex');
        for(let i=0;i<string.length/2;i++){
          arr[i]=string.substring(2*i,2*(i+1));  
        }
        console.log(arr.toString(),'arr')
        let arr1=arr.map((item)=>{
            return '0x'+item;
        })
        const buf = Buffer.from([arr1[0]]);
        let arrlength = parseInt(buf.toString('hex'),16);
        console.log(arrlength,arr1.length);
        if (arrlength > arr1.length ) {
            return
        }else if(arrlength < arr1.length){
            arr= arr.slice(0,arrlength)
            arr1 = arr1.slice(0,arrlength);
        }
        switch (arr[3]) {
            case 'a0':
                //设备用户登录
                //登录内容
                try{
                    const dataBuf = Buffer.from([arr1[4]]);
                    let dataLength = parseInt(dataBuf.toString('hex'),16)
                    // console.log(arrlength,arr1.length)
                    if(dataLength != arrlength-6){
                        return 
                    }
                    let accountNumber=arr1.slice(5,13);
                    const accountNumberBuf = Buffer.from(accountNumber);
                    let password=arr1.slice(13,19);
                    const passwordBuf = Buffer.from(password);
                    login(accountNumberBuf.toString(),passwordBuf.toString(),arr)
                    // if(accountNumberBuf.toString() != '00000001'){
                    //     let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xA1','0x01','0x30']
                    //     let num=0
                    //     for(let i=0;i<resultArr.length;i++){
                    //         num+=parseInt(resultArr[i],16)
                    //     }
                    //     resultArr.push('0x'+num.toString(16))
                    //     return sock.write( Buffer.from(resultArr));
                    // }
                    // if(accountNumberBuf.toString() == '00000001'){
                    //     let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xA1','0x01','0x32']
                    //     let num=0
                    //     for(let i=0;i<resultArr.length;i++){
                    //         num+=parseInt(resultArr[i],16)
                    //     }
                    //     resultArr.push('0x'+num.toString(16))
                    //     // console.log(Buffer.from(resultArr))
                    //     return sock.write(Buffer.from(resultArr));
                    // }
                }catch(err){
                    return ;
                }
                break;
            case 'a2':
                try{
                    let  reply='0x'+ (parseInt(arr1[3],16)+1).toString(16);
                    let date = new Date();
                    let year = Number(date.getFullYear().toString().slice(2,4)).toString(16);
                    let month = (date.getMonth()+1).toString(16)
                    let date1 = (date.getDate()).toString(16)
                    let hourse = (date.getHours()).toString(16)
                    let minutes = (date.getMinutes()).toString(16)
                    let seconds = (date.getSeconds()).toString(16)
                    let arrData=['0x'+year,'0x'+month,'0x'+date1,'0x'+hourse,'0x'+minutes,'0x'+seconds]
                    let dataLenth=0
                    for(let i=0;i<arrData.length;i++){
                        dataLenth+=parseInt(arrData[i],16)
                    }
                    let resultArr=['0x0c','0x'+arr[1],'0x'+arr[2],reply,'0x06'];
                    let resultArr1 = resultArr.concat(arrData);
                    let num = 0;
                    for(let i=0;i<resultArr1.length;i++){
                        num+=parseInt(resultArr1[i],16)
                    }
                    let equipment=result(arr1,1,2);
                    mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                        if(results.length===0){
                            mysql.query('INSERT INTO  equipment  SET ?',{equipmentName:equipment},(error, results, fields)=>{
                                // console.log('mysql')
                                if (error) {
                                    return
                                }
                            });
                        }
                        let oEquipment = results[0];
                        mysql.query(`SELECT * FROM equipment_part_copy WHERE equipmentId=${oEquipment.id}`,(error, results, fields)=>{
                            for (let item of results) {
                                switch (Number(item.pattern)) {
                                    case 1:
                                       {
                                        let startWaterLevel1 = result(arr1,5,6);
                                        let stopWaterLevel1 = result(arr1,7,8);
                                        let startWaterLevel2 = result(arr1,9,10);
                                        let stopWaterLevel2 = result(arr1,11,12);
                                        let startWaterLevel3 = result(arr1,13,14);
                                        let stopWaterLevel3 = result(arr1,15,16);
                                        verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                                       }
                                        break;
                                    case 2:
                                       {
                                        let startWaterLevel1 = result(arr1,17,18);
                                        let stopWaterLevel1 = result(arr1,19,20);
                                        let startWaterLevel2 = result(arr1,21,22);
                                        let stopWaterLevel2 = result(arr1,23,24);
                                        let startWaterLevel3 = result(arr1,25,26);
                                        let stopWaterLevel3 = result(arr1,27,28);
                                        verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                                       }
                                        break;
                                    case 3:
                                       {
                                        let startWaterLevel1 = result(arr1,29,30);
                                        let stopWaterLevel1 = result(arr1,31,32);
                                        let startWaterLevel2 = result(arr1,33,34);
                                        let stopWaterLevel2 = result(arr1,35,36);
                                        let startWaterLevel3 = result(arr1,37,38);
                                        let stopWaterLevel3 = result(arr1,39,40);
                                        verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                                       }
                                        break;
                                    case 4:
                                       {
                                        let startWaterLevel1 = result(arr1,41,30);
                                        let stopWaterLevel1 = result(arr1,31,32);
                                        let startWaterLevel2 = result(arr1,33,34);
                                        let stopWaterLevel2 = result(arr1,35,36);
                                        let startWaterLevel3 = result(arr1,37,38);
                                        let stopWaterLevel3 = result(arr1,39,40);
                                        verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                                       }
                                        break;        
                                    default:
                                        break;
                                }
                            }
                        })

                        function verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , id){
                            console.log(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , id);
                            mysql.query('UPDATE equipment_part_copy SET startWaterLevel1 = ?, stopWaterLevel1 = ?, startWaterLevel2 = ? , stopWaterLevel2 = ? , startWaterLevel3 = ?, stopWaterLevel3 = ? WHERE id = ?',
                            [ startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , id],(error2, results2, fields2)=>{
                                if (error2) {
                                    console.log(error2);
                                    return
                                }
                                console.log(results2,"jieshu");
                            });
                        }
                        socketArr[equipment]=sock;
                    })
                    resultArr1.push('0x'+num.toString(16))
                    // console.log(Buffer.from(resultArr1))
                    sock.write(Buffer.from(resultArr1));
                    // sockets.forEach(function(otherSocket){  
                    //     if (otherSocket !== sock){  
                    //         otherSocket.write(data);  
                    //     }  
                    // }); 
                }catch(err){
                    return ;
                }
                break;
            case 'a4':
            //设备登录
            try{
                // console.log('a4');
                const dataBuf = Buffer.from([arr1[4]]);
                let dataLength = parseInt(dataBuf.toString('hex'),16)
                // console.log(arrlength,arr1.length)
                if(dataLength != arrlength-6){
                    return 
                }
                // console.log('数据长度正确');
                let equipment = result(arr,1,2);
                console.log('equipment'+equipment);
                let bottomHoleHeight = result1(arr,5,6,7,8);
                console.log('bottomHoleHeight'+bottomHoleHeight);
                let inletPipeHeight= result(arr,9,10);
                console.log('inletPipeHeight'+inletPipeHeight);
                let truncatedPipeHeight = result(arr,11,12);
                console.log('truncatedPipeHeight'+truncatedPipeHeight);
                let groundHeight = result(arr,13,14);
                console.log('groundHeight'+groundHeight);
                let sewerageSluice = result(arr,15,16);
                console.log('sewerageSluice'+sewerageSluice);
                let sluiceHeight = result(arr,17,18);
                console.log('sluiceHeight'+sluiceHeight);
                let stopWaterLevel1 = result(arr,19,20);
                console.log('stopWaterLevel1'+stopWaterLevel1);
                let startWaterLevel1 = result(arr,21,22);
                console.log('startWaterLevel1'+startWaterLevel1);
                let stopWaterLevel2 = result(arr,23,24);
                console.log('stopWaterLevel2'+stopWaterLevel2);
                let startWaterLevel2 = result(arr,25,26);
                console.log('startWaterLevel2'+startWaterLevel2);
                let stopWaterLevel3 = result(arr,27,28);
                console.log('stopWaterLevel3'+stopWaterLevel3);
                let startWaterLevel3 = result(arr,29,30);
                console.log('startWaterLevel3'+startWaterLevel3);
                let ss = result1(arr,31,32,33,34);
                let serverState= 1;
                // console.log('ss'+ss);
                let cod = result(arr,35,36);
                let ph = parseInt(arr[37],16)
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    if (error) {
                        console.log(error)
                        return
                    }
                    if(results.length===0){
                        return
                    }else{
                        // console.log(results)
                        let oEquipment = results[0];
                        mysql.query(`SELECT * FROM equipment_part WHERE equipmentId=${oEquipment.id}`,(err, results1, fields1)=>{
                            if (err) {
                                console.log(err)
                                return
                            }
                            if(results1.length===0){
                                // console.log("进入添加模式")
                                let params  = {equipmentId: oEquipment.id, drainageOverflowHeight:0,InterceptingLimitflowHeight:0,sunnyToRain:0,vigilance:0,rainGauge:0,bottomHoleHeight,truncatedPipeHeight,groundHeight,sewerageSluice,sluiceHeight,stopWaterLevel1,startWaterLevel1,stopWaterLevel2,startWaterLevel2,sewerageSluiceHeight:0,stopWaterLevel3,startWaterLevel3,ss,cod,ph,serverState:1,clientState:0,inletPipeHeight};
                                mysql.query('INSERT INTO  equipment_part  SET ?',params,(error2, results2, fields2)=>{
                                    if (error2) {
                                        console.log(error2);
                                        return
                                    }
                                    // console.log(results2)
                                    let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xa5','0x01','0x01'];
                                    sendInfo(sock,resultArr)
                                });
                            }else if(results1.length===1){
                                let equipmentPart=results1[0];
                                mysql.query('UPDATE equipment_part SET bottomHoleHeight = ?, truncatedPipeHeight = ?, groundHeight = ? , sewerageSluice = ? , sluiceHeight = ?, stopWaterLevel1 = ?, startWaterLevel1 = ?, stopWaterLevel2 = ?, startWaterLevel2 = ?, stopWaterLevel3 = ?, startWaterLevel3=?, ss=?, cod=?, ph = ?,inletPipeHeight=?,serverState=? WHERE id = ?',
                                [bottomHoleHeight,truncatedPipeHeight,groundHeight,sewerageSluice,sluiceHeight,stopWaterLevel1,startWaterLevel1,stopWaterLevel2,startWaterLevel2,stopWaterLevel3,startWaterLevel3,ss,cod,ph,inletPipeHeight,serverState,equipmentPart.id],(error2, results2, fields2)=>{
                                    if (error2) {
                                        console.log(error2);
                                        return
                                    }
                                    let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xa5','0x01','0x01'];
                                    sendInfo(sock,resultArr)
                                });
                            }else{
                                let equipmentPart=results1[0]
                            }
                        });
                    }
                })
            }catch(err){
                return ;
            }
            break;
            case 'a6':
            {
            //实时
            let equipment = result(arr1,1,2);
            const dataBuf = Buffer.from([arr1[4]]);
            let dataLength = parseInt(dataBuf.toString('hex'),16)
            if(dataLength != arrlength-6){
                return 
            }
            let creatTime = new Date()
            // console.log('creatTime',creatTime)
            let waterLevelInWell = result(arr1,5,6);
            // console.log('waterLevelInWell',waterLevelInWell)
            let riveRaterLevel = result(arr1,7,8);
            // console.log('riveRaterLevel',riveRaterLevel)
            let waterLevelOfSewagePipe = result(arr1,9,10);
            // console.log('waterLevelOfSewagePipe',waterLevelOfSewagePipe)
            let garbageHeight = result(arr1,11,12);
            // console.log('garbageHeight',garbageHeight)
            let sluiceOpeningDegree = result(arr1,13,14);
            // console.log('sluiceOpeningDegree',sluiceOpeningDegree)
            let sluiceSluiceOpeningDegree = result(arr1,15,16);
            // console.log('sluiceSluiceOpeningDegree',sluiceSluiceOpeningDegree)
            let basketGrille = result(arr1,17,18);
            console.log('basketGrille',basketGrille)
            let sewageFlow1 = result(arr1,19,20);
            // console.log('sewageFlow1',sewageFlow1)
            let sewageFlow2 = result(arr1,21,22);
            // console.log('sewageFlow2',sewageFlow2)
            let sewageFlow3 = result(arr1,23,24);
            // console.log('sewageFlow3',sewageFlow3)
            let totalDischargeOfSewage1 = result1(arr,25,26,27,28);
            // console.log('totalDischargeOfSewage1',totalDischargeOfSewage1)
            let totalDischargeOfSewage2 = result1(arr,29,30,31,32);
            // console.log('totalDischargeOfSewage2',totalDischargeOfSewage2)
            let totalDischargeOfSewage3 = result1(arr,33,34,35,36);
            // console.log('totalDischargeOfSewage3',totalDischargeOfSewage3)
            let rainfall = result(arr1,37,38);
            // console.log('rainfall',rainfall)
            let ss = result1(arr1,39,40,41,42);
            let cod = result(arr1,43,44);
            let ph = unitNumber(arr1,45);
            console.log('ph',ph)
            let waterPump1 = unitNumber(arr1,46);
            // console.log('waterPump1',waterPump1)
            let waterPump2 = unitNumber(arr1,47);
            // console.log('waterPump2',waterPump2)
            let waterPump3 = unitNumber(arr1,48);
            // console.log('waterPump3',waterPump3)
            let floatingBall = unitNumber(arr1,49);
            // console.log('floatingBall',floatingBall)
            let callThePolice = unitNumber(arr1,50);
            // console.log('callThePolice',callThePolice,arr1[56]);
            let pressureGauge = unitNumber(arr1,51);
            // console.log('pressureGauge',pressureGauge)
            let hydraulicPumpMotor = unitNumber(arr1,52);
            // console.log('hydraulicPumpMotor',hydraulicPumpMotor)
            let sluiceSwitch = unitNumber(arr1,53);
            // console.log('sluiceSwitch',sluiceSwitch)
            let sluiceSluiceSwitch = unitNumber(arr1,54);
            // console.log('sluiceSluiceSwitch',sluiceSluiceSwitch)
            let liftingGrid = unitNumber(arr1,55);
            // console.log('liftingGrid',liftingGrid)
            let keyboardStatus = unitNumber(arr1,56);
            let nowPattern = unitNumber(arr1,57);
            console.log(nowPattern,"模式");
            // console.log('keyboardStatus',keyboardStatus)
            let data=['0x'+arr[5],'0x'+arr[6],'0x'+arr[7],'0x'+arr[8],'0x'+arr[9],'0x'+arr[10]]
            mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                if(results.length===0){
                    let resultArr= a6a8Reply(data,'0x00',arr,'a7');
                    sendInfo(socketArr[equipment],resultArr)
                    return
                }else{
                    let oEquipment = results[0];
                    mysql.query(`SELECT * FROM equipment_arameters WHERE equipmentId=${oEquipment.id}`,(error1, results1, fields1)=>{
                        if(error){
                          return
                        }
                        let params={equipmentId:oEquipment.id,creatTime,waterLevelInWell,riveRaterLevel,waterLevelOfSewagePipe,garbageHeight,sluiceOpeningDegree,sluiceSluiceOpeningDegree,basketGrille,sewageFlow1,sewageFlow2,sewageFlow3,totalDischargeOfSewage1,totalDischargeOfSewage2,totalDischargeOfSewage3,rainfall,ss,cod,ph,waterPump1,waterPump2,waterPump3,floatingBall,callThePolice,pressureGauge,hydraulicPumpMotor,sluiceSwitch,sluiceSluiceSwitch,liftingGrid,keyboardStatus,nowPattern,state:1}
                       mysql.query('INSERT INTO  equipment_arameters_copy  SET ?',params,(error2, results2, fields2)=>{
                                
                        });
                        if(results1.length===0){
                            mysql.query('INSERT INTO  equipment_arameters  SET ?',params,(error2, results2, fields2)=>{
                                console.log(error2,"a6jieshu")  
                                if (error2) {
                                    let resultArr= a6a8Reply(data,'0x00',arr,'a7');
                                    sendInfo(socketArr[equipment],resultArr)
                                    return
                                }
                                redispup(oEquipment.id)
                                let resultArr= a6a8Reply(data,'0x01',arr,'a7');
                                sendInfo(socketArr[equipment],resultArr)
                            });
                        }else{
                           let equipmentArameters = results1[0];
                           mysql.query('UPDATE equipment_arameters SET creatTime = ?, waterLevelInWell = ?, riveRaterLevel = ? , waterLevelOfSewagePipe = ? , garbageHeight = ?, sluiceOpeningDegree = ?, sluiceSluiceOpeningDegree = ?, basketGrille = ?, sewageFlow1 = ?, sewageFlow2=?, sewageFlow3=?, totalDischargeOfSewage1=?, totalDischargeOfSewage2 = ?,totalDischargeOfSewage3=?,rainfall=?,ss=?,cod=?,ph=?,waterPump1=?,waterPump2=?,waterPump3=?,floatingBall=?,callThePolice=?,pressureGauge=?,hydraulicPumpMotor=?,sluiceSwitch=?,sluiceSluiceSwitch=?,liftingGrid=?,keyboardStatus=? ,nowPattern=?,state=?  WHERE id = ?',
                                [creatTime,waterLevelInWell,riveRaterLevel,waterLevelOfSewagePipe,garbageHeight,sluiceOpeningDegree,sluiceSluiceOpeningDegree,basketGrille,sewageFlow1,sewageFlow2,sewageFlow3,totalDischargeOfSewage1,totalDischargeOfSewage2,totalDischargeOfSewage3,rainfall,ss,cod,ph,waterPump1,waterPump2,waterPump3,floatingBall,callThePolice,pressureGauge,hydraulicPumpMotor,sluiceSwitch,sluiceSluiceSwitch,liftingGrid,keyboardStatus,nowPattern,1,equipmentArameters.id],(error2, results2, fields2)=>{
                                    if(error2){
                                        let resultArr= a6a8Reply(data,'0x00',arr,'a7');
                                        sendInfo(socketArr[equipment],resultArr)
                                        return
                                    }
                                    redispup(oEquipment.id)
                                    let resultArr= a6a8Reply(data,'0x01',arr,'a7');
                                    sendInfo(socketArr[equipment],resultArr)
                                })
                        }
                    })
                }
            })
            }
            break;
            case 'a8':
            //历史记录
            {
                let equipment = result(arr1,1,2);
                const dataBuf = Buffer.from([arr1[4]]);
                let dataLength = parseInt(dataBuf.toString('hex'),16)
                if(dataLength != arrlength-6){
                    return 
                }
                const year = unitNumber(arr1,5);
                const month = unitNumber(arr1,6);
                const date = unitNumber(arr1,7);
                const hour = unitNumber(arr1,8);
                const minutes = unitNumber(arr1,9);
                const seconds = unitNumber(arr1,10);
                let creatTime = new Date('20'+year+'-'+month+'-'+date+' '+hour+':'+minutes+':'+seconds)
                // console.log('creatTime',creatTime)
                let waterLevelInWell = result(arr1,11,12);
                // console.log('waterLevelInWell',waterLevelInWell)
                let riveRaterLevel = result(arr1,13,14);
                // console.log('riveRaterLevel',riveRaterLevel)
                let waterLevelOfSewagePipe = result(arr1,15,16);
                let totalDischargeOfSewage = result1(arr,17,18,19,20);
                let rainfall = result(arr1,21,22);
                // console.log('rainfall',rainfall)
                let ss = result1(arr1,23,24,25,26);
                let cod = result(arr1,27,28);
                let ph = unitNumber(arr1,29);
                let waterPumpNum = unitNumber(arr1,30);
                let data=['0x'+arr[5],'0x'+arr[6],'0x'+arr[7],'0x'+arr[8],'0x'+arr[9],'0x'+arr[10]]
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    if(results.length===0){
                        let resultArr= a6a8Reply(data,'0x00',arr,'a9');
                        sendInfo(socketArr[equipment],resultArr)
                        return
                    }else{
                        let oEquipment = results[0]
                            let params={equipmentId:oEquipment.id,creatTime,waterLevelInWell,riveRaterLevel,waterLevelOfSewagePipe,totalDischargeOfSewage,rainfall,ss,cod,ph,waterPumpNum}
                            mysql.query('INSERT INTO  equipment_arameters_history  SET ?',params,(error2, results2, fields2)=>{
                                console.log(results2)
                                if (error) {
                                    // console.log(error)
                                    let resultArr= a6a8Reply(data,'0x00',arr,'a9');
                                    sendInfo(socketArr[equipment],resultArr)
                                    return
                                }
                                let resultArr= a6a8Reply(data,'0x01',arr,'a9');
                               sendInfo(socketArr[equipment],resultArr)
                            });
                        
                        
                    }
                })
            }
            break;
            case 'b3':
            //历史记录
            {
                console.log("b3",arr1);
                let equipment = result(arr1,1,2);
                const dataBuf = Buffer.from([arr1[4]]);
                let dataLength = parseInt(dataBuf.toString('hex'),16)
                console.log(dataLength ,arrlength-6)
                if(dataLength != arrlength-6){
                    return 
                }
                const pattern = unitNumber(arr1,5);
                let stopWaterPump1 = result(arr1,6,7);
                let startWaterPump1 = result(arr1,8,9);
                let stopWaterPump2 = result(arr1,10,11);
                let startWaterPump2 = result(arr1,12,13);
                let stopWaterPump3 = result(arr1,14,15);
                let startWaterPump3 = result(arr1,16,17);
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    let equipment=results[0];
                    mysql.query('UPDATE equipment_part SET startWaterLevel1=? , stopWaterLevel1=? ,startWaterLevel2=? , stopWaterLevel2=? ,startWaterLevel3=? , stopWaterLevel3=? ,patternState = ? WHERE equipmentId = ?',[startWaterPump1,stopWaterPump1,startWaterPump2,stopWaterPump2,startWaterPump3,stopWaterPump3,0,equipment.id],(error2, results2, fields2)=>{
                        if(error2){
                            console.log(error2);
                            return
                        } 
                    })
                })
            }
            break;
            case 'b1':
            //我发送收到回复
            {
            let equipment = result(arr1,1,2);
            mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                let equipment=results[0];
                mysql.query(`SELECT * FROM equipment_part_copy WHERE equipmentId=${equipment.id}`,(error, results1, fields)=>{
                    for(let item of results1){
                        mysql.query('UPDATE equipment_part_copy SET clientState = ? WHERE id = ?',[0,item.id],(error2, results2, fields2)=>{
                            if(error2){
                                console.log(error2);
                                return
                            } 
                        })
                    }
                })
            })
            }
            break;
            case 'b5':
            //我发送收到回复
            {
                console.log(arr1);
                let equipment = result(arr1,1,2);
                const dataBuf = Buffer.from([arr1[4]]);
                let dataLength = parseInt(dataBuf.toString('hex'),16)
                console.log(dataLength ,arrlength-6)
                if(dataLength != arrlength-6){
                    return 
                }
                let stopWaterPump1 = result(arr1,5,6);
                let startWaterPump1 = result(arr1,7,8);
                let stopWaterPump2 = result(arr1,9,10);
                let startWaterPump2 = result(arr1,11,12);
                let stopWaterPump3 = result(arr1,13,14);
                let startWaterPump3 = result(arr1,15,16);
                let ss = result1(arr1,17,18,19,20);
                let cod = result(arr1,21,22);
                let ph = unitNumber(arr1,23);
                let pattern = unitNumber(arr1,24);
                let vigilance = result(arr1,25,26);
                let sunnyToRain = result(arr1,27,28);
                let rainGauge = result(arr1,29,30);
                let drainageOverflowHeight = result(arr1,31,32);
                let InterceptingLimitflowHeight = result(arr1,33,34);
                console.log(pattern,"b5moshi")
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    let equipment=results[0];
                    mysql.query('UPDATE equipment_part_copy SET getState = ?,startWaterLevel1=? , stopWaterLevel1=? ,startWaterLevel2=? , stopWaterLevel2=? ,startWaterLevel3=? , stopWaterLevel3=?,ss=?,cod=?,ph=? ,vigilance=?,ph=?,ph=?,ph=?,ph=? WHERE equipmentId = ? AND pattern=?',[0,startWaterPump1,stopWaterPump1,startWaterPump2,stopWaterPump2,startWaterPump3,stopWaterPump3,ss,cod,ph,vigilance,sunnyToRain,rainGauge,drainageOverflowHeight,InterceptingLimitflowHeight,equipment.id,pattern],(error2, results2, fields2)=>{
                      console.log(results2,"b5jieguo")
                         if(error2){
                            console.log(error2);
                            return
                        } 
                    })
                })
            } 
            break;
            default:
        }
    });    
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function(){
        console.log('服务端：客户端连接断开',+new Date().getTime()-date1);
    });
    sock.on('error', (err) => {
        console.log(err,'err');
    });
}).listen(PORT);
    function login(name,password,arr){
        const hash = crypto.createHmac('sha256', password)
        .update('lanxiang123456.')
        .digest('hex');
        mysql.query(`SELECT * FROM equipment WHERE name=${name} ANd password=${hash}`,(error, results, fields)=>{
            if(error){
                console.log(error2);
                return
            }
            if(results.length>0){
                let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xA1','0x01','0x32']
                let num=0
                for(let i=0;i<resultArr.length;i++){
                    num+=parseInt(resultArr[i],16)
                }
                resultArr.push('0x'+num.toString(16))
                // console.log(Buffer.from(resultArr))
                return sock.write(Buffer.from(resultArr));
            }else{
                let resultArr=['0x07','0x'+arr[1],'0x'+arr[2],'0xA1','0x01','0x30']
                let num=0
                for(let i=0;i<resultArr.length;i++){
                    num+=parseInt(resultArr[i],16)
                }
                resultArr.push('0x'+num.toString(16))
                return sock.write( Buffer.from(resultArr))
            } 
        })
    }
    function redispup(id){
        redis.publish("chat", id)
    }
    //回复
    function a6a8Reply(data,isSuccess,arr,address){
        data.push(isSuccess);
        let dataLength = data.length.toString(16);
        resultArr=['0x0d','0x'+arr[1],'0x'+arr[2],'0x'+address,'0x'+dataLength];
        let result = resultArr.concat(data);
        return result
    }
    //发送 
    function sendInfo(sock,resultArr){
        // console.log(resultArr)
        let num=0;
        for(let i=0;i<resultArr.length;i++){
            num+=parseInt(resultArr[i],16)
        }
        resultArr.push('0x'+num.toString(16))
        console.log(Buffer.from(resultArr))
        sock.write(Buffer.from(resultArr));
    }
    //16->10 两个数
    function unitNumber(arr,num){
        const Buf = Buffer.from([arr[num]]);
        const value = parseInt(Buf.toString('hex'),16);
        return value;
    }
    //16->10 两个数
    function result(arr,num1=-1,num2=-1){
        if(arr.length===0||num1===-1||num2===-1){
            return
        }
        // console.log(parseInt(arr[num1],16)*256+parseInt(arr[num2],16))
        let num= parseInt(arr[num1],16)*256+parseInt(arr[num2],16);
        return Number(num);
    }
    //16->10 三个数
    function result1(arr,num1=-1,num2=-1,num3=-1,num4=-1){
        if(arr.length===0||num1===-1||num2===-1||num3===-1,num4===-1){
            return
        }
        // console.log((((parseInt(arr[num4],16)*256+parseInt(arr[num3],16))*256+parseInt(arr[num2],16))*256+parseInt(arr[num1],16)))
        let num=(((parseInt(arr[num4],16)*256+parseInt(arr[num3],16))*256+parseInt(arr[num2],16))*256+parseInt(arr[num1],16));
        return Number(num);
    }
    //10->16两位数
    
    function result2(){
        this.arr=[];
    }
    result2.prototype.aggregate=function(num){
        if(num===-1){
            return
        }
        let arr=[Math.floor(num/256),num%256];
        for(let item of arr){
            this.arr.push(item) 
        }
    }
    function aggregate(num){
        if(num===-1){
            return
        }
        let arr=[Math.floor(num/256),num%256];
        return arr;
    }
    //10->16 4位数
    function result3(num){
        let arr=[];
        for(let i=0;i<4;i++){
            arr[i]=num%256;
            num=Math.floor(num/256);
        }
        console.log(arr)
        return arr
    }
    function timerFn(){
        let numTo = new result2();
        clearTimeout(timer);
        timer=setTimeout(()=>{
            mysql.query(`SELECT * FROM equipment_part_copy WHERE clientState=1`,(error, results, fields)=>{
                if(error){
                  console.log(error)
                }
                for (let item of results) {
                    let equipmentId = item.equipmentId;
                    let keys=["stopWaterLevel1",'startWaterLevel1','stopWaterLevel2',"startWaterLevel2",'stopWaterLevel3','startWaterLevel3','ss','cod','ph','pattern','vigilance','sunnyToRain','rainGauge',"drainageOverflowHeight","InterceptingLimitflowHeight","seaLevel"]
                    for(key of keys){
                        // console.log(key)
                         if(key==='ph'){
                            numTo.arr.push(item[key])
                            // console.log(item[key],'ph')
                        } else if(key==='pattern'){
                            // console.log(item[key],'pattern')
                            numTo.arr.push(item[key])
                        }else if(key!=='ss'){
                            numTo.aggregate(item[key]);
                        } else if(key==='ss'){
                            for(let i of result3(item[key])){
                              numTo.arr.push(i)
                            }
                        }
                    }
                    mysql.query(`SELECT * FROM equipment WHERE id=${equipmentId}`,(error1, results1, fields1)=>{
                        if(error1){
                            console.log(error1)
                        }
                        let equipment = results1[0];
                        let equipmentName=equipment.equipmentName
                        let arr = [];
                        let equipmentNumArr=aggregate(equipmentName)
                        for(let item of equipmentNumArr){
                            arr.push(item)
                        }
                        arr.push('176')
                        arr.push(numTo.arr.length)
                        for(let item of numTo.arr){
                            arr.push(item)
                        }
                        let sumLeng= arr.length+2
                        arr.unshift(sumLeng);
                        if(!!socketArr[equipmentName]){
                            for(let item of arr){
                                item='0x'+item;
                            }
                            let num=0
                            for(let i=0;i<arr.length;i++){
                                num+=parseInt(arr[i],16)
                            }
                            arr.push('0x'+num.toString(16))
                            socketArr[equipmentName].write(Buffer.from(arr));
                        }
                    })
                }
            })
            mysql.query(`SELECT * FROM equipment_part WHERE patternState=1`,(error, results, fields)=>{
                if(error){
                  console.log(error)
                }
                for (let item of results) {
                    let equipmentId = item.equipmentId;
                    mysql.query(`SELECT * FROM equipment WHERE id=${equipmentId}`,(error1, results1, fields1)=>{
                        if(error1){
                            console.log(error1)
                        }
                        let equipment = results1[0];
                        let equipmentName=equipment.equipmentName
                        if(!!socketArr[equipmentName]){
                            sendData(7,arr[1],arr[2],'b2',['0x'+item.pattern],equipmentName)
                        }
                    })
                }
            })
            mysql.query(`SELECT * FROM equipment_part_copy WHERE getState=1`,(error, results, fields)=>{
                if(error){
                  console.log(error)
                }
                for (let item of results) {
                    let equipmentId = item.equipmentId;
                    mysql.query(`SELECT * FROM equipment WHERE id=${equipmentId}`,(error1, results1, fields1)=>{
                        if(error1){
                            console.log(error1)
                        }
                        let equipment = results1[0];
                        let equipmentName=equipment.equipmentName
                        if(!!socketArr[equipmentName]){
                            sendData(7,arr[1],arr[2],'b4',['0x'+item.pattern],equipmentName)
                        }
                    })
                }
            })
            timerFn()  
        },3000,{'force new connection': true})
    }
    function sendData(length,equipment1,equipment2,backNum,data,equipmentName){
        let resultArr=['0x'+length.toString(16),'0x'+equipment1,'0x'+equipment2,'0x'+backNum,'0x'+data.length.toString(16)].concat(data);
        resultArr = totolLength(resultArr)
        socketArr[equipmentName].write(Buffer.from(resultArr));
    }
    function totolLength(resultArr){
        let num=0
        for(let i=0;i<resultArr.length;i++){
            num+=parseInt(resultArr[i],16)
        }
        resultArr.push('0x'+num.toString(16))
        return resultArr
    }
console.log('Server listening on '+ PORT);
