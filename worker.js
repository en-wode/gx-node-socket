const crypto = require('crypto');
var mysql = require('./mysql.js')
var redis = require('./redis.js');
const log4js = require('log4js');
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});
process.on('message', (data,sock) => {
    const {msg,socketArr, equipmentData} = data;
    if (msg === 'socket' && sock) {
        sock.on('data',async function(data) {
            const reqData = await requestData(data);
            if (!reqData) {
              return;
            }
            await main(reqData,sock)
            return true;
        });
        sock.on('close', function(error){
            console.log(logger);
            logger.error(error);
            console.log('服务端：客户端连接断开',+new Date().getTime()-date1);
        });
        sock.on('error', (err) => {
            logger.error(err);
        }); 
    }
    async function main(reqData,sock){
        switch (reqData.arr[3]) {
            case 'a0':
                //设备用户登录
                //登录内容
            {
                console.log("a0")
                await reslogin(reqData,sock);
            }
            break;
            case 'a2':
                //设备登录
                {
                    console.log("a2")
                   await equipmentLogin(reqData,sock) 
                }
                break;
            case 'a4':
            //上传参数
            {
                console.log("a4")
                await uploadParameters(reqData,sock)
            }
            break;
            case 'a6':
            //实时
            {
                console.log("a6")
              await socket(reqData,sock)
            }
            break;
            case 'a8':
            //历史记录
            {
                console.log("a8")
                await history(reqData,sock)
                
            }
            break;
            case 'b3':
            //历史记录
            {
                console.log("b3")
                await switchPatternSuccess(reqData,sock)
            }
            break;
            case 'b1':
            //我发送收到回复
            {
                console.log("b1")
                await setEqumentPareams(reqData,sock)
            }
            break;
            case 'b5':
            //我发送收到回复
            {
                console.log("b5")
                await viewEqumentPareams(reqData,sock)
            } 
            break;
            default:
        }
        return true;
    }
    //发送数据
    async function sendData(length,equipment1,equipment2,backNum,data,equipmentName,sock){
        let resultArr=[length,equipment1,equipment2,backNum,data.length].concat(data);
        resultArr =await totolLength(resultArr)
        console.log(Buffer.from(resultArr))
        if(sock){
            sock.write(Buffer.from(resultArr))
        }else{
            if (socketArr[equipmentName]) {
                socketArr[equipmentName].write(Buffer.from(resultArr)); 
            }
        }
        return true;
    }
    async function totolLength(resultArr){
        let num=0
        console.log(resultArr);
        for(let i=0;i<resultArr.length;i++){
            num+=Number(resultArr[i])
        }
        resultArr.push(num)
        console.log(num)
        return resultArr
    }
    //处理请求得到的数据     
    async function requestData (data) {
        const isObj = await isObject(data);
        let reqData={
           arr: null,
           arr1: null,
           arrlength:0,
        }
        if (isObj) {
            let string = data.toString('hex');
            let arr = [];
            for(let i=0; i<string.length/2; i++){
                arr[i] = string.substring(2*i,2*(i+1));  
            }
            console.log(arr.toString(),'arr');
            let arr1=arr.map((item)=>{
                return '0x'+item;
            })
            const buf = Buffer.from([arr1[0]]);
            let arrlength = parseInt(buf.toString('hex'),16);
            console.log(arrlength ,arr1.length)
            if (arrlength > arr1.length ) {
                return false;
            }else if(arrlength <= arr1.length){
                reqData.arr = arr.slice(0,arrlength)
                reqData.arr1 = arr1.slice(0,arrlength);
                reqData.arrlength = arrlength;
                return reqData;
            }
        } 
    }
    //数据是不是对象
    async function isObject (data){
        let bool = true
        if (typeof data!=='object') {
            let bool = false 
        }
        return bool;
    }
    //返回登陆结果
    async function reslogin (reqData,sock){
        try{
            const dataBuf = Buffer.from([reqData.arr1[4]]);
            let dataLength = parseInt(dataBuf.toString('hex'),16)
            // console.log(arrlength,arr1.length)
            if (dataLength != reqData.arrlength-6) {
                return false;
            }
            let accountNumber=arr1.slice(5,13);
            const accountNumberBuf = Buffer.from(accountNumber);
            let password=arr1.slice(13,19);
            const passwordBuf = Buffer.from(password);
            await login(accountNumberBuf.toString(), passwordBuf.toString(), reqData.arr,sock);
            return true;
        }catch(err){
            logger.error(err);
            return fasle;
        } 
    }
    //登陆处理
    async function login(name,password,arr,sock){
        const hash = crypto.createHmac('sha256', password)
        .update('lanxiang123456.')
        .digest('hex');
        mysql.query(`SELECT * FROM equipment WHERE name=${name} ANd password=${hash}`,async (error, results, fields)=>{
            if(error){
                console.log(error2);
                return
            }
            if(results.length>0){
                await sendData(7,parseInt(arr[1],16),parseInt(arr[2],16),161,[32],0,sock)
            }else{
                await sendData(7,parseInt(arr[1],16),parseInt(arr[2],16),161,[30],0,sock)
            } 
        })
        return true;
    }
    //设备登陆处理
    async function equipmentLogin(reqData,sock){
        try{
            let data = await newDate();
            const equipment=await result(reqData.arr1,1,2);
            equipmentData[equipment]=reqData.arr;
            mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                if(results.length===0){
                    mysql.query('INSERT INTO  equipment  SET ?',{equipmentName:equipment},(error, results, fields)=>{
                        // console.log('mysql')
                        if (error) {
                            return
                        }
                    });
                }
                // let oEquipment = results[0];
                // mysql.query(`SELECT * FROM equipment_part WHERE equipmentId=${oEquipment.id}`,async (error, results, fields)=>{
                //     for (let item of results) {
                //         switch (Number(item.pattern)) {
                //             case 1:
                //                {
                //                 let startWaterLevel1 =await  result(reqData.arr1,5,6);
                //                 let stopWaterLevel1 =await result(reqData.arr1,7,8);
                //                 let startWaterLevel2 =await result(reqData.arr1,9,10);
                //                 let stopWaterLevel2 =await result(reqData.arr1,11,12);
                //                 let startWaterLevel3 =await result(reqData.arr1,13,14);
                //                 let stopWaterLevel3 =await result(reqData.arr1,15,16);
                //                 await verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                //                }
                //                 break;
                //             case 2:
                //                {
                //                 let startWaterLevel1 =await result(reqData.arr1,17,18);
                //                 let stopWaterLevel1 =await result(reqData.arr1,19,20);
                //                 let startWaterLevel2 =await result(reqData.arr1,21,22);
                //                 let stopWaterLevel2 =await result(reqData.arr1,23,24);
                //                 let startWaterLevel3 =await result(reqData.arr1,25,26);
                //                 let stopWaterLevel3 =await result(reqData.arr1,27,28);
                //                 await verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                //                }
                //                 break;
                //             case 3:
                //                {
                //                 let startWaterLevel1 =await result(reqData.arr1,29,30);
                //                 let stopWaterLevel1 =await result(reqData.arr1,31,32);
                //                 let startWaterLevel2 =await result(reqData.arr1,33,34);
                //                 let stopWaterLevel2 =await result(reqData.arr1,35,36);
                //                 let startWaterLevel3 =await result(reqData.arr1,37,38);
                //                 let stopWaterLevel3 =await result(reqData.arr1,39,40);
                //                 await verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                //                }
                //                 break;
                //             case 4:
                //                {
                //                 let startWaterLevel1 =await result(reqData.arr1,41,30);
                //                 let stopWaterLevel1 =await result(reqData.arr1,31,32);
                //                 let startWaterLevel2 =await result(reqData.arr1,33,34);
                //                 let stopWaterLevel2 =await result(reqData.arr1,35,36);
                //                 let startWaterLevel3 =await result(reqData.arr1,37,38);
                //                 let stopWaterLevel3 =await result(reqData.arr1,39,40);
                //                 await verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , item.id)
                //                }
                //                 break;        
                //             default:
                //                 break;
                //         }
                //     }
                // })
    
                async function verification(startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , id){
                    mysql.query('UPDATE equipment_part SET startWaterLevel1 = ?, stopWaterLevel1 = ?, startWaterLevel2 = ? , stopWaterLevel2 = ? , startWaterLevel3 = ?, stopWaterLevel3 = ? WHERE id = ?',
                    [ startWaterLevel1, stopWaterLevel1, startWaterLevel2, stopWaterLevel2, startWaterLevel3, stopWaterLevel3 , id],(error2, results2, fields2)=>{
                                if (error2) {
                                    console.log(error2);
                                    return
                                }
                            });
                        }
                    socketArr[equipment]=sock;
                })
            await sendData(12,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),163,data,0,sock)
            return true;
        }catch(err){
            logger.error(err);
            return false;
        }
    }
    //日期
    async function newDate(){
        let date = new Date();
        let year = Number(date.getFullYear().toString().slice(2,4));
        let month = date.getMonth()+1;
        let date1 = date.getDate();
        let hourse = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return [year,month,date1,hourse,minutes,seconds];
    }
    async function uploadParameters(reqData,sock){
        try{
            // console.log('a4');
            let bool = await isDataLength(reqData);
            if(bool){
                let equipment =await result(reqData.arr,1,2);
                let data = await getUploadParameters(reqData.arr);
                let arr= reqData.arr;
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
                                let params  = {equipmentId: oEquipment.id, drainageOverflowHeight:0,InterceptingLimitflowHeight:0,sunnyToRain:0,vigilance:0,rainGauge:0,bottomHoleHeight:data.bottomHoleHeight,truncatedPipeHeight:data.truncatedPipeHeight,groundHeight:data.groundHeight,sewerageSluice:data.sewerageSluice,sluiceHeight:data.sluiceHeight,stopWaterLevel1:data.stopWaterLevel1,startWaterLevel1:data.startWaterLevel1,stopWaterLevel2:data.stopWaterLevel2,startWaterLevel2:data.startWaterLevel2,sewerageSluiceHeight:0,stopWaterLevel3:data.stopWaterLevel3,startWaterLevel3:data.startWaterLevel3,ss:data.ss,cod:data.cod,ph:data.ph,serverState:1,clientState:0,inletPipeHeight:data.inletPipeHeight};
                                mysql.query('INSERT INTO  equipment_part  SET ?',params,async (error2, results2, fields2)=>{
                                    if (error2) {
                                        console.log(error2);
                                        return
                                    }
                                    await sendData(7,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),165,[1],equipment,0)
                                });
                            }else if(results1.length===1){
                                let equipmentPart=results1[0];
                                mysql.query('UPDATE equipment_part SET bottomHoleHeight = ?, truncatedPipeHeight = ?, groundHeight = ? , sewerageSluice = ? , sluiceHeight = ?, stopWaterLevel1 = ?, startWaterLevel1 = ?, stopWaterLevel2 = ?, startWaterLevel2 = ?, stopWaterLevel3 = ?, startWaterLevel3=?, ss=?, cod=?, ph = ?,inletPipeHeight=?,serverState=? WHERE id = ?',
                                [data.bottomHoleHeight,data.truncatedPipeHeight,data.groundHeight,data.sewerageSluice,data.sluiceHeight,data.stopWaterLevel1,data.startWaterLevel1,data.stopWaterLevel2,data.startWaterLevel2,data.stopWaterLevel3,data.startWaterLevel3,data.ss,data.cod,data.ph,data.inletPipeHeight,data.serverState,equipmentPart.id],async (error2, results2, fields2)=>{
                                    if (error2) {
                                        console.log(error2);
                                        return
                                    }
                                    console.log(equipment)
                                    await sendData(7,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),165,[1],equipment,0)
                                });
                            }else{
                                let equipmentPart=results1[0]
                            }
                        });
                    }
                })
                return true;    
            }
            
        }catch(err){
            logger.error(err);
            return false;
        } 
    }
    //判断数据长度
    async function isDataLength(reqData){
        const dataBuf = Buffer.from([reqData.arr1[4]]);
        let dataLength = parseInt(dataBuf.toString('hex'),16)
        if (dataLength != reqData.arrlength-6) {
            return false;
        }
        return true;
    }
    //得到上传参数数据
    async function getUploadParameters(arr){
        let bottomHoleHeight =await result1(arr,5,6,7,8);
        let inletPipeHeight=await result(arr,9,10);
        let truncatedPipeHeight =await result(arr,11,12);
        let groundHeight =await result(arr,13,14);
        let sewerageSluice =await result(arr,15,16);
        let sluiceHeight =await result(arr,17,18);
        let stopWaterLevel1 =await result(arr,19,20);
        let startWaterLevel1 =await result(arr,21,22);
        let stopWaterLevel2 =await result(arr,23,24);
        let startWaterLevel2 =await result(arr,25,26);
        let stopWaterLevel3 =await result(arr,27,28);
        let startWaterLevel3 =await result(arr,29,30);
        let ss =await result1(arr,31,32,33,34);
        let serverState= 1;
        let cod =await result(arr,35,36);
        let ph =await parseInt(arr[37],16)
        return {
            bottomHoleHeight,
            inletPipeHeight,
            truncatedPipeHeight,
            groundHeight,
            sewerageSluice,
            sluiceHeight,
            stopWaterLevel1,
            startWaterLevel1,
            stopWaterLevel2,
            startWaterLevel2,
            stopWaterLevel3,
            startWaterLevel3,
            ss,
            serverState,
            cod,
            ph,
        }
    }
    //实时
    async function socket(reqData,sock){
        try {
           //实时
           let bool = await isDataLength(reqData);
           if(bool){
             let data = await getSocketData(reqData.arr,reqData.arr1)
             let equipment =await result(reqData.arr,1,2);
             let arr = reqData.arr;
            mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,async (error, results, fields)=>{
                if(results.length===0){
                    await sendData(13,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),167,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),0],equipment,0)
                }else{
                    let oEquipment = results[0];
                    mysql.query(`SELECT * FROM equipment_arameters WHERE equipmentId=${oEquipment.id}`,(error1, results1, fields1)=>{
                        if(error){
                          return
                        }
                        // let params={equipmentId:oEquipment.id,creatTime:data.creatTime,waterLevelInWell:data.waterLevelInWell,riveRaterLevel:data.riveRaterLevel,waterLevelOfSewagePipe:data.waterLevelOfSewagePipe,garbageHeight:data.garbageHeight,sluiceOpeningDegree:data.sluiceOpeningDegree,sluiceSluiceOpeningDegree:data.sluiceSluiceOpeningDegree,basketGrille:data.basketGrille,sewageFlow1:data.sewageFlow1,sewageFlow2:data.sewageFlow2,sewageFlow3:data.sewageFlow3,totalDischargeOfSewage1:data.totalDischargeOfSewage1,totalDischargeOfSewage2:data.totalDischargeOfSewage2,totalDischargeOfSewage3:data.totalDischargeOfSewage3,rainfall:data.rainfall,ss:data.ss,cod:data.cod,ph:data.ph,waterPump1:data.waterPump1,waterPump2:data.waterPump2,waterPump3:data.waterPump3,floatingBall:data.floatingBall,callThePolice:data.callThePolice,pressureGauge:data.pressureGauge,hydraulicPumpMotor:data.hydraulicPumpMotor,sluiceSwitch:data.sluiceSwitch,sluiceSluiceSwitch:data.sluiceSluiceSwitch,liftingGrid:data.liftingGrid,keyboardStatus:data.keyboardStatus,nowPattern:data.nowPattern,state:1}
                        // mysql.query('INSERT INTO  equipment_arameters_copy  SET ?',params,(error2, results2, fields2)=>{
                                
                        // });
                        if(results1.length===0){
                            mysql.query('INSERT INTO  equipment_arameters  SET ?',params, async(error2, results2, fields2)=>{
                                // console.log(error2,"a6jieshu")  
                                if (error2) {
                                    await sendData(13,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),167,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),0],equipment,0)
                                    return
                                }
                                await redispup(oEquipment.id)
                                await sendData(13,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),167,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),1],equipment,0)
                            });
                        }else{
                           let equipmentArameters = results1[0];
                           mysql.query('UPDATE equipment_arameters SET creatTime = ?, waterLevelInWell = ?, riveRaterLevel = ? , waterLevelOfSewagePipe = ? , garbageHeight = ?, sluiceOpeningDegree = ?, sluiceSluiceOpeningDegree = ?, basketGrille = ?, sewageFlow1 = ?, sewageFlow2=?, sewageFlow3=?, totalDischargeOfSewage1=?, totalDischargeOfSewage2 = ?,totalDischargeOfSewage3=?,rainfall=?,ss=?,cod=?,ph=?,waterPump1=?,waterPump2=?,waterPump3=?,floatingBall=?,callThePolice=?,pressureGauge=?,hydraulicPumpMotor=?,sluiceSwitch=?,sluiceSluiceSwitch=?,liftingGrid=?,keyboardStatus=? ,nowPattern=?,state=?  WHERE id = ?',
                                [data.creatTime,data.waterLevelInWell,data.riveRaterLevel,data.waterLevelOfSewagePipe,data.garbageHeight,data.sluiceOpeningDegree,data.sluiceSluiceOpeningDegree,data.basketGrille,data.sewageFlow1,data.sewageFlow2,data.sewageFlow3,data.totalDischargeOfSewage1,data.totalDischargeOfSewage2,data.totalDischargeOfSewage3,data.rainfall,data.ss,data.cod,data.ph,data.waterPump1,data.waterPump2,data.waterPump3,data.floatingBall,data.callThePolice,data.pressureGauge,data.hydraulicPumpMotor,data.sluiceSwitch,data.sluiceSluiceSwitch,data.liftingGrid,data.keyboardStatus,data.nowPattern,1,equipmentArameters.id],async (error2, results2, fields2)=>{
                                    if (error2) {
                                        await sendData(13,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),167,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),0],equipment,0)
                                        return
                                    }
                                    await redispup(oEquipment.id)
                                    await sendData(13,parseInt(reqData.arr[1],16),parseInt(reqData.arr[2],16),167,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),1],equipment,0)
                                })
                        }
                    })
                }
                return true;
            }) 
           }
           return true;
        } catch (error) {
            logger.error(error);
           return false;
        }
    }
    async function redispup(id){
        redis.publish("chat", id)
        return true;
    }
    //得到实时的参数
    async function getSocketData(arr,arr1){
            let creatTime = new Date()
            let waterLevelInWell =await result(arr1,5,6);
            let riveRaterLevel =await result(arr1,7,8);
            let waterLevelOfSewagePipe =await result(arr1,9,10);
            let garbageHeight =await result(arr1,11,12);
            let sluiceOpeningDegree =await result(arr1,13,14);
            let sluiceSluiceOpeningDegree =await result(arr1,15,16);
            let basketGrille =await result(arr1,17,18);
            let sewageFlow1 =await result(arr1,19,20);
            let sewageFlow2 =await result(arr1,21,22);
            let sewageFlow3 =await result(arr1,23,24);
            let totalDischargeOfSewage1 =await result1(arr,25,26,27,28);
            let totalDischargeOfSewage2 =await result1(arr,29,30,31,32);
            let totalDischargeOfSewage3 =await result1(arr,33,34,35,36);
            let rainfall =await result(arr1,37,38);
            let ss =await result1(arr1,39,40,41,42);
            let cod =await result(arr1,43,44);
            let ph =await unitNumber(arr1,45);
            let waterPump1 =await unitNumber(arr1,46);
            let waterPump2 =await unitNumber(arr1,47);
            let waterPump3 =await unitNumber(arr1,48);
            let floatingBall =await unitNumber(arr1,49);
            let callThePolice =await unitNumber(arr1,50);
            let pressureGauge =await unitNumber(arr1,51);
            let hydraulicPumpMotor =await unitNumber(arr1,52);
            let sluiceSwitch =await unitNumber(arr1,53);
            let sluiceSluiceSwitch =await unitNumber(arr1,54);
            let liftingGrid =await unitNumber(arr1,55);
            let keyboardStatus =await unitNumber(arr1,56);
            let nowPattern =await unitNumber(arr1,57);
            return{
                creatTime,
                waterLevelInWell,
                riveRaterLevel,
                waterLevelOfSewagePipe,
                garbageHeight,
                sluiceOpeningDegree,
                sluiceSluiceOpeningDegree,
                basketGrille,
                sewageFlow1,
                sewageFlow2,
                sewageFlow3,
                totalDischargeOfSewage1,
                totalDischargeOfSewage2,
                totalDischargeOfSewage3,
                rainfall,
                ss,
                cod,
                ph,
                waterPump1,
                waterPump2,
                waterPump3,
                floatingBall,
                callThePolice,
                pressureGauge,
                hydraulicPumpMotor,
                sluiceSwitch,
                sluiceSluiceSwitch,
                liftingGrid,
                keyboardStatus,
                nowPattern,
            }
    }
    //16->10 两个数
    async function result(arr,num1=-1,num2=-1){
        if(arr.length===0||num1===-1||num2===-1){
            return
        }
        // console.log(parseInt(arr[num1],16)*256+parseInt(arr[num2],16))
        let num= parseInt(arr[num1],16)*256+parseInt(arr[num2],16);
        return Number(num);
    }
    //16->10 四个数
    async function result1(arr,num1=-1,num2=-1,num3=-1,num4=-1){
        if(arr.length===0||num1===-1||num2===-1||num3===-1,num4===-1){
            return
        }
        // console.log((((parseInt(arr[num4],16)*256+parseInt(arr[num3],16))*256+parseInt(arr[num2],16))*256+parseInt(arr[num1],16)))
        let num=(((parseInt(arr[num4],16)*256+parseInt(arr[num3],16))*256+parseInt(arr[num2],16))*256+parseInt(arr[num1],16));
        return Number(num);
    }
    //但个数转换
    async function unitNumber(arr,num){
        const Buf = Buffer.from([arr[num]]);
        const value = parseInt(Buf.toString('hex'),16);
        return value;
    }
    async function history(reqData,sock){
        try {
            let equipment =await result(reqData.arr1,1,2);
            let bool = await isDataLength(reqData);
            let arr = reqData.arr;
            if(bool){
                const data = await historyData(reqData.arr,reqData.arr1)
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,async (error, results, fields)=>{
                    if(results.length===0){
                        await sendData(13,parseInt(arr[1],16),parseInt(arr[2],16),169,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),0],equipment,0)
                        return
                    }else{
                        let oEquipment = results[0]
                            let params={equipmentId:oEquipment.id,creatTime:data.creatTime,waterLevelInWell:data.waterLevelInWell,riveRaterLevel:data.riveRaterLevel,waterLevelOfSewagePipe:data.waterLevelOfSewagePipe,totalDischargeOfSewage:data.totalDischargeOfSewage,rainfall:data.rainfall,ss:data.ss,cod:data.cod,ph:data.ph,waterPumpNum:data.waterPumpNum}
                            mysql.query('INSERT INTO  equipment_arameters_history  SET ?',params,async (error2, results2, fields2)=>{
                                console.log(results2)
                                if (error) {
                                    // console.log(error)
                                    await sendData(13,parseInt(arr[1],16),parseInt(arr[2],16),169,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),0],equipment,0)
                                    return
                                }
                                await sendData(13,parseInt(arr[1],16),parseInt(arr[2],16),169,[parseInt(arr[5],16),parseInt(arr[6],16),parseInt(arr[7],16),parseInt(arr[8],16),parseInt(arr[9],16),parseInt(arr[10],16),1],equipment,0)
                            });
                    }
                })
            }
            return true;
        } catch (error) {
            logger.error(error);
            return false;            
        }
        
    }
    async function historyData(arr,arr1){
        const year =await unitNumber(arr1,5);
        const month =await unitNumber(arr1,6);
        const date =await unitNumber(arr1,7);
        const hour =await unitNumber(arr1,8);
        const minutes =await unitNumber(arr1,9);
        const seconds =await unitNumber(arr1,10);
        let creatTime = new Date('20'+year+'-'+month+'-'+date+' '+hour+':'+minutes+':'+seconds)
        let waterLevelInWell =await result(arr1,11,12);
        // console.log('waterLevelInWell',waterLevelInWell)
        let riveRaterLevel =await result(arr1,13,14);
        // console.log('riveRaterLevel',riveRaterLevel)
        let waterLevelOfSewagePipe =await result(arr1,15,16);
        let totalDischargeOfSewage =await result1(arr,17,18,19,20);
        let rainfall =await result(arr1,21,22);
        // console.log('rainfall',rainfall)
        let ss =await result1(arr1,23,24,25,26);
        let cod =await result(arr1,27,28);
        let ph =await unitNumber(arr1,29);
        let waterPumpNum =await unitNumber(arr1,30);
        return {
            creatTime,
            waterLevelInWell,
            riveRaterLevel,
            waterLevelOfSewagePipe,
            totalDischargeOfSewage,
            rainfall,
            ss,
            cod,
            ph,
            waterPumpNum
        }
    }
    //切换模式获取的参数
    async function switchPatternSuccess(reqData,sock){
        try{
            let bool = await isDataLength(reqData);
            if(bool){
                let data = await switchPatternSuccessData(reqData.arr,reqData.arr1);
                let equipment =await result(reqData.arr1,1,2);
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    let equipment=results[0];
                    mysql.query('UPDATE equipment_part SET startWaterLevel1=? , stopWaterLevel1=? ,startWaterLevel2=? , stopWaterLevel2=? ,startWaterLevel3=? , stopWaterLevel3=? ,patternState = ? WHERE equipmentId = ?',[data.startWaterPump1,data.stopWaterPump1,data.startWaterPump2,data.stopWaterPump2,data.startWaterPump3,data.stopWaterPump3,0,equipment.id],(error2, results2, fields2)=>{
                        if(error2){
                            console.log(error2);
                            return
                        } 
                    })
                });
            }
            return true;
        }catch(err){
            logger.error(err);
            return fasle;
        } 
    }
    //切换模式数据
    async function switchPatternSuccessData(arr,arr1){
        const pattern =await unitNumber(arr1,5);
        let stopWaterPump1 =await result(arr1,6,7);
        let startWaterPump1 =await result(arr1,8,9);
        let stopWaterPump2 =await result(arr1,10,11);
        let startWaterPump2 =await result(arr1,12,13);
        let stopWaterPump3 =await result(arr1,14,15);
        let startWaterPump3 =await result(arr1,16,17);
        return {
            pattern,
            stopWaterPump1,
            startWaterPump1,
            stopWaterPump2,
            startWaterPump2,
            stopWaterPump3,
            startWaterPump3
        }
    }
    async function setEqumentPareams(reqData,sock){
        try {
            let equipment =await result(reqData.arr1,1,2);
            mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                let oEqument = results[0];
                mysql.query(`SELECT * FROM equipment_part WHERE equipmentId=${oEqument.id}`,(error, results1, fields)=>{
                    for(let item of results1){
                        mysql.query('UPDATE equipment_part SET clientState = ? WHERE id = ?',[0,item.id],(error2, results2, fields2)=>{
                            if(error2){
                                console.log(error2);
                                return
                            } 
                        })
                    }
                })
            })
            return true;   
        } catch (error) {
            logger.error(error);
            return false
        }
    }
    async function viewEqumentPareams(reqData,sock){
        try {
            let equipment =await result(reqData.arr1,1,2);
            let bool = await isDataLength(reqData);
            if (bool) {
                let data = await viewEqumentPareamsData(reqData.arr,reqData.arr1);
                console.log(data);
                mysql.query(`SELECT * FROM equipment WHERE equipmentName=${equipment}`,(error, results, fields)=>{
                    let equipment=results[0];
                    mysql.query('UPDATE equipment_part SET getState = ?,startWaterLevel1=? , stopWaterLevel1=? ,startWaterLevel2=? , stopWaterLevel2=? ,startWaterLevel3=? , stopWaterLevel3=?,ss=?,cod=?,ph=? ,vigilance=?,sunnyToRain=?,rainGauge=?,drainageOverflowHeight=?,InterceptingLimitflowHeight=? WHERE equipmentId = ? AND pattern=?',
                                   [0,data.startWaterPump1,data.stopWaterPump1,data.startWaterPump2,data.stopWaterPump2,data.startWaterPump3,data.stopWaterPump3,data.ss,data.cod,data.ph,data.vigilance,data.sunnyToRain,data.rainGauge,data.drainageOverflowHeight,data.InterceptingLimitflowHeight,equipment.id,data.pattern],(error2, results2, fields2)=>{
                      console.log(results2,"b5jieguo")
                         if(error2){
                            console.log(error2);
                            return
                        } 
                    })
                })
            }
            return true;   
        } catch (error) {
            logger.error(error);
            return false
        }
    } 
    //查看设备获取参数
    async function viewEqumentPareamsData(arr,arr1){
        let stopWaterPump1 =await result(arr1,5,6);
        let startWaterPump1 =await result(arr1,7,8);
        let stopWaterPump2 =await result(arr1,9,10);
        let startWaterPump2 =await result(arr1,11,12);
        let stopWaterPump3 =await result(arr1,13,14);
        let startWaterPump3 =await result(arr1,15,16);
        let ss =await result1(arr1,17,18,19,20);
        let cod =await result(arr1,21,22);
        let ph =await unitNumber(arr1,23);
        let pattern =await unitNumber(arr1,24);
        let vigilance =await result(arr1,25,26);
        console.log(vigilance,'得到的警戒水位',arr1[25],arr1[26])
        let sunnyToRain =await result(arr1,27,28);
        let rainGauge =await result(arr1,29,30);
        let drainageOverflowHeight =await result(arr1,31,32);
        let InterceptingLimitflowHeight =await result(arr1,33,34);
        return {
            stopWaterPump1,
            startWaterPump1,
            stopWaterPump2,
            startWaterPump2,
            stopWaterPump3,
            startWaterPump3,
            ss,
            cod,
            ph,
            pattern,
            vigilance,
            sunnyToRain,
            rainGauge,
            drainageOverflowHeight,
            InterceptingLimitflowHeight
        }
    }
    async function result3(num){
        let arr=[];
        for(let i=0;i<4;i++){
            arr[i]=num%256;
            num=Math.floor(num/256);
        }
        return arr
    }
    async function aggregate(num){
        if(num===-1){
            return
        }
        let arr=[Math.floor(num/256),num%256];
        return arr;
    }  
})
