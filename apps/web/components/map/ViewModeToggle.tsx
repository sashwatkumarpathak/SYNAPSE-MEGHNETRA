'use client';

export function ViewModeToggle({mode,onChange}:{mode:'2D'|'3D',onChange:(mode:'2D'|'3D')=>void}){
  return <div className="view-mode-toggle" aria-label="Map view mode">
    <button className={mode==='2D'?'active':''} onClick={()=>onChange('2D')}>2D</button>
    <button className={mode==='3D'?'active':''} onClick={()=>onChange('3D')}>3D</button>
  </div>
}
