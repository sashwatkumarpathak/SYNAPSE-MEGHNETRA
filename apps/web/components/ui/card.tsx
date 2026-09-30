import * as React from 'react';
import { cn } from './utils';
export function Card({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('rounded-2xl border border-white/[0.12] bg-[linear-gradient(145deg,rgba(11,31,47,0.72),rgba(4,15,26,0.58))] shadow-2xl backdrop-blur-2xl',className)} {...props}/>}
export function CardHeader({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pb-3',className)} {...props}/>}
export function CardContent({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pt-2',className)} {...props}/>}
