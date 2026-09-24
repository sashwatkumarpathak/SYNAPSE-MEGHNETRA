import * as React from 'react';
import { cn } from './utils';
export function Card({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-xl',className)} {...props}/>}
export function CardHeader({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pb-3',className)} {...props}/>}
export function CardContent({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('p-5 pt-2',className)} {...props}/>}
