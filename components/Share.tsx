'use client';import {Share2,Link as LinkIcon} from 'lucide-react';
export function Share({compact=false}:{compact?:boolean}){
  async function share(){
    const data={title:'INFANTINO OUT',text:'Demand accountability. Protect the future of football.',url:location.href};
    try {
      if(navigator.share && !compact) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(location.href);
        alert('Link copied to clipboard!');
      }
    } catch (e) {
      await navigator.clipboard.writeText(location.href);
      alert('Link copied to clipboard!');
    }
  }
  return <button className={compact?'btn btn-outline !py-2':'btn btn-outline'} onClick={share}>{compact?<LinkIcon size={15}/>:<Share2 size={16}/>} {compact?'Copy link':'Share campaign'}</button>
}
