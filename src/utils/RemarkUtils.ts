import { MatrixClientPeg } from '../MatrixClientPeg';
import dis from '../dispatcher/dispatcher';

/**
 * 备注名使用工具类
 */
export class RemarkUtils{
   static USERIDGATHER = "userid_gather";
   static contentStr = "";
    /**
     * 初始同步数据库数据
     */
    static initSyncServerData(content:any){
        this.contentStr = "";
        if(content){
            let remark_users = content['remark_users'];
           for(let mUserId in remark_users){
                if(mUserId){
                    this.contentStr += mUserId+ ",";
                   let mUserName = remark_users[mUserId];
                   let mName = localStorage.getItem(mUserId);
                   if(mName){
                    //如果有对比
                        if(mUserName === mName){
                            continue;//一样跳过
                        }else{
                            localStorage.setItem(mUserId,mUserName);//不一样更新一下本地数据
                            dis.dispatch({action: 'remarked',userId:mUserId});//广播有人被备注了
                        }
                   }else{
                        localStorage.setItem(mUserId,mUserName);//没有保存本地
                        dis.dispatch({action: 'remarked',userId:mUserId});//广播有人被备注了
                   }
                }
            }
        }
        this.contentStr = this.contentStr.substring(0,this.contentStr.length-1);//去除最后一个,号
        //这里存一下所有备注过的用户的userid,方便数据上报时使用
       if(this.contentStr){
            localStorage.setItem(this.USERIDGATHER,this.contentStr);
       }
    }

    /**
     * 
     * @param mUserid 
     * 获取人的userid对应的备注名
     */
    static getRemarkNameById(mUserid){
        let remarkName:string = localStorage.getItem(mUserid);
        if(!remarkName){
            return null;
        }
        if(remarkName.length>16){
            remarkName = remarkName.substring(0,16)+"..."+" "
        }
        return remarkName;
    }

    /**
     * 
     * @param mUserid 
     * 修改人的userid对应的备注名
     */
    static async setRemarkNameById(mUserid,mName){
        const rName = localStorage.getItem(mUserid);
        if(rName){
            //已有的覆盖
            localStorage.setItem(mUserid,mName);
        }else{
            //新备注
            localStorage.setItem(mUserid,mName);

            let str =  localStorage.getItem(this.USERIDGATHER);
            str +=","+mUserid;
            localStorage.setItem(this.USERIDGATHER, str);
        }
        dis.dispatch({action: 'remarked',userId:mUserid});//广播有人被备注了
        /**
         * 数据上报
         */
      let obj = {};
       obj[mUserid] = mName;
       const remarkObj ={'remark_users':obj}
            if(remarkObj){
                await MatrixClientPeg.get().setAccountData('m.remark_user_list', remarkObj);
            }
       }


    /**
     * 删除某个人的备注名
     * 如果清除或者备注名输入框为空自动认为解除对应userid用户的备注名
     */
    static async deleteRemarkNameByUserId(userId:string){
        if(!userId){
            return;
        }
        //如果有删除储存的备注名
        let rNmae = localStorage.getItem(userId);
        if(rNmae){
            localStorage.removeItem(userId);
            dis.dispatch({action: 'remarked',userId:userId});//广播有人被删除备注了
        }
        
         const remarkObj ={'remark_users':{userId:""}}
       
            if(remarkObj){
                await MatrixClientPeg.get().setAccountData('m.remark_user_list', remarkObj);
            }
       // }
    }
}
