import {solveArmor} from './api.mjs';
self.onmessage=async({data:{id,query}})=>{
  try {self.postMessage({id,response:await solveArmor(query)});}
  catch(error){self.postMessage({id,error:error.message});}
};
