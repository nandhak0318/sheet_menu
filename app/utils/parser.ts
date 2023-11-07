
export const parser = (data:any[])=>{
  let parsed:any[] = []
  data.forEach((e)=>{
    if(!(e.name=="item")&&!isNaN(e.price) && e.name.length!=0){
      parsed.push(e)
    }
  })
  return parsed
}